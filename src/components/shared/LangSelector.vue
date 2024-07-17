<template lang="pug">
ods-select(
    v-model="$i18n.locale"
    :class="cssClass")
    ods-option(
      v-for="lang in languages"
      :key="lang"
      :value="lang"
      :label="getLabel(lang)")
</template>

<script>
export default {
  name: 'LangSelector',

  props: {
    cssClass: {
      type: String
    },
    mobile: {
      type: Boolean
    }
  },
  data () {
    return {
      languages: Object.keys(this.$i18n.messages) || []
    }
  },
  /* computed: {
    langs () {
      return Object.keys(this.$i18n.messages)
    }
  }, */
  methods: {
    getLabel (lang) {
      return this.mobile ? this.$i18n.messages[lang.toLowerCase()].labelMobile : this.$i18n.messages[lang.toLowerCase()].label
    }
  },
  watch: {
    'this.$i18n.messages': {
      handler () {
        if (sessionStorage.getItem('languages') !== null) {
          var sessionlanguages = JSON.parse(sessionStorage.getItem('languages'))
          this.languages = Object.values(sessionlanguages)
        } else {
          // this.languages = Object.keys(this.$i18n.messages)
        }
      },
      immediate: true
    },
    '$i18n.locale': {
      async handler (val) {
        sessionStorage.setItem('currentLanguage', val)
      },
      immediate: true
    }
  }
}
</script>
