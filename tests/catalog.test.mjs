import test from "node:test";
import assert from "node:assert/strict";
import { catalog, matchesSearch, parseCount } from "../src/catalog.ts";

test("o catálogo tem nomes bilíngues e cobre as categorias principais", () => {
  assert.ok(catalog.length >= 80);
  assert.deepEqual(
    new Set(catalog.map(([category]) => category)),
    new Set(["strength", "free", "cable", "cardio", "accessory"]),
  );
  for (const [, pt, en, exercisePt, exerciseEn] of catalog) {
    assert.ok(pt && en && exercisePt && exerciseEn);
  }
});

test("a busca é incremental, bilíngue e ignora acentos", () => {
  assert.equal(
    matchesSearch("bic", "Bicicleta ergométrica", "Exercise bike"),
    true,
  );
  assert.equal(
    matchesSearch("BIKE", "Bicicleta ergométrica", "Exercise bike"),
    true,
  );
  assert.equal(
    matchesSearch("gluteo", "Glúteo máquina", "Glute kickback machine"),
    true,
  );
  assert.equal(
    matchesSearch("esteira", "Bicicleta ergométrica", "Exercise bike"),
    false,
  );
});

test("séries e repetições aceitam somente inteiros dentro dos limites", () => {
  assert.equal(parseCount(" 12 ", 1, 999), 12);
  for (const value of ["", "0", "-1", "1.5", "abc", "100"])
    assert.equal(parseCount(value, 1, 99), null);
});
