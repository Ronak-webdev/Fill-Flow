export const fetchJamendoTracks = async () => {
  const clientId = import.meta.env.VITE_JAMENDO_CLIENT_ID;
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=3&fuzzytags=pop&include=musicinfo+stats+licenses+lyrics&groupby=artist_id&imagesize=600`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist_name: track.artist_name,
    audio: track.audio,
    image: track.album_image || track.image || "/Fillflow.png",
  }));
};
