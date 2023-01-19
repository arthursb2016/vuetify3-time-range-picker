<script setup>
import { ref, computed, useAttrs, onMounted } from 'vue'
import { VSelect, VIcon, VCheckbox }from 'vuetify/components'

// Consts
const DEFAULT_START_TIME = '00:00'
const DEFAULT_END_TIME = '23:59'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
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
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// Attrs
const attrs = useAttrs()

// Variables
let startTime = ref(DEFAULT_START_TIME)
let endTime = ref(DEFAULT_END_TIME)
let isHovering = ref(false)
let isFocusing = ref(null)

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

const requiresEndEmptyLabel = computed(() => {
  return ['filled', 'solo'].includes(attrs.variant)
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

function isGreater(value) {
  const d1 = new Date()
  const startHour = parseInt(startTime.value.split(':')[0], 10)
  const startMinute = parseInt(startTime.value.split(':')[1], 10)
  d1.setHours(startHour)
  d1.setMinutes(startMinute)
  d1.setSeconds(0)
  const d2 = new Date()
  const endHour = parseInt(value.split(':')[0], 10)
  const endMinute = parseInt(value.split(':')[1], 10)
  d2.setHours(endHour)
  d2.setMinutes(endMinute)
  d2.setSeconds(0)
  return d2 > d1
}

function setFocusing(value) {
  isFocusing = value
  if (isFocusing) {
    const node = document.querySelector('.vuetify3-time-range-picker .v-field:not(.v-field--focused)')
    if (node) {
      node.classList.add('v-field--focused')
      emit('focus')
    }
    return
  }
  const nodes = document.querySelectorAll('.vuetify3-time-range-picker .v-field.v-field--focused')
  if (nodes) {
    nodes.forEach((node) => node.classList.remove('v-field--focused'))
    emit('blur')
  }
}

function onChange() {
  emit('update:modelValue', { start: startTime, end: endTime })
}

function initValues() {
  const finder = time => (i) => i === time
  const start = startTimes.value.find(finder(props.modelValue.start))
  const end = endTimes.value.find(finder(props.modelValue.end))
  startTime.value = start || DEFAULT_START_TIME
  endTime.value = end || DEFAULT_END_TIME
  if (start && end) return
  onChange()
}

// Hooks
onMounted(() => {
  console.log('onMounted')
  initValues()
})
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
      v-bind="$attrs"
      v-model="startTime"
      :label="props.label"
      :items="getTimes('start')"
      class="start-time"
      @blur="setFocusing(false)"
    ></v-select>
    <v-select
      v-bind="$attrs"
      v-model="endTime"
      :label="requiresEndEmptyLabel ? ' ' : undefined"
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
    :deep(.v-field.v-field--variant-filled) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  .end-time {
    :deep(.v-field__outline__start) {
      border-left-style: hidden;
    }
    :deep(.v-field.v-field--variant-filled) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>