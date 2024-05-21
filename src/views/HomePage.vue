<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <v-card flat>
          <v-card-title class="justify-center">
            <div class="display-2 ma-3 font-weight-thin">
              Bienvenue sur
              <span class="text-uppercase"
                ><span class="font-weight-regular">CRUSOE</span></span>
            </div>
          </v-card-title>
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {

  created: function() {
    console.log("created"+this.$keycloak.authenticated)
  }

};
</script>
