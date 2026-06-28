import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF6B35 0%, #CC4400 100%)",
          padding: 80,
        }}
      >
        {/* Logo pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 24,
            padding: "16px 48px",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 96,
              fontWeight: 900,
              fontFamily: "Arial Black, Arial, sans-serif",
              letterSpacing: "-2px",
            }}
          >
            KBite
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: 36,
            fontWeight: 700,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            margin: 0,
            marginBottom: 16,
            letterSpacing: "-0.5px",
          }}
        >
          Find Your Home Food in Korea
        </p>

        {/* Sub-tagline */}
        <p
          style={{
            color: "rgba(255,255,255,0.70)",
            fontSize: 24,
            fontWeight: 400,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            margin: 0,
          }}
        >
          Halal · Vegan · Home Cuisine · 9 Languages
        </p>

        {/* Bottom badges */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 56,
          }}
        >
          {["🥙 Halal", "🌱 Vegan", "🍜 Asian", "🥗 Vegetarian"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.20)",
                  borderRadius: 999,
                  padding: "10px 24px",
                  color: "white",
                  fontSize: 22,
                  fontFamily: "Arial, sans-serif",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
