<i18n src="../locales.json"></i18n>
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
                <v-icon v-if="item.admin">mdi-check</v-icon>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <div v-if="!item.admin">
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn  icon v-on="on" :loading="loadingGiveRole[index]" class="mx-0 pa-3" @click="giveRole(item, index)">     
                      <v-icon size="20px">mdi-account-plus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.edit.help.message') }}</span>
              </v-tooltip>
              </div>
              <div v-else>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" :loading="loadingRemonveRole[index]" class="mx-0 pa-3" @click="removeRole(item, index)">     
                      <v-icon size="20px">mdi-account-minus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.delete.help.message') }}</span>
              </v-tooltip>
              </div>
            </template> 
        </v-data-table>
      </v-card>
      </template>
    </div>

    <v-dialog v-model="dialogEditAdmin" :width="$store.getters.getDialogWidth">
    <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
        {{ $t('delete.user.confirmation.title') }}
        </v-card-title>
        <v-card-text>{{ $t('delete.user.confirmation.label') }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn @click="dialogRemoveUser = false">
            {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="info" @click="dialogRemoveUser = false;removeUser()">
            {{ $t('button.confirm') }}
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
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

    giveRole(item, index) {
      var self = this;
      this.loadingGiveRole[this.index] = true
      this.axios.post(this.service+'/admin/v1_0/save/'+item.userId)
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

</style>

