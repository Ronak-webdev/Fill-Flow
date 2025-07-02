import mongoose from "mongoose";

const trendingCacheSchema = new mongoose.Schema(
  {
    songs: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        artist: String,
        imageUrl: String,
        audioUrl: String,
      },
    ],
    jamendo: [
      {
        id: String,
        name: String,
        artist_name: String,
        audio: String,
        image: String,
        duration: Number,
      },
    ],
    cachedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const TrendingCache = mongoose.model("TrendingCache", trendingCacheSchema);
