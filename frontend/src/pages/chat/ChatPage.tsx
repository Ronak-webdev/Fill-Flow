import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import { Input } from "@/components/ui/input";
import axios from "axios";

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const { user } = useUser();
  const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();
  const [query, setQuery] = useState("");
  type SaavnSong = {
    image: { link: string }[];
    title: string;
    primaryArtists: string;
  };
  
  type JamendoSong = {
    album_image: string;
    name: string;
    artist_name: string;
  };
  
  const [jamendoResults, setJamendoResults] = useState<JamendoSong[]>([]);
  const [saavnResults, setSaavnResults] = useState<SaavnSong[]>([]);

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.clerkId);
  }, [selectedUser, fetchMessages]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const [jamendo, saavn] = await Promise.all([
        axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_JAMENDO_CLIENT_ID&format=json&limit=3&search=${query}`),
        axios.get(`https://saavn.dev/api/search/songs?query=${query}`)
      ]);
      setJamendoResults(jamendo.data.results || []);
      setSaavnResults(saavn.data.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <main className='h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden'>
      <Topbar />
      <div className='p-4 flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Input
            placeholder='Search songs...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
          {saavnResults.slice(0, 3).map((song, index) => (
            <div key={index} className='bg-zinc-700 p-4 rounded-md text-white'>
              <img src={song.image[2].link} alt={song.title} className='w-full h-40 object-cover rounded' />
              <div className='mt-2 font-semibold truncate'>{song.title}</div>
              <div className='text-sm text-zinc-300 truncate'>{song.primaryArtists}</div>
            </div>
          ))}

          {jamendoResults.slice(0, 3).map((song, index) => (
            <div key={index} className='bg-zinc-700 p-4 rounded-md text-white'>
              <img src={song.album_image} alt={song.name} className='w-full h-40 object-cover rounded' />
              <div className='mt-2 font-semibold truncate'>{song.name}</div>
              <div className='text-sm text-zinc-300 truncate'>{song.artist_name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className='grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]'>
        <UsersList />
        <div className='flex flex-col h-full'>
          {selectedUser ? (
            <>
              <ChatHeader />
              <ScrollArea className='h-[calc(100vh-340px)]'>
                <div className='p-4 space-y-4'>
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-start gap-3 ${
                        message.senderId === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className='size-8'>
                        <AvatarImage
                          src={
                            message.senderId === user?.id
                              ? user.imageUrl
                              : selectedUser.imageUrl
                          }
                        />
                      </Avatar>

                      <div
                        className={`rounded-lg p-3 max-w-[70%] ${
                          message.senderId === user?.id ? "bg-green-500" : "bg-zinc-800"
                        }`}
                      >
                        <p className='text-sm'>{message.content}</p>
                        <span className='text-xs text-zinc-300 mt-1 block'>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <MessageInput />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatPage;

const NoConversationPlaceholder = () => (
  <div className='flex flex-col items-center justify-center h-full space-y-6'>
    <img src='/Fillflow.png' alt='Fillflow' className='size-16 animate-bounce' />
    <div className='text-center'>
      <h3 className='text-zinc-300 text-lg font-medium mb-1'>No conversation selected</h3>
      <p className='text-zinc-500 text-sm'>Choose a friend to start chatting</p>
    </div>
  </div>
);