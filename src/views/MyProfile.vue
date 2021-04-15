<template>
  <v-layout>

    <v-flex xs12>
      <h1 class="subheading grey--text">{{ $t('profile.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      <span v-html="notifierMessage"></span>
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <div v-if="!loading">
    <v-form class="ma-5" ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="username" prepend-inner-icon="mdi-account" :label="$t('profile.screen.label.name')" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="orcid" prepend-inner-icon="mdi-identifier" label="ORCID" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.email"  :label="$t('profile.screen.label.email')" prepend-inner-icon="mdi-email"  :rules="emailRules" required></v-text-field>
        </v-col>

        <template v-if="featureFlag" >
          <v-col cols="12" v-for="(phone, index) in profile.phones" :key="index">
            <v-text-field  v-model="profile.phones[index]" :label="$t('profile.screen.label.phone')" prepend-inner-icon="mdi-phone" v-if="index==0"></v-text-field>
            <v-text-field  v-model="profile.phones[index]" :label="$t('profile.screen.label.phone')" prepend-inner-icon="mdi-phone" v-else append-icon="mdi-delete" @click:append="deletePhone(index)"></v-text-field>
          </v-col>
          <v-btn class="ml-3 " x-small :title="A$t('profile.screen.label.add.phone')" @click="profile.phones.push('')"  fab color="accent"> 
            <v-icon >mdi-plus</v-icon> 
          </v-btn>
        </template>
      </v-row>
    </v-form>

    <v-btn
      :disabled="!valid"
      class="mx-5"
      @click="cancel"
    >{{ $t('button.cancel') }}
    </v-btn>

    <v-btn
      :disabled="!valid"
      color="info"
      class="mr-4"
      :loading="saving"
      @click="save"
    >{{ $t('button.save') }}
    </v-btn>

    </div>
    </v-flex>
  </v-layout>

</template>

<script>
import {logOut} from '../utils.js'
import {displayError} from '../utils.js'
export default {

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.loadProfile();
  } ,

  props: {

  },

  computed: {

    emailRules: function() {
      const rules = []
      rules.push(v => !!v || this.$t('email.error'))
      rules.push(v => /.+@.+\..+/.test(v) || this.$t('profile.screen.error.email.validation'))
      return rules
    },

    language: function() {
      return this.$store.getters.getLanguage
    },
    
    profileService: function() {
      return this.service + "/profile/v1_0/profile";
    },

    username: function() {
      let name = null
      if(this.$store.getters.getUser != null) {
        name = this.$store.getters.getUser.profile.name
      }
      return name
    },

    userId: function() {
      let id = null
      if(this.$store.getters.getUser != null) {
        id = this.$store.getters.getUser.profile.id
      }
      return id
    },

    user: function() {
      let user = null
      if(this.$store.getters.getUser != null) {
        user = this.$store.getters.getUser
      }
      return user
    },

    orcid: function() {
      let orcid
      if(this.$store.getters.getUser != null) {
        orcid = this.$store.getters.getUser.profile.orcid
      }
      return orcid
    },
    service: function()  {
      return this.$store.getters.getService
    },

  },

  methods: {
    deletePhone: function(index) {
      this.profile.phones.splice(index,1);
    },

    cancel: function() {
      this.$router.push("/information").catch(() => {});
    },

    save: function() {
      var self = this;
      let aux = [];
      for (let i = 0; i< this.profile.phones.length; i++) {
        let phone = this.profile.phones[i];
        if (phone.trim().length > 0) {
          aux.push(phone)
        }
      }
      if(aux.length > 0) {
        this.profile.phones = aux;
      } else {
        this.profile.phones = [''];
      }
      
      if (this.$refs.form.validate()) {
        this.saving = true;
        this.profile.name = this.username
        this.profile.orcid = this.orcid
        this.profile.id = this.userId
        this.axios.post(this.service + "/profile/v1_0/saveProfile", this.profile).then(function(response) {
          // save the profile in the store
          let tmpuser = self.user
          tmpuser.profile = response.data
          self.$store.commit("setUser", tmpuser);
          self.displaySuccess(self.$t('confirmation'));
          self.loadProfile();
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.saving = false;
          self.$router.push("/information").catch(() => {});
        });

      }

    },

    loadProfile: function() {
      var self = this;
      this.loading = true;
      this.axios
        .get(this.profileService)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.profile = response.data
            if (!self.profile.phones) {
              self.profile.phones = [''];
            }
          }
          if(self.profile.email == null) {
            displayError(self, self.$t('repository.screen.required.email.error'))
          }
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.loading = false;
        });
    },

    displaySuccess: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "success";
      this.timeout = 4000;
      this.notifier = true;
    }

  },

  data: () => ({
    featureFlag : false,
    loading: false,
    saving: false,
    timeout: 2000,
    notifier: false,
    notifierMessage: "",
    notifierColor: "success",
    valid: false,
    profile: {
        id: null,
        title: null,
        email: null,
        phones: [''],
        fax: null,
        name: null,
        orcid: null,
    },
    loadingDelete: false,
    loadingSimulation: false,
    warningMessage: null,

  })

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

