<template>
    <div class="repository">

    <AffiliationCreationEditionDialog
      @cancel="creatingAffiliation = false"
      @created="affiliationCreated"
      :visible="creatingAffiliation"
      mode="creation"
    ></AffiliationCreationEditionDialog>

    <h1 class="subheading grey--text">{{$t('repository.screen.title')}}</h1>

        <template>
        <v-form ref="form" v-model="valid" class="ma-5 dense">
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
                :rules="rules.affiliationRules"
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
                  :title="$t('affiliation.create.button')"
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
                    <v-data-table
                        :headers="headersUsersTable"
                        :items="myRepository.users"
                        :items-per-page="5"
                        :sort-by="['name']"
                        :sort-asc="[true]"
                        class="elevation-1"
                        :footer-props="{
                            'items-per-page-text':$t('data.table.items.per.page.text'),
                            'items-per-page-all-text':$t('data.table.items.per.page.all.text')
                        }"
                    >
                        <template v-slot:item.name="{ item }">  
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <span  v-on="on">{{ item.name }}</span>
                                </template>
                                <span>{{ item.email }}</span>
                            </v-tooltip>
                        </template> 
                        <template v-slot:item.role="{ item }">  
                            {{ $t(item.role) }}
                        </template> 
                        <template v-slot:item.actions="{ item, index }">  
                            <div v-if="displayActions(item)">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn v-on="on" icon class="mx-0" @click="openEditUserRole(item);">
                                            <v-icon v-if="hasPendingRequest(index)">mdi-account-plus-outline</v-icon>
                                            <v-icon v-else>mdi-pencil-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span v-if="hasPendingRequest(index)">{{ $t('report.screen.button.accept.user.help') }}</span>
                                    <span v-else>{{ $t('report.screen.button.edit.user.help')}}</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn v-on="on" icon class="mx-0" @click="user = item;dialogRemoveUser=true;">     
                                            <v-icon>mdi-delete-forever-outline</v-icon>    
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('report.screen.button.remove.user.help') }}</span>
                                </v-tooltip>
                                <span v-if="hasPendingRequest(index)" class="red--text text-subtitle-2 pl-5">{{$t('repository.screen.join.request.pending')}}</span>
                            </div>
                        </template> 
                        <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} {{ $t('data.table.page.text') }} {{ items.itemsLength }} 
                        </template>
                    </v-data-table>
                    <v-btn class="ma-3 " small :title="$t('repository.screen.add.user.title')" @click="openAddUserDialog()"  fab color="info"> 
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
                {{ dialogEditUserTitle }}
                </v-card-title>
                <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field class="pt-2" v-model="user.name" 
                            prepend-inner-icon="mdi-account" 
                            :label="$t('repository.screen.label.user.name')" 
                            readonly filled dense
                            >
                        </v-text-field>
                    </v-col>
                    <v-col cols="11">
                        <v-select :rules="rules.roleRules" outlined dense
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
                    </v-col>
                    <v-col cols="1">
                        <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" class="pt-2">mdi-information</v-icon>
                        </template>
                        <span v-html="$t('repository.screen.add.user.help')"></span>
                        </v-tooltip>
                    </v-col>
                </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn @click="cancelAddEditUser">
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
                    <v-card-actions v-if="renater">
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
            <v-dialog v-model="dialogAddUser" :width="$store.getters.getDialogWidth" persistent>
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
                        <v-data-table show-select single-select
                            v-model="selectedUser"
                            @input="rowClick"
                            @click:row="rowClick"
                            :headers="headers"
                            :items="foundUsers"
                            :items-per-page="5"
                            class="elevation-1 mb-2"
                            :search="search"
                            :sort-by="['name']"
                            :sort-asc="[true]"
                        >
                            <template v-slot:item.data-table-select="{ item, isSelected, select }">
                            <v-simple-checkbox
                                :ripple="false"
                                :value="isSelected"
                                :readonly="item.disabled"
                                :disabled="item.disabled"
                                @input="select($event)"
                            ></v-simple-checkbox>
                            </template>
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
                        <v-row>
                            <v-col cols="11">
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
                            </v-col>
                            <v-col cols="1">
                            <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" class="pt-2">mdi-information</v-icon>
                            </template>
                            <span v-html="$t('repository.screen.add.user.help')"></span>
                            </v-tooltip>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn @click="cancelAddEditUser">
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn color="info" :disabled="!validPopupAddUser || selectedUser.length == 0" @click="addUserOnRepo">
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
             * - Remove a user from a repository
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
                email: null,
                id: null,
                status: null
            },
            myRepository: {id:null, name: null, affiliationId: null, url: null, keywords:[], contact: null, users: []},
            repositoryId: this.$route.query.repositoryId,
            rules: {
                userNameOrcidRules: [v => !!v || this.$t('repository.screen.error.user.name.required.orcid.error')],
                userNameRules: [v => !!v || this.$t('repository.screen.error.user.name.required.renater.error')],
                roleRules: [v => !!v || this.$t('repository.screen.error.user.role.required')],
                nameRules: [
                    v => !!v || this.$t('repository.screen.error.repository.name.required')
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
                affiliationRules: [v => !!v || this.$t('repository.screen.error.affiliation.madatory')],
            },
            creationMode: 'orcid',
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            // Affiliation
            editedAffiliation: null,
            creatingAffiliation: false,
            affiliationLoading: false,
            affiliations: [],
            headersUsersTable: [
                    { text: this.$t('repository.screen.label.user.name'), value: 'name'},
                    { text: this.$t('repository.screen.label.user.role'), value: 'role' },
                    { text: this.$t('repository.screen.label.actions'), sortable: false, value: 'actions' },
                    ],
        }
    },

    computed: {
      renater: function() {
        return this.$store.getters.getRenater;
      },
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

      dialogEditUserTitle() {
          if(this.user && this.user.status && this.user.status == 'PENDING') {
              return this.$t('repository.screen.validate.user.request.title')
          } else {
              return this.$t('repository.screen.edit.user.role.title')
          }
      }
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
                }).catch(function(error) {
                    self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
                })
        } else {
            let localUser = {id: this.userProfile.id , name: this.userProfile.name, email: this.userProfile.email, role: 'EDITOR', status: 'ACTIVE'}
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
         * Called by Add a user functionnalities
         */
        addUserOnRepo() {
            this.dialogAddUser = false
            let user = {name: this.selectedUser[0].name, id:this.selectedUser[0].id, role: this.role}
            if(this.myRepository.users == null || this.myRepository.users.length == 0) {
                let myUserList = [];
                myUserList.push(user)
                this.myRepository.users = myUserList;
            } else {
                this.myRepository.users.push(user)
            }
            this.keyword = null
        },
        /**
         * Populate User role data (userId, name, role) into repository object
         * Called by Edit user role functionnalities
         */
        editUserRole() {
            this.dialogEditUserRole = false
            let user = JSON.parse(JSON.stringify(this.user))
            user.status = 'ACTIVE'
            for (let i=0; i<this.myRepository.users.length ; i++) {
                if(this.myRepository.users[i].id == this.user.id) {
                    this.myRepository.users.splice(i, 1)
                    this.myRepository.users.push(user)
                    break
                }
            }
        },
        removeUser() {
            for (let i=0; i<this.myRepository.users.length ; i++) {
                if(this.myRepository.users[i].id == this.user.id) {
                    this.myRepository.users.splice(i, 1)
                    break
                }
            }
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
            }).then ( function () {
                self.goToRepositories()
            }).catch(function(error) {
               self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
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
                self.$unidooAlert.showSuccess(self.$t('repository.screen.create.user.successful'))
            }).catch(function(error) {
                self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
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
                    self.$unidooAlert.showError(self.$t('repository.screen.create.user.error.duplicate.orcid', {'msg':response.data.name } ), self.$t('button.close'))
                }
            }).catch(function(error) {
                self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            })
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
                    self.$unidooAlert.showError(self.$t('repository.screen.create.user.error.duplicate.email', {'msg':response.data.name }), self.$t('button.close'))
                }
            }).catch(function(error) {
                self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            })
            .finally(() => this.loadingUser = false)
        },

        loadUsers() {
            this.user={name: null, id:null, role: null}
            var self = this;
            this.loadingUsers = true
            this.axios.get(this.service+'/profile/v1_0/listAllUsers')
            .then(function (response) {
                self.foundUsers = response.data
                for(let i=0 ; i<self.foundUsers.length ; i++) {
                    if(JSON.stringify(self.myRepository.users).includes(self.foundUsers[i].id)) {
                        self.foundUsers[i].disabled = true
                    } else {
                        self.foundUsers[i].disabled = false
                    }
                }
            }).catch(function(error) {
                self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            }).finally(() => this.loadingUsers = false)
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
            this.role = null
            this.selectedUser = []
            this.foundUsers = []
            this.search = null
            this.user={name: null, id:null, role: null, status: 'ACTIVE'}
            this.loadUsers()
        },

        openCreateUserDialog() {
            this.dialogCreateUser=true
            this.orcid = null
            this.email = null
            this.user={name: null, id:null, role: null}
        },

        openEditUserRole(item) {
            this.user = JSON.parse(JSON.stringify(item))
            this.dialogEditUserRole = true
        },

        cancelAddEditUser() {
            this.dialogEditUserRole = false
            this.dialogAddUser = false
            this.role = null
            this.selectedUser = []
            this.foundUsers = []
            this.search = null
        },

        cancelCreateUser() {
            this.dialogCreateUser = false
            this.orcid = null
            this.userName = null
            this.email = null
            this.user={name: null, id:null, role: null}
        },

        displayActions: function(item) {
            return !(this.isLastManager && item.role == 'EDITOR')
        },

        hasPendingRequest: function(index) {
            return false
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