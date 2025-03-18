import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useAudioStore } from '../../stores/audioStore';
import { useColorScheme } from '@/stores/themeStore';
import { PageContainer } from '@/components/PageContainer';
import {
  ChevronLeft,
  Heart,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Repeat as RepeatOne,
  Music,
} from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const ALBUM_ART =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60';

type RepeatMode = 'off' | 'all' | 'one';

export default function PlayerScreen() {
  const {
    currentTrack,
    playlist = [],
    toggleFavorite,
    isFavorite,
    playNext,
    playPrevious,
    playTrack,
    togglePlayPause,
    sound,
    isPlaying,
    stop,
  } = useAudioStore();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<typeof playlist>([]);
  const [isSeeking, setIsSeeking] = useState(false);

  const progress = useSharedValue(0);
  const progressBarWidth = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Animation du cercle pour l'artwork
  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 8000,
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

  // Gestion des gestes pour la barre de progression
  const seekGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsSeeking)(true);
    })
    .onUpdate((e) => {
      const newProgress = Math.max(
        0,
        Math.min(1, e.x / progressBarWidth.value)
      );
      progress.value = newProgress;
    })
    .onEnd((e) => {
      const newProgress = Math.max(
        0,
        Math.min(1, e.x / progressBarWidth.value)
      );
      const newPosition = newProgress * duration;
      runOnJS(handleSeek)(newPosition);
      runOnJS(setIsSeeking)(false);
    });

  const tapGesture = Gesture.Tap().onStart((e) => {
    const newProgress = Math.max(0, Math.min(1, e.x / progressBarWidth.value));
    const newPosition = newProgress * duration;
    runOnJS(handleSeek)(newPosition);
  });

  const progressGestures = Gesture.Race(seekGesture, tapGesture);

  // Mise à jour de la progression
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      progress.value = withTiming(position / duration, { duration: 100 });
    }
  }, [position, duration, isSeeking]);

  // Charger la piste sélectionnée via params.id si nécessaire
  useEffect(() => {
    if (params.id && !currentTrack && playlist.length > 0) {
      const track = playlist.find((t) => t.id === params.id);
      if (track) {
        useAudioStore.setState({ currentTrack: track });
      }
    }
  }, [params.id, playlist]);

  // Lancer la lecture lorsque la page est prête
  useEffect(() => {
    if (currentTrack && !isPlaying && sound === null) {
      playTrack(); // Lance la lecture uniquement si la piste n’est pas déjà en cours
    }

    // Nettoyage au démontage (optionnel)
    return () => {
      // stop(); // Décommentez si vous voulez arrêter la lecture en quittant
    };
  }, [currentTrack, isPlaying, playTrack, sound]);

  // Mettre à jour la position et la durée à partir de l’état du son
  useEffect(() => {
    if (sound) {
      const interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            handleTrackFinish();
          }
        }
      }, 1000); // Mise à jour toutes les secondes

      return () => clearInterval(interval);
    }
  }, [sound]);

  const handleTrackFinish = () => {
    switch (repeatMode) {
      case 'one':
        playTrack(); // Rejoue la même piste
        break;
      case 'all':
        const currentIndex = playlist.findIndex(
          (t) => t.id === currentTrack?.id
        );
        if (currentIndex === playlist.length - 1) {
          useAudioStore.setState({ currentTrack: playlist[0] });
          playTrack();
        } else {
          playNext();
        }
        break;
      case 'off':
        playNext();
        break;
    }
  };

  const handleSeek = async (newPosition: number) => {
    if (sound) {
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleShare = () => {
    if (currentTrack) {
      console.log('Share track:', currentTrack.filename);
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode((current) => {
      switch (current) {
        case 'off':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'off';
      }
    });
  };

  const toggleShuffle = () => {
    setIsShuffleOn((prev) => !prev);
  };

  useEffect(() => {
    if (isShuffleOn) {
      const newShuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5);
      setShuffledPlaylist(newShuffledPlaylist);
    }
  }, [isShuffleOn, playlist]);

  if (!currentTrack) {
    return (
      <PageContainer>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Now Playing
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Music size={48} color="#fff" style={{ opacity: 0.5 }} />
          </View>
          <Text style={styles.emptyTitle}>No track selected</Text>
          <Text style={styles.emptySubtitle}>
            Select a track from your library to start playing
          </Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/audio')}
          >
            <Text style={styles.browseButtonText}>Browse Library</Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Now Playing
          </Text>
        </View>
        <Pressable style={styles.headerButton} onPress={handleShare}>
          <Share2 size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <View style={styles.trackTitleContainer}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {currentTrack.filename}
            </Text>
            <Pressable
              style={styles.favoriteButton}
              onPress={() => currentTrack && toggleFavorite(currentTrack.id)}
            >
              <Heart
                size={24}
                color="#FF2D55"
                fill={
                  currentTrack && isFavorite(currentTrack.id)
                    ? '#FF2D55'
                    : 'transparent'
                }
              />
            </Pressable>
          </View>
          <Text style={styles.artistName}>Unknown Artist</Text>
        </View>

        <Animated.View style={[styles.artworkContainer, circleStyle]}>
          <View style={styles.artworkInner}>
            <Image source={{ uri: ALBUM_ART }} style={styles.artworkImage} />
          </View>
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
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.playbackControls}>
          <Pressable
            style={[
              styles.playbackButton,
              isShuffleOn && styles.activePlaybackButton,
            ]}
            onPress={toggleShuffle}
          >
            <Shuffle
              size={20}
              color="#fff"
              style={{ opacity: isShuffleOn ? 1 : 0.6 }}
            />
          </Pressable>

          <View style={styles.mainControls}>
            <Pressable style={styles.controlButton} onPress={playPrevious}>
              <SkipBack size={32} color="#fff" />
            </Pressable>
            <Pressable onPress={togglePlayPause} style={styles.playButton}>
              {isPlaying ? (
                <Pause size={32} color="#fff" />
              ) : (
                <Play size={32} color="#fff" />
              )}
            </Pressable>
            <Pressable style={styles.controlButton} onPress={playNext}>
              <SkipForward size={32} color="#fff" />
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.playbackButton,
              repeatMode !== 'off' && styles.activePlaybackButton,
            ]}
            onPress={toggleRepeatMode}
          >
            {repeatMode === 'one' ? (
              <RepeatOne size={20} color="#fff" />
            ) : (
              <Repeat
                size={20}
                color="#fff"
                style={{ opacity: repeatMode !== 'off' ? 1 : 0.6 }}
              />
            )}
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  trackInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  trackTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  favoriteButton: {
    marginLeft: 12,
    padding: 8,
  },
  artistName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
  },
  artworkContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  artworkInner: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  playbackControls: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePlaybackButton: {
    backgroundColor: 'rgba(0,122,255,0.3)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
