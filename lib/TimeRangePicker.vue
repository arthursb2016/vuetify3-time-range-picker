<script setup>
import { ref, computed } from 'vue'
import { VSelect, VIcon, VCheckbox }from 'vuetify/components'

// Consts
const DEFAULT_START_TIME = '00:00'
const DEFAULT_END_TIME = '23:59'

// Props
const props = defineProps({
  label: {
    type: String,
    default: () => 'Interval',
  },
  step: {
    type: [String, Number],
    default: () => 15,
  },
  disabledTimes: {
    type: [String, Array],
    default: () => [],
  },
})

// Variables
const startTime = ref(DEFAULT_START_TIME)
const endTime = ref(DEFAULT_END_TIME)

// Computed
const times = computed(() => {
  const maxHour = 24
  const maxMin = 59
  const parsedStep = parseInt(props.step, 10)
  const step = parsedStep >= maxMin ? props.step : parsedStep
  const times = []
  let hh = 0
  while (hh < maxHour) {
    let mm = 0
    while (mm < maxMin) {
      times.push(`${doubleDigit(hh)}:${doubleDigit(mm)}`)
      mm += step
    }
    hh += 1
  }
  return times
})

const startTimes = computed(() => {
  return times.value.slice(0, times.value.length)
})

const endTimes = computed(() => {
  const filter = i => isGreater(i)
  return times.value.slice(1, times.value.length)
    .concat([DEFAULT_END_TIME])
    .filter(filter)
})

const computedDisabledTimes = computed(() => {
  const disabledTimes = props.disabledTimes
  if (typeof disabledTimes === 'string') {
    return [disabledTimes]
  }
  return disabledTimes
})

// Methods
function doubleDigit(digit) {
  if ((typeof digit === 'string' && digit.length === 1)
    || (typeof digit === 'number' && digit < 10)
  ) {
    return `0${digit}`
  }
  return digit
}

function getTimes(name) {
  const times = name === 'start' ? startTimes : endTimes
  return times.value.map((time) => {
    return {
      title: time,
      value: time,
      disabled: computedDisabledTimes.value.includes(time),
    }
  })
}

function isGreater(endTime) {
  const d1 = new Date()
  const startHour = parseInt(startTime.value.split(':')[0], 10)
  const startMinute = parseInt(startTime.value.split(':')[1], 10)
  d1.setHours(startHour)
  d1.setMinutes(startMinute)
  d1.setSeconds(0)
  const d2 = new Date()
  const endHour = parseInt(endTime.split(':')[0], 10)
  const endMinute = parseInt(endTime.split(':')[1], 10)
  d2.setHours(endHour)
  d2.setMinutes(endMinute)
  d2.setSeconds(0)
  return d2 > d1
}
</script>

<template>
  <div class="container">
    <v-select
      v-bind="$attrs"
      v-model="startTime"
      :label="props.label"
      :items="getTimes('start')"
    ></v-select>
    <v-select
       v-bind="$attrs"
       v-model="endTime"
      :items="getTimes('end')"
    ></v-select>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
}
</style>