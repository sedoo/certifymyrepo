<template>
    <div class="repository">
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
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-text-field
                        v-model="myRepository.pole"
                        :rules="nameRules"
                        :counter="20"
                        label="Department name"
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
                    <v-combobox multiple
                                v-model="orcIdList" 
                                label="Repository managers ORCID"
                                chips
                                deletable-chips
                                :search-input.sync="search" 
                                :rules="orcIdRules"
                                >
                    </v-combobox>
                    <span class="font-italic font-weight-thin">You can add as many managers as you want. You will be manager by default. Your ORCID will be automatically added.</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="6"
                    >
                <v-simple-table v-if="myRepository.users != null">
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">ORCID</th>
                        <th class="text-left">Role</th>
                        <th class="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(user, index) in myRepository.users" :key="index">
                        <td>{{ user.orcid }}</td>
                        <td>{{ user.role }}</td>
                        <td>
                            <v-dialog
                                v-model="dialogRemove"
                                width="500"
                                >
                            <template v-slot:activator="{ on }">
                                <v-btn icon class="mx-0" v-on="on" >     
                                    <v-icon size='20px'>fa-trash-alt</v-icon>    
                                </v-btn>  
                            </template>
                            <v-card>
                                <v-card-title class="headline grey lighten-2" primary-title>
                                Are you sure?
                                </v-card-title>
                                <v-card-text>Do you really want to delete these ORCID ?</v-card-text>

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
                                    @click="dialogRemove = false;"
                                >
                                    Confirm
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-dialog>
                            <v-dialog
                                v-model="dialogEdit"
                                width="500"
                                >
                            <template v-slot:activator="{ on }">
                                <v-btn icon class="mx-0" v-on="on" >     
                                    <v-icon size='20px'>fa-edit</v-icon>    
                                </v-btn>  
                            </template>
                            <v-card>
                                <v-card-title class="headline grey lighten-2" primary-title>
                                Add an ORCID
                                </v-card-title>
                                <v-text-field
                                    v-model="user.orcid"
                                    :counter="19"
                                    label="ORCID"
                                    required
                                ></v-text-field>
                                <v-combobox
                                v-model="user.role"
                                :items="roles"
                                label="Select a role"
                                ></v-combobox>
                                <v-divider></v-divider>
                                <v-card-actions>
                                <div class="flex-grow-1"></div>
                                <v-btn
                                    color="primary"
                                    text
                                    @click="dialogEdit = false"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    @click="dialogEdit = false;"
                                >
                                    Confirm
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-dialog>
                        </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
                <v-dialog
                    v-model="dialogCreate"
                    width="500"
                    >
                <template v-slot:activator="{ on }">

                <v-btn v-on="on" 
                    color="primary"
                    :disabled="!valid"
                    >
                    ADD
                </v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    Add an ORCID
                    </v-card-title>
                    <v-text-field
                        v-model="user.orcid"
                        :counter="19"
                        label="ORCID"
                        required
                    ></v-text-field>
                    <v-combobox
                    v-model="user.role"
                    :items="roles"
                    label="Select a role"
                    ></v-combobox>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn
                        color="primary"
                        text
                        @click="dialogCreate = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click="addUser()"
                    >
                        Confirm
                    </v-btn>
                    </v-card-actions>
                </v-card>
                </v-dialog>
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
            dialogEdit: false,
            dialogCreate: false,
            roles: ["MANAGER", "READ"],
            valid: false,
            search: null,
            searchKeywords: null,
            repositoryName: '',
            duplicateOrcIdError: false,
            department: '',
            user: {orcid: null, role: null},
            users: [{orcid: null, role: null}],
            orcIdList: [],
            orcidNotValid: '',
            myRepository: JSON.parse(this.$route.query.repository),
            nameRules: [
                v => !!v || 'Name is required',
                v => v.length <= 20 || 'Name must be less than 20 characters',
            ],
            orcIdRules: [
                v => this.orcidvalidation(v) || 'ORCID must be valid ['+this.orcidNotValid+']'
            ],
            email: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        }
    },
    
    mounted: function() {
    	//console.log("Monté")
    },
    
    created: function() {
    	//console.log("Créé")
    },

    methods: {
        addUser() {
            this.dialogCreate = false
            console.log('this.myRepository : '+JSON.stringify(this.myRepository))
            var localUser = JSON.parse(JSON.stringify(this.user))
            if(this.myRepository.users == null || this.myRepository.users.length == 0) {
                var myUserList = [];
                myUserList.push(localUser)
                this.myRepository.users = myUserList;
            } else {
                this.myRepository.users.push(localUser)
            }
            this.user = {orcid: null, role: null};
        },
        orcidvalidation(v) {
            var result = true
            this.orcidNotValid = ''
            var regex = RegExp(/^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/)
            for(var index in v) {       
                if(!regex.test(v[index])){
                    this.orcidNotValid = this.orcidNotValid + v[index]
                    result = false
                } else if(v[index].length != 19) {
                    this.orcidNotValid = this.orcidNotValid + v[index]
                    result = false
                }
            }
            return result
        },           
        add () {
            if(this.orcId != null && this.orcId.length > 0) {
                if(!this.myRepository.managerIds.includes(this.orcId)) {
                        this.myRepository.managerIds.push(this.orcId)
                        this.orcId = ''
                        this.duplicateOrcIdError = false
                } else {
                    this.duplicateOrcIdError = true
                }
            }
        },
      goToRepositories() {
        this.$router.push({ path: '/repositories'});
      },
      save () {
        console.log('methode save')
        console.log(this.service)
       /* this.myRepository.name = this.repositoryName
        this.myRepository.pole = this.department
        this.myRepository.managerIds = this.orcIdList
        this.myRepository.contact = this.email*/
        console.log(JSON.stringify(this.myRepository));
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

.icon-delete {
  position: absolute;
  right: 0;
}

.form-orcid  {
   width: 100% 
}

</style>