import { useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	const { signIn, isLoaded } = useSignIn();

	if (!isLoaded) {
		return null;
	}

	const signInWithGoogle = () => {
		signIn.authenticateWithRedirect({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectUrlComplete: "/auth-callback",
		});
	};

	return (
		<Button
  			onClick={signInWithGoogle}
  			variant={"secondary"}
  			className="w-full border-[1.5px] border-solid  hover:bg-violet-900  border-violet-500 text-white bg-zinc-900/75 h-9 flex items-center justify-center gap-2 "
			>
  			<img src="/google.png" alt="Google" className="size-5" />
  			<span className="hidden sm:inline">Continue with Google</span>
			</Button>
				);
			};
export default SignInOAuthButtons;
