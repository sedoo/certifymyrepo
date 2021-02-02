<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title" : "{msg} certification report",
    "version.number": "Version number",
    "status.label": "Status:",
    "button.previous" :"Previous",
    "button.continue" :"Continue",
    "level.label" : "Level",
    "edit.response": "Edit the response",
    "comment.label" : "Comments",
    "button.release": "Validate",
    "release.popup.title": "Validation",
    "release.popup.message": "Do you really want to validate this report ? You will not be able to modify or delete this version of the report after this operation.",
    "release.erreor.message": "The report status must be 'IN_PROGRESS' before been able to validate a report",
    "upload.popup.title": "Upload",
    "upload.popup.message": "",
    "add.file.label": "Attachments"
  },
  "fr": {
    "title" : "Fiche {msg}",
    "version.number": "Numéro de version",
    "status.label": "Statut:",
    "button.previous" :"Précédent",
    "button.continue" :"Continuer",
    "level.label" : "Niveau",
    "edit.response": "Editer la réponse",
    "comment.label" : "Commentaires",
    "button.release": "Valider",
    "release.popup.title": "Validation",
    "release.popup.message": "Voulez-vous vraiment valider cette fiche ? Vous ne pourrez plus modifier ou supprimer cette version après cette opération",
    "release.erreor.message": "Le statut doit être 'IN_PROGRESS' pour pouvoir valider une fiche",
    "upload.popup.title": "Ajouter des fichiers",
    "upload.popup.message": "",
    "add.file.label": "Pièces jointes"
  }
}
</i18n>
<template>
    <div>
    <h1 class="subheading grey--text">{{ $t('title', {'msg':$store.getters.getRepository.name } ) }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close' )}}</v-btn>
    </v-snackbar>
    <div v-if="!loading" class="report">
    <h4 class="subheading grey--text pt-5 pb-5">{{ templateName }}</h4>
      <v-form v-model="valid">
            <v-text-field v-if="!readOnly"
                :label="$t('version.number')"
                v-model="myReport.version"
                :rules="versionRules"
            ></v-text-field>
            <p v-if="readOnly"><span class="font-weight-bold">Version:  </span><span>{{ myReport.version }} </span></p>
         
            <v-select v-show="!readOnly"
                :items="status"
                v-model="myReport.status"
                >
              <template slot="selection" slot-scope="data">
                  <!-- HTML that describe how select should render selected items -->
                  {{ $t(data.item) }} 
              </template>
              <template slot="item" slot-scope="data">
                  <!-- HTML that describe how select should render items when the select is open -->
                  {{ $t(data.item) }}
              </template>
            </v-select>
            <p v-if="readOnly"><span class="font-weight-bold">{{ $t('status.label') }} </span><span>{{ $t(myReport.status) }} </span></p>
           

              <v-stepper v-model="e1" vertical >
                <div v-for="(item, index) in myReport.items" :key=index>
                        <v-stepper-step :complete="e1 > index + 1" :step="index + 1" editable >
                        <h3>{{item.requirement}}</h3>
                        <small v-if="item.level != null">{{ $t('level.label') }}: {{item.level}}</small>
                        </v-stepper-step>
                      
                        <v-stepper-content :step="index + 1">
                          <v-card
                              class="mb-12"
                              color="grey lighten-3"
                              height="auto"
                          >
                            <!-- DO WE WANT TO ADD GUIDANCE ? <div v-html="item.guidance "></div>-->
                            <v-textarea v-if="!readOnly"
                                outlined class="ma-3"
                                :label="$t('edit.response')"
                                v-model="item.response"
                            >
                            </v-textarea>
                              <v-list-item dense v-for="(file, i) in item.files" :key="i">
                                {{ file }}
                              </v-list-item>
                            <v-card-actions>
                              <div v-if="!readOnly" class="pa-2" >
                                <v-btn color="primary" @click="dialogUploadFiles = true;itemRequirement=item;">
                                    {{ $t('add.file.label') }}
                                </v-btn>
                              </div>
                            </v-card-actions>
                            <p v-if="readOnly" class="text-justify">{{ item.response }}</p>

                            <v-select filled v-if="!readOnly" class="ma-3"
                              :items="levelsTemplate"
                              :label="$t('level.label')"
                              v-model="item.level"
                              item-text="label"
                              item-value="code"
                            ></v-select>
                            <p v-else>
                              <span class="font-weight-bold">{{ $t('level.label') }}: </span>
                              <span v-if="item.level != null">{{ getLevelLabel(item.level) }}</span> 
                            </p>

                            <v-expansion-panels class="pa-3" v-if="!hideCommentBloc(item)">
                            <v-expansion-panel>
                                <v-expansion-panel-header>{{ $t('comment.label')}}  <span class="pl-3" v-if="item.requirementcomments != null && item.requirementcomments.comments.length > 0"><i class="fa fa-comment"></i> {{ item.requirementcomments.comments.length }}</span></v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <comments 
                                        :comments_wrapper_classes="['custom-scrollbar', 'comments-wrapper']"
                                        :comments="item.requirementcomments"
                                        :item="item"
                                        :current_user="userName"
                                        :isreadonly="isReadOnlyComment"
                                        @submit-comment="submitItemComment"
                                    ></comments>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            </v-expansion-panels>

                            <v-card-actions>
                              <v-btn text color="primary" @click="previousStep(index1)">
                                  {{ $t('button.previous') }}
                              </v-btn>
                              <v-btn color="primary" @click="nextStep(index+1)">
                                  {{ $t('button.continue') }}
                              </v-btn>
                            </v-card-actions>

                          </v-card>

                        </v-stepper-content>

                </div>
              </v-stepper>                      

            <div class="text-right save-button">
                     <v-btn text
                        color="primary"
                        @click="goToMyCertificationReports"
                        >
                        {{ $t('button.cancel') }}
                    </v-btn>
                     <v-btn v-show="!readOnly"
                        color="primary"
                        @click="save"
                        >
                        {{ $t('button.save') }}
                    </v-btn>
            </div>

            <div class="text-right save-button">

              <v-btn v-show="!readOnly"
                color="primary"
                @click="displayReleaseConfirmation"
                :disabled="!valid"
                >
                {{ $t('button.release') }}
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
                  {{ $t('release.popup.title')}}
                  </v-card-title>

                  <v-card-text>
                  {{ $t('release.popup.message')}}
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn
                      color="primary"
                      text
                      @click="dialog = false"
                  >
                      {{ $t('button.cancel') }}
                  </v-btn>
                  <v-btn
                      color="primary"
                      @click="releaseTheReport"
                  >
                      {{ $t('button.confirm') }}
                  </v-btn>
                  </v-card-actions>
              </v-card>
              </v-dialog>

               <v-dialog
                  v-model="dialogUploadFiles"
                  width="500"
                  >

              <v-card>
                  <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                  >
                  {{ $t('upload.popup.title')}}
                  </v-card-title>

                  <v-file-input
                    class="px-3"
                    v-model="itemFiles"
                    chips
                    multiple
                    show-size
                    truncate-length="20"
                    :label="$t('add.file.label')"
                  ></v-file-input>

                  <v-divider></v-divider>

                  <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn
                      color="primary"
                      text
                      @click="dialogUploadFiles = false"
                  >
                      {{ $t('button.cancel') }}
                  </v-btn>
                  <v-btn
                      color="primary"
                      @click="updateUploadedFiles(itemFiles)"
                  >
                      {{ $t('button.confirm') }}
                  </v-btn>
                  </v-card-actions>
              </v-card>
              </v-dialog>
            </div>
      </v-form>
    </div>
    </div>

</template>


<script>
import Comments from '../components/Comments.vue'
export default {
    components: {
        Comments
    },
    props: {

  	},
    data() {
        return {
            valid: false,
            dialog: false,
            dialogUploadFiles: false,
            readOnly: null,
            myReport: {
                'id': null,
                'templateName': null,
                'repositoryId': null,
                'items': null, 
                'status': 'NEW',
                'updateDate': null,
                'version': 0.1
                },
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            index: 0,
            status: ["NEW","IN_PROGRESS"],
            e1: 0,
            steps: 17,
            versionRules: [
                v => !!v || 'Version is required',
                v => /[0-99].[0-99]/.test(v) || 'Version number must be valid. Example 2.1',
            ],
            templateName: null,
            loading: false,
            itemFiles: null,
        }
    },
    computed: {
      language: function() {
        return this.$store.getters.getLanguage
      },
      isReleasable: function () {
        if(this.myReport.status == 'IN_PROGRESS') {
          return true
        } else {
          return false
        }
      },    
      userName: function()  {
        if(this.$store.getters.getUser != null) {
          return this.$store.getters.getUser.profile.name
        } else {
          return '';
        }
      },
      // USER_READER has a readOnly report however they can comment it.
      // Request from Rorie Edmunds. November 2019.
      isReadOnlyComment: function() {
        if(this.myReport.status == 'RELEASED') {
          return true
        } else {
          return false
        }
      },
      service: function()  {
        return this.$store.getters.getService
      },
    },
    watch: {
      steps (val) {
        if (this.e1 > val) {
          this.e1 = val
        }
      },
    },
    methods: {

      updateUploadedFiles(files) {
        debugger
        let fileNameArray = []
        for(let i=0 ; i<files.length ; i++) {
          fileNameArray.push(files[i].name)
        }
        this.myReport.items[this.index].files = fileNameArray;
        this.dialogUploadFiles = false
      },

      getLevelLabel(levelCode) {
        for(let i=0 ; i<this.levelsTemplate.length ; i++) {
          if(levelCode === this.levelsTemplate[i].code) {
            return this.levelsTemplate[i].label
          }
        }

      },

      // Display comment in chat box + save it in mongoDB
      submitItemComment: function(item, reply) {
        let self = this
        item.requirementcomments.comments.push({
            user: this.userName,
            text: reply,
            creationDate: new Date(),
            id: item.requirementcomments.comments.length
        });
        this.axios({
            method: 'post',
            url: this.service+'/certificationReport/v1_0/saveComments',
            data: item.requirementcomments
        }).catch(function(error) {self.displayError("An error has occured:" + error)})
      },

      nextStep (n) {
        if (n === this.steps) {
          this.e1 = 1
        } else {
          this.e1 = n + 1
        }
      },
      previousStep (n) {
        if (n === this.steps) {
          this.e1 = 1
        } else if (n === 1) {
          this.e1 = 1
        } else {
          this.e1 = n - 1
        }
      },

      // if ready only mode and no comment hide the comments bloc
      hideCommentBloc(item) {
        return this.isReadOnlyComment && item.requirementcomments != null && item.requirementcomments.comments.length == 0 || this.myReport.id == null
      },

      // Save report
      save () {
        if(!this.valid) {
          this.displayError("Version is required")
        } else {
          this.myReport.updateDate = new Date()
          var self = this;
          this.axios({
              method: 'post',
              url: this.service+'/certificationReport/v1_0/save',
              data: this.myReport
          }).then( function (response) {
            self.$router.push({ path: '/certificationReports/'+response.data.repositoryId  })
          }).catch(function(error) {self.displayError("An error has occured:" + error)})
        }

      },

      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId });
      },

      displayReleaseConfirmation() {
        if(this.myReport.status != 'IN_PROGRESS') {
          this.displayError(this.$t('release.erreor.message'))
        } else {
          this.dialog = true
        }
      },

      releaseTheReport() {
        this.dialog = false
        this.myReport.status = 'RELEASED'
        this.save ()
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
      },

    },

    mounted: function() {

    },
    
    created () {
      this.loading = true
      this.$i18n.locale = this.$store.getters.getLanguage;
      // case 1 id != null AND copy undefined or false => update the report
      // case 2 id != null AND copy == true => make a copy of the report
      // case 3 id == null AND template contains a templateName => create a new report with the requested template
      var id = this.$route.query.reportId
      if(id != null) {
        var self = this
        // getReport return as result the report, the comments by requirement, a boolean ISREADONLY and the certification report template
        this.axios
        .get(this.service+'/certificationReport/v1_0/getReport/'+id)
        .then( function (response) {
          self.myReport = response.data.report
          self.readOnly = response.data.readOnly
          
          if(response.data.template.description && response.data.template.description[self.$store.getters.getLanguage]) {
            self.templateName = response.data.template.description[self.$store.getters.getLanguage]
          }

          let commentsCollection = response.data.requirementComments
          let requirementsTemplate = response.data.template.requirements

          if(self.myReport.items != null && self.myReport.items.length > 0 ) {
            for (var i = 0; i < self.myReport.items.length; i++) {

              let itemCode = self.myReport.items[i].code

              if(!self.$route.query.copy) {
                // BEGINNING add comments into report object
                self.myReport.items[i].requirementcomments = {
                  comments: [],
                  reportId: self.myReport.id,
                  itemCode: itemCode
                }
                for (let commentItem in commentsCollection) {
                  if(itemCode == commentsCollection[commentItem].itemCode ) {
                    self.myReport.items[i].requirementcomments = commentsCollection[commentItem]
                  }
                }
                // END add comments into report object
              } else {
                self.myReport.items[i].requirementcomments = null
              }

              // BEGINNING add labels into report object from template
              for (let requirementItemCode in requirementsTemplate) {
                if(itemCode == requirementItemCode) {
                  self.myReport.items[i].requirement = requirementsTemplate[requirementItemCode].requirement[self.language]
                }
              }
              // END add labels into report object from template

            }
          }

          // Add levels labels for user language into myReport object
          let levelsLocal = []
          let lItem = null
          for (lItem of response.data.template.levels) {
            let levelLocal = {
              code: null,
              label: null
            }
            levelLocal.label = lItem.label[self.language]
            levelLocal.code = lItem.code
            levelsLocal.push(levelLocal)
          }
          self.levelsTemplate = levelsLocal

          // if the user is making a copy of a released report 
          if(self.$route.query.copy) {
            self.myReport.status = 'NEW'
            self.updateDate = null
            let versionArray = self.myReport.version.split('.')
            self.myReport.version = (parseInt(versionArray[0])+1) + '.0'
            self.myReport.id = null
            self.readOnly = false
          }

        }).catch(function(error) {self.displayError("An error has occured:" + error)})
        .finally(function() { self.loading = false})

      } else {
        var self = this
        this.axios
        .get(this.service+'/certificationReport/v1_0/getCertificationReportTemplate?name='+this.$route.query.template)
        .then( function (response) {

          // Add requirements label for user language into myReport object
          let requirementsLocal = []
          let rItem = null
          for (rItem of response.data.requirements) {
            let requirementLocal = {
              requirement: null,
              code: null,
              response: null,
              level: null
            }
            requirementLocal.requirement = rItem.requirement[self.language]
            requirementLocal.code = rItem.code
            requirementsLocal.push(requirementLocal)
          }
          self.myReport.items = requirementsLocal

          // Add levels label for user language into myReport object
          let levelsLocal = []
          let lItem = null
          for (lItem of response.data.levels) {
            let levelLocal = {
              code: null,
              label: null
            }
            levelLocal.label = lItem.label[self.language]
            levelLocal.code = lItem.code
            levelsLocal.push(levelLocal)
          }
          self.levelsTemplate = levelsLocal
          self.myReport.templateName = self.$route.query.template
          self.myReport.repositoryId = self.$route.query.repositoryId
        }).finally(function() { self.loading = false})

      }

    },


} 
</script>

<style scoped>

.save-button {
	margin-top: 16px
}

.align-right {
	position: absolute;
  right: 3%;
}

</style>