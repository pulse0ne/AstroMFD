export type BundledFont = {
  name: string;
  category: "sans-serif" | "monospace" | "display" | "serif";
};

export const BUNDLED_FONTS: BundledFont[] = [
  { name: "Inter", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Oswald", category: "sans-serif" },
  { name: "JetBrains Mono", category: "monospace" },
  { name: "Fira Code", category: "monospace" },
  { name: "Source Code Pro", category: "monospace" },
  { name: "Orbitron", category: "display" },
  { name: "Rajdhani", category: "display" },
  { name: "Exo 2", category: "display" },
  { name: "Share Tech Mono", category: "display" },
  { name: "Black Ops One", category: "display" },
  { name: "Merriweather", category: "serif" },
  { name: "Playfair Display", category: "serif" },
];

export function loadBundledFonts(): Promise<void> {
  const promises = BUNDLED_FONTS.map((font) => {
    const face = new FontFace(
      font.name,
      `url(/fonts/${encodeURIComponent(font.name)}.woff2)`,
    );
    document.fonts.add(face);
    return face.load().catch(() => {});
  });
  return Promise.all(promises).then(() => {});
}
