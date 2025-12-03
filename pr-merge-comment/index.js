const core = require("@actions/core");
const github = require("@actions/github");

async function prMergeComment() {
  const token = core.getInput("github-token") || process.env.GITHUB_TOKEN;
  const octokit = github.getOctokit(token);

  const inputs = {
    version: core.getInput("version"),
    sha: core.getInput("sha"),
  };

  const { context } = github;
  console.log(context);

  const { version } = inputs;
  if (!version) {
    console.log("No version found, skipping.");
    return;
  }

  console.log(`Version: ${version}`);

  const workflowRun = context.payload.workflow_run;
  const sha = inputs.sha || workflowRun?.head_sha;
  if (!sha) {
    console.log("No Git SHA found, skipping.");
    return;
  }

  console.log(`SHA: ${sha}`);

  const isMaster = workflowRun?.head_branch.startsWith("master");
  const pushToMaster = workflowRun?.event === "push" && isMaster;

  if (context.eventName !== "workflow_dispatch" && !pushToMaster) {
    console.log("Skipping, not workflow dispatch or workflow run push to master.");
    return;
  }

  // Either use the run info from the workflow run or the context payload (for testing).
  const runId = workflowRun?.id || context.runId;
  const runName = workflowRun?.name || "test";
  const runResult = workflowRun?.conclusion || "test";
  const repoUrl = context.payload.repository.html_url;

  const { data: pullRequests } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: sha,
  });

  if (pullRequests.length < 1) {
    console.log("No PR found, skipping.");
    return;
  }

  console.log(`Found ${pullRequests.length} PR(s).`);
  const prNumber = pullRequests[0].number;

  const isSuccess = runResult === "success";
  const resultEmoji = isSuccess ? "✅" : "❌";
  const resultText = isSuccess ? "was successful" : "has failed";

  let body = `${resultEmoji} Merge build ${resultText}.\n` + `Version: \`${version}\``;
  if (runId) {
    console.log(`Appending result and URL for run ID: ${runId}`);
    const runUrl = `${repoUrl}/actions/runs/${runId}`;
    body += `\nRun: [${runName}](${runUrl})`;
  } else {
    console.log("No run ID found, skipping run result and URL.");
  }

  console.log(`Commenting on first PR: ${prNumber}`);
  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body,
  });
}

(async () => {
  try {
    await prMergeComment();
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
})();
