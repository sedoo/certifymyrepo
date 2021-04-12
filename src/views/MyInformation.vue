<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title": "User information",
    "profile": "Profile",
    "myRepositories": "My repositories",
    "name.label": "Name",
    "title.label": "Title",
    "email.label": "Email",
    "phone.label": "Phone",
    "button.update": "Update",
    "button.delete.user": "Delete all information about me",
    "delete.title": "Delete profile",
    "delete.confirm.message": "You can delete your profile and all the user information from CRUSÖE database. You will loss access on your reposiories. If you are the only user with 'Editor' role on a repository, it will be deleted as well as related reports. This operation cannot be undone."
  },
  "fr": {
    "title": "Information utilisateur",
    "profile": "Profil",
    "myRepositories": "Mes entrepôts",
    "name.label": "Nom",
    "title.label": "Titre",
    "email.label": "Courriel",
    "phone.label": "Téléphone",
    "button.update": "Modifier",
    "button.delete.user": "Supprimer toutes les informations me concernant",
    "delete.title": "Suppression de profile",
    "delete.confirm.message": "Vous pouvez supprimer votre profile avec toutes les informations qu'il contient de le base de données CRUSÖE. Vous perdrez l'accès à vos entrepôts. Si vous êtes le seul utilisateur ayant un rôle 'Editeur' sur un entrepôts, il sera supprimé, ainsi que les fiches qu'il contient. Veuillez noter que cette opération est irréversible."
  }
}
</i18n>
<template>
  <v-layout>

    <v-flex xs12>
      <h1 class="subheading grey--text">{{ $t('title') }}</h1>
    <v-progress-linear indeterminate v-if="loadingProfile || loadingRepo" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      <span v-html="notifierMessage"></span>
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <div v-if="!loadingProfile && !loadingRepo">
      <v-card class="ma-5">
        <v-card-title>{{ $t('profile')}}</v-card-title>
        <v-card-text><v-icon>mdi-account</v-icon> {{ username }}</v-card-text>
        <v-card-text v-if="orcid != null"><v-icon>mdi-identifier</v-icon>{{ orcid }}</v-card-text>
        <v-card-text v-if="profile.title != null"><v-icon>mdi-bookmark</v-icon>{{ profile.title }}</v-card-text>
        <v-card-text v-if="profile.email != null"> <v-icon>mdi-email</v-icon>{{ profile.email }}</v-card-text>
        <template v-if="isPhoneNumber">
        <v-card-text v-for="(phone, index) in profile.phones" :key="index">
          <div>
            <v-icon>mdi-phone</v-icon>{{ profile.phones[index] }}
          </div>
        </v-card-text>
        </template>
        <v-card-text v-if="profile.fax != null"><v-icon>mdi-fax</v-icon>{{ profile.fax }}</v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn
            color="success"
            @click="update"
          >{{ $t('button.update') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="ma-5">
        <v-card-title>{{ $t('myRepositories') }}</v-card-title>
        <v-data-table
          :headers="headers"
          :items="repoList"
          :items-per-page="5"
          :expanded.sync="expanded"
          single-expand
          show-expand
          class="elevation-1"
        >
            <template v-slot:item.keywords="{ item }">
              <v-chip-group active-class="primary--text" column>
                <v-chip small v-for="(keyword, key) in item.keywords" :key=key >{{ keyword }}</v-chip>
              </v-chip-group>
            </template> 
            <template v-slot:item.url="{ item }">  
              <v-tooltip bottom>
                <template v-if="item.url" v-slot:activator="{ on }">
                  <v-btn v-on="on" icon :href="checkedURL(item.url)" target="_blank">
                    <v-icon>mdi-link</v-icon>
                  </v-btn>
                  </template>
                  <span>{{ $t('url.repository.button') }}</span>
              </v-tooltip> 
            </template> 
            <template v-slot:item.role="{ item }">  
              {{ getUserRole(item)}}
            </template> 
            <template v-slot:expanded-item="{ headers, item }">
              <td v-if="item.description != null" :colspan="headers.length">
               {{ item.description }}
              </td>
            </template>
        </v-data-table>
      </v-card>
      <v-layout v-if="featureFlag" justify-end>
        <div class="pa-5">
        <v-btn
          color="error"
          @click="openDeleteDialog()"
        >{{ $t('button.delete.user') }}
        </v-btn>
        </div>
      </v-layout>
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
                    <v-btn
                        @click="dialogDelete = false">
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
    this.headers = [
        { text: this.$t('tab.repo'), value: 'name' },
        { text: this.$t('tab.keywords'), value: 'keywords' },
        { text: this.$t('tab.contact'), value: 'contact' },
        { text: this.$t('tab.link'), value: 'url' },
        { text: this.$t('tab.role'), value: 'role' },
        { text: '', value: 'data-table-expand' },
        ],
    this.loadProfile();
    this.loadRepo();
  } ,

  props: {

  },

  computed: {

    language: function() {
      return this.$store.getters.getLanguage
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
    isPhoneNumber: function() {
      if(this.profile.phones != null && this.profile.phones.length >= 1 && this.profile.phones[0].length > 0) {
        return true
      } else {
        return false
      }
    },

  },

  methods: {

    getUserRole(item) {
      let role = ''
      if(item.users != null) {
        for(let i=0 ; i<item.users.length ; i++){
          if(item.users[i].id == this.userId) {
            role = item.users[i].role
            break
          }
        }
      }
      return this.$t(role)
    },

    update: function() {
      this.$router.push("/profile").catch(() => {});
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
          debugger
          if(response.data != null && response.data != '') {
            self.displaySuccess(response.data)
          logOut(self.$store)
          self.$router.push("/notlogged").catch(() => {});
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
      this.loadingProfile = true;
      this.axios
        .get(this.service + "/profile/v1_0/profile")
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.profile = response.data
            if (!self.profile.phones) {
              self.profile.phones = [''];
            }
          }
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.loadingProfile = false;
        });
    },

    loadRepo: function() {
      var self = this;
      this.loadingRepo = true;
      this.axios
        .get(this.service + "/repository/v1_0/listMyRepositories")
        .then(function(response) {
          if(response.data != null) {
            self.repoList = response.data

          }
        })
        .catch(function(error) {
          displayError(self, error)
        })
        .finally(function() {
          self.loadingRepo = false;
        });
    },

    checkedURL(url) {
      if(url.startsWith('//') || url.startsWith('https://') || url.startsWith('http://') ) {
        return url
      } else {
        return "//" + url
      }
    },

    displaySuccess: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "success";
      this.timeout = 4000;
      this.notifier = true;
    }

  },

  data() {
    return {
      loadingProfile: false,
      loadingRepo: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
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
      repoList: [],
      headers: [],
      expanded: [],
      featureFlag: false,
    }
  }

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

