<script setup>
import { ref, computed, watch, nextTick, useAttrs, onMounted } from 'vue'
import { VSelect, VCheckbox }from 'vuetify/components'

// Consts
const DEFAULT_START_TIME = '00:00'
const DEFAULT_END_TIME = '23:59'

// Props
const props = defineProps({
  // Input
  modelValue: {
    type: Object,
    required: true,
  },
  inputLabel: {
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

  // Whole day checkbox
  hideWholeDayCheckbox: {
    type: Boolean,
    default: () => false,
  },
  wholeDayLabel: {
    type: String,
    default: () => 'Whole day',
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
let wholeDay = ref(true)

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
  const componentQuery = '.vuetify3-time-range-picker .v-selects-row-container'
  if (isFocusing) {
    const node = document.querySelector(`${componentQuery} .v-field:not(.v-field--focused)`)
    if (node) {
      node.classList.add('v-field--focused')
      emit('focus')
    }
    return
  }
  const nodes = document.querySelectorAll(`${componentQuery} .v-field.v-field--focused`)
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

function onWholeDayChange() {
  if (!wholeDay) return
  startTime.value = '00:00'
  endTime.value = '23:59'
  onChange()
}

function checkWholeDay() {
  if (startTime.value === '00:00' && endTime.value === '23:59') {
    wholeDay.value = true
    return
  }
  wholeDay.value = false
}

// Hooks
onMounted(() => {
  initValues()
})

// Watchers
watch(startTime, () => {
  checkWholeDay()
  nextTick(() => {
    const isEndTimeStillAvailable = endTimes.value.find(t => t === endTime.value)
    if (!isEndTimeStillAvailable) {
      endTime.value = endTimes.value[0]
    }
  })
})

watch(endTime, () => {
  checkWholeDay()
})
</script>

<template>
  <div class="vuetify3-time-range-picker">
    <div
      class="v-selects-row-container"
      :class="{ 'is-hovering': isHovering }"
      @mouseover="isHovering = true"
      @mouseleave="isHovering = false"
      @click="setFocusing(true)"
    >
      <v-select
        v-bind="$attrs"
        v-model="startTime"
        :label="props.inputLabel"
        :items="getTimes('start')"
        class="start-time"
        hide-details
        @blur="setFocusing(false)"
      ></v-select>
      <v-select
        v-bind="$attrs"
        v-model="endTime"
        :label="requiresEndEmptyLabel ? ' ' : undefined"
        :items="getTimes('end')"
        class="end-time"
        hide-details
        @blur="setFocusing(false)"
      ></v-select>
    </div>
    <div
      v-show="!hideWholeDayCheckbox"
      class="whole-day d-flex"
    >
      <v-checkbox
        v-model="wholeDay"
        class="pt-0 mt-0"
        :label="wholeDayLabel"
        :readonly="wholeDay"
        :disabled="$attrs.disabled || false"
        hide-details
        :class="{
          'cursor-not-allowed': wholeDay,
        }"
        @change="onWholeDayChange"
      ></v-checkbox>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vuetify3-time-range-picker {

  .v-selects-row-container {
    display: flex;

    &.is-hovering {
      :deep(.v-field__outline) {
        --v-field-border-opacity: var(--v-high-emphasis-opacity)
      }
    }

    .start-time {
      :deep(.v-field__outline__end) {
        border-right-style: dashed;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      :deep(.v-field.v-field--variant-filled), :deep(.v-field.v-field--variant-solo) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
    .end-time {
      :deep(.v-field__outline__start) {
        border-left-style: hidden;
          border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      :deep(.v-field.v-field--variant-filled), :deep(.v-field.v-field--variant-solo) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
  .whole-day {
    :deep(.v-input) {
      &.cursor-not-allowed {
        .v-label, input {
          cursor: not-allowed !important;
        }
      }
    }
  }
}
</style>