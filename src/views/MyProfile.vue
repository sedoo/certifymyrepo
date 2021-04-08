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
    "confirmation": "The profile has been saved",
    "delete.title": "Delete profile",
    "button.delete.user": "Delete all information about me",
    "delete.confirm.message": "You can delete your profile and all the user information from CRUSÖE database. You will loss access on your reposiories. If you are the only user with 'Editor' role on a repository, it will be deleted as well as related reports. This operation cannot be undone."
  },
  "fr": {
    "title": "Profil utilisateur",
    "name.label": "Nom",
    "title.label": "Titre",
    "email.label": "Courriel",
    "phone.label": "Téléphone",
    "email.error": "Veuillez entrer voute courriel",
    "email.validation.error": "Le courriel doit être valide",
    "confirmation": "Le profile a été sauvegardé",
    "delete.title": "Suppression de profile",
    "button.delete.user": "Supprimer toutes les informations me concernant",
    "delete.confirm.message": "Vous pouvez supprimer votre profile avec toutes les informations qu'il contient de le base de données CRUSÖE. Vous perdrez l'accès à vous entrepôts. Si vous êtes le seul utilisateur ayant un rôle 'Editeur' sur un entrepôts, il sera supprimé, ainsi que les fiches qu'il contient. Veuillez noter que cette opération est irréversible."
  }
}
</i18n>
<template>
  <v-layout>

    <v-flex xs12>
      <h1 class="subheading grey--text">{{ $t('title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      <span v-html="notifierMessage"></span>
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
        <v-col v-if="featureFlag" cols="12">
          <v-text-field v-model="profile.title"  :label="$t('title.label')" prepend-inner-icon="mdi-bookmark"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="profile.email"  :label="$t('email.label')" prepend-inner-icon="mdi-email"  :rules="emailRules" required></v-text-field>
        </v-col>

        <template v-if="featureFlag" >
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

        <v-dialog v-model="dialogDelete" :width="$store.getters.getDialogWidth">
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('delete.title') }}
                </v-card-title>
                <v-card-text>
                <p>{{ $t('delete.confirm.message') }}</p>
                <p><span v-html="warningMessage"></span></p>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn @click="dialogDelete = false">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="info"
                        @click="dialogDelete = false; deleteProfile()">
                        {{ $t('button.confirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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
      rules.push(v => /.+@.+\..+/.test(v) || this.$t('email.validation.error'))
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

    openDeleteDialog: function() {
      var self = this;
      this.loadingSimulation = true;
      this.axios
        .get(this.service + "/profile/v1_0/deleteProfileSimulation/"+this.language+"/"+this.userId)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.warningMessage = response.data
          }
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.loadingSimulation = false
          self.dialogDelete = true
        });
    },

    deleteProfile: function() {
      var self = this;
      this.loadingDelete = true;
      this.axios
        .delete(this.service + "/profile/v1_0/deleteProfile/"+this.language+"/"+this.userId)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.displaySuccess(response.data)
          logOut(self.$store)
          self.$router.push("/").catch(() => {});
          }
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.loadingDelete = false
          self.dialogDelete = false
        });
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
            displayError(self, self.$t('email.error'))
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
    dialogDelete: false,
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

