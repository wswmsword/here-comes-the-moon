import { createEffect, createMemo, createSignal, Index, mergeProps, onCleanup, onMount } from "solid-js";

const CountingComponent = (_props) => {

	const props = mergeProps({ defaultI: 0, breakI: [0, 4], moons: ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"], frameTm: 48, dur: 208, onEnd: () => {} }, _props);

	const [_moons, setM] = createSignal(props.moons);
	/** 元素月亮们 */
	let moonRefs = [];
	let _breakI = [];
	let curI = 0;
	let transforming = false;
	let frameEnd = true;
	let zId = 0;
	let bookFirstToggle = false;

	_props.ref && _props.ref({
		play,
		stop() {
			transforming = false;
			frameEnd = true;
		},
		toggle() {
			if (bookFirstToggle) toggle();
			play(true);
			bookFirstToggle = true;
		}
	});

	createEffect(() => {
		_breakI = [].concat(props.breakI()).filter(n => n != null);
	});

	return <span
		role="presentation"
		classList={props.classList}
		class={props.class}
		style={{
			position: "relative",
			transition: `visibility ${props.dur}ms, opacity ${props.dur}ms`
		}}>
		<span
			aria-hidden
			class={props.moonClass}
			classList={props.moonClassList}
			style="visibility: hidden"/>
			<Index each={_moons()}>
				{(m, i) => {
					const isCur = props.defaultI === i;
					return <span
						class={props.moonClass}
						classList={props.moonClassList}
						onTransitionEnd={hidePrevFrame(i)}
						style={{
							position: "absolute",
							left: 0,
							opacity: isCur ? '' : 0,
							visibility: isCur ? '' : "hidden",
						}}
						ref={e => moonRefs[i] = e}>{m}</span>;
				}}
			</Index>
	</span>;

	function hidePrevFrame(i) {
		return function(e) {
			const len = _moons().length;
			if (e.propertyName === "opacity") { // 避免每个过渡动画属性触发回调
				const prevI = (i - 1 + len) % len;
				moonRefs[prevI].style.visibility = "hidden";
				moonRefs[prevI].style.zIndex = '';
				moonRefs[prevI].style.transition = '';
				moonRefs[prevI].style.opacity = 0;
				if (_breakI.some(_i => _i === i) && curI === i) {
					transforming = false;
					props.onEnd();
				}
			}
		}
	}

	function play(isToggle) {

		if (isToggle ? !frameEnd : transforming) return;
    transforming = true; // 上锁
    frameEnd = false; // 上锁

    let prevTime = document.timeline.currentTime;

    // 重置 z-index
    moonRefs[curI].style.zIndex = 0;
    zId = 0;

    window.requestAnimationFrame(spinLunarPhases);

    function spinLunarPhases(timestamp) {

      if (isToggle ? frameEnd : !transforming) return;

      if (timestamp - prevTime > props.frameTm) { // 间隔时间

				const nextI = (curI + 1) % _moons().length;

				curI = nextI;
        zId += 1;

        prevTime = timestamp;
        moonRefs[curI].style.opacity = 1;
        moonRefs[curI].style.visibility = '';
        moonRefs[curI].style.zIndex = zId;
        moonRefs[curI].style.transition = "inherit";

        // 新月和满月，结束
        if (_breakI.some(i => i === curI)) return frameEnd = true;
      }

      window.requestAnimationFrame(spinLunarPhases);
    }
	}

	function toggle() {

		const reversedMoons = _moons().toReversed();
		const len = _moons().length;

		if (len & 1 === 1 && (len - 1) / 2 === curI) { // 奇数长度，且当前帧位于正中间
			_breakI = _breakI.map(bI => (bI + len) % len);
			setM(reversedMoons);
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
			setM(newMoons);
		}
	}
};

/** 获得 n 基于 base 的镜像 */
function mirrorN(total, base, n) {
  const a = base - n;
  const b = (base - (-1) * a + total) % total;
  return b;
}

export default CountingComponent;