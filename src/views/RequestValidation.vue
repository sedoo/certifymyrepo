<template>
  <div class="pa-10">
    <unidoo-alert></unidoo-alert>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <div v-else class="text-center pa-10 headline">
      <p>{{ message }}</p>
    </div>
  </div>
</template>
<script>
export default {
    data() {
      return {
        loading: false,
        message: '',
      }
    },

    computed: {
      service: function()  {
        return this.$store.getters.getService
      }
    },

    created: function() {
      this.loading = true
      this.axios.get(this.service+'/repository/v1_0/validRequest/'+this.$route.params.repositoryId+"/"+this.$route.params.userId)
          .then(response => {       
              if(response && response.data) {
                this.message = this.$t('request.validation.screen.user.has.been.added')
              } else {
                this.message = this.$t('request.validation.screen.user.was.already.added')
              }
          }).catch(error => {
            // interceptor in main.js / main.production.js will intercept error 403 and will dispaly login page
                if(error && error.response && error.response.status == 412) {
                  this.$unidooAlert.showError(this.$t('request.validation.screen.user.request.has.been.revoked'))
                     self.$unidooAlert.showError()
                } else {
                    this.$unidooAlert.showError(this.$unidooAlert.formatError(this.$t('error.notification'), error))
                }
          }).finally(() => {
            this.loading = false
          })
    }
};
</script>