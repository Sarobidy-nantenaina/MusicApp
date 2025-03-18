import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { X, Search } from 'lucide-react-native';
import { useState } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { AudioFileCard } from './AudioFileCard';

type AddSongsModalProps = {
  isVisible: boolean;
  onClose: () => void;
  playlistId: string;
};

export function AddSongsModal({ isVisible, onClose, playlistId }: AddSongsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { playlist } = useAudioStore();
  const { playlists, addTracksToPlaylist } = usePlaylistStore();
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const currentPlaylist = playlists.find(p => p.id === playlistId);
  const existingTrackIds = new Set(currentPlaylist?.tracks.map(t => t.id) || []);

  const availableTracks = playlist.filter(track => 
    !existingTrackIds.has(track.id) &&
    track.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSelected = () => {
    const tracksToAdd = playlist.filter(track => selectedTracks.has(track.id));
    addTracksToPlaylist(playlistId, tracksToAdd);
    setSelectedTracks(new Set());
    onClose();
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

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Add Songs
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
          <Search size={20} color={isDark ? '#8E8E93' : '#666'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
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

        <ScrollView style={styles.content}>
          {availableTracks.length === 0 ? (
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#666' }]}>
              {searchQuery ? 'No songs found matching your search' : 'No songs available to add'}
            </Text>
          ) : (
            availableTracks.map(track => (
              <View key={track.id} style={styles.cardWrapper}>
                <AudioFileCard
                  filename={track.filename}
                  duration={formatDuration(track.duration)}
                  size={formatFileSize(track.fileSize)}
                  extension={track.extension}
                  onPress={() => toggleTrackSelection(track.id)}
                  track={track}
                  isSelected={selectedTracks.has(track.id)}
                  onSelect={() => toggleTrackSelection(track.id)}
                  selectionMode={true}
                />
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.selectionText, { color: isDark ? '#8E8E93' : '#666' }]}>
            {selectedTracks.size} songs selected
          </Text>
          <Pressable
            style={[
              styles.addButton,
              { opacity: selectedTracks.size > 0 ? 1 : 0.5 }
            ]}
            onPress={handleAddSelected}
            disabled={selectedTracks.size === 0}
          >
            <Text style={styles.addButtonText}>Add to Playlist</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  content: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  selectionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});