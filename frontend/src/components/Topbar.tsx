import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
  const { isAdmin } = useAuthStore();
  console.log({ isAdmin });

  return (
    <div
      className="flex items-center justify-between p-2 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10"
    >
<div className="relative overflow-hidden rounded-lg group w-fit">
  {/* Animated border effect */}
  <span className="absolute top-0 left-0 w-full h-full rounded-lg z-0 animate-border-runner pointer-events-none"></span>

  {/* Main content */}
  <div className="relative z-10 flex border-[1.5px]  border-solid  border-violet-500 items-center gap-2 sm:gap-2 p-1.5 sm:p-1.1 rounded-lg shadow-md backdrop-blur-md bg-black/100 transition-all duration-500 ease-in-out h-auto sm:h-auto">
    <img
      src="/Fillflow.png"
      alt="Fillflow logo"
      className="w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10 relative z-10 opacity-100 transition-opacity duration-300 
        group-hover:animate-[moveAndReturn_1s_ease-in-out] 
        group-active:animate-[moveAndReturn_0.8s_ease-in-out]"
    />
    <span className="relative inline-block text-sm sm:text-xl md:text-xl font-extrabold text-white 
      before:content-['Fill-Flow'] before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-indigo-500 
      before:bg-[length:200%] before:bg-left 
      before:text-transparent before:bg-clip-text 
      before:opacity-0 
      group-hover:before:opacity-100 
      group-hover:text-transparent 
      group-hover:before:animate-fill-left-to-right 
      active:before:opacity-100 
      active:text-transparent 
      active:before:animate-fill-left-to-right 
      sm:active:animate-none">
      Fill-Flow
    </span>
  </div>
</div>


<div className="flex items-center gap-2 md:gap-4">
  {isAdmin && (
    <div className="relative overflow-hidden rounded-full md:rounded-md group w-fit">
      {/* Animated border effect */}
      <span className="absolute top-0 left-0 w-full h-full rounded-full md:rounded-md z-0 animate-border-runner pointer-events-none"></span>

      {/* Admin Button */}
      <Link
        to="/admin"
        className={cn(
          buttonVariants({
            variant: "outline",
            className:
              "relative z-10 text-sm py-1 px-2 rounded-full md:rounded-md md:text-base md:py-2 md:px-4 text-white border-[1.5px] border-solid border-violet-500 hover:bg-zinc-800 hover:border-zinc-600",
          })
        )}
      >
        <LayoutDashboardIcon className="size-4 mr-1 md:mr-2" />
        <span className="inline md:inline">Admin</span>
        <span className="hidden md:inline"> Dashboard</span>
      </Link>
    </div>
  )}

  <SignedOut>
    <SignInOAuthButtons />
  </SignedOut>

  <UserButton />
</div>

    </div>
  );
};

export default Topbar;