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
      variant="underlined"
      step="15"
      :max-duration="60"
      color="blue"
    />
  </v-app>
</template>

<style scoped>
</style>
