<template>
    <div>
    <div class="report">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>
    <h1 class="subheading grey--text">My {{ $store.getters.getRepository.name }} report</h1>
      <v-form v-model="valid">
      

            <v-text-field v-if="!readOnly"
                label="Version Number"
                v-model="myReport.version"
                :rules="versionRules"
            ></v-text-field>
            <p v-if="readOnly"><span class="font-weight-bold">Version:  </span><span>{{ myReport.version }} </span></p>
         
            <v-select v-show="!readOnly"
                :items="status"
                v-model="myReport.status"
                >
            </v-select>
            <p v-if="readOnly"><span class="font-weight-bold">Status:  </span><span>{{ myReport.status }} </span></p>
           

              <v-stepper v-model="e1" vertical >
                <div v-for="(item, index) in myReport.items" :key=index>
                        <v-stepper-step :complete="e1 > index + 1" :step="index+1" editable >
                        <h3>{{item.requirement}}</h3>
                        <small v-if="item.level != null">Level: {{item.level.code}}</small>
                        </v-stepper-step>
                      
                        <v-stepper-content :step="index+1">
                          <v-card
                              class="mb-12"
                              color="grey lighten-3"
                              height="auto"
                          >
                            <!-- DO WE WANT TO ADD GUIDANCE ? <div v-html="item.guidance "></div>-->
                            <v-textarea v-if="!readOnly"
                                outlined class="ma-3"
                                label="Edit the response"
                                v-model="item.response"
                            >
                            </v-textarea>
                            <p v-else class="text-justify">{{ item.response }}</p>

                            <v-select filled v-if="!readOnly" class="ma-3"
                              :items="levelsTemplate.levels"
                              label="Compliance level"
                              v-model="item.level"
                              item-text="label"
                              return-object
                            ></v-select>
                            <p v-else>
                              <span class="font-weight-bold">Compliance level: </span>
                              <span v-if="item.level != null">{{ item.level.label }}</span> 
                            </p>

                            <v-expansion-panels class="pa-3" v-if="!hideCommentBloc(item)">
                            <v-expansion-panel>
                                <v-expansion-panel-header>Comments  <span class="pl-3" v-if="item.requirementcomments != null && item.requirementcomments.comments.length > 0"><i class="fa fa-comment"></i> {{ item.requirementcomments.comments.length }}</span></v-expansion-panel-header>
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
                              <v-btn text color="primary" @click="previousStep(index+1)">
                                  Previous
                              </v-btn>
                              <v-btn color="primary" @click="nextStep(index+1)">
                                  Continue
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
                        Cancel
                    </v-btn>
                     <v-btn v-show="!readOnly"
                        color="primary"
                        @click="save"
                        >
                        Save
                    </v-btn>
            </div>

            <div class="text-right save-button">

              <v-btn v-show="!readOnly"
                color="primary"
                @click="displayReleaseConfirmation"
                :disabled="!valid"
                >
                Release
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
                  Release the report version
                  </v-card-title>

                  <v-card-text>
                  Do you really want to release this report version ? You will not be able to modify or delete this version of the report after this process.
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn
                      color="primary"
                      text
                      @click="dialog = false"
                  >
                      Cancel
                  </v-btn>
                  <v-btn
                      color="primary"
                      @click="releaseTheReport"
                  >
                      Confirm
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
import levelsTemplateJson from '../resources/levels-template.json'
import requirementTemplateJson from '../resources/requirements-template.json'
import Comments from '../components/Comments.vue'
export default {
    components: {
        Comments
    },
    props: {
      service: null
  	},
    data() {
        return {
            //Some info about the current user
            current_user: {
                user: 'Tom Tom'
            },
            //Comments that are under the post
            comments: [
                {
                    user: 'François André',
                    text: 'lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor',
                },
                {
                    user: 'Jean Claude Van Damme',
                    text: 'mais où et donc or ni car',
                },
            ],
            valid: false,
            dialog: false,
            readOnly: null,
            myReport: {
                'id': null, 
                'repositoryId': null,
                'items': requirementTemplateJson.requirements, 
                'status': 'NEW',
                'updateDate': null,
                'version': null
                },
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            index: 0,
            levelsTemplate: levelsTemplateJson,
            headers: [
                { text: 'Code', sortable: false, value: 'code' },
                { text: 'Requirement', sortable: false, value: 'requirement' },
                { text: 'Response', sortable: false, value: 'response' },
                { text: 'Compliance level', sortable: false, value: 'level' }
            ],
            status: ["NEW","IN_PROGRESS","READY"],
            e1: 0,
            steps: 17,
            versionRules: [
                v => !!v || 'Version is required'
            ],
        }
    },
    computed: {
      isReleasable: function () {
        if(this.myReport.status == 'READY') {
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
        return this.isReadOnlyComment && item.requirementcomments.comments.length == 0 || this.myReport.id == null
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
        if(this.myReport.status != 'READY') {
          this.displayError("The report status must be 'READY' before been able to release a report")
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
      var id = this.$route.query.reportId
      if(id != null) {
        var self = this
        // getReport return as result the report, the comments by requirement and a boolean ISREADONLY
        this.axios
        .get(this.service+'/certificationReport/v1_0/getReport/'+id)
        .then( function (response) {
          self.myReport = response.data.reports[0]
          self.readOnly = response.data.readOnly
          // if the report has been released and the user is not making a copy => READ ONLY
          if(response.data.reports[0].status == 'RELEASED' && self.$route.query.copy == null) {
            self.readOnly = true
          }
          // if the user is making a copy of a released report => status NEW and version null
          if(self.$route.query.copy != null) {
            self.myReport.status = 'NEW'
            self.updateDate = new Date()
            self.myReport.version = null
            self.myReport.id = null
          }
          
          // BEGINNING add comments into report object
          let requirementComments = response.data.requirementComments

          if(self.myReport.items != null && self.myReport.items.length > 0 ) {
            for (var i = 0; i < self.myReport.items.length; i++) {
              let itemCode = self.myReport.items[i].code
              console.log('Search comments for requirement :'+itemCode)
              let notFound = true
              for (var j = 0; j < requirementComments.length; j++) {
                // search saved comments 
                if(itemCode == requirementComments[j].itemCode ) {
                  console.log('Comments found:'+ JSON.stringify(requirementComments[j]))
                  self.myReport.items[i].requirementcomments = requirementComments[j]
                  notFound = false
                }
              }
              // if no previous comment initialize an object with an empty array of comments
              if(notFound) {
                self.myReport.items[i].requirementcomments = {
                  comments: [],
                  reportId: self.myReport.id,
                  itemCode: itemCode
                }
              }
            }
          }
          // END add comments into report object
        }).catch(function(error) {self.displayError("An error has occured:" + error)})
      } else {
        //this.myReport = this.myReportTemplate
        this.myReport.repositoryId = this.$route.query.repositoryId
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