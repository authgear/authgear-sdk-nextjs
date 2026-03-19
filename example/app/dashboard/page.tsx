import { redirect } from "next/navigation";
import { currentUser } from "@authgear/nextjs/server";
import { SignOutButton } from "@authgear/nextjs/client";
import { authgearConfig } from "@/lib/authgear";
import { ApiDemo } from "./ApiDemo";
import { SettingsButton } from "./SettingsButton";

export default async function Dashboard() {
  const user = await currentUser(authgearConfig);
  if (!user) {
    redirect("/");
  }

  const fullName = [user.givenName, user.familyName].filter(Boolean).join(" ");
  const displayName =
    user.name ?? (fullName || null) ?? user.preferredUsername ?? user.email ?? user.sub;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px" }}>
      <h1>Dashboard</h1>

      <section style={{ marginBottom: "1.5rem" }}>
        {user.picture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt="Avatar"
            style={{ width: 64, height: 64, borderRadius: "50%", marginBottom: "0.5rem" }}
          />
        )}
        <p>
          <strong>Name:</strong> {displayName}
        </p>
        {user.email && (
          <p>
            <strong>Email:</strong> {user.email}
            {user.emailVerified !== undefined && (
              <span> ({user.emailVerified ? "verified" : "unverified"})</span>
            )}
          </p>
        )}
        {user.roles && user.roles.length > 0 && (
          <p>
            <strong>Roles:</strong> {user.roles.join(", ")}
          </p>
        )}
        <p>
          <strong>Sub:</strong> <code>{user.sub}</code>
        </p>
      </section>

      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <SettingsButton />
        <SignOutButton
          style={{
            padding: "0.5rem 1rem",
            background: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </SignOutButton>
      </section>

      <section>
        <h2>API Demo</h2>
        <p>
          Call <code>GET /api/me</code> with your access token:
        </p>
        <ApiDemo />
      </section>
    </main>
  );
}
