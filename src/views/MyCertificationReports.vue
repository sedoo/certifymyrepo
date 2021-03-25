<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title" : "{msg} certification reports",
    "create.new.report": "Create a new report",
    "create.confirm.message": "Select the type of report.",
    "date": "Update date",
    "status": "status",
    "radar.chart.title": "Requirements Radar Chart",
    "read.help.message": "Read this report",
    "copy.help.message": "Create a new report from a copy",
    "edit.help.message": "Edit this report",
    "pdf.help.message": "Download the report as PDF file",
    "json.help.message": "Download the report in JSON",
    "delete.confirm.message": "Do you really want to delete this report ? This operation cannot be undone.",
    "delete": "Delete",
    "template.label": "Template"
  },
  "fr": {
    "title" : "Fiches {msg}",
    "create.new.report": "Créer une nouvelle fiche",
    "create.confirm.message": "Veuillez sélectionner le type de fiche.",
    "date": "Date mise à jour",
    "status": "statut",
    "radar.chart.title": "Graphique radar des critères",
    "read.help.message": "Consulter cette fiche",
    "copy.help.message": "Créer une nouvelle fiche à partir d'une copie",
    "edit.help.message": "Modifier cette fiche",
    "pdf.help.message": "Télécharger le rapport au format PDF",
    "json.help.message": "Télécharger le rapport au format JSON",
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
        <div v-if="creationValidationAllowed" class="text-right pa-3">
            <v-btn color="info" @click="dialogCreate = true">{{ $t('create.new.report')}}</v-btn>
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
            <template v-slot:item.actions="{ item , index}">

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="editExistingAllowed  && !isReleased(item)" icon v-on="on" class="mx-0" @click="editItem(item)">     
                   <v-icon>mdi-pencil-outline</v-icon>  
                </v-btn>
                </template>
                <span>{{ $t('edit.help.message') }}</span>
            </v-tooltip>

            <v-btn v-if="editExistingAllowed && !isReleased(item)" icon class="mx-0" @click="dialogDelete=true;reportId=item.id">     
                <v-icon>mdi-delete-forever-outline</v-icon>  
            </v-btn>  

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="!editExistingAllowed || isReleased(item)" icon v-on="on" class="mx-0 pa-3" @click="editItem(item)">     
                    <v-icon>mdi-book-open-variant</v-icon>    
                </v-btn>
                </template>
                <span>{{ $t('read.help.message') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="creationValidationAllowed && isReleased(item)" icon v-on="on" class="mx-0" @click="copyItem(item)">     
                        <v-icon>mdi-content-copy</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('copy.help.message') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" class="mx-0" @click="generateHiddenRadarChart(item, index)" :loading="isDownloadingPDF[index]">     
                        <v-icon>mdi-file-pdf-box</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('pdf.help.message') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" class="mx-0" @click="handleJSON(item, index)" :loading="isDownloadingJson[index]">     
                        <v-icon>mdi-file-document-outline</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('json.help.message') }}</span>
            </v-tooltip>

        </template>   

        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length"><apexchart type=radar height=350 :options="chartOptions(item)" :series="levelList(item)" /></td>
        </template>      

        </v-data-table>

        <div v-if="report != null" style="visibility: hidden; width: 500px;">
            <apexchart @animationEnd="handlePDF(report)" :ref="'radarchart'+report.id" type=radar height=350 :options="chartOptions(report)" :series="levelList(report)" />
        </div>

        <v-dialog
                v-model="dialogDelete"
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
                        @click="dialogDelete = false">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click="dialogDelete = false; deleteItem()">
                        {{ $t('button.confirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>

        <v-dialog
                v-model="dialogCreate"
                width="500"
                >
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('create.new.report') }}
                </v-card-title>
                <v-card-text>
                {{ $t('create.confirm.message') }}
                <v-select :items="templateNames" v-model="templateName">
                </v-select>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        color="primary"
                        text
                        @click="dialogCreate = false">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click="dialogCreate = false;createReport();">
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
import {displayError} from '../utils.js'
export default {
    props: {
        item: null
  	},
    data() {
        return {
            reports: [],
            dialogDelete: false,
            dialogCreate: false,
            reportId: null,
	        editExistingAllowed: false,
	        creationValidationAllowed: false,
            repositoryId: this.$route.params.id,
            headers: [
                { text: 'Version', value: 'version' },
                { text: this.$t('template.label'), value: 'templateName' },
                { text: this.$t('date'), value: 'updateDate'},
                { text: this.$t('status'), value: 'status' },
                { text: 'Actions', value: 'actions', sortable: false }
                ] ,
            templateNames: ['CTS-2020-2022', 'TEST'],
            templateName: 'CTS-2020-2022',
            // error and success notification vars
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
            isDownloadingPDF: [],
            isDownloadingJson: [],
            report: null,
            index: null,
        }
    },
    computed: {
        service: function()  {
            return this.$store.getters.getService
        },
    },
    methods: {

        /**
         * If the expanded-item for apexchart is closed the char image cannot be send to the rest api generating to pdf report
         * So an hidden chart is genereted with the given report
         * See: <div v-if="report != null" style="visibility: hidden; width: 500px;">
         */
        generateHiddenRadarChart(report, index) {
            this.report = report
            this.index = index
            this.isDownloadingPDF[this.index] = true
        },

        /**
         * Download data in PDF file
         */
        handlePDF(report) {
            this.report = null
            var self = this;
            this.$refs['radarchart'+report.id].chart.dataURI().then(data => {

                let arr = data.imgURI.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }
                let blob = new Blob([u8arr], {type:mime});

                let formData = new FormData();
                formData.append("radar", blob);
                
                this.axios({
                    method: 'post',
                    url: this.service+'/certificationReport/v1_0/getPDF?reportId='+ report.id +"&language="+this.$store.getters.getLanguage+"&service="+this.service,
                    responseType: 'arraybuffer',
                    data: formData,
                    headers: {'Content-Type': 'multipart/form-data'}
                }).then( function (response) {
                    let blob = new Blob([response.data], { type: "application/pdf" });
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `${self.getFileName(report)}.pdf`;
                    link.click();
                }).catch(function(error) {displayError(self, error)})
                .finally(function() {
                    self.isDownloadingPDF = []
                })

            });
        },

        isReleased: function (item) {
            if(item.status == 'RELEASED') {
                return true
            } else {
                return false
            }
        },

        /**
         * Download json data
         */
        handleJSON(report, index) {
            this.isDownloadingJson[index] = true
            var self = this;
            this.axios({
                method: 'get',
                url: this.service+'/certificationReport/v1_0/getJSON?reportId='+report.id+"&language="+this.$store.getters.getLanguage+"&service="+this.service
            }).then( function (response) {
                let blob = new Blob([JSON.stringify(response.data)], { type: "application/json" });
                let link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `${self.getFileName(report)}.json`;
                link.click();
            }).catch(function(error) {displayError(self, error)})
            .finally(function() {
            self.isDownloadingJson = []
            })
        },

        getFileName(report) {
            return this.$store.getters.getRepository.name + "_" + report.templateName + "_" + report.version
        },

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
                ).catch(function(error) {displayError(self, error)})
        },
        createReport() {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: null, template: this.templateName} })
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
        self.editExistingAllowed = response.data.editExistingAllowed
	    self.creationValidationAllowed = response.data.creationValidationAllowed
      }).catch(function(error) {displayError(self, error)})
      .finally(() => this.loading = false)
    }
} 
</script>

<style scoped>

.link-title {
	cursor: pointer
}

</style>