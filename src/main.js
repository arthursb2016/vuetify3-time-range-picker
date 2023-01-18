import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VSelect, VIcon, VCheckbox }from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components: { VSelect, VIcon, VCheckbox },
  directives,
})

createApp(App).use(vuetify).mount('#app')
