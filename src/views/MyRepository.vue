<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title" : "My repository",
    "repo.name": "Repository name",
    "email": "Contact email",
    "keywords": "Keywords",
    "name.label": "Name",
    "role.label": "Role",
    "button.create.user": "Create an user",
    "add.popup.title": "Add an user",
    "editer.popup.title": "Edit",
    "email.error": "Please enter your email",
    "email.validation.error": "E-mail must be valid",
    "name.required.error": "Name is required",
    "name.validation.error": "Name must be less than 20 characters",
    "role.required.error": "Role is required",
    "userName.required.orcid.error": "User name is required. Enter a valid orcid",
    "userName.required.error": "User name is required.",
    "delete.user.confirmation.title": "Delete confirmation",
    "delete.user.confirmation.label": "Do you really want to remove this user?",
    "tab.name": "Name",
    "tab.email": "Email",
    "select.one.user.message": "Select an user in the list",
    "create.user.title": "Create an user",
    "create.user.successful": "The user has been successfully created.",
    "create.user.error.duplicate.orcid": "This ORCID is already in database for the user {msg}.",
    "create.user.error.duplicate.email": "This Email is already in database for the user {msg}.",
    "or.separation": "OR",
    "user.email": "Email",
    "search": "Search"
  },
  "fr": {
    "title" : "Mon entrepôt",
    "repo.name": "Nom de l'entrepôt",
    "email": "Courriel du contact",
    "keywords": "Mots clefs",
    "name.label": "Nom",
    "role.label": "Rôle",
    "button.create.user": "Créer un utilisateur",
    "add.popup.title": "Ajouter un utilisateur",
    "editer.popup.title": "Editer",
    "email.error": "Veuillez entrer voute courriel",
    "email.validation.error": "Le courriel doit être valide",
    "name.required.error": "Le nom est obligatoire",
    "name.validation.error": "Le nom doit faire moins de 20 caractères",
    "role.required.error": "Role is required",
    "userName.required.orcid.error": "Le nom est oblogatoire. Entrer un ORCID valid",
    "userName.required.error": "Le nom est oblogatoire.",
    "delete.user.confirmation.title": "Confirmation de suppression",
    "delete.user.confirmation.label": "Voulez-vous vraiment supprimer cet utilisateur?",
    "tab.name": "Nom",
    "tab.email": "Courriel",
    "select.one.user.message": "Selectionner un utilisateur dans la liste",
    "create.user.title": "Créer un utilisateur",
    "create.user.successful": "L'utilisateur a été créé.",
    "create.user.error.duplicate.orcid": "Cet ORCID est déjà dans la base de données pour l'utilisateur {msg}.",
    "create.user.error.duplicate.email": "Ce courriel est déjà dans la base de données pour l'utilisateur {msg}.",
    "or.separation": "OU",
    "user.email": "Courriel",
    "search": "Recherche"
  }
}
</i18n>
<template>
    <div class="repository">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <h1 class="subheading grey--text">{{$t('title')}}</h1>

        <template>
        <v-form v-model="valid">
            <v-container>
            <v-row>
                <v-col cols="12">
                <v-text-field
                    v-model="myRepository.name"
                    :rules="rules.nameRules"
                    :counter="20"
                    :label="$t('repo.name')"
                    required
                ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" >
                    <v-text-field
                        v-model="myRepository.contact"
                        :rules="rules.emailRules"
                        :label="$t('email')"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" >
                    <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-combobox multiple v-on="on"
                                        v-model="myRepository.keywords" 
                                        :label="$t('keywords')"
                                        chips
                                        deletable-chips
                                        :search-input.sync="searchKeywords"
                                        >
                        </v-combobox>
                    </template>
                    <span v-if="language === 'fr'">Appuyer sur <kbd>entrée</kbd> pour créer un nouveau mot clef</span>
                    <span v-else>Press <kbd>enter</kbd> to create a new keyword</span>
                    </v-tooltip>
 
                </v-col> 
            </v-row>
            <v-row>
                <v-col cols="12" >
                    <v-text-field
                        v-model="myRepository.url"
                        label="URL"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" >
                    <v-textarea
                        v-model="myRepository.description"
                        label="Description"
                        outlined
                    ></v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                <v-simple-table v-if="myRepository.users != null && myRepository.users.length > 0">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">{{$t('name.label')}}</th>
                        <th class="text-left">{{$t('role.label')}}</th>
                        <th class="text-left">Actions</th>
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
                <v-btn class="ml-3 " x-small :title="$t('add.popup.title')" @click="openAddUserDialog()"  fab color="info"> 
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
                </v-col>
            </v-row>
            </v-container>
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
                {{ dialogTitle }}
                </v-card-title>
                <v-card-text>
                <v-text-field class="pt-2" v-model="user.name" prepend-inner-icon="mdi-account" :label="$t('name.label')" readonly filled></v-text-field>
                <v-select :rules="rules.roleRules"
                v-model="user.role"
                :items="roles"
                label="Select a role">
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
                <v-btn color="info" @click="addOrEditUserRole">
                    {{ $t("button.confirm") }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-form v-model="validPopupCreateUser">
            <v-dialog v-model="dialogCreateUser" :width="$store.getters.getDialogWidth">
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    {{ $t('create.user.title') }}
                    </v-card-title>
                    <v-card-actions>
                        <v-radio-group class="pl-2" v-model="creationMode" row>
                            <v-radio label="ORCID" value="orcid"></v-radio>
                            <v-radio disabled label="Renater email" value="email"></v-radio>
                        </v-radio-group>
                    </v-card-actions>
                    <v-form v-if="creationMode == 'orcid'" v-model="validOrcid">
                        <v-card-actions>
                            <v-text-field class="pl-4" v-model="orcid" prepend-inner-icon="mdi-identifier" :counter="19" :rules="rules.orcIdRules" label="ORCID" required></v-text-field>
                            <v-btn class="ml-3" color="info" @click="searchOnOrcid" :disabled="!validOrcid" :loading="loadingUser">{{ $t('button.search') }}</v-btn>
                        </v-card-actions>
                    </v-form>
                    <v-card-text v-if="creationMode == 'orcid'">
                        <v-text-field class="pt-2" :rules="rules.userNameOrcidRules" v-model="user.name" prepend-inner-icon="mdi-account" :label="$t('name.label')" readonly filled></v-text-field>
                        <v-text-field class="pt-2" v-model="user.email" prepend-inner-icon="mdi-email" :label="$t('user.email')"></v-text-field>
                    </v-card-text>
                    <v-card-text v-else>
                        <v-text-field class="pt-2" :rules="rules.userNameRules" v-model="name" prepend-inner-icon="mdi-account" :label="$t('name.label')"></v-text-field>
                        <v-text-field class="px-4" v-model="email" prepend-inner-icon="mdi-email" :rules="rules.emailRules" :label="$t('user.email')" required></v-text-field>
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
                    {{ dialogTitle }}
                    </v-card-title>
                    <v-card-actions  >
                    <v-progress-linear indeterminate v-if="loadingUsers" class="mt-3"></v-progress-linear>
                    <div style="width: 100%;" v-else>
                        {{ $t('select.one.user.message') }}
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('search')"
                            single-line
                            hide-details
                            @input="clearSelectedUser"
                        ></v-text-field>
                        <v-data-table @click:row="rowClick" item-key="name" single-select
                            :headers="headers"
                            :items="foundUsers"
                            :items-per-page="5"
                            class="elevation-1"
                            :search="search"
                        >
                        </v-data-table>
                    
                    </div>
                    </v-card-actions>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn class="mx-3" color="info" @click="openCreateUserDialog">{{ $t('button.create.user') }}</v-btn>
                    </v-card-actions>
                    <v-divider></v-divider>
                    <v-card-actions v-show="false">
                        <!-- Not displayed but used for form validation. An user must have been selected. -->
                        <v-text-field :rules="rules.userNameRules" v-model="user.name" prepend-inner-icon="mdi-account" :label="$t('name.label')" readonly filled></v-text-field>
                    </v-card-actions>
                    <v-card-actions>
                    <v-select :rules="rules.roleRules"
                    v-model="user.role"
                    :items="roles"
                    label="Select a role">
                        <template slot="selection" slot-scope="data">
                            <!-- HTML that describe how select should render selected items -->
                            {{ $t(data.item) }} 
                        </template>
                        <template slot="item" slot-scope="data">
                            <!-- HTML that describe how select should render items when the select is open -->
                            {{ $t(data.item) }}
                        </template>
                    </v-select>
                    </v-card-actions>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn @click="cancelAddUser">
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn color="info" :disabled="!validPopupAddUser" @click="addOrEditUserRole">
                        {{ $t("button.confirm") }}
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            </v-form>

            <v-dialog v-model="dialogRemoveUser" :width="$store.getters.getDialogWidth">
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
        </template>
    </div>
</template>


<script>
import {displayError} from '../utils.js'
import {displaySuccess} from '../utils.js'
export default {
    props: {

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
                { text: this.$t('tab.name'), value: 'name' },
                { text: this.$t('tab.email'), value: 'email' }
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
            myRepository: {id:null, name: null, keywords:[], contact: null, users: []},
            repositoryId: this.$route.query.repositoryId,
            rules: {
                userNameOrcidRules: [v => !!v || this.$t('userName.required.orcid.error')],
                userNameRules: [v => !!v || this.$t('userName.required.error')],
                roleRules: [v => !!v || this.$t('role.required.error')],
                nameRules: [
                    v => !!v || this.$t('name.required.error'),
                    v => !!v && v.length <= 20 || this.$t('name.validation.error'),
                ],
                orcIdRules: [
                    v => !!v || 'ORCID is required',
                    v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{3,3}[0-9Xx])/.test(v) || 'ORCID must be valid',
                    v => !!v && v.length <= 19 || 'ORCID length must be exactly 20 characters',
                ],
                emailRules: [
                    v => !!v || this.$t('email.error'),
                    v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || this.$t('email.validation.error'),
                ],
            },
            creationMode: 'orcid',
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
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
      userIsSuperAdmin: function()  {
        let isSuperAdmin
        if(this.$store.getters.getUser != null) {
          isSuperAdmin = this.$store.getters.getUser.superAdmin
        } 
        return isSuperAdmin;
      },
      dialogTitle: function() {
          if(this.userIndex == -1){
              return this.$t('add.popup.title')
          } else {
              return this.$t('editer.popup.title')
          }
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
    },
    
    mounted: function() {
    	//console.log("Monté")
    },
    
    created: function() {
        this.$i18n.locale = this.$store.getters.getLanguage;
        if(this.repositoryId != null) {
            var self = this;
            this.axios.get(this.service+'/repository/v1_0/getRepository/'+this.repositoryId )
                .then(response => {       
                    self.myRepository = response.data
                }).catch(function(error) {displayError(self, error)})
        } else {
            let localUser = {id: this.userProfile.id , name: this.userProfile.name , role: 'EDITOR'}
            this.myRepository.users.push(localUser)
            this.myRepository.contact = this.userProfile.email
        }

    },

    methods: {
        /**
         * Populate User role data (userId, name, role) into repository object
         * Called by Add an user and Edit user role functionnalities
         */
        addOrEditUserRole() {
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
            this.user = {}
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
                data: this.user
            }).then(function(response) {
                self.creatingUser = false
                self.dialogCreateUser = false
                displaySuccess(self, self.$t('create.user.successful'))
            }).catch(function(error) {
                displayError(self, error)
            }).finally(() => {
                this.user={name: null, id:null, role: null}
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
                } else {
                    displayError(self, self.$t('create.user.error.duplicate.orcid', {'msg':response.data.name } ))
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
                    displayError(self, self.$t('create.user.error.duplicate.email', {'msg':response.data.name } ))
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

        rowClick: function (item, row) {
            console.log(item)
            console.log(this.user)
            row.select(true);
            this.user.id = item.userId
            this.user.name = item.name
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
            this.user={name: null, id:null, role: null}
            this.foundUsers = []
            this.keyword = null
        },

        cancelCreateUser() {
            this.dialogCreateUser = false
            this.orcid = null
            this.user={name: null, id:null, role: null}
        },

        displayActionsOnUser: function(index) {
            return !(this.isLastManager && this.myRepository.users[index].role == 'EDITOR')
        }

    },

    
} 
</script>

<style>
tr.v-data-table__selected {
  background: #7d92f5 !important;
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