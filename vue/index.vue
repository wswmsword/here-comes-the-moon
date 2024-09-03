<template>
  <span role="presentation" :class="props.class" :style="`position: relative; transition: visibility ${props.dur}ms, opacity ${props.dur}ms;`">
    <span :class="props.moonClass" aria-hidden style="visibility: hidden">{{props.moons[0]}}</span>
    <span
      v-for="(moon, i) in _moons" :key="i"
      :className="props.moonClass"
      :style="`position: absolute; left: 0; opacity: ${props.defaultI === i ? '' : 0}; visibility: ${props.defaultI === i ? '' : 'hidden'}`"        
      ref="moonRefs">{{moon}}</span>
  </span>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  defaultI: { default: 0 },
  breakI: { default: [0, 4] },
  moons: { default: ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"] },
  frameTm: { default: 48 },
  dur: { default: 208 },
  onEnd: { default: () => {} },
  moonClass: { default: "" },
  class: { default: "" },
});

const _moons = ref(props.moons);
let curI = 0;
const moonRefs = ref([]);
let transforming = false;
let frameEnd = true;
let zId = 0;
let bookFirstToggle = false;
let _breakI = [];

let transitionListeners = [];

watch(() => props.breakI, v => {
  _breakI = [].concat(v).filter(n => n != null);
}, { immediate: true });

onMounted(() => {
  moonRefs.value.forEach((m, i) => {
    const l = hidePrevFrame(i);
    m.addEventListener("transitionend", l);
    transitionListeners.push(l);
  });
});

onUnmounted(() => {
  moonRefs.value.forEach((m, i) => {
    m.addEventListener("transitionend", transitionListeners[i]);
  });
});

defineExpose({
  play,
  stop() {
    transforming = false;
    frameEnd = true;
  },
  toggle() {
    if (bookFirstToggle) toggle();
    play(true);
    bookFirstToggle = true;
  },
});

function hidePrevFrame(i) {
  return function(e) {
    const len = _moons.value.length;
    if (e.propertyName === "opacity") { // 避免每个过渡动画属性触发回调
      const prevI = (i - 1 + len) % len;
      moonRefs.value[prevI].style.visibility = "hidden";
      moonRefs.value[prevI].style.zIndex = '';
      moonRefs.value[prevI].style.transition = '';
      moonRefs.value[prevI].style.opacity = 0;
      if (_breakI.some(_i => _i === i) && curI === i) {
        transforming = false;
        props.onEnd?.();
      }
    }
  }
}

function play(isToggle) {

  if (isToggle ? !frameEnd : transforming) return;

  transforming = true; // 上锁
  frameEnd = false; // 上锁

  let prevTime = document.timeline.currentTime;

  moonRefs.value[curI].style.zIndex = 0;
  zId = 0;

  window.requestAnimationFrame(spinLunarPhases);

  function spinLunarPhases(timestamp) {

    if (isToggle ? frameEnd : !transforming) return;

    if (timestamp - prevTime > props.frameTm) {

      const nextI = (curI + 1) % _moons.value.length;

      curI = nextI;
      zId += 1;

      prevTime = timestamp;
      moonRefs.value[curI].style.opacity = 1;
      moonRefs.value[curI].style.visibility = '';
      moonRefs.value[curI].style.zIndex = zId;
      moonRefs.value[curI].style.transition = "inherit";

      if (_breakI.some(i => i === curI)) return frameEnd = true;
    }

    window.requestAnimationFrame(spinLunarPhases);
  }
}

function toggle() {
  const reversedMoons = _moons.value.toReversed();
  const len = _moons.value.length;

  if (len & 1 === 1 && (len - 1) / 2 === curI) { // 奇数长度，且当前帧位于正中间
    _moons.value = reversedMoons;
    _breakI = _breakI.map(bI => (bI + len) % len);
  } else {
    /** 当前位置，和当前位置的对称位置，之间的长度 */
    const centerOffset = (curI + 1) > (len / 2) ? (curI + 1) * 2 - len : len - curI * 2;

    const newMoons = [...reversedMoons];
    const edgeOffset = (len - centerOffset + 2);

    const times = Math.min(edgeOffset, centerOffset) - 1;

    /** pop，整体右移，尾部移出的元素推入头部 */
    const isPop = ((curI < len / 2) && edgeOffset < centerOffset) || ((curI >= len / 2) && centerOffset < edgeOffset);

    _breakI = _breakI.map(bI => mirrorN(len, curI, bI));

    for (let i = 0; i < times; ++ i) {

      if (isPop) {
        const moon = newMoons.pop();
        newMoons.unshift(moon);
      } else {
        const moon = newMoons.shift();
        newMoons.push(moon);
      }
    }
    _moons.value = newMoons;
  }
}

/** 获得 n 基于 base 的镜像 */
function mirrorN(total, base, n) {
  const a = base - n;
  const b = (base - (-1) * a + total) % total;
  return b;
}
</script>
