"use client";

import { useState } from "react";
import { callMeAction } from "./actions";

export function ApiDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const data = await callMeAction();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          background: "#38a169",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {loading ? "Calling..." : "Call /api/me"}
      </button>
      {result && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f7f7f7",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}
