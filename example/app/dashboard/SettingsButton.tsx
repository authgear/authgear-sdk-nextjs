// ROADMAP: SettingsButton — client component that calls getOpenURL() via a
// Server Action to open Authgear settings in a new tab, with the user
// pre-authenticated via the app_session_token exchange.
//
// Requires the Authgear client to have app_session_token permission granted
// on the server side. Once available:
//   1. Uncomment getSettingsURLAction in actions.ts
//   2. Uncomment the import in dashboard/page.tsx
//   3. Replace the plain <a> settings link with <SettingsButton />
//
// "use client";
//
// import { useState } from "react";
// import { getSettingsURLAction } from "./actions";
//
// export function SettingsButton() {
//   const [loading, setLoading] = useState(false);
//
//   async function handleClick() {
//     setLoading(true);
//     try {
//       const url = await getSettingsURLAction();
//       window.open(url, "_blank");
//     } finally {
//       setLoading(false);
//     }
//   }
//
//   return (
//     <button
//       onClick={handleClick}
//       disabled={loading}
//       style={{
//         padding: "0.5rem 1rem",
//         background: "#0070f3",
//         color: "white",
//         border: "none",
//         borderRadius: "4px",
//         cursor: "pointer",
//       }}
//     >
//       {loading ? "Opening..." : "Account Settings"}
//     </button>
//   );
// }
