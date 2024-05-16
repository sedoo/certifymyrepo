<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="8">
        <v-card flat>
          <v-card-title class="justify-center">
            <div class="display-2 ma-3 font-weight-thin">
              Au revoir
            </div>
          </v-card-title>
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {

   mounted: function() {
    console.log("mounted")
    this.$store.dispatch("userSignOut")
    this.keycloak.logout();
    window.location = this.$store.getters.getFrontEndUrl;
    return
   }

};
</script>
