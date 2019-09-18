<template>
    <div class="repository">
    <h1 class="subheading grey--text">My repository</h1>

        <template>
        <v-form v-model="valid">
            <v-container>
            <v-row>
                <v-col
                cols="12"
                md="4"
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
                md="4"
                >
                <v-text-field
                    v-model="myRepository.pole"
                    :rules="nameRules"
                    :counter="20"
                    label="Department name"
                    required
                ></v-text-field>
                </v-col>

                <v-col
                cols="12"
                md="4"
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
                <v-form v-model="validOrcid" class="form-orcid">
                    <div id="secondForm" style="width=100%">
                    <v-container>
                        <v-row>
                            <v-col
                            cols="12"
                            md="4"
                            >
                            <v-text-field
                                v-model="orcId"
                                :counter="19"
                                :maxlength="19"
                                :rules="orcIdRules"
                                label="Manager orcid"
                            ></v-text-field>
                            </v-col>
                            <v-col
                            cols="12"
                            md="4"
                            >
                            <div class="information">You will be manager by default. You do not have to enter your ORCID.</div>
                            <div class="information">Add others orcid one by one if needed. Type the ORCID and press +</div>
                            <p>
                            <v-btn icon dense @click="add()" :disabled="!validOrcid">     
                                <v-icon size='20px'>fa-plus</v-icon>
                            </v-btn>
                            </p>
                            <div style="background:red" v-if="duplicateOrcIdError">
                                This ORCID has been already added
                            </div>
                            </v-col>
                        </v-row>
                    </v-container>
                    </div>
                </v-form>
            </v-row>
            <v-row>
                <v-col
                cols="12"
                md="4"
                >
                <v-card v-for="(item, index) in myRepository.managerIds" :key=index>
                    <v-row>
                        <v-col>
                            <v-card-text >
                                {{ item }}
                            </v-card-text>
                        </v-col>
                        <v-col>
                            <div class="icon-delete">
                            <v-btn icon class="mx-0" @click="myRepository.managerIds.splice(index,1)">     
                                <v-icon size='20px'>fa-trash-alt</v-icon>    
                            </v-btn>  
                            </div>
                        </v-col>
                    </v-row>
                </v-card>
                
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
            validOrcid: false,
            repositoryName: '',
            duplicateOrcIdError: false,
            department: '',
            orcId: '',
            myRepository: JSON.parse(this.$route.query.repository),
            nameRules: [
                v => !!v || 'Name is required',
                v => v.length <= 10 || 'Name must be less than 10 characters',
            ],
            orcIdRules: [
                v => /^$|(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/.test(v) || 'ORCID must be valid'
            ],
            email: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        }
    },
    
    mounted: function() {
    	console.log("Monté")
    },
    
    created: function() {
    	console.log("Créé")
    },

    methods: {
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
        this.axios({
            method: 'post',
            url: this.service+'repository/v1_0/save',
            data: this.myRepository
        }).then (
            this.goToRepositories());
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