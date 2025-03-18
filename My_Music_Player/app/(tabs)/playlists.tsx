import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useColorScheme } from '@/stores/themeStore';
import { PlaylistCard } from '@/components/PlaylistCard';
import { Plus, ListMusic } from 'lucide-react-native';
import { router } from 'expo-router';
import { PageContainer } from '@/components/PageContainer';
import { TabHeader } from '@/components/TabHeader';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlaylistsScreen() {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playlists, createPlaylist } = usePlaylistStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  if (playlists.length === 0) {
    return (
      <LinearGradient
        colors={['#4A148C', '#311B92', '#1A237E']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TabHeader title="Playlists" />
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ListMusic size={48} color="#fff" style={{ opacity: 0.5 }} />
          </View>
          <Text style={styles.emptyTitle}>
            No playlists yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Create your first playlist to organize your music
          </Text>
          <View style={[styles.createContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <TextInput
              style={[styles.input, { color: '#fff' }]}
              placeholder="New playlist name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              onSubmitEditing={handleCreatePlaylist}
            />
            <Pressable
              onPress={handleCreatePlaylist}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: '#007AFF' },
                pressed && { opacity: 0.7 }
              ]}
              disabled={!newPlaylistName.trim()}
            >
              <Plus size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <PageContainer>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TabHeader 
          title="Playlists" 
          subtitle={`${playlists.length} ${playlists.length === 1 ? 'playlist' : 'playlists'}`}
        />

        <View style={[styles.createContainer, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
          <TextInput
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
            placeholder="New playlist name"
            placeholderTextColor={isDark ? '#8E8E93' : '#666'}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            onSubmitEditing={handleCreatePlaylist}
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

        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onPress={() => router.push(`/playlist/${playlist.id}`)}
          />
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
  createContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 12,
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
});