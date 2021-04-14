export default {
    data() {
        return {
            timeout: 2000,
            notifier: false,
            notifierMessage: "",
            notifierColor: "success",
        }
    },
    methods: {
        displayError(error) {
            let message = null
            if(error && error.response && error.response.data) {
                message = this.$t('error.notification') + error.response.data.message
            } else {
                 message = error
            }
            this.notifierMessage = message;
            this.notifierColor = "error";
            this.timeout = 8000;
            this.notifier = true;
        },
  
        displaySuccess(message) {
            this.notifierMessage = message;
            this.notifierColor = "success";
            this.timeout = 4000;
            this.notifier = true;
        }
    }
}