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

// Emits
const emit = defineEmits(['focus', 'blur'])

// Variables
const startTime = ref(DEFAULT_START_TIME)
const endTime = ref(DEFAULT_END_TIME)
const isHovering = ref(false)
let isFocusing = ref(null)

const startTimeSelect = ref(null)
const endTimeSelect = ref(null)

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

function setFocusing(value) {
  isFocusing = value
  if (isFocusing) {
    const node = document.querySelector('.vuetify3-time-range-picker .v-field:not(.v-field--focused)')
    node.classList.add('v-field--focused')
    emit('focus')
    return
  }
  const nodes = document.querySelectorAll('.vuetify3-time-range-picker .v-field.v-field--focused')
  nodes.forEach((node) => node.classList.remove('v-field--focused'))
  emit('blur')
}
</script>

<template>
  <div
    class="vuetify3-time-range-picker"
    :class="{ 'is-hovering': isHovering }"
    @mouseover="isHovering = true"
    @mouseleave="isHovering = false"
    @click="setFocusing(true)"
  >
    <v-select
      ref="startTimeSelect"
      v-bind="$attrs"
      v-model="startTime"
      :label="props.label"
      :items="getTimes('start')"
      class="start-time"
      @blur="setFocusing(false)"
    ></v-select>
    <v-select
      ref="endTimeSelect"
      v-bind="$attrs"
      v-model="endTime"
      :items="getTimes('end')"
      class="end-time"
      @blur="setFocusing(false)"
    ></v-select>
  </div>
</template>

<style lang="scss" scoped>
.vuetify3-time-range-picker {
  display: flex;

  &.is-hovering {
    :deep(.v-field__outline) {
      --v-field-border-opacity: var(--v-high-emphasis-opacity)
    }
  }

  .start-time {
    :deep(.v-field__outline__end) {
      border-right-style: dashed;
    }
  }
  .end-time {
    :deep(.v-field__outline__start) {
      border-left-style: hidden;
    }
  }
}
</style>