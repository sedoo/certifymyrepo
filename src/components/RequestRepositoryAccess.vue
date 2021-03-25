<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title" : "Request repository access",
    "search.message": "Search by repository name and/or keywords",
    "no.data.message": "No data found",
    "name.label": "Name",
    "keywords.label": "Keywords",
    "button.join": "Join",
    "message.access.granded": "Access granted",
    "request.popup.title": "Request {msg} access"
  },
  "fr": {
    "title" : "Demande d'accès aux entrepôts",
    "search.message": "Recherche par nom d'entrepôt et/ou mots clefs",
    "no.data.message": "Aucunes données trouvées",
    "name.label": "Nom",
    "keywords.label": "Mots cléfs",
    "button.join": "Rejoindre",
    "message.access.granded": "Accès autorisé",
    "request.popup.title": "Demande d'accès à {msg}"

  }
}
</i18n>
<template>
    <div class="accessRequest">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
        <v-card
            class="mx-auto pa-5"
        >
            <v-card-title>{{ $t('title') }}</v-card-title>
            <v-card-text class="grey--text text--lighten-1">{{$t('search.message')}}</v-card-text >
            <v-card-actions>
                    <v-text-field v-model="keywords" @keyup.enter="lookup"></v-text-field>
                    <v-btn
                        @click="lookup"
                        icon
                        :disabled="isSearchButtonDisable"
                        >
                        <v-icon>mdi-magnify</v-icon> 
                    </v-btn>
            </v-card-actions>
            <v-simple-table v-if="repositories!=null && repositories.length > 0">
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">{{ $t('name.label')}}</th>
                    <th class="text-left">{{ $t('keywords.label')}}</th>
                    <th class="text-left pl-8">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in repositories" :key="item.name">
                    <td>{{ item.name }}</td>
                    <td><span v-for="(keyword, index) in item.keywords" :key=index>{{ keyword }} </span></td>
                    <td v-if="userIsAdmin">A/N</td>
                    <td v-else-if="isAccessGranted(item.users)">{{ $t('message.access.granded') }}</td>
                    <td v-else> 
                        <v-btn color="info" text @click="requestedRepository=item;dialog=true">{{ $t('button.join') }}</v-btn>
                    </td>
                    </tr>
                </tbody>
                </template>
            </v-simple-table>
            <v-card-text v-if="notDataFound">{{ $t('no.data.message')}}</v-card-text>
        </v-card>
        <v-form v-model="valid">
        <v-dialog
        v-model="dialog"
        width="500"
        >
        <v-card>
            <v-card-title
            class="headline grey lighten-2"
            primary-title
            >
             {{ $t('request.popup.title', {'msg':resquestPopupTitle(requestedRepository) } ) }}
            </v-card-title>

            <v-card-text>
            <v-text-field
                label="Enter your email"
                v-model="email"
                :rules="emailRules"
                required
            ></v-text-field>
            <v-select :rules="roleRules"
            v-model="role"
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
            <v-textarea
                outlined
                label="Message"
                v-model="text">
            </v-textarea>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn @click="dialog = false">{{ $t('button.cancel') }}</v-btn>
            <v-btn color="info" @click="dialog = false; sendRequest()" :disabled="!valid">{{ $t('button.send') }}</v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>
        </v-form>
    </div>
</template>

<script>
var qs = require('qs');
export default {
    name: 'requestRepositoryAccess',
    props: ['service'],
    data() {
        return {
            valid: false,
            dialog: false,
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            //
            keywords: [],
            search: null,
            repositories: [],
            notDataFound: false,
            email: null,
            text: null,
            role: null,
            roles: ["EDITOR", "CONTRIBUTOR", "READER"],
            requestedRepository: {},
            emailRules: [
                v => !!v || 'E-mail is required',
                v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || 'E-mail must be valid',
            ],
            roleRules: [v => !!v || 'Role is required'],
        }
    },
    computed: {
        isSearchButtonDisable: function () {
            return this.keywords==null || this.keywords.length == 0
        },
        isSearchResultNull: function () {
            return this.repositories==null || this.repositories.length == 0
        },
        userIsAdmin: function()  {
            if(this.$store.getters.getUser != null) {
            return this.$store.getters.getUser.admin
            } else {
            return null;
            }
        },
        userProfile: function()  {
            let profile = {}
            if(this.$store.getters.getUser != null) {
                profile = this.$store.getters.getUser.profile
            }
            return profile;
        },
    },

    created() {
        this.$i18n.locale = this.$store.getters.getLanguage;
        this.email = this.userProfile.email
    },

    methods: {
        lookup(){
            this.notDataFound = false
            this.errored = false
            var self = this;
            this.axios.get(this.service+'/repository/v1_0/search', {
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
            }).catch(function(error) {self.displayError("An error has occured:" + error)})
        },
        isAccessGranted(users) {
            if(JSON.stringify(users).includes(this.userProfile.id)) {
                return true
            } else {
                return false
            }
        },
        sendRequest() {
            var self = this;
            this.errored = false
            this.axios({
                method: 'post',
                url: this.service+'/repository/v1_0/requestAccess',
                data: {
	                repositoryId: this.requestedRepository.id,
	                orcid: this.userProfile.orcid,
	                text: this.text,
	                email: this.email,
	                role: this.role
                }
            })    
            .then(()=> {
                self.requestedRepository = {}
                self.email = null
                self.text = null
            }).catch(function(error) {self.displayError("An error has occured:" + error)})
        },

        resquestPopupTitle: function(requestedRepository) {
            if(requestedRepository != null) {
                return requestedRepository.name
            } else {
                return ''
            }
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
        }
    },
} 
</script>