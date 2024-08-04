import React, { forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef(function Moon({ defaultI = 0, breakI = [0, 4], moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm = 32, dur = 150 }, ref) {
  /** 当前月亮编号 */
  const curIRef = useRef(0);
  /** 元素月亮们 */
  const moonRefs = useRef([]);
  /** 是否正在动画 */
  const transformingRef = useRef(false);

  const _breakI = [].concat(breakI).filter(n => n != null);

  const spanMoons = moons.map((m, i) =>
    <span
      style={{
        position: "absolute",
        left: 0,
        visibility: i === defaultI ? 'visible' : 'hidden',
        opacity: i === defaultI ? 1 : 0,
        transition: `visibility ${dur}ms, opacity ${dur}ms, z-index ${dur}ms`,
      }}
      ref={e => moonRefs.current[i] = e}
      key={i}>{m}</span>);

  useImperativeHandle(ref, () => ({
    play,
    stop() {
      transformingRef.current = false;
    }
  }));

  return <span style={{ position: "relative" }} role="presentation">
    <span aria-hidden style={{ visibility: "hidden" }}>{moons[0]}</span>
    {spanMoons}
  </span>;

  function play() {

    if (transformingRef.current) return;

    transformingRef.current = true; // 上锁

    let prevTime = document.timeline.currentTime;
    const len = moons.length;

    window.requestAnimationFrame(moonFrame);

    function moonFrame(timestamp) {

      if (!transformingRef.current) return;

      if (timestamp - prevTime > frameTm) { // 间隔时间

        const curI = (curIRef.current + 1) % len;
        curIRef.current = curI;
        
        const prev1 = (curIRef.current + len - 1) % len;
        const prev2 = (curIRef.current + len - 2) % len;
        prevTime = timestamp;
        moonRefs.current[curI].style.opacity = 1;
        moonRefs.current[curI].style.visibility = "visible";
        moonRefs.current[curI].style.zIndex = 1;
        moonRefs.current[prev1].style.zIndex = 0;
        moonRefs.current[prev2].style.opacity = 0;
        moonRefs.current[prev2].style.visibility = "hidden";

        // 新月和满月，结束
        if (_breakI.some(i => i === curI)) return transformingRef.current = false;
      }

      window.requestAnimationFrame(moonFrame);
    }
  }
})