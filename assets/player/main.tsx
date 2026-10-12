import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AbsoluteFill } from "remotion";
import { preview } from "../src/preview";
import { SAFE_ZONE } from "../src/safe-zones";
import { InstagramOverlay } from "./InstagramOverlay";

const { component: Video, durationInFrames, fps, width, height } = preview;
const vertical = width * SAFE_ZONE.height === height * SAFE_ZONE.width;

// The video plus, in the preview only, the Instagram Reels screen on top.
const WithOverlay: React.FC<{ overlay: boolean }> = ({ overlay }) => (
  <AbsoluteFill>
    <Video />
    {overlay && (
      <AbsoluteFill
        style={{
          width: SAFE_ZONE.width,
          height: SAFE_ZONE.height,
          scale: String(width / SAFE_ZONE.width),
          transformOrigin: "0 0",
        }}
      >
        <InstagramOverlay />
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);

const OVERLAY_KEY = "preview-instagram-overlay";
const FRAME_KEY = "preview-frame";

// The page reloads on every change, so it never autoplays and comes back paused on the same frame.
const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [overlay, setOverlay] = useState(
    () => localStorage.getItem(OVERLAY_KEY) === "on",
  );

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    Object.assign(window, { player });
    const saved = Number(sessionStorage.getItem(FRAME_KEY));
    if (saved > 0) player.seekTo(Math.min(saved, durationInFrames - 1));
    const save = () =>
      sessionStorage.setItem(FRAME_KEY, String(player.getCurrentFrame()));
    player.addEventListener("frameupdate", save);
    player.addEventListener("seeked", save);
    return () => {
      player.removeEventListener("frameupdate", save);
      player.removeEventListener("seeked", save);
    };
  }, []);

  const toggle = () => {
    localStorage.setItem(OVERLAY_KEY, overlay ? "off" : "on");
    setOverlay(!overlay);
  };

  return (
    <>
      <Player
        ref={ref}
        component={WithOverlay}
        inputProps={{ overlay: vertical && overlay }}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        controls
        acknowledgeRemotionLicense
        style={{ width: "100%", height: "100%" }}
      />
      {vertical && (
        <button
          onClick={toggle}
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 10,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background: overlay ? "#fff" : "rgba(255,255,255,0.12)",
            color: overlay ? "#000" : "#fff",
            font: "600 13px -apple-system, Helvetica, sans-serif",
            cursor: "pointer",
          }}
        >
          Instagram overlay: {overlay ? "on" : "off"}
        </button>
      )}
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
