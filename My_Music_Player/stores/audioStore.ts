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
  artwork?: string;
};

type AudioStore = {
  sound: Audio.Sound | null;
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  favorites: string[];
  isPlaying: boolean;
  setPlaylist: (tracks: AudioTrack[]) => void;
  setCurrentTrack: (track: AudioTrack | null) => void; // Ne joue pas immédiatement
  playTrack: () => Promise<void>; // Nouvelle fonction pour lancer la lecture
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
  toggleFavorite: (trackId: string) => void;
  deleteTrack: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  renameTrack: (trackId: string, newName: string) => void;
};

const initialState = {
  sound: null,
  currentTrack: null,
  playlist: [] as AudioTrack[],
  favorites: [] as string[],
  isPlaying: false,
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  ...initialState,

  setPlaylist: (tracks) => set({ playlist: tracks }),

  setCurrentTrack: (track) => set({ currentTrack: track }), // Ne joue pas encore

  playTrack: async () => {
    const { sound, currentTrack } = get();
    if (!currentTrack) return;

    if (sound) {
      await sound.unloadAsync();
    }

    const newSound = new Audio.Sound();
    try {
      await newSound.loadAsync({ uri: currentTrack.uri });
      await newSound.playAsync();
      set({ sound: newSound, isPlaying: true });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  },

  playNext: async () => {
    const { currentTrack, playlist, sound } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === playlist.length - 1) return;

    const nextTrack = playlist[currentIndex + 1];
    if (sound) {
      await sound.unloadAsync();
    }

    const newSound = new Audio.Sound();
    try {
      await newSound.loadAsync({ uri: nextTrack.uri });
      await newSound.playAsync();
      set({ sound: newSound, currentTrack: nextTrack, isPlaying: true });
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  },

  playPrevious: async () => {
    const { currentTrack, playlist, sound } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === 0) return;

    const previousTrack = playlist[currentIndex - 1];
    if (sound) {
      await sound.unloadAsync();
    }

    const newSound = new Audio.Sound();
    try {
      await newSound.loadAsync({ uri: previousTrack.uri });
      await newSound.playAsync();
      set({ sound: newSound, currentTrack: previousTrack, isPlaying: true });
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  },

  stop: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        set({ sound: null, isPlaying: false, currentTrack: null });
      } catch (error) {
        console.error('Error stopping track:', error);
      }
    }
  },

  toggleFavorite: (trackId: string) => {
    set((state) => {
      const isFavorite = state.favorites.includes(trackId);
      return {
        favorites: isFavorite
          ? state.favorites.filter((id) => id !== trackId)
          : [...state.favorites, trackId],
      };
    });
  },

  deleteTrack: (trackId: string) => {
    set((state) => ({
      playlist: state.playlist.filter((track) => track.id !== trackId),
      favorites: state.favorites.filter((id) => id !== trackId),
      currentTrack:
        state.currentTrack?.id === trackId ? null : state.currentTrack,
      sound: state.currentTrack?.id === trackId ? null : state.sound,
      isPlaying: state.currentTrack?.id === trackId ? false : state.isPlaying,
    }));
  },

  isFavorite: (trackId: string) => {
    const { favorites = [] } = get();
    return favorites.includes(trackId);
  },

  renameTrack: (trackId: string, newName: string) => {
    set((state) => ({
      playlist: state.playlist.map((track) =>
        track.id === trackId ? { ...track, filename: newName } : track
      ),
      currentTrack:
        state.currentTrack?.id === trackId
          ? { ...state.currentTrack, filename: newName }
          : state.currentTrack,
    }));
  },
}));
