<template>
  <span>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <v-dialog hide-overlay persistent max-width="600" v-model="visible">
      <v-card>
        <v-card-title class="headline indigo font-weight-light white--text">{{ $t('affiliation.dialog.title') }}</v-card-title>
        <v-card-text>
          <v-form
            class="ma-5 dense"
            ref="affiliationForm"
            v-model="validAffiliation"
            lazy-validation
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.institute"
                  prepend-inner-icon="mdi-bank"
                  :label="$t('affiliation.dialog.label.institute')"
                  class="required"
                  :rules="mandatoryRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.department"
                  prepend-inner-icon="mdi-sitemap"
                  :label="$t('affiliation.dialog.label.department')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.address"
                  prepend-inner-icon="mdi-road"
                  :label="$t('affiliation.dialog.label.address')"
                  :rules="mandatoryRules"
                  class="required"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="affiliation.zipcode" :label="$t('affiliation.dialog.label.zipcode')"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  class="required"
                  v-model="affiliation.city"
                  :rules="mandatoryRules"
                  prepend-inner-icon="mdi-city"
                  :label="$t('affiliation.dialog.label.city')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="affiliation.state" :label="$t('affiliation.dialog.label.state')"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="affiliation.country"
                  :items="countries"
                  prepend-icon="mdi-flag"
                  :label="$t('affiliation.dialog.label.country')"
                  :rules="mandatoryRules"
                  class="required"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.website"
                  prepend-inner-icon="mdi-web"
                  :label="$t('affiliation.dialog.label.website')"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="$emit('cancel')" :disabled="saving">{{ $t('button.cancel') }}</v-btn>
          <v-btn color="info" @click="create" :loading="saving" v-if="mode=='creation'">{{ $t('button.create') }}</v-btn>
          <v-btn color="info" @click="save" :loading="saving" v-else>{{ $t('button.update') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>  
</template>
<script>
import constantsFile from '../resources/constants.json'
export default {
  computed: {
    superAdmin: function() {
      for (let i = 0; i < this.roles.length; i++) {
        if (this.roles[i].name == "ROLE_SUPER_ADMIN") {
          return true;
        }
      }
      return false;
    },

    service: function() {
      return this.$store.getters.getService;
    },

    affiliationSavingService: function() {
      return this.service + "/myaffi/v1_0/save";
    }
  },

  watch: {
   
  },
  mounted: function() {
    
  },
  methods: {
    create: function() {
      var self = this;
      if (!this.$refs.affiliationForm.validate()) {
        return;
      } else {
        this.saving = true;
        this.axios
          .post(this.affiliationSavingService, this.affiliation)
          .then(function() {
            self.affiliation = {
              website:"",
              country: "",
              state:"",
              address:"",
              zipcode:"",
              institute:"",
              department:""
            }
            self.displaySuccess(self.$t('affiliation.dialog.confirmation'));
            self.$emit("created");
          })
          .catch(function(error) {
            self.displayError(self, error);
          })
          .finally(function() {
            self.savingAffiliation = false;
            self.saving = true;
          });
      }
    },

    save: function() {
      
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

  data() {
    return {
      validAffiliation: null,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      mandatoryRules: [v => !!v || this.$t('affiliation.dialog.error.madatory')],
      affiliation: {
        website:"",
        country: "",
        state:"",
        address:"",
        zipcode:"",
        institute:"",
        department:""
      },
      saving: false,
      countries: constantsFile.countries,
      }
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    
    mode: {
      type: String,
      default: "creation"
    }
    
  }
}
</script>
<style>
.required label::after {
  content: " *";
  color: red;
}
</style>