# Politique de confidentialité

Dernière mise à jour : 10 septembre 2026.

L’extension **FFBoxe - Télécharger la photo** est destinée à faciliter la
récupération des photos de licenciés autorisées depuis l’extranet de la
Fédération française de boxe et leur synchronisation avec un Google Sheet et un
Google Drive configurés par l’utilisateur.

## Données utilisées

L’extension peut traiter les données suivantes :

- le numéro de licence, le nom et le prénom du licencié ;
- la photo affichée sur la fiche du licencié ;
- l’URL et le jeton du Web App Google Apps Script configuré par l’utilisateur.

## Utilisation et transmission

L’extension utilise la session FFBoxe déjà ouverte dans Firefox. Elle ne demande,
ne stocke et ne transmet aucun identifiant ou mot de passe FFBoxe.

Les informations du licencié et sa photo sont transmises uniquement au Web App
Google Apps Script renseigné par l’utilisateur. Apps Script peut ensuite les
enregistrer dans le Google Drive et le Google Sheet de l’utilisateur.

L’extension ne transmet aucune donnée au développeur. Elle ne contient ni outil
d’analyse d’audience, ni publicité, ni suivi d’utilisation.

## Stockage

L’URL et le jeton du Web App Apps Script sont enregistrés localement dans le
profil Firefox avec l’API de stockage de Firefox. Ils ne sont pas chiffrés par
l’extension.

Les photos téléchargées manuellement sont enregistrées dans le dossier de
téléchargements choisi par Firefox. Les données envoyées à Google sont
conservées selon la configuration du compte Google de l’utilisateur.

## Suppression

L’utilisateur peut supprimer les paramètres locaux en effaçant les champs dans
les préférences ou en désinstallant l’extension. Les fichiers stockés sur
Google Drive doivent être supprimés depuis Google Drive ou depuis les commandes
prévues dans le Google Sheet.

## Accès limité

L’extension ne demande l’accès qu’aux domaines nécessaires à son
fonctionnement : l’extranet FFBoxe, Google Sheets, Google Apps Script et le
domaine utilisé pour les réponses Apps Script.
