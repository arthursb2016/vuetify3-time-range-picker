<script setup>
import { ref } from 'vue'
import TimeRangePicker from '../lib/TimeRangePicker.vue'

let range = ref({ start: null, end: null })

// variant options: 'underlined' | 'outlined' | 'filled' | 'solo' | 'plain'
</script>

<template>
  <v-app id="app">
    {{ range }}
    <TimeRangePicker
      v-model="range"
      variant="outlined"
      step="65"
      color="red"
    />
  </v-app>
</template>

<style scoped>
</style>
