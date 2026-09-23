# CS Network — Passation développeur

Site mobile-first en 3 gabarits : Accueil, Campus, Pôle. Un gabarit sert pour tous les campus et pôles. Le contenu est dans `data.js`.
URL : `index.html` · `campus.html?c=rennes` · `pole.html?c=rennes&p=conferences` (QR code → URL pôle)

---

## 1. Design system

### Couleurs
| Token | Hex | Usage |
|---|---|---|
| --bordeaux | #8E1836 | Accent principal : bouton Email, filets header/footer, bordure haute carte campus, flèches, focus |
| --bordeaux-hover | #6E1129 | Survol bouton Email, liens |
| --bordeaux-active | #560D20 | Clic bouton Email |
| --violet | #5F5480 | Bouton LinkedIn, eyebrows, bordure gauche carte pôle, méta |
| --violet-hover | #4A4166 | Survol bouton LinkedIn |
| --violet-active | #3A3352 | Clic bouton LinkedIn |
| --ink | #231E27 | Titres, texte principal, filets de section 2px |
| --text-2 | #3F3845 | Texte d'introduction, accroches |
| --text-body | #2F2934 | Description du pôle |
| --muted | #5A5360 | Petits textes, footer |
| --bg | #F2F1F3 | Fond de page (gris clair) |
| --surface | #FFFFFF | Header, footer, cartes |
| --surface-active | #F7F4F8 | Fond de carte au clic |
| --border | #D9D5DD | Bordure 1px des cartes |
| --divider | #E4E1E7 | Séparateur interne des cartes |
| --photo-bg | #E9E6EF | Fond de la photo quand elle manque |

Texte blanc sur bordeaux et sur violet : contraste > 7:1.

### Polices (Google Fonts)
- Titres : **Newsreader**, graisse 500 (axe opsz 6..72)
- Texte : **Source Serif 4**, graisses 400 et 600 (axe opsz 8..60)
- Repli : Georgia, serif
- Lien : `https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap`

### Tailles de texte
| Style | Police | Taille | Graisse | Interligne |
|---|---|---|---|---|
| H1 Accueil | Newsreader | clamp(34px, 5.6vw, 60px) | 500 | 1.05, lettrage -0.01em |
| H1 Campus | Newsreader | clamp(40px, 6.4vw, 72px) | 500 | 1.0 |
| H1 Pôle | Newsreader | clamp(38px, 5.6vw, 64px) | 500 | 1.02 |
| H2 section | Newsreader | 24px (22px sur la page Pôle) | 500 | normal |
| Titre carte campus | Newsreader | 32px | 500 | 1.05 |
| Titre carte pôle | Newsreader | 26px | 500 | 1.1 |
| Nom responsable | Newsreader | 24px | 500 | 1.1 |
| Eyebrow | Source Serif 4 | 13px, MAJUSCULES, lettrage 0.12em | 600 | — |
| Chapô accueil | Source Serif 4 | clamp(17px, 1.8vw, 19px) | 400 | 1.55 |
| Intro campus | Source Serif 4 | 17px | 400 | 1.55 |
| Description pôle | Source Serif 4 | 18px | 400 | 1.6 |
| Texte carte | Source Serif 4 | 16px | 400 | 1.45 |
| Bouton | Source Serif 4 | 17px | 600 | — |
| Navigation, lieu, retour | Source Serif 4 | 15px | 400 | — |
| Petit texte, méta, footer | Source Serif 4 | 14px | 400/600 | — |

### Espacements
- Conteneur : largeur max 1120px, marges latérales 20px
- Échelle des espacements : 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 56 · 64 px
- Espace entre les cartes : 12px. Entre les deux boutons de contact : 8px
- Padding des cartes : campus 20px · pôle 18px 20px · responsable 16px
- Hero accueil : haut clamp(32px, 7vw, 88px), bas clamp(28px, 5vw, 56px)
- Bas de page avant le footer : 56px
- Zones cliquables : 44px minimum. Boutons de contact : 56px de haut

### Arrondis et ombres
- Arrondis : **0** partout (angles droits)
- Ombres : **aucune**, design plat. La structure vient des filets
- Filets : header bas 2px bordeaux · footer haut 2px bordeaux · séparateurs de section 2px #231E27 · cartes 1px #D9D5DD
- Focus clavier : contour 2px #8E1836, décalage 2px

---

## 2. Composants

### Header
Fond blanc, sticky, filet bas 2px bordeaux. Logo à gauche (48px de haut, `mix-blend-mode: multiply`, cliquable vers l'accueil). Liens des 3 campus à droite (15px, zone de 44px). Campus actif : soulignement 2px bordeaux. Survol : texte bordeaux.

### Carte campus (`.card-campus`)
- Structure : lien entier. Numéro « 01 » (14px/600 violet) → nom (32px Newsreader) → lieu (15px muted) → pied séparé par un filet 1px #E4E1E7 : « N pôles » + flèche bordeaux
- Style : fond blanc, bordure 1px #D9D5DD, **bordure haute 4px bordeaux**, hauteur min 180px, padding 20px
- Survol : toute la bordure passe en #8E1836 (transition 150ms)
- Clic : fond #F7F4F8
- Focus : contour 2px bordeaux

### Carte pôle (`.card-pole`)
- Structure : lien entier. Nom (26px Newsreader) + flèche à droite → accroche d'une ligne (16px) → filet 1px → « Responsable(s) : … » (14px violet)
- Style : fond blanc, bordure 1px #D9D5DD, **bordure gauche 4px violet**, padding 18px 20px
- Survol : bordure #8E1836. Clic : fond #F7F4F8

### Carte responsable (`.card-lead`)
- Structure : photo carrée 88×88 (object-fit: cover ; sinon initiale sur fond #E9E6EF) + nom (24px Newsreader), rôle (15px, « Responsable du pôle X » ou « Co-responsable du pôle X » s'il y en a deux), méta « CentraleSupélec · Campus » (14px violet)
- Style : fond blanc, bordure 1px, padding 16px, espace de 16px entre la photo et le texte
- Non cliquable : pas d'état de survol
- Deux responsables : les cartes s'empilent avec 12px d'espace, titre au pluriel « Responsables »

### Boutons de contact (`.btn--email`, `.btn--linkedin`)
- Grille de 2 colonnes égales, 8px d'espace, placée **juste sous le titre du pôle**
- 56px de haut, padding 0 18px, texte 17px/600 blanc **aligné à gauche**, icône Lucide 20px à droite (mail, linkedin)
- Email : fond #8E1836 → survol #6E1129 → clic #560D20. Action `mailto:` vers l'adresse du pôle
- LinkedIn : fond #5F5480 → survol #4A4166 → clic #3A3352. Ouvre un nouvel onglet
- Sous les boutons : « Contact direct : Prénom · email » (14px muted)

### Lien retour (`.back`)
Flèche 16px + texte 15px violet, zone de 44px, survol bordeaux. « Tous les campus » ou « Pôles de [Campus] ».

### Barre de section (`.section-bar`)
Filet haut 2px #231E27. H2 à gauche, info (14px muted) à droite, alignées sur la ligne de base.

### Footer
Fond blanc, filet haut 2px bordeaux, 14px muted, deux mentions qui passent à la ligne sur mobile.

---

## 3. Responsive

Une seule mise en page fluide, sans point de rupture fixe. Les grilles `auto-fit` et les tailles `clamp()` s'adaptent à la largeur.

| Élément | Mobile (≈390px) | Desktop (≥1024px) |
|---|---|---|
| Hero accueil | 1 colonne : titre puis chapô | 2 colonnes : titre à gauche, chapô à droite (aligné en bas) — colonnes min 420px |
| Cartes campus | 1 par ligne, empilées | 3 par ligne (colonnes min 280px) |
| Cartes pôle | 1 par ligne | 3 par ligne (colonnes min 320px) |
| Page pôle | 1 colonne : titre → boutons → description → responsable(s) | 2 colonnes : titre + boutons + description à gauche, responsable(s) à droite |
| Boutons de contact | Toujours côte à côte (2 × 50%), en haut de page | Identique, dans la colonne gauche |
| Titres H1 | 34–40px | 60–72px (plafond) |
| Espacements verticaux | Réduits (clamp min) | Élargis (clamp max) |
| Conteneur | Pleine largeur, marges 20px | Centré, max 1120px |
| Header | Logo + 3 liens (retour à la ligne si l'écran est trop étroit) | Identique |

Mobile-first : sur la page pôle, les boutons Email et LinkedIn sont visibles sans défiler dès l'arrivée depuis le QR code.

---

## 4. Fichiers

- `index.html` — Accueil
- `campus.html` — Gabarit campus (`?c=rennes|metz|gif`)
- `pole.html` — Gabarit pôle (`?c=…&p=…`)
- `styles.css` — Tous les tokens (`:root`) et composants
- `data.js` — Contenu : campus, pôles, responsables, emails, LinkedIn, photos
- `app.js` — Rendu des gabarits à partir de `data.js`, en JS vanilla
- `assets/cs-network-logo.jpg` — Logo

À compléter dans `data.js` : les noms de famille (`[Nom]`), les emails réels, les URL LinkedIn, et le chemin des photos (`photo: 'assets/maxime.jpg'`).
