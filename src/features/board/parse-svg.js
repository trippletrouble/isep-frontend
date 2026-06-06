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

  const allTrackTiles = tiles.filter((t) => t.w === 90);

  const getSegment = (filterFn, sortFn) =>
    allTrackTiles.filter(filterFn).sort(sortFn);

  // 1. Left Arm (Top Row) -> moving Right
  const s1 = getSegment(
    (t) => t.y >= 680 && t.y <= 682 && t.x < 600,
    (a, b) => a.x - b.x,
  );
  // 2. Top Arm (Left Col) -> moving Up
  const s2 = getSegment(
    (t) => t.x >= 679 && t.x <= 681 && t.y < 600,
    (a, b) => b.y - a.y,
  );
  // 3. Top Arm (Tip) -> moving Right
  const s3 = getSegment(
    (t) => t.y >= 149 && t.y <= 151 && t.x > 681 && t.x < 890,
    (a, b) => a.x - b.x,
  );
  // 4. Top Arm (Right Col) -> moving Down
  const s4 = getSegment(
    (t) => t.x >= 889 && t.x <= 891 && t.y < 600,
    (a, b) => a.y - b.y,
  );
  // 5. Right Arm (Top Row) -> moving Right
  const s5 = getSegment(
    (t) => t.y >= 680 && t.y <= 682 && t.x > 900,
    (a, b) => a.x - b.x,
  );
  // 6. Right Arm (Tip) -> moving Down
  const s6 = getSegment(
    (t) => t.x >= 1524 && t.x <= 1526 && t.y > 682 && t.y < 892,
    (a, b) => a.y - b.y,
  );
  // 7. Right Arm (Bottom Row) -> moving Left
  const s7 = getSegment(
    (t) => t.y >= 891 && t.y <= 894 && t.x > 900,
    (a, b) => b.x - a.x,
  );
  // 8. Bottom Arm (Right Col) -> moving Down
  const s8 = getSegment(
    (t) => t.x >= 889 && t.x <= 891 && t.y > 900,
    (a, b) => a.y - b.y,
  );
  // 9. Bottom Arm (Tip) -> moving Left
  const s9 = getSegment(
    (t) => t.y >= 1527 && t.y <= 1529 && t.x < 890 && t.x > 681,
    (a, b) => b.x - a.x,
  );
  // 10. Bottom Arm (Left Col) -> moving Up
  const s10 = getSegment(
    (t) => t.x >= 679 && t.x <= 681 && t.y > 900,
    (a, b) => b.y - a.y,
  );
  // 11. Left Arm (Bottom Row) -> moving Left
  const s11 = getSegment(
    (t) => t.y >= 891 && t.y <= 894 && t.x < 600,
    (a, b) => b.x - a.x,
  );
  // 12. Left Arm (Tip) -> moving Up
  const s12 = getSegment(
    (t) => t.x >= 44 && t.x <= 47 && t.y < 891 && t.y > 682,
    (a, b) => b.y - a.y,
  );

  const clockwiseTrack = [
    ...s1,
    ...s2,
    ...s3,
    ...s4,
    ...s5,
    ...s6,
    ...s7,
    ...s8,
    ...s9,
    ...s10,
    ...s11,
    ...s12,
  ];

  const tsContent = `// Generated cleanly from board.svg
export interface Point {
  x: number;
  y: number;
}

// Your continuous 52-tile clockwise loop
export const CLOCKWISE_TRACK: Point[] = ${serialize(clockwiseTrack)};

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
