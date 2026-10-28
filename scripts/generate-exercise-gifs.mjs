import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import gifenc from "gifenc";
import { PNG } from "pngjs";

const { GIFEncoder } = gifenc;

const sourceRoot = resolve(process.argv[2] ?? "");
const sourceAssets = join(sourceRoot, "packages", "workout-guide", "assets");
const outputDir = resolve("assets", "exercise-gifs");
const stillsDir = resolve("assets", "exercises");
const frameSequence = [1, 2, 3, 2];
const delayMs = 350;

if (!process.argv[2] || !existsSync(sourceAssets)) {
  console.error("Uso: npm run artwork:gifs -- <caminho-do-repositorio-workout-guide>");
  process.exit(1);
}

// Mantém a mesma cor roxa dos cartões e vários tons para preservar bordas suaves.
const background = [40, 19, 63];
const palette = Array.from({ length: 32 }, (_, shade) =>
  background.map((channel) => Math.round(channel + ((255 - channel) * shade) / 31)),
);

// Usa somente exercícios com miniatura no app; os GIFs ficam prontos para uso futuro.
const slugs = readdirSync(stillsDir)
  .filter((filename) => filename.endsWith(".png"))
  .map((filename) => filename.slice(0, -4));
mkdirSync(outputDir, { recursive: true });

for (const slug of slugs) {
  const gif = GIFEncoder();
  let size;

  for (const frameNumber of frameSequence) {
    const path = join(sourceAssets, slug, `frame-${frameNumber}.png`);
    if (!existsSync(path)) throw new Error(`Quadro ausente: ${path}`);

    const frame = PNG.sync.read(readFileSync(path));
    size ??= { width: frame.width, height: frame.height };
    if (frame.width !== size.width || frame.height !== size.height) {
      throw new Error(`Quadros de tamanhos diferentes: ${slug}`);
    }

    // A fonte é branca com transparência; a opacidade vira o índice da paleta.
    const pixels = new Uint8Array(frame.width * frame.height);
    for (let pixel = 0; pixel < pixels.length; pixel += 1) {
      pixels[pixel] = Math.round((frame.data[pixel * 4 + 3] * 31) / 255);
    }
    gif.writeFrame(pixels, frame.width, frame.height, {
      palette,
      delay: delayMs,
      repeat: 0,
    });
  }

  gif.finish();
  writeFileSync(join(outputDir, `${slug}.gif`), gif.bytes());
}

console.log(`${slugs.length} GIFs de exercícios salvos em ${outputDir}`);
