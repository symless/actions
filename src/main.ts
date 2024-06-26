import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { errorRecursive } from "./utils";
import { Version } from "./Version";

const currentVersionKey = "current-version";
const revisionPrefixKey = "revision-prefix";
const nextVersionKey = "next-version";

async function main(): Promise<void> {
  const currentVersion = process.env.INPUT_CURRENT_VERSION ?? getInput(currentVersionKey);
  debug(`${currentVersionKey}: ${currentVersion}`);

  const revisionPrefix = process.env.INPUT_REVISION_PREFIX ?? getInput(revisionPrefixKey);
  debug(`${revisionPrefixKey}: ${revisionPrefix}`);

  const version = Version.fromString(currentVersion);
  version.updateRevision(revisionPrefix);

  const nextVersion = version.toString();
  debug(`${nextVersionKey}: ${nextVersion}`);
  setOutput(nextVersionKey, nextVersion);
}

main().catch((error) => {
  errorRecursive(error);
  setFailed(error);
});
