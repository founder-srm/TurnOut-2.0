
  import '../global.css';





import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { Header } from 'react-native/Libraries/NewAppScreen';





export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(drawer)",
};

export default function RootLayout() {
  

  	return (
    	
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="(drawer)" options={{ title: 'More' }} />
        </Stack>
      </GestureHandlerRootView>
      
  );
}