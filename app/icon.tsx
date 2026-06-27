import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF6B35",
          borderRadius: 7,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "Arial Black, Arial, sans-serif",
          }}
        >
          K
        </span>
      </div>
    ),
    { width: 32, height: 32 },
  );
}
