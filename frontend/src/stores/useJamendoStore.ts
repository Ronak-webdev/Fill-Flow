// src/stores/useJamendoStore.ts
import { create } from "zustand";
import { fetchJamendoTracks } from "@/lib/jamendo";

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
}

interface JamendoStore {
  tracks: JamendoTrack[];
  filteredTracks: JamendoTrack[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;

  fetchTracks: () => Promise<void>;
  searchTracks: (term: string) => void;
  // Add this alias for compatibility
  fetchJamendoTracks?: () => Promise<void>;
}

export const useJamendoStore = create<JamendoStore>((set, get) => {
  const fetchTracks = async () => {
    set({ isLoading: true, error: null });
    try {
      const tracks = await fetchJamendoTracks();
      set({ tracks, filteredTracks: tracks });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch tracks" });
    } finally {
      set({ isLoading: false });
    }
  };

  return {
    tracks: [],
    filteredTracks: [],
    isLoading: false,
    error: null,
    searchTerm: "",
    fetchTracks,
    fetchJamendoTracks: fetchTracks, // Add this alias for compatibility
    searchTracks: (term: string) => {
      const { tracks } = get();
      set({
        searchTerm: term,
        filteredTracks: tracks.filter(
          (t) =>
            t.name.toLowerCase().includes(term.toLowerCase()) ||
            t.artist_name.toLowerCase().includes(term.toLowerCase())
        ),
      });
    },
  };
});
