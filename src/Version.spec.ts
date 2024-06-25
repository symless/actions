import { Version } from "./Version";
import { getRepoTags } from "./git";

jest.mock("./git");

const getRepoTagsMock = jest.mocked(getRepoTags);

describe("Version", () => {
  describe("fromString", () => {
    it("parses a semver string", () => {
      const version = Version.fromString("1.2.3");
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: null,
        build: null,
      });
    });

    it("parses a semver string with a stage", () => {
      const version = Version.fromString("1.2.3-foobar");
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        build: null,
      });
    });

    it("parses a semver string with stage and extra metadata", () => {
      const version = Version.fromString("1.2.3-foo+bar");
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foo",
        build: null,
      });
    });

    it("parses a semver string with a stage and build (just number)", () => {
      const version = Version.fromString("1.2.3-foobar+build-4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        build: 4,
      });
    });

    it("parses a semver string with a stage and build (with word)", () => {
      const version = Version.fromString("1.2.3-foobar+build-4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        build: 4,
      });
    });

    it("parses build numbers when stage is missing", () => {
      const version = Version.fromString("1.2.3+build-4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: null,
        build: 4,
      });
    });

    it("throws an error on an invalid version string", () => {
      expect(() => Version.fromString("1.2")).toThrow();
    });
  });

  describe("toString", () => {
    it("formats a semver string with a stage and build", () => {
      const version = new Version(1, 2, 3, 4, "foobar");
      expect(version.toString()).toEqual("1.2.3-foobar+build-4");
    });

    it("formats a semver string without a stage and build", () => {
      const version = new Version(1, 2, 3, null, null);
      expect(version.toString()).toEqual("1.2.3");
    });

    it("formats a semver string without a stage", () => {
      const version = new Version(1, 2, 3, 4, null);
      expect(version.toString()).toEqual("1.2.3+build-4");
    });

    it("formats a semver string without a build", () => {
      const version = new Version(1, 2, 3, null, "foobar");
      expect(version.toString()).toEqual("1.2.3-foobar");
    });
  });

  describe("incrementBuild", () => {
    it("updates to the next build version", () => {
      getRepoTagsMock.mockReturnValue(["1.2.3+build-1", "1.2.3+build-2"]);
      const version = new Version(1, 2, 3);

      version.incrementBuild();

      expect(version.build).toEqual(3);
    });
  });
});
