"use client";

import { useState } from "react";

type Props = {
  before: string;
  after: string;
};

export default function BeforeAfterSlider({
  before,
  after,
}: Props) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl">
      
      {/* IMAGE AVANT */}
      <img
        src={before}
        alt="Avant"
        className="w-full h-auto block"
      />

      {/* IMAGE APRÈS */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={after}
          alt="Après"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LIGNE DU CURSEUR */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white"
        style={{ left: `${position}%` }}
      />

      {/* CURSEUR */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) =>
          setPosition(Number(e.target.value))
        }
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3"
      />

      {/* LABELS */}
      <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-full">
        Avant
      </div>

      <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full">
        Après
      </div>
    </div>
  );
}