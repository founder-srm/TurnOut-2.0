import '../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '/(drawer)/scanner',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
        <Stack.Screen name="developer" options={{ title: 'Developers' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="options" options={{ title: 'Options' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
