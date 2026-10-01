const paths: Record<string, string[]> = {
  library: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  overview: ["M3 11 12 3l9 8v10H3z", "M9 21v-8h6v8"],
  notes: ["M5 3h14v18H5z", "m8 9 2 2 5-5", "M8 15h8"],
  characters: [
    "M16 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3",
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    "M17 4a4 4 0 0 1 0 7",
    "M21 21v-3a4 4 0 0 0-3-4",
  ],
  world: [
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    "M3 12h18",
    "M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
  ],
  plan: [
    "M4 4h5v5H4z",
    "M15 15h5v5h-5z",
    "M15 3h5v5h-5z",
    "M9 6h6",
    "M6 9v8h9",
  ],
  novel: [
    "M3 4h6c2 0 3 1 3 3v14c0-2-1-3-3-3H3z",
    "M21 4h-6c-2 0-3 1-3 3v14c0-2 1-3 3-3h6z",
  ],
  comic: ["M3 3h18v18H3z", "M3 10h18", "M12 10v11"],
  assets: ["M3 4h18v16H3z", "m3 17 6-6 4 4 3-3 5 5", "M15 8h.01"],
  settings: [
    "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8",
    "M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  ],
  chevron: ["m9 5 7 7-7 7"],
  back: ["m15 5-7 7 7 7"],
  plus: ["M12 4v16", "M4 12h16"],
  search: ["M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0", "m15 15 6 6"],
  menu: ["M3 5h18M3 12h18M3 19h18"],
  collapse: ["M3 3h18v18H3z", "M8 3v18", "m15 9-3 3 3 3"],
  focus: ["M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"],
  spark: ["m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"],
  arrow: ["M4 12h16", "m14 6 6 6-6 6"],
  clock: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", "M12 7v5l3 2"],
  close: ["m5 5 14 14M5 19 19 5"],
};
const grip = [
  [9, 5],
  [15, 5],
  [9, 12],
  [15, 12],
  [9, 19],
  [15, 19],
] as const;
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const dotted = name === "grip";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={dotted ? "currentColor" : "none"}
      stroke={dotted ? "none" : "currentColor"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dotted
        ? grip.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.35" />
          ))
        : (paths[name] ?? paths.spark).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
