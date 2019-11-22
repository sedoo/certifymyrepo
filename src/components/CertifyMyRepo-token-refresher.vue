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
    console.log('certifymyrepo-token-refresher created')
    this.refreshToken()
 },  

  destroyed: function() {
    console.log('certifymyrepo-token-refresher DESTROYED')
    clearInterval(this.timer)
 },
   methods: {     
    refreshToken: function(){
        this.timer = setInterval(() => {
          if (this.getUser == null || this.getUser.token == null) {
            console.log("No JWT token found")
          } else {
            console.log("Refresh JWT token")
            this.axios.get(this.service+"/login/v1_0/refreshToken")
              .then((response) => {
                let user = Object.assign(this.getUser)
                user.token = response.data
                this.$store.commit("setUser", user);
              });
            } 
        }, 900000) // 15 minutes
    }    }
}
</script>
