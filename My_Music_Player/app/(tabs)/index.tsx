import { View, Text, ScrollView, StyleSheet, Image, Pressable, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { PageContainer } from '@/components/PageContainer';
import { Play } from 'lucide-react-native';
import { useAudioStore } from '@/stores/audioStore';
import { router } from 'expo-router';
import { TabHeader } from '@/components/TabHeader';
import { useOrientation } from '@/hooks/useOrientation';

const FEATURED_PLAYLISTS = [
  {
    id: '1',
    title: 'Recently Played',
    description: 'Your most played tracks',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Trending Now',
    description: 'Popular tracks this week',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Chill Vibes',
    description: 'Relaxing music for your day',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { playlist, playTrack } = useAudioStore();
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  const isLandscape = orientation === 'landscape';
  const recentTracks = playlist.slice(0, isLandscape ? 8 : 5);
  const trackCardWidth = isLandscape ? (width - 32 - (7 * 16)) / 8 : 160;

  return (
    <PageContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TabHeader title="Home" />

        <View style={[
          styles.featuredGrid,
          isLandscape && { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }
        ]}>
          {FEATURED_PLAYLISTS.map(playlist => (
            <Pressable 
              key={playlist.id}
              style={[
                styles.featuredItem,
                { backgroundColor: isDark ? '#1A1B1F' : '#fff' },
                isLandscape && { width: 'calc(33.33% - 8px)', height: 120 }
              ]}
            >
              <Image 
                source={{ uri: playlist.imageUrl }}
                style={[
                  styles.featuredImage,
                  isLandscape && { width: 120, height: 120 }
                ]}
              />
              <View style={styles.featuredInfo}>
                <Text style={[styles.featuredTitle, { color: isDark ? '#fff' : '#000' }]}>
                  {playlist.title}
                </Text>
                <Text style={styles.featuredDescription}>
                  {playlist.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Recently Added
        </Text>

        <ScrollView 
          horizontal={!isLandscape}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.recentTracksContainer,
            isLandscape && { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }
          ]}
        >
          {recentTracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={[
                styles.trackCard,
                { 
                  backgroundColor: isDark ? '#1A1B1F' : '#fff',
                  width: trackCardWidth 
                }
              ]}
              onPress={() => {
                playTrack(track);
                router.push('/player');
              }}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' }}
                style={[styles.trackImage, { width: trackCardWidth }]}
              />
              <View style={styles.playButton}>
                <Play size={20} color="#fff" fill="#fff" />
              </View>
              <Text 
                style={[styles.trackTitle, { color: isDark ? '#fff' : '#000' }]}
                numberOfLines={1}
              >
                {track.filename}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
  featuredGrid: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  featuredItem: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    height: 72,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredImage: {
    width: 72,
    height: 72,
  },
  featuredInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  featuredTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  recentTracksContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  trackCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  trackImage: {
    height: 160,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    right: 8,
    bottom: 40,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    padding: 12,
  },
});