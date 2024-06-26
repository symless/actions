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
        revision: null,
        revisionText: "r",
      });
    });

    it("parses a semver string with a stage", () => {
      const version = Version.fromString("1.2.3-foobar");
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        revision: null,
        revisionText: "r",
      });
    });

    it("parses a semver string with stage and extra metadata", () => {
      const version = Version.fromString("1.2.3-foo+bar");
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foo",
        revision: null,
        revisionText: "bar",
      });
    });

    it("parses a semver string with a stage and revision (just number)", () => {
      const version = Version.fromString("1.2.3-foobar+r4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        revision: 4,
        revisionText: "r",
      });
    });

    it("parses a semver string with a stage and revision (with word)", () => {
      const version = Version.fromString("1.2.3-foobar+r4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: "foobar",
        revision: 4,
        revisionText: "r",
      });
    });

    it("parses revision numbers when stage is missing", () => {
      const version = Version.fromString("1.2.3+r4");

      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        stage: null,
        revision: 4,
        revisionText: "r",
      });
    });

    it("throws an error on an invalid version string", () => {
      expect(() => Version.fromString("1.2")).toThrow();
    });
  });

  describe("toString", () => {
    it("formats a semver string with a stage and revision", () => {
      const version = new Version(1, 2, 3, "foobar", 1);
      expect(version.toString()).toEqual("1.2.3-foobar+r1");
    });

    it("formats a semver string without a stage and revision", () => {
      const version = new Version(1, 2, 3);
      expect(version.toString()).toEqual("1.2.3");
    });

    it("formats a semver string without a stage", () => {
      const version = new Version(1, 2, 3, null, 1);
      expect(version.toString()).toEqual("1.2.3+r1");
    });

    it("formats a semver string without a revision", () => {
      const version = new Version(1, 2, 3, "foobar");
      expect(version.toString()).toEqual("1.2.3-foobar");
    });
  });

  describe("updateRevisionNumber", () => {
    it("uses the first the revision number", () => {
      getRepoTagsMock.mockReturnValue([]);
      const version = new Version(1, 2, 3);

      version.updateRevision();

      expect(version.revision).toEqual(1);
    });

    it("increments the revision number to 2 when revision number set", () => {
      getRepoTagsMock.mockReturnValue(["1.2.3+r1"]);
      const version = new Version(1, 2, 3, null, 1);

      version.updateRevision();

      expect(version.revision).toEqual(2);
    });

    it("increments the revision number to 3 when two exist", () => {
      getRepoTagsMock.mockReturnValue(["1.2.3+r1", "1.2.3+r2"]);
      const version = new Version(1, 2, 3);

      version.updateRevision();

      expect(version.revision).toEqual(3);
    });
  });
});
