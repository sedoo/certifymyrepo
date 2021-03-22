<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title": "Administration",
    "tab.name": "Name",
    "tab.email": "Email",
    "tab.admin": "Administrator",
    "tab.actions": "Actions",
    "edit.help.message": "Give administrator role",
    "delete.help.message": "Remove administrator role",
    "search": "Search"
  },
  "fr": {
    "title": "Administration",
    "tab.name": "Nom",
    "tab.email": "Courriel",
    "tab.admin": "Administrator",
    "tab.actions": "Actions",
    "edit.help.message": "Donner les droits administrateur",
    "delete.help.message": "Retier les droits administrateur",
    "search": "Recherche"
  }
}
</i18n>
<template>
  <v-layout>

    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('title') }}</h1>
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
        :label="$t('search')"
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
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-if="!item.admin" v-on="on" :loading="loadingGiveRole[index]" class="mx-0 pa-3" @click="giveRole(item, index)">     
                      <v-icon size="20px">mdi-account-plus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('edit.help.message') }}</span>
              </v-tooltip>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-if="item.admin" v-on="on" :loading="loadingRemonveRole[index]" class="mx-0 pa-3" @click="removeRole(item, index)">     
                      <v-icon size="20px">mdi-account-minus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('delete.help.message') }}</span>
              </v-tooltip>
            </template> 
        </v-data-table>
      </v-card>
      </template>
    </div>
    </v-flex>
  </v-layout>

</template>

<script>
import moment from 'moment';
export default {

  data() {
    return {
      users: [],
      loading: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      headers: [
          { text: this.$t('tab.name'), value: 'name' },
          { text: this.$t('tab.email'), value: 'email' },
          { text: this.$t('tab.admin'), value: 'admin' },
          { text: this.$t('tab.actions'), value: 'actions' }
          ] ,
      loadingGiveRole: [],
      loadingRemonveRole: [],
      search: null,
    }
  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
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
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
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
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
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
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
      .finally(() => self.loadingRemonveRole = [])
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

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

