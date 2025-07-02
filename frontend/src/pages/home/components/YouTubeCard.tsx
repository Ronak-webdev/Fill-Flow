import PlayButton from './PlayButton';
import { Song } from '@/types';
import { useRef, useEffect } from 'react';

type YouTubeTrack = {
  id: string;
  name: string;
  artist_name: string;
  image: string;
  duration: number;
};

const YouTubeCard = ({ track, onClick }: { track: YouTubeTrack; onClick?: () => void }) => {
  const songObj: Song = {
    _id: track.id,
    title: track.name,
    artist: track.artist_name,
    albumId: null,
    imageUrl: track.image,
    audioUrl: '',
    duration: track.duration || 0,
    createdAt: '',
    updatedAt: '',
    type: 'youtube',
    videoId: track.id,
  };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const youtubeIframeRefs = (window as any).youtubeIframeRefs || {};
    youtubeIframeRefs[track.id] = iframeRef.current;
    (window as any).youtubeIframeRefs = youtubeIframeRefs;

    return () => {
      delete youtubeIframeRefs[track.id];
    };
  }, [track.id]);

  return (
    <div
      className="w-full max-w-[100px] sm:max-w-[120px] md:max-w-[140px] aspect-square rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer relative p-2"
      onClick={onClick}
    >
      <img
        src={track.image}
        alt={track.name}
        className="w-full h-full object-cover object-center transform scale-125 group-hover:scale-150 transition-transform duration-500 ease-in-out"
        draggable={false}
      />
      <PlayButton song={songObj} />
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        src={`https://www.youtube.com/embed/${track.id}?enablejsapi=1&mute=1&autoplay=0`}
        title={track.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ position: 'absolute', visibility: 'hidden' }}
      />
    </div>
  );
};

export default YouTubeCard;