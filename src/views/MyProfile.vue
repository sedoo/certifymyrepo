<template>
  <v-layout>
    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('profile.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>

    <div v-if="!loading">
    <v-form class="ma-5" ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="profile.name" prepend-inner-icon="mdi-account" :label="$t('profile.screen.label.name')" readonly filled outlined dense></v-text-field>
        </v-col>
        <v-col cols="11">
          <v-text-field v-model="profile.orcid" prepend-inner-icon="mdi-identifier" label="ORCID" readonly filled outlined dense></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn class="ml-3 " x-small :title="$t('profile.screen.label.search.orcid')" @click="dialogEditOrcid=true"  fab color="info"> 
            <v-icon >mdi-pencil-outline</v-icon> 
          </v-btn>
        </v-col>
        <v-col cols="12">
          <v-text-field class="required" v-model="profile.email"  :label="$t('profile.screen.label.email')" prepend-inner-icon="mdi-email"  :rules="rules.emailRules" outlined dense required></v-text-field>
          <span class="text">{{ $t('profile.screen.message.email') }}</span>
        </v-col>
        <v-col cols="12">
          <v-checkbox prepend-icon="mdi-bell-off" v-model="profile.isNotificationOff" :label="$t('profile.screen.label.notification.checkbox')" dense></v-checkbox>
        </v-col>
      </v-row>
    </v-form>

    <v-btn
      :disabled="!valid"
      class="mx-5"
      @click="cancel"
    >{{ $t('button.cancel') }}
    </v-btn>

    <v-btn
      :disabled="!valid"
      color="info"
      class="mr-4"
      :loading="saving"
      @click="save"
    >{{ $t('button.save') }}
    </v-btn>

    </div>
    </v-flex>

        <v-form v-model="validOrcid">
            <v-dialog v-model="dialogEditOrcid" :width="$store.getters.getDialogWidth">
                <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                    {{ $t('profile.screen.dialog.edit.orcid.title') }}
                    </v-card-title>
                    <v-card-text>
                      <v-container fuild>
                        <v-row>
                          <v-col cols="12">
                            <v-form v-model="wellFormedOrcid">
                            <v-row>
                              <v-col cols="10">
                                <v-text-field class="required" 
                                  v-model="orcidOrganisation.orcid" outlined dense 
                                  prepend-inner-icon="mdi-identifier" :counter="19" 
                                  :rules="rules.orcIdRules" label="ORCID" required>
                                </v-text-field>
                              </v-col>
                              <v-col cols="2">
                                <v-btn color="info" @click="searchOnOrcid" :disabled="!wellFormedOrcid" :loading="loadingUser">
                                  {{ $t('button.search') }}
                                </v-btn>
                              </v-col>
                            </v-row>
                            </v-form>
                          </v-col>
                          <v-col cols="12">
                            {{ $t('profile.screen.dialog.edit.orcid.message')}}
                          </v-col>
                          <v-col cols="12">
                            <v-text-field class="required" :rules="rules.userNameOrcidRules" outlined dense 
                              v-model="orcidOrganisation.name" prepend-inner-icon="mdi-account" 
                              :label="$t('repository.screen.label.user.name')" readonly filled>
                            </v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field v-model="orcidOrganisation.email" outlined dense :rules="rules.emailRules"
                              prepend-inner-icon="mdi-email" :label="$t('repository.screen.create.user.email')">
                            </v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>

                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn @click="cancelCreateUser">
                        {{ $t("button.cancel") }}
                    </v-btn>
                    <v-btn color="info" :disabled="!validOrcid" @click="confirmOrcid">
                        {{ $t("button.confirm") }}
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-form>

  </v-layout>

</template>

<script>
export default {
  created: function() {
    this.$i18n.locale = this.language
    this.loadProfile()
  } ,

  props: {

  },

  computed: {

    language: function() {
      return this.$store.getters.getLanguage
    },
    
    profileService: function() {
      return this.$service + "/profile/v1_0/profile";
    },

    user: function()  {
      let user = null
      if(this.$store.getters.getUser != null) {
        user = this.$store.getters.getUser
      }
      return user;
    },
  },

  methods: {
    cancel: function() {
      this.$router.push("/information").catch(() => {});
    },

    save: function() {
      var self = this;
      if (this.$refs.form.validate()) {
        this.saving = true;
        this.axios.post(this.$service + "/profile/v1_0/saveProfile?language=" + this.language, this.profile).then(function(response) {
          // save the profile in the store
          let tmpuser = self.user
          tmpuser.profile = response.data
          self.$store.commit("setUser", tmpuser);
          self.$router.push("/information").catch(() => {});
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() {
          self.saving = false;
        });
      }

    },

    loadProfile: function() {
      var self = this;
      this.loading = true;
      this.axios
        .get(this.profileService)
        .then(function(response) {
          if(response.data != null && response.data != '') {
            self.profile = response.data
          }
          if(self.profile.email == null) {
            self.$unidooAlert.showError(self.$t('profile.screen.email.required.message'))
          }
        })
        .catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() {
          self.loading = false;
        });
    },

    searchOnOrcid() {
        console.log("searchOnOrcid")
    },

    confirmOrcid() {
      this.dialogEditOrcid = false
      this.profile.orcid = this.orcidOrganisation.orcid
      this.profile.name = this.orcidOrganisation.name
      if(this.orcidOrganisation.email) {
        this.profile.email = this.orcidOrganisation.email
      }
    },

    cancelCreateUser() {
      this.dialogEditOrcid = false
      this.orcidOrganisation.orcid = null
      this.orcidOrganisation.name = null
      this.orcidOrganisation.email = null
    },

  },

  data() {
    return {
      dialogEditOrcid: false,
      loading: false,
      saving: false,
      valid: false,
      validOrcid: false,
      wellFormedOrcid: false,
      profile: {
          id: null,
          email: null,
          name: null,
          orcid: null
      },
      loadingDelete: false,
      loadingSimulation: false,
      loadingUser: false,
      warningMessage: null,
      /** User to store the response of ORCID call*/
      orcidOrganisation: {
        orcid: null,
        name: null,
        email: null
      },
      /** Rules */
      rules: {
        userNameOrcidRules: [v => !!v || this.$t('repository.screen.error.user.name.required.orcid.error')],
        userNameRules: [v => !!v || this.$t('repository.screen.error.user.name.required.renater.error')],
        nameRules: [
            v => !!v || this.$t('repository.screen.error.repository.name.madatory')
        ],
        orcIdRules: [
            v => !!v || 'ORCID is required',
            v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{3,3}[0-9Xx])/.test(v) || 'ORCID must be valid',
            v => !!v && v.length <= 19 || 'ORCID length must be exactly 19 characters',
        ],
        emailRules: [
            v => !!v || this.$t('profile.screen.email.error'),
            v => !!v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v.toLowerCase()) || this.$t('profile.screen.error.email.validation'),
        ],
      }
  }
  }

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

.required label::after {
  content: " *";
  color: red;
}

.text {
  font-size: .875rem;
}

</style>

