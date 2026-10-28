import test from "node:test";
import assert from "node:assert/strict";
import {
  catalog,
  filterEquipment,
  matchesSearch,
  parseCount,
} from "../src/catalog.ts";

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

test("o inventário mostra apenas aparelhos marcados e o catálogo mostra todos", () => {
  const equipment = [
    {
      category: "cardio",
      name_pt: "Esteira",
      name_en: "Treadmill",
      owned: 1,
    },
    {
      category: "cardio",
      name_pt: "Bicicleta",
      name_en: "Exercise bike",
      owned: 0,
    },
  ];
  assert.equal(filterEquipment(equipment, "", "all", false).length, 2);
  assert.deepEqual(filterEquipment(equipment, "trea", "all", true), [equipment[0]]);
  assert.deepEqual(filterEquipment(equipment, "", "cardio", true), [equipment[0]]);
  assert.deepEqual(filterEquipment(equipment, "", "strength", false), []);
});

test("séries e repetições aceitam somente inteiros dentro dos limites", () => {
  assert.equal(parseCount(" 12 ", 1, 999), 12);
  for (const value of ["", "0", "-1", "1.5", "abc", "100"])
    assert.equal(parseCount(value, 1, 99), null);
});
