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
                    v-model="repositoryName"
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
                    v-model="department"
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
                    v-model="email"
                    :rules="emailRules"
                    label="E-mail"
                    required
                ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                cols="12"
                md="4"
                >
                <v-text-field
                    v-model="orcId"
                    :counter="19"
                    label="Manager orcid"
                    required
                ></v-text-field>
                </v-col>
                 <v-col
                cols="12"
                md="4"
                >
                <span>You will be manager by default. Add others orcid if needed.</span>
                <p>
                <v-btn icon dense @click="add()">     
                    <v-icon size='20px'>fa-plus</v-icon>
                </v-btn>
                </p>
                <div style="background:red" v-if="orcIdError">
                    ORCID not valid
                </div>
                </v-col>
            </v-row>
            <v-row>
                <ul id="orcid-list">
                <li v-for="(item, index) in orcIdList" :key=index>
                    {{ item }}
                </li>
                </ul>
             </v-row>
            </v-container>

            <div class="text-right save-button">
                     <v-btn text
                        color="primary"
                        @click="goToMainPage"
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
            repositoryName: '',
            orcIdError: false,
            department: '',
            orcId: '',
            orcIdList: [],
            myRepository: {},
            nameRules: [
                v => !!v || 'Name is required',
                v => v.length <= 10 || 'Name must be less than 10 characters',
            ],
            orcIdRules: [
                v => /(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/.test(v) || 'ORCID must be valid'
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
            const regex = /(\d{4,4}[-]\d{4,4}[-]\d{4,4}[-]\d{4,4})/
            const matches = regex.exec(this.orcId);
            if(matches) {
                if(!this.orcIdList.includes(this.orcId)) {
                    this.orcIdList.push(this.orcId)
                    this.orcId = ''
                    this.orcIdError = false
                } else {
                    this.orcId = ''
                }
            } else {
                this.orcIdError = true
            }
        },
      goToMainPage() {
        this.$router.push({ path: '/'});
      },
      goToRepositories() {
        this.$router.push({ path: '/repositories'});
      },
      save () {
        console.log('methode save')
        console.log(this.service)
        this.myRepository.name = this.repositoryName
        this.myRepository.pole = this.department
        this.myRepository.managerIds = this.orcIdList
        this.myRepository.contact = this.email
        console.log(JSON.stringify(this.myRepository));
        this.axios({
            method: 'post',
            url: this.service+'repository/v1_0/save',
            data: this.myRepository
        })
        this.goToRepositories();
      }
    }
} 
</script>