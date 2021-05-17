<template>
    <div class="repository">

    <AffiliationCreationEditionDialog
      @cancel="creatingAffiliation = false"
      @created="affiliationCreated"
      :visible="creatingAffiliation"
      mode="creation"
    ></AffiliationCreationEditionDialog>

    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <h1 class="subheading grey--text">{{$t('repository.screen.title')}}</h1>

        <template>
        <v-form v-model="valid" class="ma-5 dense">
            <v-row>
                <v-col cols="12">
                <v-text-field outlined dense
                    v-model="myRepository.name"
                    :rules="rules.nameRules"
                    :counter="20"
                    :label="$t('repository.screen.label.repository.name')"
                    class="required"
                ></v-text-field>
                </v-col>
                <v-col cols="12" >
                    <v-text-field outlined dense
                        v-model="myRepository.contact"
                        :rules="rules.emailRules"
                        :label="$t('repository.screen.label.repository.email')"
                        class="required"
                    ></v-text-field>
                </v-col>
            <v-col cols="11" class="pa-0">
              <v-autocomplete outlined dense
                :rules="affiliationRules"
                v-model="editedAffiliation"
                :items="affiliations"
                class="required"
                prepend-inner-icon="mdi-bank"
                :label="$t('repository.screen.label.repository.affiliation')"
                :loading="affiliationLoading"
              ></v-autocomplete>
            </v-col>
            <v-col cols="1" class="py-0">
                <v-btn 
                  fab color="info"
                  small
                  title="Create an affiliation"
                  @click="creatingAffiliation = true">
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
            </v-col>
                <v-col cols="12" >
                    <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-combobox multiple v-on="on"
                                        v-model="myRepository.keywords" 
                                        :label="$t('repository.screen.label.repository.keywords')"
                                        small-chips
                                        outlined dense
                                        deletable-chips
                                        :search-input.sync="searchKeywords"
                                        >
                        </v-combobox>
                    </template>
                    <span v-html="$t('repository.screen.label.repository.keywords.help')"></span>
                    </v-tooltip>
 
                </v-col> 
                <v-col cols="12" >
                    <v-text-field outlined dense
                        v-model="myRepository.url"
                        :label="$t('repository.screen.label.repository.url')"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" >
                    <v-textarea
                        v-model="myRepository.description"
                        :label="$t('repository.screen.label.repository.description')"
                        outlined
                    ></v-textarea>
                </v-col>
                <v-col cols="12">
                <v-simple-table v-if="myRepository.users != null && myRepository.users.length > 0">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">{{$t('repository.screen.label.user.name')}}</th>
                        <th class="text-left">{{$t('repository.screen.label.user.role')}}</th>
                        <th class="text-left">{{$t('repository.screen.label.actions')}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(userItem, index) in myRepository.users" :key="index">
                        <td>{{ userItem.name }}</td>
                        <td>{{ $t(userItem.role) }}</td>
                        <td>
                            <v-btn v-if="displayActionsOnUser(index)" icon class="mx-0" @click="openEditUserRole(index);">     
                                <v-icon>mdi-pencil-outline</v-icon>    
                            </v-btn>
                            <v-btn v-if="displayActionsOnUser(index)" icon class="mx-0" @click="userIndex = index;dialogRemoveUser=true;">     
                                <v-icon>mdi-delete-forever-outline</v-icon>    
                            </v-btn>
                        </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
                <v-btn class="ml-3 " x-small :title="$t('repository.screen.add.user.title')" @click="openAddUserDialog()"  fab color="info"> 
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
                </v-col>
            </v-row>
            <v-layout justify-end>
                     <v-btn @click="goToRepositories" class="mr-5">
                        {{ $t("button.cancel") }}
                    </v-btn>
                     <v-btn color="info" @click="save" :disabled="!valid">
                        {{ $t('button.save') }}
                    </v-btn>
            </v-layout>
        </v-form>
        <v-dialog v-model="dialogEditUserRole" :width="$store.getters.getDialogWidth">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                {{ $t('repository.screen.edit.user.role.title') }}
                </v-card-title>
                <v-card-text>
                <v-text-field class="pt-2" v-model="user.name" prepend-inner-icon="mdi-account" :label="$t('repository.screen.label.user.name')" readonly filled></v-text-field>
                <v-select :rules="rules.roleRules" outlined
                v-model="user.role"
                :items="roles"
                :label="$t('repository.screen.add.user.label.select.role')">
                    <template slot="selection" slot-scope="data">
                        <!-- HTML that describe how select should render selected items -->
                        {{ $t(data.item) }} 
                    </template>
                    <template slot="item" slot-scope="data">
                        <!-- HTML that describe how select should render items when the select is open -->
                        {{ $t(data.item) }}
                    </template>
                </v-select>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn @click="cancelAddUser">
                    {{ $t("button.cancel") }}
                </v-btn>
                <v-btn color="info" @click="editUserRole">
                    {{ $t("button.confirm") }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-form v-model="validPopupCreateUser">
            <v-dialog v-model="dialogCreateUser" :width="$store.getters.getDialogWidth">
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    {{ $t('repository.screen.create.user.title') }}
                    </v-card-title>
                    <v-card-actions>
                        <v-radio-group class="pl-2" v-model="creationMode" row>
                            <v-radio label="ORCID" value="orcid"></v-radio>
                            <v-radio label="Renater email" value="email"></v-radio>
                        </v-radio-group>
                    </v-card-actions>
                    <v-form v-if="creationMode == 'orcid'" v-model="validOrcid">
                        <v-card-actions>
                            <v-text-field class="pl-4 required" v-model="orcid" outlined dense prepend-inner-icon="mdi-identifier" :counter="19" :rules="rules.orcIdRules" label="ORCID" required></v-text-field>
                            <v-btn class="ml-3 mb-6" color="info" @click="searchOnOrcid" :disabled="!validOrcid" :loading="loadingUser">{{ $t('button.search') }}</v-btn>
                        </v-card-actions>
                    </v-form>
                    <v-card-text v-if="creationMode == 'orcid'">
                        <v-text-field class="pt-2" :rules="rules.userNameOrcidRules" outlined dense v-model="userName" prepend-inner-icon="mdi-account" :label="$t('repository.screen.label.user.name')" readonly filled></v-text-field>
                        <v-text-field class="pt-2" v-model="email" outlined dense prepend-inner-icon="mdi-email" :label="$t('repository.screen.create.user.email')"></v-text-field>
                    </v-card-text>
                    <v-card-text v-else>
                        <v-text-field class="pt-2 required" :rules="rules.userNameRules" outlined dense v-model="userName" prepend-inner-icon="mdi-account" :label="$t('repository.screen.label.user.name')"></v-text-field>
                        <v-text-field class="pt-2 required" v-model="email" outlined dense prepend-inner-icon="mdi-email" :rules="rules.emailRules" :label="$t('repository.screen.create.user.email')" required></v-text-field>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn @click="cancelCreateUser">
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn color="info" :disabled="!validPopupCreateUser" @click="saveUser">
                        {{ $t("button.confirm") }}
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-form>

        <v-form v-model="validPopupAddUser">
            <v-dialog v-model="dialogAddUser" :width="$store.getters.getDialogWidth">
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    {{ $t('repository.screen.add.user.title') }}
                    </v-card-title>
                    <v-card-text  class="py-0">
                    <v-progress-linear indeterminate v-if="loadingUsers" class="mt-3"></v-progress-linear>
                    <div style="width: 100%;" v-else>
                        <v-text-field class="py-3"
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('repository.screen.add.user.label.search.bar')"
                            single-line
                            outlined dense
                            hide-details
                            @input="clearSelectedUser"
                        ></v-text-field>
                        <v-data-table item-key="name" show-select single-select
                            v-model="selectedUser"
                            @input="rowClick"
                            @click:row="rowClick"
                            :headers="headers"
                            :items="foundUsers"
                            :items-per-page="5"
                            class="elevation-1 mb-2"
                            :search="search"
                        >
                        </v-data-table>
                        <div class="error--text v-messages">
                            <div v-show="selectedUser.length == 0 && rowClicked" class="v-messages__message">{{ $t('repository.screen.error.select.one.user') }}</div>
                        </div>
                    </div>
                    </v-card-text>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn class="mx-3" color="info" @click="openCreateUserDialog">{{ $t('repository.screen.create.user.title') }}</v-btn>
                    </v-card-actions>
                    <v-divider></v-divider>
                    <v-card-text class="py-5">
                    <v-select :rules="rules.roleRules"
                        class="required"
                        v-model="role"
                        outlined dense
                        :items="roles"
                        :label="$t('repository.screen.add.user.label.select.role')">
                        <template slot="selection" slot-scope="data">
                            <!-- HTML that describe how select should render selected items -->
                            {{ $t(data.item) }} 
                        </template>
                        <template slot="item" slot-scope="data">
                            <!-- HTML that describe how select should render items when the select is open -->
                            {{ $t(data.item) }}
                        </template>
                    </v-select>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn @click="cancelAddUser">
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn color="info" :disabled="!validPopupAddUser || selectedUser.length == 0" @click="addUserRole">
                        {{ $t("button.confirm") }}
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            </v-form>

            <v-dialog v-model="dialogRemoveUser" :width="$store.getters.getDialogWidth">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                {{ $t('repository.screen.delete.user.confirmation.title') }}
                </v-card-title>
                <v-card-text>{{ $t('repository.screen.delete.user.confirmation.message') }}</v-card-text>
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
        </template>
    </div>
</template>


<script>
import {displayError} from '../utils.js'
import {displaySuccess} from '../utils.js'
import AffiliationCreationEditionDialog from "../components/AffiliationCreationEditionDialog";
import formattedAffiliationMixin from "../mixins/formattedAffiliationMixin";
export default {
    mixins: [formattedAffiliationMixin],
    components: {
        AffiliationCreationEditionDialog
    },
    data() {
        return {
            /** 
             * There are 4 dialogs:
             * - Add an known user
             * - Create an new user by orcid (check) or email/renater (no check) 
             * - Remove an user from a repository
             * - Edit user role
             */
            dialogRemoveUser: false,
            dialogEditUserRole: false,
            dialogAddUser: false,
            dialogCreateUser: false,
            roles: ["EDITOR", "CONTRIBUTOR", "READER"],
            /** Main repository form variable */
            valid: false,
            validPopupCreateUser: false,
            validPopupAddUser: false,
            validOrcid: false,
            validRenaterEmail: false,
            /** My repository keywords fields */
            searchKeywords: null,
            /** loading button for user lookup */
            loadingUsers: false,
            /** List of user found in "Add a kown user" dialog */
            headers: [
                { text: this.$t('user.table.column.user.name'), value: 'name' },
                { text: this.$t('user.table.column.user.email'), value: 'email' }
                ] ,
            /** loading button for orcid lookup */
            loadingUser: false,
            userIndex: -1,
            orcid: null,
            email: null,
            userName: null,
            /** 
             * Used by "Add an known user" dialog
             * Look for a string in name and email 
             * Retuen a list of users. Only one can be selected
             */
            keyword: null,
            foundUsers: [],
            selectedUser: [],
            role: null,
            rowClicked: false,
            search: null,
            /**
             * skeleton of user role object
             * a repositoru contains an array of it
             */
            user: {
                role: null,
                name: null,
                id: null
            },
            myRepository: {id:null, name: null, affiliationId: null, url: null, keywords:[], contact: null, users: []},
            repositoryId: this.$route.query.repositoryId,
            rules: {
                userNameOrcidRules: [v => !!v || this.$t('repository.screen.error.user.name.required.orcid.error')],
                userNameRules: [v => !!v || this.$t('repository.screen.error.user.name.required.renater.error')],
                roleRules: [v => !!v || this.$t('repository.screen.error.user.role.required')],
                nameRules: [
                    v => !!v || this.$t('repository.screen.error.repository.name.madatory'),
                    v => !!v && v.length <= 20 || this.$t('repository.screen.error.repository.name.validation'),
                ],
                orcIdRules: [
                    v => !!v || 'ORCID is required',
                    v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{3,3}[0-9Xx])/.test(v) || 'ORCID must be valid',
                    v => !!v && v.length <= 19 || 'ORCID length must be exactly 19 characters',
                ],
                emailRules: [
                    v => !!v || this.$t('repository.screen.error.repository.email.mandatory'),
                    v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || this.$t('repository.screen.error.repository.email.validation'),
                ],
            },
            creationMode: 'orcid',
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            // Affiliation
            editedAffiliation: null,
            creatingAffiliation: false,
            affiliationRules: [v => !!v || "Affiliation is mandatory"],
            affiliationLoading: false,
            affiliations: [],
        }
    },

    computed: {
      language: function() {
        return this.$store.getters.getLanguage
      },
      userProfile: function()  {
        let profile = null
        if(this.$store.getters.getUser != null) {
          profile = this.$store.getters.getUser.profile
        }
        return profile;
      },
      dialogWidth: function() {
          return JSON.stringify(this.$store.getters.getDialogWidth)
      },
      isLastManager: function() {
        let managerCounter = 0
        for (let i= 0; i < this.myRepository.users.length; i++) {
            if(this.myRepository.users[i].role == 'EDITOR') {
                managerCounter++
            }
        }
        if(managerCounter > 1) {
            return false
        } else {
            return true
        }
      },
      service: function()  {
        return this.$store.getters.getService
      },
      affiliationService: function() {
        return this.$store.getters.getService + "/myaffi/v1_0/list";
      },
    },
    
    created: function() {
        this.rowClicked = false
        this.$i18n.locale = this.$store.getters.getLanguage;
        if(this.repositoryId != null) {
            var self = this;
            this.axios.get(this.service+'/repository/v1_0/getRepository/'+this.repositoryId )
                .then(response => {       
                    self.myRepository = response.data
                    self.editedAffiliation = response.data.affiliation.id
                }).catch(function(error) {displayError(self, error)})
        } else {
            let localUser = {id: this.userProfile.id , name: this.userProfile.name , role: 'EDITOR'}
            this.myRepository.users.push(localUser)
            this.myRepository.contact = this.userProfile.email
        }

    },

    mounted: function() {
        this.loadAffiliations();
    },

    methods: {
        /**
         * Populate User role data (userId, name, role) into repository object
         * Called by Add an user functionnalities
         */
        addUserRole() {
            this.dialogAddUser = false
            this.dialogEditUserRole = false
            let user = {name: this.selectedUser[0].name, id:this.selectedUser[0].id, role: this.role}
            if(this.userIndex < 0 ) {
                if(this.myRepository.users == null || this.myRepository.users.length == 0) {
                    let myUserList = [];
                    myUserList.push(user)
                    this.myRepository.users = myUserList;
                } else {
                    this.myRepository.users.push(user)
                }
                
            } else {
                this.myRepository.users.splice(this.userIndex, 1)
                this.myRepository.users.push(user)
            }
            this.keyword = null
        },
        /**
         * Populate User role data (userId, name, role) into repository object
         * Called by Edit user role functionnalities
         */
        editUserRole() {
            this.dialogAddUser = false
            this.dialogEditUserRole = false
            let user = JSON.parse(JSON.stringify(this.user))
            if(this.userIndex < 0 ) {
                if(this.myRepository.users == null || this.myRepository.users.length == 0) {
                    let myUserList = [];
                    myUserList.push(user)
                    this.myRepository.users = myUserList;
                } else {
                    this.myRepository.users.push(user)
                }
                
            } else {
                this.myRepository.users.splice(this.userIndex, 1)
                this.myRepository.users.push(user)
            }
            this.keyword = null
        },
        removeUser() {
            this.myRepository.users.splice(this.userIndex, 1)
        },
        goToRepositories() {
            this.$router.push({ path: '/repositories'});
        },
        save () {
            var self = this;
            this.myRepository.affiliationId = this.editedAffiliation
            this.axios({
                method: 'post',
                url: this.service+'/repository/v1_0/save?language='+this.language,
                data: this.myRepository
            }).then ( function () {self.goToRepositories()})
            .catch(function(error) {
                displayError(self, error)
                })
        },

        saveUser() {
            self = this
            this.axios({
                method: 'post',
                url: this.service + "/profile/v1_0/createNewProfile?language="+this.language,
                data: {name: this.userName, orcid: this.orcid, email: this.email }
            }).then(function(response) {
                self.creatingUser = false
                self.dialogCreateUser = false
                displaySuccess(self, self.$t('repository.screen.create.user.successful'))
            }).catch(function(error) {
                displayError(self, error)
            }).finally(() => {
                this.userName = null
                this.email = null
                this.loadUsers()
            })
        },

        searchOnOrcid() {
            var self = this;
            this.loadingUser = true
            this.axios.get(this.service+'/orcid/v1_0/getUserByOrcId/'+this.orcid)
            .then(function (response) {
                if(response.data.id == null) {
                    self.user = response.data
                    self.userName = response.data.name
                } else {
                    displayError(self, self.$t('repository.screen.create.user.error.duplicate.orcid', {'msg':response.data.name } ))
                }
            }).catch(function(error) {displayError(self, error)})
            .finally(() => this.loadingUser = false)
        },

        searchUserByEmail() {
            var self = this;
            this.loadingUser = true
            this.axios.get(this.service+'/profile/v1_0/profileByEmail?email='+this.email)
            .then(function (response) {
                if(response.data == null || response.data == '') {
                    self.user.email = self.email
                    self.user.email = self.name
                } else {
                    displayError(self, self.$t('repository.screen.create.user.error.duplicate.email', {'msg':response.data.name } ))
                }
            }).catch(function(error) {displayError(self, error)})
            .finally(() => this.loadingUser = false)
        },

        loadUsers() {
            this.user={name: null, id:null, role: null}
            var self = this;
            this.loadingUsers = true
            this.axios.get(this.service+'/profile/v1_0/listAllUsers')
            .then(function (response) {
                self.foundUsers = response.data
            }).catch(function(error) {
                displayError(self, error)
                })
            .finally(() => this.loadingUsers = false)
        },

        /**
         * Not possible to use :rules="..." on v-data-table
         * Error message is handle specificaly see <div class="error--text v-messages">
         * To keep the same behavoir as rules the message is not shown at first but need a click on the checkbox or row to activate it.
         */
        rowClick: function () {
            this.rowClicked = true;
        },

        /**
         * Used in add user dialog
         * Clear the selected user if user does another research updated the list of displayed users
         */
        clearSelectedUser() {
            this.user={name: null, id:null, role: null}
        },

        openAddUserDialog() {
            this.dialogAddUser=true
            this.orcid = null
            this.userIndex = -1
            this.foundUsers = []
            this.keyword = null
            this.user={name: null, id:null, role: null}
            this.loadUsers()
        },

        openCreateUserDialog() {
            this.dialogCreateUser=true
            this.orcid = null
            this.email = null
            this.user={name: null, id:null, role: null}
        },

        openEditUserRole(index) {
            this.userIndex = index
            this.user = JSON.parse(JSON.stringify(this.myRepository.users[index]))
            this.dialogEditUserRole = true
        },

        cancelAddUser() {
            this.dialogEditUserRole = false
            this.dialogAddUser = false
            this.role = null
            this.selectedUser = []
            this.foundUsers = []
            this.keyword = null
        },

        cancelCreateUser() {
            this.dialogCreateUser = false
            this.orcid = null
            this.userName = null
            this.email = null
            this.user={name: null, id:null, role: null}
        },

        displayActionsOnUser: function(index) {
            return !(this.isLastManager && this.myRepository.users[index].role == 'EDITOR')
        },

        affiliationCreated: function() {
            this.creatingAffiliation = false;
            this.loadAffiliations()
        },

        loadAffiliations: function() {

            var self = this;
            this.affiliationLoading = true;
            this.axios
                .get(this.affiliationService)
                .then(function(response) {
                let affiliations = [];
                let aux = response.data;
                for (let i = 0; i < aux.length; i++) {
                    affiliations.push(self.formatAffiliation(aux[i]));
                }

                self.affiliations = affiliations;
                })
                .catch(function(error) {
                    displayError(self, error);
                })
                .finally(function() {
                    self.affiliationLoading = false;
                });
        },

    },

    
} 
</script>

<style>
tr.v-data-table__selected {
  background: #7d92f5 !important;
}
.required label::after {
  content: " *";
  color: red;
}
</style>
<style scoped>

.add-user{
  padding: 20px 20px;
}

.information {
	color: grey;
    font-style: italic;
    font-size: small;
}

.add-orcid {
  position: absolute;
  right: 0;
}

.form-orcid  {
   width: 100% 
}

</style>