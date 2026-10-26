import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mantém a área segura e a navegação de todas as telas em um único layout.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </SafeAreaProvider>
  );
}
