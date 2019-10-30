<template>
    <div>
    <div class="profile">
    <div style="background:red" v-if="errored">Error: {{ errorMessage }}</div>
    <h1 class="subheading grey--text">My profile</h1>
    <v-form v-model="valid">
        <v-card
            class="mx-auto pa-5"
        >
            <v-card-title> Request repository access</v-card-title>
            <v-card-text class="grey--text text--lighten-1">Search by repository name and/or keywords</v-card-text >
            <v-card-actions>
                    <v-text-field v-model="keywords"></v-text-field>
                    <v-btn style="margin-top:20px;"
                        color="primary"
                        @click="lookup"
                        icon
                        :disabled="isSearchButtonDisable"
                        >
                        <v-icon size='20px'>fa-search</v-icon> 
                    </v-btn>
            </v-card-actions>
            <v-simple-table v-if="repositories!=null && repositories.length > 0">
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
                    </td>
                    </tr>
                </tbody>
                </template>
            </v-simple-table>
            <v-card-text v-if="notDataFound">No data found</v-card-text>
        </v-card>

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
                label="Enter your email"
                v-model="email"
                :rules="emailRules"
                required
            ></v-text-field>

            <v-textarea
                outlined
                label="Message"
                v-model="text">
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
            notDataFound: false,
            email: null,
            text: null,
            requestedRepository: {},
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v) || 'E-mail must be valid',
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
            this.notDataFound = false
            this.errored = false
            var self = this;
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
                self.repositories = response.data
                if(self.repositories==null || self.repositories.length == 0) {
                    self.notDataFound = true
                }
            })
            .catch(error => {
                self.errorMessage = error.message;
                self.errored = true
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
            var self = this;
            this.errored = false
            this.axios.post(this.service+'repository/v1_0/requestAccess?repositoryId='+this.requestedRepository.id+'&orcid='+this.userOrcid+'&text='+this.text+'&email='+this.email)    
            .then(()=> {
                self.requestedRepository = {}
                self.email = null
                self.text = null
            })
            .catch(error => {
                self.requestedRepository = {}
                self.email = null
                self.text = null
                self.errorMessage = error.message;
                self.errored = true
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