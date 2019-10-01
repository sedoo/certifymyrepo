<template>
    <div>
    <div class="profile">
    <div style="background:red" v-if="errored">Error: {{ errorMessage }}</div>
    <h1 class="subheading grey--text">My profile</h1>
    <v-form v-model="valid">
    <v-container class="my-3">
            <h3> Request repository access</h3>
            <v-row>
                <v-col
                    cols="12"
                    xs="10" sm="10"
                    md="10"
                    >
                    <v-text-field v-model="keywords"></v-text-field>
                  <!--  <v-combobox multiple
                                v-model="keywords" 
                                label="keywords"
                                chips
                                deletable-chips
                                :search-input.sync="search"                                 >
                    </v-combobox>-->
                </v-col>
                <v-col
                    cols="12"
                    xs="2" sm="2"
                    md="2"
                    >
                    <v-btn style="margin-top:20px;"
                        color="primary"
                        @click="lookup"
                        icon
                        :disabled="isSearchButtonDisable"
                        >
                        <v-icon size='20px'>fa-search</v-icon> 
                    </v-btn>
                </v-col>
            </v-row>
            <v-row v-if="!isSearchResultNull">
                <v-col
                    cols="12"
                    xs="12" sm="12"
                    md="12"
                    >
                <v-simple-table>
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th class="text-left">Name</th>
                        <th class="text-left">Keywords</th>
                        <th class="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in repositories" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td><span v-for="(keyword, index) in item.keywords" :key=index>{{ keyword }} </span></td>
                        <td v-if="userIsAdmin">A/N</td>
                        <td v-else-if="isAccessGranted(item.users)">Access granted</td>
                        <td v-else> 
                            <v-btn color="primary" icon @click="requestedRepository=item;dialog=true">
                                <v-icon size='20px'>fa-unlock-alt</v-icon> 
                            </v-btn>
                            <v-dialog
                            v-model="dialog"
                            width="500"
                            >

                            <v-card>
                                <v-card-title
                                class="headline grey lighten-2"
                                primary-title
                                >
                                Request {{ requestedRepository.name }} access
                                </v-card-title>

                                <v-card-text>
                                <v-text-field
                                    label="Email"
                                    v-model="requestedRepository.email"
                                    :rules="emailRules"
                                    required
                                ></v-text-field>

                              <v-textarea
                                  outlined
                                  label="Message"
                                  v-model="requestedRepository.text">
                              </v-textarea>
                                </v-card-text>

                                <v-divider></v-divider>

                                <v-card-actions>
                                <div class="flex-grow-1"></div>
                                <v-btn color="primary" text @click="dialog = false">Cancel</v-btn>
                                <v-btn color="primary" @click="dialog = false; sendRequest()" :disabled="!valid">Send</v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-dialog>
                        </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
                </v-col>
            </v-row>
        
    </v-container>
    </v-form>
    </div>
    </div>
</template>


<script>
var qs = require('qs');
export default {
    props: {
    	service: null
  	},
    data() {
        return {
            valid: false,
            dialog: false,
            errored: null,
            errorMessage: null,
            keywords: [],
            search: null,
            repositories: [],
            requestedRepository: {name: null, email: null, text: null},
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        }
    },
    computed: {
        isSearchButtonDisable: function () {
            return this.keywords==null || this.keywords.length == 0
        },
        isSearchResultNull: function () {
            return this.repositories==null || this.repositories.length == 0
        },
        userOrcid: function()  {
            if(this.$store.getters.getUser != null) {
                return this.$store.getters.getUser.orcId
            } else {
                return '';
            }
        },
        userIsAdmin: function()  {
            if(this.$store.getters.getUser != null) {
            return this.$store.getters.getUser.admin
            } else {
            return null;
            }
      }
    },

    methods: {
        lookup(){
            this.axios.get(this.service+'repository/v1_0/search', {
                params: {
                    keywords: this.keywords.split(" ")
                },
                paramsSerializer: function (params) {
                    return qs.stringify(params, {arrayFormat: 'repeat'})
                }
            })    
            .then(response => {
                console.log('Response : '+JSON.stringify(response))
                this.repositories = response.data
            })
            .catch(error => {
                this.errorMessage = error.message;
                this.errored = true
            })
        },
        isAccessGranted(users) {
            if(JSON.stringify(users).includes(this.userOrcid)) {
                return true
            } else {
                return false
            }
        },
        sendRequest() {
              this.axios.post(this.service+'repository/v1_0/requestAccess?repositoryId='+this.requestedRepository.id+'&orcid='+this.userOrcid+'&text='+this.requestedRepository.text+'&email='+this.requestedRepository.email)    
            .then(()=> {
                this.requestedRepository = {name: null, email: null, text: null}
            })
            .catch(error => {
                this.requestedRepository = {name: null, email: null, text: null}
                this.errorMessage = error.message;
                this.errored = true
            })
        }
    },
    
    mounted: function() {
    	console.log("Monté")
    },
    
    created: function() {
    	console.log("Créé")
    }
} 
</script>