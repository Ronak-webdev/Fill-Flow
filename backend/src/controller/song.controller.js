import { Song } from "../models/song.model.js";
import { TrendingCache } from "../models/trendingCache.model.js";
import axios from "axios";

// ------------------------------------
// ✅ Get All Songs (unchanged)
// ------------------------------------

export const getAllSongs = async (req, res, next) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------
// ✅ Get Featured Songs (unchanged)
// ------------------------------------

export const getFeaturedSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------
// ✅ Get Made For You Songs (unchanged)
// ------------------------------------

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 4 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------
// ✅ Get Trending Songs (MongoDB + Jamendo)
// ------------------------------------

export const getTrendingSongs = async (req, res, next) => {
  try {
    const cache = await TrendingCache.findOne().sort({ cachedAt: -1 });
    const now = Date.now();

    // ✅ Reduced cache duration to 24 hour for testing
    if (cache && now - new Date(cache.cachedAt).getTime() < 24 * 60 * 60 * 1000) {
      console.log("Returning cached trending data:", { songs: cache.songs, jamendo: cache.jamendo });
      return res.json({ songs: cache.songs, jamendo: cache.jamendo });
    }

    const songs = await Song.aggregate([
      { $sample: { size: 4 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
    ]);

    // ✅ Jamendo fetch with 'pop' query
    const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
    const JAMENDO_CLIENT_SECRET = process.env.JAMENDO_CLIENT_SECRET;
    let jamendoTracks = [];
    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&client_secret=${JAMENDO_CLIENT_SECRET}&format=json&limit=6&search=pop&audioformat=mp32&imagesize=600`;
      const jamendoRes = await axios.get(jamendoUrl);
      console.log("Jamendo API Response (Trending):", jamendoRes.data);
      jamendoTracks = (jamendoRes.data.results || []).map((track) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        audio: track.audio,
        image: track.album_image || track.image || "/Fillflow.png",
        duration: track.duration,
      }));
      console.log("Jamendo Tracks (Trending):", jamendoTracks);
    } catch (err) {
      console.error("Jamendo fetch failed:", err.message, err.response?.data);
      jamendoTracks = [];
    }

    await TrendingCache.create({
      songs,
      jamendo: jamendoTracks,
      cachedAt: new Date(),
    });

    res.json({ songs, jamendo: jamendoTracks });
  } catch (error) {
    console.error("Trending route error:", error.message);
    next(error);
  }
};

// ------------------------------------
// ✅ Get Jamendo Trending Songs
// ------------------------------------

export const getJamendoTrendingSongs = async (req, res, next) => {
  try {
    const cache = await TrendingCache.findOne().sort({ cachedAt: -1 });
    const now = Date.now();

    // ✅ Reduced cache duration to 24 hour for testing
    if (cache && now - new Date(cache.cachedAt).getTime() < 24 * 60 * 60 * 1000) {
      console.log("Returning cached Jamendo tracks:", cache.jamendo);
      return res.json({ jamendo: cache.jamendo });
    }

    const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
    const JAMENDO_CLIENT_SECRET = process.env.JAMENDO_CLIENT_SECRET;
    let jamendoTracks = [];
    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&client_secret=${JAMENDO_CLIENT_SECRET}&format=json&limit=6&search=pop&audioformat=mp32&imagesize=600`;
      const jamendoRes = await axios.get(jamendoUrl);
      console.log("Jamendo API Response (Jamendo Trending):", jamendoRes.data);
      jamendoTracks = (jamendoRes.data.results || []).map((track) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        audio: track.audio,
        image: track.album_image || track.image || "/Fillflow.png",
        duration: track.duration,
      }));
      console.log("Jamendo Tracks (Jamendo Trending):", jamendoTracks);
    } catch (err) {
      console.error("Jamendo trending fetch failed:", err.message, err.response?.data);
      jamendoTracks = [];
    }

    await TrendingCache.create({
      songs: [],
      jamendo: jamendoTracks,
      cachedAt: new Date(),
    });

    res.json({ jamendo: jamendoTracks });
  } catch (error) {
    console.error("Jamendo trending route error:", error.message);
    next(error);
  }
};

// ------------------------------------
// ✅ Search Local Songs (unchanged)
// ------------------------------------

export const searchSongs = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    const regex = new RegExp(q, "i");
    const songs = await Song.find({
      $or: [{ title: regex }, { artist: regex }],
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------
// ✅ Search All Songs (YouTube + Jamendo)
// ------------------------------------

export const searchAllSongs = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ youtube: [], jamendo: [] });

    const API_KEYS = [
      process.env.YOUTUBE_API_KEY1,
      process.env.YOUTUBE_API_KEY2,
      process.env.YOUTUBE_API_KEY3,
    ];

    let youtubeResults = [];

    for (let key of API_KEYS) {
      try {
        const ytSearchRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q,
              type: "video",
              maxResults: 6,
              videoDuration: "medium",
              key: key,
            },
          }
        );

        const videoIds = ytSearchRes.data.items
          .map((item) => item.id.videoId)
          .join(",");

        const ytVideosRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/videos",
          {
            params: {
              part: "contentDetails",
              id: videoIds,
              key: key,
            },
          }
        );

        const durationsMap = {};
        ytVideosRes.data.items.forEach((item) => {
          durationsMap[item.id] = item.contentDetails.duration;
        });

        youtubeResults = ytSearchRes.data.items.map((item) => {
          const rawDuration = durationsMap[item.id.videoId];
          let seconds = 0;
          if (rawDuration) {
            const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
            const matches = rawDuration.match(regex);
            if (matches) {
              const hours = parseInt(matches[1] || "0");
              const minutes = parseInt(matches[2] || "0");
              const secs = parseInt(matches[3] || "0");
              seconds = hours * 3600 + minutes * 60 + secs;
            }
          }

          return {
            id: item.id.videoId,
            name: item.snippet.title,
            artist_name: item.snippet.channelTitle,
            image: item.snippet.thumbnails.high.url,
            duration: seconds,
            audio: `${
              process.env.BACKEND_URL || "http://localhost:5000"
            }/api/songs/youtube-audio/${item.id.videoId}`,
          };
        });

        if (youtubeResults.length) break;
      } catch (err) {}
    }

    const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
    const JAMENDO_CLIENT_SECRET = process.env.JAMENDO_CLIENT_SECRET;
    let jamendoTracks = [];
    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&client_secret=${JAMENDO_CLIENT_SECRET}&format=json&limit=6&search=${encodeURIComponent(
        q
      )}&audioformat=mp32&imagesize=600`;
      const jamendoRes = await axios.get(jamendoUrl);
      console.log("Jamendo API Response (Search):", jamendoRes.data);
      jamendoTracks = (jamendoRes.data.results || []).map((track) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        audio: track.audio,
        image: track.album_image || track.image || "/Fillflow.png",
        duration: track.duration,
      }));
    } catch (err) {
      console.error("Jamendo search failed:", err.message, err.response?.data);
      jamendoTracks = [];
    }

    res.json({ youtube: youtubeResults, jamendo: jamendoTracks });
  } catch (error) {
    console.error("Search all songs route error:", error.message);
    next(error);
  }
};