import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

export default forwardRef(function Moon({ defaultI = 0, breakI = [0, 4], moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm = 48, dur = 208, onEnd = () => {} }, ref) {
  const [_moons, setM] = useState(moons);
  /** 当前月亮编号 */
  const curIRef = useRef(0);
  /** 元素月亮们 */
  const moonRefs = useRef([]);
  /** 是否正在动画 */
  const transformingRef = useRef(false);
  /** 帧元素的 z-index，每一帧递增 */
  const zIdRef = useRef(0);

  const _breakI = [].concat(breakI).filter(n => n != null);
  const breakIRef = useRef(_breakI);
  /** 一共几帧画面 */
  const len = moons.length;

  const spanMoons = _moons.map((m, i) => {
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
    },
    toggle,
  }));

  return <><span style={{ position: "relative", transition: `visibility ${dur}ms, opacity ${dur}ms` }} role="presentation">
    <span aria-hidden style={{ visibility: "hidden" }}>{moons[0]}</span>
    {spanMoons}
  </span></>;

  function hidePrevFrame(i) {
    return function(e) {
      if (e.propertyName === "opacity") { // 避免每个过渡动画属性触发回调
        const prevI = (i - 1 + len) % len;
        moonRefs.current[prevI].style.visibility = "hidden";
        moonRefs.current[prevI].style.zIndex = '';
        moonRefs.current[prevI].style.transition = '';
        moonRefs.current[prevI].style.opacity = 0;
        if (breakIRef.current.some(_i => _i === i) && curIRef.current === i) {
          transformingRef.current = false;
          onEnd();
        }
      }
    }
  }

  function play() {

    if (transformingRef.current) return;

    transformingRef.current = true; // 上锁

    let prevTime = document.timeline.currentTime;

    // 重置 z-index
    moonRefs.current[curIRef.current].style.zIndex = 0;
    zIdRef.current = 0;

    window.requestAnimationFrame(moonFrame);

    function moonFrame(timestamp) {

      if (!transformingRef.current) return;

      if (timestamp - prevTime > frameTm) { // 间隔时间

        const curI = (curIRef.current + 1) % len;
        // console.log(curI);
        curIRef.current = curI;
        zIdRef.current += 1;
        
        prevTime = timestamp;
        moonRefs.current[curI].style.opacity = 1;
        moonRefs.current[curI].style.visibility = '';
        moonRefs.current[curI].style.zIndex = zIdRef.current;
        moonRefs.current[curI].style.transition = "inherit";

        // 新月和满月，结束
        if (breakIRef.current.some(i => i === curI)) return ;
      }

      window.requestAnimationFrame(moonFrame);
    }
  }

  function toggle() {

    if (!transformingRef.current) return play();
    
    const reversedMoons = _moons.toReversed();
    const curI = curIRef.current;

    if (len & 1 === 1 && (len - 1) / 2 === curI) {
      _moons.current = reversedMoons
      setM(_moons.current);
      breakIRef.current = breakIRef.current.map(bI => (bI + len) % len);
    } else {

      const centerOffset = (curI + 1) > (len / 2) ? (curI + 1) * 2 - len : len - curI * 2;

      const newMoons = [...reversedMoons];
      const edgeOffset = (len - centerOffset + 2);

      const times = Math.min(edgeOffset, centerOffset) - 1;

      const isPop = ((curI < len / 2) && edgeOffset < centerOffset) || ((curI >= len / 2) && centerOffset < edgeOffset)

      breakIRef.current = breakIRef.current.map(bI => isPop ? (bI + times - 1) % len : (bI - times + len - 1) % len);

      for (let i = 0; i < times; ++ i) {

        if (isPop) {
          const moon = newMoons.pop();
          newMoons.unshift(moon);
        } else {
          const moon = newMoons.shift();
          newMoons.push(moon);
        }
      }
      setM(newMoons);
    }
  }
})