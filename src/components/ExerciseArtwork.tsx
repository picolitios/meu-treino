import type { ComponentProps } from "react";
import { Image, Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { catalog } from "../catalog";
import { s } from "../styles";
import { colors } from "../theme";

// Relaciona cada aparelho inicial à pose do exercício cadastrado com ele.
const exerciseByEquipment = new Map(
  catalog.map(([, , equipmentEn, , exerciseEn]) => [equipmentEn, exerciseEn]),
);

// Associa cada exercício inicial a uma pose local representativa do movimento.
const artworkByExercise: Record<string, number> = {
  "Machine chest press": require("../../assets/exercises/machine-chest-press.png"),
  "Incline machine press": require("../../assets/exercises/incline-bench-press.png"),
  "Decline machine press": require("../../assets/exercises/decline-bench-press.png"),
  "Pec deck fly": require("../../assets/exercises/pec-deck.png"),
  "Reverse pec deck fly": require("../../assets/exercises/reverse-pec-deck.png"),
  "Machine shoulder press": require("../../assets/exercises/machine-shoulder-press.png"),
  "Machine lateral raise": require("../../assets/exercises/machine-lateral-raise.png"),
  "Lat pulldown": require("../../assets/exercises/lat-pulldown.png"),
  "Seated row": require("../../assets/exercises/seated-row.png"),
  "Plate-loaded row": require("../../assets/exercises/machine-row.png"),
  "Machine pullover": require("../../assets/exercises/straight-arm-pulldown.png"),
  "Assisted pull-up": require("../../assets/exercises/assisted-pull-up.png"),
  "Assisted dip": require("../../assets/exercises/assisted-dip.png"),
  "Machine biceps curl": require("../../assets/exercises/bicep-curl.png"),
  "Machine triceps extension": require("../../assets/exercises/overhead-tricep-extension.png"),
  "45-degree leg press": require("../../assets/exercises/leg-press.png"),
  "Horizontal leg press": require("../../assets/exercises/leg-press.png"),
  "Hack squat": require("../../assets/exercises/hack-squat.png"),
  "Smith machine squat": require("../../assets/exercises/smith-machine-squat.png"),
  "Pendulum squat": require("../../assets/exercises/squat.png"),
  "Leg extension": require("../../assets/exercises/leg-extension.png"),
  "Lying leg curl": require("../../assets/exercises/lying-leg-curl.png"),
  "Seated leg curl": require("../../assets/exercises/seated-leg-curl.png"),
  "Hip abduction": require("../../assets/exercises/hip-abduction-machine.png"),
  "Hip adduction": require("../../assets/exercises/hip-adduction-machine.png"),
  "Machine glute kickback": require("../../assets/exercises/machine-glute-kickback.png"),
  "Machine hip thrust": require("../../assets/exercises/smith-machine-hip-thrust.png"),
  "Seated calf raise": require("../../assets/exercises/seated-calf-raise.png"),
  "Standing calf raise": require("../../assets/exercises/standing-calf-raise.png"),
  "Back extension": require("../../assets/exercises/back-extension.png"),
  "Machine crunch": require("../../assets/exercises/crunch.png"),
  "Torso rotation": require("../../assets/exercises/russian-twist.png"),
  "Dumbbell curl": require("../../assets/exercises/bicep-curl.png"),
  "Deadlift": require("../../assets/exercises/deadlift.png"),
  "EZ bar curl": require("../../assets/exercises/ez-bar-curl.png"),
  "Trap bar deadlift": require("../../assets/exercises/trap-bar-deadlift.png"),
  "Plate front raise": require("../../assets/exercises/plate-front-raise.png"),
  "Kettlebell swing": require("../../assets/exercises/kettlebell-swing.png"),
  "Dumbbell bench press": require("../../assets/exercises/dumbbell-bench-press.png"),
  "Incline dumbbell press": require("../../assets/exercises/incline-dumbbell-press.png"),
  "Preacher curl": require("../../assets/exercises/preacher-curl.png"),
  "Roman chair back extension": require("../../assets/exercises/back-extension.png"),
  "Barbell squat": require("../../assets/exercises/squat.png"),
  "Barbell bench press": require("../../assets/exercises/bench-press.png"),
  "Pull-up": require("../../assets/exercises/pull-up.png"),
  "Parallel bar dip": require("../../assets/exercises/dip.png"),
  "Ring row": require("../../assets/exercises/inverted-row.png"),
  "Platform deadlift": require("../../assets/exercises/deadlift.png"),
  "Cable crossover fly": require("../../assets/exercises/cable-fly.png"),
  "Cable triceps pushdown": require("../../assets/exercises/tricep-pushdown.png"),
  "Low cable curl": require("../../assets/exercises/cable-curl.png"),
  "Cable lateral raise": require("../../assets/exercises/cable-lateral-raise.png"),
  "Rope triceps pushdown": require("../../assets/exercises/rope-tricep-pushdown.png"),
  "Straight-bar pulldown": require("../../assets/exercises/straight-arm-pulldown.png"),
  "V-bar cable row": require("../../assets/exercises/seated-row.png"),
  "Neutral grip pulldown": require("../../assets/exercises/close-grip-lat-pulldown.png"),
  "Cable kickback": require("../../assets/exercises/cable-kickback.png"),
  "Treadmill walk": require("../../assets/exercises/walking.png"),
  "Stationary cycling": require("../../assets/exercises/cycling.png"),
  "Recumbent cycling": require("../../assets/exercises/cycling.png"),
  "Spinning": require("../../assets/exercises/cycling.png"),
  "Elliptical training": require("../../assets/exercises/elliptical.png"),
  "Indoor rowing": require("../../assets/exercises/rowing.png"),
  "Stair climbing": require("../../assets/exercises/stair-climber.png"),
  "Ski erg": require("../../assets/exercises/skierg.png"),
  "Air bike": require("../../assets/exercises/assault-bike.png"),
  "Curved treadmill run": require("../../assets/exercises/running.png"),
  "Plank": require("../../assets/exercises/plank.png"),
  "Resistance band row": require("../../assets/exercises/banded-row.png"),
  "Mini band lateral walk": require("../../assets/exercises/banded-lateral-walk.png"),
  "Suspension row": require("../../assets/exercises/inverted-row.png"),
  "Stability ball crunch": require("../../assets/exercises/crunch.png"),
  "BOSU squat": require("../../assets/exercises/bodyweight-squat.png"),
  "Step-up": require("../../assets/exercises/step-up.png"),
  "Box jump": require("../../assets/exercises/jump-squat.png"),
  "Jump rope": require("../../assets/exercises/jump-rope.png"),
  "Battle rope waves": require("../../assets/exercises/battle-ropes.png"),
  "Sliding lunge": require("../../assets/exercises/reverse-lunge.png"),
};

// Liga cada pose estática ao GIF local derivado da mesma coleção licenciada.
const animationByArtwork = new Map<number, number>([
  [require("../../assets/exercises/assault-bike.png"), require("../../assets/exercise-gifs/assault-bike.gif")],
  [require("../../assets/exercises/assisted-dip.png"), require("../../assets/exercise-gifs/assisted-dip.gif")],
  [require("../../assets/exercises/assisted-pull-up.png"), require("../../assets/exercise-gifs/assisted-pull-up.gif")],
  [require("../../assets/exercises/back-extension.png"), require("../../assets/exercise-gifs/back-extension.gif")],
  [require("../../assets/exercises/banded-lateral-walk.png"), require("../../assets/exercise-gifs/banded-lateral-walk.gif")],
  [require("../../assets/exercises/banded-row.png"), require("../../assets/exercise-gifs/banded-row.gif")],
  [require("../../assets/exercises/battle-ropes.png"), require("../../assets/exercise-gifs/battle-ropes.gif")],
  [require("../../assets/exercises/bench-press.png"), require("../../assets/exercise-gifs/bench-press.gif")],
  [require("../../assets/exercises/bicep-curl.png"), require("../../assets/exercise-gifs/bicep-curl.gif")],
  [require("../../assets/exercises/bodyweight-squat.png"), require("../../assets/exercise-gifs/bodyweight-squat.gif")],
  [require("../../assets/exercises/cable-curl.png"), require("../../assets/exercise-gifs/cable-curl.gif")],
  [require("../../assets/exercises/cable-fly.png"), require("../../assets/exercise-gifs/cable-fly.gif")],
  [require("../../assets/exercises/cable-kickback.png"), require("../../assets/exercise-gifs/cable-kickback.gif")],
  [require("../../assets/exercises/cable-lateral-raise.png"), require("../../assets/exercise-gifs/cable-lateral-raise.gif")],
  [require("../../assets/exercises/close-grip-lat-pulldown.png"), require("../../assets/exercise-gifs/close-grip-lat-pulldown.gif")],
  [require("../../assets/exercises/crunch.png"), require("../../assets/exercise-gifs/crunch.gif")],
  [require("../../assets/exercises/cycling.png"), require("../../assets/exercise-gifs/cycling.gif")],
  [require("../../assets/exercises/deadlift.png"), require("../../assets/exercise-gifs/deadlift.gif")],
  [require("../../assets/exercises/decline-bench-press.png"), require("../../assets/exercise-gifs/decline-bench-press.gif")],
  [require("../../assets/exercises/dip.png"), require("../../assets/exercise-gifs/dip.gif")],
  [require("../../assets/exercises/dumbbell-bench-press.png"), require("../../assets/exercise-gifs/dumbbell-bench-press.gif")],
  [require("../../assets/exercises/elliptical.png"), require("../../assets/exercise-gifs/elliptical.gif")],
  [require("../../assets/exercises/ez-bar-curl.png"), require("../../assets/exercise-gifs/ez-bar-curl.gif")],
  [require("../../assets/exercises/hack-squat.png"), require("../../assets/exercise-gifs/hack-squat.gif")],
  [require("../../assets/exercises/hip-abduction-machine.png"), require("../../assets/exercise-gifs/hip-abduction-machine.gif")],
  [require("../../assets/exercises/hip-adduction-machine.png"), require("../../assets/exercise-gifs/hip-adduction-machine.gif")],
  [require("../../assets/exercises/incline-bench-press.png"), require("../../assets/exercise-gifs/incline-bench-press.gif")],
  [require("../../assets/exercises/incline-dumbbell-press.png"), require("../../assets/exercise-gifs/incline-dumbbell-press.gif")],
  [require("../../assets/exercises/inverted-row.png"), require("../../assets/exercise-gifs/inverted-row.gif")],
  [require("../../assets/exercises/jump-rope.png"), require("../../assets/exercise-gifs/jump-rope.gif")],
  [require("../../assets/exercises/jump-squat.png"), require("../../assets/exercise-gifs/jump-squat.gif")],
  [require("../../assets/exercises/kettlebell-swing.png"), require("../../assets/exercise-gifs/kettlebell-swing.gif")],
  [require("../../assets/exercises/lat-pulldown.png"), require("../../assets/exercise-gifs/lat-pulldown.gif")],
  [require("../../assets/exercises/leg-extension.png"), require("../../assets/exercise-gifs/leg-extension.gif")],
  [require("../../assets/exercises/leg-press.png"), require("../../assets/exercise-gifs/leg-press.gif")],
  [require("../../assets/exercises/lying-leg-curl.png"), require("../../assets/exercise-gifs/lying-leg-curl.gif")],
  [require("../../assets/exercises/machine-chest-press.png"), require("../../assets/exercise-gifs/machine-chest-press.gif")],
  [require("../../assets/exercises/machine-glute-kickback.png"), require("../../assets/exercise-gifs/machine-glute-kickback.gif")],
  [require("../../assets/exercises/machine-lateral-raise.png"), require("../../assets/exercise-gifs/machine-lateral-raise.gif")],
  [require("../../assets/exercises/machine-row.png"), require("../../assets/exercise-gifs/machine-row.gif")],
  [require("../../assets/exercises/machine-shoulder-press.png"), require("../../assets/exercise-gifs/machine-shoulder-press.gif")],
  [require("../../assets/exercises/overhead-tricep-extension.png"), require("../../assets/exercise-gifs/overhead-tricep-extension.gif")],
  [require("../../assets/exercises/pec-deck.png"), require("../../assets/exercise-gifs/pec-deck.gif")],
  [require("../../assets/exercises/plank.png"), require("../../assets/exercise-gifs/plank.gif")],
  [require("../../assets/exercises/plate-front-raise.png"), require("../../assets/exercise-gifs/plate-front-raise.gif")],
  [require("../../assets/exercises/preacher-curl.png"), require("../../assets/exercise-gifs/preacher-curl.gif")],
  [require("../../assets/exercises/pull-up.png"), require("../../assets/exercise-gifs/pull-up.gif")],
  [require("../../assets/exercises/reverse-lunge.png"), require("../../assets/exercise-gifs/reverse-lunge.gif")],
  [require("../../assets/exercises/reverse-pec-deck.png"), require("../../assets/exercise-gifs/reverse-pec-deck.gif")],
  [require("../../assets/exercises/rope-tricep-pushdown.png"), require("../../assets/exercise-gifs/rope-tricep-pushdown.gif")],
  [require("../../assets/exercises/rowing.png"), require("../../assets/exercise-gifs/rowing.gif")],
  [require("../../assets/exercises/running.png"), require("../../assets/exercise-gifs/running.gif")],
  [require("../../assets/exercises/russian-twist.png"), require("../../assets/exercise-gifs/russian-twist.gif")],
  [require("../../assets/exercises/seated-calf-raise.png"), require("../../assets/exercise-gifs/seated-calf-raise.gif")],
  [require("../../assets/exercises/seated-leg-curl.png"), require("../../assets/exercise-gifs/seated-leg-curl.gif")],
  [require("../../assets/exercises/seated-row.png"), require("../../assets/exercise-gifs/seated-row.gif")],
  [require("../../assets/exercises/skierg.png"), require("../../assets/exercise-gifs/skierg.gif")],
  [require("../../assets/exercises/smith-machine-hip-thrust.png"), require("../../assets/exercise-gifs/smith-machine-hip-thrust.gif")],
  [require("../../assets/exercises/smith-machine-squat.png"), require("../../assets/exercise-gifs/smith-machine-squat.gif")],
  [require("../../assets/exercises/squat.png"), require("../../assets/exercise-gifs/squat.gif")],
  [require("../../assets/exercises/stair-climber.png"), require("../../assets/exercise-gifs/stair-climber.gif")],
  [require("../../assets/exercises/standing-calf-raise.png"), require("../../assets/exercise-gifs/standing-calf-raise.gif")],
  [require("../../assets/exercises/step-up.png"), require("../../assets/exercise-gifs/step-up.gif")],
  [require("../../assets/exercises/straight-arm-pulldown.png"), require("../../assets/exercise-gifs/straight-arm-pulldown.gif")],
  [require("../../assets/exercises/trap-bar-deadlift.png"), require("../../assets/exercise-gifs/trap-bar-deadlift.gif")],
  [require("../../assets/exercises/tricep-pushdown.png"), require("../../assets/exercise-gifs/tricep-pushdown.gif")],
  [require("../../assets/exercises/walking.png"), require("../../assets/exercise-gifs/walking.gif")],
]);

// Retorna apenas demonstrações com quadros licenciados disponíveis no pacote.
export function getExerciseAnimation(nameEn: string) {
  const artwork = artworkByExercise[nameEn];
  return artwork ? animationByArtwork.get(artwork) : undefined;
}

// Usa pictogramas específicos quando não há uma pose fiel na coleção licenciada.
const iconByExercise: Record<
  string,
  ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  "Medicine ball throw": "basketball",
  "Bag punches": "boxing-glove",
  "Foam rolling": "yoga",
  "Balance disc stand": "human",
  "Sled push": "arrow-right-bold",
};

// Exibe a pose correspondente; exercícios criados pelo usuário recebem um símbolo neutro.
export function ExerciseArtwork({
  nameEn,
  size = 58,
  onPress,
  accessibilityLabel,
}: {
  nameEn: string;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const source = artworkByExercise[nameEn];
  const canPreview = Boolean(onPress && getExerciseAnimation(nameEn));

  const artwork = (
    <View style={[s.artworkTile, { width: size, height: size }]}>
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <MaterialCommunityIcons
          name={iconByExercise[nameEn] ?? "dumbbell"}
          size={size * 0.48}
          color={colors.lilac}
        />
      )}
      {canPreview && (
        <View style={s.artworkPlayBadge} pointerEvents="none">
          <MaterialCommunityIcons name="play" size={15} color={colors.white} />
        </View>
      )}
    </View>
  );

  if (!canPreview) return artwork;

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      {artwork}
    </Pressable>
  );
}

// Mostra a pose correspondente ao aparelho; itens criados pelo usuário usam um símbolo neutro.
export function EquipmentArtwork({
  nameEn,
  custom,
  size = 64,
}: {
  nameEn: string;
  custom: boolean;
  size?: number;
}) {
  return (
    <ExerciseArtwork
      nameEn={custom ? "" : (exerciseByEquipment.get(nameEn) ?? "")}
      size={size}
    />
  );
}
