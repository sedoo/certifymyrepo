<template>
<span></span>
</template><script>
export default {
   name:"certifymyrepo-token-refresher",
 props: {
   service: String
 },  watch: {
 },  data() {
   return {
       timer: null
   }
 },
 computed: {
   getUser() {
     return this.$store.getters.getUser;
   }
 },
  created: function() {
  this.refreshToken()
 },  mounted: function() {
 },  destroyed: function() {
    clearInterval(this.timer)
 },
   methods: {     
    refreshToken: function(){
        if (this.getUser == null || this.getUser.token == null) {
            console.log("No JWT token found")
            return;
        }
        this.timer = setInterval(() => {
          //console.log("Service "+this.service+"/login/v1_0/refreshToken")
          //console.log("User "+JSON.stringify(this.getUser))
          //console.log("JWT Token refresh "+this.getUser.token)
          this.axios.get(this.service+"/login/v1_0/refreshToken")
            .then((response) => {
              //console.log("JWT Token refreshed: "+response.data)
              let user = Object.assign(this.getUser)
              user.token = response.data
              this.$store.commit("setUser", user);
            });
            
        }, 300000)
    }    }
}
</script>
