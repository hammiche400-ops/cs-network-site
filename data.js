// CS Network — contenu du site. Tout se modifie ici, et nulle part ailleurs.
//
// people    : le répertoire des personnes. Chaque personne n'est décrite qu'UNE fois,
//             sous un identifiant, puis référencée partout par cet identifiant.
// campuses  : les campus, leurs pôles et leur équipe.
// hackathon : la section Hackathon de la page d'accueil.
//
// published: true  = en ligne (page générée, QR code, navigation)
// published: false = masqué. Un campus masqué s'affiche « Bientôt » sur l'accueil ;
//                    un pôle masqué disparaît complètement, mais ses données restent ici.
window.CSN_DATA = {
  order: ['rennes', 'metz', 'gif'],

  // ————— Répertoire des personnes —————
  // Pour changer un email, un lien LinkedIn ou ajouter une photo : c'est ici, une seule fois.
  people: {
    // Rennes
    'maxime-vila':          { name: 'Maxime Vila',            email: 'maxime.vila@student-cs.fr',           linkedin: 'https://www.linkedin.com/in/maxime-vila/', photo: '' },
    'lili-mei-law-dune':    { name: 'Lili-Meï Law-Dune',      email: 'lili-mei.law-dune@student-cs.fr',     linkedin: 'https://www.linkedin.com/in/lili-me%C3%AF-law-dune-688186333/', photo: '' },
    'marius-blanchet':      { name: 'Marius Blanchet',        email: 'marius.blanchet@student-cs.fr',       linkedin: 'https://www.linkedin.com/in/marius-blanchet-b76481388', photo: '' },
    'agathe-douchin':       { name: 'Agathe Douchin',         email: 'agathe.douchin@student-cs.fr',        linkedin: 'https://www.linkedin.com/in/agathe-douchin/', photo: '' },
    'abdessamad-elkihel':   { name: 'Abdessamad Elkihel',     email: 'abdessamad.elkihel@student-cs.fr',    linkedin: 'https://www.linkedin.com/in/elkihel-abdessamad-73804b383/', photo: '' },
    'aziz-hammiche':        { name: 'Aziz Hammiche',          email: 'aziz.hammiche@student-cs.fr',         linkedin: 'https://www.linkedin.com/in/aziz-hammiche/', photo: '' },

    // Metz
    'achille-train-lagarde':  { name: 'Achille Train-Lagarde',   email: 'achille.train-lagarde@student-cs.fr',   linkedin: 'https://www.linkedin.com/in/achilletn/', photo: '' },
    'ilyess-amrani':          { name: 'Ilyess Amrani',           email: 'ilyess.amrani@student-cs.fr',           linkedin: 'https://www.linkedin.com/in/ilyess-amrani-9a6b5536a/', photo: '' },
    'maxime-sastre':          { name: 'Maxime Sastre',           email: 'maxime.sastre@student-cs.fr',           linkedin: 'https://www.linkedin.com/in/maxime-sastre/', photo: '' },
    'louis-renou':            { name: 'Louis Renou',             email: 'louis.renou@student-cs.fr',             linkedin: 'https://www.linkedin.com/in/louisrenou/', photo: '' },
    'adrien-cunha':           { name: 'Adrien Cunha',            email: 'adrien.cunha@student-cs.fr',            linkedin: 'https://www.linkedin.com/in/adrien-cunha/', photo: '' },
    'damien-mandon':          { name: 'Damien Mandon',           email: 'damien.mandon@student-cs.fr',           linkedin: 'https://www.linkedin.com/in/damien-mandon-b93497379/', photo: '' },
    'noe-schmied':            { name: 'Noé Schmied',             email: 'noe.schmied@student-cs.fr',             linkedin: 'https://www.linkedin.com/in/no%C3%A9-schmied-4664183b0/', photo: '' },
    'jean-baptiste-de-leusse':{ name: 'Jean-Baptiste De Leusse', email: 'jean-baptiste.deleusse@student-cs.fr',  linkedin: 'https://www.linkedin.com/in/jean-baptiste-de-leusse-8a8239270/', photo: '' },
    'anas-tariq':             { name: 'Anas Tariq',              email: 'anas.tariq@student-cs.fr',              linkedin: 'https://www.linkedin.com/in/anas-tariq-1b933623a/', photo: '' },
    'maxime-chiabodo':        { name: 'Maxime Chiabodo',         email: 'maxime.chiabodo@student-cs.fr',         linkedin: 'https://www.linkedin.com/in/mchiabodo/', photo: '' },
  },

  campuses: {
    rennes: { name: 'Rennes', published: true, place: 'Cesson-Sévigné, Bretagne', intro: "Des pôles pour faire venir les anciens et les professionnels sur le campus, et pour documenter les parcours des centraliens.",
      // leads : identifiants du répertoire people. Le premier reçoit les boutons Email
      // et LinkedIn en haut de la page du pôle.
      poles: [
        { id: 'conferences', published: true, name: 'Conférences', tagline: "Des anciens et des professionnels interviennent sur le campus toute l'année.", desc: "Des anciens et des professionnels interviennent sur le campus toute l'année. Le pôle prend en charge chaque intervention : choix du format, date, public et logistique. Vous avez une expérience à partager ? Proposez un sujet, nous nous occupons du reste.", leads: ['maxime-vila'] },
        { id: 'podcast', published: true, name: 'Podcast', tagline: "Des anciens racontent ce qu'ils font vraiment.", desc: "Des anciens racontent ce qu'ils font vraiment. Chaque épisode revient sur un parcours, un métier et les choix qui l'ont construit. L'enregistrement dure environ une heure, sur le campus ou à distance.", leads: ['lili-mei-law-dune', 'marius-blanchet'] },
        { id: 'associations', published: true, name: 'Aide aux associations', tagline: 'Met en relation les assos du campus avec les anciens.', desc: "Met en relation les associations du campus avec les anciens. Mentorat, expertise ponctuelle ou partenariat : le pôle identifie le bon interlocuteur pour chaque projet étudiant.", leads: ['agathe-douchin'] },
        // Masqué tant qu'il n'a pas de responsable. Pour le remettre en ligne : ajoutez un
        // identifiant dans leads, puis passez published à true.
        { id: 'stages', published: false, name: 'Stages centraliens', tagline: 'La base des stages réalisés par des centraliens.', desc: "La base des stages réalisés par des centraliens. Le pôle recense missions, entreprises et retours d'expérience pour orienter les promotions suivantes. Les entreprises peuvent y faire connaître leurs offres.", leads: [] },
      ],
      // bureau: true → section « Le bureau ». Les responsables de pôle apparaissent
      // automatiquement dans leur propre section, à partir des poles ci-dessus.
      team: [
        { person: 'marius-blanchet',    role: 'Président',          bureau: true },
        { person: 'agathe-douchin',     role: 'Vice-présidente',    bureau: true },
        { person: 'abdessamad-elkihel', role: 'Secrétaire général', bureau: true },
        { person: 'aziz-hammiche',      role: 'Trésorier',          bureau: true },
      ] },

    metz: { name: 'Metz', published: true, place: 'Technopôle, Grand Est', intro: "L'antenne de Metz se met en place. Les pôles ouvriront dans un second temps : en attendant, l'équipe est joignable directement.", poles: [],
      team: [
        { person: 'achille-train-lagarde',  role: 'Président',          bureau: true },
        { person: 'ilyess-amrani',          role: 'Vice-Président',     bureau: true },
        { person: 'maxime-sastre',          role: 'Trésorier',          bureau: true },
        { person: 'louis-renou',            role: 'Secrétaire général', bureau: true },
        { person: 'adrien-cunha',           role: 'Membre' },
        { person: 'damien-mandon',          role: 'Membre' },
        { person: 'noe-schmied',            role: 'Membre' },
        { person: 'jean-baptiste-de-leusse', role: 'Membre' },
        { person: 'anas-tariq',             role: 'Membre' },
        { person: 'maxime-chiabodo',        role: 'Membre' },
      ] },

    // Campus non publié. Les pôles sont décrits mais masqués : ils n'ont pas encore
    // de responsable. Ajoutez des identifiants dans leads, puis passez published à true.
    gif: { name: 'Paris-Saclay', published: false, place: 'Gif-sur-Yvette, Île-de-France', intro: "Le plus grand campus de l'école, au cœur du plateau de Saclay. Cinq pôles relient les étudiants aux anciens et aux entreprises franciliennes.",
      poles: [
        { id: 'conferences', published: false, name: 'Conférences', tagline: "Un cycle mensuel d'interventions d'anciens et de dirigeants.", desc: "Un cycle mensuel d'interventions d'anciens et de dirigeants, dans l'amphithéâtre du bâtiment Eiffel. Le pôle s'occupe du programme, de la communication et de l'accueil des intervenants.", leads: [] },
        { id: 'mentorat', published: false, name: 'Mentorat', tagline: 'Des binômes ancien-étudiant, formés par secteur.', desc: "Le pôle forme des binômes entre anciens et étudiants, par secteur et par métier. Un engagement léger : quatre à six échanges sur l'année, en présentiel ou en visio.", leads: [] },
        { id: 'rencontres', published: false, name: 'Rencontres alumni', tagline: 'Des soirées sectorielles entre étudiants et anciens.', desc: "Des soirées sectorielles à Paris et sur le campus : conseil, finance, énergie, tech. Les anciens y rencontrent les étudiants dans un format court et informel.", leads: [] },
        { id: 'stages', published: false, name: 'Stages centraliens', tagline: 'La base des stages réalisés par des centraliens.', desc: "La base des stages réalisés par les centraliens du campus. Missions, entreprises et retours d'expérience y sont recensés pour guider les promotions suivantes.", leads: [] },
        { id: 'podcast', published: false, name: 'Podcast', tagline: "Des parcours d'anciens racontés en une heure.", desc: "Chaque mois, un ancien revient sur son parcours et son métier au quotidien. Les épisodes sont enregistrés au studio du campus ou à distance.", leads: [] },
      ],
      team: [] },
  },

  // ————— Section Hackathon de la page d'accueil —————
  hackathon: {
    title: 'Hackathon IA CentraleSupélec Network',
    note: '9 janvier 2027',
    facts: [
      { value: 'Trois campus',              label: 'Rennes, Metz et Paris-Saclay, en simultané.' },
      { value: '200 à 300 participants',    label: 'En équipes de 4 à 5 personnes.' },
      { value: '3 sujets',                  label: 'Posés par des entreprises.' },
      { value: 'Finale le 16 janvier 2027', label: 'Au bâtiment CentraleSupélec Alumni, à Paris.' },
    ],
    companies: {
      title: 'Pour les entreprises',
      text: "Vous souhaitez proposer un sujet ou soutenir l'événement ? Contactez l'équipe.",
    },
    // Contacts de l'événement, au même format que les équipes : { person, role }.
    // Tant que cette liste est vide, le bloc n'apparaît pas du tout sur la page.
    contacts: [],
  },
};
