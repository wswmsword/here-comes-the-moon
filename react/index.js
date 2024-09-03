import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

export default forwardRef(function Moon({ defaultI = 0, breakI = [0, 4], moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm = 48, dur = 208, onEnd = () => {}, moonClassName, className }, ref) {

  const [_moons, setM] = useState(moons);
  /** 当前月亮编号 */
  const curIRef = useRef(0);
  /** 元素月亮们 */
  const moonRefs = useRef([]);
  /** 是否正在动画 */
  const transformingRef = useRef(false);
  /** 帧是否结束，相比 transformingRef 更早 */
  const frameEndRef = useRef(true);
  /** 帧元素的 z-index，每一帧递增 */
  const zIdRef = useRef(0);
  /** 第一次 toggle 标记 */
  const bookFirstToggleRef = useRef(false);

  const _breakI = [].concat(breakI).filter(n => n != null);
  const breakIRef = useRef(_breakI);
  /** 一共几帧画面 */
  const len = moons.length;

  const spanMoons = _moons.map((m, i) => {
    const isCur = defaultI === i;
    return <span
      className={moonClassName}
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
      frameEndRef.current = true;
    },
    toggle() {
      if (bookFirstToggleRef.current) toggle();
      play(true);
      bookFirstToggleRef.current = true;
    },
  }));

  return <span className={className} style={{ position: "relative", transition: `visibility ${dur}ms, opacity ${dur}ms` }} role="presentation">
    <span className={moonClassName} aria-hidden style={{ visibility: "hidden" }}>{moons[0]}</span>
    {spanMoons}
  </span>;

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

  function play(isToggle) {

    if (isToggle ? !frameEndRef.current : transformingRef.current) return;
    transformingRef.current = true; // 上锁
    frameEndRef.current = false; // 上锁

    let prevTime = document.timeline.currentTime;

    // 重置 z-index
    moonRefs.current[curIRef.current].style.zIndex = 0;
    zIdRef.current = 0;

    window.requestAnimationFrame(spinLunarPhases);

    function spinLunarPhases(timestamp) {

      if (isToggle ? frameEndRef.current : !transformingRef.current) return;

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
        if (breakIRef.current.some(i => i === curI)) return frameEndRef.current = true;
      }

      window.requestAnimationFrame(spinLunarPhases);
    }
  }

  function toggle() {
    
    const reversedMoons = _moons.toReversed();
    const curI = curIRef.current;

    if (len & 1 === 1 && (len - 1) / 2 === curI) { // 奇数长度，且当前帧位于正中间
      _moons.current = reversedMoons;
      setM(_moons.current);
      breakIRef.current = breakIRef.current.map(bI => (bI + len) % len);
    } else {
      /** 当前位置，和当前位置的对称位置，之间的长度 */
      const centerOffset = (curI + 1) > (len / 2) ? (curI + 1) * 2 - len : len - curI * 2;

      const newMoons = [...reversedMoons];
      const edgeOffset = (len - centerOffset + 2);

      const times = Math.min(edgeOffset, centerOffset) - 1;

      /** pop，整体右移，尾部移出的元素推入头部 */
      const isPop = ((curI < len / 2) && edgeOffset < centerOffset) || ((curI >= len / 2) && centerOffset < edgeOffset);

      breakIRef.current = breakIRef.current.map(bI => mirrorN(len, curI, bI));

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

/** 获得 n 基于 base 的镜像 */
function mirrorN(total, base, n) {
  const a = base - n;
  const b = (base - (-1) * a + total) % total;
  return b;
}