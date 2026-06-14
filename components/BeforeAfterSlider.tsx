"use client";

import { useState } from "react";

type Props = {
  before: string;
  after: string;
};

export default function BeforeAfterSlider({ before, after }: Props) {
  const [position, setPosition] = useState(50);
  const afterIsActive = position >= 50;

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-black select-none">
      <img
        src={before}
        alt="Avant"
        className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-105"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={after}
          alt="Après"
          className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-105"
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white z-20"
        style={{ left: `${position}%` }}
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center font-bold text-gray-700"
        style={{ left: `${position}%` }}
      >
        ↔
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
      />

      <span
        className={`absolute top-4 left-4 z-30 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors duration-300 ${
          afterIsActive
            ? "bg-purple-600 text-white"
            : "bg-white/80 text-gray-700"
        }`}
      >
        APRÈS
      </span>

      <span
        className={`absolute top-4 right-4 z-30 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors duration-300 ${
          afterIsActive
            ? "bg-white/80 text-gray-700"
            : "bg-black/80 text-white"
        }`}
      >
        AVANT
      </span>
    </div>
  );
}
