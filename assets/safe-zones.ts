// Instagram Reels at 1080×1920, measured from a real iPhone screen: where text and key info
// stay readable, top to bottom. Tall phones trim about 98px off each side; the lower band
// narrows for the like/comment/share column. Graphics behind the speaker may run past it.

export type Band = { top: number; bottom: number; left: number; right: number };

export const SAFE_ZONE = {
  width: 1080,
  height: 1920,
  bands: [
    { top: 220, bottom: 890, left: 130, right: 950 },
    { top: 890, bottom: 1430, left: 130, right: 870 },
  ] satisfies Band[],
};

// The zone's outline: down the right side of each band, then back up the left.
export const zoneOutline = (bands: Band[]): [number, number][] => [
  ...bands.flatMap((b): [number, number][] => [
    [b.right, b.top],
    [b.right, b.bottom],
  ]),
  ...[...bands].reverse().flatMap((b): [number, number][] => [
    [b.left, b.bottom],
    [b.left, b.top],
  ]),
];
