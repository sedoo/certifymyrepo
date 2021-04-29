<template>
    <div>
    <h1 class="subheading grey--text">{{ $t('report.screen.title', {'msg':$store.getters.getRepository.name } ) }}</h1>
    <v-progress-linear indeterminate v-if="loadingReport" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close' )}}</v-btn>
    </v-snackbar>
    <div v-if="!loadingReport" class="report">
    <h4 class="subheading grey--text pt-5 pb-5">{{ templateDescription }}</h4>
      <v-form v-model="valid">
            <v-text-field v-if="editExistingAllowed"
                :label="$t('report.screen.version.number')"
                v-model="myReport.version"
                :rules="rules.versionRules"
            ></v-text-field>
            <p v-if="!editExistingAllowed"><span class="font-weight-bold">Version:  </span><span>{{ myReport.version }} </span></p>
         
            <v-select v-show="editExistingAllowed"
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
            <p v-if="!editExistingAllowed"><span class="font-weight-bold">{{ $t('report.screen.label.status') }} </span><span>{{ $t(myReport.status) }} </span></p>
           

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
                            <!-- start user detailed response -->
                            <v-textarea v-if="editExistingAllowed"
                                outlined class="ma-3"
                                :label="$t('report.screen.label.edit.response')"
                                v-model="item.response"
                            >
                            </v-textarea>
                            <p v-if="!editExistingAllowed" class="text-justify">{{ item.response }}</p>

                            <div v-if="featureFlag">
                            <v-list-item dense v-for="(file, i) in item.files" :key="i">
                              <div class="link-file pr-3" v-html="getHtmlHRefLink(myReport.id, item.code, file)">
                              </div>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                <v-btn v-on="on" icon class="mx-0" @click="copyText(myReport.id, item.code, file)">     
                                    <v-icon>mdi-content-copy</v-icon>    
                                </v-btn>
                                  </template>
                                  <span>{{ $t('report.screen.button.clipboard.help') }}</span>
                              </v-tooltip> 
                              <v-btn v-if="editExistingAllowed && myReport.status != 'RELEASED'" icon class="mx-0" @click="openDeleteFilePopup(item.code, file)">     
                                  <v-icon>mdi-delete-forever-outline</v-icon>    
                              </v-btn>  
                            </v-list-item>
                            <v-card-actions>
                               <v-tooltip :disabled="!reportNotSavedYet" bottom>
                                <template v-slot:activator="{ on }">
                                  <div v-on="on" class="pa-2">
                                    <v-btn v-if="editExistingAllowed && myReport.status != 'RELEASED'" color="info" :disabled="reportNotSavedYet" @click="openUploadFilesPopup(item.code)">
                                        {{ $t('report.screen.label.add.files') }}
                                    </v-btn>
                                  </div>
                                  </template>
                                  <span>{{ $t('report.screen.button.add.files.help') }}</span>
                              </v-tooltip>
                            </v-card-actions>
                            </div>
                            <v-select filled v-if="editExistingAllowed" class="ma-3"
                              :items="levelsTemplate"
                              :label="$t('report.screen.label.level')"
                              v-model="item.level"
                              item-text="label"
                              item-value="code"
                            ></v-select>
                            <p v-else>
                              <span class="font-weight-bold">{{ $t('report.screen.label.level') }}: </span>
                              <span v-if="item.level != null">{{ getLevelLabel(item.level) }}</span> 
                            </p>

                            <v-expansion-panels flat class="pa-3" v-if="!hideCommentBloc(item)">
                            <v-expansion-panel>
                                <v-expansion-panel-header class="px-3">
                                  {{ $t('report.screen.label.comments')}}  
                                  <span class="pl-3" v-if="item.comments != null && item.comments.length > 0">
                                    <i class="fa fa-comment"></i> {{ item.comments.length }}
                                  </span>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <comments 
                                        :comments_wrapper_classes="['custom-scrollbar', 'comments-wrapper']"
                                        :comments="item.comments"
                                        :requirementCode="item.code"
                                        :isreadonly="isReadOnlyComment"
                                        @submit-comment="submitItemComment"
                                    ></comments>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            </v-expansion-panels>

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
                     <v-btn @click="goToMyCertificationReports" class="mr-5">
                        {{ $t('button.cancel') }}
                    </v-btn>
                     <v-btn v-show="editExistingAllowed"
                        color="info"
                        @click="save"
                        >
                        {{ $t('button.save') }}
                    </v-btn>
            </div>

            <div class="text-right save-button">
              <v-btn v-show="validationAllowed"
                color="info"
                @click="displayReleaseConfirmation"
                :disabled="!valid"
                >
                {{ $t('button.release') }}
              </v-btn>
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
        <v-btn color="info" @click="releaseTheReport">
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
              color="primary"
              text
              @click="dialogDeleteFile = false"
          >
              {{ $t('button.cancel') }}
          </v-btn>
          <v-btn
              color="primary"
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
import {displayError} from '../utils.js'
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
            fileToDelete: null,
            deleteInProgress: false,
            uploadInProgress: false,
            featureFlag: false,
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

      getHtmlHRefLink(reportId, code, file) {
        return "<a href='"+this.service+"/link/"+reportId+"/"+code+"/"+file+"' style='color: -webkit-link;' target='_blank' rel='noopener noreferrer'>"+file+"</a>"
      },

      copyText(reportId, code, file) {
        const el = document.createElement('textarea');  
        el.value = this.service+"/link/"+reportId+"/"+code+"/"+file;                                 
        el.setAttribute('readonly', '');                
        el.style.position = 'absolute';                     
        el.style.left = '-9999px';                      
        document.body.appendChild(el);                  
        const selected =  document.getSelection().rangeCount > 0  ? document.getSelection().getRangeAt(0) : false;                                    
        el.select();                                    
        document.execCommand('copy');                   
        document.body.removeChild(el);                  
        if (selected) {                                 
          document.getSelection().removeAllRanges();    
          document.getSelection().addRange(selected);   
        }
      },

      openUploadFilesPopup(itemCode) {
        this.uploadInProgress = false
        this.dialogUploadFiles = true;
        this.currentRequirementCode=itemCode;
        this.itemFiles=[]
      },

      openDeleteFilePopup(itemCode, file) {
        this.deleteInProgress = false
        this.dialogDeleteFile = true;
        this.currentRequirementCode=itemCode;
        this.fileToDelete=file;
      },

      updateUploadedFiles(filesToUpload) {
        if(!this.myReport.items[this.currentRequirementCode].files) {
          this.myReport.items[this.currentRequirementCode].files = [];
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
                let filesName = self.myReport.items[this.currentRequirementCode].files
                for(let i=0 ; i<response.data.length ; i++) {
                  filesName.push(response.data[i])
                }
                self.myReport.items[this.currentRequirementCode].files = Array.from(new Set(filesName))
              }

            })
            .catch(error => {
              displayError(self, error)
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
                for(let i=0 ; i<self.myReport.items[self.currentRequirementCode].files.length ; i++) {
                  if(self.myReport.items[self.currentRequirementCode].files[i] === self.fileToDelete) {
                    self.myReport.items[self.currentRequirementCode].files.splice(i, 1);
                  }
                }
            })
            .catch(error => {
              displayError(self, error)
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
            url: this.service+'/certificationReport/v1_0/saveComments?reportId='+this.myReport.id+'&requirementCode='+requirementCode,
            data: comments
        }).catch(function(error) {displayError(self, error)})
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

      // Save report
      save () {
        if(!this.valid) {
          displayError(this, this.$t('report.screen.error.version.madatory'))
        } else {
          this.myReport.updateDate = new Date()
          var self = this;
          this.axios({
              method: 'post',
              url: this.service+'/certificationReport/v1_0/save',
              data: this.myReport
          }).then( function (response) {
            self.displaySuccess(self.$t('report.screen.save.confirmation'))
          }).catch(function(error) {displayError(self, error)})
        }

      },

      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId });
      },

      displayReleaseConfirmation() {
        if(this.myReport.status != 'IN_PROGRESS') {
          displayError(this, this.$t('release.erreor.message'))
        } else {
          this.dialog = true
        }
      },

      releaseTheReport() {
        this.dialog = false
        this.myReport.status = 'RELEASED'
        this.save ()
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
      this.loadingReport = true
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
          self.editExistingAllowed = response.data.editExistingAllowed
          self.validationAllowed = response.data.validationAllowed
          
          if(response.data.template.description && response.data.template.description[self.$store.getters.getLanguage]) {
            self.templateDiscription = response.data.template.description[self.$store.getters.getLanguage]
          }

          let commentsCollection = response.data.requirementComments
          let requirementsTemplate = response.data.template.requirements
          let requirementsAttachments = response.data.attachments

          if(self.myReport.items != null && self.myReport.items.length > 0 ) {
            for (var i = 0; i < self.myReport.items.length; i++) {

              let itemCode = self.myReport.items[i].code

              if(!self.$route.query.copy) {
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
                if(itemCode == requirementItemCode) {
                  self.myReport.items[i].requirement = requirementsTemplate[requirementItemCode].requirement[self.language]
                }
              }
              // END add labels into report object from template

              // BEGINNING add attachments into report object
              if(requirementsAttachments && requirementsAttachments[itemCode]) {
                self.myReport.items[i].files = requirementsAttachments[itemCode]
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

          // if the user is making a copy of a released report 
          if(self.$route.query.copy) {
            self.myReport.status = 'NEW'
            self.updateDate = null
            let versionArray = self.myReport.version.split('.')
            self.myReport.version = (parseInt(versionArray[0])+1) + '.0'
            self.myReport.id = null
            self.editExistingAllowed = true
            self.validationAllowed = true
          }

        }).catch(function(error) {displayError(self, error)})
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
          self.editExistingAllowed = true
          self.validationAllowed = false
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

</style>