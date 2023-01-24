<script setup>
import { ref } from 'vue'
import TimeRangePicker from '../lib/TimeRangePicker.vue'

let range = ref({ start: null, end: null })
</script>

<template>
  <v-app id="app">
    {{ range }}
    <TimeRangePicker
      v-model="range"
      variant="outlined"
      step="30"
    />
  </v-app>
</template>

<style scoped>
</style>
