<template>
    <div class="repository">
    <h1 class="subheading grey--text">My repository</h1>

        <template>
        <v-form v-model="valid">
            <v-container>
            <v-row>
                <v-col
                cols="12"
                md="6"
                >
                <v-text-field
                    v-model="myRepository.name"
                    :rules="nameRules"
                    :counter="20"
                    label="Repository name"
                    required
                ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-text-field
                        v-model="myRepository.pole"
                        :rules="nameRules"
                        :counter="20"
                        label="Department name"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-text-field
                        v-model="myRepository.contact"
                        :rules="emailRules"
                        label="E-mail"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="6"
                    >
                    <v-combobox multiple
                                v-model="orcIdList" 
                                label="Repository managers ORCID"
                                chips
                                deletable-chips
                                :search-input.sync="search" 
                                :rules="orcIdRules"
                                >
                    </v-combobox>
                    <span class="font-italic font-weight-thin">You can add as many managers as you want. You will be manager by default. Your ORCID will be automatically added.</span>
                </v-col>
            </v-row>
            </v-container>
            <div class="text-right save-button">
                     <v-btn text
                        color="primary"
                        @click="goToRepositories"
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

        </v-form>
        </template>
    </div>
</template>


<script>

export default {
    props: {
    	service: null
  	},
    data() {
        return {
            valid: false,
            search: null,
            repositoryName: '',
            duplicateOrcIdError: false,
            department: '',
            orcIdList: [],
            orcidNotValid: '',
            myRepository: JSON.parse(this.$route.query.repository),
            nameRules: [
                v => !!v || 'Name is required',
                v => v.length <= 20 || 'Name must be less than 20 characters',
            ],
            orcIdRules: [
                v => this.orcidvalidation(v) || 'ORCID must be valid ['+this.orcidNotValid+']'
            ],
            email: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        }
    },
    
    mounted: function() {
    	//console.log("Monté")
    },
    
    created: function() {
    	//console.log("Créé")
    },

    methods: {
        orcidvalidation(v) {
            var result = true
            this.orcidNotValid = ''
            var regex = RegExp(/^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/)
            for(var index in v) {       
                if(!regex.test(v[index])){
                    this.orcidNotValid = this.orcidNotValid + v[index]
                    result = false
                } else if(v[index].length != 19) {
                    this.orcidNotValid = this.orcidNotValid + v[index]
                    result = false
                }
            }
            return result
        },           
        add () {
            if(this.orcId != null && this.orcId.length > 0) {
                if(!this.myRepository.managerIds.includes(this.orcId)) {
                        this.myRepository.managerIds.push(this.orcId)
                        this.orcId = ''
                        this.duplicateOrcIdError = false
                } else {
                    this.duplicateOrcIdError = true
                }
            }
        },
      goToRepositories() {
        this.$router.push({ path: '/repositories'});
      },
      save () {
        console.log('methode save')
        console.log(this.service)
       /* this.myRepository.name = this.repositoryName
        this.myRepository.pole = this.department
        this.myRepository.managerIds = this.orcIdList
        this.myRepository.contact = this.email*/
        console.log(JSON.stringify(this.myRepository));
        var self = this;
        this.axios({
            method: 'post',
            url: this.service+'repository/v1_0/save',
            data: this.myRepository
        }).then ( function () {
            self.goToRepositories()
        });
      }
    }
} 
</script>

<style scoped>

.information {
	color: grey;
    font-style: italic;
    font-size: small;
}

.icon-delete {
  position: absolute;
  right: 0;
}

.form-orcid  {
   width: 100% 
}

</style>