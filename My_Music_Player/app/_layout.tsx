import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useColorScheme } from '@/stores/themeStore';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Platform, View, StyleSheet, AppState } from 'react-native';
import { PageContainer } from '@/components/PageContainer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeOut, SlideOutUp } from 'react-native-reanimated';
import { Logo } from '@/components/Logo';
import { useAudioStore } from '@/stores/audioStore';
import { Audio } from 'expo-av';

// Couleurs du thème (tirées de PageContainer)
const THEME_COLORS = ['#4A148C', '#311B92', '#1A237E'];

// Configuration des notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  Notifications.setNotificationCategoryAsync('playback', [
    {
      identifier: 'previous',
      buttonTitle: 'Précédent',
      options: { isDestructive: false },
    },
    {
      identifier: 'play',
      buttonTitle: 'Lecture',
      options: { isDestructive: false },
    },
    {
      identifier: 'pause',
      buttonTitle: 'Pause',
      options: { isDestructive: false },
    },
    {
      identifier: 'next',
      buttonTitle: 'Suivant',
      options: { isDestructive: false },
    },
    {
      identifier: 'stop',
      buttonTitle: 'Arrêter',
      options: { isDestructive: true },
    },
  ]);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const {
    isPlaying,
    currentTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    stop,
    setPlaylist,
    sound,
  } = useAudioStore();

  const [notificationId, setNotificationId] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Configurer le mode audio
  useEffect(() => {
    async function setupAudio() {
      if (Platform.OS !== 'web') {
        try {
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

  // Charger la playlist initiale
  useEffect(() => {
    async function loadInitialPlaylist() {
      if (Platform.OS === 'web') return;

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: 10,
          });
          const tracks = media.assets.map((asset) => ({
            id: asset.id,
            filename: asset.filename,
            duration: asset.duration * 1000,
            uri: asset.uri,
            fileSize: asset.fileSize || 0,
            extension: asset.filename.split('.').pop() || '',
            artwork: asset.uri,
          }));
          setPlaylist(tracks);
        }
      } catch (error) {
        console.error('Error loading playlist:', error);
      }
    }
    loadInitialPlaylist();
  }, [setPlaylist]);

  // Gérer les permissions et les actions des notifications
  useEffect(() => {
    async function setupPermissions() {
      if (Platform.OS === 'web') {
        setPermissionsGranted(true);
        return;
      }

      try {
        const mediaPermission = await MediaLibrary.requestPermissionsAsync();
        const notificationPermission =
          await Notifications.requestPermissionsAsync();

        const subscription =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const actionId = response.actionIdentifier;
            switch (actionId) {
              case 'previous':
                playPrevious();
                break;
              case 'play':
                if (!isPlaying) togglePlayPause();
                break;
              case 'pause':
                if (isPlaying) togglePlayPause();
                break;
              case 'next':
                playNext();
                break;
              case 'stop':
                stop();
                setNotificationId(null);
                Notifications.dismissAllNotificationsAsync();
                break;
              case Notifications.DEFAULT: // Lorsque la notification est glissée/fermée
                setNotificationId(null); // Réinitialise l’ID si l’utilisateur la supprime
                break;
            }
          });

        setPermissionsGranted(
          mediaPermission.status === 'granted' &&
            notificationPermission.status === 'granted'
        );

        return () => subscription.remove();
      } catch (error) {
        console.error('Error requesting permissions:', error);
        setPermissionsGranted(false);
      }
    }

    setupPermissions();
  }, [isPlaying, togglePlayPause, playNext, playPrevious, stop]);

  // Afficher et gérer la notification en arrière-plan
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handleAppStateChange = async (nextAppState: string) => {
      if (Platform.OS === 'web') return;

      if (
        nextAppState === 'background' &&
        isPlaying &&
        currentTrack &&
        !notificationId
      ) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Lecture en cours',
            body: currentTrack.filename || 'Piste inconnue',
            categoryIdentifier: 'playback',
            color: THEME_COLORS[0],
            // Suppression de sticky: true pour iOS
            autoDismiss: true, // Android : permet de la rendre enlevable
            data: { trackId: currentTrack.id },
          },
          trigger: null,
        });
        setNotificationId(id);
      } else if (nextAppState === 'active' && notificationId) {
        await Notifications.dismissNotificationAsync(notificationId);
        setNotificationId(null);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Mettre à jour la progression si la notification existe
    if (isPlaying && currentTrack && sound && notificationId) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const position = status.positionMillis || 0;
          const duration = status.durationMillis || 0;
          const progress = duration > 0 ? position / duration : 0;

          await Notifications.scheduleNotificationAsync({
            identifier: notificationId, // Réutilise l’ID existant
            content: {
              title: 'Lecture en cours',
              body: currentTrack.filename || 'Piste inconnue',
              categoryIdentifier: 'playback',
              color: THEME_COLORS[0],
              progress,
              autoDismiss: true, // Android : reste enlevable
              data: { trackId: currentTrack.id },
            },
            trigger: null,
          });
        }
      }, 1000);
    }

    return () => {
      subscription.remove();
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack, sound, notificationId]);

  // Disparition de la notification après pause
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isPlaying && currentTrack && notificationId && Platform.OS !== 'web') {
      timeout = setTimeout(async () => {
        await Notifications.dismissNotificationAsync(notificationId);
        setNotificationId(null);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentTrack, notificationId]);

  // Cacher le splash screen
  useEffect(() => {
    if ((fontsLoaded || fontError) && permissionsGranted) {
      setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [fontsLoaded, fontError, permissionsGranted]);

  if (!fontsLoaded && !fontError) return null;
  if (!permissionsGranted && Platform.OS !== 'web') return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PageContainer>
        {showSplash && (
          <Animated.View
            style={[styles.splashContainer, { backgroundColor: '#000000' }]}
            exiting={
              Platform.OS === 'web'
                ? FadeOut.duration(800)
                : SlideOutUp.duration(800)
            }
          >
            <Logo size={120} showBackground={false} />
          </Animated.View>
        )}
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
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
