# CRUSOË

## User roles


| Internal code  | French label | English label | Rights |
| :--------------- |:---------------:| :---------------: | :---------------: |
| EDITOR  		| Rédacteur     | Editor 		| Can create, update and delete a repository and all related reports. He can as well validate a report.  |
| CONTRIBUTOR 	| Contributeur	| Contributor 	| Can see a repository and update its related reports. He cannot validate them. |
| READER  		| Lecteur       | Reader 		| Can see a repository and read its related reports. However he can add comments on any criteria. |

An user can be Editor on a repository and Reader on another.


## Administrators

Administrators are initialized during application start up. They are created from an ORCID list passed to the appliaction through environment variables (SUPER_ADMIN_ORCID_LIST and ADMIN_ORCID_LIST).
If email address has been filled and set to public on their ORCID account it will be copied in the profile (If several emails are present then email set as 'primary' in orcid personnal account will be used others will be ignored). If email is not found adminitrator will have to fill it out in his CRUSÖE profil.

There are two administrator categories:
- Functional administrator
- Technical administrator

Rights are identical between functional and technical administrators. Administrators are able to update or delete any repository.

#### Add manually a functional administrator

A new person coming as functional administrator has to create a profile frist. To do so, he has to login in once with orcid or renater a profile with minimum information is created at the frist login. Then an actual administrator will be able to find him in the list of user on the 'Administration' page and give him administrator right.

#### Add an technical administrator

Currently the only way to add a technical administration is to add his ORCID in the environment variable SUPER_ADMIN_ORCID_LIST and the reboot the back-end application. Technical administrators are not visible on the list in 'Administration' page.

## Menu

The toolbar of the application gives access to 4 pages and to logout button

![Menu](menu-crusoe.png)

| Name | Functionnalities | |
| :--------------- |:---------------:|:---------------:|
| Repositories  		| Allows access to the repositories management page.  | |
| User information	| User profile and and the list of user's repositories.	| |
| Dashboard  		| List all the repositories managed. Gives a general overview in the form of 3 states (sunny, cloudy with sunny spells, rainy) on the last validated report and the last current report. | Visible only to administrators |
| Administration  		| Liste tous les utilisateurs dans un tableau filtrable par nom ou email. Permet de donner ou d'enlever des droits administrateur et de supprimer un utilisateur      | Visible only to administrators |
| Logout button  		| Used to disconnect properly from the application.      | |










