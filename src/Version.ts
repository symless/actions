import { error, warning } from "@actions/core";
import { getRepoTags } from "./git";
import { errorRecursive } from "./utils";

export class Version {
  major: number;
  minor: number;
  patch: number;
  stage?: string | null;
  build?: number | null;

  constructor(
    major: number,
    minor: number,
    patch: number,
    stage?: string | null,
    build?: number | null,
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.stage = stage;
    this.build = build;
  }

  private static getExisting(): Version[] {
    const tags = getRepoTags();
    const mapped = tags.map((s) => {
      try {
        return Version.fromString(s);
      } catch (e) {
        errorRecursive(e);
        warning(`Ignoring invalid tag: ${s}`);
        return null;
      }
    });
    return mapped.filter(Boolean) as Version[];
  }

  private static parseStage(metadata: string): string | null {
    const stage = /^-(\w+)/.exec(metadata);
    return stage ? stage[1] : null;
  }

  private static parseBuildNumber(metadata: string): number | null {
    const build = /\+build-(\d+)/.exec(metadata);
    return build ? Number.parseInt(build[1]) : null;
  }

  private static parseMetadata(metadata: string | null): {
    build: number | null;
    stage: string | null;
  } {
    if (!metadata) {
      return { build: null, stage: null };
    }

    const stage = Version.parseStage(metadata);
    const build = Version.parseBuildNumber(metadata);
    return { build, stage };
  }

  /**
   * Note: This will only match the current format that ends with "+build-[n]"
   *
   * @param string Valid semver (1.2.3-foobar+build-4)
   * @param assertValid If `true`, throw an error if the version is invalid
   */
  static fromString(versionText: string) {
    // matches 1.2.3, 1.2.3-foobar, 1.2.3-foobar+build-4
    const semverRe = /(\d+)\.(\d+)\.(\d+)(.*)/;
    const semverMatch = semverRe.exec(versionText);
    if (semverMatch) {
      const major = Number.parseInt(semverMatch[1]);
      const minor = Number.parseInt(semverMatch[2]);
      const patch = Number.parseInt(semverMatch[3]);
      const { stage, build } = this.parseMetadata(semverMatch[4] || null);
      return new Version(major, minor, patch, stage, build);
    }

    throw new Error(`Invalid version number: ${versionText}`);
  }

  updateBuildNumber() {
    const firstBuild = 1;
    const existing = Version.getExisting();
    const strings = new Set(existing.map((v) => v.toString()));

    if (this.build == null) {
      this.build = firstBuild;
    }

    let iterations = 0;
    const maxIterations = 1000;
    while (strings.has(this.toString())) {
      if (iterations++ > maxIterations) {
        throw new Error(`Exceeded max iterations (${maxIterations})`);
      }

      this.build = this.build ? this.build + 1 : firstBuild;
    }
  }

  /**
   * See: https://semver.org/
   * > Build metadata MAY be denoted by appending a plus sign [...]
   *
   * @returns Valid semver, e.g. 1.2.3-foobar+build-4
   */
  toString(): string {
    let versionString = `${this.major}.${this.minor}.${this.patch}`;

    if (this.stage) {
      versionString += `-${this.stage}`;
    }

    if (this.build != null) {
      versionString += `+build-${this.build}`;
    }

    return versionString;
  }
}
