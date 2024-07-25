<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import {ref} from 'vue'
const count = ref(2)
function countAdd() {
  count.value++
}
</script>

<template>
  <div >
    count: {{ count }}
    <div class="img-pic13" @click="countAdd">
      img-pic13
    </div>
    <div class="img-pic9">
      img-pic9
    </div> 
    <div class="img_a-pic9">
      img-pic9
    </div> 
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
