import type { ComponentProps } from "react";
import { Image, View } from "react-native";
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
}: {
  nameEn: string;
  size?: number;
}) {
  const source = artworkByExercise[nameEn];

  return (
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
    </View>
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
