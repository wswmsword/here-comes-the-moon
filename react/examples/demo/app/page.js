"use client"

import Moon from "here-comes-the-moon";
import { useRef } from "react";

export default function Home() {
  const moonRef = useRef();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Moon ref={moonRef} breakI={[0, 4]} />
      <button onClick={() => {
        moonRef.current.play();
      }}>play</button>
      <button onClick={() => {
        moonRef.current.stop();
      }}>stop</button>
    </main>
  );
}
