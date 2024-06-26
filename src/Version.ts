import { error, warning } from "@actions/core";
import { getRepoTags } from "./git";
import { errorRecursive } from "./utils";

export class Version {
  major: number;
  minor: number;
  patch: number;
  stage?: string | null;
  revision?: number | null;
  revisionText = "r";

  constructor(
    major: number,
    minor: number,
    patch: number,
    stage?: string | null,
    revision?: number | null,
    revisionText?: string | null,
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.stage = stage;
    this.revision = revision;

    if (revisionText) {
      this.revisionText = revisionText;
    }
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

  private static parseStage(extra: string): string | null {
    const match = /^-(\w+)/.exec(extra);
    return match ? match[1] : null;
  }

  private static parseMetadata(extra: string) {
    const match = /\+(.*?)(\d*)$/.exec(extra);
    const revisionText = match ? match[1] : null;
    const revisionParsed = match ? Number.parseInt(match[2]) : null;
    const revision = Number.isNaN(revisionParsed) ? null : revisionParsed;
    return { revision, revisionText };
  }

  private static parseExtra(text: string | null) {
    if (!text) {
      return { revision: null, stage: null };
    }

    const stage = Version.parseStage(text);
    const metadata = Version.parseMetadata(text);
    const { revision, revisionText } = metadata;
    return { stage, revision, revisionText };
  }

  /**
   * Parses a valid semver string with at least the major, minor, and patch.
   * The stage and revision are optional.
   */
  static fromString(versionText: string) {
    const semverRe = /(\d+)\.(\d+)\.(\d+)(.*)/;
    const semverMatch = semverRe.exec(versionText);
    if (semverMatch) {
      const major = Number.parseInt(semverMatch[1]);
      const minor = Number.parseInt(semverMatch[2]);
      const patch = Number.parseInt(semverMatch[3]);
      const { stage, revision, revisionText } = this.parseExtra(semverMatch[4] || null);
      return new Version(major, minor, patch, stage, revision, revisionText);
    }

    throw new Error(`Invalid version number: ${versionText}`);
  }

  /**
   * Update the revision number to be unique based on existing tags.
   * The revision will only be incremented if it is not already unique.
   */
  updateRevision() {
    const firstRevision = 1;
    const existing = Version.getExisting();
    const strings = new Set(existing.map((v) => v.toString()));

    if (this.revision == null) {
      this.revision = firstRevision;
    }

    let iterations = 0;
    const maxIterations = 1000;
    while (strings.has(this.toString())) {
      if (iterations++ > maxIterations) {
        throw new Error(`Exceeded max iterations (${maxIterations})`);
      }

      this.revision = this.revision ? this.revision + 1 : firstRevision;
    }
  }

  /**
   * See: https://semver.org/
   * > metadata MAY be denoted by appending a plus sign [...]
   *
   * @returns Valid semver, e.g. 1.2.3-foobar+r4
   */
  toString(): string {
    let versionString = `${this.major}.${this.minor}.${this.patch}`;

    if (this.stage) {
      versionString += `-${this.stage}`;
    }

    if (this.revision != null) {
      versionString += `+${this.revisionText}${this.revision}`;
    }

    return versionString;
  }
}
