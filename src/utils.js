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