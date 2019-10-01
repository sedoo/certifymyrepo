<template>
    <div>
    <div class="report">
    <h1 class="subheading grey--text">My {{ myReport.repositoryName }} report</h1>
      <v-form v-model="valid">
      

            <v-text-field v-if="!readOnly"
                label="Version Number"
                v-model="myReport.version"
                :rules="versionRules"
                required
            ></v-text-field>
            <p v-if="readOnly"><span class="font-weight-bold">Version:  </span><span>{{ myReport.version }} </span></p>
         
            <v-select v-if="!readOnly"
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
                            <div style="margin-top: 16px">
                              <!-- DO WE WANT TO ADD GUIDANCE ? <div v-html="item.guidance "></div>-->
                              <v-textarea v-if="!readOnly"
                                  outlined
                                  label="Edit the response"
                                  v-model="item.response"
                              >
                              </v-textarea>
                              <p v-else class="text-justify">{{ item.response }}</p>
                            </div>

                            <v-select filled v-if="!readOnly"
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

                          </v-card>
                          <v-btn text
                              color="primary"
                              @click="previousStep(index+1)"
                          >
                              Previous
                          </v-btn>
                          <v-btn
                              color="primary"
                              @click="nextStep(index+1)"
                          >
                              Continue
                          </v-btn>
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
                        :disabled="!valid"

                        >
                        Save
                    </v-btn>
            </div>

            <div class="text-right save-button">

              <v-dialog
                  v-model="dialog"
                  width="500"
                  >
              <template v-slot:activator="{ on }">
                     <v-btn v-show="!readOnly"
                        color="primary"
                        v-on="on"
                        :disabled="!valid || !isReleasable"
                        >
                        Release
                    </v-btn>
              </template>

              <v-card>
                  <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                  >
                  Release the report version
                  </v-card-title>

                  <v-card-text>
                  Do you really want to release this report version ? You will not be able to modify or delete the version report after this process.
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
export default {
    props: {
      service: null
  	},
    data() {
        return {
            valid: false,
            dialog: false,
            readOnly: null,
            myReport: null,
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
            myReportTemplate: {
                'id': null, 
                'repositoryId': null,
                'items': requirementTemplateJson.requirements, 
                'status': 'NEW',
                'updateDate': null,
                'version': null
                }
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
    },
    watch: {
      steps (val) {
        if (this.e1 > val) {
          this.e1 = val
        }
      },
    },
    methods: {
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
      save () {
        console.log('-------> URL :'+this.service)
        this.myReport.updateDate = new Date()
        this.errored = false;
        var self = this;
        this.axios({
            method: 'post',
            url: this.service+'certificationReport/v1_0/save',
            data: this.myReport
        }).then( function (response) {
          self.$router.push({ path: '/certificationReports/'+response.data.repositoryId  })
          })
      },
      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId });
      },
      releaseTheReport() {
        this.dialog = false
        this.myReport.status = 'RELEASED'
        this.save ()
      }
    },
    mounted: function() {
    	console.log("Monté")
      console.log(JSON.stringify(this.myReport))
    },
    
    created: function() {
      console.log("Créé")
      this.errored = false
      var id = this.$route.query.reportId
      console.log('REPORT ID '+this.$route.query.reportId)
      console.log('REPOSITORY ID '+this.$route.query.repositoryId)
      console.log('PARAMS '+JSON.stringify(this.$route.query ))
      if(id != null) {
        var self = this
        this.axios
        .get(this.service+'certificationReport/v1_0/getReport/'+id)
        .then(response => {
          console.log(JSON.stringify(response))
          self.myReport = response.data.reports[0]
          console.log('My report saved '+JSON.stringify(self.myReport ))
          self.readOnly = response.data.readOnly
        })
        .catch(error => {
          console.log(error)
          this.errored = true
        })
      } else {
        this.myReport = this.myReportTemplate
        this.myReport.repositoryId = this.$route.query.repositoryId
      }

    }
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