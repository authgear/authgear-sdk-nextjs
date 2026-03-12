import { redirect } from "next/navigation";
import { auth, SessionState } from "@authgear/nextjs/server";
import { SignInButton } from "@authgear/nextjs/client";
import { authgearConfig } from "@/lib/authgear";

export default async function Home() {
  const session = await auth(authgearConfig);
  if (session.state === SessionState.Authenticated) {
    redirect("/dashboard");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Authgear Next.js Example</h1>
      <p>You are not signed in.</p>
      <SignInButton>Sign In</SignInButton>
    </main>
  );
}
