<template>
  <v-layout>
  <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('userinformation.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loadingProfile || loadingRepo" class="mt-3"></v-progress-linear>
    <div v-if="!loadingProfile && !loadingRepo">
      <v-card class="ma-5">
        <v-card-title>{{ $t('userinformation.screen.profile.bloc.title')}}</v-card-title>
        <v-card-text><v-icon>mdi-account</v-icon> {{ profile.name }}</v-card-text>
        <v-card-text v-if="orcid != null"><v-icon>mdi-identifier</v-icon>{{ profile.orcid }}</v-card-text>
        <v-card-text v-if="profile.title != null"><v-icon>mdi-bookmark</v-icon>{{ profile.title }}</v-card-text>
        <v-card-text v-if="profile.email != null"> <v-icon>mdi-email</v-icon>{{ profile.email }}</v-card-text>
        <v-card-text><v-icon>mdi-bell-off</v-icon>{{ profile.notification }}</v-card-text>
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
        <v-card-title>{{ $t('userinformation.screen.repositories.bloc.title') }}</v-card-title>
        <v-data-table
          :headers="headers"
          :items="repoList"
          :items-per-page="5"
          :expanded.sync="expanded"
          single-expand
          show-expand
          sort-by="name"
          class="elevation-1"
          :footer-props="{
              'items-per-page-text':$t('data.table.items.per.page.text'),
              'items-per-page-all-text':$t('data.table.items.per.page.all.text')
          }"
        >
            <template v-slot:item.affiliation="{ item }">
              {{ formatAffiliation(item.affiliation).text }}
            </template> 
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
                  <span>{{ $t('repository.button.help.message.link') }}</span>
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
        >{{ $t('userinformation.screen.delete.profile.button') }}
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
            {{ $t('userinformation.screen.delete.profile.confirmation.title') }}
            </v-card-title>
            <v-card-text>
            <p>{{ $t('userinformation.screen.delete.profile.confirmation.message') }}</p>
            <p class="font-weight-bold">{{ $t('userinformation.screen.delete.profile.confirmation.message.warning')  }}
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
import formattedAffiliationMixin from "../mixins/formattedAffiliationMixin";
export default {
  mixins: [formattedAffiliationMixin],
  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.headers = [
        { text: this.$t('repository.table.column.repository.name'), value: 'name' },
        { text: this.$t('repository.table.column.contact'), value: 'contact' },
        { text: this.$t('repository.table.column.repository.affiliation'), value: 'affiliation', sortable: false },
        { text: this.$t('repository.table.column.keywords'), value: 'keywords', sortable: false },
        { text: this.$t('repository.table.column.link'), value: 'url', sortable: false },
        { text: this.$t('repository.table.column.role'), value: 'role', sortable: false },
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
        name = this.$store.getters.getUser.name
      }
      return name
    },
    userId: function() {
      let id = null
      if(this.$store.getters.getUser != null) {
        id = this.$store.getters.getUser.id
      }
      return id
    },
    orcid: function() {
      let orcid
      if(this.$store.getters.getUser != null) {
        orcid = this.$store.getters.getUser.orcid
      }
      return orcid
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
      let self = this;
      this.loadingSimulation = true;
      this.axios
        .get(this.$service + "/profile/v1_0/deleteProfileSimulation/"+this.language+"/"+this.userId)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.warningMessage = response.data
          }
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() {
          self.loadingSimulation = false
          self.dialogDelete = true
        });
    },

    deleteProfile: function() {
      let self = this;
      this.loadingDelete = true;
      this.axios
        .delete(this.$service + "/profile/v1_0/deleteProfile/"+this.language+"/"+this.userId)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.$unidooAlert.showSuccess(response.data)
          }
          this.$store.dispatch("userSignOut")
          this.$keycloak.logout();
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() {
          self.loadingDelete = false
          self.dialogDelete = false
        });
    },

    loadProfile: function() {
      let self = this;
      this.loadingProfile = true;
      this.axios
        .get(this.$service + "/profile/v1_0/profile")
        .then(function(response) {
          if(response.data) {
            self.profile = response.data
            if(self.profile.isNotificationOff) {
              self.profile.notification = self.$t("userinformation.screen.profile.bloc.notification.off")
            } else {
              self.profile.notification = self.$t("userinformation.screen.profile.bloc.notification.on")
            }
          }
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() {
          self.loadingProfile = false;
        });
    },

    loadRepo: function() {
      let self = this;
      this.loadingRepo = true;
      this.axios
        .get(this.$service + "/repository/v1_0/listMyRepositories")
        .then(function(response) {
          if(response.data != null) {
            self.repoList = response.data
          }
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
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

  },

  data() {
    return {
      loadingProfile: false,
      loadingRepo: false,
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
      featureFlag: true,
    }
  }

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

