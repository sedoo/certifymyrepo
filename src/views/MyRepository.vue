<template>
    <div class="repository">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>

    <h1 class="subheading grey--text">My repository</h1>

        <template>
        <v-form v-model="valid">
            <v-container>
            <v-row>
                <v-col cols="12">
                <v-text-field
                    v-model="myRepository.name"
                    :rules="nameRules"
                    :counter="20"
                    label="Repository name"
                    required
                ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" >
                    <v-text-field
                        v-model="myRepository.contact"
                        :rules="emailRules"
                        label="E-mail"
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
                                        label="Keywords"
                                        chips
                                        deletable-chips
                                        :search-input.sync="searchKeywords"
                                        >
                        </v-combobox>
                    </template>
                    <span>Press <kbd>enter</kbd> to create a new keyword</span>
                    </v-tooltip>
 
                </v-col> 
            </v-row>
            <v-row>
                <v-col cols="12">
                <v-simple-table v-if="myRepository.users != null && myRepository.users.length > 0">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">ORCID</th>
                        <th class="text-left">Name</th>
                        <th class="text-left">Role</th>
                        <th class="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(userItem, index) in myRepository.users" :key="index">
                        <td>{{ userItem.orcid }}</td>
                        <td>{{ userItem.name }}</td>
                        <td>{{ userItem.role }}</td>
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
                <v-btn class="ml-3 " x-small title="Add" @click="dialogAddEdit=true;userIndex = -1"  fab color="accent"> 
                    <v-icon >mdi-plus</v-icon> 
                </v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-checkbox
                        v-model="myRepository.isTest"
                        label='Check this if your repository is for testing purposes'
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
                        Cancel
                    </v-btn>
                     <v-btn
                        color="primary"
                        @click="save"
                        :disabled="!valid"
                        >
                        Save
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
                        <v-text-field class="pl-4" v-model="user.orcid" prepend-inner-icon="mdi-identifier" :counter="19" :rules="orcIdRules" label="ORCID" required></v-text-field>
                        <v-btn class="ml-3" color="primary" @click="searchOnOrcid" :disabled="!validOrcid" :loading="loadingOrcid">Search</v-btn>
                    </v-card-actions>
                    </v-form>
                    <v-card-text>
                    <v-text-field :rules="userNameRules" v-model="user.name" prepend-inner-icon="mdi-account" label="Name" readonly filled></v-text-field>
                    <v-combobox :rules="roleRules"
                    v-model="user.role"
                    :items="roles"
                    label="Select a role"
                    ></v-combobox>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn
                        color="primary"
                        text
                        @click="cancelAddUser"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="primary" :disabled="!validPopup"
                        @click="addUser"
                    >
                        Confirm
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
                Confirmation
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
                    Cancel
                </v-btn>
                <v-btn
                    color="primary"
                    @click="dialogRemove = false;removeUser()"
                >
                    Confirm
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
    	service: null
  	},
    data() {
        return {
            dialogRemove: false,
            dialogAddEdit: false,
            roles: ["MANAGER", "READER"],
            valid: false,
            validPopup: false,
            validOrcid: false,
            searchKeywords: null,
            userIndex: -1,
            user: {
                role: null,
                name: null,
                orcid: null
            },
            loadingOrcid: false,
            myRepository: {id:null, name: null, keywords:[], contact: null, users: [], isTest: false},
            repositoryId: this.$route.query.repositoryId,
            userNameRules: [v => !!v || 'Name is required. Enter a valid orcid'],
            roleRules: [v => !!v || 'Role is required'],
            nameRules: [
                v => !!v || 'Name is required',
                v => !!v && v.length <= 20 || 'Name must be less than 20 characters',
            ],
            orcIdRules: [
                v => !!v || 'ORCID is required',
                v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{3,3}[0-9Xx])/.test(v) || 'ORCID must be valid',
                v => !!v && v.length <= 19 || 'Name must be exactly 20 characters',
            ],
            emailRules: [
                v => !!v || 'E-mail is required',
                v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || 'E-mail must be valid',
            ],
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
        }
    },

    computed: {
      userOrcid: function()  {
        let orcid = null
        if(this.$store.getters.getUser != null) {
          orcid = this.$store.getters.getUser.profile.orcid
        }
        return orcid;
      },
      userName: function()  {
        let name = null
        if(this.$store.getters.getUser != null) {
          name = this.$store.getters.getUser.profile.name
        }
        return name;
      },
      userEmail: function()  {
        let email = null
        if(this.$store.getters.getUser != null) {
          email = this.$store.getters.getUser.profile.email
        }
        return email;
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
              return 'Add'
          } else {
              return 'Edit'
          }
      },
      isLastManager: function() {
        let managerCounter = 0
        for (let i= 0; i < this.myRepository.users.length; i++) {
            if(this.myRepository.users[i].role == 'MANAGER') {
                managerCounter++
            }
        }
        if(managerCounter > 1) {
            return false
        } else {
            return true
        }
      }
    },
    
    mounted: function() {
    	//console.log("Monté")
    },
    
    created: function() {
        if(this.repositoryId != null) {
            var self = this;
            this.axios.get(this.service+'repository/v1_0/getRepository/'+this.repositoryId )
                .then(response => {       
                    self.myRepository = response.data
                }).catch(function(error) {self.displayError("An error has occured:" + error)})
        } else {
            //this.myRepository = this.emptyRepo
            // If the user creating a new repository he is manager by default
            // if the logged user is admin no need to add him. He has all the rights.
    	    if(!this.userIsAdmin && (this.myRepository.users == null || this.myRepository.users.length == 0)) {
                let localUser = {orcid: this.userOrcid, name: this.userName , role: 'MANAGER'}
                this.myRepository.users.push(localUser)
            }
            this.myRepository.contact = this.userEmail
        }
        
        console.log("MyRepository créé "+JSON.stringify(this.myRepository ))

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
                url: this.service+'repository/v1_0/save',
                data: this.myRepository
            }).then ( function () {self.goToRepositories()})
            .catch(function(error) {self.displayError("An error has occured:" + error)})
        },

        searchOnOrcid() {
            var self = this;
            this.loadingOrcid = true
            this.axios.get(this.service+'orcid/v1_0/getPersonNameByOrcid/'+this.user.orcid)
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
            return !(this.isLastManager && this.myRepository.users[index].role == 'MANAGER')
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