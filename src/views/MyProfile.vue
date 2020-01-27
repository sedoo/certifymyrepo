

<template>
  <v-layout>

    <v-flex xs12>
      <h1 class="display-1">My Profile</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>

    <div v-if="!loading">
    <v-form class="ma-5" ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="username" prepend-inner-icon="mdi-account" label="Name" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="orcid" prepend-inner-icon="mdi-identifier" label="ORCID" readonly filled></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.title"  label="Title" prepend-inner-icon="mdi-bookmark"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.email"  label="Email" prepend-inner-icon="mdi-email"  :rules="emailRules" required></v-text-field>
        </v-col>

        <v-col cols="12" v-for="(phone, index) in profile.phones" :key="index">
          <v-text-field  v-model="profile.phones[index]" label="Phone" prepend-inner-icon="mdi-phone" v-if="index==0"></v-text-field>
          <v-text-field  v-model="profile.phones[index]" label="Phone" prepend-inner-icon="mdi-phone" v-else append-icon="mdi-delete" @click:append="deletePhone(index)"></v-text-field>
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
    >Save

    </v-btn>
    </div>
    </v-flex>
  </v-layout>

</template>

<script>

export default {

  created: function() {
    this.loadProfile();
  } ,

  	props: {
    	service: null
  	},

  computed: {
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

  },

  methods: {
    deletePhone: function(index) {
      this.profile.phones.splice(index,1);
    },

    save: function() {
      var self = this;
      let aux = [''];
      for (let i = 0; i< this.profile.phones.length; i++) {
        let phone = this.profile.phones[i];
        if (phone.trim().length > 0) {
          aux.push(phone)
        }
      }
      this.profile.phones = aux;
      console.log('this.$refs.form.validate()', this.$refs.form.validate())
      if (this.$refs.form.validate()) {
        this.saving = true;
        this.profile.name = this.username
        this.profile.orcid = this.orcid
        this.axios.post(this.service + "login/v1_0/saveProfile", this.profile).then(function(response) {
          // save the profile in the store
          let tmpuser = self.user
          tmpuser.profile = response.data
          self.$store.commit("setUser", tmpuser);
          self.displaySuccess("Profile saved");
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
            self.displayError("Please enter your email");
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
        title: null,
        email: null,
        phones: [''],
        fax: null,
        name: null,
        orcid: null,
    },

    phoneRules: [
        v => !!v || 'At least one phone number is required'
      ],

     affiliationRules: [
        v => !!v || 'Affiliation is mandatory'
      ],

    emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],

  })

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

