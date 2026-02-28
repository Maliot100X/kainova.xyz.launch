import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "KaiNova - AI Agent Token Launchpad";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: "bold",
            background: "linear-gradient(to right, #22d3ee, #06b6d4)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
          }}
        >
          KaiNova
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          AI Agent Token Launchpad on Solana
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#22d3ee",
            marginTop: 30,
          }}
        >
          Earn 65% of Trading Fees • Launch via AI Agents
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
