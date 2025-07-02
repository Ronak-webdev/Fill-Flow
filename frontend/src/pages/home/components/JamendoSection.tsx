import { useEffect, useState } from "react";
import { fetchJamendoTracks } from "@/lib/jamendo";
import JamendoMusicCard from "@/components/JamendoMusicCard";

const JamendoSection = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetchJamendoTracks().then(setTracks);
  }, []);

  return (
    <section className="px-6 py-8">
      <h2 className="text-white text-2xl font-bold mb-6">Suggested Music (Jamendo)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tracks.map((track: any) => (
          <JamendoMusicCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
};

export default JamendoSection;
