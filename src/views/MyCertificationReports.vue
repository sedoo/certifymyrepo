<template>
    <div class="reports">
    <unidoo-alert></unidoo-alert>
    <h1 class="subheading grey--text">{{ $t('reports.screen.title', {'msg':$store.getters.getRepository.name } ) }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-container v-else class="my-3">

        <template>
        <div class="text-center">
        <div v-if="creationValidationAllowed" class="text-right pa-3">
            <v-btn class="mr-5" color="info" @click="dialogCreate = true">{{ $t('reports.screen.create.new.report.confirmation.title')}}</v-btn>
            <v-btn color="info" @click="openCopyReport">{{ $t('reports.screen.make.copy.report.confirmation.title')}}</v-btn>
        </div>

        </div>
        </template>

        <template>
        <v-data-table
            :headers="headers"
            :items="reports"
            :sort-by="['updateDate']"
            :sort-desc="[true]"
            hide-default-footer
            class="elevation-1"
        >
 
             <template v-slot:item.templateName="{ item }">  
                <span>{{ item.templateName }}</span>
            </template> 
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
                <span>{{ $t('reports.screen.button.edit.help') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="creationValidationAllowed && !isReleased(item)" icon v-on="on" class="mx-0" @click="showDeleteReportConfirmDialog(item.id)">     
                    <v-icon>mdi-delete-forever-outline</v-icon>  
                </v-btn>  
                </template>
                <span>{{ $t('reports.screen.button.delete.help') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                <v-btn v-if="!editExistingAllowed || isReleased(item)" icon v-on="on" class="mx-0" @click="editItem(item)">     
                    <v-icon>mdi-book-open-variant</v-icon>    
                </v-btn>
                </template>
                <span>{{ $t('reports.screen.button.read.help') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="creationValidationAllowed && isReleased(item)" icon v-on="on" class="mx-0" @click="openCopyValidatedReport(item)">     
                        <v-icon>mdi-content-copy</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('reports.screen.button.copy.help') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="featureFlag" icon v-on="on" class="mx-0" @click="openDownloadPopup(item, index)">     
                        <v-icon>mdi-download</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('reports.screen.button.download.help') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-if="featureFlag" icon v-on="on" class="mx-0" @click="openRadarPopup(item, index)">     
                        <v-icon>mdi-spider-web</v-icon>    
                    </v-btn>
                </template>
                <span>{{ $t('reports.screen.button.radar.help') }}</span>
            </v-tooltip>

        </template>
        </v-data-table>

        <div v-if="report != null && downloadPDFConfirmed" style="visibility: hidden; width: 500px;">
            <apexchart @animationEnd="handlePDF(report)" :ref="'radarchart'+report.id" type=radar height=350 :options="chartOptions(report)" :series="levelList(report)" />
        </div>

        <v-dialog v-model="dialogRadar" :width="$store.getters.getDialogWidth">
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('reports.screen.table.reports.radar.chart.title') }}
                </v-card-title>
                <v-card-text>
                    <div  v-if="report != null">
                        <apexchart :ref="'radarchart'+report.id" type=radar height=350 :options="chartOptions(report)" :series="levelList(report)" />
                    </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        @click="dialogRadar = false;report = null">
                        {{ $t('button.close') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogCreate" :width="$store.getters.getDialogWidth" persistent>
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('reports.screen.create.new.report.confirmation.title') }}
                </v-card-title>
                <v-card-text class="pa-5">
                {{ $t('reports.screen.create.new.report.confirmation.message') }}
                <v-select outlined dense :items="templateIdentifierList" v-model="templateIdentifier" item-text="name" item-value="id" return-object>
                </v-select>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        @click="dialogCreate = false">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="info"
                        @click="dialogCreate = false;createReport();">
                        {{ $t('button.confirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogCopy" :width="$store.getters.getDialogWidth" persistent>
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('reports.screen.make.copy.report.confirmation.title') }}
                </v-card-title>
                <v-card-text class="pa-5">
                <v-select outlined dense :items="repositoryList" 
                    v-model="selectedRepository" @change="loadReport"
                    item-text="name" item-value="repository.id"
                    :label="$t('reports.screen.make.copy.report.select.repository.label')">
                </v-select>
                <v-select outlined dense :items="reportsList" :disabled="selectedRepository == null"
                    v-model="selectedReport" :loading="loadingReports"
                    :label="$t('reports.screen.make.copy.report.select.report.label')">
                    <template v-slot:selection="{ item }">
                        <span>{{ formatName(item) }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                        <span>{{ formatName(item) }}</span>
                    </template>
                </v-select>
                {{ $t('reports.screen.make.copy.report.information') }}
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        @click="cancelCopy">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="info"
                        :loading="isCopyingReport"
                        @click="copyItem(selectedReport)">
                        {{ $t('button.confirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

         <v-dialog v-model="dialogCopyValidatedReport" :width="$store.getters.getDialogWidth" persistent>
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('reports.screen.create.copy.report.confirmation.title') }}
                </v-card-title>
                <v-card-text class="pa-5">
                    
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        @click="cancelCopy">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="info"
                        :loading="isCopyingReport"
                        @click="copyItem(selectedReport)">
                        {{ $t('button.confirm') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDownload" :width="$store.getters.getDialogWidth" persistent>
            <v-card>
                <v-card-title
                class="headline grey lighten-2"
                primary-title
                >
                {{ $t('reports.screen.download.confirmation.title') }}
                </v-card-title>
                <v-card-text class="pt-5">
                <v-select outlined dense :items="formats" v-model="format" :label="$t('reports.screen.download.select.format') "></v-select>
                <v-checkbox v-model="downloadAttachments" :label="$t('reports.screen.download.isAttachments')"></v-checkbox>
                <v-checkbox v-model="downloadComments" :label="$t('reports.screen.download.isComments')"></v-checkbox>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <div class="flex-grow-1"></div>
                    <v-btn
                        @click="dialogDownload = false">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn
                        color="info"
                        :loading="isDownloading"
                        @click="confirmDownload">
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
            dialogCreate: false,
            dialogCopy: false,
            dialogDownload: false,
            dialogRadar: false,
            reportId: null,
	        editExistingAllowed: false,
	        creationValidationAllowed: false,
            repositoryId: this.$route.params.id,
            headers: [
                { text: this.$t('reports.screen.table.reports.column.version'), value: 'version' },
                { text: this.$t('reports.screen.table.reports.column.template'), value: 'templateName' },
                { text: this.$t('reports.screen.table.reports.column.lastupdate'), value: 'updateDate'},
                { text: this.$t('reports.screen.table.reports.column.status'), value: 'status' },
                { text: this.$t('reports.screen.table.reports.column.actions'), value: 'actions', sortable: false }
                ] ,
            templateIdentifierList: [],
            templateIdentifier: null,
            isDownloading: false,
            report: null,
            index: null,
            featureFlag: true,
            formats: ['pdf', 'json', 'xml'],
            format: null,
            downloadAttachments: false,
            downloadComments: false,
            downloadPDFConfirmed: false,
            repositoryList: [],
            selectedRepository: null,
            loadingRepositories: false,
            loadingReports: false,
            reportsList: [],
            selectedReport: null,
            loading: false,
            isCopyingReport: false,
            dialogCopyValidatedReport: false
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
         * See: <div v-if="report != null && downloadPDFConfirmed" style="visibility: hidden; width: 500px;">
         *           <apexchart @animationEnd="handlePDF(report)" ...
         */
        openDownloadPopup(report, index) {
            // open the dialog
            this.dialogDownload = true
            // prepare data
            this.report = report
            this.index = index
            // RESET form
            this.format = null
            this.downloadAttachments = false
            this.downloadComments = false
        },

        confirmDownload() {
            this.isDownloading = true
            if(this.format === 'pdf') {
                this.downloadPDFConfirmed = true
            } else {
                this.handleDownload(this.report, new Blob())
            }
        },

        openRadarPopup(report, index) {
            // open the dialog
            this.dialogRadar = true
            // prepare data
            this.report = report
            this.index = index
        },

        /**
         * Prepare radar image in blod and call handleDownload method
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
                this.handleDownload(report, new Blob([u8arr], {type:mime}))
            });
        },

        /**
         * Download data in pdf, json, xml file
         * If attachments have been requested the data is a ZIP file
         */
        handleDownload(report, blob) {
                let formData = new FormData();
                formData.append("radar", blob);
                self = this
                this.axios({
                    method: 'post',
                    url: this.service+'/certificationReport/v1_0/download?reportId='+report.id+"&language="+this.$store.getters.getLanguage+"&format="+this.format+"&attachments="+this.downloadAttachments+"&comments="+this.downloadComments,
                    responseType: 'arraybuffer',
                    data: formData,
                    headers: {'Content-Type': 'multipart/form-data'}
                }).then( function (response) {
                    let type = "application/"+self.format
                    let extension = self.format
                    if(self.downloadAttachments) {
                        type = "application/zip"
                        extension = "zip"
                    }
                    let blob = new Blob([response.data], { type: type});
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `${self.getFileName(report)}` + "." + extension;
                    link.click();
                }).catch(function(error) {
                    self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
                })
                .finally(function() {
                    self.downloadPDFConfirmed = false
                    self.isDownloading = false
                    self.dialogDownload = false
                })
        },

        isReleased: function (item) {
            if(item.status == 'RELEASED') {
                return true
            } else {
                return false
            }
        },

        getFileName(report) {
            return this.$store.getters.getRepository.name + "_" + report.templateName + "_" + report.version
        },

        levelList (report) {
            var serie = {name: 'certificationReport', data: []}
            var array = [];

            for (var j = 0; j < report.items.length; j++){
                var r = report.items[j]
                if(r.levelActive) {
                    if(r.levelCode) {
                        array.push(r.levelCode)
                    } else {
                        array.push(null)
                    }
                }
            }
            serie.data = array
            return [serie];
        },
        chartOptions (report) {
            var option = {labels: null, yaxis:{max: report.levelMaxValue, forceNiceScale: true, tickAmount: report.levelMaxValue} }
            var array = [];
            for (var j = 0; j < report.items.length; j++){
                var r = report.items[j]
                if(r.code && r.levelActive) {
                    array.push(r.code)
                }
            }
            option.labels = array
            option.subtitle = {
            text: this.$t('radarchart.legend'),
            align: 'left',
            margin: 10,
            offsetX: 6,
            offsetY: 0,
            floating: false,
            style: {
                fontSize:  '12px',
                fontWeight:  'normal',
                fontFamily:  undefined,
                color:  '#9699a2'
            },
            } 
            return option
        },
        deleteItem (reportId) {
            var self = this;
            self.isDeletingReport = true
            this.axios.delete(this.service+'/certificationReport/v1_0/delete/'+this.reportId)
                .then( response =>
                    this.axios
                        .get(this.service+'/certificationReport/v1_0/listByRepositoryId/'+this.repositoryId)
                        .then(response => {
                            self.editExistingAllowed = response.data.editExistingAllowed
	                        self.creationValidationAllowed = response.data.creationValidationAllowed
                            self.reports = response.data.reports
                        })
                ).catch(function(error) {
                    self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
                })
        },
        createReport() {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: null, template: this.templateIdentifier.id} })
        },
        editItem (item) {
            this.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: item.id } });
        }, 
        copyItem (item) {
            var self = this;
            self.isCopyingReport = true
            this.axios.get(this.service+'/certificationReport/v1_0/copy/'+item.id+'/to/'+this.repositoryId)
                .then( response =>
                    self.$router.push({path: '/myReport', query: { repositoryId: this.repositoryId, reportId: response.data.id } })
                ).catch(function(error) {
                    self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
                }).finally(() => {
                    self.dialogCopy = false
                    self.isCopyingReport = false
                })
            
        },
        formatDate (date) {
            if(date) {
                let localizedDate = moment(date).locale(this.$store.getters.getLanguage)
                return localizedDate.format('DD MMM YYYY HH:mm')
            } else {
                return ''
            }
        },

        openCopyReport() {
            this.dialogCopy = true
            this.loadingRepositories = true
            var self = this;
            this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
            .then((response) => {
                this.repositoryList = response.data
            }).catch((error) => {
                this.$unidooAlert.showError(this.formatError(this.$t('error.notification'), error))
            })
            .finally(() => this.loadingRepositories = false)
        },

        openCopyValidatedReport(item) {
            this.dialogCopyValidatedReport = true
            this.selectedReport = item
        },

        cancelCopy() {
            // copy report from another repository
            this.dialogCopy = false
            this.repositoryList = []
            // copy report from a validated report
            this.dialogCopyValidatedReport = false
            // common for both mode
            this.selectedRepository = null
        },

        loadReport() {
            this.loadingReports = true
            var self = this;
            this.axios.get(this.service+'/certificationReport/v1_0/listByRepositoryId/'+this.selectedRepository)
            .then((response) => {
                this.reportsList = response.data.reports
            }).catch((error) => {
                this.$unidooAlert.showError(this.formatError(this.$t('error.notification'), error))
            })
            .finally(() => this.loadingReports = false)
        },

        formatName(report) {
            return report.templateName + ' - v' + report.version + ' - ' + this.formatDate(report.updateDate) + ' - ' + this.$t(report.status)
        },

        showDeleteReportConfirmDialog: function (reportId) {
            this.reportId = reportId
            this.$unidooConfirmDialog.show(this.deleteItem, 
                this.$t('reports.screen.delete.report.confirmation.message'), 
                this.$t('reports.screen.delete.report.confirmation.title'),
                'headline grey lighten-2',
                this.$store.getters.getDialogWidth,
                this.$t('button.cancel'),
                this.$t('button.confirm'));
        },



    },

    mounted: function() {
    	//console.log("-------> MyCertificationReports Monté")
    },
    
    created: function() {
      window.scrollTo(0, 0);
      this.$i18n.locale = this.$store.getters.getLanguage;
      var self = this
      this.axios
      .get(this.service+'/certificationReport/v1_0/listByRepositoryId/'+this.$route.params.id)
      .then(response => {
        self.reports = response.data.reports
        self.editExistingAllowed = response.data.editExistingAllowed
	    self.creationValidationAllowed = response.data.creationValidationAllowed
      }).catch(function(error) {
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
      })
      .finally(() => this.loading = false)

      this.axios
      .get(this.service+'/certificationReport/v1_0/getTemplatesList/')
      .then(response => {
        self.templateIdentifierList = response.data
        if(response.data && response.data.length > 0) {
            self.templateIdentifier = response.data[0]
        }
      }).catch(function(error) {
        self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
      })

    }
} 
</script>

<style scoped>

.link-title {
	cursor: pointer
}

</style>