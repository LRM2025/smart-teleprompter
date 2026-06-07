import { describe, it, expect, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import SmartTeleprompter from "../src/App";

const SETTINGS_KEY = "tp_settings_v1";

describe("Settings persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves settings to localStorage after mount", async () => {
    render(<SmartTeleprompter />);
    await waitFor(() => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      expect(saved).not.toBeNull();
    });
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(settings).toHaveProperty("fontSize");
    expect(settings).toHaveProperty("bgColor");
    expect(settings).toHaveProperty("textColor");
    expect(settings).toHaveProperty("showListeningStatus", false);
    expect(settings).toHaveProperty("aimMarkerType", "square");
    expect(settings).toHaveProperty("aimColor", "#8fb8ff");
    expect(settings).toHaveProperty("aimBrightness", 1);
    expect(settings).toHaveProperty("aimContrast", 1.1);
    expect(settings).toHaveProperty("aimScale", 1);
    expect(settings).toHaveProperty("inactiveTextOpacity", 1);
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

  it("includes script text in saved settings", async () => {
    render(<SmartTeleprompter />);
    await waitFor(() => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      expect(saved).not.toBeNull();
    });
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(settings.text).toContain("Welcome to Smart Teleprompter");
  });
});
