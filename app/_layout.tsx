import '../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BackButton from '~/components/BackButton';

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
        <Stack.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            headerShown: false,
            headerStyle: { backgroundColor: '#333333' },
            headerTitleStyle: { color: '#f0f0f0' },
            headerLeft: () => <BackButton />,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen name="developer" options={{ title: 'Developers' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="options" options={{ title: 'Options' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
