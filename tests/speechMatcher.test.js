import { describe, expect, it } from "vitest";
import {
  findSequentialInterimIndex,
  normalizeTranscript,
  normalizeWord,
} from "../src/speechMatcher";

const normalizeScript = (text) => text.split(/\s+/).map(normalizeWord);

describe("speech matcher", () => {
  it("advances through a directly aligned interim phrase", () => {
    const normalizedWords = normalizeScript(
      "Welcome to Smart Teleprompter the free open source app"
    );
    const tokens = normalizeTranscript("to Smart Teleprompter");

    expect(
      findSequentialInterimIndex({
        tokens,
        normalizedWords,
        startIndex: 1,
      })
    ).toBe(3);
  });

  it("does not jump to a later repeated word when intermediate words were not matched", () => {
    const normalizedWords = normalizeScript(
      "Welcome to Smart Teleprompter the free open source Teleprompter app"
    );
    const tokens = normalizeTranscript("Teleprompter");

    expect(
      findSequentialInterimIndex({
        tokens,
        normalizedWords,
        startIndex: 4,
      })
    ).toBe(-1);
  });

  it("matches the immediate next repeated word without searching ahead", () => {
    const normalizedWords = normalizeScript(
      "Welcome to Smart Teleprompter the free open source Teleprompter app"
    );
    const tokens = normalizeTranscript("Teleprompter");

    expect(
      findSequentialInterimIndex({
        tokens,
        normalizedWords,
        startIndex: 3,
      })
    ).toBe(3);
  });
});
