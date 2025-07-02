import { Router } from "express";
import { spawn } from "child_process";
const router = Router();

// ✅ Other imports same
import {
  getAllSongs,
  getFeaturedSongs,
  getMadeForYouSongs,
  getTrendingSongs,
  searchSongs,
  searchAllSongs,
  getJamendoTrendingSongs
} from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

// ✅ Existing routes same...
router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/search", searchSongs);
router.get("/search-all", searchAllSongs);
router.get("/jamendo-trending", getJamendoTrendingSongs);

// ✅ --- FIXED YOUTUBE AUDIO STREAM ROUTE ---
router.get("/youtube-audio/:videoId", async (req, res) => {
  const { videoId } = req.params;

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // ✅ Important: Use ffmpeg to ensure MP3 conversion
    res.setHeader("Content-Type", "audio/mpeg");

    const ytdlp = spawn("yt-dlp", [
      "-f", "bestaudio",
      "-o", "-",        // Output to stdout
      url,
      "-x",             // Extract audio
      "--audio-format", "mp3",   // Convert to mp3
      "--audio-quality", "0"     // Best quality
    ]);

    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-f", "mp3",
      "-b:a", "192k",
      "pipe:1"
    ]);

    // ✅ Pipe yt-dlp output to ffmpeg input
    ytdlp.stdout.pipe(ffmpeg.stdin);

    // ✅ Pipe final mp3 stream to response
    ffmpeg.stdout.pipe(res);

    ytdlp.stderr.on("data", (data) => {
      console.error(`yt-dlp error: ${data}`);
    });

    ffmpeg.stderr.on("data", (data) => {
      console.error(`ffmpeg error: ${data}`);
    });

    ytdlp.on("error", (err) => {
      console.error("yt-dlp spawn error:", err);
      if (!res.headersSent) res.status(500).json({ error: "yt-dlp spawn failed" });
    });

    ffmpeg.on("error", (err) => {
      console.error("ffmpeg spawn error:", err);
      if (!res.headersSent) res.status(500).json({ error: "ffmpeg spawn failed" });
    });

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) res.status(500).json({ error: "yt-dlp process failed" });
      }
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        console.error(`ffmpeg process exited with code ${code}`);
        if (!res.headersSent) res.status(500).json({ error: "ffmpeg process failed" });
      }
    });

  } catch (err) {
    console.error("Route error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to stream audio" });
  }
});

export default router;