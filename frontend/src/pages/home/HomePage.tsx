import { useEffect, useRef, useMemo, useCallback } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import Topbar from "@/components/Topbar";
import SearchBar from "@/components/SearchBar";
import FeaturedSection from "./components/FeaturedSection";
import SectionGrid from "./components/SectionGrid";
import { Link } from "react-router-dom";
import PlayButton from "./components/PlayButton";
import YouTubeCard from "./components/YouTubeCard";
import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { Song } from "@/types";
import { fetchYouTubeTrendingSongs } from "@/services/youtube";

const HomePage = () => {
  const {
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    fetchJamendoTrendingSongs,
    fetchAlbums,
    isLoading,
    madeForYouSongs,
    featuredSongs,
    trendingSongs,
    youtubeResults,
    jamendoResults,
    albums,
    youtubeTrendingSongs,
    jamendoTrendingSongs,
    setYouTubeTrendingSongs,
  } = useMusicStore();

  const { currentSong, isPlaying, setCurrentSong, initializeQueue, playNext, playPrevious } = usePlayerStore();

  const youtubeIframeRefs = useRef<{ [id: string]: HTMLIFrameElement | null }>({});

  const toSongObj = useCallback(
    (track: any, type: "youtube" | "jamendo"): Song => ({
      type,
      _id: track.id,
      title: track.name,
      artist: track.artist_name,
      albumId: null,
      imageUrl: track.image,
      audioUrl: track.audio,
      duration: track.duration || 0,
      createdAt: "",
      updatedAt: "",
      videoId: track.id,
    }),
    []
  );

  const searchPlaybackQueue = useMemo(() => {
    const ytSongs = youtubeResults.slice(0, 6).map((t) => toSongObj(t, "youtube"));
    const jamendoSongs = jamendoResults.slice(0, 6).map((t) => toSongObj(t, "jamendo"));
    const albumSongs = featuredSongs.concat(madeForYouSongs, trendingSongs).map((s) => ({
      ...s,
      type: "local" as const,
    }));
    return [...ytSongs, ...jamendoSongs, ...albumSongs];
  }, [youtubeResults, jamendoResults, featuredSongs, madeForYouSongs, trendingSongs, toSongObj]);

  const trendingPlaybackQueue = useMemo(() => {
    return youtubeTrendingSongs.slice(0, 6).map((t) => toSongObj(t, "youtube"));
  }, [youtubeTrendingSongs, toSongObj]);

  const handlePlayNext = useCallback(() => {
    if (!currentSong) return;
    const inTrending = trendingPlaybackQueue.some((s) => s._id === currentSong._id && s.type === currentSong.type);
    if (inTrending) {
      const idx = trendingPlaybackQueue.findIndex((s) => s._id === currentSong._id && s.type === currentSong.type);
      if (idx === -1) return;
      const nextIdx = (idx + 1) % trendingPlaybackQueue.length;
      setCurrentSong(trendingPlaybackQueue[nextIdx]);
    } else {
      const idx = searchPlaybackQueue.findIndex((s) => s._id === currentSong._id && s.type === currentSong.type);
      if (idx === -1) return;
      const nextIdx = (idx + 1) % searchPlaybackQueue.length;
      setCurrentSong(searchPlaybackQueue[nextIdx]);
    }
  }, [currentSong, searchPlaybackQueue, trendingPlaybackQueue, setCurrentSong]);

  const handlePlayPrevious = useCallback(() => {
    if (!currentSong) return;
    const inTrending = trendingPlaybackQueue.some((s) => s._id === currentSong._id && s.type === currentSong.type);
    if (inTrending) {
      const idx = trendingPlaybackQueue.findIndex((s) => s._id === currentSong._id && s.type === currentSong.type);
      if (idx === -1) return;
      const prevIdx = (idx - 1 + trendingPlaybackQueue.length) % trendingPlaybackQueue.length;
      setCurrentSong(trendingPlaybackQueue[prevIdx]);
    } else {
      const idx = searchPlaybackQueue.findIndex((s) => s._id === currentSong._id && s.type === currentSong.type);
      if (idx === -1) return;
      const prevIdx = (idx - 1 + searchPlaybackQueue.length) % searchPlaybackQueue.length;
      setCurrentSong(searchPlaybackQueue[prevIdx]);
    }
  }, [currentSong, searchPlaybackQueue, trendingPlaybackQueue, setCurrentSong]);

  const handlePlayTrendingJamendoSong = useCallback(
    (song: Song) => {
      const jamendoQueue = jamendoTrendingSongs.slice(0, 6).map((t) => toSongObj(t, "jamendo"));
      const index = jamendoQueue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        initializeQueue(jamendoQueue);
        setCurrentSong(jamendoQueue[index]);
      }
    },
    [jamendoTrendingSongs, toSongObj, initializeQueue, setCurrentSong]
  );

  useEffect(() => {
    if (youtubeTrendingSongs.length > 0) {
      youtubeTrendingSongs.slice(0, 6).forEach((track) => {
        const iframe = youtubeIframeRefs.current[track.id];
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "loadVideoById",
              args: [track.id, 0],
            }),
            "*"
          );
        }
      });
    }
  }, [youtubeTrendingSongs]);

  useEffect(() => {
    if (youtubeResults.length > 0) {
      youtubeResults.slice(0, 6).forEach((track) => {
        const iframe = youtubeIframeRefs.current[track.id];
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "loadVideoById",
              args: [track.id, 0],
            }),
            "*"
          );
        }
      });
    }
  }, [youtubeResults]);

  useEffect(() => {
    const inSearch =
      currentSong &&
      searchPlaybackQueue.slice(0, 6).some((s) => s._id === currentSong._id && s.type === currentSong.type);
    const inTrending =
      currentSong &&
      trendingPlaybackQueue.some((s) => s._id === currentSong._id && s.type === currentSong.type);

    if (inSearch || inTrending) {
      usePlayerStore.setState({
        playNext: handlePlayNext,
        playPrevious: handlePlayPrevious,
      });
    } else {
      usePlayerStore.setState({
        playNext,
        playPrevious,
      });
    }
  }, [currentSong, searchPlaybackQueue, trendingPlaybackQueue, handlePlayNext, handlePlayPrevious, playNext, playPrevious]);

  useEffect(() => {
    if (!currentSong || currentSong.type !== "youtube") {
      Object.values(youtubeIframeRefs.current).forEach((iframe) => {
        if (iframe) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          );
        }
      });
      return;
    }
    Object.entries(youtubeIframeRefs.current).forEach(([id, iframe]) => {
      if (iframe) {
        if (id === currentSong._id) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: isPlaying ? "playVideo" : "pauseVideo",
              args: [],
            }),
            "*"
          );
        } else {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "pauseVideo",
              args: [],
            }),
            "*"
          );
        }
      }
    });
  }, [currentSong, isPlaying]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await fetchYouTubeTrendingSongs("Trending Songs");
        setYouTubeTrendingSongs(trending);
      } catch (error) {
        console.error("Failed to fetch YouTube trending songs:", error);
      }
    };
    fetchTrending();
  }, [setYouTubeTrendingSongs]);

  useEffect(() => {
    fetchFeaturedSongs();
    fetchMadeForYouSongs();
    fetchTrendingSongs();
    fetchJamendoTrendingSongs();
    fetchAlbums();
  }, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchJamendoTrendingSongs, fetchAlbums]);

  useEffect(() => {
    if (madeForYouSongs.length && featuredSongs.length && trendingSongs.length) {
      const all = [...featuredSongs, ...madeForYouSongs, ...trendingSongs].map((s) => ({
        ...s,
        type: "local" as const,
      }));
      initializeQueue(all);
    }
  }, [featuredSongs, madeForYouSongs, trendingSongs, initializeQueue]);

  const handlePlayPersonalizedSong = useCallback(
    (song: Song) => {
      const queue = [...madeForYouSongs, ...trendingSongs].map((s) => ({
        ...s,
        type: "local" as const,
      }));
      const index = queue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        initializeQueue(queue);
        setCurrentSong(queue[index]);
      }
    },
    [madeForYouSongs, trendingSongs, initializeQueue, setCurrentSong]
  );

  const handlePlayYouTubeTrendingSong = useCallback(
    (song: Song) => {
      const queue = youtubeTrendingSongs.map((t) => toSongObj(t, "youtube"));
      const index = queue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        initializeQueue(queue);
        setCurrentSong(queue[index]);
      }
    },
    [youtubeTrendingSongs, toSongObj, initializeQueue, setCurrentSong]
  );

  const handlePlayYouTubeSearchSong = useCallback(
    (song: Song) => {
      const queue = youtubeResults.map((t) => toSongObj(t, "youtube"));
      const index = queue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        initializeQueue(queue);
        setCurrentSong(queue[index]);
      }
    },
    [youtubeResults, toSongObj, initializeQueue, setCurrentSong]
  );

  const personalizedQueue = useMemo(() => {
    return [...madeForYouSongs, ...trendingSongs].map((s) => ({
      ...s,
      type: "local" as const,
    }));
  }, [madeForYouSongs, trendingSongs]);

  useEffect(() => {
    const inPersonalized =
      currentSong && personalizedQueue.some((s) => s._id === currentSong._id);

    if (inPersonalized) {
      usePlayerStore.setState({
        playNext: () => {
          const idx = personalizedQueue.findIndex((s) => s._id === currentSong._id);
          const nextIdx = (idx + 1) % personalizedQueue.length;
          setCurrentSong(personalizedQueue[nextIdx]);
        },
        playPrevious: () => {
          const idx = personalizedQueue.findIndex((s) => s._id === currentSong._id);
          const prevIdx = (idx - 1 + personalizedQueue.length) % personalizedQueue.length;
          setCurrentSong(personalizedQueue[prevIdx]);
        },
      });
    }
  }, [currentSong, personalizedQueue, setCurrentSong]);

  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 sm:p-6 space-y-8">
          <SearchBar />
          {youtubeResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <div
                className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                data-slug="search-results-youtube"
              >
                <div className="flex flex-row gap-4 min-w-full px-2">
                  {youtubeResults.slice(0, 6).map((track) => (
                    <div
                      className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[140px] snap-start"
                      key={track.id}
                    >
                      <YouTubeCard
                        track={track}
                        onClick={() => handlePlayYouTubeSearchSong(toSongObj(track, "youtube"))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {youtubeTrendingSongs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Trending Songs</h2>
              <div
                className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                data-slug="trending-youtube"
              >
                <div className="flex flex-row gap-4 min-w-full px-2">
                  {youtubeTrendingSongs.slice(0, 6).map((track) => (
                    <div
                      className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[140px] snap-start"
                      key={track.id}
                    >
                      <YouTubeCard
                        track={track}
                        onClick={() => handlePlayYouTubeTrendingSong(toSongObj(track, "youtube"))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {jamendoTrendingSongs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pop Vibes</h2>
              <div
                className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                data-slug="trending-jamendo"
              >
                <div className="flex flex-row gap-4 min-w-full px-2">
                  {jamendoTrendingSongs.slice(0, 6).map((track) => (
                    <div
                      className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[140px] snap-start"
                      key={track.id}
                    >
                      <div className="w-full max-w-[140px] rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer relative p-2 flex flex-col">
                        <div className="w-full aspect-square">
                          <img
                            src={track.image}
                            alt={track.name}
                            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                            draggable={false}
                          />
                          <PlayButton
                            song={toSongObj(track, "jamendo")}
                            onClick={() =>
                              handlePlayTrendingJamendoSong(toSongObj(track, "jamendo"))
                            }
                          />
                        </div>
                        <div className="pt-2">
                          <p className="font-medium truncate text-white text-sm">{track.name}</p>
                          <p className="text-xs text-zinc-400 truncate">{track.artist_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="block sm:hidden">
            <h2 className="text-xl font-semibold mb-4">Featured</h2>
            <div className="grid grid-cols-2 gap-4 px-5">
              {featuredSongs.slice(0, 6).map((song) => (
                <div
                  key={song._id}
                  className="flex items-center bg-zinc-800/50 rounded-md overflow-hidden hover:bg-zinc-700/50 transition-colors group cursor-pointer relative h-16"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-14 h-14 object-cover flex-shrink-0 m-1"
                    draggable={false}
                  />
                  <div className="flex-1 p-2 min-w-0">
                    <p className="font-medium text-white text-sm">{song.title}</p>
                    <p className="text-xs text-zinc-400">{song.artist}</p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground shadow h-8 w-8 absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                    onClick={() => handlePlayPersonalizedSong(song)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-play size-4 text-black"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden sm:block">
            <FeaturedSection />
          </div>
          <div className="block sm:hidden">
            <h2 className="text-xl font-semibold mb-4">Made For You</h2>
            <div
              className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              data-slug="made-for-you"
            >
              <div className="flex flex-row gap-4 min-w-full px-4">
                {madeForYouSongs.slice(0, 6).map((song) => (
                  <div key={song._id} className="flex-shrink-0 w-[150px] snap-start">
                    <div className="w-full max-w-[150px] rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer relative p-2 flex flex-col">
                      <div className="w-full aspect-square">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                          draggable={false}
                        />
                        <PlayButton
                          song={song}
                          onClick={() => handlePlayPersonalizedSong(song)}
                        />
                      </div>
                      <div className="pt-2">
                        <p className="font-medium truncate text-white text-sm">{song.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <SectionGrid
              title="Made For You"
              songs={madeForYouSongs}
              isLoading={isLoading}
              onPlaySong={handlePlayPersonalizedSong}
            />
          </div>
          <div className="block sm:hidden">
            <h2 className="text-xl font-semibold mb-4">Suggested</h2>
            <div
              className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              data-slug="trending"
            >
              <div className="flex flex-row gap-4 min-w-full px-4">
                {trendingSongs.slice(0, 6).map((song) => (
                  <div key={song._id} className="flex-shrink-0 w-[150px] snap-start">
                    <div className="w-full max-w-[150px] rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer relative p-2 flex flex-col">
                      <div className="w-full aspect-square">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                          draggable={false}
                        />
                        <PlayButton
                          song={song}
                          onClick={() => handlePlayPersonalizedSong(song)}
                        />
                      </div>
                      <div className="pt-2">
                        <p className="font-medium truncate text-white text-sm">{song.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            
            <SectionGrid
              title="You Might Like"
              songs={trendingSongs}
              isLoading={isLoading}
              onPlaySong={handlePlayPersonalizedSong}
            />
          </div>
          <div className="block sm:hidden">
            <h2 className="text-xl font-semibold mb-4">Playlists</h2>
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              <div
                className="overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                data-slug="playlists"
              >
                <div className="flex flex-row gap-4 min-w-full px-4">
                  {albums.slice(0, 6).map((album) => (
                    <Link
                      to={`/albums/${album._id}`}
                      key={album._id}
                      className="flex-shrink-0 w-[100px] snap-start"
                    >
                      <div className="w-full max-w-[100px] rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer relative p-2 flex flex-col">
                        <div className="w-full aspect-square">
                          <img
                            src={album.imageUrl}
                            alt={album.title}
                            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                            draggable={false}
                          />
                        </div>
                        <div className="pt-2">
                          <p className="font-medium truncate text-white text-sm">{album.title}</p>
                          <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default HomePage;