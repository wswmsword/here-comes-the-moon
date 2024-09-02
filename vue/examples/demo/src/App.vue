<script setup>
import Moon from 'here-comes-the-moon';
import { nextTick, ref, watch } from 'vue';

const childRef = ref(null);
const moonRef2 = ref(null);
const loading = ref(false);
const more = ref([]);

watch(loading, v => {
  nextTick(() => {
    if (v) {
      moonRef2.value.play();
      setTimeout(() => {
        loading.value = false;
        more.value = [...more.value, 'more!'];
        moonRef2.value.stop();
      }, 1998);
    }
  })
});

function play() {
  childRef.value.play();
}
function toggle() {
  childRef.value.toggle();
}
function stop() {
  childRef.value.stop();
}
</script>

<template>
  <main class="flex min-h-screen flex-col items-center py-8 box-border gap-8">
    <!-- <Moon ref="childRef" :moons="['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']" :breakI="[0, 6]"  /> -->
    <Moon ref="childRef" />
    <div class="flex gap-3">
      <button @click="play">play</button>
      <button @click="stop">stop</button>
      <button @click="toggle">toggle</button>
      <button @click="loading=true">load more</button>
    </div>
    <Moon v-if="loading" class="!fixed top-4 left-4" ref="moonRef2" :breakI="null" />
    <div>
      <div v-for="(m, i) in more" class="text-5xl" :key="i">{{m}}</div>
    </div>
  </main>
</template>
