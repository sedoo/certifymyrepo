# CRUSOË

## Rôles d'un utilisateur sur un entrepôt


| Code interne à l'application  | Libellé français | Libellé anglais | Droits |
| :--------------- |:---------------:| :---------------: | :---------------: |
| EDITOR  		| Rédacteur     | Editor 		| Peut créer, modifier, supprimer un entrepôt et les fiches qu'il contient |
| CONTRIBUTOR 	| Contributeur	| Contributor 	| Peut éditer des fiches sur un  entrepôts |
| READER  		| Lecteur       | Reader 		| Peut lire les fiches mais pas les modifier. Il peut cependant ajouter des commentaires sur les critères |

Un utilisateur peut être Rédacteur sur un entrepôt et Lecteur sur un autre.


## Administrateurs

Des administrateurs sont créés par défaut au déramarrage de l'application. Ces personnes peuvent ensuite donner des droits administrateurs via l'écran administration de l'application.

Ces administrateurs par défaut sont créés via une liste d'ORCID passée à l'application en variable d'environement.
S'ils ont renseignés une adresse email publique dans leur compte ORCID celle si sera importé. Si elle n'est pas trouvé, l'adresse email devra être renseignée dans l'application lors de la première connexion.

Il y a deux catégories d'administrateur:
- Administrateur fonctionel
- Administrateur technique

Les droits sont identiques, les administrateurs peuvent modifier/supprimer tous les entrepôts sans avoir besoin de droits spécifique sur ces entrepôts.

#### Ajout manuel d'un administrateur fonctionnel
Pour ajouter un nouvel administrateur fonctionnel, la personne à ajouter doit déjà avoir un profile créé en base de données. Pour se faire il suffit de se connecter au moins une fois à l'application, soit par orcid soit par renater.

La barre de menu contient un icône "Administration" permettant d'accèder à un écran listant tous les utilisateurs.
La colonne action permet de donner ou retirer les droits administrateur.







