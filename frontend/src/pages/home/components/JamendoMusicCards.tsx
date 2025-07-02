import { useEffect, useState } from "react";
import { fetchJamendoTracks } from "@/lib/jamendo";
import { Card, CardContent } from "@/components/ui/card";

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
}

const JamendoMusicCards = () => {
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const data = await fetchJamendoTracks();
        setTracks(data);
      } catch (err) {
        console.error("Failed to fetch Jamendo tracks:", err);
      }
    };
    loadTracks();
  }, []);

  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-bold mb-4 text-white">Suggested Songs</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <Card key={track.id} className="bg-zinc-900 text-white hover:shadow-xl transition-all">
            <CardContent className="p-4">
              <img
                src={track.image}
                alt={track.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold truncate">{track.name}</h3>
              <p className="text-sm text-zinc-400 truncate mb-2">{track.artist_name}</p>
              <audio controls src={track.audio} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JamendoMusicCards;
