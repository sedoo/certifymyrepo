<template>
  <span>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>
    <v-dialog hide-overlay persistent :max-width="$store.getters.getDialogWidth" v-model="visible">
      <v-card>
        <v-card-title v-if="mode === 'creation'" class="headline indigo font-weight-light white--text">{{ $t('affiliation.dialog.title.creation') }}</v-card-title>
        <v-card-title v-else class="headline indigo font-weight-light white--text">{{ $t('affiliation.dialog.title.edition') }}</v-card-title>
        
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
                  class="required pt-5"
                  outlined dense
                  :rules="mandatoryRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.acronym"
                  prepend-inner-icon="mdi-bank"
                  :label="$t('affiliation.dialog.label.acronym')"
                  class="required"
                  outlined dense
                  :rules="mandatoryRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.department"
                  prepend-inner-icon="mdi-sitemap"
                  outlined dense
                  :label="$t('affiliation.dialog.label.department')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="affiliation.address"
                  prepend-inner-icon="mdi-road"
                  :label="$t('affiliation.dialog.label.address')"
                  outlined
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="affiliation.country"
                  :items="countries"
                  prepend-inner-icon="mdi-flag"
                  :label="$t('affiliation.dialog.label.country')"
                  :rules="mandatoryRules"
                  class="required"
                  outlined dense
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="affiliation.website"
                  prepend-inner-icon="mdi-web"
                  :label="$t('affiliation.dialog.label.website')"
                  outlined dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="$emit('cancel')" :disabled="saving">{{ $t('button.cancel') }}</v-btn>
          <v-btn color="info" @click="create" :loading="saving" :disabled="!validAffiliation" v-if="mode=='creation'">{{ $t('button.create') }}</v-btn>
          <v-btn color="info" @click="save" :loading="saving" :disabled="!validAffiliation" v-else>{{ $t('button.update') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>  
</template>
<script>
import constantsFile from '../resources/constants.json'
export default {
  computed: {

    service: function() {
      return this.$store.getters.getService;
    },

    affiliationSavingService: function() {
      return this.service + "/myaffi/v1_0/save";
    },

  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    
    mode: {
      type: String,
      default: "creation"
    },

    editedAffiliation: {
      type: Object,
      default: () => ({
            website:"",
            country: "",
            address:"",
            institute:"",
            acronym: "",
            department:""
        })
    }
  },

  watch: { 
    editedAffiliation: function(newVal) { 
      this.affiliation = newVal
    }
  },

  mounted: function() {

  },

  created: function() {

  },
  methods: {
    create: function() {
      console.log('create')
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
              address:"",
              institute:"",
              acronym: "",
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
            self.saving = false;
          });
      }
    },

    save: function() {
      this.create()
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
      validAffiliation: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      mandatoryRules: [v => !!v || this.$t('affiliation.dialog.error.madatory')],
      saving: false,
      countries: constantsFile.countries,
      affiliation: this.editedAffiliation
    }
  },

}
</script>
<style>
.required label::after {
  content: " *";
  color: red;
}
</style>