import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/catalog.ts";

const artworkPath = fileURLToPath(
  new URL("../src/components/ExerciseArtwork.tsx", import.meta.url),
);
const artworkCode = readFileSync(artworkPath, "utf8");
const artwork = new Map(
  [...artworkCode.matchAll(/"([^"]+)": require\("\.\.\/\.\.\/assets\/exercises\/([a-z0-9-]+)\.png"\)/g)].map(
    ([, name, slug]) => [name, slug],
  ),
);
const iconCode = artworkCode.split("const iconByExercise:")[1]?.split("};")[0] ?? "";
const icons = new Set(
  [...iconCode.matchAll(/"([^"]+)": "[^"]+"/g)].map(([, name]) => name),
);

// Garante que o catálogo offline nunca apresente um exercício inicial sem apoio visual.
test("cada exercício inicial tem ilustração local ou pictograma", () => {
  assert.equal(artwork.size + icons.size, catalog.length);
  for (const [, , , , nameEn] of catalog) {
    const slug = artwork.get(nameEn);
    assert.ok(slug || icons.has(nameEn), `Sem apoio visual: ${nameEn}`);
    if (!slug) continue;
    assert.ok(
      existsSync(
        fileURLToPath(
          new URL(`../assets/exercises/${slug}.png`, import.meta.url),
        ),
      ),
      `Arquivo ausente: ${slug}.png`,
    );
    const gif = readFileSync(
      fileURLToPath(
        new URL(`../assets/exercise-gifs/${slug}.gif`, import.meta.url),
      ),
    );
    assert.equal(gif.subarray(0, 6).toString(), "GIF89a", `GIF inválido: ${slug}`);
    assert.equal(gif.readUInt16LE(6), 512, `Largura inesperada: ${slug}`);
    assert.equal(gif.readUInt16LE(8), 512, `Altura inesperada: ${slug}`);
  }
  assert.equal(
    new Set(catalog.map(([, , equipmentEn]) => equipmentEn)).size,
    catalog.length,
    "Cada equipamento inicial precisa de uma pose associada",
  );
  assert.ok(
    existsSync(
      fileURLToPath(
        new URL("../assets/exercises/LICENSE-ASSETS", import.meta.url),
      ),
    ),
  );
});
