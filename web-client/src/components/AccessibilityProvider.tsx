"use client";

import React, { useEffect, useState } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  monochrome: boolean;
  dyslexiaFont: boolean;
  largeText: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  monochrome: false,
  dyslexiaFont: false,
  largeText: false,
};

const CLASS_BY_SETTING: Record<keyof AccessibilitySettings, string> = {
  highContrast: "a11y-high-contrast",
  monochrome: "a11y-monochrome",
  dyslexiaFont: "a11y-dyslexia",
  largeText: "a11y-large-text",
};

/**
 * Áp dụng các tuỳ chọn tiếp cận đã lưu trong localStorage lên <html>.
 * Bảng điều khiển trực quan đã được gỡ khỏi giao diện.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem("a11y-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse a11y settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("a11y-settings", JSON.stringify(settings));

    const html = document.documentElement;

    (Object.keys(CLASS_BY_SETTING) as (keyof AccessibilitySettings)[]).forEach(
      (key) => {
        const className = CLASS_BY_SETTING[key];
        if (settings[key]) {
          html.classList.add(className);
        } else {
          html.classList.remove(className);
        }
      },
    );
  }, [settings]);

  return <>{children}</>;
}
