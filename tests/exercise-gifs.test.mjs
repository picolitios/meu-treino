import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const artworkCode = readFileSync(join(root, "src/components/ExerciseArtwork.tsx"), "utf8");
const mapping = artworkCode.split("const animationByArtwork")[0];

// Garante que toda miniatura licenciada usada pelo app tem seu GIF local correspondente.
test("cada ilustração de exercício oferece uma animação válida", () => {
  const slugs = new Set(
    [...mapping.matchAll(/assets\/exercises\/([\w-]+)\.png/g)].map((match) => match[1]),
  );
  assert.ok(slugs.size > 0);

  for (const slug of slugs) {
    const filename = `${slug}.gif`;
    assert.ok(
      artworkCode.includes(`assets/exercise-gifs/${filename}`),
      `GIF não mapeado: ${filename}`,
    );
    const bytes = readFileSync(join(root, "assets/exercise-gifs", filename));
    assert.equal(bytes.subarray(0, 6).toString("ascii"), "GIF89a");
    assert.ok(bytes.length > 1000, `GIF incompleto: ${filename}`);
  }

  assert.equal(
    readdirSync(join(root, "assets/exercise-gifs")).filter((file) => file.endsWith(".gif")).length,
    slugs.size,
  );
});
