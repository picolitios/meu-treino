import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as AnimatedImage } from "expo-image";
import { getLocales } from "expo-localization";
import type { SQLiteDatabase } from "expo-sqlite";
import {
  filterEquipment,
  matchesSearch,
  parseCount,
  type Category,
} from "../catalog";
import {
  addWorkoutItem,
  createEquipment,
  createExercise,
  listEquipment,
  listExercises,
  listWorkoutItems,
  listWorkouts,
  openGymDatabase,
  readLanguage,
  removeWorkoutItem,
  renameWorkout,
  saveLanguage,
  setEquipmentOwned,
  updateWorkoutItem,
  type Equipment,
  type Exercise,
  type Workout,
  type WorkoutItem,
} from "../database";
import { translate, type Language } from "../i18n";
import { s } from "../styles";
import { colors } from "../theme";
import {
  EquipmentArtwork,
  ExerciseArtwork,
  getExerciseAnimation,
} from "./ExerciseArtwork";

type Tab = "plan" | "catalog" | "gym" | "settings";
type Dialog = "pick" | "equipment" | "edit" | "preview" | null;
const categories: (Category | "all")[] = [
  "all",
  "strength",
  "free",
  "cable",
  "cardio",
  "accessory",
];

// Reúne título e ornamentos para manter a mesma identidade nas quatro telas.
function HeroHeading({
  eyebrow,
  title,
  subtitle,
  standalone = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  standalone?: boolean;
}) {
  return (
    <View style={[s.heading, standalone && s.standaloneHeading]}>
      <View style={s.heroOrb} pointerEvents="none" />
      <View style={s.heroRing} pointerEvents="none" />
      <Text style={[s.kicker, s.heroKicker]}>{eyebrow}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={[s.subtitle, s.heroSubtitle]}>{subtitle}</Text>
    </View>
  );
}

// Coordena os treinos e equipamentos persistidos no banco local.
export function GymApp({ tab }: { tab: Tab }) {
  const insets = useSafeAreaInsets();
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [language, setLanguage] = useState<Language>(
    getLocales()[0]?.languageCode === "en" ? "en" : "pt",
  );
  const t = translate(language);
  const [day, setDay] = useState(new Date().getDay());
  const initialDay = useRef(day);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [nameDraft, setNameDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [editingGym, setEditingGym] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [preview, setPreview] = useState<{
    nameEn: string;
    title: string;
    returnTo: Dialog;
  } | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [onlyMyGym, setOnlyMyGym] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customExercise, setCustomExercise] = useState(false);
  const [editing, setEditing] = useState<WorkoutItem | null>(null);
  const [setsDraft, setSetsDraft] = useState("3");
  const [repsDraft, setRepsDraft] = useState("12");
  const [busy, setBusy] = useState(false);
  const workout = workouts.find((entry) => entry.day === day);
  const workoutId = workout?.id;
  const owned = useMemo(
    () =>
      new Set(
        equipment.filter((entry) => entry.owned).map((entry) => entry.id),
      ),
    [equipment],
  );
  const label = (entry: { name_pt: string; name_en: string }) =>
    language === "pt" ? entry.name_pt : entry.name_en;

  // Recarrega as listas após cada gravação para refletir apenas dados persistidos.
  const refresh = useCallback(
    async (database: SQLiteDatabase, selectedDay: number) => {
      const [nextEquipment, nextExercises, nextWorkouts] = await Promise.all([
        listEquipment(database),
        listExercises(database),
        listWorkouts(database),
      ]);
      setEquipment(nextEquipment);
      setExercises(nextExercises);
      setWorkouts(nextWorkouts);
      const selected = nextWorkouts.find((entry) => entry.day === selectedDay);
      setNameDraft(selected?.name ?? "");
      setItems(selected ? await listWorkoutItems(database, selected.id) : []);
    },
    [],
  );

  // Abre o SQLite e restaura a preferência de idioma na primeira renderização.
  useEffect(() => {
    let active = true;
    openGymDatabase()
      .then(async (database) => {
        if (!active) return;
        const saved = await readLanguage(database);
        if (saved && active) setLanguage(saved);
        if (active) {
          await refresh(database, initialDay.current);
          setDb(database);
        }
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [retryToken, refresh]);

  useEffect(() => {
    if (!db) return;
    if (workoutId)
      listWorkoutItems(db, workoutId)
        .then(setItems)
        .catch(() => Alert.alert(t.app, t.error));
  }, [day, db, workoutId, t.app, t.error]);

  // Serializa as edições e apresenta falhas de persistência ao usuário.
  const mutate = async (action: () => Promise<void>, after?: () => void) => {
    if (!db || busy) return;
    setBusy(true);
    try {
      await action();
      await refresh(db, day);
      after?.();
    } catch {
      Alert.alert(t.app, t.error);
    } finally {
      setBusy(false);
    }
  };

  const filteredEquipment = filterEquipment(
    equipment,
    search,
    category,
    tab === "gym" && !editingGym,
  )
    .sort(
      (a, b) =>
        (tab === "gym" && editingGym
          ? 0
          : Number(b.owned) - Number(a.owned)) || label(a).localeCompare(label(b)),
    );
  const filteredExercises = exercises
    .filter(
      (entry) =>
        matchesSearch(pickerSearch, entry.name_pt, entry.name_en) &&
        (!onlyMyGym ||
          (entry.equipment_id !== null && owned.has(entry.equipment_id))),
    )
    .sort(
      (a, b) =>
        Number(owned.has(b.equipment_id ?? -1)) -
        Number(owned.has(a.equipment_id ?? -1)),
    );

  const saveName = () => {
    if (!workout) return;
    const value = nameDraft.trim();
    if (value.length > 60) return Alert.alert(t.app, t.invalidName);
    mutate(() => renameWorkout(db!, workout.id, value));
  };
  const addExercise = (id: number) => {
    if (!workout) return;
    mutate(
      () => addWorkoutItem(db!, workout.id, id),
      () => {
        setDialog(null);
        setPickerSearch("");
      },
    );
  };

  // Abre o GIF local e lembra a lista de escolha para voltar sem perder a busca.
  const openPreview = (nameEn: string, title: string) => {
    if (!getExerciseAnimation(nameEn)) return;
    setPreview({ nameEn, title, returnTo: dialog === "pick" ? "pick" : null });
    setDialog("preview");
  };

  const closeDialog = () => {
    if (dialog === "preview") {
      setDialog(preview?.returnTo ?? null);
      setPreview(null);
    } else {
      setDialog(null);
    }
  };
  const addCustomExercise = () => {
    const value = customName.trim();
    if (!value || value.length > 80 || !workout)
      return Alert.alert(t.app, t.invalidName);
    mutate(
      async () => {
        const id = await createExercise(db!, value);
        await addWorkoutItem(db!, workout.id, id);
      },
      () => {
        setDialog(null);
        setCustomName("");
        setCustomExercise(false);
      },
    );
  };
  const addCustomEquipment = () => {
    const value = customName.trim();
    if (!value || value.length > 80) return Alert.alert(t.app, t.invalidName);
    mutate(
      () => createEquipment(db!, value),
      () => {
        setDialog(null);
        setCustomName("");
        setSearch("");
      },
    );
  };
  const saveItem = () => {
    if (!editing) return;
    const sets = parseCount(setsDraft, 1, 99),
      reps = parseCount(repsDraft, 1, 999);
    if (sets === null || reps === null)
      return Alert.alert(t.app, t.invalidCount);
    mutate(
      () => updateWorkoutItem(db!, editing.id, sets, reps),
      () => {
        setDialog(null);
        setEditing(null);
      },
    );
  };
  // Exclui somente o item do treino, preservando o exercício no catálogo.
  const confirmRemove = (item: WorkoutItem) =>
    Alert.alert(t.removeTitle, t.removeMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.remove,
        style: "destructive",
        onPress: () => mutate(() => removeWorkoutItem(db!, item.id)),
      },
    ]);

  if (!db)
    return (
      <SafeAreaView style={[s.safe, s.loading]} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <Text style={s.emptyTitle}>{loadError ? t.loadError : t.loading}</Text>
        {loadError && (
          <Pressable
            style={s.primary}
            onPress={() => {
              setLoadError(false);
              setRetryToken((value) => value + 1);
            }}
          >
            <Text style={s.primaryText}>{t.retry}</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View style={s.logo}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={21}
            color={colors.primaryDark}
          />
        </View>
        <Text style={s.brand}>{t.app}</Text>
      </View>
      <View style={s.main}>
        {tab === "plan" && (
          <>
            <HeroHeading
              eyebrow={t.week}
              title={t.plan}
              subtitle={t.planSubtitle}
              standalone
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.dayScroll}
              contentContainerStyle={s.dayRow}
            >
              {t.days.map((value, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setDay(index);
                    setNameDraft(
                      workouts.find((entry) => entry.day === index)?.name ?? "",
                    );
                    setItems([]);
                  }}
                  style={[s.day, day === index && s.dayActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: day === index }}
                >
                  <Text style={[s.dayLabel, day === index && s.dayTextActive]}>
                    {value}
                  </Text>
                  <Text style={[s.dayNum, day === index && s.dayTextActive]}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <ScrollView
              contentContainerStyle={s.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={s.kicker}>{t.dayNames[day].toUpperCase()}</Text>
              <Text style={s.sectionTitle}>
                {workout?.name || `${t.defaultWorkout} ${t.days[day]}`}
              </Text>
              <Text style={s.fieldLabel}>{t.workoutName}</Text>
              <View style={s.row}>
                <TextInput
                  selectionColor={colors.primary}
                  style={[s.input, s.flex]}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder={t.workoutPlaceholder}
                  placeholderTextColor={colors.placeholder}
                  maxLength={60}
                  onSubmitEditing={saveName}
                  accessibilityLabel={t.workoutName}
                />
                <Pressable
                  style={s.iconButton}
                  onPress={saveName}
                  disabled={busy}
                >
                  <Text style={s.iconButtonText}>✓</Text>
                </Pressable>
              </View>
              <Text style={[s.kicker, s.listTitle]}>
                {t.exercises} · {items.length}
              </Text>
              {items.length === 0 && (
                <View style={s.empty}>
                  <Text style={s.emptyIcon}>＋</Text>
                  <Text style={s.emptyTitle}>{t.emptyWorkout}</Text>
                  <Text style={s.subtitle}>{t.emptyWorkoutHint}</Text>
                </View>
              )}
              {items.map((item, index) => (
                <View key={item.id} style={s.exerciseCard}>
                  <View style={s.exerciseHead}>
                    <Text style={s.number}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <ExerciseArtwork
                      nameEn={item.name_en}
                      size={70}
                      onPress={() => openPreview(item.name_en, label(item))}
                      accessibilityLabel={`${t.viewExerciseDemo} ${label(item)}`}
                    />
                    <Text style={[s.itemName, s.flex]}>{label(item)}</Text>
                    <Pressable
                      onPress={() => confirmRemove(item)}
                      accessibilityLabel={t.remove}
                      hitSlop={12}
                    >
                      <Text style={s.remove}>×</Text>
                    </Pressable>
                  </View>
                  <View style={s.exerciseFoot}>
                    <Text style={s.count}>
                      {item.sets} <Text style={s.countLabel}>{t.sets}</Text>
                    </Text>
                    <Text style={s.count}>
                      {item.reps} <Text style={s.countLabel}>{t.reps}</Text>
                    </Text>
                    <Pressable
                      style={s.editLink}
                      onPress={() => {
                        setEditing(item);
                        setSetsDraft(String(item.sets));
                        setRepsDraft(String(item.reps));
                        setDialog("edit");
                      }}
                    >
                      <Text style={s.editText}>{t.edit} →</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <Pressable
                style={s.primary}
                onPress={() => {
                  setPickerSearch("");
                  setCustomExercise(false);
                  setCustomName("");
                  setDialog("pick");
                }}
              >
                <Text style={s.primaryText}>＋ {t.addExercise}</Text>
              </Pressable>
            </ScrollView>
          </>
        )}
        {(tab === "catalog" || tab === "gym") && (
          <ScrollView
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
          >
            <HeroHeading
              eyebrow={`${tab === "gym" ? t.myEquipment : t.catalog} · ${tab === "gym" ? owned.size : equipment.length}`}
              title={tab === "gym" ? t.gym : t.catalogTab}
              subtitle={tab === "gym" ? t.gymSubtitle : t.catalogSubtitle}
            />
            {tab === "gym" && (
              <Pressable
                style={s.inventoryAction}
                onPress={() => {
                  setEditingGym((value) => !value);
                  setSearch("");
                  setCategory("all");
                }}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={editingGym ? "check" : "pencil-outline"}
                  size={19}
                  color={colors.primary}
                />
                <Text style={s.inventoryActionText}>
                  {editingGym ? t.finishEditing : t.editEquipment}
                </Text>
              </Pressable>
            )}
            <TextInput
              selectionColor={colors.primary}
              style={[s.input, tab === "gym" && s.inventorySearch]}
              value={search}
              onChangeText={setSearch}
              placeholder={`⌕  ${t.searchEquipment}`}
              placeholderTextColor={colors.placeholder}
              accessibilityLabel={t.searchEquipment}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.categoryScroll}
              contentContainerStyle={s.categoryRow}
            >
              {categories.map((value) => (
                <Pressable
                  key={value}
                  style={[s.chip, category === value && s.chipActive]}
                  onPress={() => setCategory(value)}
                >
                  <Text
                    style={[s.chipText, category === value && s.chipTextActive]}
                  >
                    {t[value]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[s.kicker, s.listTitle]}>
              {tab === "gym" && !editingGym ? t.myEquipment : t.catalog} · {filteredEquipment.length}
            </Text>
            {tab === "gym" && !editingGym && owned.size === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>＋</Text>
                <Text style={s.emptyTitle}>{t.emptyGym}</Text>
                <Text style={s.subtitle}>{t.emptyGymHint}</Text>
              </View>
            )}
            {filteredEquipment.length === 0 &&
              !(tab === "gym" && !editingGym && owned.size === 0) && (
                <Text style={s.noResults}>{t.noResults}</Text>
              )}
            {filteredEquipment.map((entry) => (
              <Pressable
                key={entry.id}
                style={[
                  s.equipmentRow,
                  Boolean(entry.owned) && s.equipmentOwned,
                ]}
                onPress={() =>
                  mutate(() => setEquipmentOwned(db!, entry.id, !entry.owned))
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: Boolean(entry.owned) }}
                accessibilityLabel={label(entry)}
              >
                <View
                  style={[s.checkBox, Boolean(entry.owned) && s.checkBoxActive]}
                >
                  {entry.owned ? <Text style={s.checkText}>✓</Text> : null}
                </View>
                <EquipmentArtwork
                  nameEn={entry.name_en}
                  custom={Boolean(entry.custom)}
                  size={64}
                />
                <View style={s.flex}>
                  <Text style={s.itemName}>{label(entry)}</Text>
                  <Text style={s.meta}>
                    {entry.custom ? t.createEquipment : t[entry.category]}
                  </Text>
                </View>
                <Text style={s.plus}>{entry.owned ? "−" : "+"}</Text>
              </Pressable>
            ))}
            <Pressable
              style={s.outline}
              onPress={() => {
                setCustomName("");
                setDialog("equipment");
              }}
            >
              <Text style={s.outlineText}>＋ {t.createEquipment}</Text>
            </Pressable>
          </ScrollView>
        )}
        {tab === "settings" && (
          <ScrollView contentContainerStyle={s.content}>
            <HeroHeading
              eyebrow={t.app.toUpperCase()}
              title={t.settings}
              subtitle={t.settingsSubtitle}
            />
            <View style={s.settingsCard}>
              <Text style={s.itemName}>{t.language}</Text>
              <Text style={s.meta}>{t.languageHint}</Text>
              <View style={[s.row, { marginTop: 18 }]}>
                {(["pt", "en"] as Language[]).map((value) => (
                  <Pressable
                    key={value}
                    style={[
                      s.languageButton,
                      language === value && s.languageActive,
                    ]}
                    onPress={() =>
                      mutate(
                        () => saveLanguage(db!, value),
                        () => setLanguage(value),
                      )
                    }
                  >
                    <Text
                      style={[
                        s.languageText,
                        language === value && s.languageTextActive,
                      ]}
                    >
                      {value === "pt" ? t.portuguese : t.english}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Text style={s.offline}>{t.offline}</Text>
            <Text style={s.artworkCredit}>{t.artworkCredit}</Text>
            <View style={s.artworkLinks}>
              <Link
                href="https://github.com/bryllim/workout-guide"
                style={s.artworkLink}
              >
                Workout Guide
              </Link>
              <Text style={s.artworkCredit}> · </Text>
              <Link
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                style={s.artworkLink}
              >
                {t.artworkLicense}
              </Link>
            </View>
          </ScrollView>
        )}
      </View>
      <View
        style={[
          s.tabBar,
          {
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {(["plan", "catalog", "gym", "settings"] as Tab[]).map((value) => (
          <Pressable
            key={value}
            style={[s.tab, tab === value && s.tabActive]}
            onPress={() => {
              if (value !== tab)
                router.replace(
                  value === "plan"
                    ? "/"
                    : value === "catalog"
                      ? "/catalog"
                    : value === "gym"
                      ? "/gym"
                      : "/settings",
                );
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
          >
            <MaterialCommunityIcons
              name={
                value === "plan"
                  ? "calendar-week"
                  : value === "catalog"
                    ? "view-grid-outline"
                  : value === "gym"
                    ? "dumbbell"
                    : "cog-outline"
              }
              size={22}
              color={tab === value ? colors.primary : colors.muted}
            />
            <Text style={[s.tabLabel, tab === value && s.tabSelected]}>
              {value === "catalog" ? t.catalogTab : t[value]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Modal
        visible={dialog !== null}
        transparent
        animationType="slide"
        onRequestClose={closeDialog}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.overlay}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>
                {dialog === "preview"
                  ? t.exerciseDemo
                  : dialog === "pick"
                  ? customExercise
                    ? t.customExercise
                    : t.chooseExercise
                  : dialog === "equipment"
                    ? t.createEquipment
                    : t.edit}
              </Text>
              <Pressable
                onPress={closeDialog}
                accessibilityLabel={t.cancel}
              >
                <Text style={s.close}>×</Text>
              </Pressable>
            </View>
            {dialog === "preview" && preview && (
              <View>
                <Text style={s.demoName}>{preview.title}</Text>
                <AnimatedImage
                  source={getExerciseAnimation(preview.nameEn)}
                  style={s.demoImage}
                  contentFit="contain"
                  accessibilityLabel={`${t.exerciseDemo}: ${preview.title}`}
                />
                <Text style={s.demoCredit}>{t.demoCredit}</Text>
                <View style={s.artworkLinks}>
                  <Link
                    href="https://github.com/bryllim/workout-guide"
                    style={s.artworkLink}
                  >
                    Workout Guide
                  </Link>
                  <Text style={s.artworkCredit}> · </Text>
                  <Link
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    style={s.artworkLink}
                  >
                    {t.artworkLicense}
                  </Link>
                </View>
              </View>
            )}
            {dialog === "pick" &&
              (customExercise ? (
                <>
                  <Text style={s.hint}>{t.customExerciseHint}</Text>
                  <TextInput
                    selectionColor={colors.primary}
                    style={s.input}
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder={t.exerciseName}
                    maxLength={80}
                    autoFocus
                  />
                  <Pressable
                    style={s.primary}
                    onPress={addCustomExercise}
                    disabled={busy}
                  >
                    <Text style={s.primaryText}>{t.add}</Text>
                  </Pressable>
                  <Pressable
                    style={s.cancelButton}
                    onPress={() => setCustomExercise(false)}
                  >
                    <Text style={s.meta}>{t.cancel}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    selectionColor={colors.primary}
                    style={s.input}
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                    placeholder={`⌕  ${t.searchExercise}`}
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={t.searchExercise}
                  />
                  <Pressable
                    style={[s.pickerFilter, onlyMyGym && s.chipActive]}
                    onPress={() => setOnlyMyGym((value) => !value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: onlyMyGym }}
                  >
                    <Text style={[s.chipText, onlyMyGym && s.chipTextActive]}>
                      {t.onlyMyGym}
                    </Text>
                  </Pressable>
                  <ScrollView
                    style={s.pickerList}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredExercises.map((entry) => (
                      <Pressable
                        key={entry.id}
                        style={s.pickerRow}
                        onPress={() => addExercise(entry.id)}
                        disabled={busy}
                      >
                        <ExerciseArtwork
                          nameEn={entry.name_en}
                          size={68}
                          onPress={() => openPreview(entry.name_en, label(entry))}
                          accessibilityLabel={`${t.viewExerciseDemo} ${label(entry)}`}
                        />
                        <View style={s.flex}>
                          <Text style={s.itemName}>{label(entry)}</Text>
                          {entry.equipment_id &&
                          owned.has(entry.equipment_id) ? (
                            <Text style={s.available}>✓ {t.available}</Text>
                          ) : null}
                        </View>
                        <Text style={s.plus}>＋</Text>
                      </Pressable>
                    ))}
                    {filteredExercises.length === 0 && (
                      <Text style={s.noResults}>{t.noResults}</Text>
                    )}
                  </ScrollView>
                  <Pressable
                    style={s.outline}
                    onPress={() => setCustomExercise(true)}
                  >
                    <Text style={s.outlineText}>＋ {t.createExercise}</Text>
                  </Pressable>
                </>
              ))}
            {dialog === "equipment" && (
              <>
                <TextInput
                  selectionColor={colors.primary}
                  style={s.input}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder={t.equipmentName}
                  maxLength={80}
                  autoFocus
                />
                <Pressable
                  style={s.primary}
                  onPress={addCustomEquipment}
                  disabled={busy}
                >
                  <Text style={s.primaryText}>{t.add}</Text>
                </Pressable>
              </>
            )}
            {dialog === "edit" && (
              <>
                <Text style={s.hint}>{editing ? label(editing) : ""}</Text>
                <View style={s.row}>
                  <View style={s.flex}>
                    <Text style={s.fieldLabel}>{t.sets}</Text>
                    <TextInput
                      selectionColor={colors.primary}
                      style={s.input}
                      value={setsDraft}
                      onChangeText={setSetsDraft}
                      keyboardType="number-pad"
                      maxLength={2}
                      accessibilityLabel={t.sets}
                    />
                  </View>
                  <View style={s.flex}>
                    <Text style={s.fieldLabel}>{t.reps}</Text>
                    <TextInput
                      selectionColor={colors.primary}
                      style={s.input}
                      value={repsDraft}
                      onChangeText={setRepsDraft}
                      keyboardType="number-pad"
                      maxLength={3}
                      accessibilityLabel={t.reps}
                    />
                  </View>
                </View>
                <Pressable style={s.primary} onPress={saveItem} disabled={busy}>
                  <Text style={s.primaryText}>{t.save}</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
