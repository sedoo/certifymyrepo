<i18n src="../locales.json"></i18n>
<template>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
        <span v-for="(error, index) in getErrors" :key=index>
            <span v-html="error"></span>
        </span>
      <v-btn dark text @click="resetMessage()">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
</template>

<script>
export default {
    name: 'sedoo-alert',
    data() {
        return {
            // error and success notification vars
            timeout: 2000,
            notifierColor: "success",
        }
    },

    created() {
        this.$i18n.locale = this.$store.getters.getLanguage;
    },

    computed :{
        getErrors(){
            let errors = []
            if(this.$store.getters.getErrors != null) {
                for(let i=0 ; i<this.$store.getters.getErrors.length ; i++) {
                    let error = this.$store.getters.getErrors[i]
                    if(error && error.response && error.response.data) {
                        errors.push(this.$t('error.notification') + error.response.data.message)
                    } else {
                        errors.push(error)
                    }
                }
            }
            return errors
        },
        notifier() {
            if(this.$store.getters.getErrors && this.$store.getters.getErrors.length > 0) {
                return true
            } else {
                return false
            }
        }
    },

    methods: {
        resetMessage() {
            this.$store.commit('setErrors', null)
        }

    },
} 
</script>