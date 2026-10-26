import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { schemaSql } from "../src/schema.ts";

test("o schema preserva treinos por dia e valida séries e repetições", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(schemaSql);
  db.prepare("INSERT INTO workouts (day, name) VALUES (?, ?)").run(1, "Peito");
  assert.throws(() =>
    db
      .prepare("INSERT INTO workouts (day, name) VALUES (?, ?)")
      .run(1, "Duplicado"),
  );
  assert.throws(() =>
    db
      .prepare("INSERT INTO workouts (day, name) VALUES (?, ?)")
      .run(7, "Inválido"),
  );
  db.prepare("INSERT INTO exercises (name_pt, name_en) VALUES (?, ?)").run(
    "Flexão",
    "Push-up",
  );
  assert.throws(() =>
    db
      .prepare(
        "INSERT INTO workout_items (workout_id, exercise_id, sets, reps, position) VALUES (1, 1, 0, 12, 0)",
      )
      .run(),
  );
  db.prepare(
    "INSERT INTO workout_items (workout_id, exercise_id, sets, reps, position) VALUES (1, 1, 3, 12, 0)",
  ).run();
  db.prepare("DELETE FROM workouts WHERE id = 1").run();
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM workout_items").get().count,
    0,
  );
  db.close();
});
