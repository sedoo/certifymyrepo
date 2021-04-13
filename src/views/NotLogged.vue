<i18n src="../locales.json"></i18n>
<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <div style="text-align:center " class="display-2 ma-3 font-weight-thin">
          <span v-html="$t('notlogged.screen.title')"></span>
        </div>
        <div style="text-align:center" class="headline">
          {{ $t('notlogged.screen.message.part.1') }}
          <v-btn class="mx-3 light-green lighten-5" @click="login">
            <img
              style="vertical-align:middle;"
              src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
              width="24"
              height="24"
            />
            <span class="px-2">Orcid</span> </v-btn
          >{{ $t('notlogged.screen.message.part.2') }}
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  data: () => ({}),
  methods: {
    login: function() {
      this.$emit("login");
    }
  },
  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
  },
};
</script>
