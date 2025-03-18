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
import { Platform, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ajout pour le dégradé
import { useOrientation } from '@/hooks/useOrientation';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  const isLandscape = orientation === 'landscape';
  const tabBarHeight =
    Platform.OS === 'ios' ? (isLandscape ? 68 : 88) : isLandscape ? 58 : 78; // Légère augmentation pour élégance
  const paddingBottom = Platform.OS === 'ios' ? (isLandscape ? 8 : 28) : 10;

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
          backgroundColor: '#1A1B1F',
        }}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
      >
        <Animated.Image
          source={require('@/assets/images/melodix.png')}
          style={[
            {
              width: 300,
              height: 300,
              borderRadius: 150,
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
            height: tabBarHeight,
            paddingBottom: paddingBottom,
            paddingTop: 10,
            borderTopLeftRadius: 20, // Bordures arrondies en haut
            borderTopRightRadius: 20,
            backgroundColor: 'transparent', // Nécessaire pour le dégradé
            position: 'absolute', // Flottement au-dessus du contenu
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 8, // Ombre Android
            shadowColor: '#000', // Ombre iOS
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            borderTopWidth: 0, // Supprime la bordure par défaut
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#4A148C', '#311B92', '#1A237E']} // Dégradé élégant
              style={{
                flex: 1,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
          ),
          tabBarActiveTintColor: '#FFFFFF', // Couleur des icônes/labels actifs (blanc pour contraste)
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Inactifs avec opacité
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            marginBottom: 5,
          },
          tabBarIconStyle: {
            marginTop: isLandscape ? 0 : 6,
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
