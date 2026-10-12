import { AbsoluteFill } from "remotion";
import { SAFE_ZONE, zoneOutline } from "../src/safe-zones";

// The Instagram Reels screen, drawn over a vertical video in the preview only.
const { width: W, height: H, bands } = SAFE_ZONE;
const PHONE = { w: 921, h: 2000 };
const SCALE = H / PHONE.h;

const font =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
const textShadow = "0 1px 3px rgba(0,0,0,0.35)";
const line = {
  fill: "none",
  stroke: "#fff",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Everything below is in phone px.
const Abs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      ...style,
    }}
  >
    {children}
  </div>
);

const Svg: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  vb?: string;
  children: React.ReactNode;
}> = ({ x, y, w, h, vb, children }) => (
  <svg
    style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
    width={w}
    height={h}
    viewBox={vb ?? `0 0 ${w} ${h}`}
  >
    {children}
  </svg>
);

const Avatar: React.FC<{
  x: number;
  y: number;
  d: number;
  hue: number;
  border?: number;
}> = ({ x, y, d, hue, border = 0 }) => (
  <Abs
    x={x}
    y={y}
    w={d}
    h={d}
    style={{
      borderRadius: "50%",
      boxSizing: "border-box",
      border: border ? `${border}px solid #fff` : undefined,
      background: `radial-gradient(circle at 50% 38%, hsl(${hue} 45% 78%) 0 22%, hsl(${hue} 30% 45%) 23% 100%)`,
    }}
  />
);

const Count: React.FC<{ cy: number; children: string }> = ({
  cy,
  children,
}) => (
  <Abs
    x={800}
    y={cy - 16}
    w={114}
    style={{
      textAlign: "center",
      fontSize: 23,
      fontWeight: 500,
      lineHeight: "32px",
      textShadow,
    }}
  >
    {children}
  </Abs>
);

// Rounded polygon path: each corner is cut r px back along both edges and curved through the vertex.
const roundedPoly = (pts: [number, number][], radii: number[]) => {
  const n = pts.length;
  const along = (a: [number, number], b: [number, number], d: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [a[0] + ((b[0] - a[0]) * d) / len, a[1] + ((b[1] - a[1]) * d) / len];
  };
  let d = "";
  pts.forEach((v, i) => {
    const r = radii[i];
    const prev = pts[(i + n - 1) % n];
    const next = pts[(i + 1) % n];
    const p1 = along(v, prev, r);
    const p2 = along(v, next, r);
    d += `${i === 0 ? "M" : "L"}${p1[0]},${p1[1]} Q${v[0]},${v[1]} ${p2[0]},${p2[1]} `;
  });
  return d + "Z";
};

// A paper plane: the left edge bends in at j, and the fold runs from j to `fold`.
const ShareIcon: React.FC<{
  tl: [number, number];
  tr: [number, number];
  b: [number, number];
  j: [number, number];
  fold: [number, number];
}> = ({ tl, tr, b, j, fold }) => (
  <svg
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    width={PHONE.w}
    height={PHONE.h}
  >
    <g {...line} strokeWidth={3.8}>
      <path d={roundedPoly([tl, tr, b, j], [9, 9, 8, 0.01])} />
      <path d={`M${j[0]},${j[1]} L${fold[0]},${fold[1]}`} />
    </g>
  </svg>
);
const HEART =
  "M12 19.6S2 13.8 2 7.2A5 5 0 0 1 12 4.7a5 5 0 0 1 10 2.5c0 6.6-10 12.4-10 12.4z";

const PhoneScreen: React.FC = () => (
  <div
    style={{
      position: "absolute",
      width: PHONE.w,
      height: PHONE.h,
      color: "#fff",
      fontFamily: font,
      overflow: "hidden",
    }}
  >
    {/* Status bar */}
    <Abs
      x={98}
      y={44}
      style={{
        fontSize: 37,
        fontWeight: 600,
        letterSpacing: -0.5,
        lineHeight: "44px",
        textShadow,
      }}
    >
      9:41
    </Abs>
    <Abs
      x={302}
      y={30}
      w={301}
      h={75}
      style={{ background: "#000", borderRadius: 38 }}
    />
    <Svg x={655} y={56} w={46} h={28}>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 12}
          y={20 - i * 6}
          width={8}
          height={8 + i * 6}
          rx={2.5}
          fill="#fff"
        />
      ))}
    </Svg>
    <Svg x={718} y={53} w={42} h={32} vb="0 0 24 18">
      <path
        d="M12 17.2 9.4 14.3a3.6 3.6 0 0 1 5.2 0zM5.9 10.8a8.6 8.6 0 0 1 12.2 0l-1.8 1.9a6 6 0 0 0-8.6 0zM2.4 7.2a13.6 13.6 0 0 1 19.2 0l-1.8 1.9a11 11 0 0 0-15.6 0z"
        fill="#fff"
      />
    </Svg>
    <Abs
      x={780}
      y={52}
      w={58}
      h={32}
      style={{
        borderRadius: 10,
        background: "#fff",
        color: "#000",
        fontSize: 24,
        fontWeight: 700,
        textAlign: "center",
        lineHeight: "32px",
      }}
    >
      81
    </Abs>
    <Abs
      x={841}
      y={62}
      w={4}
      h={12}
      style={{ borderRadius: 2, background: "rgba(255,255,255,0.6)" }}
    />

    {/* Header */}
    <Abs
      x={235}
      y={153}
      style={{
        fontSize: 46,
        fontWeight: 700,
        letterSpacing: -0.4,
        lineHeight: "60px",
        textShadow,
      }}
    >
      Reels
    </Abs>
    <Abs
      x={399}
      y={153}
      style={{
        fontSize: 46,
        fontWeight: 700,
        letterSpacing: -0.4,
        lineHeight: "60px",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      Friends
    </Abs>
    <Avatar x={585} y={163} d={38} hue={20} border={2} />
    <Avatar x={617} y={163} d={38} hue={340} border={2} />
    <Avatar x={650} y={163} d={38} hue={200} border={2} />
    <Svg x={828} y={160} w={48} h={46} vb="0 0 24 23">
      <g {...line} strokeWidth={2}>
        <path d="M2 5.5h7M16 5.5h6M2 17.5h4M13 17.5h9" />
        <path d="M12.5 8.6s-3-1.8-3-3.9a1.6 1.6 0 0 1 3-.9 1.6 1.6 0 0 1 3 .9c0 2.1-3 3.9-3 3.9z" />
        <path d="M9.5 20.6s-3-1.8-3-3.9a1.6 1.6 0 0 1 3-.9 1.6 1.6 0 0 1 3 .9c0 2.1-3 3.9-3 3.9z" />
      </g>
    </Svg>

    {/* Right column */}
    <Svg x={829} y={942} w={57} h={50} vb="0 0 24 21">
      <path {...line} strokeWidth={1.55} d={HEART} />
    </Svg>
    <Count cy={1028}>12.4K</Count>
    <Svg x={829} y={1086} w={55} h={53} vb="0 0 24 23">
      <path
        {...line}
        strokeWidth={1.6}
        d="M21.5 11a9.5 9.5 0 1 0-4 7.7l4 1.8-.8-4.2a9.4 9.4 0 0 0 .8-5.3z"
      />
    </Svg>
    <Count cy={1174}>214</Count>
    <svg
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      width={PHONE.w}
      height={PHONE.h}
    >
      <g {...line} strokeWidth={3.8}>
        <path d="M837,1270.5 V1255 A7.3,7.3 0 0 1 844.3,1247.7 H868" />
        <path d="M859.5,1237.5 L869.5,1247.7 L859.5,1257.9" />
        <path d="M878.7,1260.5 V1276.7 A7.3,7.3 0 0 1 871.4,1284 H848" />
        <path d="M857,1273.8 L847,1284 L857,1294.2" />
      </g>
    </svg>
    <Count cy={1335}>1,024</Count>
    <ShareIcon
      tl={[832, 1402]}
      tr={[883, 1402]}
      b={[856, 1446]}
      j={[846.6, 1421.5]}
      fold={[868, 1411.5]}
    />
    <Count cy={1482}>87</Count>
    <Svg x={836} y={1550} w={42} h={48} vb="0 0 18 21">
      <path {...line} strokeWidth={1.9} d="M2 1.5h14v18l-7-6-7 6z" />
    </Svg>
    <Count cy={1635}>356</Count>
    <Svg x={836} y={1706} w={43} h={26}>
      <path {...line} strokeWidth={4} d="M3 3h37M3 23h28" />
    </Svg>

    {/* Profile + caption */}
    <Avatar x={42} y={1490} d={91} hue={28} border={3} />
    <Abs
      x={107}
      y={1553}
      w={36}
      h={36}
      style={{
        borderRadius: "50%",
        background: "#ff3058",
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg width={22} height={20} viewBox="0 0 24 21">
        <path fill="#fff" d={HEART} />
      </svg>
    </Abs>
    <Avatar x={55} y={1615} d={53} hue={210} border={2} />
    <Avatar x={33} y={1642} d={53} hue={330} border={3} />
    <Abs
      x={124}
      y={1617}
      w={350}
      style={{ fontSize: 29, lineHeight: "34px", textShadow }}
    >
      <span style={{ fontWeight: 600 }}>yourhandle</span> and
      <br />
      <span style={{ fontWeight: 600 }}>collabpartner</span>
    </Abs>
    <Abs
      x={488}
      y={1630}
      w={123}
      h={50}
      style={{
        boxSizing: "border-box",
        border: "2px solid rgba(255,255,255,0.55)",
        borderRadius: 14,
        fontSize: 27,
        fontWeight: 600,
        textAlign: "center",
        lineHeight: "46px",
      }}
    >
      Follow
    </Abs>
    <Abs
      x={35}
      y={1713}
      w={730}
      style={{
        fontSize: 28,
        lineHeight: "40px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textShadow,
      }}
    >
      Your caption goes here and runs on for a while ...
    </Abs>

    {/* Progress */}
    <Abs
      x={33}
      y={1793}
      w={854}
      h={4}
      style={{ borderRadius: 2, background: "rgba(255,255,255,0.3)" }}
    />
    <Abs
      x={33}
      y={1793}
      w={57}
      h={4}
      style={{ borderRadius: 2, background: "#fff" }}
    />

    {/* Floating tab bar */}
    <Abs
      x={45}
      y={1830}
      w={831}
      h={122}
      style={{
        boxSizing: "border-box",
        borderRadius: 61,
        background: "rgba(48,44,42,0.72)",
        border: "1.5px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(20px)",
      }}
    />
    <Abs
      x={215}
      y={1840}
      w={177}
      h={102}
      style={{ borderRadius: 51, background: "rgba(255,255,255,0.14)" }}
    />
    <Svg x={119} y={1865} w={52} h={53} vb="0 0 24 25">
      <path
        {...line}
        strokeWidth={2}
        d="M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H15v-6.5H9v6.5H4.5A1.5 1.5 0 0 1 3 21z"
      />
    </Svg>
    <Svg x={280} y={1868} w={47} h={47} vb="0 0 24 24">
      <rect x={1.5} y={1.5} width={21} height={21} rx={5} fill="#fff" />
      <path d="M10 8.2v7.6l6-3.8z" fill="#2a2725" />
    </Svg>
    <ShareIcon
      tl={[436, 1873]}
      tr={[480, 1873]}
      b={[456, 1913]}
      j={[450.3, 1891]}
      fold={[466, 1882]}
    />
    <Abs
      x={481}
      y={1902}
      w={13}
      h={13}
      style={{ borderRadius: "50%", background: "#ff3040" }}
    />
    <Svg x={591} y={1864} w={51} h={51} vb="0 0 24 24">
      <g {...line} strokeWidth={2}>
        <circle cx={10.5} cy={10.5} r={7.5} />
        <path d="m16 16 5.5 5.5" />
      </g>
    </Svg>
    <Avatar x={750} y={1866} d={50} hue={45} />
  </div>
);

const ZONE = `M${zoneOutline(bands).join(" L")}Z`;

// Tall iPhones scale the video to fill the screen's height, so these strips never reach the glass.
const CROP = Math.round((W - PHONE.w * SCALE) / 2);
const CutOff: React.FC<{ side: "left" | "right" }> = ({ side }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      [side]: 0,
      width: CROP,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-evenly",
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        style={{
          writingMode: "vertical-rl",
          rotate: side === "left" ? "180deg" : undefined,
          color: "rgba(255,255,255,0.5)",
          fontFamily: font,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Cut off on phones
      </span>
    ))}
  </div>
);

export const InstagramOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: (W - PHONE.w * SCALE) / 2,
        top: 0,
        width: PHONE.w,
        height: PHONE.h,
        transform: `scale(${SCALE})`,
        transformOrigin: "0 0",
      }}
    >
      <PhoneScreen />
    </div>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path
        fillRule="evenodd"
        fill="rgba(0, 0, 0, 0.5)"
        d={`M0,0H${W}V${H}H0Z ${ZONE}`}
      />
      <path
        d={ZONE}
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={3}
        strokeDasharray="10 8"
      />
    </svg>
    <CutOff side="left" />
    <CutOff side="right" />
  </AbsoluteFill>
);
