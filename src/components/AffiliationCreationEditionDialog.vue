<template>
  <span>
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
                <v-row>
                  <v-col cols="8">
                    <v-autocomplete :disabled="affiliation.international"
                      v-model="affiliation.country"
                      :items="countries"
                      prepend-inner-icon="mdi-flag"
                      :label="$t('affiliation.dialog.label.country')"
                      :rules="mandatoryCountryRules"
                      :class="countryRequiredClass"
                      outlined dense
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="4">
                    <v-checkbox v-model="affiliation.international" :label="$t('affiliation.label.international')" @click="resetCountry"></v-checkbox>
                  </v-col>
                </v-row>
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
          <v-btn @click="cancel()" :disabled="saving">{{ $t('button.cancel') }}</v-btn>
          <v-btn color="info" @click="save" :loading="saving" :disabled="!validAffiliation">{{ saveButtonTitle }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>  
</template>
<script>
import constantsFile from '../resources/constants.json'
export default {
  computed: {

    affiliationSavingService: function() {
      return this.$service + "/myaffi/v1_0/save";
    },

    countryRequiredClass() {
      if(this.affiliation.international) {
        return 'none'
      } else {
        return 'required'
      }
    },

    saveButtonTitle() {
      if(this.mode=='creation') {
        return this.$t('button.create')
      } else {
        return this.$t('button.update')
      }
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
    },

    editedAffiliation: {
      type: Object,
      default: () => ({
            website:"",
            country: "",
            address:"",
            institute:"",
            acronym: "",
            department:"",
            international: false
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
    this.$i18n.locale = this.$store.getters.getLanguage
  },

  methods: {
    save: function() {
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
              department:"",
              international: false
            }
            self.$unidooAlert.showSuccess(self.$t('affiliation.dialog.confirmation'))
            self.$emit("created");
          })
          .catch(function(error) {
            self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
          })
          .finally(function() {
            self.savingAffiliation = false;
            self.saving = false;
          });
      }
    },

    resetCountry() {
      this.affiliation.country = null
      this.$refs.affiliationForm.resetValidation()
    },

    cancel() {
      this.affiliation = {
        website:"",
        country: "",
        address:"",
        institute:"",
        acronym: "",
        department:"",
        international: false
      }
      this.$refs.affiliationForm.resetValidation()
      this.$emit('cancel')
    }
  },

  data() {
    return {
      validAffiliation: false,
      mandatoryRules: [v => !!v || this.$t('affiliation.dialog.error.madatory')],
      mandatoryCountryRules: [v => (!!v || this.affiliation.international)  || this.$t('affiliation.dialog.error.madatory')],
      saving: false,
      countries: constantsFile.countries,
      affiliation: this.editedAffiliation,
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