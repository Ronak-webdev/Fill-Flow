import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Play, Pause } from "lucide-react";

const PlayButton = ({ song, onClick }: { song: Song; onClick?: () => void }) => {
  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
  const isCurrentSong = currentSong?._id === song._id;

  const handlePlay = () => {
    if (onClick) {
      onClick();
    } else {
      if (isCurrentSong) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    }
  };

  const Icon = isCurrentSong && isPlaying ? Pause : Play;

  return (
    <Button
      size={"icon"}
      onClick={handlePlay}
      className={`absolute bottom-3 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all 
        translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100`}
    >
      <Icon className='size-5 text-black' />
    </Button>
  );
};

export default PlayButton;