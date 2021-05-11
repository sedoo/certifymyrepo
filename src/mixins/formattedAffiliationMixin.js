import constantsFile from '../resources/constants.json'
export default {
    data() {
        return {
            countries: constantsFile.countries,
        }
    },

    methods: {

        formatAffiliation(affiliation) {
            let item = {};

            let dpt = ""
            if(affiliation.institute) {
                dpt = affiliation.institute + " (" + affiliation.acronym + ")";
            }
            
            if (affiliation.department) {
                dpt = dpt + " / " + affiliation.department;
            }
            item.text = dpt;
            item.value = affiliation.id;
            return item
        },

        findCountryLabelFromCode(code) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].value == code) {
                return this.countries[i].text;
                }
            }
            return code;
        }
    }

}