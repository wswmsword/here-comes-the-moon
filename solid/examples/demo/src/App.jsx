import logo from './logo.svg';
import styles from './App.module.css';
import Moon from 'here-comes-the-moon-solid';
import { createSignal } from 'solid-js';

function App() {

  const c = <div>{1}</div>;
  const [b, setB] = createSignal([0, 4]);
  let moonref = null;

  function add() {
    // console.log(c)
    moonref.toggle()
  }

  return (
    <div class={styles.App}>
      <Moon breakI={b} ref={moonref} />
      <button onClick={add}>add?</button>
    </div>
  );
}

export default App;
