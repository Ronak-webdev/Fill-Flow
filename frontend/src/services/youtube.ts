import axios from "axios";

const API_KEYS = [
  import.meta.env.VITE_YOUTUBE_API_KEY1,
  import.meta.env.VITE_YOUTUBE_API_KEY2,
  import.meta.env.VITE_YOUTUBE_API_KEY3,
];

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

// ✅ 48 hours
const CACHE_DURATION = 48 * 60 * 60 * 1000;
const CACHE_KEY = "trendingSongsCache";

export const fetchYouTubeTrendingSongs = async (query: string) => {
  const isTrending = query === "trending" || !query.trim();

  // ✅ 1. Trending? Check localStorage
  if (isTrending) {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      const now = Date.now();
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
  }

  let lastError;
  for (const API_KEY of API_KEYS) {
    if (!API_KEY) continue;

    try {
      // ✅ Search results
      const searchResponse = await axios.get(YOUTUBE_API_URL, {
        params: {
          part: "snippet",
          q: isTrending ? "trending songs" : query,
          type: "video",
          videoCategoryId: "10",
          maxResults: 10,
          videoDuration: "medium",
          key: API_KEY,
        },
      });

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .join(",");

      // ✅ Get durations
      const videosResponse = await axios.get(YOUTUBE_VIDEOS_URL, {
        params: {
          part: "contentDetails",
          id: videoIds,
          key: API_KEY,
        },
      });

      const durationMap = videosResponse.data.items.reduce(
        (acc: any, item: any) => {
          const duration = item.contentDetails.duration;
          const match = duration.match(/PT(\d+)M(\d+)S/);
          const seconds = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
          acc[item.id] = seconds;
          return acc;
        },
        {}
      );

      const tracks = searchResponse.data.items.map((item: any) => ({
        id: item.id.videoId,
        name: item.snippet.title,
        artist_name: item.snippet.channelTitle,
        image: item.snippet.thumbnails.medium.url,
        audio: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: durationMap[item.id.videoId] || 0,
      }));

      // ✅ 2. Trending? Save cache
      if (isTrending) {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: tracks })
        );
      }

      return tracks; // ✅ Return from working key
    } catch (err) {
      lastError = err;
      console.error(`YouTube API key failed: ${API_KEY}`, err);
      // Try next key...
    }
  }

  throw lastError || new Error("All YouTube API keys failed.");
};
