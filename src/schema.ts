// Define as tabelas locais; a versão é marcada somente após concluir a carga inicial.
export const schemaSql = `
  CREATE TABLE equipment (id INTEGER PRIMARY KEY, name_pt TEXT NOT NULL, name_en TEXT NOT NULL, category TEXT NOT NULL, owned INTEGER NOT NULL DEFAULT 0 CHECK (owned IN (0, 1)), custom INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE exercises (id INTEGER PRIMARY KEY, name_pt TEXT NOT NULL, name_en TEXT NOT NULL, equipment_id INTEGER REFERENCES equipment(id), custom INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE workouts (id INTEGER PRIMARY KEY, day INTEGER NOT NULL UNIQUE CHECK (day BETWEEN 0 AND 6), name TEXT NOT NULL);
  CREATE TABLE workout_items (id INTEGER PRIMARY KEY, workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE, exercise_id INTEGER NOT NULL REFERENCES exercises(id), sets INTEGER NOT NULL CHECK (sets BETWEEN 1 AND 99), reps INTEGER NOT NULL CHECK (reps BETWEEN 1 AND 999), position INTEGER NOT NULL);
  CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE INDEX idx_workout_items_order ON workout_items(workout_id, position);
`;
