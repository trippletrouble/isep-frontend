import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const svgPath = path.join(__dirname, "board.svg");
  const svgString = fs.readFileSync(svgPath, "utf8");

  const rectBlockRegex = /<rect\s+([^>]+)>/g;

  const tiles = [];
  let match;

  while ((match = rectBlockRegex.exec(svgString)) !== null) {
    const attrString = match[1];

    const xM = attrString.match(/x="([\d.]+)"/);
    const yM = attrString.match(/y="([\d.]+)"/);
    const wM = attrString.match(/width="([\d.]+)"/);
    const hM = attrString.match(/height="([\d.]+)"/);
    const fM = attrString.match(/fill="([^"]+)"/i);

    if (wM && hM && fM) {
      const x = xM ? parseFloat(xM[1]) : 0;
      const y = yM ? parseFloat(yM[1]) : 0;
      const w = parseFloat(wM[1]);
      const h = parseFloat(hM[1]);
      const fill = fM[1].toUpperCase();

      const cx = Math.round((x + w / 2) * 10) / 10;
      const cy = Math.round((y + h / 2) * 10) / 10;

      tiles.push({ x: cx, y: cy, w: Math.round(w), fill });
    }
  }

  const trackTiles = tiles.filter((t) => t.w === 90);
  const nestSlots = tiles.filter((t) => t.w === 133 || t.w === 132);

  const serialize = (arr) =>
    JSON.stringify(
      arr.map((t) => ({ x: t.x, y: t.y })),
      null,
      2,
    );

  const tsContent = `// Generated from board.svg
export interface Point {
  x: number;
  y: number;
}

// 52-tile clockwise loop
export const CLOCKWISE_TRACK: Point[] = [
  { x: 680.5, y: 1423 }, // Red Start (Index 0)
  { x: 680.5, y: 1318 },
  { x: 680.5, y: 1213 },
  { x: 680.5, y: 1108 },
  { x: 680.5, y: 1003 },
  { x: 570.5, y: 892 },
  { x: 465.5, y: 892 },
  { x: 360.5, y: 892 },
  { x: 255.5, y: 892 },
  { x: 150.5, y: 892 },
  { x: 45.5, y: 893 },
  { x: 45.5, y: 787 },
  { x: 45.5, y: 681 },
  { x: 150.5, y: 680 }, // Blue Start (Index 13)
  { x: 255.5, y: 680 },
  { x: 360.5, y: 680 },
  { x: 465.5, y: 680 },
  { x: 570.5, y: 680 },
  { x: 680, y: 570 },
  { x: 680, y: 465 },
  { x: 680, y: 360 },
  { x: 680, y: 255 },
  { x: 680, y: 150 },
  { x: 680, y: 45 },
  { x: 785, y: 45 },
  { x: 890, y: 45 },
  { x: 890, y: 150 }, // Yellow Start (Index 26)
  { x: 890, y: 255 },
  { x: 890, y: 360 },
  { x: 890, y: 465 },
  { x: 890, y: 570 },
  { x: 1000.5, y: 681 },
  { x: 1105.5, y: 681 },
  { x: 1210.5, y: 680 },
  { x: 1315.5, y: 680 },
  { x: 1420.5, y: 680 },
  { x: 1525.5, y: 680 },
  { x: 1525.5, y: 786 },
  { x: 1525.5, y: 892 },
  { x: 1420.5, y: 892 }, // Green Start (Index 39)
  { x: 1315.5, y: 892 },
  { x: 1210.5, y: 892 },
  { x: 1105.5, y: 893 },
  { x: 1000.5, y: 893 },
  { x: 890.5, y: 1003 },
  { x: 890.5, y: 1108 },
  { x: 890.5, y: 1213 },
  { x: 890.5, y: 1318 },
  { x: 890.5, y: 1423 },
  { x: 890.5, y: 1528 },
  { x: 785.5, y: 1528 },
  { x: 680.5, y: 1528 },
];

export const GREY_TRACK: Point[] = ${serialize(trackTiles.filter((t) => t.fill === "#5B5B5B"))};
export const RED_TILES: Point[] = ${serialize(trackTiles.filter((t) => t.fill === "#DB5757"))};
export const YELLOW_TILES: Point[] = ${serialize(trackTiles.filter((t) => t.fill === "#EBE036"))};
export const BLUE_TILES: Point[] = ${serialize(trackTiles.filter((t) => t.fill === "#577CDB"))};
export const GREEN_TILES: Point[] = ${serialize(trackTiles.filter((t) => t.fill === "#57DB8F"))};
export const NEST_SLOTS: Point[] = ${serialize(nestSlots)};
`;

  fs.writeFileSync(path.join(__dirname, "BoardPath.ts"), tsContent, "utf8");
  console.log(`\nParsed tiles: ${trackTiles.length}`);
} catch (error) {
  console.error(error);
}
