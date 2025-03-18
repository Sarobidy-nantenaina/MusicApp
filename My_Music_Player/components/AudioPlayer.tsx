import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, SkipBack, SkipForward, Heart, Music } from 'lucide-react-native';
import { useColorScheme } from '@/stores/themeStore';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
  withRepeat,
  withSpring,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useAudioStore } from '@/stores/audioStore';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type AudioPlayerProps = {
  uri: string;
  filename: string;
  onClose: () => void;
  showNextPrev?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
};

export function AudioPlayer({ 
  uri, 
  filename, 
  onClose,
  showNextPrev = false,
  onNext,
  onPrevious
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const progress = useSharedValue(0);
  const progressBarWidth = useSharedValue(0);
  const rotation = useSharedValue(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { currentTrack, toggleFavorite, isFavorite } = useAudioStore();

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      rotation.value = withSpring(rotation.value);
    }
  }, [isPlaying]);

  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const seekGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsSeeking)(true);
    })
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / progressBarWidth.value));
      progress.value = newProgress;
    })
    .onEnd((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / progressBarWidth.value));
      const newPosition = newProgress * duration;
      runOnJS(handleSeek)(newPosition);
      runOnJS(setIsSeeking)(false);
    });

  const tapGesture = Gesture.Tap()
    .onStart((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / progressBarWidth.value));
      const newPosition = newProgress * duration;
      runOnJS(handleSeek)(newPosition);
    });

  const progressGestures = Gesture.Race(seekGesture, tapGesture);

  useEffect(() => {
    if (!isSeeking) {
      progress.value = withTiming(position / duration || 0, { duration: 100 });
    }
  }, [position, duration, isSeeking]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    loadAudio();
    loadMetadata();
  }, [uri]);

  const loadMetadata = async () => {
    if (Platform.OS === 'web') return;

    try {
      const asset = await MediaLibrary.getAssetInfoAsync(uri);
      setMetadata({
        title: asset.filename,
        artist: asset.creationTime,
        album: 'Unknown Album',
        artwork: null
      });
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
        true // shouldCorrectPitch
      );

      setSound(newSound);
      setIsPlaying(true);

      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

      // Update notification
      if (Platform.OS !== 'web') {
        await updatePlaybackNotification(true);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const updatePlaybackNotification = async (playing: boolean) => {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: metadata?.title || filename,
          subtitle: metadata?.artist || 'Unknown Artist',
          body: metadata?.album || 'Unknown Album',
          data: { uri },
          categoryIdentifier: 'playback',
          actions: [
            { identifier: 'previous', title: 'Previous', icon: 'skip-back' },
            { identifier: playing ? 'pause' : 'play', title: playing ? 'Pause' : 'Play', icon: playing ? 'pause' : 'play' },
            { identifier: 'next', title: 'Next', icon: 'skip-forward' }
          ],
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        onNext?.();
      }
    }
  }, [onNext]);

  const handlePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }

    // Update notification
    if (Platform.OS !== 'web') {
      await updatePlaybackNotification(!isPlaying);
    }
  };

  const handleSeek = async (newPosition: number) => {
    if (sound) {
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleSeekBackward = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 10000); // 10 seconds backward
    await sound.setPositionAsync(newPosition);
  };

  const handleSeekForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(duration, position + 10000); // 10 seconds forward
    await sound.setPositionAsync(newPosition);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
        <Text style={[styles.filename, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {filename}
        </Text>
        <audio
          src={uri}
          controls
          autoPlay
          style={{ width: '100%', marginTop: 10 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
      <View style={styles.header}>
        <View style={styles.metadataContainer}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
            {metadata?.title || filename}
          </Text>
          <Text style={[styles.artist, { color: isDark ? '#8E8E93' : '#666' }]} numberOfLines={1}>
            {metadata?.artist || 'Unknown Artist'}
          </Text>
          <Text style={[styles.album, { color: isDark ? '#8E8E93' : '#666' }]} numberOfLines={1}>
            {metadata?.album || 'Unknown Album'}
          </Text>
        </View>
        <Pressable onPress={() => currentTrack && toggleFavorite(currentTrack.id)}>
          <Heart 
            size={24} 
            color="#FF2D55"
            fill={currentTrack && isFavorite(currentTrack.id) ? "#FF2D55" : "transparent"}
          />
        </Pressable>
      </View>
      
      <Animated.View style={[styles.visualizer, circleStyle]}>
        {metadata?.artwork ? (
          <Image 
            source={{ uri: metadata.artwork }} 
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderArtwork, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
            <Music size={48} color={isDark ? '#fff' : '#000'} />
          </View>
        )}
      </Animated.View>
      
      <View style={styles.progressContainer}>
        <View 
          style={styles.progressBarBackground}
          onLayout={(e) => {
            progressBarWidth.value = e.nativeEvent.layout.width;
          }}
        >
          <GestureDetector gesture={progressGestures}>
            <View style={styles.progressBarTouchable}>
              <Animated.View style={[styles.progressBar, progressBarStyle]} />
            </View>
          </GestureDetector>
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: isDark ? '#8E8E93' : '#666' }]}>
            {formatTime(position)}
          </Text>
          <Text style={[styles.timeText, { color: isDark ? '#8E8E93' : '#666' }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {showNextPrev && (
          <Pressable onPress={onPrevious} style={styles.controlButton}>
            <SkipBack size={24} color="#007AFF" />
          </Pressable>
        )}
        
        <Pressable onPress={handleSeekBackward} style={styles.controlButton}>
          <SkipBack size={24} color="#007AFF" />
        </Pressable>
        
        <Pressable 
          onPress={handlePlayPause} 
          style={[
            styles.playButton,
            { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }
          ]}
        >
          {isPlaying ? (
            <Pause size={32} color="#007AFF" />
          ) : (
            <Play size={32} color="#007AFF" />
          )}
        </Pressable>
        
        <Pressable onPress={handleSeekForward} style={styles.controlButton}>
          <SkipForward size={24} color="#007AFF" />
        </Pressable>

        {showNextPrev && (
          <Pressable onPress={onNext} style={styles.controlButton}>
            <SkipForward size={24} color="#007AFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  metadataContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  album: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  visualizer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
  },
  placeholderArtwork: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarTouchable: {
    width: '100%',
    height: 20,
    marginTop: -8,
    marginBottom: -8,
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    padding: 12,
    marginHorizontal: 24,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});