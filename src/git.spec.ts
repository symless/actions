import { getRepoTopLevelDir, getRepoTags } from "./git";
import { execSync } from "node:child_process";

jest.mock("@actions/core");
jest.mock("node:child_process");

const execSyncMock = jest.mocked(execSync);

describe("getRepoTopLevelDir", () => {
  it("should return the top level directory", () => {
    execSyncMock.mockReturnValue("/path/to/repo");

    const result = getRepoTopLevelDir();

    expect(result).toBe("/path/to/repo");
  });
});

describe("getRepoTags", () => {
  it("should return the tags", () => {
    execSyncMock.mockReturnValue({
      toString: () => "v1.2.3\nv1.2.4\n",
    } as any);

    const result = getRepoTags();

    expect(result).toEqual(["v1.2.3", "v1.2.4"]);
  });
});
