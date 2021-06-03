export default {

    methods: {
        formatError(prefix, error) {
            let message = 'An error has occured'
            if(typeof error === 'string') {
              message = error
            } else if (typeof error === 'object') {
              if(error.message) {
                message = prefix + ' ' + error.message
              } else if(error.response && error.response.data) {
                message = prefix + ' ' + error.response.data
              }
            }
            return message
        }
    }

}