<script setup>
import { ref } from 'vue'
import TimeRangePicker from '../lib/TimeRangePicker.vue'

let range = ref({ start: null, end: null })
</script>

<template>
  {{ range }}
  <TimeRangePicker
    v-model="range"
    variant="outlined"
    step="30"
  />
</template>

<style scoped>
</style>
