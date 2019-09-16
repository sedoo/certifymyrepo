<template>
    <div>
    <div class="report">
    <h1 class="subheading grey--text">My {{ myReport.repositoryName }} report</h1>
    <v-container class="my-3">

        <template>

            <v-text-field
                label="Version Number"
                v-model="myReport.version"
            ></v-text-field>

            <v-col class="d-flex">
                <v-select
                :items="status"
                label="Status"
                v-model="myReport.status"
                ></v-select>
            </v-col>

              <v-stepper v-model="e1" vertical>
                <div v-for="(item, index) in myReport.items" :key=index>
                        <v-stepper-step :complete="e1 > index + 1" :step="index+1" editable>
                          <h3>
                            {{item.requirement}}
                          </h3>
                        </v-stepper-step>
                        <v-stepper-content :step="index+1">
                          <v-card
                              class="mb-12"
                              color="grey lighten-4"
                              height="auto"
                          >
                            <div style="margin-top: 16px">
                              <div v-html="item.guidance "></div>
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
                        >
                        Save
                    </v-btn>
            </div>

        </template>

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
            valid: 'true',
            index: 0,
            myReport: JSON.parse(this.$route.query.report),
            levelsTemplate: levelsTemplateJson,
            headers: [
                { text: 'Code', sortable: false, value: 'code' },
                { text: 'Requirement', sortable: false, value: 'requirement' },
                { text: 'Response', sortable: false, value: 'response' },
                { text: 'Compliance level', sortable: false, value: 'level' }
            ],
            status: ["TO_DO","IN_PROGRESS","FOR_VALIDATION","READY",],
            e1: 0,
            steps: 6

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
        this.axios({
            method: 'post',
            url: this.service+'certificationReport/v1_0/save',
            headers: {}, 
            data: this.myReport
        })
        this.goToMyCertificationReports();
      },
      goToMyCertificationReports() {
        this.$router.push({ path: '/certificationReports/'+this.myReport.repositoryId+'/'+this.myReport.repositoryName  });
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


</style>