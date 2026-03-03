/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type CursorOrigin = "top-left" | "top-center";

export function PeerCursorsOverlay({
  peers,
  className,
}: {
  peers: Array<{
    name: string;
    color: string;
    x: number;
    y: number;
    origin: CursorOrigin;
  }>;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        zIndex: 999,
        pointerEvents: "none",
        position: "absolute",
        overflow: "hidden",
        inset: 0,
      }}
    >
      {peers.map(({ color, x, y, origin }, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          transform="translate(-2 -2)"
          fill={color}
          stroke="#000"
          style={{
            position: "absolute",
            left: origin === "top-center" ? `calc(50% + ${x}px)` : `${x}px`,
            top: `${y}px`,
          }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
        </svg>
      ))}
    </div>
  );
}
