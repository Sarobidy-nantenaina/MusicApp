import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Music, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useColorScheme } from '@/stores/themeStore';
import { Playlist } from '@/stores/playlistStore';
import { useState } from 'react';
import { PlaylistOptionsMenu } from './PlaylistOptionsMenu';

type PlaylistCardProps = {
  playlist: Playlist;
  onPress: () => void;
};

export function PlaylistCard({ playlist, onPress }: PlaylistCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionsPress = (e: any) => {
    e.stopPropagation();
    setShowOptions(true);
  };

  return (
    <>
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#fff',
            shadowColor: isDark ? '#000' : '#000',
          },
          pressed && styles.pressed
        ]} 
        onPress={onPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
          <Music size={24} color="#007AFF" />
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
            {playlist.name}
          </Text>
          <Text style={[styles.details, { color: isDark ? '#8E8E93' : '#666' }]}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
          </Text>
        </View>
        <Pressable 
          onPress={handleOptionsPress}
          style={[styles.optionsButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
        >
          <MoreVertical size={20} color="#007AFF" />
        </Pressable>
      </Pressable>

      <PlaylistOptionsMenu
        isVisible={showOptions}
        onClose={() => setShowOptions(false)}
        playlist={playlist}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});