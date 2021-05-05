<template>
  <v-layout>

    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('administration.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <div v-if="!loading" class="pa-5">
      <template v-if="users != null && users.length > 0">
      <v-card>
      <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        :label="$t('administration.screen.search.bar.label')"
        single-line
        hide-details
      ></v-text-field>
       </v-card-title>
        <v-data-table
          :headers="headers"
          :items="users"
          :items-per-page="5"
          class="elevation-1"
          :search="search"
        >
            <template v-slot:item.admin="{ item }">  
                <v-icon v-if="item.adminId != null">mdi-check</v-icon>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <template v-if="item.adminId == null">
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn  icon v-on="on" :loading="loadingGiveRole[index]" class="mx-0 pa-3" @click="giveRole(item, index)">     
                      <v-icon size="20px">mdi-account-plus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.edit.help.message') }}</span>
              </v-tooltip>
              </template>
              <template v-else>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" :loading="loadingRemonveRole[index]" class="mx-0 pa-3" @click="openDialogConfirmationRemoveAdmin(item, index)">     
                      <v-icon size="20px">mdi-account-minus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.delete.help.message') }}</span>
              </v-tooltip>
              </template>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" :loading="loadingRemonveRole[index]" class="mx-0 pa-3" @click="openDialogEditUser(item, index)">     
                      <v-icon>mdi-email-edit-outline</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.edit.email.help.message') }}</span>
              </v-tooltip>
            </template> 
        </v-data-table>
      </v-card>
      </template>
    </div>

    <v-dialog v-model="dialogRemoveAdmin" :width="$store.getters.getDialogWidth">
    <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
        {{ titleDialogConfirmationRemoveAdmin() }}
        </v-card-title>
        <v-card-text>{{ labelDialogConfirmationRemoveAdmin() }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn @click="dialogRemoveAdmin = false">
            {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="info" @click="removeAdminRoleHasBeenConfirmed()">
            {{ $t('button.confirm') }}
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>

 
    <v-form v-model="validEditUser">
        <v-dialog v-model="dialogEditUser" :width="$store.getters.getDialogWidth">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                {{ $t('administration.scree.edit.user.title', {'msg': item.name}) }}
                </v-card-title>
                <v-card-text>
                  <v-text-field class="pt-5 required" v-model="editedUser.email" 
                    outlined dense prepend-inner-icon="mdi-email" 
                    :label="$t('repository.screen.create.user.email')"
                    :rules="rules.emailRules">
                  </v-text-field>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn @click="cancelEditUser">
                    {{ $t("button.cancel") }}
                </v-btn>
                <v-btn color="info" :disabled="!validEditUser" @click="saveUser">
                    {{ $t("button.confirm") }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-form>

    </v-flex>
  </v-layout>

</template>

<script>
import moment from 'moment';
import {displayError} from '../utils.js'
export default {

  data() {
    return {
      users: [],
      loading: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      headers: [] ,
      loadingGiveRole: [],
      loadingRemonveRole: [],
      search: null,
      dialogRemoveAdmin: false,
      item: {},
      index: null,
      validEditUser: false,
      dialogEditUser: false,
      editedUser: {
        	id: null,
        	adminId: null,
        	orcid: null,
        	name: null,
        	email: null
      },
      rules: {
          emailRules: [
              v => !!v || this.$t('repository.screen.error.repository.email.mandatory'),
              v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || this.$t('repository.screen.error.repository.email.validation'),
          ],
      },
    }
  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.headers = [
          { text: this.$t('user.table.column.user.name'), value: 'name' },
          { text: this.$t('user.table.column.user.email'), value: 'email' },
          { text: this.$t('user.table.column.user.admin'), value: 'admin', sortable: false  },
          { text: this.$t('user.table.column.user.actions'), value: 'actions', sortable: false  }
          ] ,
    this.refeshData();
  },

  props: {

  },

  computed: {

    service: function()  {
      return this.$store.getters.getService
    },

    userId: function() {
      let id = null
      if(this.$store.getters.getUser != null) {
        id = this.$store.getters.getUser.profile.id
      }
      return id
    },


  },

  methods: {

    refeshData() {
      var self = this;
      self.loading = true
      this.axios.get(this.service+'/admin/v1_0/listAllUsers')
      .then(response => {
        self.users = response.data
      }).catch(function(error) {displayError(self, error)})
      .finally(() => self.loading = false)
    },

    openDialogConfirmationRemoveAdmin(item, index) {
      this.item = item;
      this.index= index;
      this.dialogRemoveAdmin = true
    },

    openDialogEditUser(item, index) {
      this.editedUser = JSON.parse(JSON.stringify(item))
      this.index= index;
      this.dialogEditUser = true
    },

    cancelEditUser() {
      this.index= null;
      this.editedUser = {
        	id: null,
        	adminId: null,
        	orcid: null,
        	name: null,
        	email: null
      }
      this.dialogEditUser = false
    },

    saveUser() {
      this.saving = true
      self = this
      this.axios.post(this.service + "/profile/v1_0/saveProfile?language=" + this.language, this.editedUser).then(function(response) {
        self.dialogEditUser = false
        self.users.splice(self.index, 1, self.editedUser)

      })
      .catch(function(error) {
        displayError(self, error)
      })
      .finally(function() {
        self.saving = false;
      });
    },

    titleDialogConfirmationRemoveAdmin() {
      if(this.item && this.userId == this.item.userId) {
        return this.$t('administration.scree.remove.admin.ownrole.confirmation.title')
      } else {
        return this.$t('administration.scree.remove.admin.confirmation.title')
      }
    },

    labelDialogConfirmationRemoveAdmin() {
      if(this.item) {
        if(this.userId == this.item.userId) {
          return this.$t('administration.scree.remove.admin.ownrole.confirmation.label')
        } else {
          return this.$t('administration.scree.remove.admin.confirmation.label', {msg: this.item.name})
        }
      }
    },

    removeAdminRoleHasBeenConfirmed() {
      this.dialogRemoveAdmin = false
      this.removeRole(this.item, this.index)
    },

    giveRole(item, index) {
      var self = this;
      this.loadingGiveRole[this.index] = true
      this.axios.post(this.service+'/admin/v1_0/save/'+item.id)
      .then(response => {
        if(response.data) {
          self.refeshData()
        }
      }).catch(function(error) {displayError(self, error)})
      .finally(() => self.loadingGiveRole = [])
    },

    removeRole(item, index) {
      var self = this;
      this.loadingRemonveRole[this.index] = true
      this.axios.delete(this.service+'/admin/v1_0/delete/'+item.adminId)
      .then(response => {
        if(response.data) {
          self.refeshData()
        }
      }).catch(function(error) {displayError(self, error)})
      .finally(() => self.loadingRemonveRole = [])
    },

    displaySuccess: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "success";
      this.timeout = 4000;
      this.notifier = true;
    }

  },

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

.required label::after {
  content: " *";
  color: red;
}

</style>

