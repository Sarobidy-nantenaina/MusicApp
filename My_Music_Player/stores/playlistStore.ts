import { create } from 'zustand';
import { AudioTrack } from './audioStore';

export type Playlist = {
  id: string;
  name: string;
  tracks: AudioTrack[];
  createdAt: Date;
  updatedAt: Date;
};

type PlaylistStore = {
  playlists: Playlist[];
  createPlaylist: (name: string) => Playlist;
  addTracksToPlaylist: (playlistId: string, tracks: AudioTrack[]) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
};

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  createPlaylist: (name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substring(7),
      name,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({
      playlists: [...state.playlists, newPlaylist],
    }));
    return newPlaylist;
  },
  addTracksToPlaylist: (playlistId: string, tracks: AudioTrack[]) => {
    set(state => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const existingTrackIds = new Set(playlist.tracks.map(t => t.id));
          const newTracks = tracks.filter(track => !existingTrackIds.has(track.id));
          
          if (newTracks.length > 0) {
            return {
              ...playlist,
              tracks: [...playlist.tracks, ...newTracks],
              updatedAt: new Date(),
            };
          }
        }
        return playlist;
      }),
    }));
  },
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    set(state => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter(track => track.id !== trackId),
            updatedAt: new Date(),
          };
        }
        return playlist;
      }),
    }));
  },
  deletePlaylist: (playlistId: string) => {
    set(state => ({
      playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
    }));
  },
  renamePlaylist: (playlistId: string, newName: string) => {
    set(state => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            name: newName,
            updatedAt: new Date(),
          };
        }
        return playlist;
      }),
    }));
  },
}));