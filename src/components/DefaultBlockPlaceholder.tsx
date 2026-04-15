"use client";

export function DefaultBlockPlaceholder() {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-[#8B8B5C] to-[#4A4A35] flex items-center justify-center relative overflow-hidden">
      {/* Grass Block pixel art */}
      <div className="relative w-32 h-32">
        {/* Top grass face */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#7EBD4B] to-[#5CD65C]">
          {/* Grass blade details */}
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-1 bg-[#6DB040]"
                style={{
                  left: `${i * 8}px`,
                  top: `${i % 2 === 0 ? 2 : 4}px`,
                  width: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Front dirt face */}
        <div className="absolute top-8 left-0 right-0 h-16 bg-gradient-to-b from-[#9B7653] to-[#8B6F47]">
          {/* Dirt texture dots */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#6B4A27]"
                style={{
                  left: `${Math.random() * 128}px`,
                  top: `${Math.random() * 64}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Side shadow */}
        <div className="absolute top-8 right-0 w-4 h-16 bg-gradient-to-r from-[#7B5F3A] to-[#5B453A]" />
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/60 font-pixel">No Image</p>
      </div>
    </div>
  );
}
