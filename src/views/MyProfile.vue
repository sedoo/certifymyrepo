<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title": "User profile",
    "name.label": "Name",
    "title.label": "Title",
    "email.label": "Email",
    "phone.label": "Phone",
    "email.error": "Please enter your email",
    "email.validation.error": "E-mail must be valid",
    "confirmation": "The profile has been saved"
  },
  "fr": {
    "title": "Profile utilisateur",
    "name.label": "Nom",
    "title.label": "Titre",
    "email.label": "Courriel",
    "phone.label": "Téléphone",
    "email.error": "Veuillez entrer voute courriel",
    "email.validation.error": "Le courriel doit être valide",
    "confirmation": "Le profile a été sauvegardé"
  }
}
</i18n>
<template>
  <v-layout>

    <v-flex xs12>
      <h1 class="display-1">{{ $t('title')}}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <div v-if="!loading">
    <v-form class="ma-5" ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="username" prepend-inner-icon="mdi-account" :label="$t('name.label')" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="orcid" prepend-inner-icon="mdi-identifier" label="ORCID" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.title"  :label="$t('title.label')" prepend-inner-icon="mdi-bookmark"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.email"  :label="$t('email.label')" prepend-inner-icon="mdi-email"  :rules="emailRules" required></v-text-field>
        </v-col>

        <v-col cols="12" v-for="(phone, index) in profile.phones" :key="index">
          <v-text-field  v-model="profile.phones[index]" :label="$t('phone.label')" prepend-inner-icon="mdi-phone" v-if="index==0"></v-text-field>
          <v-text-field  v-model="profile.phones[index]" :label="$t('phone.label')" prepend-inner-icon="mdi-phone" v-else append-icon="mdi-delete" @click:append="deletePhone(index)"></v-text-field>
        </v-col>
         <v-btn class="ml-3 " x-small title="Add a phone number" @click="profile.phones.push('')"  fab color="accent"> 
          <v-icon >mdi-plus</v-icon> 
        </v-btn>

        <v-col cols="12">
          <v-text-field v-model="profile.fax"  label="Fax" prepend-inner-icon="mdi-fax" required></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <v-btn
      :disabled="!valid"
      color="success"
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
      rules.push(v => /.+@.+\..+/.test(v) || this.$t('email.validation.error'))
      return rules
    },
    
    profileService: function() {
      return this.service + "/login/v1_0/profile";
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
      
      console.log('this.$refs.form.validate()', this.$refs.form.validate())
      if (this.$refs.form.validate()) {
        this.saving = true;
        this.profile.name = this.username
        this.profile.orcid = this.orcid
        this.profile.id = this.userId
        this.axios.post(this.service + "/login/v1_0/saveProfile", this.profile).then(function(response) {
          // save the profile in the store
          let tmpuser = self.user
          tmpuser.profile = response.data
          self.$store.commit("setUser", tmpuser);
          self.displaySuccess(self.$t('confirmation'));
          self.loadProfile();
        })
        .catch(function(error) {
          self.displayError("An error has occured:" + error);
        })
        .finally(function() {
          self.saving = false;
        });

      }

    },

    loadProfile: function() {
      var self = this;
      this.loading = true;
      console.log(this.profileService)
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
            self.displayError(self.$t('email.error'));
          }
        })
        .catch(function(error) {
          self.displayError("An error has occured:" + error);
        })
        .finally(function() {
          self.loading = false;
        });

    },

  displayError: function(message) {
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

  data: () => ({
    affiliations: ["Toto"],
    affiliation: {
    },
    affiliationDialog: false,
    savingAffiliation : false,
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

  })

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

