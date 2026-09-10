# Publication Mozilla Add-ons

## Canal recommandé

Choisir **On your own / Sur votre propre site** pour obtenir une extension
signée non listée. Elle n’apparaît pas dans le catalogue public AMO, mais le
fichier XPI signé peut être installé sur les différents ordinateurs.

## Fichier à envoyer

Créer une archive ZIP dont `manifest.json` se trouve à la racine. Ne pas
inclure le dossier `.git`, les fichiers IDE ou une archive déjà générée.

## Déclaration des données

Les catégories déclarées dans `manifest.json` sont :

- Authentication information ;
- Personally identifying information ;
- Website content.

Justification à fournir à Mozilla :

> The extension sends the credentials entered by the user only to the FFBoxe
> extranet to authenticate the requested session. It reads the licensee ID,
> name and photo from the authorized FFBoxe page and sends them only to the
> Google Apps Script URL configured by the user, so the image can be stored in
> the user's own Google Drive and displayed in the user's own Google Sheet. No
> data is sent to the extension developer. The extension includes no analytics,
> advertising or tracking.

## Étapes AMO

1. Ouvrir https://addons.mozilla.org/developers/addon/submit/distribution.
2. Se connecter avec un compte Mozilla.
3. Choisir la distribution non listée, **On your own**.
4. Envoyer l’archive ZIP.
5. Choisir Firefox comme plateforme.
6. Répondre aux questions sur les données avec les catégories du manifeste.
7. Indiquer que le code n’est ni minifié ni généré.
8. Télécharger le fichier XPI signé une fois la validation terminée.

## Installation sur un autre ordinateur

Ouvrir le fichier XPI signé avec Firefox, accepter l’installation, puis
renseigner dans les préférences de l’extension :

- l’URL du Web App Apps Script ;
- le jeton API ;
- le login et le mot de passe FFBoxe.

Une extension non listée ne bénéficie pas automatiquement des mises à jour
publiées dans le catalogue. Chaque nouvelle version signée devra être
réinstallée, sauf mise en place ultérieure d’un mécanisme d’auto-mise à jour.
