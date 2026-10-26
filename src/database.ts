import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { catalog, type Category } from "./catalog";
import { schemaSql } from "./schema";

export type Equipment = {
  id: number;
  name_pt: string;
  name_en: string;
  category: Category;
  owned: number;
  custom: number;
};
export type Exercise = {
  id: number;
  name_pt: string;
  name_en: string;
  equipment_id: number | null;
  custom: number;
};
export type Workout = { id: number; day: number; name: string };
export type WorkoutItem = {
  id: number;
  exercise_id: number;
  name_pt: string;
  name_en: string;
  sets: number;
  reps: number;
  position: number;
};

let databasePromise: Promise<SQLiteDatabase> | null = null;

// Compartilha uma conexão entre telas e permite nova tentativa após falha.
export function openGymDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = initializeGymDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

// Cria o banco local e popula o catálogo apenas na primeira abertura.
async function initializeGymDatabase(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync("gym.db");
  await db.execAsync("PRAGMA foreign_keys = ON");
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) === 0) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(schemaSql);
      for (const [category, pt, en, exercisePt, exerciseEn] of catalog) {
        const result = await db.runAsync(
          "INSERT INTO equipment (name_pt, name_en, category) VALUES (?, ?, ?)",
          pt,
          en,
          category,
        );
        await db.runAsync(
          "INSERT INTO exercises (name_pt, name_en, equipment_id) VALUES (?, ?, ?)",
          exercisePt,
          exerciseEn,
          result.lastInsertRowId,
        );
      }
      for (let day = 0; day < 7; day++) {
        await db.runAsync(
          "INSERT INTO workouts (day, name) VALUES (?, ?)",
          day,
          "",
        );
      }
      await db.execAsync("PRAGMA user_version = 1");
    });
  }
  return db;
}

// Retorna os aparelhos incluindo os cadastrados pelo usuário.
export function listEquipment(db: SQLiteDatabase): Promise<Equipment[]> {
  return db.getAllAsync<Equipment>(
    "SELECT * FROM equipment ORDER BY custom DESC, name_pt COLLATE NOCASE",
  );
}

export function listExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  return db.getAllAsync<Exercise>(
    "SELECT * FROM exercises ORDER BY custom DESC, name_pt COLLATE NOCASE",
  );
}

export function listWorkouts(db: SQLiteDatabase): Promise<Workout[]> {
  return db.getAllAsync<Workout>("SELECT * FROM workouts ORDER BY day");
}

export function listWorkoutItems(
  db: SQLiteDatabase,
  workoutId: number,
): Promise<WorkoutItem[]> {
  return db.getAllAsync<WorkoutItem>(
    `SELECT wi.*, e.name_pt, e.name_en FROM workout_items wi JOIN exercises e ON e.id = wi.exercise_id WHERE wi.workout_id = ? ORDER BY wi.position, wi.id`,
    workoutId,
  );
}

// Alterna a disponibilidade do aparelho na academia do usuário.
export async function setEquipmentOwned(
  db: SQLiteDatabase,
  id: number,
  owned: boolean,
): Promise<void> {
  await db.runAsync(
    "UPDATE equipment SET owned = ? WHERE id = ?",
    owned ? 1 : 0,
    id,
  );
}

export async function createEquipment(
  db: SQLiteDatabase,
  name: string,
): Promise<void> {
  await db.runAsync(
    "INSERT INTO equipment (name_pt, name_en, category, owned, custom) VALUES (?, ?, ?, 1, 1)",
    name,
    name,
    "accessory",
  );
}

export async function createExercise(
  db: SQLiteDatabase,
  name: string,
): Promise<number> {
  const result = await db.runAsync(
    "INSERT INTO exercises (name_pt, name_en, custom) VALUES (?, ?, 1)",
    name,
    name,
  );
  return result.lastInsertRowId;
}

export async function renameWorkout(
  db: SQLiteDatabase,
  id: number,
  name: string,
): Promise<void> {
  await db.runAsync("UPDATE workouts SET name = ? WHERE id = ?", name, id);
}

// Acrescenta no fim do treino mantendo uma ordem estável dos exercícios.
export async function addWorkoutItem(
  db: SQLiteDatabase,
  workoutId: number,
  exerciseId: number,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO workout_items (workout_id, exercise_id, sets, reps, position) VALUES (?, ?, 3, 12, COALESCE((SELECT MAX(position) + 1 FROM workout_items WHERE workout_id = ?), 0))`,
    workoutId,
    exerciseId,
    workoutId,
  );
}

export async function updateWorkoutItem(
  db: SQLiteDatabase,
  id: number,
  sets: number,
  reps: number,
): Promise<void> {
  await db.runAsync(
    "UPDATE workout_items SET sets = ?, reps = ? WHERE id = ?",
    sets,
    reps,
    id,
  );
}

export async function removeWorkoutItem(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.runAsync("DELETE FROM workout_items WHERE id = ?", id);
}

export async function readLanguage(
  db: SQLiteDatabase,
): Promise<"pt" | "en" | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'language'",
  );
  return row?.value === "pt" || row?.value === "en" ? row.value : null;
}

export async function saveLanguage(
  db: SQLiteDatabase,
  language: "pt" | "en",
): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('language', ?)",
    language,
  );
}
