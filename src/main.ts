import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { errorRecursive } from "./utils";
import { Version } from "./Version";

const currentVersionKey = "current-version";
const nextVersionKey = "next-version";

async function main(): Promise<void> {
  const currentVersionText = getInput(currentVersionKey);
  debug(`${currentVersionKey}: ${currentVersionText}`);

  const version = Version.fromString(currentVersionText);
  version.updateBuildNumber();

  const nextVersionText = version.toString();
  debug(`${nextVersionKey}: ${nextVersionText}`);
  setOutput(nextVersionKey, nextVersionText);
}

main().catch((error) => {
  errorRecursive(error);
  setFailed(error);
});
