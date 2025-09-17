import { auth0 } from "@/lib/auth0";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {AppleHelloEnglishEffect} from "@/components/ui/shadcn-io/apple-hello-effect";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <div className="min-h-svh flex flex-col justify-center items-center bg-gradient-to-b from-white to-slate-100 dark:from-black dark:to-slate-900 p-4 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-lg flex flex-col items-center space-y-6 pt-20">
          <div className="flex w-full h-screen flex-col justify-center items-center gap-16">
      <AppleHelloEnglishEffect speed={1.1} />
    </div>
        <h1 className="text-4xl font-bold text-center">
          The Future Student Management System Is Here
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Start managing your student life now with a click of a button!
        </p>

        <div className="flex flex-row w-full space-x-4">
          {user ? (
            <Button asChild className="flex-1" aria-label="Go to your dashboard">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="flex-1" aria-label="Get Started with the management system">
                <a href="/auth/login?screen_hint=signup">Get Started</a>
              </Button>
              <Button asChild variant="outline" className="flex-1" aria-label="Login to the management system">
                <a href="/auth/login">Login</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}