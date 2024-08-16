import React, { forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef(function Moon({ defaultI = 0, breakI = [0, 4], moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm = 32, dur = 128, onEnd = () => {} }, ref) {
  /** 当前月亮编号 */
  const curIRef = useRef(0);
  /** 元素月亮们 */
  const moonRefs = useRef([]);
  /** 是否正在动画 */
  const transformingRef = useRef(false);
  /** 帧元素的 z-index，每一帧递增 */
  const zIdRef = useRef(0);

  const _breakI = [].concat(breakI).filter(n => n != null);
  /** 一共几帧画面 */
  const len = moons.length;

  const spanMoons = moons.map((m, i) => {
    const isCur = defaultI === i;
    return <span
      onTransitionEnd={hidePrevFrame(i)}
      style={{
        position: "absolute",
        left: 0,
        opacity: isCur ? '' : 0,
        visibility: isCur ? '' : "hidden",
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

  function hidePrevFrame(i) {
    return function() {
      const prevI = (i - 1 + len) % len;
      moonRefs.current[prevI].style.visibility = "hidden";
      moonRefs.current[prevI].style.zIndex = '';
      moonRefs.current[prevI].style.transition = '';
      moonRefs.current[prevI].style.opacity = 0;
      if (_breakI.some(_i => _i === i) && curIRef.current === i) {
        transformingRef.current = false;
        onEnd();
      }
    }
  }

  function play() {

    if (transformingRef.current) return;

    transformingRef.current = true; // 上锁

    let prevTime = document.timeline.currentTime;
    const len = moons.length;

    // 重置 z-index
    moonRefs.current[curIRef.current].style.zIndex = 0;
    zIdRef.current = 0;

    window.requestAnimationFrame(moonFrame);

    function moonFrame(timestamp) {

      if (!transformingRef.current) return;

      if (timestamp - prevTime > frameTm) { // 间隔时间

        const curI = (curIRef.current + 1) % len;
        curIRef.current = curI;
        zIdRef.current += 1;
        
        prevTime = timestamp;
        moonRefs.current[curI].style.opacity = 1;
        moonRefs.current[curI].style.visibility = '';
        moonRefs.current[curI].style.zIndex = zIdRef.current;
        moonRefs.current[curI].style.transition = "inherit";

        // 新月和满月，结束
        if (_breakI.some(i => i === curI)) return ;
      }

      window.requestAnimationFrame(moonFrame);
    }
  }
})