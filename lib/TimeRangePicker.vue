<script setup>
import { ref, computed, watch, nextTick, useAttrs, onMounted } from 'vue'
import { VSelect, VCheckbox, VChip }from 'vuetify/components'

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
  maxDuration: {
    type: Number,
    default: () => 0,
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

  // Next day feature
  allowNextDay: {
    type: Boolean,
    default: () => false,
  },
  nextDayLabel: {
    type: String,
    default: () => 'Next day'
  },

  // Styles
  innerDivCustomClass: {
    type: String,
    default: () => '',
  },
  inline: {
    type: Boolean,
    default: () => false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'mouseover', 'mouseleave'])

// Attrs
const attrs = useAttrs()

// Consts
const DEFAULT_START_TIME = '00:00'
const DEFAULT_END_TIME = '23:59'
const componentKey = attrs.key || (new Date( )).getTime()
const componentIndexClass = `vtrp-index-${componentKey}`

// Variables
let startTime = ref(DEFAULT_START_TIME)
let endTime = ref(DEFAULT_END_TIME)
let isHovering = ref(false)
let isFocusing = ref(null)
let wholeDay = ref(true)
let nextDay = ref(false)
let inputOutlinedClasses = ref([])
let endTimeMenu = ref(false)

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
  const { maxDuration } = props
  const filter = (i) => {
    const isTimeGreater = isTimeGraterThanStart(i)
    const d2 = getDateTime(i, nextDay.value)
    const d1 = getDateTime(startTime.value)
    const minDiff = getMinutesDifference(d2, d1)
    return isTimeGreater && (!maxDuration || minDiff <= maxDuration)
  }
  const items = times.value.slice(1, times.value.length)
    .concat([DEFAULT_END_TIME])
    .filter(filter)
  return (nextDay.value ? ['00:00'] : []).concat(items)
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

const VSelectBindings = computed(() => {
  const notAllowed = [
    'active',
    'append-icon',
    'clearable',
    'clear-icon',
    'closable-chips',
    'counter',
    'counter-value',
    'compact',
    'direction',
    'hide-no-data',
    'hide-selected',
    'item-children',
    'item-props',
    'items',
    'item-title',
    'item-value',
    'label',
    'loading',
    'menu',
    'menu-icon',
    'model-value',
    'multiple',
    'no-data-text',
    'open-on-clear',
    'persistent-clear',
    'persistent-counter',
    'persistent-hint',
    'persistent-placeholder',
    'placeholder',
    'prefix',
    'prepend-icon',
    'prepend-inner-icon',
    'return-object',
    'reverse',
    'rules',
    'single-line',
    'suffix',
    'validate-on',
    'value-comparator',
  ]
  const exclude = [
    'autofocus'
  ]

  const bindings = { ...attrs }

  Object.keys(bindings).forEach((key) => {
    if (notAllowed.includes(key) || exclude.includes(key)) {
      delete bindings[key]
    }
  })
  return bindings
})

const duration = computed(() => {
  const d2 = getDateTime(endTime.value, nextDay.value)
  const d1 = getDateTime(startTime.value)
  return getMinutesDifference(d2, d1)
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
    }
  }).filter(t => !computedDisabledTimes.value.includes(t.value))
}

function getDateTime(value, addDay = false) {
  const d = new Date()
  if (addDay) {
    d.setDate(d.getDate() + 1)
  }
  const hour = parseInt(value.split(':')[0], 10)
  const minute = parseInt(value.split(':')[1], 10)
  d.setHours(hour)
  d.setMinutes(minute)
  d.setSeconds(0)
  return d
}

function isTimeGraterThanStart(value) {
  const d2 = getDateTime(value, nextDay.value)
  const d1 = getDateTime(startTime.value)
  return d2 > d1
}

function getMinutesDifference(d2, d1) {
  const secs = Math.floor(Math.abs(d2 - d1) / 1000);
  return Math.floor(secs / 60);
}

function setHovering(value) {
  isHovering.value = value
  if (isHovering.value) {
    emit('mouseover')
    return
  }
  emit('mouseleave')
}

function setFocusing(value) {
  isFocusing.value = value
  const componentQuery =  `.vuetify3-time-range-picker.${componentIndexClass} .v-selects-row`
  if (isFocusing.value) {
    addFocusedStyles(componentQuery)
    return
  }
  removeFocusedStyles(componentQuery)
}

function addFocusedStyles(query) {
  const focusedNode = document.querySelector(`${query} .v-field.v-field--focused`)
  const unfocusedNode = document.querySelector(`${query} .v-field:not(.v-field--focused)`)
  if (focusedNode && unfocusedNode) {
    unfocusedNode.classList.add('v-field--focused')
    const outline1 = focusedNode.querySelector('.v-field__outline')
    const outline2 = unfocusedNode.querySelector('.v-field__outline')
    const classes = (outline1?.className || '').split(' ')
    classes.forEach((name) => {
      if (!outline2.classList.contains(name)) {
        outline2.classList.add(name)
        inputOutlinedClasses.value.push(name)
      }
    })
    emit('focus')
  }
}

function removeFocusedStyles(query) {
  const nodes = document.querySelectorAll(`${query} .v-field.v-field--focused`)
  if (nodes) {
    nodes.forEach((node) => {
      node.classList.remove('v-field--focused')
      const outline = node.querySelector('.v-field__outline')
      inputOutlinedClasses.value.forEach((name) => {
        outline.classList.remove(name)
      })
    })
    emit('blur')
  }
}

function onChange() {
  emit('update:modelValue', {
    start: startTime,
    end: endTime,
    duration: duration,
  })
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
  nextDay.value = false
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

function onNextDayChange() {
  if (nextDay.value) {
    endTime.value = '00:00'
    return
  }
  endTime.value = endTimes.value[0]
}

function setEndTime(value) {
  endTime.value = value
  endTimeMenu.value = false
}

// Hooks
onMounted(() => {
  initValues()

  // Autofocus check
  if (attrs.autofocus || attrs.autofocus === '') {
    const input = document.querySelector(`.vuetify3-time-range-picker.${componentIndexClass} .start-time`)
    if (input) {
      input.click()
      nextTick(() => {
        setFocusing(true)
      })
    }
  }

  // Max duration initialization
  if (props.maxDuration) {
    wholeDay.value = false
    endTime.value = endTimes.value[endTimes.value.length - 1]
  }
})

// Watchers
watch(startTime, () => {
  nextDay.value = false
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
  <div
    class="vuetify3-time-range-picker"
    :class="{
      [componentIndexClass]: true,
      'is-inline': inline
    }"
  >
    <div
      class="v-selects-row"
      :class="{
        'is-hovering': isHovering,
        [innerDivCustomClass]: true,
      }"
      @mouseover="setHovering(true)"
      @mouseleave="setHovering(false)"
      @click="setFocusing(true)"
    >
      <v-select
        v-bind="VSelectBindings"
        v-model="startTime"
        :label="props.inputLabel"
        :items="getTimes('start')"
        class="start-time"
        hide-details
        @blur="setFocusing(false)"
      ></v-select>
      <v-select
        v-bind="VSelectBindings"
        v-model="endTime"
        v-model:menu="endTimeMenu"
        :label="requiresEndEmptyLabel ? ' ' : undefined"
        :items="getTimes('end')"
        class="end-time"
        hide-details
        no-data-text=""
        @blur="setFocusing(false)"
      >
        <!-- SELECTION TEMPLATE -->
        <template #selection="{ item }">
          <div class="d-flex align-center">
            <v-chip
              v-if="nextDay"
              :color="attrs.color"
              density="compact"
              class="mr-1"
            >
              +1
            </v-chip>
            {{ item.title }}
          </div>
        </template>

        <!-- SELECT MENU ITEM TEMPLATE -->
        <template #item="{ item }">
          <div
            class="v-list-item v-list-item--link v-theme--light v-list-item--density-default v-list-item--one-line v-list-item--variant-text"
            :class="{ 'v-list-item--active': item.value === endTime }"
            @click="setEndTime(item.value)"
          >
            <span class="v-list-item__overlay"></span>
            <span class="v-list-item__underlay"></span>
            <span class=""></span>
            <div class="v-list-item__content">
              <div class="v-list-item-title">
                <v-chip
                  v-if="nextDay"
                  :color="attrs.color"
                  class="mr-1"
                >
                  {{ nextDayLabel }}
                </v-chip>
                {{ item.title }}
              </div>
            </div>
          </div>
        </template>

        <!-- NEXT DAY CHECKBOX -->
        <template v-if="allowNextDay && endTimes.includes('23:59')" #append-item>
          <v-checkbox
            v-model="nextDay"
            :label="nextDayLabel"
            hide-details
            @change="onNextDayChange"
          ></v-checkbox>
        </template>
      </v-select>
    </div>

    <!-- WHOLE DAY CHECKBOX -->
    <div
      class="whole-day d-flex"
      :class="{ 'hidden-input': hideWholeDayCheckbox || Boolean(maxDuration) }"
    >
      <v-checkbox
        v-model="wholeDay"
        class="pt-0 mt-0"
        :color="VSelectBindings.color"
        :label="wholeDayLabel"
        :readonly="wholeDay"
        :disabled="VSelectBindings.disabled || false"
        :class="{ 'cursor-not-allowed': wholeDay }"
        :error-messages="attrs['error-messages'] || attrs.errorMessages"
        :hide-details="attrs['hide-details'] || attrs['hide-details'] === ''"
        :messages="attrs.hint"
        @change="onWholeDayChange"
      ></v-checkbox>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vuetify3-time-range-picker {
  &.is-inline {
    display: flex;
  }

  .v-selects-row {
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
      .v-messages {
        text-align: left;
        padding-left: 12px;
      }
    }
    &.hidden-input {
      :deep(.v-input__control) {
        max-height: 0px;
        overflow: hidden;
      }
    }
  }
}
</style>
