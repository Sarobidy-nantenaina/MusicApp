import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useColorScheme } from '@/stores/themeStore';
import { AudioFileCard } from '@/components/AudioFileCard';
import { useAudioStore } from '@/stores/audioStore';
import { ChevronLeft, Trash2, ListPlus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { SongOptionsMenu } from '@/components/SongOptionsMenu';
import { PageContainer } from '@/components/PageContainer';
import { AddSongsModal } from '@/components/AddSongsModal';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const { playlists, removeTrackFromPlaylist, deletePlaylist } = usePlaylistStore();
  const { playTrack } = useAudioStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);

  const playlist = playlists.find(p => p.id === id);
  const isSelectionMode = selectedTracks.size > 0;

  if (!playlist) {
    return (
      <PageContainer>
        <Text style={[styles.error, { color: isDark ? '#fff' : '#000' }]}>
          Playlist not found
        </Text>
      </PageContainer>
    );
  }

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    router.back();
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
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
    if (selectedTracks.size === playlist.tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(playlist.tracks.map(track => track.id)));
    }
  };

  const handleRemoveSelected = () => {
    selectedTracks.forEach(trackId => {
      removeTrackFromPlaylist(playlist.id, trackId);
    });
    setSelectedTracks(new Set());
  };

  const selectedTrackObjects = playlist.tracks.filter(track => selectedTracks.has(track.id));

  return (
    <PageContainer>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
            <Pressable onPress={handleDeletePlaylist} style={styles.deleteButton}>
              <Trash2 size={24} color="#FF3B30" />
            </Pressable>
          </View>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            {playlist.name}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#666' }]}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
            {isSelectionMode && ` • ${selectedTracks.size} selected`}
          </Text>

          {isSelectionMode ? (
            <View style={styles.selectionControls}>
              <Pressable
                style={[styles.selectionButton, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}
                onPress={toggleSelectAll}
              >
                <Text style={[styles.buttonText, { color: isDark ? '#fff' : '#000' }]}>
                  {selectedTracks.size === playlist.tracks.length ? 'Deselect All' : 'Select All'}
                </Text>
              </Pressable>

              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                  onPress={handleRemoveSelected}
                >
                  <Trash2 size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.addButton, { backgroundColor: '#007AFF' }]}
              onPress={() => setShowAddSongsModal(true)}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Songs</Text>
            </Pressable>
          )}
        </View>

        {playlist.tracks.map(track => (
          <View key={track.id} style={styles.cardWrapper}>
            <AudioFileCard
              filename={track.filename}
              duration={formatDuration(track.duration)}
              size={formatFileSize(track.fileSize)}
              extension={track.extension}
              onPress={() => {
                if (isSelectionMode) {
                  toggleTrackSelection(track.id);
                } else {
                  playTrack(track);
                  router.push('/player');
                }
              }}
              onLongPress={() => startSelectionMode(track.id)}
              track={track}
              isSelected={selectedTracks.has(track.id)}
              onSelect={() => toggleTrackSelection(track.id)}
              selectionMode={isSelectionMode}
              playlistId={playlist.id}
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
          playlistId={playlist.id}
        />

        <AddSongsModal
          isVisible={showAddSongsModal}
          onClose={() => setShowAddSongsModal(false)}
          playlistId={playlist.id}
        />
      </ScrollView>
    </PageContainer>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  error: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  selectionControls: {
    marginTop: 16,
    gap: 12,
  },
  selectionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});