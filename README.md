# CRUSOË

# Table of Contents

1. [Architecture](#1-architecture)
2. [Access management](#2-access-management)   
    - 2.1 [User roles](#2.1-user-roles)
    - 2.2 [Administrators](#2.2-administrators)
    - 2.3 [Add manually a functional administrator](#2.3-add-manually-a-functional-administrator)
    - 2.4 [Add a technical administrator](#2.3-add-a-technical-administrator)
    - 2.5 [Application toolbar](#2.5-application-toolbar)
3. [Notifications](#3-notifications)   
4. [Report template](#4-report-template)   
5. [Packing and deployement](#5-packing-and-deployement)

## 1 Architecture

### Front-end
- The font-end part is developed with Vue.js javascript technology. It permits
  - The implementation of applications with dynamic and reactive interfaces
  - The provision of ergonomics similar to that of usual web applications (eg: Gmail, ...) using Vuetify library.
  - Integration into any web ecosystem (static web page, page generated by a CMS, ...)
- Communication with the back part is ensured through REST calls possibly secured using JWT tokens
- Source code is avalaible at https://github.com/sedoo/certifymyrepo

### Back-end
- An authenticated REST-type API is implemented to expose the various elements in JSON format. This API is based on Java / Spring boot technology which allows
  -  The creation of a simple and scalable code
  -  Distribution in the form of a Docker container.
- Persistence is ensured by a MongoDb database for reports and by a file tree for attachments
- Source code is avalaible at https://github.com/sedoo/certifymyrepo-back

Authentication is not managed by the software itself but is delegated to the Renater and Orcid mechanisms.

## 2 Access management

### 2.1 User roles


| Internal code  | French label | English label | Rights |
| :--------------- |:---------------:| :---------------: | :---------------: |
| EDITOR  		| Rédacteur     | Editor 		| Can create, edit and delete a repository and all related reports. He can as well validate a report.  |
| CONTRIBUTOR 	| Contributeur	| Contributor 	| Can see the repository and edit its related reports. He cannot validate them. |
| READER  		| Lecteur       | Reader 		| Can see the repository and read its related reports. However he can add comments on any criteria. |

An user can be Editor on a repository and Reader on another.


### 2.2 Administrators

Administrators are initialized during application start up. They are created from an ORCID list passed to the appliaction through environment variables (SUPER_ADMIN_ORCID_LIST and ADMIN_ORCID_LIST).
If email address has been filled and set to public on their ORCID account it will be copied in the profile (If several emails are present then email set as 'primary' in orcid personnal account will be used others will be ignored). If email is not found adminitrator will have to fill it out in his CRUSÖE profil.

There are two administrator categories:
- Functional administrator
- Technical administrator

Rights are identical between functional and technical administrators. Administrators are able to update or delete any repository.

##### 2.3 Add manually a functional administrator

A new person coming as functional administrator has to create a profile frist. To do so, he has to login in once with orcid or renater a profile with minimum information is created at the frist login. Then an actual administrator will be able to find him in the list of user on the 'Administration' page and give him administrator right.

##### 2.4 Add a technical administrator

Currently the only way to add a technical administration is to add his ORCID in the environment variable SUPER_ADMIN_ORCID_LIST and the reboot the back-end application. Technical administrators are not visible on the list in 'Administration' page.

### 2.5 Application toolbar

The toolbar of the application gives access to 4 pages and to logout button

![Menu](menu-crusoe.png)

| Name | Functionnalities | |
| :--------------- |:---------------:|:---------------:|
| Repositories  		| Allows access to the repositories management page.  | |
| User information	| User profile and and the list of user's repositories.	| |
| Dashboard  		| List all the repositories managed. Gives a general overview in the form of 3 states (sunny, cloudy with sunny spells, rainy) on the last validated report and the last current report. | Visible only to administrators |
| Administration  		| Liste tous les utilisateurs dans un tableau filtrable par nom ou email. Permet de donner ou d'enlever des droits administrateur et de supprimer un utilisateur      | Visible only to administrators |
| Logout button  		| Used to disconnect properly from the application.      | |


## 7 Notifications

| Case  | Recipients |
| :--------------- | :--------------- |
| Create a new user profile while adding an user on a repository	| An Editor can add users on a repository. An user can be created in the system if he does not exist. If the email has been filled in (not madatory if add from an ORCID) the user will get a notification. |
| Add an user on a repository	| An Editor can add users on a repository. The users will receive a notification. |
| Remove an user from a repository	| An Editor can remove users on a repository. The users will receive a notification. |
| Save a report with a new version	| Notify all repository users  |
| Validate a report	| Notify all repository users  |
| Add a comment on a requirement	| Notify all repository users  |
| No action on the report after 2 months | Notify all repository users  |

## 4 Report template

Certification reports are based on JSON template. The list of existing template is [Report template](https://github.com/sedoo/certifymyrepo-back/tree/main/src/main/resources/certificationReportTemplate)

To create a new template to have create a new JSON file base on the same model and the same locale. The front call the endpoint ``/certificationReport/v1_0/getTemplatesList`` to display the list of existing template.

Example:
````JSON
{
	"name": "CTS-2020-2022",
	"description": {"en": "CoreTrustSeal Trustworthy Data Repositories Requirements 2020–2022", 
	                "fr": "Exigences CoreTrustSeal 2020-2022 relatives aux référentiels de données"},              
    "levels":  [
            {"code": 0, "label": {"en": "0 - Not applicable", "fr": "0 ‐ Sans objet"}},
            {"code": 1, "label": {"en": "1 - The repository has not considered this yet", "fr": "1 ‐ L’entrepôt n'en a pas encore tenu compte"}},
            {"code": 2, "label": {"en": "2 - The repository has a theoretical concept", "fr": "2 - L’entrepôt maîtrise le concept de façon théorique"}},
            {"code": 3, "label": {"en": "3 - The repository is in the implementation phase ", "fr": "3 - L’entrepôt est en phase d’implémentation"}},
            {"code": 4, "label": {"en": "4 - The guideline has been fully implemented in the repository", "fr": "4 - La spécification a été entièrement implémentée"}}
        ],
    "requirements" : [ 
    {
        "code" : "R0",
        "requirement": {"en": "R0. Please provide context for your repository.", 
                        "fr": "R0. Veuillez fournir les éléments de contexte de votre entrepôt."},
        "levelActive" : false,
        "response": {"en": "– Repository Type. Select all relevant types from:\n● Domain or subject-based repository\n● Institutional repository\n● National repository system, including governmental\n● Publication repository\n● Library\n● Museum\n● Archive\n● Research project repository\n● Other (Please describe)\n– Brief Description of Repository\n\n– Brief Description of the Designated Community\n\n– Level of Curation Performed. Select all relevant types from:\nA. Content distributed as deposited\nB. Basic curation – e.g., brief checking, addition of basic metadata or documentation\nC. Enhanced curation – e.g., conversion to new formats, enhancement of documentation \nD. Data-level curation – as in C above, but with additional editing of deposited data for accuracy\n\nComments\n\n– Insource/Outsource Partners. If applicable, please list them.\n\n– Summary of Significant Changes Since Last Application (if applicable)\n\n– Other Relevant Information\n\n", 
                     "fr": "– Type d’entrepôt. Sélectionnez tous les types pertinents :\n● Entrepôt disciplinaire ou thématique\n● Entrepôt institutionnel\n● Système national d'archivage, y compris les archives gouvernementales\n● Dépôt de publicationons\n● Bibliothèque\n● Musée\n● Archives\n● Entrepôt de projet de recherche\n● Autre (précisez)\n\n– Brève description de l’entrepôt de données\n\n– Brève description de la communauté cible concernée\n\n– Niveau de curation. Sélectionnez tous les types pertinents :\nA. Contenu mis en accès tel que déposé\nB. Curation de base – p. ex. vérification rapide, ajout de métadonnées de base ou de documentation\nC. Curation avancée – p. ex. conversion vers de nouveaux formats, mélioration de la qualité de la documentation\nD. Curation au niveau des données ? comme dans C ci?dessus, mais avec une édition supplémentaire des données déposées pour améliorer l’exactitude\n\nCommentaires\n\n– Partenaires internes et sous-traitants. S'il y a lieu, veuillez les énumérer.\n\n– Résumé des changements significatifs depuis la dernière soumission (s'il y a lieu)\n\n– Autres renseignements pertinents\n\n"}
    },
    {
        "code" : "R1",
        "requirement": {"en": "R1. The repository has an explicit mission to provide access to and preserve data in its domain.",
                        "fr": "R1. L’entrepôt de données a pour mission explicite de donner accès à des données dans son domaine et de les préserver"},
        "levelActive" : true
    }]
 }
````

## 5 Packing and deployement

### Front-end

The front-end part will be packaged in the form of a javascript file (.js). This file will be available thought a cdn url.

Project setup
```
npm install
```

Compiles and hot-reloads for development
```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

### Back-end

The back-end part will be packaged in two forms
 - a Java / Spring boot application (.jar)
 - a Docker container

Deployment informations are available on on [certifymyrepo-back repository readme](https://github.com/sedoo/certifymyrepo-back/blob/main/readme.md)












