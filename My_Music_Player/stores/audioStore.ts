import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type AudioTrack = {
  id: string;
  filename: string;
  duration: number;
  uri: string;
  fileSize: number;
  extension: string;
  isFavorite?: boolean;
  artwork?: string; // Add artwork URL property
};

type AudioStore = {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  favorites: string[];
  setPlaylist: (tracks: AudioTrack[]) => void;
  setCurrentTrack: (track: AudioTrack) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleFavorite: (trackId: string) => void;
  deleteTrack: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  renameTrack: (trackId: string, newName: string) => void;
};

// Configure notifications for background playback
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      presentationOptions: ['banner'],
    }),
  });
}

// Initialize with empty arrays to prevent undefined errors
const initialState = {
  currentTrack: null,
  playlist: [] as AudioTrack[],
  favorites: [] as string[],
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  ...initialState,
  setPlaylist: (tracks) => set({ playlist: tracks }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  playNext: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === playlist.length - 1) return;
    
    const nextTrack = playlist[currentIndex + 1];
    set({ currentTrack: nextTrack });
  },
  playPrevious: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === 0) return;
    
    const previousTrack = playlist[currentIndex - 1];
    set({ currentTrack: previousTrack });
  },
  toggleFavorite: (trackId: string) => {
    set(state => {
      const isFavorite = state.favorites.includes(trackId);
      return {
        favorites: isFavorite
          ? state.favorites.filter(id => id !== trackId)
          : [...state.favorites, trackId]
      };
    });
  },
  deleteTrack: (trackId: string) => {
    set(state => ({
      playlist: state.playlist.filter(track => track.id !== trackId),
      favorites: state.favorites.filter(id => id !== trackId),
      currentTrack: state.currentTrack?.id === trackId ? null : state.currentTrack
    }));
  },
  isFavorite: (trackId: string) => {
    const { favorites = [] } = get();
    return favorites.includes(trackId);
  },
  renameTrack: (trackId: string, newName: string) => {
    set(state => ({
      playlist: state.playlist.map(track => 
        track.id === trackId 
          ? { ...track, filename: newName }
          : track
      ),
      currentTrack: state.currentTrack?.id === trackId
        ? { ...state.currentTrack, filename: newName }
        : state.currentTrack
    }));
  },
}));