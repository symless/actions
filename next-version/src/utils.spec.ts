import { error, setFailed } from "@actions/core";
import { errorRecursive } from "./utils";

jest.mock("@actions/core");

const errorMock = jest.mocked(error);
const setFailedMock = jest.mocked(setFailed);

describe("setFailedAndLogRecursive", () => {
  it("should log error", () => {
    errorRecursive(new Error("Test error"));

    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("Test error"));
  });

  it("should log test and cause error", () => {
    const cause = new Error("Cause error");
    const error = new Error("Test error");
    error.cause = cause;

    errorRecursive(error);

    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("Cause error"));
    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("Test error"));
  });
});
