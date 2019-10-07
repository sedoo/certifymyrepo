<template>
    <div>
    <div class="reports">
    <h1 class="subheading grey--text">My certification reports</h1>
    <v-container class="my-3">

        <template>
        <div class="text-center">

        <div v-if="!readOnly" class="text-right pa-3">
            <v-btn color="primary" @click="createReport">Create a new report</v-btn>
        </div>

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
            <v-btn v-if="!readOnly && !isReleased(item)" icon class="mx-0" @click="editItem(item)">     
                <v-icon size="20px">fa-edit</v-icon>    
            </v-btn>

            <v-btn v-if="readOnly || isReleased(item)" icon class="mx-0 pa-3" @click="editItem(item)">     
                <v-icon size="20px">fa-book-open</v-icon>    
            </v-btn>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="isReleased(item) && !readyOnly" icon v-on="on" class="mx-0" @click="copyItem(item)">     
                        <v-icon size="20px">fa-copy</v-icon>    
                    </v-btn>
                </template>
                <span>Create a new report from a copy</span>
            </v-tooltip>

            <v-dialog
                v-model="dialog"
                width="500"
                >
            <template v-slot:activator="{ on }">
                <v-btn v-if="!readOnly && !isReleased(item)" icon class="mx-0" v-on="on" @click="reportId=item.id">     
                    <v-icon size="20px">fa-trash-alt</v-icon>    
                </v-btn>  
            </template>

            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                Confirmation
                </v-card-title>

                <v-card-text>
                Do you really want to delete this report ? This process cannot be undone.
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
                    @click="dialog = false; deleteItem()"
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

export default {

    props: {
    	service: null,
        item: null
  	},
    data() {
        return {
            reports: [],
            dialog: false,
            reportId: null,
            readOnly: false,
            repositoryId: this.$route.params.id,
            headers: [
                { text: 'Version', value: 'version' },
                { text: 'Update date', value: 'updateDate'},
                { text: 'Satus', value: 'status' },
                { text: 'Actions', value: 'actions', sortable: false }
                ] ,
            myReport: null
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
            //console.log('level list report'+JSON.stringify(serie.data))
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
            //console.log('code report'+JSON.stringify(option.labels))
            return option
        },
        deleteItem () {
            this.axios.delete(this.service+'certificationReport/v1_0/delete/'+this.reportId)
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
        },
        createReport() {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: null} })
        },
        editItem (item) {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: item.id } });
        }, 
        copyItem (item) {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: item.id, copy: true }  });
        }, 
        formatDate (timestamp) {
            return moment(timestamp).format('DD MMM YYYY HH:mm')
        },
        isReleased: function (item) {
            if(item.status == 'RELEASED') {
                console.log('is released : true, readOnly : '+this.readOnly) 
                return true
            } else {
                console.log('is released : false, readOnly : '+this.readOnly)
                return false
            }
        }
    },

    mounted: function() {
    	console.log("-------> MyCertificationReports Monté")
    },
    
    created: function() {
      console.log('-------> MyCertificationReports créé')
      console.log('------->:repository id: '+this.$route.params.id)
      var self = this
      this.errored = false;
      this.axios
      .get(this.service+'certificationReport/v1_0/listByRepositoryId/'+this.$route.params.id)
      .then(response => {
        self.reports = response.data.reports
        self.readOnly = response.data.readOnly
         console.log('------->:response.data: '+JSON.stringify(response.data))
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