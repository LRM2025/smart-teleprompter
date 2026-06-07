import { describe, it, expect, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SmartTeleprompter from "../src/App";

const SETTINGS_KEY = "tp_settings_v1";

describe("Settings persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const openSettings = async () => {
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    await waitFor(() => {
      expect(screen.getByText("Profile Settings")).toBeInTheDocument();
    });
  };

  it("saves settings to localStorage after mount", async () => {
    render(<SmartTeleprompter />);
    await waitFor(() => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      expect(saved).not.toBeNull();
    });
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(settings).toHaveProperty("settingsProfileVersion", 4);
    expect(settings).toHaveProperty("fontSize", 36);
    expect(settings).toHaveProperty("lineHeight", 1.55);
    expect(settings).toHaveProperty("bgColor");
    expect(settings).toHaveProperty("textColor");
    expect(settings).toHaveProperty("highlightColor", "#ffd84d");
    expect(settings).toHaveProperty("showListeningStatus", false);
    expect(settings).toHaveProperty("aimMarkerType", "square");
    expect(settings).toHaveProperty("aimColor", "#8fb8ff");
    expect(settings).toHaveProperty("aimBrightness", 1);
    expect(settings).toHaveProperty("aimContrast", 1.1);
    expect(settings).toHaveProperty("aimScale", 1);
    expect(settings).toHaveProperty("textOpacity", 1);
    expect(settings).toHaveProperty("inactiveTextOpacity", 0.68);
    expect(settings).toHaveProperty("paragraphHighlightOpacity", 0);
    expect(settings).toHaveProperty("showReadAheadCue", true);
    expect(settings).toHaveProperty("readAheadWords", 2);
  });

  it("restores custom settings from localStorage", async () => {
    const customSettings = {
      fontSize: 48,
      bgColor: "#111111",
      textColor: "#00ff00",
      highlightColor: "#ff0000",
      margin: 20,
      lineHeight: 1.5,
      scrollSpeed: 88,
      lookaheadWindow: 10,
      centerPaddingVh: 45,
      showCenterLine: false,
      showAim: true,
      showListeningStatus: true,
      aimMarkerType: "brackets",
      aimColor: "#00aaff",
      aimBrightness: 1.25,
      aimContrast: 1.4,
      aimScale: 1.35,
      showHighlight: true,
      aimOffsetX: 0,
      aimOffsetY: 0,
      textOpacity: 0.8,
      inactiveTextOpacity: 0.45,
      aimOpacity: 1,
      uiOpacity: 0.9,
      sidePaddingVw: 10,
      textAlignStyle: "left",
      mirrorX: false,
      renderMarkdown: false,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(customSettings));

    render(<SmartTeleprompter />);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      expect(saved.fontSize).toBe(48);
    });
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(saved.bgColor).toBe("#111111");
    expect(saved.textColor).toBe("#00ff00");
    expect(saved.showListeningStatus).toBe(true);
    expect(saved.aimMarkerType).toBe("brackets");
    expect(saved.aimColor).toBe("#00aaff");
    expect(saved.aimBrightness).toBe(1.25);
    expect(saved.aimContrast).toBe(1.4);
    expect(saved.aimScale).toBe(1.35);
    expect(saved.inactiveTextOpacity).toBe(0.45);
  });

  it("migrates old default focus settings to the recommended profile", async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        fontSize: 32,
        lineHeight: 1.5,
        scrollSpeed: 88,
        highlightColor: "#ffeb3b",
        centerPaddingVh: 45,
        textOpacity: 0.8,
        inactiveTextOpacity: 1,
        paragraphHighlightOpacity: 0.12,
        paragraphSpacingPx: 12,
        sidePaddingVw: 10,
      })
    );

    render(<SmartTeleprompter />);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      expect(saved.settingsProfileVersion).toBe(4);
      expect(saved.fontSize).toBe(36);
    });

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(saved.lineHeight).toBe(1.55);
    expect(saved.scrollSpeed).toBe(94);
    expect(saved.highlightColor).toBe("#ffd84d");
    expect(saved.centerPaddingVh).toBe(48);
    expect(saved.textOpacity).toBe(1);
    expect(saved.inactiveTextOpacity).toBe(0.68);
    expect(saved.paragraphHighlightOpacity).toBe(0);
    expect(saved.paragraphSpacingPx).toBe(4);
    expect(saved.sidePaddingVw).toBe(20);
    expect(saved.showReadAheadCue).toBe(true);
    expect(saved.readAheadWords).toBe(2);
  });

  it("includes script text in saved settings", async () => {
    render(<SmartTeleprompter />);
    await waitFor(() => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      expect(saved).not.toBeNull();
    });
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(settings.text).toContain("Welcome to Smart Teleprompter");
  });

  it("renders profile settings controls inside settings", async () => {
    render(<SmartTeleprompter />);
    await openSettings();

    expect(screen.getByText("Profile Settings")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Profile name")).toBeInTheDocument();
    expect(screen.getByText("Save New")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Read-ahead cue")).toBeInTheDocument();
    expect(screen.getByText("Cue lead: 2 words")).toBeInTheDocument();
  });

  it("saves profile settings without copying script text", async () => {
    render(<SmartTeleprompter />);
    await openSettings();
    fireEvent.click(screen.getByText("Save New"));

    await waitFor(() => {
      const raw = localStorage.getItem("tp_settings_profiles_v1");
      expect(raw).not.toBeNull();
      const profiles = JSON.parse(raw);
      expect(profiles[0].settings).not.toHaveProperty("text");
      expect(profiles[0].settings).toHaveProperty("inactiveTextOpacity");
    });
  });
});
