/*
  CONTENU DE LA PRÉSENTATION — seul fichier à modifier pour changer les textes.
  Ce qui suit « window.PRESENTATION = » est du JSON pur (guillemets doubles,
  pas de virgule après le dernier élément).

  « schema » décrit les pièces du dessin (positions en pixels, repère 1920 × 1080).
  « slides » décrit chaque étape : textes, pièces visibles, pièces mises en avant,
  flux animés, et le trajet du point lumineux.
  Les encadrés « Hermes » viennent de architecture.md (section indiquée).
*/
window.PRESENTATION = {
  "titre": "Comment travaille un agent IA",
  "surtitre": "Cours · Architecture agentique",
  "source": "Exemple réel : Hermes, dossier de passation du 15 octobre 2026",

  "schema": {
    "pieces": [
      { "id": "user", "titre": "Vous", "sous": "une demande, un objectif", "x": 860, "y": 150, "w": 230, "h": 78 },
      { "id": "canal", "titre": "Messagerie", "sous": "là où l'on parle à l'agent", "x": 860, "y": 268, "w": 230, "h": 78,
        "lignes": [ { "t": "Pont vers un autre agent", "s": "en pause", "panne": true } ] },
      { "id": "contexte", "titre": "Contexte", "sous": "ce que l'agent relit", "x": 860, "y": 430, "w": 230, "h": 226,
        "lignes": [ { "t": "Consignes et personnalité" }, { "t": "Ce qu'il sait de vous" }, { "t": "Savoir-faire appris" }, { "t": "Échanges passés" } ] },
      { "id": "memoire", "titre": "Mémoire longue", "sous": "notes, archives, sauvegardes", "x": 860, "y": 712, "w": 230, "h": 78,
        "lignes": [ { "t": "Un accès Google révoqué", "s": "51 échecs", "panne": true } ] },
      { "id": "modele", "titre": "Modèle de langage", "sous": "raisonne et propose", "x": 1255, "y": 150, "w": 230, "h": 78 },
      { "id": "agent", "type": "boucle", "titre": "Agent", "sous": "la boucle", "cx": 1370, "cy": 470, "r": 118 },
      { "id": "sousagents", "titre": "Sous-agents", "sous": "travaillent en parallèle", "x": 1255, "y": 712, "w": 230, "h": 120,
        "lignes": [ { "t": "n° 1 · références web" }, { "t": "n° 2 · notes du projet" } ] },
      { "id": "outils", "titre": "Outils", "sous": "ce que l'agent fait lui-même", "x": 1640, "y": 150, "w": 230, "h": 196,
        "lignes": [ { "t": "Terminal et fichiers" }, { "t": "Recherche web" }, { "t": "Lecture d'images" }, { "t": "Voix de synthèse" } ] },
      { "id": "connecteurs", "titre": "Connecteurs MCP", "sous": "des logiciels branchés", "x": 1640, "y": 396, "w": 230, "h": 196,
        "lignes": [ { "t": "Web · Firecrawl" }, { "t": "Design · Figma" }, { "t": "3D · Blender" }, { "t": "Images · Dadaland", "s": "non branché", "panne": true } ] },
      { "id": "sorties", "titre": "Résultats", "sous": "ce qui revient vers vous", "x": 1640, "y": 642, "w": 230, "h": 190,
        "lignes": [ { "t": "Réponse, texte ou voix" }, { "t": "Document rédigé" }, { "t": "Images et vue 3D" } ] }
    ],
    "flux": [
      { "id": "user_canal", "de": "user", "vers": "canal" },
      { "id": "user_agent", "de": "user", "vers": "agent" },
      { "id": "canal_agent", "de": "canal", "vers": "agent" },
      { "id": "ctx_agent", "de": "contexte", "vers": "agent" },
      { "id": "mem_ctx", "de": "memoire", "vers": "contexte" },
      { "id": "agent_modele", "de": "agent", "vers": "modele", "double": true },
      { "id": "agent_outils", "de": "agent", "vers": "outils", "double": true },
      { "id": "agent_conn", "de": "agent", "vers": "connecteurs", "double": true },
      { "id": "agent_sub", "de": "agent", "vers": "sousagents", "double": true },
      { "id": "sub_conn", "de": "sousagents", "vers": "connecteurs", "double": true },
      { "id": "agent_sorties", "de": "agent", "vers": "sorties" },
      { "id": "agent_mem", "de": "agent", "vers": "memoire" }
    ]
  },

  "slides": [
    {
      "rubrique": "Introduction",
      "titre": "Comment travaille un agent IA",
      "texte": "Un agent est un programme qui reçoit un objectif et enchaîne lui-même les actions pour l'atteindre. Pour comprendre comment, nous allons suivre une seule demande, du premier mot jusqu'au résultat, et ouvrir chaque boîte au passage.",
      "visibles": ["agent"], "accent": ["agent"], "flux": [], "jeton": [], "boucle": true
    },
    {
      "rubrique": "Définition",
      "titre": "Un agent poursuit un objectif",
      "texte": "Un assistant conversationnel répond à une question, en une fois. Un agent reçoit un objectif et avance par étapes : il cherche, lit, écrit, vérifie, et recommence tant que le travail n'est pas fini.",
      "hermes": { "texte": "Hermes est un agent qui tourne en continu sur un serveur loué. Il sait « parler, se souvenir, exécuter, et se réveiller tout seul ».", "source": "1" },
      "visibles": ["user", "agent", "sorties"], "accent": ["user", "agent", "sorties"],
      "flux": ["user_agent", "agent_sorties"], "jeton": ["user_agent", "agent_sorties"], "boucle": true
    },
    {
      "rubrique": "1 · La demande",
      "titre": "Tout part d'une demande",
      "texte": "On confie à l'agent un objectif formulé librement, à l'écrit ou à l'oral, depuis une messagerie. Pas besoin de commande précise : c'est à lui de comprendre ce qu'il faut faire.",
      "exemple": "« Il me faut la note d'intention et une vue 3D du pavillon pour l'appel à projets, avec les références qu'on a vues, et une remise en page propre pour le jury. » Un mémo vocal de quarante secondes, envoyé depuis un téléphone.",
      "hermes": { "texte": "Le mémo arrive par Telegram. Il est transcrit en texte sur le serveur même, sans service payant : un mémo de 8 secondes se transcrit en une dizaine de secondes.", "source": "6.1, 7.6" },
      "visibles": ["user", "canal", "agent"], "accent": ["user", "canal"],
      "flux": ["user_canal", "canal_agent"], "jeton": ["user_canal", "canal_agent"]
    },
    {
      "rubrique": "2 · Les pièces",
      "titre": "Un agent est un assemblage",
      "texte": "Derrière le mot « agent », plusieurs pièces travaillent ensemble. Un modèle de langage qui raisonne, un contexte qui l'informe, des outils qui agissent, des connecteurs vers d'autres logiciels, une mémoire qui garde la trace. Nous allons les voir une par une.",
      "hermes": { "texte": "Chez Hermes, tout tient dans un seul conteneur loué chez Railway, avec un disque de 46 Go qui survit aux redémarrages.", "source": "1, 2.1" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": [], "flux": [], "jeton": []
    },
    {
      "rubrique": "3 · Le contexte",
      "titre": "Ce que l'agent relit avant d'agir",
      "texte": "Avant chaque réponse, l'agent rassemble ce qu'il doit savoir : ses consignes et sa personnalité, ce qu'il a retenu de vous, les savoir-faire utiles, les échanges passés. Le modèle ne connaît rien d'autre que ce contexte.",
      "exemple": "L'agent retrouve les échanges déjà eus sur le pavillon et les règles d'écriture à respecter.",
      "hermes": { "texte": "Un fichier de consignes fixe la voix et les règles d'écriture, deux fichiers de mémoire sont relus à chaque tour, 159 savoir-faire sont disponibles et 9 597 conversations sont archivées.", "source": "8, 10.1" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["contexte", "memoire", "agent"], "flux": ["mem_ctx", "ctx_agent"], "jeton": ["mem_ctx", "ctx_agent"]
    },
    {
      "rubrique": "4 · Le modèle",
      "titre": "Le modèle propose, l'agent exécute",
      "texte": "Le modèle de langage lit le contexte et propose la prochaine action : répondre, chercher, écrire un fichier, déléguer. Il ne touche à rien lui-même. C'est l'agent qui exécute ce que le modèle propose, puis lui rapporte le résultat.",
      "exemple": "Le modèle découpe la demande : trouver des références, rédiger la note, produire la vue 3D, refaire la mise en page.",
      "hermes": { "texte": "Modèle principal : deepseek-flash, avec deux modèles de secours s'il ne répond pas. Sur 30 jours : 1,064 milliard de jetons traités, pour un coût estimé à 53,61 dollars.", "source": "5.1, 5.3" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["modele", "agent"], "flux": ["agent_modele"], "jeton": ["agent_modele"]
    },
    {
      "rubrique": "5 · La boucle",
      "titre": "Penser, agir, observer, recommencer",
      "texte": "L'agent tourne en boucle. Il décide de la prochaine étape, la réalise avec un outil, regarde le résultat, puis repart. La boucle s'arrête quand l'objectif est atteint, ou quand une limite fixée à l'avance est touchée.",
      "exemple": "Chercher l'appel à projets, lire les pages trouvées, décider de la suite, écrire un premier jet, le relire.",
      "hermes": { "texte": "Plafond fixé à 1 000 tours. Avant de modifier un fichier, l'agent en garde une copie pour pouvoir revenir en arrière.", "source": "4" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["agent", "modele", "outils"], "flux": ["agent_modele", "agent_outils"], "jeton": ["agent_modele", "agent_outils"], "boucle": true
    },
    {
      "rubrique": "6 · Les outils",
      "titre": "Les outils, ce sont ses mains",
      "texte": "Un outil est une action précise que l'agent sait déclencher : lancer une commande, lire ou écrire un fichier, chercher sur le web, parler à voix haute. Chaque appel renvoie un résultat, que l'agent observe avant de continuer.",
      "exemple": "L'agent rédige la note d'intention dans un fichier, puis la relit.",
      "hermes": { "texte": "Terminal, fichiers, recherche web, navigateur, lecture d'images, voix de synthèse en français. Aucun jeu d'outils n'est désactivé.", "source": "7.1, 7.6" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["outils", "agent"], "flux": ["agent_outils"], "jeton": ["agent_outils"]
    },
    {
      "rubrique": "7 · Les connecteurs",
      "titre": "Brancher d'autres logiciels",
      "texte": "Pour aller plus loin, l'agent se branche sur des logiciels extérieurs grâce à un standard, le MCP (Model Context Protocol). C'est une prise universelle : un connecteur suffit pour que l'agent sache piloter le logiciel.",
      "exemple": "L'agent commande une vue 3D du pavillon à Blender, puis ouvre le gabarit de mise en page dans Figma.",
      "hermes": { "texte": "Trois connecteurs branchés : Firecrawl pour le web, Figma pour le design, Blender pour la 3D. Blender tourne sur le Mac de Guillaume, joint par un tunnel sécurisé. Au total, 111 outils, chargés seulement quand il en faut un.", "source": "7.1, 7.2, 7.5" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["connecteurs", "agent"], "flux": ["agent_conn"], "jeton": ["agent_conn"]
    },
    {
      "rubrique": "8 · Déléguer",
      "titre": "Plusieurs agents en parallèle",
      "texte": "Pour gagner du temps, l'agent confie des sous-tâches à des sous-agents. Chacun travaille dans son propre espace, avec ses propres outils, puis rend un résultat. L'agent principal assemble.",
      "exemple": "Le premier sous-agent cherche l'appel à projets sur le web, le second fouille les notes du projet. L'agent principal rédige pendant ce temps.",
      "hermes": { "texte": "Jusqu'à 3 sous-agents à la fois, 600 secondes chacun, sur un modèle plus léger. Un sous-agent ne peut pas déléguer à son tour.", "source": "4" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["sousagents", "agent", "connecteurs"], "flux": ["agent_sub", "sub_conn"], "jeton": ["agent_sub", "sub_conn"]
    },
    {
      "rubrique": "9 · Livrer",
      "titre": "Le résultat revient, la trace reste",
      "texte": "Le travail revient vers vous : un message, un document, des images. L'agent range aussi ce qu'il a fait. Ses notes, sa mémoire et des sauvegardes lui permettront de reprendre le fil la prochaine fois.",
      "exemple": "La note part dans un document Google, la réponse arrive dans la messagerie, les notes de travail sont sauvegardées.",
      "hermes": { "texte": "Réponse dans Telegram, en texte ou en voix. Notes de travail poussées sur GitHub. Chaque nuit, une archive de 1,52 à 1,72 Go est déposée sur Google Drive.", "source": "6.1, 10.3, 12.1" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["sorties", "memoire", "agent"], "flux": ["agent_sorties", "agent_mem"],
      "jeton": ["user_canal", "canal_agent", "ctx_agent", "agent_modele", "agent_outils", "agent_conn", "agent_sorties", "agent_mem"]
    },
    {
      "rubrique": "10 · Les limites",
      "titre": "Un agent dépend de ses accès",
      "texte": "Chaque pièce repose sur une autorisation ou un service extérieur. Qu'un accès expire ou qu'un logiciel ne soit pas encore branché, et une partie de la chaîne s'arrête, souvent en silence. D'où l'importance de surveiller ces accès et de garder un humain dans la boucle.",
      "exemple": "Pour l'image d'ambiance, l'outil prévu n'est pas branché : l'agent remet un prompt à la place.",
      "hermes": { "texte": "Au 15 octobre 2026 : un accès Google révoqué fait échouer une tâche automatique depuis 51 passages, le pont vers un autre agent est en pause, l'outil d'images Dadaland n'est pas encore branché.", "source": "9.1, 9.3, 9.4" },
      "visibles": ["user", "canal", "contexte", "memoire", "modele", "agent", "sousagents", "outils", "connecteurs", "sorties"],
      "accent": ["canal", "memoire", "connecteurs"], "flux": [], "jeton": [], "pannes": true
    }
  ]
}
