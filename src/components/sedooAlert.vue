<i18n src="../locales.json"></i18n>
<template>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      <span v-html="notifierMessage"></span>
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
</template>

<script>
export default {
    name: 'sedoo-alert',
    data() {
        return {
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
        }
    },

    created() {
        this.$i18n.locale = this.$store.getters.getLanguage;
    },

    methods: {
        displayError: function(error) {
            let message = null
            if(error && error.response && error.response.data) {
                message = this.$t('error.notification') + error.response.data.message
            } else {
                 message = error
            }
            this.notifierMessage = message;
            this.notifierColor = "error";
            this.timeout = 8000;
            this.notifier = true;
        },
        displaySuccess: function(message) {
            this.notifierMessage = message;
            this.notifierColor = "success";
            this.timeout = 4000;
            this.notifier = true;
        }
    },
} 
</script>