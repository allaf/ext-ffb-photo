https://script.google.com/macros/s/AKfycbw_yRZSimgKHlWh/exec?action=pendingJobs&token=f364ebe4-c2f0-426b-ac52-8723e3f56cdac0255901-cf14-4d2b-a358-141f6ad0cdf0/exec?action=pendingJobs&token=f364ebe4-c2f0-426b-ac52-8723e3f56cdac0255901-cf14-4d2b-a358-141f6ad0cdf0


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
4. Renseigner l’URL Apps Script terminant par `/exec`, le jeton API, le login
   FFB et le mot de passe.
5. Cliquer sur **Enregistrer**, puis sur **Tester Apps Script**.
6. Recharger le Google Sheet après l’installation de l’extension.

Lorsque le Google Sheet est ouvert, l’extension vérifie toutes les trois
secondes les demandes créées depuis le menu **Photos licenciés**. Elle traite
au maximum trois photos simultanément.

La session Firefox existante est utilisée en priorité. Si elle a expiré,
l’extension tente une connexion automatique avec les identifiants enregistrés
localement dans ses préférences.

Le clic droit continue d’enregistrer uniquement en local. Il ne crée aucun
fichier Drive et ne modifie pas le Google Sheet.
