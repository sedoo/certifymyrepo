<template>
    <div>
    <div class="report">
    <h1 class="subheading grey--text">My {{ myReport.repositoryName }} report</h1>
    <v-container class="my-3">
      <v-form v-model="valid">
        <template>

            <v-text-field
                label="Version Number"
                v-model="myReport.version"
                :rules="versionRules"
                required
            ></v-text-field>

            <v-col class="d-flex">
                <v-select
                :items="status"
                v-model="myReport.status"
                :rules="statusRules"
                ></v-select>
            </v-col>

              <v-stepper v-model="e1" vertical>
                <div v-for="(item, index) in myReport.items" :key=index>
                      
                        <v-stepper-step :complete="e1 > index + 1" :step="index+1" editable>
                        <v-container class="my-5">
                          <v-layout row> 
                            <v-flex ><h3>{{item.requirement}}</h3></v-flex>
                            <v-flex ><div class="align-right" v-if="item.level != null">Level: {{item.level.code}}</div></v-flex>
                          </v-layout>
                        </v-container>
                        </v-stepper-step>
                        <v-stepper-content :step="index+1">
                          <v-card
                              class="mb-12"
                              color="grey lighten-4"
                              height="auto"
                          >
                            <div style="margin-top: 16px">
                              <!-- DO WE WANT TO ADD GUIDANCE ? <div v-html="item.guidance "></div>-->
                              <v-textarea 
                                  outlined
                                  label="Edit the response"
                                  v-model="item.response"
                              >
                              </v-textarea>
                            </div>

                            <v-select filled
                              :items="levelsTemplate.levels"
                              label="Compliance level"
                              v-model="item.level"
                              item-text="label"
                              return-object
                            ></v-select>
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
                     <v-btn
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
                     <v-btn
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

        </template>
      </v-form>
    </v-container>
    </div>
    </div>
</template>


<script>
import levelsTemplateJson from '../resources/levels-template.json'
export default {
    props: {
    	service: null
  	},
    data() {
        return {
            valid: false,
            dialog: false,
            index: 0,
            myReport: JSON.parse(this.$route.query.report),
            levelsTemplate: levelsTemplateJson,
            headers: [
                { text: 'Code', sortable: false, value: 'code' },
                { text: 'Requirement', sortable: false, value: 'requirement' },
                { text: 'Response', sortable: false, value: 'response' },
                { text: 'Compliance level', sortable: false, value: 'level' }
            ],
            status: ["NEW","IN_PROGRESS","READY",],
            e1: 0,
            steps: 17,
            versionRules: [
                v => !!v || 'Version is required'
            ]
        }
    },
    computed: {
      isReleasable: function () {
        if(this.myReport.status == 'READY') {
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
        console.log('-------> Save My report')
        console.log('-------> URL :'+this.service)
        this.myReport.updateDate = new Date()
        this.errored = false;
        var self = this;
        this.axios({
            method: 'post',
            url: this.service+'certificationReport/v1_0/save',
            data: this.myReport
        }).then( function (response) {
          self.$router.push({ path: '/certificationReports/'+response.data.repositoryId+'/'+response.data.repositoryName  })
          })
      },
      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId+'/'+this.myReport.repositoryName  });
      },
      releaseTheReport() {
        this.dialog = false
        this.myReport.status = 'RELEASED'
        this.save ()
      }
    },
    mounted: function() {
    	console.log("Monté")
      console.log(this.myReport)
    },
    
    created: function() {
    	console.log("Créé")
      console.log(this.myReport)
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