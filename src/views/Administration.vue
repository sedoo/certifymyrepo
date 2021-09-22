<template>
  <v-layout>
    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('administration.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <div v-if="!loading" class="pa-5">
      <template v-if="users != null && users.length > 0">
      <v-card>
      <v-card-title>
        {{ $t('administration.screen.card.users.title') }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="searchUser"
          append-icon="mdi-magnify"
          :label="$t('administration.screen.search.bar.label')"
          single-line
          hide-details
        ></v-text-field>
      </v-card-text>
        <v-data-table
          :headers="usersTableheader"
          :items="users"
          :items-per-page="5"
          class="elevation-1"
          :search="searchUser"
          :footer-props="{
              'items-per-page-text':$t('data.table.items.per.page.text'),
              'items-per-page-all-text':$t('data.table.items.per.page.all.text')
          }"
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
                  <v-btn icon v-on="on" :loading="loadingRemonveRole[index]" @click="openDialogConfirmationRemoveAdmin(item, index)">     
                      <v-icon size="20px">mdi-account-minus</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.delete.help.message') }}</span>
              </v-tooltip>
              </template>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on" :loading="loadingRemonveRole[index]" @click="openDialogEditUser(item, index)">     
                      <v-icon>mdi-email-edit-outline</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.edit.email.help.message') }}</span>
              </v-tooltip>
            </template> 
            <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} {{ $t('data.table.page.text') }} {{ items.itemsLength }} 
            </template>
        </v-data-table>
      </v-card>
      </template>
    </div>

    <div v-if="!loadingUsers" class="pa-5">
      <template v-if="users != null && users.length > 0">
      <v-card>
      <v-card-title>
        {{ $t('administration.screen.card.affiliations.title') }}
      </v-card-title>
      <v-card-text>
            <v-row>
            <v-col cols="11">
              <v-text-field
                v-model="searchAffiliation"
                append-icon="mdi-magnify"
                :label="$t('administration.screen.search.bar.label')"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="1">
                <v-btn 
                  fab color="info"
                  small
                  :title="$t('affiliation.create.button')"
                  @click="openCreateAffiliation">
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
            </v-col>
            </v-row>
      </v-card-text>
        <v-data-table
          :headers="affiliationsTableheader"
          :items="affiliations"
          :items-per-page="5"
          class="elevation-1"
          :search="searchAffiliation"
          :footer-props="{
              'items-per-page-text':$t('data.table.items.per.page.text'),
              'items-per-page-all-text':$t('data.table.items.per.page.all.text')
          }"
        >
            <template v-slot:item.actions="{ item, index }">
              <template>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn  icon v-on="on" @click="openEditAffiliation(item, index)">     
                      <v-icon>mdi-pencil-outline</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.edit.affiliation.help.message') }}</span>
              </v-tooltip>
              <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                  <v-btn  icon v-on="on" @click="openDeleteAffiliation(item, index)">     
                      <v-icon>mdi-delete-forever-outline</v-icon>    
                  </v-btn>
                  </template>
                  <span>{{ $t('administration.screen.delete.affiliation.help.message') }}</span>
              </v-tooltip>
              </template>
            </template> 
            <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} {{ $t('data.table.page.text') }} {{ items.itemsLength }} 
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
                {{ $t('administration.scree.edit.user.title', {'msg': editedUser.name}) }}
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

    <AffiliationCreationEditionDialog
      @cancel="editingAffiliation = false"
      @created="affiliationCreated"
      :visible="editingAffiliation"
      :mode="mode"
      :editedAffiliation="editedAffiliation"
    ></AffiliationCreationEditionDialog>

    <v-dialog v-model="dialogDeleteAffiliation" :width="$store.getters.getDialogWidth">
    <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
        {{ $t('administration.screen.delete.affiliation.title') }}
        </v-card-title>
        <v-card-text>{{ $t('administration.screen.delete.affiliation.message') }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn @click="dialogDeleteAffiliation = false">
            {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="info" @click="deleteAffiliationHasBeenConfirmed()">
            {{ $t('button.confirm') }}
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>

  </v-layout>

</template>

<script>
import AffiliationCreationEditionDialog from "../components/AffiliationCreationEditionDialog";
import moment from 'moment';
export default {
  components: {
      AffiliationCreationEditionDialog
  },
  data() {
    return {
      users: [],
      affiliations:[],
      loadingUsers: false,
      loadingAffiliation: false,
      usersTableheader: [] ,
      affiliationsTableheader: [] ,
      loadingGiveRole: [],
      loadingRemonveRole: [],
      searchUser: null,
      searchAffiliation: null,
      dialogRemoveAdmin: false,
      dialogDeleteAffiliation: false,
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
      editingAffiliation: false,
      mode: "edition", // edition or creation
      affiliationIndex: null,
      editedAffiliation: {              
        website:"",
        country: "",
        address:"",
        institute:"",
        department:""},
    }
  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.usersTableheader = [
          { text: this.$t('user.table.column.user.name'), value: 'name' },
          { text: this.$t('user.table.column.user.email'), value: 'email' },
          { text: this.$t('user.table.column.user.admin'), value: 'admin', sortable: false  },
          { text: this.$t('user.table.column.user.actions'), value: 'actions', sortable: false  }
          ] ,
    this.affiliationsTableheader = [
          { text: this.$t('affiliation.table.column.institute'), value: 'institute' },
          { text: this.$t('affiliation.table.column.acronym'), value: 'acronym' },
          { text: this.$t('affiliation.table.column.department'), value: 'department' },
          { text: this.$t('affiliation.table.column.actions'), value: 'actions', sortable: false  }
          ] ,
    this.refeshData();
    this.loadAffiliations();
  },

  props: {

  },

  computed: {

    loading: function() {
      return this.loadingUsers || this.loadingAffiliation
    },

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
      self.loadingUsers = true
      this.axios.get(this.service+'/admin/v1_0/listAllUsers')
      .then(response => {
        self.users = response.data
      }).catch(function(error) {
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
      })
      .finally(() => self.loadingUsers = false)
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
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
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
      }).catch(function(error) {
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
      })
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
      }).catch(function(error) {
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
      })
      .finally(() => self.loadingRemonveRole = [])
    },

    openEditAffiliation(item, index) {
      this.editedAffiliation = JSON.parse(JSON.stringify(item))
      this.mode = "edition"
      this.editingAffiliation = true
    },

    openCreateAffiliation() {
      this.mode = "creation"
      this.editingAffiliation = true
    },

    openDeleteAffiliation(item, index) {
      this.dialogDeleteAffiliation = true
      this.affiliationIndex = index
      this.editedAffiliation = item
    },

    cancelEditAffiliation() {
      this.editingAffiliation = false
      this.editedAffiliation = {              
        website:"",
        country: "",
        address:"",
        institute:"",
        department:""}
    },

    affiliationCreated: function() {
        this.editingAffiliation = false;
        this.loadAffiliations()
    },

    loadAffiliations: function() {

        var self = this;
        this.loadingAffiliation = true;
        this.axios
            .get(this.service + "/myaffi/v1_0/list")
            .then(function(response) {
            self.affiliations = response.data;
            })
            .catch(function(error) {
                self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            })
            .finally(function() {
                self.loadingAffiliation = false;
            });
    },

    deleteAffiliationHasBeenConfirmed: function() {
      self = this
      this.axios
          .delete(this.service + "/myaffi/v1_0/delete/"+this.editedAffiliation.id)
          .then(function(response) {
            self.loadAffiliations()
          })
          .catch(function(error) {
              self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
          }).finally(function() {
            self.affiliationIndex = null
            self.dialogDeleteAffiliation = false
          });
    },

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

