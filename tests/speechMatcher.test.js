import { describe, expect, it } from "vitest";
import {
  findInitialSpeechIndex,
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

  it("locks onto speech when the user starts in the middle of the script", () => {
    const normalizedWords = normalizeScript(
      "Let's talk about the moment a shared lead turns into a nightmare Aber wir sollten die Zielgruppe ansprechen"
    );
    const tokens = normalizeTranscript("Aber wir sollten");

    expect(
      findInitialSpeechIndex({
        tokens,
        normalizedWords,
        startIndex: 0,
      })
    ).toBe(14);
  });

  it("uses earliest exact phrase during initial lock instead of a later repeated single word", () => {
    const normalizedWords = normalizeScript(
      "Teleprompter intro starts here later we mention Teleprompter again"
    );
    const tokens = normalizeTranscript("Teleprompter");

    expect(
      findInitialSpeechIndex({
        tokens,
        normalizedWords,
        startIndex: 0,
      })
    ).toBe(0);
  });
});
