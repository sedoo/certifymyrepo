<template>
    <div class="repository">

    <div style="background:red" v-if="errored">
    Error: {{ errorMessage }}
    </div>

    <h1 class="subheading grey--text">My repository</h1>

        <template>
        <v-form v-model="valid">
            <v-container>
            <v-row>
                <v-col
                cols="12"
                md="6"
                >
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
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-text-field
                        v-model="myRepository.contact"
                        :rules="emailRules"
                        label="E-mail"
                        required
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-combobox multiple
                                v-model="myRepository.keywords" 
                                label="Keywords"
                                chips
                                deletable-chips
                                :search-input.sync="searchKeywords"
                                >
                    </v-combobox>
                </v-col> 
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="6"
                    >
                <p class="font-weight-thick">You can add repository users</p>
                <v-simple-table v-if="myRepository.users != null && myRepository.users.length > 0">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">ORCID</th>
                        <th class="text-left">Role</th>
                        <th class="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(userItem, index) in myRepository.users" :key="index">
                        <td>{{ userItem.orcid }}</td>
                        <td>{{ userItem.role }}</td>
                        <td>
                            <v-btn icon class="mx-0" @click="displayEditUser(index);">     
                                <v-icon size='20px'>fa-edit</v-icon>    
                            </v-btn>
                            <v-btn icon class="mx-0" @click="userIndex = index;dialogRemove=true;">     
                                <v-icon size='20px'>fa-trash-alt</v-icon>    
                            </v-btn>
                        </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
                <div class="text-right pa-1" >
                    <v-btn color="primary" @click="dialogAddEdit=true;userIndex = -1">ADD</v-btn>
                </div>
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
                    <div class="add-user">
                    <v-text-field
                        v-model="user.orcid"
                        :counter="19"
                        :rules="orcIdRules"
                        label="ORCID"
                        required
                    ></v-text-field>
                    <v-combobox
                    v-model="user.role"
                    :items="roles"
                    label="Select a role"
                    ></v-combobox>
                    </div>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn
                        color="primary"
                        text
                        @click="dialogAddEdit = false;user={}"
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

        </v-form>
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
            errored: false,
            valid: false,
            validPopup: false,
            searchKeywords: null,
            userIndex: -1,
            user: {},
            myRepository: {id:null, name: null, keywords:[], contact: null, users: []},
            //emptyRepo: {id:null, name: null, keywords:[], contact: null, users: []},
            repositoryId: this.$route.query.repositoryId,
            nameRules: [
                v => !!v || 'Name is required',
                v => !!v && v.length <= 20 || 'Name must be less than 20 characters',
            ],
            orcIdRules: [
                v => !!v || 'ORCID is required',
                v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/.test(v) || 'E-mail must be valid',
                v => !!v && v.length <= 19 || 'Name must be exactly 20 characters',
            ],
            emailRules: [
                v => !!v || 'E-mail is required',
                v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || 'E-mail must be valid',
            ]
        }
    },

    computed: {
      userOrcid: function()  {
        if(this.$store.getters.getUser != null) {
          return this.$store.getters.getUser.orcId
        } else {
          return null;
        }
      },
      userIsAdmin: function()  {
        if(this.$store.getters.getUser != null) {
          return this.$store.getters.getUser.admin
        } else {
          return null;
        }
      },
      dialogTitle: function() {
          if(this.userIndex == -1){
              return 'Add'
          } else {
              return 'Edit'
          }
      }
    },
    
    mounted: function() {
    	//console.log("Monté")
    },
    
    created: function() {
        if(this.repositoryId != null) {
            this.errored = false;
            this.axios.get(this.service+'repository/v1_0/getRepository/'+this.repositoryId )
                .then(response => {       
                    this.myRepository = response.data
                })
                .catch(error => {
                    console.log('Error : '+error)
                    this.errorMessage = error.message;
                    this.errored = true
                })
        } else {
            //this.myRepository = this.emptyRepo
            // If the user creating a new repository he is manager by default
            // if the logged user is admin no need to add him. He has all the rights.
    	    if(!this.userIsAdmin && (this.myRepository.users == null || this.myRepository.users.length == 0)) {
                let localUser = {orcid: this.userOrcid, role: 'MANAGER'}
                this.myRepository.users.push(localUser)
            }
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
            }).then ( function () {
                self.goToRepositories()
            });
        }       
    }
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