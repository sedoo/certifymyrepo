<i18n>
{
  "en": {
    "title" : "Welcome to",
    "login.label.1" : "You need to login using",
    "login.label.2": "to use the application."
  },
  "fr": {
    "title" : "Bienvenu sur",
    "login.label.1" : "Vous devez vous connecter sur",
    "login.label.2": "pour utiliser l'application"
  }
}
</i18n>
<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <div style="text-align:center " class="display-2 ma-3 font-weight-thin">
          {{ $t('title') }}
          <span class="text-uppercase"
            ><span class="font-weight-regular">CRUSÖE</span></span
          >
        </div>
        <div style="text-align:center" class="headline">
          {{ $t('login.label.1') }}
          <v-btn class="mx-3 light-green lighten-5" @click="login">
            <img
              style="vertical-align:middle;"
              src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
              width="24"
              height="24"
            />
            <span class="px-2">Orcid</span> </v-btn
          >{{ $t('login.label.2') }}
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
  }
};
</script>
