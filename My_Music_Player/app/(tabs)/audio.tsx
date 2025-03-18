import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { AudioFileCard } from '../../components/AudioFileCard';
import { useAudioStore, AudioTrack } from '../../stores/audioStore';
import { useColorScheme } from '@/stores/themeStore';
import { router } from 'expo-router';
import { usePlaylistStore } from '@/stores/playlistStore';
import {
  Trash2,
  ListPlus,
  X,
  Plus,
  Search,
  SquareCheck as CheckSquare,
  Play,
  Pause,
} from 'lucide-react-native';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { PageContainer } from '@/components/PageContainer';
import { TabHeader } from '@/components/TabHeader';

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

function getFileExtension(filename: string): string {
  const match = filename.match(/\.([0-9a-z]+)$/i);
  return match ? match[1].toUpperCase() : '';
}

export default function AudioScreen() {
  const [error, setError] = useState<string | null>(null);
  const {
    playlist,
    setPlaylist,
    setCurrentTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
  } = useAudioStore();
  const { playlists, addTracksToPlaylist, createPlaylist } = usePlaylistStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSelectionMode = selectedTracks.size > 0;

  const filteredPlaylist = playlist.filter((track) =>
    track.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function getAudioFiles() {
      try {
        if (Platform.OS === 'web') {
          setError('Audio file listing is not available on web');
          return;
        }

        const media = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 1000,
          sortBy: ['creationTime'],
        });

        const audioAssets = media.assets.map((asset) => ({
          id: asset.id,
          filename: asset.filename,
          duration: asset.duration * 1000,
          uri: asset.uri,
          fileSize: asset.fileSize || 0,
          extension: getFileExtension(asset.filename),
        }));

        setPlaylist(audioAssets);
      } catch (error) {
        console.error('Error loading audio files:', error);
        setError('Failed to load audio files');
      }
    }

    getAudioFiles();
  }, [setPlaylist]);

  const handleTrackPress = (track: AudioTrack) => {
    if (isSelectionMode) {
      toggleTrackSelection(track.id);
    } else {
      setCurrentTrack(track); // Définit la piste sans jouer
      router.push('/player'); // Navigue vers la page de lecture
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(trackId)) {
        newSelection.delete(trackId);
      } else {
        newSelection.add(trackId);
      }
      return newSelection;
    });
  };

  const startSelectionMode = (trackId: string) => {
    setSelectedTracks(new Set([trackId]));
  };

  const toggleSelectAll = () => {
    if (selectedTracks.size === filteredPlaylist.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(filteredPlaylist.map((track) => track.id)));
    }
  };

  const handleDeleteSelected = () => {
    selectedTracks.forEach((trackId) => {
      useAudioStore.getState().deleteTrack(trackId); // Utilise directement deleteTrack
    });
    setSelectedTracks(new Set());
  };

  const handleShowOptions = () => {
    setShowOptionsMenu(true);
  };

  if (Platform.OS === 'web') {
    return (
      <PageContainer>
        <View style={styles.webMessage}>
          <Text style={{ color: '#FF453A' }}>
            Audio file listing is not available on web platforms. Please use a
            mobile device to access this feature.
          </Text>
        </View>
      </PageContainer>
    );
  }

  const selectedTrackObjects = playlist.filter((track) =>
    selectedTracks.has(track.id)
  );

  return (
    <PageContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TabHeader
          title="Audio Files"
          subtitle={`${filteredPlaylist.length} ${
            filteredPlaylist.length === 1 ? 'file' : 'files'
          } found${
            isSelectionMode ? ` • ${selectedTracks.size} selected` : ''
          }`}
        />

        <View style={styles.searchContainer}>
          <View
            style={{
              backgroundColor: isDark ? '#1C1C1E' : '#fff',
              ...styles.searchInputContainer,
            }}
          >
            <Search size={20} color={isDark ? '#8E8E93' : '#666'} />
            <TextInput
              style={{ color: isDark ? '#fff' : '#000', ...styles.searchInput }}
              placeholder="Search songs..."
              placeholderTextColor={isDark ? '#8E8E93' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={20} color={isDark ? '#8E8E93' : '#666'} />
              </Pressable>
            )}
          </View>

          {error ? (
            <Text style={{ color: '#FF453A', ...styles.error }}>{error}</Text>
          ) : filteredPlaylist.length === 0 ? (
            <Text
              style={{ color: isDark ? '#8E8E93' : '#666', ...styles.empty }}
            >
              {searchQuery
                ? 'No songs found matching your search'
                : 'No audio files found'}
            </Text>
          ) : (
            <>
              {currentTrack && (
                <Pressable
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#fff',
                    ...styles.playPauseButton,
                  }}
                  onPress={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause size={24} color={isDark ? '#fff' : '#000'} />
                  ) : (
                    <Play size={24} color={isDark ? '#fff' : '#000'} />
                  )}
                  <Text
                    style={{
                      color: isDark ? '#fff' : '#000',
                      ...styles.buttonText,
                    }}
                  >
                    {isPlaying ? 'Pause' : 'Play'} - {currentTrack.filename}
                  </Text>
                </Pressable>
              )}

              {isSelectionMode && (
                <View style={styles.selectionControls}>
                  <Pressable
                    style={{
                      backgroundColor: isDark ? '#1C1C1E' : '#fff',
                      ...styles.selectionButton,
                    }}
                    onPress={toggleSelectAll}
                  >
                    <Text
                      style={{
                        color: isDark ? '#fff' : '#000',
                        ...styles.buttonText,
                      }}
                    >
                      {selectedTracks.size === filteredPlaylist.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Text>
                  </Pressable>

                  <View style={styles.actionButtons}>
                    <Pressable
                      style={{
                        backgroundColor: '#007AFF',
                        ...styles.actionButton,
                      }}
                      onPress={handleShowOptions}
                    >
                      <ListPlus size={24} color="#fff" />
                    </Pressable>
                    <Pressable
                      style={{
                        backgroundColor: '#FF3B30',
                        ...styles.actionButton,
                      }}
                      onPress={handleDeleteSelected}
                    >
                      <Trash2 size={24} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {filteredPlaylist.map((track) => (
          <View key={track.id} style={styles.cardWrapper}>
            <AudioFileCard
              filename={track.filename}
              duration={formatDuration(track.duration)}
              size={formatFileSize(track.fileSize)}
              extension={track.extension}
              onPress={() => handleTrackPress(track)}
              onLongPress={() => startSelectionMode(track.id)}
              track={track}
              isSelected={selectedTracks.has(track.id)}
              onSelect={() => toggleTrackSelection(track.id)}
              selectionMode={isSelectionMode}
            />
          </View>
        ))}

        <SongOptionsMenu
          isVisible={showOptionsMenu}
          onClose={() => {
            setShowOptionsMenu(false);
            setSelectedTracks(new Set());
          }}
          tracks={selectedTrackObjects}
        />
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  error: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  empty: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  selectionControls: {
    gap: 12,
  },
  selectionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playPauseButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
