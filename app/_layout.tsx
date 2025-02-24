import { useCameraPermissions } from 'expo-camera';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CustomSupabaseError from '~/components/CustomSupabaseError';
import { supabase } from '~/utils/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Todo: Check:
        // supabase connection
        // camera permissions

        requestPermission();
        const { error } = await supabase.from('eventsregistrations').select('*').limit(1);
        if (error) {
          setSupabaseError(error.message);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (supabaseError) {
    return <CustomSupabaseError error={supabaseError} />;
  }

  if (!permission?.granted) {
    return <Text>You must grant camera permission to use this app.</Text>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
