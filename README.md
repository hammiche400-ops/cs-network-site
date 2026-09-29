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

## 2. Modifier une personne, un pôle, une équipe

Ouvrez **`data.js`** avec n'importe quel éditeur de texte. Il contient trois parties : **`people`** (les personnes), **`campuses`** (les campus, leurs pôles et leur équipe) et **`hackathon`** (la section Hackathon de l'accueil).

### Changer le nom, l'email, le LinkedIn ou la photo de quelqu'un

**Une personne n'est écrite qu'une seule fois**, dans `people`, même si elle apparaît à plusieurs endroits du site :

```js
people: {
  'marius-blanchet': { name: 'Marius Blanchet', email: 'marius.blanchet@student-cs.fr', linkedin: 'https://www.linkedin.com/in/marius-blanchet-b76481388', photo: '' },
}
```

Vous corrigez ici, et la correction apparaît partout : sa carte de président, sa carte de co-responsable du Podcast, les boutons de la page Podcast. **Ne cherchez pas ailleurs.**

| Ce que vous voulez changer | Où |
|---|---|
| Nom affiché, email, lien LinkedIn | le champ correspondant dans `people` |
| Mettre une photo | déposez l'image dans `assets/`, puis `photo: 'assets/marius.jpg'` — laissez `''` pour afficher l'initiale |
| Ajouter une personne | copiez une ligne de `people`, donnez-lui un identifiant court en minuscules sans accent (`jeanne-martin`) |

Le texte à gauche des deux-points (`'marius-blanchet'`) est son **identifiant**. C'est lui qu'on écrit partout ailleurs pour la désigner. Ne le changez pas sans changer aussi tous les endroits qui l'utilisent — sinon le site refuse de se construire et vous dit lesquels.

### Changer le responsable d'un pôle

Dans le pôle, `leads` liste des identifiants de `people` :

```js
{ id: 'podcast', published: true, name: 'Podcast', tagline: "…", desc: "…",
  leads: ['lili-mei-law-dune', 'marius-blanchet'] },
```

- Un seul identifiant → « Responsable ». Deux → « Co-responsables », chacun avec sa carte et ses liens.
- **Le premier de la liste** reçoit les gros boutons Email et LinkedIn en haut de la page du pôle.
- `tagline` est la phrase courte sur la carte, `desc` le texte de présentation.

### Masquer un pôle

Un pôle sans responsable ne doit pas être en ligne. Passez son `published` à `false` :

```js
{ id: 'stages', published: false, …, leads: [] },
```

Il disparaît de la page campus et du site, mais **ses données restent dans `data.js`**. Pour le remettre : ajoutez un identifiant dans `leads`, puis repassez `published` à `true`.

> Attention : si un QR code de ce pôle a déjà été imprimé, il mènera à une page « Page introuvable » tant que le pôle est masqué.

### Changer l'équipe d'un campus

`team` liste des personnes avec leur rôle. `bureau: true` les place dans la section « Le bureau » ; sans ce champ, elles vont dans « Les membres ».

```js
team: [
  { person: 'marius-blanchet', role: 'Président', bureau: true },
  { person: 'adrien-cunha',    role: 'Membre' },
],
```

La section « Les responsables de pôle » **ne se saisit pas** : elle se déduit toute seule des pôles. Vous n'avez rien à tenir à jour en double.

### La section Hackathon de l'accueil

Tout est dans l'objet `hackathon` : le titre, la date affichée à droite (`note`), les quatre cartes (`facts`, avec `value` en gros et `label` en dessous), le bloc `companies`, et `contacts`.

`contacts` est vide pour l'instant, donc le bloc n'apparaît pas du tout sur la page. Pour l'afficher, ajoutez des personnes au même format que `team` :

```js
contacts: [{ person: 'aziz-hammiche', role: 'Contact entreprises' }],
```

### Trois règles à respecter

1. **Gardez les guillemets** autour des textes, et la **virgule** à la fin de chaque ligne.
   Si un texte contient une apostrophe (`l'année`), entourez-le de guillemets doubles `"…"`.
2. **Ne changez jamais l'`id` d'un campus ou d'un pôle** (`id: 'conferences'`) : il forme l'adresse de la page (`/rennes/conferences/`). Le modifier casserait les QR codes déjà imprimés.
3. **Ne touchez pas à `styles.css`** : c'est le design, il est figé.

### Ajouter un pôle

Copiez un bloc de pôle existant, collez-le juste après, et changez `id`, `name`, `tagline`, `desc` et `leads`.
Donnez-lui un `id` court, en minuscules, sans accent ni espace (`mentorat`, `forum-entreprises`).

---

## 3. Publier un campus

Chaque campus a un interrupteur, en haut de son bloc dans `data.js` :

```js
rennes: { name: 'Rennes', published: true,  … }
gif:    { name: 'Paris-Saclay', published: false, … }
```

- `published: true` → le campus est **en ligne** : il a ses pages, il apparaît dans le menu, il peut avoir ses QR codes.
- `published: false` → le campus est **masqué**. Il apparaît seulement sur l'accueil sous la mention « Bientôt », sur une carte non cliquable. Aucune page n'est générée.

Aujourd'hui, **Rennes** et **Metz** sont publiés. Paris-Saclay ne l'est pas : ses pôles sont décrits mais n'ont pas encore de responsable.

**Pour publier Paris-Saclay** : renseignez les responsables de ses pôles (voir plus haut), publiez au moins un pôle ou ajoutez une `team`, passez le campus en `published: true`, puis suivez les étapes 4, 5 et 6.

> Un campus peut n'avoir aucun pôle : sa page affiche alors seulement son équipe, comme Metz aujourd'hui.

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
| « la personne « … » n'existe pas dans « people » » | Un identifiant est mal orthographié. Le message liste ceux qui existent : recopiez-en un. |
| « est publié mais n'a aucun responsable » | Un pôle publié a un `leads` vide. Ajoutez un identifiant, ou passez le pôle en `published: false`. |
| « Personnes définies dans « people » mais référencées nulle part » | Simple avertissement, pas une erreur : quelqu'un est décrit mais n'apparaît sur aucune page. |

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
