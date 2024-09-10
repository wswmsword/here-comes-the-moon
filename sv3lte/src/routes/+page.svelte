<script>
  import Moon from "$lib/Moon.svelte";

  let ms = null;

</script>

<Moon bind:this={ms} />
<button on:click={ms.play}>play</button>
<button on:click={ms.stop}>stop</button>
<button on:click={ms.toggle}>toggle</button>