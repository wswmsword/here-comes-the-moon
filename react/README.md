# here-comes-the-moon-react

<a href="https://996.icu"><img src="https://img.shields.io/badge/link-996.icu-red.svg" alt="996.icu" align="right"></a>

在同一位置逐帧渐变展示每个元素。如果提供了合适的元素，渐变每个元素就像播放一段动画。

## Installation

```bash
npm install --save here-comes-the-moon-react
```

## Props

- `defaultI`，number，默认帧的序列，默认 `0`；
- `breakI`，number[]，暂停帧的序列列表，默认 `[0, 4]`；
- `moons`，ReactNode[]，帧元素，默认 `["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"]`；
- `frameTm`，number，切换元素之间的间隔时间（ms），默认 `48`；
- `dur`，number，元素渐变的时间（ms），默认 `208`；
- `onEnd`，() => void，一段帧的播放结束后调用的函数；
- `moonClassName`，string，每个元素的样式。

## Ref

组件通过 ref 向外部提供了几个函数：

- `play`，播放，根据 `breakI` 判断是否结束动画；
- `stop`，暂停播放；
- `toggle`，切换元素切换的方向，切换从前向后或从后向前。

## Example

```javascript
import Moon from "here-comes-the-moon-react";
import { useRef } from "react";

export default function Example() {
  const moonRef = useRef();
  return <>
    <Moon ref={moonRef} breakI={[0, 4]} moons={["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"]} />
    <button onClick={() => {moonRef.current.play()}}>play</button>
    <button onClick={() => {moonRef.current.stop()}}>stop</button>
    <button onClick={() => {moonRef.current.toggle()}}>toggle</button>
  </>;
}
```

## 原理

查看[原理](../how-it-works.md)

## CHANGELOG

查看[更新日志](./CHANGELOG.md)。

## 版本规则

查看[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## 协议

查看 [MIT License](../LICENSE)。

## 支持与赞助

请随意 Issue、PR 和 Star，您也可以支付该项目，支付金额由您从该项目中获得的收益自行决定。

<details>
<summary>展开查看用于微信支付和支付宝支付的二维码。</summary>

<table>
  <tr align="center">
    <td>微信支付</td>
    <td>支付宝支付</td>
  </tr>
	<tr>
		<td><img src="../images/wechat-pay.png" alt="Pay through WeChat" /></td>
		<td><img src="../images/ali-pay.jpg" alt="Pay through AliPay" /></td>
	</tr>
</table>

</details>