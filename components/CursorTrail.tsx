"use client";

import { useEffect, useState, useRef } from "react";

const TRAIL_LENGTH = 5; // number of dots
const SPEED = 0.5; // lower = more lag

export default function CursorTrail() {
  const requestRef = useRef<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setTrail((prevTrail) => {
        const newTrail = [...prevTrail];

        newTrail[0] = {
          x: newTrail[0].x + (mousePos.x - newTrail[0].x) * SPEED,
          y: newTrail[0].y + (mousePos.y - newTrail[0].y) * SPEED,
        };

        for (let i = 1; i < newTrail.length; i++) {
          newTrail[i] = {
            x: newTrail[i].x + (newTrail[i - 1].x - newTrail[i].x) * SPEED,
            y: newTrail[i].y + (newTrail[i - 1].y - newTrail[i].y) * SPEED,
          };
        }

        return newTrail;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mousePos]);

  return (
    <>
      {trail.map((pos, i) => {
        const size = 12 - i; // decreasing size
        const opacity = 1 - i / TRAIL_LENGTH; // fading effect

        return (
          <div
            key={i}
            className="pointer-events-none fixed top-0 left-0 rounded-full bg-gray-500"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              transform: `translate3d(${pos.x - size / 2}px, ${
                pos.y - size / 2
              }px, 0)`,
              zIndex: 500,
            }}
          ></div>
        );
      })}
    </>
  );
}
