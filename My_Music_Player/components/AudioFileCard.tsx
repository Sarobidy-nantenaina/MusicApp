import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Play, Music, MoveVertical as MoreVertical, Check } from 'lucide-react-native';
import { useColorScheme } from '@/stores/themeStore';
import { useState } from 'react';
import { SongOptionsMenu } from './SongOptionsMenu';
import { AudioTrack } from '@/stores/audioStore';

type AudioFileCardProps = {
  filename: string;
  duration: string;
  size: string;
  extension: string;
  onPress: () => void;
  track: AudioTrack;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
  onLongPress?: () => void;
  playlistId?: string;
};

export function AudioFileCard({ 
  filename, 
  duration, 
  size, 
  extension, 
  onPress,
  track,
  isSelected = false,
  onSelect,
  selectionMode = false,
  onLongPress,
  playlistId
}: AudioFileCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showOptions, setShowOptions] = useState(false);

  // Remove file extension from filename
  const displayName = filename.replace(/\.[^/.]+$/, '');

  const handlePress = () => {
    if (selectionMode && onSelect) {
      onSelect();
    } else {
      onPress();
    }
  };

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
          isSelected && { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
          pressed && styles.pressed
        ]} 
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={200}
      >
        {track.artwork ? (
          <Image 
            source={{ uri: track.artwork }} 
            style={styles.artwork}
          />
        ) : (
          <View style={[
            styles.iconContainer, 
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
            isSelected && { backgroundColor: '#007AFF' }
          ]}>
            {isSelected ? (
              <Check size={24} color="#fff" />
            ) : (
              <Music size={24} color="#007AFF" />
            )}
          </View>
        )}
        <View style={styles.content}>
          <Text style={[styles.filename, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.detailsContainer}>
            <Text style={[styles.details, { color: isDark ? '#8E8E93' : '#666' }]}>
              {duration}
            </Text>
            <Text style={[styles.dot, { color: isDark ? '#8E8E93' : '#666' }]}>•</Text>
            <Text style={[styles.details, { color: isDark ? '#8E8E93' : '#666' }]}>
              {size}
            </Text>
          </View>
        </View>
        {!selectionMode && (
          <Pressable 
            style={[styles.optionsButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
            onPress={handleOptionsPress}
          >
            <MoreVertical size={20} color="#007AFF" />
          </Pressable>
        )}
      </Pressable>

      <SongOptionsMenu
        isVisible={showOptions}
        onClose={() => setShowOptions(false)}
        tracks={[track]}
        playlistId={playlistId}
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
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  dot: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  extension: {
    fontFamily: 'Inter_500Medium',
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