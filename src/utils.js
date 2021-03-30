function logOut (store) { 
    const jsonp = require('jsonp');
    jsonp('https://orcid.org/userStatus.json?logUserOut=true', null, (err, data) => {
        if (err) {
        console.error(err.message);
        } else {
        store.commit('setUser', null)
        store.commit('setLogged', false)
        }
    })
}
export {logOut}

function displayError (self, error) { 
    let message = null
    if(error && error.response && error.response.data) {
        message = self.$t('error.notification') + error.response.data.message
    } else {
         message = error
    }
    self.notifierMessage =  message
    self.notifierColor = "error";
    self.timeout = 8000;
    self.notifier = true;
}
export {displayError}

function displaySuccess (self, message) { 
    self.notifierMessage = message;
    self.notifierColor = "success";
    self.timeout = 4000;
    self.notifier = true;
}
export {displaySuccess}