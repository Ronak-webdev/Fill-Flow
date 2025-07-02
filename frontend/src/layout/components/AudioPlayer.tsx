import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);

  const { currentSong, isPlaying, playNext, setDuration } = usePlayerStore();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Play/Pause based on state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error("Play error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Song ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  // Song changed
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    let src = currentSong.audioUrl;

    if (currentSong.type === "youtube" && currentSong.videoId) {
      src = `${BACKEND_URL}/api/songs/youtube-audio/${currentSong.videoId}`;
    }

    const isSongChange = prevSongRef.current !== src;
    if (isSongChange) {
      audio.src = src;
      audio.load();
      audio.currentTime = 0;
      prevSongRef.current = src;

      if (isPlaying) {
        audio.play().catch(err => console.error("Play error:", err));
      }
    }
  }, [currentSong, isPlaying, BACKEND_URL]);

  // Set duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (!audioRef.current || !currentSong) return;
    if (currentSong.type === "youtube") {
      setDuration(currentSong.duration || 0);
    } else {
      setDuration(audioRef.current.duration || 0);
    }
  };

  return <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />;
};

export default AudioPlayer;
