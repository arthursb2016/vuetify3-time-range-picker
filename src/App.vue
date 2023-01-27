<script setup>
import { ref } from 'vue'
import TimeRangePicker from '../lib/TimeRangePicker.vue'

let range = ref({ start: null, end: null })

// variant options: 'underlined' | 'outlined' | 'filled' | 'solo' | 'plain'
</script>

<template>
  <v-app id="app">
    <TimeRangePicker
      v-model="range"
      variant="filled"
      step="65"
      allow-next-day
    />
  </v-app>
</template>

<style scoped>
</style>
