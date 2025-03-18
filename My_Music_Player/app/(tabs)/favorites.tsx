import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { useAudioStore } from '@/stores/audioStore';
import { AudioFileCard } from '@/components/AudioFileCard';
import { router } from 'expo-router';
import { PageContainer } from '@/components/PageContainer';
import { TabHeader } from '@/components/TabHeader';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { playlist, favorites, playTrack } = useAudioStore();

  const favoriteTracks = playlist.filter(track => favorites.includes(track.id));

  function formatDuration(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (favoriteTracks.length === 0) {
    return (
      <PageContainer>
        <TabHeader title="Favorites" />
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Heart size={48} color="#fff" style={{ opacity: 0.5 }} />
          </View>
          <Text style={styles.emptyTitle}>
            No favorite tracks yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Add tracks to your favorites by tapping the heart icon
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
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TabHeader 
          title="Favorites" 
          subtitle={`${favoriteTracks.length} ${favoriteTracks.length === 1 ? 'track' : 'tracks'}`}
        />

        {favoriteTracks.map(track => (
          <View key={track.id} style={styles.cardWrapper}>
            <AudioFileCard
              filename={track.filename}
              duration={formatDuration(track.duration)}
              size={formatFileSize(track.fileSize)}
              extension={track.extension}
              onPress={() => {
                playTrack(track);
                router.push('/player');
              }}
              track={track}
            />
          </View>
        ))}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 8,
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