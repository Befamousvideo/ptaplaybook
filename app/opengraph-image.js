import { ImageResponse } from "next/og";
import site from "../content/site.json";
import { homeTitle, shareImage } from "./seo";

export const alt = homeTitle;
export const size = { width: shareImage.width, height: shareImage.height };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafaf7",
          color: "#1a1a1a",
        }}
      >
        <div style={{ width: 16, height: "100%", background: site.color }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 72px",
          }}
        >
          <div style={{ fontSize: 76, lineHeight: 1.1 }}>{site.name}</div>
          <div style={{ fontSize: 36, lineHeight: 1.35, marginTop: 24, color: "#444444" }}>{site.tagline}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
