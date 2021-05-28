<template>
<v-app class="grey lighten-4">
  <v-container fluid>
    <v-snackbar v-model="notifier" :color="notifierColor" :timeout="timeout" centered>
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
    <h1 class="ml-5 subheading grey--text">{{ $t('contact.screen.title') }}</h1>
    <v-form class="ma-5" ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-col cols="12">
          <v-text-field class="required" v-model="name" :label="$t('contact.screen.label.name')" :rules="rules.nameRules" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field class="required" v-model="email"  :label="$t('contact.screen.label.email')" :rules="rules.emailRules" outlined dense required></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field class="required" v-model="subject" :label="$t('contact.screen.label.subject')" :rules="rules.subjectRules" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea class="required" v-model="message" :label="$t('contact.screen.label.message')" :rules="rules.messageRules" outlined dense></v-textarea>
        </v-col>
        <v-col cols="12" class="text-right">
          <v-btn
            :disabled="!valid"
            color="info"
            @click="send"
          >{{ $t('button.send') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</v-app>
</template>
<script>
import {displayError} from '../utils.js'
export default {
  name: 'contact-app',
  props: {
    service: {
      type: String,
      default: "http://localhost:8485"
    },
    language: {
      type: String,
      default: "fr"
    }
  },
  data() {
    return {
      name: null,
      email: null,
      subject: null,
      message: null,
      /** Rules */
      rules: {
        nameRules: [
            v => !!v || this.$t('contact.screen.error.name.required.error'),
        ],
        emailRules: [
            v => !!v || this.$t('contact.screen.email.error'),
            v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || this.$t('contact.screen.email.error'),
        ],
        subjectRules: [
            v => !!v || this.$t('contact.screen.error.subject.required.error'),
        ],
        messageRules: [
            v => !!v || this.$t('contact.screen.error.message.required.error'),
        ],
      },
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
    }
  },

  computed: {

  },

  methods: {
    send() {
      if (this.$refs.form.validate()) {
      let contact = {
        fromName: this.name,
        fromEmail: this.email,
        subject: this.subject,
        message: this.message
      }
      self = this
      this.axios({
              method: 'post',
              url: this.service+"/admin/v1_0/contact",
              data: contact
          })
          .then(response => {
            if(response && response.data) {
              self.displaySuccess(self.$t('contact.screen.success'))
              self.name = null
              self.email = null
              self.subject = null
              self.message = null
              self.$refs.form.reset()
            }
          })
          .catch(error => {
            displayError(self, error)
          }).finally(() => self.$refs.form.reset())
      }
    },

    displaySuccess: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "success";
      this.timeout = 4000;
      this.notifier = true;
    }
  },

  created: function() {
    this.$i18n.locale = this.language;
  },
};
</script>

<style scoped>

</style>
<style>
.required label::after {
  content: " *";
  color: red;
}
</style>
