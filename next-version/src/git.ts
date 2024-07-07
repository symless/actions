import { debug } from "@actions/core";
import { execSync } from "node:child_process";

/**
 * Gets the top level directory of the current Git repo.
 */
export function getRepoTopLevelDir(): string {
  const command = "git rev-parse --show-toplevel";
  debug(`Running: '${command}'`);
  const topLevel = execSync(command).toString().trim();
  debug(`Git repo top level: ${topLevel}`);
  return topLevel;
}

/**
 * Gets all the tags in the current Git repo.
 */
export function getRepoTags(): string[] {
  const repoPath = getRepoTopLevelDir();
  const gitTagsString = execSync("git tag -l", { cwd: repoPath }).toString("utf-8");
  debug(`Git tags:\n${gitTagsString}`);
  return gitTagsString.split("\n").filter(Boolean);
}
