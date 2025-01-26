import React, { useState, useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';

export default function Home() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  const dragY = useSharedValue(0);
  const dragOpacity = useSharedValue(1);
  const blackBoxHeight = useSharedValue(0);

  const resetStates = () => {
    dragY.value = 0;
    dragOpacity.value = 1;
    blackBoxHeight.value = 0;
  };

  const navigateToTabs = () => {
    runOnJS(resetStates)();
    router.push('/(drawer)');
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = e.translationY;
      dragOpacity.value = Math.max(0, 1 - Math.abs(e.translationY) / 300);
    })
    .onEnd((e) => {
      if (e.translationY < -100) {
        dragY.value = withSpring(-300, {}, (finished) => {
          if (finished) {
            runOnJS(navigateToTabs)();
          }
        });
      } else {
        dragY.value = withSpring(0);
        dragOpacity.value = withSpring(1);
      }
    });

  // Animate the entry height of the black section
  useEffect(() => {
    blackBoxHeight.value = withSpring(300); // Target height
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
    opacity: dragOpacity.value,
  }));

  const animatedBlackBoxStyles = useAnimatedStyle(() => ({
    height: blackBoxHeight.value, // Animate height
  }));

  return (
    <View className="flex-1 bg-[#FDB623] justify-between items-center">
      {/* QR Code Section */}
      <MotiView
        className="flex-1 justify-center items-center"
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <Image
          source={require('../assets/Group 10 (1).png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </MotiView>

      {/* Animated Bottom Black Box */}
      <Animated.View
        style={[
          animatedBlackBoxStyles, // Apply animated height styles
          {
            backgroundColor: '#333333',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.7,
            shadowRadius: 10,
            elevation: 10,
            paddingTop: 20,
            paddingBottom: 20,
            width: '100%',
          },
        ]}
      >
        {/* Drag Handle */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              {
                backgroundColor: 'white',
                width: 100,
                height: 5,
                borderRadius: 10,
                marginBottom: 30,
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              },
              animatedStyles,
            ]}
          />
        </GestureDetector>

        {/* Title & Description */}
        <Text className="text-white font-bold text-lg text-center mt-2">
          Get Started
        </Text>
        <Text className="text-white text-center text-sm mt-2 opacity-80 px-4">
          Go and enjoy our features for free and make your life easy with us.
        </Text>

        {/* Button */}
        <AnimatePresence>
          {showButton && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <TouchableOpacity
                className="bg-[#FDB623] rounded-xl py-3 px-[86px] mt-5 flex-row items-center"
                activeOpacity={0.8}
                onPress={() => router.push('/(drawer)')}
              >
                <Text className="text-black font-bold mr-2">Let’s Start</Text>
                <Text className="text-black text-lg">→</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      </Animated.View>

      {/* Trigger Button Visibility */}
      <View className="absolute bottom-10" onLayout={() => setShowButton(true)} />
    </View>
  );
}
