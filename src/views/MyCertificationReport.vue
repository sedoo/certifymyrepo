<template>
    <div>
    <unidoo-alert></unidoo-alert>
    <h1 class="subheading grey--text">{{ $t('report.screen.title', {'msg':$store.getters.getRepository.name } ) }}</h1>
    <v-progress-linear indeterminate v-if="loadingReport" class="mt-3"></v-progress-linear>
    <div v-if="!loadingReport" class="report">
    <h4 class="subheading grey--text pt-5 pb-5">{{ templateDescription }}</h4>
      <v-form v-model="valid">
            <v-text-field v-if="editExistingAllowed"
                :label="$t('report.screen.version.number')"
                v-model="myReport.version"
                :rules="rules.versionRules"
            ></v-text-field>
            <p v-if="!editExistingAllowed"><span class="font-weight-bold">Version:  </span><span>{{ myReport.version }} </span></p>
            <p><span class="font-weight-bold">{{ $t('report.screen.label.status') }} </span><span>{{ $t(myReport.status) }} </span></p>
           

              <v-stepper v-model="e1" vertical >
                <div v-for="(item, index) in myReport.items" :key=index>
                        <v-stepper-step :complete="e1 > index + 1" :step="index + 1" editable >
                        <h3>{{item.requirement}}</h3>
                        <small v-if="item.level != null">{{ $t('report.screen.label.level') }}: {{item.level}}</small>
                        </v-stepper-step>
                      
                        <v-stepper-content :step="index + 1">
                          <v-card
                              class="mb-12 scroll"
                              color="grey lighten-3"
                              height="auto"
                          >
                          <v-card-text>
                            <!-- start user detailed response -->
                            <v-textarea
                                outlined
                                :label="$t('report.screen.label.edit.response')"
                                v-model="item.response"
                                :readonly="!editExistingAllowed"
                            >
                            </v-textarea>

                            <div v-if="item.files">
                              <v-list-item dense v-for="(file, i) in item.files" :key="i">
                                <span class="link-file"> {{ file }}</span>
                                <v-tooltip bottom>
                                  <template v-slot:activator="{ on }">
                                  <v-btn v-on="on" icon class="mx-0" @click="downloadAttachment(myReport.id, item.code, file, i)" :loading="downloadAttachmentInProgress[i]">     
                                      <v-icon>mdi-download</v-icon>    
                                  </v-btn>
                                    </template>
                                    <span>{{ $t('report.screen.button.clipboard.help') }}</span>
                                </v-tooltip> 
                                <v-btn v-if="editExistingAllowed && myReport.status != 'RELEASED'" icon class="mx-0" @click="openDeleteFilePopup(item.code, file, index)">     
                                    <v-icon>mdi-delete-forever-outline</v-icon>    
                                </v-btn>  
                              </v-list-item>
                            </div>
                            <v-tooltip :disabled="!reportNotSavedYet" bottom>
                            <template v-slot:activator="{ on }">
                              <div v-on="on">
                                <v-btn v-if="editExistingAllowed && myReport.status != 'RELEASED'" color="info" :disabled="reportNotSavedYet" @click="openUploadFilesPopup(item.code, index)">
                                    {{ $t('report.screen.label.add.files') }}
                                </v-btn>
                              </div>
                              </template>
                              <span>{{ $t('report.screen.button.add.files.help') }}</span>
                          </v-tooltip>
                          <template v-if="item.levelActive">
                            <v-select filled v-if="editExistingAllowed"
                              class="pt-3"
                              :items="levelsTemplate"
                              :label="$t('report.screen.label.level')"
                              v-model="item.level"
                              item-text="label"
                              item-value="code"
                            ></v-select>
                            <p v-else>
                              <span class="font-weight-bold pt-3">{{ $t('report.screen.label.level') }}: </span>
                              <span class="pt-3" v-if="item.level != null">{{ getLevelLabel(item.level) }}</span> 
                            </p>
                          </template>

                            <v-expansion-panels flat class="py-3">
                            <v-expansion-panel>
                                <v-expansion-panel-header class="px-3">
                                  <v-tooltip :disabled="!hideCommentBloc(item)" bottom>
                                    <template v-slot:activator="{ on }">
                                        <div v-on="on">
                                          {{ $t('report.screen.label.comments')}}  
                                          <span class="pl-3" v-if="item.comments != null && item.comments.length > 0">
                                            <i class="fa fa-comment"></i> {{ item.comments.length }}
                                          </span>
                                        </div>
                                    </template>
                                    <span>{{ $t('report.screen.button.add.comments.help') }}</span>
                                  </v-tooltip>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <comments 
                                        :comments_wrapper_classes="['custom-scrollbar', 'comments-wrapper']"
                                        :comments="item.comments"
                                        :language="language"
                                        :requirementCode="item.code"
                                        :isreadonly="isReadOnlyComment"
                                        :disabled="hideCommentBloc(item)"
                                        @submit-comment="submitItemComment"
                                    ></comments>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            </v-expansion-panels>
                          </v-card-text>
                            <v-card-actions>
                              <v-btn @click="previousStep(index1)">
                                  {{ $t('button.previous') }}
                              </v-btn>
                              <v-btn color="info" @click="nextStep(index+1)">
                                  {{ $t('button.continue') }}
                              </v-btn>
                            </v-card-actions>

                          </v-card>

                        </v-stepper-content>

                </div>
              </v-stepper>

            <div class="text-right save-button">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click="goToMyCertificationReports" class="mr-5">
                    {{ $t('button.return') }}
                </v-btn>
                </template>
                <span>{{ $t('report.screen.button.return.help') }}</span>
              </v-tooltip> 
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-on="on" v-show="editExistingAllowed" class="mr-5"
                    color="info"
                    @click="saveReportAndReturn()"
                    >
                    {{ $t('button.save.return') }}
                </v-btn>
                </template>
                <span>{{ $t('report.screen.button.save.and.return.help') }}</span>
              </v-tooltip> 
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-on="on" v-show="editExistingAllowed" class="mr-5"
                    color="info"
                    @click="saveReportWithCurrentVersion"
                    >
                    {{ $t('button.save') }}
                </v-btn>
                </template>
                <span>{{ $t('report.screen.button.save.help') }}</span>
              </v-tooltip> 
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-on="on" v-show="editExistingAllowed"
                    color="info"
                    @click="saveReportIncreaseVersion"
                    >
                    {{ $t('button.saveNewVersion') }}
                </v-btn>
                </template>
                <span>{{ $t('report.screen.button.saveNewVersion.help') }}</span>
              </v-tooltip>
            </div>

            <div class="text-right save-button">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
              <v-btn v-on="on" v-show="validationAllowed"
                color="info"
                @click="displayReleaseConfirmation"
                :disabled="!valid"
                >
                {{ $t('button.release') }}
              </v-btn>
              </template>
              <span>{{ $t('report.screen.button.release.help') }}</span>
            </v-tooltip>
            </div>
      </v-form>
    </div>


    <v-dialog v-model="dialog" :width="$store.getters.getDialogWidth">

    <v-card>
        <v-card-title
        class="headline grey lighten-2"
        primary-title
        >
        {{ $t('report.screen.release.confirmation.title')}}
        </v-card-title>

        <v-card-text>
        {{ $t('report.screen.release.confirmation.message')}}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn @click="dialog = false">
            {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="info" @click="releaseTheReport()">
            {{ $t('button.confirm') }}
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>

      <v-dialog v-model="dialogUploadFiles" :width="$store.getters.getDialogWidth">

    <v-card>
        <v-card-title
        class="headline grey lighten-2"
        primary-title
        >
        {{ $t('report.screen.upload.popup.title')}}
        </v-card-title>

        <v-card-text class="py-5">{{ $t('report.screen.upload.popup.message')}}</v-card-text>

        <v-file-input
          class="px-3 py-0"
          v-model="itemFiles"
          chips
          multiple
          show-size
          truncate-length="20"
          :label="$t('report.screen.label.add.files')"
          :rules="rules.filesRules"
        ></v-file-input>

        <v-divider></v-divider>

        <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn @click="dialogUploadFiles = false">
            {{ $t('button.cancel') }}
        </v-btn>
        <v-btn
            color="info"
            @click="updateUploadedFiles(itemFiles)"
            :loading="uploadInProgress"
        >
            {{ $t('button.confirm') }}
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDeleteFile" :width="$store.getters.getDialogWidth">
      <v-card>
          <v-card-title
          class="headline grey lighten-2"
          primary-title
          >
          {{ $t('report.screen.delete.confirmation.title')}}
          </v-card-title>
        <v-card-text>
        {{ $t('report.screen.delete.confirmation.message', {'msg':fileToDelete })}}
        </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn
              @click="dialogDeleteFile = false"
          >
              {{ $t('button.cancel') }}
          </v-btn>
          <v-btn
              color="info"
              @click="deleteFile()"
              :loading="deleteInProgress"
          >
              {{ $t('button.confirm') }}
          </v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>

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
            dialogDeleteFile: false,
	          editExistingAllowed: false,
            validationAllowed: false,
            myReport: {
                'id': null,
                'templateId': null,
                'repositoryId': null,
                'items': null, 
                'status': 'NEW',
                'updateDate': null,
                'version': 0.1
                },
            index: 0,
            e1: 1,
            steps: null,
            rules: {
              versionRules: [
                  v => !!v || this.$t('version.required.error'),
                  v => /[0-99].[0-99]/.test(v) || this.$t('version.not.valid.error'),
              ],
              filesRules: [
                files => !files || !files.some(file => file.size > 10485760)|| this.$t('files.size.error'),
              ]
            },
            templateDescription: null,
            loadingReport: false,
            itemFiles: null,
            currentRequirementCode: null,
            currentRequirementIndex: null,
            fileToDelete: null,
            deleteInProgress: false,
            uploadInProgress: false,
            downloadAttachmentInProgress: [],
            featureFlag: true,
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
      userId: function()  {
        if(this.$store.getters.getUser != null) {
          return this.$store.getters.getUser.profile.id
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
      reportNotSavedYet: function () {
        if(this.myReport.id) {
          return false
        } else {
          return true 
        }
        
      }
    },
    watch: {
      steps (val) {
        if (this.e1 > val) {
          this.e1 = val
        }
      },
    },
    methods: {

      downloadAttachment(reportId, code, fileName, index) {
        this.downloadAttachmentInProgress[index] = true
        let self = this
        this.axios({
                method: 'get',
                url: this.service+"/file/v1_0/"+reportId+"/"+code+"/"+fileName,
                responseType: 'arraybuffer'
            })
            .then(response => {
              let blob = new Blob([response.data], { type: response.headers['content-type']});
              let link = document.createElement("a");
              link.href = window.URL.createObjectURL(blob);
              link.download = fileName;
              link.click();
            })
            .catch(error => {
              self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            }).finally(function() {
              self.downloadAttachmentInProgress = []
            })
      },

      openUploadFilesPopup(itemCode, index) {
        this.uploadInProgress = false
        this.dialogUploadFiles = true;
        this.currentRequirementCode=itemCode;
        this.currentRequirementIndex=index
        this.itemFiles=[]
      },

      openDeleteFilePopup(itemCode, file, index) {
        this.deleteInProgress = false
        this.dialogDeleteFile = true
        this.currentRequirementCode=itemCode
        this.currentRequirementIndex=index
        this.fileToDelete=file;
      },

      updateUploadedFiles(filesToUpload) {
        if(!this.myReport.items[this.currentRequirementIndex].files) {
          this.myReport.items[this.currentRequirementIndex].files = [];
        }
        let formData = new FormData();
        for(let i=0 ; i<filesToUpload.length ; i++) {
          formData.append("files", filesToUpload[i], filesToUpload[i].name);
        }
        this.uploadInProgress = true
        self = this
        this.axios({
                method: 'post',
                url: this.service+"/file/v1_0/upload?reportId="+ this.myReport.id+"&codeRequirement="+this.currentRequirementCode,
                data: formData,
                headers: {
                    'content-type': 'multipart/form-data'
                }
            })
            .then(response => {
              if(response && response.data) {
                let filesName = self.myReport.items[this.currentRequirementIndex].files
                for(let i=0 ; i<response.data.length ; i++) {
                  filesName.push(response.data[i])
                }
                self.myReport.items[this.currentRequirementIndex].files = Array.from(new Set(filesName))
              }

            })
            .catch(error => {
              self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            }).finally(function() {
              self.uploadInProgress = false
              self.dialogUploadFiles = false
            })
      },

      deleteFile() {
        this.deleteInProgress = true
        let self = this
        this.axios({
                method: 'delete',
                url: this.service+"/file/v1_0/delete?reportId="+this.myReport.id+
                  "&codeRequirement="+this.currentRequirementCode+
                  "&fileName="+this.fileToDelete,
            })
            .then(response => {
                for(let i=0 ; i<self.myReport.items[self.currentRequirementIndex].files.length ; i++) {
                  if(self.myReport.items[self.currentRequirementIndex].files[i] === self.fileToDelete) {
                    self.myReport.items[self.currentRequirementIndex].files.splice(i, 1);
                  }
                }
            })
            .catch(error => {
              self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            }).finally(function() {
              self.deleteInProgress = true
              self.dialogDeleteFile = false
            })
      },

      getLevelLabel(levelCode) {
        for(let i=0 ; i<this.levelsTemplate.length ; i++) {
          if(levelCode === this.levelsTemplate[i].code) {
            return this.levelsTemplate[i].label
          }
        }
      },

      // Display comment in chat box + save it in mongoDB
      submitItemComment: function(requirementCode, comments, reply) {
        let self = this
        comments.push({
            userId: this.userId,
            userName: this.userName,
            text: reply,
            creationDate: new Date(),
            id: comments.length
        });
        this.axios({
            method: 'post',
            url: this.service+'/certificationReport/v1_0/saveComments?reportId='+this.myReport.id+'&repositoryId='+this.myReport.repositoryId+'&requirementCode='+requirementCode+'&language='+this.language,
            data: comments
        }).catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
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
        return this.isReadOnlyComment && item.comments != null && item.comments.length == 0 || this.myReport.id == null
      },

      /**
       * @param isReturn if true return to the previous screen after saving (list of reports)
       */
      saveReport (isReturn) {
        if(!this.valid) {
          this.$unidooAlert.showError(this.$t('report.screen.error.version.madatory'))
        } else {
          this.myReport.updateDate = new Date()
          var self = this;
          this.axios({
              method: 'post',
              url: this.service+'/certificationReport/v1_0/save?language='+this.language,
              data: this.myReport
          }).then( function (response) {
            self.myReport.id = response.data.id
            let id = self.$route.query.reportId
            if(id != null) {
              self.$router.push({path: '/myReport', query: { repositoryId: response.data.repositoryId, reportId: response.data.id, template: response.data.templateId} })
            }
            self.$unidooAlert.showSuccess(self.$t('report.screen.save.confirmation'), self.$t('button.close'))
            if(isReturn) {
              self.goToMyCertificationReports()
            }
          }).catch(function(error) {
            self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
          })
        }

      },

      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId });
      },

      displayReleaseConfirmation() {
        if(this.myReport.status != 'IN_PROGRESS') {
          self.$unidooAlert.showError(this.$t('report.screen.release.error'), self.$t('button.close'))
        } else {
          this.dialog = true
        }
      },

      saveReportAndReturn() {
        this.myReport.status = 'IN_PROGRESS'
        this.saveReport (true)
      },

      saveReportWithCurrentVersion() {
        this.myReport.status = 'IN_PROGRESS'
        this.saveReport (false)
      },

      saveReportIncreaseVersion() {
        this.myReport.status = 'IN_PROGRESS'
        let versionArray = this.myReport.version.split('.')
        let decimal = parseInt(versionArray[1], 10) + 1
        this.myReport.version = versionArray[0] + '.' + decimal
        this.saveReport (false)
      },

      releaseTheReport() {
        this.dialog = false
        this.myReport.status = 'RELEASED'
        this.saveReport (true)
      },

    },

    mounted: function() {

    },
    
    created () {
      this.loadingReport = true
      this.$i18n.locale = this.$store.getters.getLanguage;
      // case 1 id != null AND copy undefined or false => update the report
      // case 2 id != null AND copy == true => make a copy of the report
      // case 3 id == null AND template contains a templateName => create a new report with the requested template
      let id = this.$route.query.reportId
      if(id != null) {
        var self = this
        // getReport return as result the report, the comments by requirement, a boolean ISREADONLY and the certification report template
        this.axios
        .get(this.service+'/certificationReport/v1_0/getReport/'+id)
        .then( function (response) {
          self.myReport = response.data.report
          let originalRepositoryId = self.myReport.repositoryId 
          let destinationRepositoryId = self.$route.query.repositoryId
          self.myReport.repositoryId = self.$route.query.repositoryId
          self.editExistingAllowed = response.data.editExistingAllowed
          self.validationAllowed = response.data.validationAllowed
          
          if(response.data.template.description && response.data.template.description[self.$store.getters.getLanguage]) {
            self.templateDiscription = response.data.template.description[self.$store.getters.getLanguage]
          }
          let commentsCollection = response.data.requirementComments
          let requirementsTemplate = response.data.template.requirements
          let requirementsAttachments = response.data.attachments

          if(self.myReport.items != null && self.myReport.items.length > 0 ) {
            for (let i = 0; i < self.myReport.items.length; i++) {

              let itemCode = self.myReport.items[i].code

              if(commentsCollection && commentsCollection.length > 0) {
                // BEGINNING add comments into report object
                self.myReport.items[i].comments = []
                for (let commentItem in commentsCollection) {
                  if(itemCode == commentsCollection[commentItem].itemCode ) {
                    self.myReport.items[i].comments = commentsCollection[commentItem].comments
                  }
                }
                // END add comments into report object
              } else {
                self.myReport.items[i].comments = null
              }

              // BEGINNING add labels into report object from template
              for (let requirementItemCode in requirementsTemplate) {
                if(i == requirementItemCode) {
                  self.myReport.items[i].requirement = requirementsTemplate[requirementItemCode].requirement[self.language]
                  self.myReport.items[i].levelActive = requirementsTemplate[requirementItemCode].levelActive
                }
              }
              // END add labels into report object from template
              // BEGINNING add attachments into report object
              if(requirementsAttachments) {
                for (let attachmentsItem in requirementsAttachments) {
                  if(itemCode == attachmentsItem) {
                    self.myReport.items[i].files = requirementsAttachments[attachmentsItem]
                  }
                }
              }
              // END add attachments into report object

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

        }).catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        })
        .finally(function() { self.loadingReport = false})

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
              level: null,
              levelActive: false,
              comments: []
            }
            requirementLocal.requirement = rItem.requirement[self.language]
            if(rItem.response && rItem.response[self.language]) {
              requirementLocal.response = rItem.response[self.language]
            }
            requirementLocal.code = rItem.code
            requirementLocal.levelActive = rItem.levelActive
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
          self.myReport.templateId = self.$route.query.template
          self.myReport.repositoryId = self.$route.query.repositoryId
          self.editExistingAllowed = true
          self.validationAllowed = false
        }).catch(function(error) {
          self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
        }).finally(function() { self.loadingReport = false})

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

.scroll {
   overflow-y: scroll
}

.link-file {
  color: blue;
  text-decoration: underline;
}
</style>