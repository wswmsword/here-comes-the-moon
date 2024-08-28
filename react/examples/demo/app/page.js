"use client"

import Moon from "here-comes-the-moon-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const moonRef = useRef();
  const moonRef2 = useRef();
  const [more, setM] = useState([]);

  const [loading, setL] = useState(false);

  useEffect(() => {
    if (loading) {
      moonRef2.current.play();
      setTimeout(() => {
        setL(false);
        setM(v => [...v, 'more!'])
        moonRef2.current.stop();
      }, 1998);
    }
  }, [loading]);

  return (
    <main className="flex min-h-screen flex-col items-center py-8 box-border gap-8">
      <Moon ref={moonRef} breakI={[0, 4]} moonClassName="text-3xl" />
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
        <button onClick={() => { setL(true) }}>load more</button>
      </div>
      {loading && <div className="fixed top-4 left-4"><Moon ref={moonRef2} breakI={null} moonClassName="text-xl" frameTm={80} dur={196} /></div>}
      <div>
        {more.map((m, i) => <div className="text-5xl" key={i}>{m}</div>)}
      </div>
    </main>
  );
}
