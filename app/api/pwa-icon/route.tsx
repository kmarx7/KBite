import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const ALLOWED_SIZES = [192, 512] as const;
type AllowedSize = (typeof ALLOWED_SIZES)[number];

export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get("size") ?? "192");
  const size: AllowedSize = (ALLOWED_SIZES as readonly number[]).includes(raw)
    ? (raw as AllowedSize)
    : 192;

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
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: size * 0.62,
            fontWeight: 900,
            fontFamily: "Arial Black, Arial, sans-serif",
          }}
        >
          K
        </span>
      </div>
    ),
    { width: size, height: size },
  );
}
