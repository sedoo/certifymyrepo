<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title" : "{msg} certification reports",
    "create.new.report": "Create a new report",
    "date": "Update date",
    "status": "status",
    "radar.chart.title": "Requirements Radar Chart",
    "read.help.message": "Read this report",
    "copy.help.message": "Create a new report from a copy",
    "edit.help.message": "Edit this report",
    "delete.confirm.message": "Do you really want to delete this report ? This operation cannot be undone.",
    "delete": "Delete",
    "template.label": "Template"
  },
  "fr": {
    "title" : "Fiches {msg}",
    "create.new.report": "Créer une nouvelle fiche",
    "date": "Date mise à jour",
    "status": "statut",
    "radar.chart.title": "Graphique radar des critères",
    "read.help.message": "Consulter cette fiche",
    "copy.help.message": "Créer une nouvelle fiche à partir d'une copie",
    "edit.help.message": "Modifier cette fiche",
    "delete.confirm.message": "Voulez vous vraiment supprimer cette fiche? Veuillez noter que cette opération est irréversible.",
    "delete": "Suppression",
    "template.label": "Modèle"
  }
}
</i18n>
<template>
    <div class="reports">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>
    <h1 class="subheading grey--text">{{ $t('title', {'msg':$store.getters.getRepository.name } ) }}</h1>
    <v-container class="my-3">

        <template>
        <div class="text-center">

        <div v-if="userRole === 'EDITOR'" class="text-right pa-3">
            <v-btn color="primary" @click="createReport">{{ $t('create.new.report')}}</v-btn>
        </div>

        <div v-if="userRole === 'EDITOR'" class="text-right pa-3">
            <v-btn color="primary" @click="createReportTest">{{ $t('create.new.report')}} (template TEST)</v-btn>
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
         <template v-slot:item.status="{ item }">  
            <span>{{ $t(item.status) }}</span>
        </template> 
        <template v-slot:item.actions="{ item }">

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="userRole != 'READER' && !isReleased(item)" icon v-on="on" class="mx-0" @click="editItem(item)">     
                    <v-icon size="20px">fa-edit</v-icon>    
                </v-btn>
                </template>
                <span>{{ $t('edit.help.message') }}</span>
            </v-tooltip>

            <v-btn v-if="userRole === 'EDITOR' && !isReleased(item)" icon class="mx-0" @click="dialog=true;reportId=item.id">     
                <v-icon size="20px">fa-trash-alt</v-icon>    
            </v-btn>  

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="userRole === 'READER' || isReleased(item)" icon v-on="on" class="mx-0 pa-3" @click="editItem(item)">     
                    <v-icon size="20px">fa-book-open</v-icon>    
                </v-btn>
                </template>
                <span>{{ $t('read.help.message') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="userRole === 'EDITOR' && isReleased(item)" icon v-on="on" class="mx-0" @click="copyItem(item)">     
                        <v-icon size="20px">fa-copy</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('copy.help.message') }}</span>
            </v-tooltip>

        </template>   

        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length"><apexchart type=radar height=350 :options="chartOptions(item)" :series="levelList(item)" /></td>
        </template>      

        </v-data-table>

        <v-dialog
                v-model="dialog"
                width="500"
                >

            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('delete') }}
                </v-card-title>

                <v-card-text>
                {{ $t('delete.confirm.message') }}
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
                    @click="dialog = false; deleteItem()"
                >
                    {{ $t('button.confirm') }}
                </v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>

        </template>

    </v-container>
    </div>

</template>


<script>
import moment from 'moment';

export default {
    props: {
        item: null
  	},
    data() {
        return {
            reports: [],
            dialog: false,
            reportId: null,
            userRole: null,
            repositoryId: this.$route.params.id,
            headers: [
                { text: 'Version', value: 'version' },
                { text: this.$t('template.label'), value: 'templateName' },
                { text: this.$t('date'), value: 'updateDate'},
                { text: this.$t('status'), value: 'status' },
                { text: 'Actions', value: 'actions', sortable: false }
                ] ,
            myReport: null,
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
        }
    },
    computed: {
        service: function()  {
            return this.$store.getters.getService
        },
    },
    methods: {
        levelList (report) {
            var serie = {name: 'certificationReport', data: []}
            var array = [];

            for (var j = 0; j < report.items.length; j++){
                var r = report.items[j]
                if(r.level) {
                    array.push(r.level)
                } else {
                    array.push(null)
                }
            }
            serie.data = array
            return [serie];
        },
        chartOptions (report) {
            var option = {labels: null, title: {text: this.$t('radar.chart.title')}, yaxis:{max: 4, forceNiceScale: true, tickAmount: 4} }
            var array = [];
            for (var j = 0; j < report.items.length; j++){
                var r = report.items[j]
                if(r.code) {
                    array.push('R'+r.code)
                }
            }
            option.labels = array
            return option
        },
        deleteItem () {
            var self = this;
            this.axios.delete(this.service+'/certificationReport/v1_0/delete/'+this.reportId)
                .then( response =>
                    this.axios
                        .get(this.service+'/certificationReport/v1_0/listByRepositoryId/'+this.repositoryId)
                        .then(response => {
                            self.readOnly = response.data.readOnly
                            self.reports = response.data.reports
                        })
                ).catch(function(error) {self.displayError("An error has occured:" + error)})
        },
        createReport() {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: null, template: 'CTS-2020-2022'} })
        },
        createReportTest() {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: null, template: 'TEST'} })
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

                return true
            } else {
                return false
            }
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
        }
    },

    mounted: function() {
    	//console.log("-------> MyCertificationReports Monté")
    },
    
    created: function() {
      this.$i18n.locale = this.$store.getters.getLanguage;
      var self = this
      this.axios
      .get(this.service+'/certificationReport/v1_0/listByRepositoryId/'+this.$route.params.id)
      .then(response => {
        self.reports = response.data.reports
        self.userRole = response.data.userRole
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
      .finally(() => this.loading = false)
    }
} 
</script>

<style scoped>

.link-title {
	cursor: pointer
}

</style>