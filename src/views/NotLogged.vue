<template>
<div>
    <div style="text-align:center " class="display-2 ma-3 font-weight-thin">
      <span v-html="$t('notlogged.screen.title')"></span>
    </div>
    <div style="text-align:center" class="headline">
      {{ $t('notlogged.screen.message') }}
    </div>
    <div class=box>
      <v-card flat>
        <v-card-actions>
          <v-card-action class="py-5">
            <img
              style="vertical-align:middle;"
              src="https://upload.wikimedia.org/wikipedia/fr/f/fe/Logo_Renater_2013.gif"
            />
            <v-select 
              :full-width="true"
              @click="requestcode"
              :label="$t('notlogged.screnn.renater.label.providers')"
              :items="entities"
              v-model="entity">
            </v-select>
            <v-btn @click='loginShibboleth' :disabled="code==null" color="info">{{ $t('notlogged.screnn.renater.button.login') }}</v-btn>
          </v-card-action>
        </v-card-actions>
        <v-divider></v-divider>
            <div style="text-align:center">
            {{ $t('notlogged.screen.message.alternative') }}
            </div>
            <div class="pt-5 box">
              <v-btn plain class="pa-0" @click="loginOrcid">
                <img
                  style="vertical-align:middle;"
                  src="https://orcid.org/assets/vectors/orcid.logo.svg"
                  width="180"
                  height="80"
                />
                </v-btn>
            </div>
      </v-card>
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
      requestingCode: false
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
    loginOrcid: function() {
      this.$emit("login");
    },

    loginShibboleth: function() {
      window.location = this.loginurl;
    },

    requestcode: function() {
      this.requestingCode = true;

      this.axios.get(this.root+"/shibboleth/requestcode?url=https://coso-preprod.sedoo.fr/application/?authtype=shibb").then(response => {

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
        this.entity = entities[0].value
        this.loading = false;
    })
  }
  },
  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.loadEntities();
    console.log(this.$route.query)
  },
};
</script>

<style scoped>
.box {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
<style>
.v-select__selections {
  min-width: 630px
}
</style>
