import '../global.css';

import { useCameraPermissions } from 'expo-camera';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { MoreHorizontal, QrCode } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CustomSupabaseError from '../components/CustomSupabaseError';

import { supabase } from '~/utils/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

interface AnimatedIconProps {
  focused: boolean;
  color: string;
  IconComponent: React.ComponentType<any>;
  label: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ focused, color, IconComponent, label }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      animatedValue.setValue(0); // Reset the value
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [focused]);

  const circleScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const underlineWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  return (
    <View style={styles.iconLabelContainer}>
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.iconBackground,
            {
              transform: [{ scale: circleScale }],
              backgroundColor: '#FDB623',
            },
          ]}
        />
        <IconComponent color={focused ? '#000' : '#fff'} size={28} />
      </View>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      <Animated.View
        style={[
          styles.underline,
          {
            backgroundColor: color,
            width: underlineWidth,
          },
        ]}
      />
    </View>
  );
};

export default function RootLayout() {
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
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#FDB623',
          tabBarInactiveTintColor: 'white',
          tabBarStyle: {
            backgroundColor: '#333',
            borderTopWidth: 0,
            height: 90,
            width: '100%',
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.7,
            shadowRadius: 8,
            bottom: 0,
            left: '10%',
            borderRadius: 15,
            paddingTop: 25,
            alignItems: 'center',
          },
          tabBarLabel: () => null,
          tabBarIcon: ({ focused, color }) => {
            const IconComponent = route.name === 'scanner' ? QrCode : MoreHorizontal;
            const label = route.name === 'scanner' ? 'Scanner' : 'More';
            return (
              <AnimatedIcon
                focused={focused}
                color={color}
                IconComponent={IconComponent}
                label={label}
              />
            );
          },
        })}>
        <Tabs.Screen name="scanner" options={{ href: '/scanner', title: 'Scanner' }} />
        <Tabs.Screen name="more" options={{ href: '/more', title: 'More' }} />
      </Tabs>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  iconLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
  },
  underline: {
    height: 2,
    position: 'absolute',
    bottom: -10,
  },
});
