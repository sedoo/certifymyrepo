<template>
    <div>
    <div class="reports">
    <h1 class="subheading grey--text">My {{ repositoryName }} certification reports</h1>
    <v-container class="my-3">

        <template>
        <div class="text-center">

            <router-link tag="icon" color="grey" class="link-title" v-bind:to="{name: 'editMyReport', query: { report: JSON.stringify(myReportTemplate)} }">
                <v-icon size='20px' left>fa-plus</v-icon>
                <span style="font-weight: bold;">Create a new report</span>
            </router-link>

        </div>
        </template>

        <template>
        <v-data-table
            :headers="headers"
            :items="reports"
            :sort-by="['version']"
            :sort-desc="[true]"
            hide-default-footer
            show-expand
            class="elevation-1"
        >
 
         <template v-slot:item.updateDate="{ item }">  
            <span>{{ formatDate(item.updateDate) }}</span>
        </template> 
        <template v-slot:item.actions="{ item }">
            <v-btn icon class="mx-0" @click="editItem(item)">     
                <v-icon size='20px'>fa-edit</v-icon>    
            </v-btn>
            <!--
            <v-btn icon class="mx-0" @click="deleteItem(item)">     
                <v-icon size='20px'>fa-trash-alt</v-icon>    
            </v-btn>-->

            <v-dialog
                v-model="dialog"
                width="500"
                >
            <template v-slot:activator="{ on }">
                <v-btn icon class="mx-0" v-on="on">     
                    <v-icon size='20px'>fa-trash-alt</v-icon>    
                </v-btn>  
            </template>

            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                Are you sure?
                </v-card-title>

                <v-card-text>
                Do you really want to delete these report? This process cannot be undone.
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
                    @click="dialog = false; deleteItem(item)"
                >
                    Confirm
                </v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>

        </template>   

        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length"><apexchart type=radar height=350 :options="chartOptions(item)" :series="levelList(item)" /></td>
        </template>      

        </v-data-table>

        </template>

    </v-container>
    </div>
    </div>
</template>


<script>
import moment from 'moment';
import requirementTemplateJson from '../resources/requirements-template.json'

export default {

    props: {
    	service: null,
        item: null
  	},
    data() {
        return {
            reports: [],
            dialog: false,
            repositoryId: this.$route.params.id,
            repositoryName: this.$route.params.name,
            headers: [
                { text: 'Version', value: 'version' },
                { text: 'Update date', value: 'updateDate'},
                { text: 'Satus', value: 'status' },
                { text: 'Actions', value: 'actions', sortable: false }
                ] ,
            myReport: null,
            myReportTemplate: {
                'id': null, 
                'repositoryId': this.$route.params.id, 
                'repositoryName': this.$route.params.name, 
                'items': requirementTemplateJson.requirements, 
                'status': null,
                'updateDate': null,
                'version': null
                },
           series: [{
                name: 'Series 1',
                data: [0, 4, 3, 2, 2, 4],
                //data: [null]
            }]
           // series : [this.levelList()],
            /*chartOptions: {
                //labels: this.requirementCodeList(),
                labels: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'],
                //labels: [null],
                title: {
                    text: 'Requirements Radar Chart'
                }
            } */
        }
    },
    computed: {

    },
    methods: {
    levelList (report) {
        var serie = {name: 'certificationReport', data: []}
        var array = [];
        //console.log(JSON.stringify(report));

        for (var j = 0; j < report.items.length; j++){
            var r = report.items[j]
            //console.log(JSON.stringify(r))
            if(r.level) {
                array.push(r.level.code)
            } else {
                array.push(null)
            }
        }
        serie.data = array
        //console.log(JSON.stringify(serie))
        return [serie];
    },
    chartOptions (report) {
        var option = {labels: null, title: {text: 'Requirements Radar Chart'}}
        var array = [];
        for (var j = 0; j < report.items.length; j++){
            var r = report.items[j]
            //console.log(JSON.stringify(r))
            if(r.code) {
                array.push('R'+r.code)
            }
        }
        //console.log(JSON.stringify(array))
        option.labels = array
        //console.log('------------> chartOptions')
        //console.log(JSON.stringify(option))
        return option
    },

      deleteItem (item) {
        //console.log("Delete item"+item.id)
          this.axios.delete(this.service+'certificationReport/v1_0/delete/'+item.id)
            .then( () =>
                this.axios
                    .get(this.service+'certificationReport/v1_0/listByRepositoryId/'+this.repositoryId)
                    .then(response => {
                        this.reports = response.data
                    })
            )
            .catch(error => {
                console.log(error)
            })
        console.log("item"+item.id+" deleted")
      },
    editItem (item) {
          //console.log("Edit item"+item.id)
          this.$router.push({name: 'editMyReport', query: { report: JSON.stringify(item)} });
      }, 
    formatDate (timestamp) {
        return moment(timestamp).format('DD MMM YYYY HH:mm')
      }
    },

    mounted: function() {
    	console.log("Monté")
    },
    
    created: function() {
      //console.log('-------> Component: MyCertificationReports')
      //console.log('------->:repository id: '+this.$route.params.id)
      this.errored = false;
      this.axios
      .get(this.service+'certificationReport/v1_0/listByRepositoryId/'+this.$route.params.id)
      .then(response => {
        this.reports = response.data
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.loading = false)
    }
} 
</script>

<style scoped>

.link-title {
	cursor: pointer
}

</style>