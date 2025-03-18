import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useColorScheme, useThemeStore } from '@/stores/themeStore';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Platform, View, StyleSheet } from 'react-native';
import { PageContainer } from '@/components/PageContainer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeOut, SlideOutUp } from 'react-native-reanimated';
import { Logo } from '@/components/Logo';
import { useAudioStore } from '@/stores/audioStore';
import { Audio } from 'expo-av';

// Configure notifications for background playback
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      presentationOptions: ['banner'],
    }),
  });

  // Configure notification categories for playback controls
  Notifications.setNotificationCategoryAsync('playback', [
    {
      identifier: 'previous',
      buttonTitle: 'Previous',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      }
    },
    {
      identifier: 'play',
      buttonTitle: 'Play',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      }
    },
    {
      identifier: 'pause',
      buttonTitle: 'Pause',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      }
    },
    {
      identifier: 'next',
      buttonTitle: 'Next',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      }
    }
  ]);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { playNext, playPrevious } = useAudioStore();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function setupAudio() {
      if (Platform.OS !== 'web') {
        try {
          // Configure audio session for background playback
          await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        } catch (error) {
          console.error('Error configuring audio mode:', error);
        }
      }
    }

    setupAudio();
  }, []);

  useEffect(() => {
    async function setupPermissions() {
      if (Platform.OS === 'web') {
        setPermissionsGranted(true);
        return;
      }

      try {
        // Request Media Library permissions
        const mediaPermission = await MediaLibrary.requestPermissionsAsync();
        
        // Request Notification permissions
        const notificationPermission = await Notifications.requestPermissionsAsync();

        // Set up notification response handler
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
          const actionId = response.actionIdentifier;
          
          // Handle playback control actions
          switch (actionId) {
            case 'previous':
              playPrevious();
              break;
            case 'play':
            case 'pause':
              handlePlayPause();
              break;
            case 'next':
              playNext();
              break;
          }
        });

        setPermissionsGranted(
          mediaPermission.status === 'granted' && 
          notificationPermission.status === 'granted'
        );

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error requesting permissions:', error);
        setPermissionsGranted(false);
      }
    }

    setupPermissions();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && permissionsGranted) {
      setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [fontsLoaded, fontError, permissionsGranted]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!permissionsGranted && Platform.OS !== 'web') {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PageContainer>
        {showSplash && (
          <Animated.View 
            style={[
              styles.splashContainer,
              { backgroundColor: '#000000' }
            ]}
            exiting={Platform.OS === 'web' ? FadeOut.duration(800) : SlideOutUp.duration(800)}
          >
            <Logo size={120} showBackground={false} />
          </Animated.View>
        )}
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PageContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});