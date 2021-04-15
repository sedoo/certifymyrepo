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
            let dpt = affiliation.institute;
            if (affiliation.departement) {
            dpt = affiliation.institute + "/" + affiliation.departement;
            }
            item.institute = affiliation.institute;
            item.department = affiliation.departement;
            
            let countryName = this.findCountryLabelFromCode(affiliation.country)
            item.countryName = countryName;

            item.text =
            dpt + " (" + countryName + ")";

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