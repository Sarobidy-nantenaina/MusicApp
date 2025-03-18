import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  Music,
  Play,
  ListMusic,
  Heart,
} from 'lucide-react-native';
import { useColorScheme } from '@/stores/themeStore';
import { Platform, useWindowDimensions, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useOrientation } from '@/hooks/useOrientation';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const TAB_ROUTES = [
  { name: 'index', title: 'Home', icon: Home },
  { name: 'audio', title: 'Library', icon: Music },
  { name: 'favorites', title: 'Favorites', icon: Heart },
  { name: 'playlists', title: 'Playlists', icon: ListMusic },
  { name: 'player', title: 'Now Playing', icon: Play },
];

export default function TabLayout() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  const isLandscape = orientation === 'landscape';
  const tabBarHeight =
    Platform.OS === 'ios' ? (isLandscape ? 68 : 88) : isLandscape ? 58 : 68;
  const paddingBottom = Platform.OS === 'ios' ? (isLandscape ? 8 : 28) : 8;

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
    scale.value = withTiming(1.1, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    });

    setTimeout(() => {
      setSplashVisible(false);
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  if (isSplashVisible) {
    return (
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1A1B1F', // Fond du splash screen
        }}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
      >
        <Animated.Image
          source={require('@/assets/images/melodix.png')} // Image avec fond transparent
          style={[
            {
              width: 300,
              height: 300,
              borderRadius: 150, // Garde le cercle pour le texte
            },
            animatedStyle,
          ]}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{ flex: 1 }}
      entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark
              ? 'rgba(28, 28, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: tabBarHeight,
            paddingBottom: paddingBottom,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8E8E93',
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: isLandscape ? 0 : 4,
          },
        }}
      >
        {TAB_ROUTES.map((route) => (
          <Tabs.Screen
            key={route.name}
            name={route.name}
            options={{
              title: route.title,
              tabBarIcon: ({ color, size }) => (
                <route.icon
                  color={color}
                  size={isLandscape ? size - 2 : size}
                  strokeWidth={2.5}
                />
              ),
            }}
            listeners={{}}
          />
        ))}
      </Tabs>
    </Animated.View>
  );
}
