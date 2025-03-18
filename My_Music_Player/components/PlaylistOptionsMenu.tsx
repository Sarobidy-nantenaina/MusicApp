import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { ListPlus, Trash2, X, CreditCard as Edit } from 'lucide-react-native';
import { usePlaylistStore, Playlist } from '@/stores/playlistStore';
import { useState } from 'react';
import { SongOptionsMenu } from './SongOptionsMenu';
import { RenameModal } from './RenameModal';

type PlaylistOptionsMenuProps = {
  isVisible: boolean;
  onClose: () => void;
  playlist: Playlist;
};

export function PlaylistOptionsMenu({ isVisible, onClose, playlist }: PlaylistOptionsMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { deletePlaylist, renamePlaylist } = usePlaylistStore();
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    onClose();
  };

  const handleRename = (newName: string) => {
    renamePlaylist(playlist.id, newName);
  };

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
                {playlist.name}
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#fff' : '#000'} />
              </Pressable>
            </View>

            <Pressable 
              style={styles.option}
              onPress={() => {
                setShowRenameModal(true);
                onClose();
              }}
            >
              <Edit size={24} color="#007AFF" />
              <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                Rename Playlist
              </Text>
            </Pressable>

            {playlist.tracks.length > 0 && (
              <Pressable 
                style={styles.option} 
                onPress={() => {
                  setShowTransferMenu(true);
                  onClose();
                }}
              >
                <ListPlus size={24} color="#007AFF" />
                <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
                  Transfer Songs to Another Playlist
                </Text>
              </Pressable>
            )}

            <Pressable style={styles.option} onPress={handleDelete}>
              <Trash2 size={24} color="#FF3B30" />
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>
                Delete Playlist
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <SongOptionsMenu
        isVisible={showTransferMenu}
        onClose={() => setShowTransferMenu(false)}
        tracks={playlist.tracks}
      />

      <RenameModal
        isVisible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRename}
        currentName={playlist.name}
        title="Rename Playlist"
      />
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
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});