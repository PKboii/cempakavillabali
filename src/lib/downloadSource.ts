import JSZip from "jszip";

/**
 * Bundles the entire project source into a .zip client-side.
 * Files are pulled from the real source tree at build time via ?raw imports,
 * so the archive always matches what is running.
 */
const files = import.meta.glob(
  [
    "/index.html",
    "/package.json",
    "/vite.config.js",
    "/vite.config.ts",
    "/tsconfig.json",
    "/src/**/*.ts",
    "/src/**/*.tsx",
    "/src/**/*.css",
    "!/src/**/*.d.ts",
  ],
  { eager: true, query: "?raw", import: "default" }
) as Record<string, string>;

const README = `# Villa Cahaya — Private Estate, Ubud

An interactive Three.js scroll experience for a Balinese villa:
procedurally-built estate (split gate, meru pavilions, infinity pool with a
custom water shader, palms, lanterns, fireflies), a scroll-driven camera
path with a dusk-to-night lighting cycle, Lenis smooth scrolling with mouse
parallax, generative gamelan ambience, and a live-pricing booking form.

## Run it locally

\`\`\`bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
\`\`\`

Requires Node 18+.

## Stack

- React 18 + Vite 6
- Three.js (scene, custom GLSL sky & water shaders)
- Lenis (smooth scrolling)
- Tailwind CSS v4
- JSZip (source download)
- WebAudio (generative gamelan)

## Publish to GitHub Pages (optional)

1. \`npm run build\`
2. Push the \`dist/\` folder to a \`gh-pages\` branch, or use the
   "Deploy from a branch" setting with \`/dist\` as the source.

— bundled automatically from the live site, enjoy.
`;

export async function downloadSourceZip(): Promise<number> {
  const zip = new JSZip();
  const root = zip.folder("villa-cahaya")!;
  let count = 0;

  Object.entries(files).forEach(([path, content]) => {
    if (typeof content !== "string") return;
    root.file(path.replace(/^\//, ""), content);
    count++;
  });
  root.file("README.md", README);
  root.file(
    ".gitignore",
    "node_modules\ndist\n.DS_Store\n*.local\n"
  );

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "villa-cahaya-source.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);

  return count;
}
