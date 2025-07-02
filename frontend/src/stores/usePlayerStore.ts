import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  isSeeking: boolean;
  queue: Song[];
  currentIndex: number;
  isRepeating: boolean;
  currentTime: number;
  audioElement: HTMLAudioElement | null;
  duration: number;
  analyser: AnalyserNode | null;
  setAnalyser: (analyser: AnalyserNode | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsSeeking: (isSeeking: boolean) => void;
  initializeQueue: (songs: Song[]) => void;
  playAlbum: (songs: Song[], startIndex?: number) => void;
  setCurrentSong: (song: Song | null, autoPlay?: boolean) => void;
  togglePlay: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  repeat: boolean;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  isSeeking: false,
  queue: [],
  currentIndex: -1,
  isRepeating: false,
  currentTime: 0,
  audioElement: null,
  duration: 0,
  analyser: null,
  setAnalyser: (analyser) => set({ analyser }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setIsSeeking: (isSeeking: boolean) => set({ isSeeking }),

  initializeQueue: (songs: Song[]) => {
    if (songs.length === 0) return;
    set({
      queue: songs,
      currentSong: songs[0],
      currentIndex: 0,
      isPlaying: false, // Changed to false for initial load
    });
  },

  playAlbum: (songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;

    const song = songs[startIndex];
    const socket = useChatStore.getState().socket;
    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity: `Playing ${song.title} by ${song.artist}`,
      });
    }

    set({
      queue: songs,
      currentSong: song,
      currentIndex: startIndex,
      isPlaying: true, // Keep true for explicit album play
    });
  },

  setCurrentSong: (song: Song | null, autoPlay: boolean = true) => {
    if (!song) return;

    const current = get().currentSong;
    if (current && current._id === song._id) {
      set({ isPlaying: autoPlay });
      return;
    }

    const songIndex = get().queue.findIndex((s) => s._id === song._id);
    const socket = useChatStore.getState().socket;
    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity: `Playing ${song.title} by ${song.artist}`,
      });
    }

    set({
      currentSong: song,
      currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
      isPlaying: autoPlay,
    });
  },

  togglePlay: () => {
    const willStartPlaying = !get().isPlaying;
    const currentSong = get().currentSong;
    const socket = useChatStore.getState().socket;

    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity:
          willStartPlaying && currentSong
            ? `Playing ${currentSong.title} by ${currentSong.artist}`
            : "Idle",
      });
    }

    set({ isPlaying: willStartPlaying });
  },

  toggleRepeat: () => {
    set({ isRepeating: !get().isRepeating });
  },

  playNext: () => {
    const { isRepeating, currentSong, currentIndex, queue } = get();

    if (isRepeating && currentSong) {
      get().setCurrentSong(currentSong, true);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      const nextSong = queue[nextIndex];
      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
        });
      }

      set({
        currentSong: nextSong,
        currentIndex: nextIndex,
        isPlaying: true,
      });
    } else {
      set({ isPlaying: false });

      const socket = useChatStore.getState().socket;
      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: "Idle",
        });
      }
    }
  },

  playPrevious: () => {
    const { currentIndex, queue } = get();
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevSong = queue[prevIndex];
      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
        });
      }

      set({
        currentSong: prevSong,
        currentIndex: prevIndex,
        isPlaying: true,
      });
    } else {
      set({ isPlaying: false });

      const socket = useChatStore.getState().socket;
      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: "Idle",
        });
      }
    }
  },

  get repeat() {
    return get().isRepeating;
  },
}));