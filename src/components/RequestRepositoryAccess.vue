<template>
    <div class="accessRequest">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
        <v-card
            class="mx-auto pa-5"
        >
            <v-card-title>{{ $t('repository.screen.repository.access.title') }}</v-card-title>
            <v-card-text>
                <v-row>
                <v-col
                    cols="12"
                    sm="12"
                    md="6"
                    lg="4"
                >

                    <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-text-field 
                            v-on="on"
                            v-model="keywords"
                            @keyup.enter="lookup"
                            clearable
                            flat outlined dense
                            hide-details
                            prepend-inner-icon="mdi-magnify"
                            :label="$t('repository.screen.repository.access.label.search')"
                        ></v-text-field>
                    </template>
                    <span v-html="$t('repository.screen.repository.access.help')"></span>
                    </v-tooltip>
                </v-col>
                <v-col
                    cols="12"
                    sm="12"
                    md="6"
                    lg="4">
                    <v-btn
                        @click="lookup" color="info"
                        :disabled="isSearchButtonDisable"
                        >
                        {{ $t('button.search')}}
                    </v-btn>
                </v-col>
                </v-row>
                    
            </v-card-text>
            <v-simple-table v-if="repositories!=null && repositories.length > 0">
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">{{ $t('repository.screen.repository.access.label.name')}}</th>
                    <th class="text-left">{{ $t('repository.screen.repository.access.label.keywords')}}</th>
                    <th class="text-left pl-8">{{ $t('repository.screen.repository.access.label.actions')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in repositories" :key="item.name">
                    <td>{{ item.name }}</td>
                    <td><span v-for="(keyword, index) in item.keywords" :key=index>{{ keyword }} </span></td>
                    <td v-if="userIsAdmin">A/N</td>
                    <td v-else-if="isAccessGranted(item.users)">{{ $t('repository.screen.repository.access.access.granded') }}</td>
                    <td v-else> 
                        <v-btn color="info" text @click="requestedRepository=item;dialog=true">{{ $t('repository.screen.repository.access.button.join') }}</v-btn>
                    </td>
                    </tr>
                </tbody>
                </template>
            </v-simple-table>
            <v-card-text v-if="notDataFound">{{ $t('repository.screen.repository.access.label.no.data')}}</v-card-text>
        </v-card>
        <v-form v-model="valid">
        <v-dialog v-model="dialog" :width="$store.getters.getDialogWidth">
        <v-card>
            <v-card-title
            class="headline grey lighten-2"
            primary-title
            >
             {{ $t('repository.screen.repository.access.popup.title', {'msg':resquestPopupTitle(requestedRepository) } ) }}
            </v-card-title>

            <v-card-text>
            <v-text-field
                :label="$t('profile.screen.error.email.mandatory')"
                v-model="email"
                :rules="emailRules" outlined dense class="pt-5"
                required
            ></v-text-field>
            <v-select :rules="roleRules" outlined dense
            v-model="role"
            :items="roles"
            :label="$t('repository.screen.repository.access.popup.field.role')">
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
            text: "",
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
            this.axios({
                method: 'post',
                url: this.service+'/repository/v1_0/requestAccess?language='+this.$store.getters.getLanguage,
                data: {
                    repositoryId: this.requestedRepository.id,
                    userId: this.userProfile.id,
                    userName: this.userProfile.name,
	                orcid: this.userProfile.orcid,
	                text: this.text,
	                email: this.email,
	                role: this.role
                }
            })    
            .then(()=> {
                self.requestedRepository = {}
                self.text = ""
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