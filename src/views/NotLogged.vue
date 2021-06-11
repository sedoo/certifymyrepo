<template>
<div>
    <div style="text-align:center " class="display-2 ma-3 font-weight-thin">
      <span v-html="$t('notlogged.screen.title')"></span>
    </div>
    <div class=box>
      <v-container fluid>
      <v-row>
        <v-col cols="12">
         <p class="text-center">
          {{ $t('notlogged.screen.message') }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="8" md="3" offset-md="2" offset="2">
          <v-form v-model="validRenater">
            <v-card height="100%" elevation="2" class="card-outter">
              <v-card-title>
                  <img
                    style="vertical-align:middle;"
                    src="https://upload.wikimedia.org/wikipedia/fr/f/fe/Logo_Renater_2013.gif"
                  />
              </v-card-title>
              <v-card-text class="py-0">
                <v-progress-linear indeterminate v-if="loading" class="my-5"></v-progress-linear>
                  <v-autocomplete v-else
                    auto-select-first
                    class="required"
                    item-text="text"
                    item-value="value"
                    :rules="entityRules"
                    @change="requestcode"
                    outlined dense
                    :label="$t('notlogged.screen.renater.label.providers')"
                    :items="entities"
                    v-model="entity">
                  </v-autocomplete>
              </v-card-text>
              <v-card-text class="pt-0">
                {{ $t('notlogged.screen.renater.help.message')}}
              </v-card-text>
              <v-card-actions class="card-actions">
                <v-btn @click='loginShibboleth' :disabled="!validRenater" color="info">{{ $t('notlogged.screen.button.login') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-col>
        <v-col cols="8" md="3" offset-md="2" offset="2">
      <v-card height="100%" elevation="2" class="card-outter">
        <v-card-title class="pt-10">
          <img
              style="vertical-align:middle;"
              src="https://orcid.org/assets/vectors/orcid.logo.svg"
            />
        </v-card-title>
         <v-card-actions class="card-actions">
            <v-btn color="info" @click="loginOrcid">
              {{ $t('notlogged.screen.button.login') }}
              </v-btn>
         </v-card-actions>
      </v-card>
        </v-col>
      </v-row>
      </v-container>
    </div>
</div>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      entities: [],
      entity: null,
      root : "https://services-coso-preprod.sedoo.fr",
      code: null,
      requestingCode: false,
      validRenater: false,
      entityRules: [v => !!v || this.$t('notlogged.screen.renater.provider.error')],
    }
  },
  computed: {
    loginurl() {
      return this.root+"/Shibboleth.sso/Login?SAMLDS=1&target="+this.root+"/shibboleth/login?code="+this.code+"&entityID="+this.entity;
    },
    service: function()  {
      return this.$store.getters.getService
    },
  },

  methods: {
    test: function(message) {
      console.log(message)
    },
    loginOrcid: function() {
      this.$emit("login");
    },

    loginShibboleth: function() {
      window.location = this.loginurl;
    },

    requestcode: function() {
      this.requestingCode = true;
      this.axios.get(this.root+"/shibboleth/requestcode?url="+ window.location.origin + window.location.pathname +"?authtype=shibb").then(response => {
      this.code = response.data
      if(this.code) {
        this.requestingCode = false;
      }
    })
    },

    loadEntities: function () {
      this.loading = true;
      this.axios.get(this.service+"/login/v1_0/DiscoFeed").then(response => {
        let entities = []

        for (let i=0; i <response.data.length; i++) {
          let aux = response.data[i];
          let entity = {};
          entity.value = aux.entityID;
          entity.text = aux.DisplayNames[0].value
          entities.push(entity)
        }

        entities.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))

        this.entities = entities;
        this.entity = null
        this.loading = false;
    })
  }
  },
  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.loadEntities();
    this.requestcode()
  },
};
</script>

<style scoped>
.bppox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-outter {
  position: relative;
  padding-bottom: 50px;
}
.card-actions {
  position: absolute;
  bottom: 10px;
  left: 8px;
}
</style>
<style>
.required label::after {
  content: " *";
  color: red;
}
</style>
