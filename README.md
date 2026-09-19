# FFBoxe - Photos licenciés

Le clic droit ajoute l’entrée **Télécharger la photo du licencié** au
menu contextuel des fiches :

`https://extranet.ffboxe.com/personnes/fiche/{identifiant}/infos`

La photo est enregistrée sans boîte de dialogue dans :

`Téléchargements/FFBoxe/licencie_{identifiant}.jpg`

Si un fichier du même nom existe, il est remplacé.

## Installation temporaire dans Firefox

1. Décompresser l’archive.
2. Ouvrir `about:debugging#/runtime/this-firefox`.
3. Cliquer sur **Charger un module complémentaire temporaire**.
4. Sélectionner le fichier `manifest.json`.
5. Ouvrir une fiche licencié, faire un clic droit dans la page puis choisir
   **Télécharger la photo du licencié**.

Une extension temporaire disparaît au redémarrage de Firefox. La signature et
l’installation permanente pourront être préparées après validation du
fonctionnement sur l’extranet.

## Synchronisation Google Sheet

1. Déployer le projet Apps Script comme application web.
2. Dans Firefox, ouvrir `about:addons`.
3. Ouvrir les préférences de l’extension.
4. Renseigner l’URL Apps Script terminant par `/exec` et le jeton API.
5. Cliquer sur **Enregistrer**, puis sur **Tester Apps Script**.
6. Ouvrir la popup de l’extension, puis cliquer sur
   **Traiter les demandes en attente**.

L’extension n’effectue aucune vérification automatique. Chaque clic dans la
popup envoie une seule requête `pendingJobs`, traite uniquement les demandes
retournées par cette requête, par groupes de trois photos simultanées, puis
s’arrête. Le Google Sheet n’a pas besoin de rester ouvert.

L’extension utilise uniquement la session FFBoxe déjà ouverte dans Firefox. Si
elle a expiré, il faut se reconnecter sur l’extranet puis relancer la demande.
L’extension ne stocke pas les identifiants FFBoxe et ne tente aucune connexion
automatique.

Le clic droit continue d’enregistrer uniquement en local. Il ne crée aucun
fichier Drive et ne modifie pas le Google Sheet.
