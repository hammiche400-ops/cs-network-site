# Site de CS Network

Le site est **fabriqué automatiquement** à partir d'un seul fichier de contenu : **`data.js`**.
Vous n'avez jamais à écrire de HTML. Vous modifiez `data.js`, vous lancez une commande, et les pages se régénèrent.

Chaque campus et chaque pôle a sa propre adresse, courte et stable :

```
.../rennes/                 → le campus de Rennes et ses pôles
.../rennes/conferences/     → le pôle Conférences  (c'est l'adresse des QR codes)
```

---

## 1. À faire une seule fois : installer Node

Ouvrez l'application **Terminal** et collez cette ligne :

```bash
brew install node
```

C'est tout. Vous n'aurez plus jamais à le refaire, et il n'y a **aucune autre installation** : le site ne dépend d'aucune bibliothèque extérieure.

Ensuite, dans le Terminal, placez-vous dans le dossier du site — à faire à chaque nouvelle fenêtre de Terminal :

```bash
cd ~/cs-network-site
```

---

## 2. Modifier un responsable, un email, un pôle

Ouvrez **`data.js`** avec n'importe quel éditeur de texte. Vous y trouverez un bloc par pôle, qui ressemble à ceci :

```js
{ id: 'conferences',
  name: 'Conférences',
  tagline: "Des anciens et des professionnels interviennent sur le campus toute l'année.",
  desc: "Des anciens et des professionnels interviennent… nous nous occupons du reste.",
  email: 'conferences.rennes@csnetwork.fr',
  linkedin: 'https://www.linkedin.com/',
  leads: [{ name: 'Maxime [Nom]', photo: '' }] },
```

| Ce que vous voulez changer | Le champ à modifier |
|---|---|
| Le nom du responsable | `name` dans `leads` |
| Ajouter un deuxième responsable | `leads: [{ name: 'Maxime Durand', photo: '' }, { name: 'Clara Petit', photo: '' }]` — la page passe toute seule au pluriel |
| Mettre une photo | déposez l'image dans `assets/`, puis `photo: 'assets/maxime.jpg'` — laissez `''` pour afficher l'initiale |
| L'adresse email du pôle | `email` |
| Le lien LinkedIn | `linkedin` |
| La phrase courte sur la carte du pôle | `tagline` |
| Le texte de présentation du pôle | `desc` |
| Le nom affiché du pôle | `name` |

### Trois règles à respecter

1. **Gardez les guillemets** autour des textes, et la **virgule** à la fin de chaque ligne.
   Si un texte contient une apostrophe (`l'année`), entourez-le de guillemets doubles `"…"`.
2. **Ne changez jamais un `id`** (`id: 'conferences'`) : c'est lui qui forme l'adresse de la page
   (`/rennes/conferences/`). Le modifier casserait tous les QR codes déjà imprimés.
3. **Ne touchez pas à `styles.css`** : c'est le design, il est figé.

### Ajouter un pôle

Copiez un bloc de pôle existant, collez-le juste après, et changez `id`, `name`, `tagline`, `desc`, `email` et `leads`.
Donnez-lui un `id` court, en minuscules, sans accent ni espace (`mentorat`, `forum-entreprises`).

---

## 3. Publier un campus

Chaque campus a un interrupteur, en haut de son bloc dans `data.js` :

```js
rennes: { name: 'Rennes', published: true,  … }
metz:   { name: 'Metz',   published: false, … }
```

- `published: true` → le campus est **en ligne** : il a ses pages, il apparaît dans le menu, il a ses QR codes.
- `published: false` → le campus est **masqué**. Il apparaît seulement sur l'accueil sous la mention « Bientôt », sur une carte non cliquable. Aucune page n'est générée, aucun QR code non plus.

Aujourd'hui, seul **Rennes** est publié. Metz et Paris-Saclay contiennent encore des données d'exemple.

**Pour publier Metz** : passez son `published` à `true`, vérifiez que ses pôles et ses responsables sont les bons, puis suivez les étapes 4, 5 et 6.

---

## 4. Vérifier le résultat sur votre ordinateur

```bash
npm start
```

Le Terminal affiche une adresse, par exemple :

```
  Site disponible sur  http://localhost:8080/cs-network-site/
```

Ouvrez-la dans votre navigateur. Vous voyez **exactement** ce qui sera mis en ligne : mêmes adresses, même page 404.
Pour arrêter, revenez au Terminal et appuyez sur **Ctrl + C**.

Après chaque modification de `data.js`, arrêtez (Ctrl + C) et relancez `npm start`.

---

## 5. Mettre en ligne

```bash
git add .
git commit -m "Mise à jour des responsables de Rennes"
git push
```

C'est tout : la mise en ligne est automatique. Comptez **une à deux minutes** avant que le site public soit à jour.
Vous pouvez suivre l'avancement sur GitHub, onglet **Actions**. Une coche verte = c'est en ligne.

> **La première fois seulement** : sur GitHub, allez dans **Settings → Pages**, et choisissez **Source : GitHub Actions**.
> Indiquez aussi l'adresse publique du site dans le fichier **`site.config.json`** — elle sert à fabriquer les QR codes.

---

## 6. Les QR codes

### Où les trouver

Dans le dossier **`qrcodes/`**. Un fichier par page publiée, en deux formats :

| Fichier | Pour quoi faire |
|---|---|
| `rennes-conferences.png` | affiches, diapositives, réseaux sociaux (image de 1000 pixels) |
| `rennes-conferences.svg` | **à donner à un imprimeur** : image vectorielle, nette à n'importe quelle taille |
| `rennes.png` / `rennes.svg` | la page du campus, qui liste tous les pôles |
| `liste.txt` | la liste de tous les QR codes et de l'adresse vers laquelle chacun pointe |

Les QR codes sont en bordeaux foncé sur fond blanc, avec le niveau de correction d'erreur le plus élevé : ils restent lisibles même un peu abîmés, pliés ou partiellement masqués.

### Les régénérer

```bash
npm run qr
```

À faire **uniquement** si vous avez ajouté un pôle, publié un campus, ou changé l'adresse du site dans `site.config.json`.
Puis mettez-les en ligne comme à l'étape 5 (`git add .`, `git commit`, `git push`).

> Changer le nom d'un responsable ou un email **ne change pas** les QR codes : ils pointent vers une page, pas vers une personne. Inutile de les réimprimer.

### Avant d'imprimer

Scannez toujours le QR code avec votre téléphone depuis l'écran : vous devez arriver sur la bonne page.
Taille minimale conseillée sur une affiche : **3 cm de côté**. Laissez la marge blanche autour, elle fait partie du code.

---

## 7. Si quelque chose ne marche pas

Quand une commande échoue, le Terminal affiche un message en français qui dit **quel campus ou quel pôle** pose problème. Les cas les plus fréquents :

| Message | Ce qu'il faut faire |
|---|---|
| « data.js n'est pas un fichier JavaScript valide » | Une virgule, une accolade ou un guillemet manque. Regardez la dernière ligne que vous avez modifiée. |
| « le champ « email » est vide ou manquant » | Le champ indiqué a été effacé. Remettez une valeur entre guillemets. |
| « ajoutez « published: true » ou « published: false » » | Un campus a été ajouté sans son interrupteur de publication. |
| « deux pôles portent l'identifiant … » | Vous avez copié un pôle sans changer son `id`. |
| « campus absent(s) de « order » » | Un campus a été ajouté à `campuses` mais pas à la liste `order`, en haut du fichier. |

Tant que le message d'erreur s'affiche, **le site en ligne n'est pas modifié** : il reste tel qu'il était. Vous ne pouvez rien casser en ligne depuis votre ordinateur.

En dernier recours, pour revenir à la dernière version qui fonctionnait :

```bash
git checkout data.js
```

---

## 8. Les fichiers du projet

| Fichier ou dossier | À quoi ça sert | Vous pouvez y toucher ? |
|---|---|---|
| `data.js` | **Tout le contenu** : campus, pôles, responsables, emails | **Oui**, c'est le fichier à modifier |
| `site.config.json` | L'adresse publique du site | Oui, une seule ligne |
| `assets/` | Le logo et les photos | Oui, pour ajouter des photos |
| `qrcodes/` | Les QR codes générés | Généré — à récupérer, pas à modifier |
| `styles.css` | Le design (couleurs, polices, mise en page) | **Non**, design figé |
| `templates/` | La structure des pages | Non |
| `build/` | Les scripts qui fabriquent le site | Non |
| `dist/` | Le site fabriqué | Non, il est refait à chaque fois |
| `HANDOFF.md` | La documentation du design, pour un développeur | Non |

---

## Aide-mémoire

| Commande | Ce qu'elle fait |
|---|---|
| `cd ~/cs-network-site` | se placer dans le dossier du site |
| `npm start` | fabriquer le site et l'ouvrir sur votre ordinateur |
| `npm run qr` | régénérer les QR codes |
| `git add . && git commit -m "…" && git push` | mettre en ligne |
