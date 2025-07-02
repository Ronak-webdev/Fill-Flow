import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

// src/lib/jamendo.ts

const JAMENDO_API = "https://api.jamendo.com/v3.0/tracks/";
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID;

export const fetchJamendoTracks = async () => {
  const res = await axios.get(JAMENDO_API, {
    params: {
      client_id: CLIENT_ID,
      format: "json",
      limit: 3,
      include: "musicinfo+stats",
      audioformat: "mp32",
      imagesize: 600,
    },
  });

  return res.data.results;
};
