"use client"

import Moon from "here-comes-the-moon";
import { useRef } from "react";

export default function Home() {
  const moonRef = useRef();
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <Moon ref={moonRef} breakI={[0, 4]} />
      <div style={{ display: "flex", gap: 9 }}>
        <button onClick={() => {
          moonRef.current.play();
        }}>play</button>
        <button onClick={() => {
          moonRef.current.stop();
        }}>stop</button>
        <button onClick={() => {
          moonRef.current.toggle();
        }}>toggle</button>
      </div>
    </main>
  );
}
