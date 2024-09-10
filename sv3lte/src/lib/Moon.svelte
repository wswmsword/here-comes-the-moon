<script>
  export let defaultI = 0;
  export let breakI = [0, 4];
  export let moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"];
  export let frameTm = 48;
  export let dur = 208;
  export let onEnd = () => {};
  export let moonClass = '';
  export let clas = '';

  let _moons = moons;
  let moonRefs = [];

  const breakIRef = { current: [] };
  const curIRef = { current: 0 };
  const transformingRef = { current: false };
  const frameEndRef = { current: true };
  const zIdRef = { current: 0 };
  const bookFirstToggle = { current: false };

  $: {
    breakIRef.current = [].concat(breakI).filter(n => n != null);
  }
  
  function hidePrevFrame(i) {
    return function(e) {
      if (e.propertyName === "opacity") { // 避免每个过渡动画属性触发回调
        const len = _moons.length;
        const prevI = (i - 1 + len) % len;
        moonRefs[prevI].style.visibility = "hidden";
        moonRefs[prevI].style.zIndex = '';
        moonRefs[prevI].style.transition = '';
        moonRefs[prevI].style.opacity = 0;
        if (breakIRef.current.some(_i => _i === i) && curIRef.current === i) {
          transformingRef.current = false;
          onEnd();
        }
      }
    }
  }

  export function play() {
    _play();
  }

  function _play(isToggle) {

    if (isToggle ? !frameEndRef.current : transformingRef.current) return;
    transformingRef.current = true; // 上锁
    frameEndRef.current = false; // 上锁

    const len = _moons.length;
    
    let prevTime = document.timeline.currentTime;

    // 重置 z-index
    moonRefs[curIRef.current].style.zIndex = 0;
    zIdRef.current = 0;

    window.requestAnimationFrame(spinLunarPhases);

    function spinLunarPhases(timestamp) {

      if (isToggle ? frameEndRef.current : !transformingRef.current) return;

      if (timestamp - prevTime > frameTm) { // 间隔时间

        const curI = (curIRef.current + 1) % len;

        curIRef.current = curI;
        zIdRef.current += 1;

        prevTime = timestamp;
        moonRefs[curI].style.opacity = 1;
        moonRefs[curI].style.visibility = '';
        moonRefs[curI].style.zIndex = zIdRef.current;
        moonRefs[curI].style.transition = "inherit";

        // 新月和满月，结束
        if (breakIRef.current.some(i => i === curI)) return frameEndRef.current = true;
      }

      window.requestAnimationFrame(spinLunarPhases);
    }
  }

  export function toggle() {
    if (bookFirstToggle.current) _toggle();
    _play(true);
    bookFirstToggle.current = true;
  }

  function _toggle() {
    const reversedMoons = _moons.toReversed();
    const len = _moons.length;
    const curI = curIRef.current;

    if (len & 1 === 1 && (len - 1) / 2 === curI) { // 奇数长度，且当前帧位于正中间
      _moons = reversedMoons;
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
      _moons = newMoons;
    }
  }

  export function stop() {
    transformingRef.current = false;
    frameEndRef.current = true;
  }

  /** 获得 n 基于 base 的镜像 */
  function mirrorN(total, base, n) {
    const a = base - n;
    const b = (base - (-1) * a + total) % total;
    return b;
  }
</script>

<span class={clas} style="position: relative; transition: visibility {dur}ms, opacity {dur}ms" role="presentation">
  <span aria-hidden class={moonClass} style="visibility: hidden;">{moons[0]}</span>
  {#each _moons as m, i}
    {@const isCur = defaultI === i}
    <span
      bind:this={moonRefs[i]}
      class={moonClass}
      style="position: absolute; left: 0; opacity: {isCur ? '' : 0}; visibility: {isCur ? '' : "hidden"}"
      on:transitionend={hidePrevFrame(i)}>
      {m}
    </span>
  {/each}
</span>

<style>
</style>