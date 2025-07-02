import { Input } from "@/components/ui/input";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useState, useEffect, useRef } from "react";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const { searchAllSongs } = useMusicStore();
  const { isPlaying, isSeeking } = usePlayerStore();
  const [beats, setBeats] = useState<number[]>([]);
  const [gradient, setGradient] = useState("from-pink-400 to-purple-400");
  const beatInterval = useRef<NodeJS.Timeout | null>(null);
  const colorInterval = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const gradients = [
    "from-pink-400 to-purple-400",
    "from-purple-400 to-blue-400",
    "from-blue-400 to-cyan-400",
    "from-cyan-400 to-teal-400",
    "from-teal-400 to-green-400",
    "from-green-400 to-lime-400",
    "from-lime-400 to-yellow-400",
  ];

  // Gradient cycle
  useEffect(() => {
    colorInterval.current = setInterval(() => {
      setGradient((prev) => {
        const idx = gradients.indexOf(prev);
        return gradients[(idx + 1) % gradients.length];
      });
    }, 4000);

    return () => {
      if (colorInterval.current) clearInterval(colorInterval.current);
    };
  }, []);

  // Generate beats according to window
const generateVariedBeats = (count: number): number[] => {
  let heights = Array(count)
    .fill(0)
    .map(() => {
      const r = Math.random();
      const biased = Math.pow(r, 2); // Bias towards smaller numbers
      return Math.floor(biased * 60) + 20; // 20–80
    });
  const uniqueHeights = new Set(heights);
  if (uniqueHeights.size === 1) {
    heights[0] = heights[0] === 20 ? 30 : 20;
  }
  return heights;
};


  const clearBeatInterval = () => {
    if (beatInterval.current) {
      clearInterval(beatInterval.current);
      beatInterval.current = null;
    }
  };

  const startBeatAnimation = () => {
    if (!beatInterval.current) {
      beatInterval.current = setInterval(() => {
        setBeats((prev) => generateVariedBeats(prev.length));
      }, 200);
    }
  };

  // Beats logic: Music playing OR seeking
  useEffect(() => {
    const shouldShowBeats = isPlaying || isSeeking;

    if (shouldShowBeats) {
      if (beats.length === 0) {
        const count = window.innerWidth < 768 ? 10 : 20;
        setBeats(generateVariedBeats(count));
      }
      startBeatAnimation();
    } else {
      clearBeatInterval();
      if (value.trim() === "") {
        setBeats([]);
      }
    }

    return () => clearBeatInterval();
  }, [isPlaying, isSeeking, value]);

  // Resize: regenerate if needed, else clear
  useEffect(() => {
    const handleResize = () => {
      const shouldShowBeats = isPlaying || isSeeking || value.trim() !== "";
      if (shouldShowBeats) {
        const count = window.innerWidth < 768 ? 10 : 20;
        setBeats(generateVariedBeats(count));
      } else {
        setBeats([]);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPlaying, isSeeking, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (e.target.value.trim() !== "" && beats.length === 0) {
      const count = window.innerWidth < 768 ? 10 : 20;
      setBeats(generateVariedBeats(count));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (value.trim() !== "") {
      setBeats(generateVariedBeats(beats.length)); // Pulse on each keypress
    }
    if (e.key === "Enter" && value.trim() !== "") {
      searchAllSongs(value);
      clearBeatInterval();
      setBeats([]); // Hide beats on Enter
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    inputRef.current?.classList.add("ring-2", "ring-purple-500");
    if (value.trim() !== "" && beats.length === 0) {
      const count = window.innerWidth < 768 ? 10 : 20;
      setBeats(generateVariedBeats(count));
    }
  };

  const handleBlur = () => {
    inputRef.current?.classList.remove("ring-2", "ring-purple-500");
    if (!isPlaying && !isSeeking && value.trim() === "") {
      clearBeatInterval();
      setBeats([]);
    }
  };

  return (
    <div className="w-full mb-8 flex flex-col items-center relative group  pt-8">
      {beats.length > 0 && (
        <div className="flex gap-3.5 absolute items-end mb-2 h-1">
          {beats.map((height, i) => (
            <div
              key={`top-${i}`}
              className={`w-1.5 bg-gradient-to-t ${gradient} transition-all duration-100`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-2xl">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} p-0.5 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
        ></div>

        <Input
          ref={inputRef}
          placeholder="Search Your Next Beats..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full bg-zinc-900/80 text-white border-0 backdrop-blur-md shadow-lg rounded-full py-4 px-6 text-lg font-medium focus-visible:ring-2 focus-visible:ring-purple-500 transition-all duration-300 placeholder:text-zinc-400 hover:bg-zinc-800/80 focus:bg-zinc-800/80 focus:shadow-purple-500/20 group-hover:scale-[1.01] group-hover:shadow-purple-500/10"
        />

        <button
          onClick={() => {
            if (value.trim() !== "") {
              searchAllSongs(value);
              clearBeatInterval();
              setBeats([]);
              inputRef.current?.blur();
            }
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-purple-500/20 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-400 group-hover:text-purple-300 transition-colors duration-200"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;