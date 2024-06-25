import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { errorRecursive } from "./utils";
import { Version } from "./Version";

jest.mock("@actions/core");
jest.mock("./utils");
jest.mock("./Version");

const getInputMock = jest.mocked(getInput);
const setOutputMock = jest.mocked(setOutput);
const errorRecursiveMock = jest.mocked(errorRecursive);
const versionFromStringMock = jest.mocked(Version.fromString);

describe("main", () => {
  it("should set next-version output", async () => {
    jest.isolateModulesAsync(async () => {
      getInputMock.mockReturnValue("test");
      versionFromStringMock.mockReturnValueOnce({
        incrementBuild: jest.fn(),
        toString: () => "test",
      } as any);

      await import("./main");

      expect(setOutputMock).toHaveBeenCalledWith("next-version", "test");
    });
  });

  it("should log error and set failed", async () => {
    jest.isolateModulesAsync(async () => {
      const error = new Error("Test error");
      getInputMock.mockImplementation(() => {
        throw error;
      });

      await import("./main");

      expect(errorRecursiveMock).toHaveBeenCalledWith(error);
    });
  });
});
