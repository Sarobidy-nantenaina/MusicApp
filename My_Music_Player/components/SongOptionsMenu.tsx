import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { ListPlus, Heart, Trash2, X, Plus, CreditCard as Edit } from 'lucide-react-native';
import { useAudioStore, AudioTrack } from '@/stores/audioStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useState } from 'react';
import { RenameModal } from './RenameModal';

type SongOptionsMenuProps = {
  isVisible: boolean;
  onClose: () => void;
  tracks: AudioTrack[];
  playlistId?: string; // Optional playlist ID for when the song is in a playlist
};

export function SongOptionsMenu({ isVisible, onClose, tracks, playlistId }: SongOptionsMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { toggleFavorite, deleteTrack, isFavorite, renameTrack } = useAudioStore();
  const { playlists, addTracksToPlaylist, createPlaylist, removeTrackFromPlaylist } = usePlaylistStore();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  if (!tracks || tracks.length === 0) {
    return null;
  }

  const handleAddToPlaylist = (playlistId: string) => {
    addTracksToPlaylist(playlistId, tracks);
    setShowPlaylists(false);
    onClose();
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addTracksToPlaylist(newPlaylist.id, tracks);
      setNewPlaylistName('');
      setShowNewPlaylistInput(false);
      setShowPlaylists(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (playlistId) {
      // Remove from playlist
      tracks.forEach(track => removeTrackFromPlaylist(playlistId, track.id));
    } else {
      // Delete from device
      tracks.forEach(track => deleteTrack(track.id));
    }
    onClose();
  };

  const handleToggleFavorite = () => {
    tracks.forEach(track => toggleFavorite(track.id));
    onClose();
  };

  const handleRename = (newName: string) => {
    if (tracks.length === 1) {
      renameTrack(tracks[0].id, newName);
    }
  };

  const allFavorites = tracks.every(track => isFavorite(track.id));

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View 
            style={[
              styles.container,
              { backgroundColor: isDark ? '#1C1C1E' : '#fff' }
            ]}
          >
            <View style={styles.header}>
              <Text 
                style={[styles.title, { color: isDark ? '#fff' : '#000' }]} 
                numberOfLines={1}
              >
                {tracks.length === 1 ? tracks[0].filename : `${tracks.length} songs selected`}
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#fff' : '#000'} />
              </Pressable>
            </View>

            {tracks.length === 1 && (
              <Pressable 
                style={styles.option}
                onPress={() => {
                  setShowRenameModal(true);
                  onClose();
                }}
              >
                <Edit size={24} color="#007AFF" />
                <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                  Rename Song
                </Text>
              </Pressable>
            )}

            {!showPlaylists ? (
              <>
                <Pressable 
                  style={styles.option} 
                  onPress={() => setShowPlaylists(true)}
                >
                  <ListPlus size={24} color="#007AFF" />
                  <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                    Add to Playlist
                  </Text>
                </Pressable>

                <Pressable style={styles.option} onPress={handleToggleFavorite}>
                  <Heart 
                    size={24} 
                    color="#FF2D55"
                    fill={allFavorites ? "#FF2D55" : "transparent"}
                  />
                  <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                    {allFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Text>
                </Pressable>

                <Pressable style={styles.option} onPress={handleDelete}>
                  <Trash2 size={24} color="#FF3B30" />
                  <Text style={[styles.optionText, { color: '#FF3B30' }]}>
                    {playlistId ? 'Remove from Playlist' : 'Delete from Device'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable 
                  style={styles.backOption}
                  onPress={() => {
                    setShowPlaylists(false);
                    setShowNewPlaylistInput(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                    ← Back to Options
                  </Text>
                </Pressable>

                {showNewPlaylistInput ? (
                  <View style={styles.createContainer}>
                    <TextInput
                      style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
                      placeholder="New playlist name"
                      placeholderTextColor={isDark ? '#8E8E93' : '#666'}
                      value={newPlaylistName}
                      onChangeText={setNewPlaylistName}
                      onSubmitEditing={handleCreatePlaylist}
                      autoFocus
                    />
                    <Pressable
                      onPress={handleCreatePlaylist}
                      style={({ pressed }) => [
                        styles.createButton,
                        { backgroundColor: '#007AFF' },
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                      <Plus size={24} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable 
                    style={styles.option}
                    onPress={() => setShowNewPlaylistInput(true)}
                  >
                    <Plus size={24} color="#007AFF" />
                    <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                      Create New Playlist
                    </Text>
                  </Pressable>
                )}

                {playlists.map(playlist => (
                  <Pressable
                    key={playlist.id}
                    style={styles.option}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                  >
                    <ListPlus size={24} color="#007AFF" />
                    <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                      {playlist.name} ({playlist.tracks.length})
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {tracks.length === 1 && (
        <RenameModal
          isVisible={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          onRename={handleRename}
          currentName={tracks[0].filename}
          title="Rename Song"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backOption: {
    padding: 16,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  createContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});