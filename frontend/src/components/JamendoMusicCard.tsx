interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  album_image: string;
}

const JamendoMusicCard = ({ track }: { track: JamendoTrack }) => {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow hover:scale-10 transition-all">
      <img src={track.album_image} alt={track.name} className="w-full h-12 object-cover" />
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold truncate">{track.name}</h3>
        <p className="text-zinc-400 text-sm mb-2 truncate">by {track.artist_name}</p>
        <audio controls className="w-full">
          <source src={track.audio} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default JamendoMusicCard;
