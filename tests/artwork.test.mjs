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
  }
  assert.ok(
    existsSync(
      fileURLToPath(
        new URL("../assets/exercises/LICENSE-ASSETS", import.meta.url),
      ),
    ),
  );
});
