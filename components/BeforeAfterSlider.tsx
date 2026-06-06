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
    <div className="relative w-full overflow-hidden rounded-3xl">
      <img
        src={after}
        alt="Après"
        className="w-full block"
      />

      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt="Avant"
          className="w-full block"
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white"
        style={{ left: `${position}%` }}
      />

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) =>
          setPosition(Number(e.target.value))
        }
        className="absolute bottom-4 left-1/2 w-2/3 -translate-x-1/2"
      />

      <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full">
        Avant
      </div>

      <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full">
        Après
      </div>
    </div>
  );
}