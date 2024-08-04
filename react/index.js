import React, { forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef(function Moon({ defaultI = 0, breakI = [0, 4], moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm = 32, dur = 128 }, ref) {
  /** 当前月亮编号 */
  const curIRef = useRef(0);
  /** 元素月亮们 */
  const moonRefs = useRef([]);
  /** 是否正在动画 */
  const transformingRef = useRef(false);

  const _breakI = [].concat(breakI).filter(n => n != null);
  /** 一共几帧画面 */
  const len = moons.length;
  const remainCount = Math.ceil(dur / frameTm);

  const spanMoons = moons.map((m, i) => {
    const defaultIOffset = (defaultI - i + len) % len;
    const isRemain = remainCount >= defaultIOffset;
    return <span
      style={{
        position: "absolute",
        left: 0,
        visibility: isRemain ? '' : "hidden",
        opacity: isRemain ? '' : 0,
        zIndex: isRemain ? (remainCount - defaultIOffset + 1) : null,
      }}
      ref={e => moonRefs.current[i] = e}
      key={i}>{m}</span>});

  useImperativeHandle(ref, () => ({
    play,
    stop() {
      transformingRef.current = false;
    }
  }));

  return <span style={{ position: "relative", transition: `visibility ${dur}ms, opacity ${dur}ms` }} role="presentation">
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
        
        prevTime = timestamp;
        moonRefs.current[curI].style.opacity = '';
        moonRefs.current[curI].style.visibility = '';
        moonRefs.current[curI].style.zIndex = remainCount + 1;
        moonRefs.current[curI].style.transition = "inherit";
        for (let i = 0; i < remainCount; ++ i) {
          const curOffset = remainCount - i;
          const prevI = (curI - curOffset + len) % len;
          moonRefs.current[prevI].style.zIndex = remainCount - curOffset + 1;
        }
        const hiddenI = ((curI - remainCount - 1) + len) % len;
        moonRefs.current[hiddenI].style.opacity = 0;
        moonRefs.current[hiddenI].style.visibility = "hidden";
        moonRefs.current[hiddenI].style.zIndex = '';
        moonRefs.current[hiddenI].style.transition = '';

        // 新月和满月，结束
        if (_breakI.some(i => i === curI)) return transformingRef.current = false;
      }

      window.requestAnimationFrame(moonFrame);
    }
  }
})