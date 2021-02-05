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
    "add.popup.title": "Add",
    "editer.popup.title": "Edit",
    "email.error": "Please enter your email",
    "email.validation.error": "E-mail must be valid",
    "name.required.error": "Name is required",
    "name.validation.error": "Name must be less than 20 characters",
    "role.required.error": "Role is required",
    "userName.required.error": "Name is required. Enter a valid orcid",
    "message.test.repo": "Check this if your repository is for testing purposes"
  },
  "fr": {
    "title" : "Mon entrepôt",
    "repo.name": "Nom de l'entrepôt",
    "email": "Courriel du contact",
    "keywords": "Mots clefs",
    "name.label": "Nom",
    "role.label": "Rôle",
    "add.popup.title": "Ajouter",
    "editer.popup.title": "Editer",
    "email.error": "Veuillez entrer voute courriel",
    "email.validation.error": "Le courriel doit être valide",
    "name.required.error": "Le nom est obligatoire",
    "name.validation.error": "Le nom doit faire moins de 20 caractères",
    "role.required.error": "Role is required",
    "userName.required.error": "Le nom est oblogatoire. Entrer un ORCID valid",
    "message.test.repo": "Cocher cette case si votre entrepôt pour des besoins de test"
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
                    ></v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                <v-simple-table v-if="myRepository.users != null && myRepository.users.length > 0">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">ORCID</th>
                        <th class="text-left">{{$t('name.label')}}</th>
                        <th class="text-left">{{$t('role.label')}}</th>
                        <th class="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(userItem, index) in myRepository.users" :key="index">
                        <td>{{ userItem.orcid }}</td>
                        <td>{{ userItem.name }}</td>
                        <td>{{ $t(userItem.role) }}</td>
                        <td>
                            <v-btn v-if="displayActionsOnUser(index)" icon class="mx-0" @click="displayEditUser(index);">     
                                <v-icon size='20px'>fa-edit</v-icon>    
                            </v-btn>
                            <v-btn v-if="displayActionsOnUser(index)" icon class="mx-0" @click="userIndex = index;dialogRemove=true;">     
                                <v-icon size='20px'>fa-trash-alt</v-icon>    
                            </v-btn>
                        </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
                <v-btn class="ml-3 " x-small :title="$t('add.popup.title')" @click="dialogAddEdit=true;userIndex = -1"  fab color="accent"> 
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-checkbox
                        v-model="myRepository.isTest"
                        :label="$t('message.test.repo')"
                        color="orange"
                    ></v-checkbox>
                </v-col>
            </v-row>
            </v-container>
            <div class="text-right">
                     <v-btn text
                        color="primary"
                        @click="goToRepositories"
                        >
                        {{ $t("button.cancel") }}
                    </v-btn>
                     <v-btn
                        color="primary"
                        @click="save"
                        :disabled="!valid"
                        >
                        {{ $t('button.save') }}
                    </v-btn>
            </div>
        </v-form>
        <v-form v-model="validPopup">
            <v-dialog
                v-model="dialogAddEdit"
                width="500"
                >
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    {{ dialogTitle }}
                    </v-card-title>
                    <v-form v-model="validOrcid">
                    <v-card-actions>
                        <v-text-field class="pl-4" v-model="user.orcid" prepend-inner-icon="mdi-identifier" :counter="19" :rules="rules.orcIdRules" label="ORCID" required></v-text-field>
                        <v-btn class="ml-3" color="primary" @click="searchOnOrcid" :disabled="!validOrcid" :loading="loadingOrcid">{{ $t('button.search') }}</v-btn>
                    </v-card-actions>
                    </v-form>
                    <v-card-text>
                    <v-text-field :rules="rules.userNameRules" v-model="user.name" prepend-inner-icon="mdi-account" label="Name" readonly filled></v-text-field>
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
                    <v-btn
                        color="primary"
                        text
                        @click="cancelAddUser"
                    >
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn
                        color="primary" :disabled="!validPopup"
                        @click="addUser"
                    >
                        {{ $t("button.confirm") }}
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            </v-form>

            <v-dialog
                v-model="dialogRemove"
                width="500"
                >
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                {{ $t('button.confirmation') }}
                </v-card-title>
                <v-card-text>Do you really want to remove this user ?</v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn
                    color="primary"
                    text
                    @click="dialogRemove = false"
                >
                    {{ $t('button.cancel') }}
                </v-btn>
                <v-btn
                    color="primary"
                    @click="dialogRemove = false;removeUser()"
                >
                    {{ $t('button.confirm') }}
                </v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>
        </template>
    </div>
</template>


<script>

export default {
    props: {

  	},
    data() {
        return {
            dialogRemove: false,
            dialogAddEdit: false,
            roles: ["EDITOR", "CONTRIBUTOR", "READER"],
            valid: false,
            validPopup: false,
            validOrcid: false,
            searchKeywords: null,
            userIndex: -1,
            user: {
                role: null,
                name: null,
                orcid: null,
                id: null
            },
            loadingOrcid: false,
            myRepository: {id:null, name: null, keywords:[], contact: null, users: [], isTest: false},
            repositoryId: this.$route.query.repositoryId,
            rules: {
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
      userIsAdmin: function()  {
        let isadmin
        if(this.$store.getters.getUser != null) {
          isadmin = this.$store.getters.getUser.admin
        } 
        return isadmin;
      },
      dialogTitle: function() {
          if(this.userIndex == -1){
              return this.$t('add.popup.title')
          } else {
              return this.$t('editer.popup.title')
          }
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
                }).catch(function(error) {self.displayError("An error has occured:" + error)})
        } else {
            //this.myRepository = this.emptyRepo
            // If the user creating a new repository he is manager by default
            // if the logged user is admin no need to add him. He has all the rights.
    	    if(!this.userIsAdmin && (this.myRepository.users == null || this.myRepository.users.length == 0)) {
                let localUser = {id: this.userProfile.id , orcid: this.userProfile.orcid, name: this.userProfile.name , role: 'EDITOR'}
                this.myRepository.users.push(localUser)
            }
            this.myRepository.contact = this.userProfile.email
        }

    },

    methods: {
        addUser() {
            this.dialogAddEdit = false
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
        },
        removeUser() {
            this.myRepository.users.splice(this.userIndex, 1)
        },
        displayEditUser(index) {
            this.userIndex = index
            this.user = JSON.parse(JSON.stringify(this.myRepository.users[index]))
            this.dialogAddEdit = true
        },
        goToRepositories() {
            this.$router.push({ path: '/repositories'});
        },
        save () {
            var self = this;
            this.axios({
                method: 'post',
                url: this.service+'/repository/v1_0/save',
                data: this.myRepository
            }).then ( function () {self.goToRepositories()})
            .catch(function(error) {self.displayError("An error has occured:" + error)})
        },

        searchOnOrcid() {
            var self = this;
            this.loadingOrcid = true
            this.axios.get(this.service+'/orcid/v1_0/getPersonNameByOrcid/'+this.user.orcid)
            .then(function (response) {
                console.log('Response '+JSON.stringify(response.data))
                self.user.name = response.data
            }).catch(function(error) {self.displayError("An error has occured:" + error)})
            .finally(() => this.loadingOrcid = false)
        },

        cancelAddUser() {
            this.dialogAddEdit = false
            this.user={name: null, orcid:null, role: null}
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
        },

        displayActionsOnUser: function(index) {
            return !(this.isLastManager && this.myRepository.users[index].role == 'EDITOR')
        }

    },

    
} 
</script>

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