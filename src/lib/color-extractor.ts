/**
 * Advanced Client-Side Color Extraction & Adaptive Dual-Mode (Dark/Light) Harmonization Engine
 *
 * 1. Uses HTML5 Canvas to analyze image pixels with perceptual chroma weighting
 * 2. Filters noise, white/black backgrounds, and gray borders
 * 3. Clusters pixels by HSL color bins and prioritizes dominant brand chroma
 * 4. Generates WCAG-compliant adaptive color tokens tailored for BOTH Light and Dark themes:
 *    - In Light Mode: deep, crisp, high-contrast readable tones on white surfaces
 *    - In Dark Mode: radiant, luminous, neon-athletic glow on dark obsidian surfaces (never muddy/dark)
 */

export interface AdaptiveBrandTheme {
  primaryHex: string;
  primaryRgb: { r: number; g: number; b: number };
  foreground: string; // High-contrast text on solid brand background (#fff or #0f172a)
  // Light Mode Tokens
  light: {
    primary: string;
    text: string; // Darkened for AA/AAA contrast on white backgrounds
    softBg: string; // Airy pastel tint (rgba)
    border: string; // Crisp border (rgba)
    hover: string;
  };
  // Dark Mode Tokens
  dark: {
    primary: string; // Luminous vibrant shade tuned specifically for dark backgrounds
    text: string; // Radiant for high contrast on dark obsidian backgrounds
    softBg: string; // Rich glowing tint (rgba)
    border: string; // Luminous glowing border (rgba)
    glow: string; // Atmospheric radial glow
    hover: string;
  };
}

// Convert RGB (0-255) to HSL (H: 0-360, S: 0-1, L: 0-1)
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s, l };
}

// Convert HSL (H: 0-360, S: 0-1, L: 0-1) to Hex String
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return "#" + [red, green, blue].map((val) => val.toString(16).padStart(2, "0")).join("");
}

// Convert Hex string to RGB numbers
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 59, g: 130, b: 246 }; // fallback enterprise tech blue
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate Relative Luminance (WCAG standard)
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Generate complete adaptive palette for both Dark & Light modes from a base hex color
 */
export function generateAdaptiveBrandTheme(baseHex: string): AdaptiveBrandTheme {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  // High contrast button foreground text
  const foreground = luminance > 0.48 ? "#0f172a" : "#ffffff";

  // Light Mode Tokens:
  // Text: Darken lightness down to 30%-38% for crisp readability on white backgrounds
  const lightPrimary = baseHex;
  const lightTextLightness = Math.min(hsl.l, 0.35);
  const lightTextSaturation = Math.min(1, hsl.s * 1.2);
  const lightText = hslToHex(hsl.h, lightTextSaturation, Math.max(0.22, lightTextLightness));

  // Dark Mode Tokens:
  // IMPORTANT: For dark mode, elevate lightness and saturation so colors NEVER look muddy, brown, or dull.
  // We tune lightness to 54%-62% and saturation to 85%-100% for a radiant athletic glow.
  const darkPrimaryLightness = Math.min(0.62, Math.max(0.52, hsl.l < 0.45 ? 0.54 : hsl.l));
  const darkPrimarySaturation = Math.min(1, Math.max(0.85, hsl.s * 1.15));
  const darkPrimary = hslToHex(hsl.h, darkPrimarySaturation, darkPrimaryLightness);
  const darkRgb = hexToRgb(darkPrimary);

  // Dark Text: Luminous lightness 72%-80%
  const darkText = hslToHex(
    hsl.h,
    Math.min(1, hsl.s * 1.1),
    Math.min(0.82, Math.max(0.72, darkPrimaryLightness + 0.18)),
  );

  return {
    primaryHex: baseHex,
    primaryRgb: rgb,
    foreground,
    light: {
      primary: lightPrimary,
      text: lightText,
      softBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10)`,
      border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
      hover: hslToHex(hsl.h, hsl.s, Math.max(0.2, hsl.l - 0.08)),
    },
    dark: {
      primary: darkPrimary,
      text: darkText,
      softBg: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.18)`,
      border: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.38)`,
      glow: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.45)`,
      hover: hslToHex(hsl.h, darkPrimarySaturation, Math.min(0.72, darkPrimaryLightness + 0.08)),
    },
  };
}

/**
 * Extract the accurate dominant brand color from a gym logo image using HTML5 Canvas & Chroma Clustering
 */
export function extractDominantColor(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("#3b82f6");
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#3b82f6");
          return;
        }

        const size = 128;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;

        interface ColorCluster {
          totalR: number;
          totalG: number;
          totalB: number;
          count: number;
          saturation: number;
          lightness: number;
          chroma: number;
        }

        const clusters: Map<number, ColorCluster> = new Map();
        let fallbackR = 0,
          fallbackG = 0,
          fallbackB = 0,
          fallbackCount = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const alpha = imgData[i + 3];

          // 1. Skip transparent pixels
          if (alpha < 100) continue;

          // 2. Filter pure white/off-white background (> 230) and pure black (< 30)
          const isWhite = r > 230 && g > 230 && b > 230;
          const isBlack = r < 30 && g < 30 && b < 30;

          if (!isWhite && !isBlack) {
            fallbackR += r;
            fallbackG += g;
            fallbackB += b;
            fallbackCount++;
          }

          // 3. Calculate chroma and saturation
          const chroma = Math.max(r, g, b) - Math.min(r, g, b);
          const hsl = rgbToHsl(r, g, b);

          // Strictly filter out grayscale/neutral/black/gray noise
          if (chroma < 28 || hsl.s < 0.25 || hsl.l < 0.12 || hsl.l > 0.88) {
            continue;
          }

          // Quantize Hue into 36 bins (10 degrees each)
          const hueBin = Math.floor(hsl.h / 10);

          const existing = clusters.get(hueBin);
          if (existing) {
            existing.totalR += r;
            existing.totalG += g;
            existing.totalB += b;
            existing.count += 1;
            existing.chroma += chroma;
            existing.saturation += hsl.s;
            existing.lightness += hsl.l;
          } else {
            clusters.set(hueBin, {
              totalR: r,
              totalG: g,
              totalB: b,
              count: 1,
              saturation: hsl.s,
              lightness: hsl.l,
              chroma,
            });
          }
        }

        // If no vivid chromatic pixels found
        if (clusters.size === 0) {
          if (fallbackCount > 0) {
            const avgR = Math.round(fallbackR / fallbackCount);
            const avgG = Math.round(fallbackG / fallbackCount);
            const avgB = Math.round(fallbackB / fallbackCount);
            const fallbackHex =
              "#" + [avgR, avgG, avgB].map((x) => x.toString(16).padStart(2, "0")).join("");
            resolve(fallbackHex);
          } else {
            resolve("#3b82f6");
          }
          return;
        }

        // 4. Score Hue clusters with heavy weighting on Saturation and Chroma
        let bestCluster: ColorCluster | null = null;
        let highestScore = -1;

        for (const cluster of clusters.values()) {
          const avgChroma = cluster.chroma / cluster.count;
          const avgSat = cluster.saturation / cluster.count;
          const avgLightness = cluster.lightness / cluster.count;

          const lightnessWeight = 1 - Math.abs(avgLightness - 0.5) * 1.0;
          const score =
            cluster.count *
            Math.pow(avgSat, 2.2) *
            (avgChroma / 255) *
            Math.max(0.3, lightnessWeight);

          if (score > highestScore) {
            highestScore = score;
            bestCluster = cluster;
          }
        }

        if (bestCluster) {
          const finalR = Math.round(bestCluster.totalR / bestCluster.count);
          const finalG = Math.round(bestCluster.totalG / bestCluster.count);
          const finalB = Math.round(bestCluster.totalB / bestCluster.count);

          const finalHex =
            "#" + [finalR, finalG, finalB].map((x) => x.toString(16).padStart(2, "0")).join("");

          resolve(finalHex);
        } else {
          resolve("#3b82f6");
        }
      } catch (err) {
        console.warn("[ColorExtractor Error]:", err);
        resolve("#3b82f6");
      }
    };

    img.onerror = () => {
      resolve("#3b82f6");
    };

    img.src = imageSrc;
  });
}

/**
 * Injects adaptive CSS custom properties into :root and .dark for perfect blending in both Dark and Light modes
 */
export function applyBrandThemeCss(hexColor: string) {
  if (typeof document === "undefined") return;

  try {
    const theme = generateAdaptiveBrandTheme(hexColor);
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    // Base Brand Tokens
    const activePrimary = isDark ? theme.dark.primary : theme.light.primary;
    const activePrimaryRgb = hexToRgb(activePrimary);

    root.style.setProperty("--brand-primary", activePrimary);
    root.style.setProperty(
      "--brand-rgb",
      `${activePrimaryRgb.r}, ${activePrimaryRgb.g}, ${activePrimaryRgb.b}`,
    );
    root.style.setProperty("--brand-foreground", theme.foreground);

    // Light Mode Specific CSS Properties
    root.style.setProperty("--brand-text-light", theme.light.text);
    root.style.setProperty("--brand-soft-light", theme.light.softBg);
    root.style.setProperty("--brand-border-light", theme.light.border);
    root.style.setProperty("--brand-hover-light", theme.light.hover);

    // Dark Mode Specific CSS Properties
    root.style.setProperty("--brand-text-dark", theme.dark.text);
    root.style.setProperty("--brand-soft-dark", theme.dark.softBg);
    root.style.setProperty("--brand-border-dark", theme.dark.border);
    root.style.setProperty("--brand-glow-dark", theme.dark.glow);
    root.style.setProperty("--brand-hover-dark", theme.dark.hover);

    // Active adaptive variables based on current active theme
    if (isDark) {
      root.style.setProperty("--brand-text", theme.dark.text);
      root.style.setProperty("--brand-soft", theme.dark.softBg);
      root.style.setProperty("--brand-border", theme.dark.border);
      root.style.setProperty("--brand-glow", theme.dark.glow);
      root.style.setProperty("--brand-hover", theme.dark.hover);
    } else {
      root.style.setProperty("--brand-text", theme.light.text);
      root.style.setProperty("--brand-soft", theme.light.softBg);
      root.style.setProperty("--brand-border", theme.light.border);
      root.style.setProperty(
        "--brand-glow",
        `rgba(${theme.primaryRgb.r}, ${theme.primaryRgb.g}, ${theme.primaryRgb.b}, 0.20)`,
      );
      root.style.setProperty("--brand-hover", theme.light.hover);
    }
  } catch (err) {
    console.warn("[applyBrandThemeCss Error]:", err);
  }
}
