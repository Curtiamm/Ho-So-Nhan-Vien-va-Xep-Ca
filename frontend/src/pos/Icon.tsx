import type { CSSProperties } from 'react';
const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  table: 'M4 7h16v10H4z M7 3v4m10-4v4M7 17v4m10-4v4',
  menu: 'M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4z M13 6a3 3 0 0 1 3-3h4v16h-3a4 4 0 0 0-4 2',
  box: 'm12 3 9 5-9 5-9-5 9-5z M3 8v9l9 5 9-5V8M12 13v9M7 5l10 5',
  chart: 'M4 3v17h17M8 15v-4m5 4V7m5 8V4',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  people:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17 3a4 4 0 0 1 0 8',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  receipt: 'M5 3l3 2 4-2 4 2 3-2v18l-3-2-4 2-4-2-3 2zM9 9h6m-6 4h6',
  wifi: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-10 4a5 5 0 0 1 6 0m-3 4h.01',
  leaf: 'M20 3C6 2 1 9 6 16c7 7 15 0 14-13zM4 21 15 10',
  coffee:
    'M3 7h13v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M16 8h2a3 3 0 1 1 0 6h-2M6 2v2m4-2v2m4-2v2',
  dish: 'M3 16h18M5 16a7 7 0 0 1 14 0M12 6v3M3 20h18',
  cake: 'M4 12h16v9H4zM4 16q2 3 4 0 2 3 4 0 2 3 4 0 2 3 4 0M8 12V7m8 5V7M8 3v1m8-1v1',
  tag: 'M3 3h8l10 10-8 8L3 11z M7 7h.01',
  wallet: 'M3 6h17v15H3zM3 6V3h14v3M15 12h6v5h-6z',
  edit: 'm14 5 5 5M4 20l5-1L21 7l-5-5L4 14z',
  help: 'M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  fork: 'M4 3v6a3 3 0 0 0 6 0V3M7 3v18M19 3c-4 3-4 8 0 9V3Zm0 9v9',
};
export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
