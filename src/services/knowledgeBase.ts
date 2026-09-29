export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  sourceType?: 'encyclopedia' | 'official_doc' | 'reputable_publication' | 'database' | 'search_grounding' | 'scientific_journal';
}

export interface KnowledgeEntry {
  topic: string;
  keywords: string[];
  patterns: RegExp[];
  category: 'General Knowledge' | 'Science & Physics' | 'Technology & AI' | 'Entertainment & Media' | 'Geography & History' | 'How-To & Engineering' | 'Biology & Nature' | 'Creative & Game Design';
  answer: string;
  sources: GroundingSource[];
  relatedAction?: any;
  disambiguation?: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // =========================================================================
  // 0. ANIVOX FOUNDERS & OWNER (SAMUEL DAVID)
  // =========================================================================
  {
    topic: 'AniVox Founders & Ownership',
    keywords: [
      'who founded anivox',
      'who is the founder of anivox',
      'who owns anivox',
      'who created anivox',
      'who are the founders',
      'founder of anivox',
      'founders of anivox',
      'anivox founder',
      'anivox creator',
      'who made anivox',
      'who built anivox',
      'samuel david',
    ],
    patterns: [
      /\bwho\s+(founded|is\s+the\s+founder\s+of|owns|created|are\s+the\s+founders\s+of|made|built)\s+anivox\b/i,
      /\b(founder|creator|owner)\s+of\s+anivox\b/i,
      /\bwho\s+(founded|owns|created)\s+(this\s+app|the\s+app|anivox)\b/i,
    ],
    category: 'Technology & AI',
    answer: `AniVox is founded/owned by **Samuel David**.\n\nFor more information about the founders, vision, and principles, visit **Settings → About AniVox → Founders**.`,
    sources: [
      {
        title: 'AniVox Official Company & Executive Records',
        url: 'https://youtube.com/@dcb-q2x7j',
        domain: 'youtube.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'navigation',
      data: {
        screen: 'settings',
        tab: 'about',
        subtab: 'founders',
      },
    },
  },

  // =========================================================================
  // 0b. JOIN THE ANIVOX TEAM & PUBLIC CONTACT
  // =========================================================================
  {
    topic: 'Join the AniVox Team & Public Contact',
    keywords: [
      'how can i join the anivox team',
      'how to join anivox',
      'how do i contact the founders',
      'how can i work with anivox',
      'join the anivox team',
      'work with anivox',
      'contact anivox team',
      'contact the founders',
      'anivox team email',
    ],
    patterns: [
      /\bhow\s+(can|do)\s+i\s+(join|work\s+with|contact)\s+(the\s+)?(anivox\s+team|founders|anivox)\b/i,
      /\bjoin\s+(the\s+)?(anivox\s+team|anivox)\b/i,
      /\bcontact\s+(the\s+)?(founders|anivox\s+team)\b/i,
    ],
    category: 'Technology & AI',
    answer: `You can contact the AniVox team at our official public team address: **[ENTER OFFICIAL TEAM EMAIL HERE]** (or the address configured in Settings).\n\nTo view collaboration details, role inquiries, or update contact configuration, head over to **Settings → About AniVox → Join the Team**.`,
    sources: [
      {
        title: 'AniVox Public Collaboration & Team Inquiries',
        url: 'https://youtube.com/@dcb-q2x7j',
        domain: 'youtube.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'navigation',
      data: {
        screen: 'settings',
        tab: 'about',
        subtab: 'team',
      },
    },
  },

  // =========================================================================
  // 0c. ANIVOX TEAM PAYMENT & COMPENSATION POLICY
  // =========================================================================
  {
    topic: 'AniVox Team Payment Policy',
    keywords: [
      'can i get paid',
      'do you pay team members',
      'does anivox pay',
      'is anivox paid',
      'are positions paid',
      'do you pay',
      'team salary',
      'payment for joining anivox',
      'compensation at anivox',
    ],
    patterns: [
      /\b(can\s+i\s+get\s+paid|do\s+you\s+pay|does\s+anivox\s+pay|is\s+it\s+paid|are\s+team\s+members\s+paid)\b/i,
      /\b(payment|salary|compensation)\s+(policy|for\s+team|at\s+anivox)\b/i,
    ],
    category: 'Technology & AI',
    answer: `At the moment, AniVox does not offer paid positions. Participation is voluntary. If you're still interested, you can contact the team.\n\nWould you still like to join?`,
    sources: [
      {
        title: 'AniVox Official Team Policy',
        url: 'https://youtube.com/@dcb-q2x7j',
        domain: 'youtube.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'team_inquiry',
      data: {
        policy: 'voluntary',
        email: '[ENTER OFFICIAL TEAM EMAIL HERE]',
        promptFollowUp: 'Would you still like to join?',
      },
    },
  },

  // =========================================================================
  // 0d. VERIFIED OFFICIAL LINKS (XBOX, NOVAVERSE, DCB CHANNEL)
  // =========================================================================
  {
    topic: 'Xbox Official Website',
    keywords: [
      'give me the xbox link',
      'xbox link',
      'where can i find xbox',
      'xbox website',
      'official xbox website',
      'open xbox',
    ],
    patterns: [
      /\b(give\s+me\s+the\s+)?xbox\s+link\b/i,
      /\bwhere\s+(can\s+i\s+find|is)\s+xbox\b/i,
      /\bopen\s+(the\s+)?xbox(\s+website)?\b/i,
    ],
    category: 'Creative & Game Design',
    answer: `Here is the official Xbox website.`,
    sources: [
      {
        title: 'Xbox Official Site: Consoles, Games, and Community',
        url: 'https://www.xbox.com',
        domain: 'xbox.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'open_link',
      data: {
        id: 'link-xbox',
        targetName: 'Xbox',
        platform: 'web',
        platformDisplayName: 'Xbox Official',
        profileTitle: 'Xbox Official Website',
        webUrl: 'https://www.xbox.com',
        buttonLabel: 'OPEN XBOX',
        description: 'Official Xbox website. Explore Xbox consoles, Game Pass titles, cloud gaming, and Microsoft gaming ecosystem.',
        isVerified: true,
        directLaunchSuggested: true,
      },
    },
  },

  {
    topic: 'NovaVerse Interactive Universe',
    keywords: [
      'where can i find novaverse',
      'novaverse link',
      'novaverse',
      'where is novaverse',
      'where is the game',
      'open novaverse',
      'find novaverse',
    ],
    patterns: [
      /\bwhere\s+(can\s+i\s+find|is)\s+novaverse\b/i,
      /\bwhere\s+is\s+the\s+game\b/i,
      /\b(give\s+me\s+the\s+)?novaverse\s+link\b/i,
      /\bopen\s+(the\s+)?novaverse\b/i,
    ],
    category: 'Creative & Game Design',
    answer: `Here is the official NovaVerse page.`,
    sources: [
      {
        title: 'NovaVerse Official Universe',
        url: 'https://novaverse.io',
        domain: 'novaverse.io',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'open_link',
      data: {
        id: 'link-novaverse',
        targetName: 'NovaVerse',
        platform: 'web',
        platformDisplayName: 'NovaVerse Platform',
        profileTitle: 'NovaVerse Interactive Platform',
        webUrl: 'https://novaverse.io',
        buttonLabel: 'OPEN NOVAVERSE',
        description: 'Official NovaVerse platform. Discover the immersive interactive gaming universe, virtual realms, and open community.',
        isVerified: true,
        directLaunchSuggested: true,
      },
    },
  },

  {
    topic: 'AniVox Official YouTube Channel',
    keywords: [
      'give me the official youtube channel',
      'official youtube channel',
      'visit our channel',
      'anivox youtube',
      'dcb youtube',
      '@dcb-q2x7j',
      'dcb-q2x7j',
    ],
    patterns: [
      /\b(give\s+me\s+the\s+)?(official\s+)?youtube\s+channel\b/i,
      /\bvisit\s+(our|the\s+official)\s+channel\b/i,
      /\bopen\s+(our|the\s+official)\s+channel\b/i,
      /\b(dcb-q2x7j|@dcb-q2x7j)\b/i,
    ],
    category: 'Technology & AI',
    answer: `Here is the official AniVox & DCB YouTube channel: https://youtube.com/@dcb-q2x7j`,
    sources: [
      {
        title: 'AniVox & DCB Official Channel',
        url: 'https://youtube.com/@dcb-q2x7j',
        domain: 'youtube.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'open_link',
      data: {
        id: 'link-anivox-yt',
        targetName: 'AniVox Official Channel',
        platform: 'youtube',
        platformDisplayName: 'YouTube',
        profileTitle: 'AniVox & DCB Official Channel',
        handle: '@dcb-q2x7j',
        webUrl: 'https://youtube.com/@dcb-q2x7j',
        appDeepLink: 'vnd.youtube://www.youtube.com/@dcb-q2x7j',
        buttonLabel: 'OPEN CHANNEL',
        description: 'Official YouTube channel of AniVox & creator DCB (@dcb-q2x7j). Watch updates, tutorials, and new features.',
        isVerified: true,
        directLaunchSuggested: true,
      },
    },
  },

  // =========================================================================
  // WATER
  // =========================================================================
  {
    topic: 'Water (H2O Chemistry & Properties)',
    keywords: [
      'what is water',
      'define water',
      'water chemical formula',
      'properties of water',
      'about water',
      'what is h2o',
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+water\b/i,
      /\bdefine\s+water\b/i,
      /\bwhat\s+is\s+h2o\b/i,
    ],
    category: 'Science & Physics',
    answer: `**Water** is an inorganic, transparent, tasteless, odorless chemical substance with the molecular formula **$\\text{H}_2\\text{O}$** (two hydrogen atoms covalently bonded to one oxygen atom). It is the universal solvent essential for all known forms of biological life.

### Key Physical & Chemical Properties:
1. **Polarity & Hydrogen Bonding:** The bent molecular geometry creates a dipole moment (negative charge near oxygen, positive near hydrogen), allowing strong hydrogen bonds between molecules.
2. **Universal Solvent:** Water dissolves more substances than any other liquid, facilitating chemical reactions and nutrient transport in living organisms.
3. **High Specific Heat Capacity:** Water absorbs and releases large amounts of heat with minimal temperature changes, stabilizing Earth's climate and organism homeostasis.
4. **Density Anomaly:** Water reaches maximum density at $4^\\circ\\text{C}$ ($39.2^\\circ\\text{F}$) and expands upon freezing. Consequently, ice floats on liquid water, insulating aquatic ecosystems during cold seasons.
5. **Abundance:** Covers approximately **71%** of the Earth's surface (96.5% oceans, 2.5% freshwater in glaciers, groundwater, and atmosphere).`,
    sources: [
      {
        title: 'USGS - Water Science School: Water Properties and Measurements',
        url: 'https://www.usgs.gov/special-topics/water-science-school',
        domain: 'usgs.gov',
        sourceType: 'official_doc',
      },
      {
        title: 'Encyclopaedia Britannica - Water (Chemical Compound)',
        url: 'https://www.britannica.com/science/water',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
    ],
  },

  // =========================================================================
  // RIDEGUARD
  // =========================================================================
  {
    topic: 'RideGuard (Vehicle & Transit Safety System)',
    keywords: [
      'what is rideguard',
      'rideguard',
      'ride guard',
      'about rideguard',
      'define rideguard',
    ],
    patterns: [
      /\bwhat\s+is\s+rideguard\b/i,
      /\bwhat\s+is\s+ride\s+guard\b/i,
      /\btell\s+me\s+about\s+rideguard\b/i,
    ],
    category: 'Technology & AI',
    answer: `**RideGuard** is an advanced vehicle safety and intelligent transit security ecosystem designed for rideshare platforms, commercial fleets, and personal vehicles.

### Core Features & System Architecture:
1. **Real-Time Telematics & Collision Detection:** Utilizes multi-axis inertial sensors, gyroscopes, and GPS tracking to instantly identify vehicle impacts, rollover events, or sudden decelerations.
2. **Automated Emergency SOS Dispatch:** Automatically establishes an encrypted emergency relay with local emergency services and designated safety contacts with live telemetry.
3. **In-Cabin Video & Audio Telemetry:** Real-time sensor monitoring to detect route deviations, unauthorized stops, or unsafe vehicle handling.
4. **Driver Fatigue & Distraction AI:** On-device computer vision analyzing blink rate and gaze direction to alert drivers of microsleep or distraction.`,
    sources: [
      {
        title: 'RideGuard Mobility Safety & Telematics Overview',
        url: 'https://rideguard.io',
        domain: 'rideguard.io',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // AUDIOMACK
  // =========================================================================
  {
    topic: 'Audiomack (Streaming & Music Discovery Platform)',
    keywords: [
      'what is audiomack',
      'audiomack',
      'play on audiomack',
      'about audiomack',
    ],
    patterns: [
      /\bwhat\s+is\s+audiomack\b/i,
      /\babout\s+audiomack\b/i,
    ],
    category: 'Entertainment & Media',
    answer: `**Audiomack** is a free global on-demand music streaming and audio discovery platform tailored for emerging artists, independent musicians, and fans of Afrobeats, Hip-Hop, R&B, Reggae, and Electronic music.

### Key Highlights:
- **Free Streaming & Offline Playback:** Allows users to stream and save music for offline listening without requiring a mandatory premium subscription.
- **Creator First Ecosystem:** Direct upload tools and monetization programs empowering independent musicians across Africa, the Americas, and Europe.
- **Top Genres:** Recognized as one of the premier hubs for Afrobeats (Burna Boy, Wizkid, Asake), Hip-Hop, Dancehall, and Amapiano.`,
    sources: [
      {
        title: 'Audiomack Official Music Streaming',
        url: 'https://audiomack.com',
        domain: 'audiomack.com',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 1. FIRST PHYSICIAN (HISTORICAL & AMBIGUITY DISAMBIGUATION)
  // =========================================================================
  {
    topic: 'The First Physician in History',
    keywords: [
      'who was the first physician',
      'first physician',
      'earliest doctor',
      'who was the first doctor',
      'first physician in history',
      'earliest physician in the world',
      'who is considered the first doctor',
      'imhotep physician',
      'hesy-ra',
      'father of medicine',
    ],
    patterns: [
      /\bwho\s+(was|is)\s+(the\s+)?(first|earliest)\s+(physician|doctor|healer)\b/i,
      /\b(first|earliest)\s+(physician|doctor)\s+(in\s+history|in\s+the\s+world|recorded|known)\b/i,
      /\bwho\s+(is|was)\s+the\s+father\s+of\s+medicine\b/i,
    ],
    category: 'Geography & History',
    answer: `The question of who was the **first physician** involves important historical nuance and context:

### 1. Earliest Known Physician by Name: **Imhotep** (c. 2600 BCE)
- **Imhotep**, an Egyptian polymath, architect of the Step Pyramid of Djoser, and vizier during the Third Dynasty of Egypt, is widely regarded by historians as the **earliest known physician recorded by name in written history**.
- He is credited in Egyptian tradition with diagnosing and treating numerous ailments without solely invoking magic, and was later deified as an Egyptian god of healing and medicine.
- Contemporaneously, **Hesy-Ra** (c. 2600 BCE) holds the official documented title of *"Chief of Dentists and Physicians"* under Pharaoh Djoser.

### 2. Historical & Cultural Ambiguity
- **Prehistoric Medicine:** The concept and practice of healers, herbalists, and bone-setters existed across human indigenous societies for tens of thousands of years before the invention of written records.
- **Female Physicians:** **Merit-Ptah** and **Peseshet** (c. 2500–2400 BCE in Ancient Egypt) are documented as among the earliest recorded female physicians and supervisors of medical practitioners.
- **Ancient Traditions:** In ancient India, **Sushruta** (c. 600 BCE) authored the *Sushruta Samhita* and is venerated as the pioneer of plastic surgery; in ancient China, **Bian Que** and the legendary **Shennong** established pulse diagnosis and herbal pharmacology.

### 3. Father of Western Clinical Medicine: **Hippocrates** (c. 460–370 BCE)
- In Ancient Greece, **Hippocrates of Kos** separated medicine from superstitious mythology, established systematic clinical observation, ethical standards (the *Hippocratic Oath*), and disease prognosis.`,
    sources: [
      {
        title: 'Encyclopaedia Britannica - Imhotep (Egyptian Architect and Physician)',
        url: 'https://www.britannica.com/biography/Imhotep',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
      {
        title: 'National Library of Medicine (NIH) - Hesy-Ra and Early Dynastic Egyptian Medicine',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24618691/',
        domain: 'nih.gov',
        sourceType: 'scientific_journal',
      },
      {
        title: 'World History Encyclopedia - Ancient Egyptian Medicine',
        url: 'https://www.worldhistory.org/Egyptian_Medicine/',
        domain: 'worldhistory.org',
        sourceType: 'encyclopedia',
      },
    ],
  },

  // =========================================================================
  // 2. MOST VENOMOUS SNAKE (POTENCY VS HUMAN DANGER DISAMBIGUATION)
  // =========================================================================
  {
    topic: "World's Most Venomous Snake (Toxicity vs. Human Danger)",
    keywords: [
      "what is the world's most venomous snake",
      "most venomous snake in the world",
      "most venomous snake",
      "deadliest snake in the world",
      "inland taipan",
      "fierce snake",
      "most toxic snake venom",
      "snake with the most poisonous venom",
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+(the\s+)?(world'?s\s+)?most\s+venomous\s+snake\b/i,
      /\bmost\s+venomous\s+snake\s+in\s+the\s+world\b/i,
      /\bdeadliest\s+snake\s+in\s+the\s+world\b/i,
      /\bwhat\s+snake\s+has\s+the\s+most\s+toxic\s+venom\b/i,
    ],
    category: 'Biology & Nature',
    answer: `When evaluating the **most venomous snake**, it is essential to distinguish **venom toxicity (potency)** from **clinical danger to humans (mortality and aggression)**:

### 1. Undisputed Most Venomous Snake by Toxicity: **The Inland Taipan** (*Oxyuranus microlepidotus*)
- **Native Habitat:** Semi-arid clay plains of central-east Australia (Queensland and South Australia).
- **Venom Potency ($LD_{50}$):** Possesses the most toxic venom of any terrestrial snake on Earth, with an $LD_{50}$ in mice of **$0.025\\text{ mg/kg}$**.
- **Lethality:** A single average envenomation bite yields approximately $44\\text{ mg}$ of venom (maximum recorded: $110\\text{ mg}$)—theoretically potent enough to kill over **100 adult humans** or 250,000 mice within 45 minutes if untreated.
- **Venom Composition:** Extremely fast-acting neurotoxins (paralyzing the respiratory system), procoagulant enzymes (causing systemic blood clotting), myotoxins (destroying muscle tissue), and hyaluronidase.

### 2. The Danger Paradox: Why It Rarely Kills Humans
- Despite its extreme venom potency, the Inland Taipan is **extremely shy, reclusive, and placid**. It lives in remote, unpopulated desert burrows and only strikes if cornered.
- With modern Australian monovalent antivenom, there has **never been a single recorded human fatality** from an Inland Taipan bite.

### 3. Snakes Responsible for the Most Human Fatalities
In contrast to venom potency, the snakes that cause the highest number of deaths worldwide include:
- **Saw-Scaled Viper (*Echis carinatus*):** Causes more worldwide fatalities than any other snake due to its aggressive defensive posture, camouflage, and proximity to rural human populations in Africa, the Middle East, and South Asia.
- **The "Big Four" in India:** Russell's Viper, Indian Cobra, Common Krait, and Saw-scaled Viper collectively account for an estimated 50,000+ deaths annually.
- **Black Mamba (*Dendroaspis polylepis*):** Renowned in sub-Saharan Africa for extreme speed (up to $20\\text{ km/h}$), potent neurotoxicity, and high fatality rate if untreated.`,
    sources: [
      {
        title: 'Australian Museum - Inland Taipan (Oxyuranus microlepidotus)',
        url: 'https://australian.museum/learn/animals/reptiles/inland-taipan/',
        domain: 'australian.museum',
        sourceType: 'official_doc',
      },
      {
        title: 'World Health Organization (WHO) - Snakebite Envenoming & Global Burden',
        url: 'https://www.who.int/news-room/fact-sheets/detail/snakebite-envenoming',
        domain: 'who.int',
        sourceType: 'official_doc',
      },
      {
        title: 'University of Melbourne - Australian Venom Research Unit',
        url: 'https://mdhs.unimelb.edu.au/avru',
        domain: 'unimelb.edu.au',
        sourceType: 'scientific_journal',
      },
    ],
  },

  // =========================================================================
  // 3. ANIME
  // =========================================================================
  {
    topic: 'Anime (Japanese Animation)',
    keywords: ['what is anime', 'define anime', 'anime meaning', 'history of anime', 'about anime', 'what does anime mean'],
    patterns: [
      /\bwhat\s+(is|are)\s+anime\b/i,
      /\bdefine\s+anime\b/i,
      /\bmeaning\s+of\s+anime\b/i,
      /\btell\s+me\s+about\s+anime\b/i,
    ],
    category: 'Entertainment & Media',
    answer: `**Anime** (アニメ) refers to hand-drawn and computer-generated animation originating from Japan. Internationally, the term specifically denotes Japanese animated television series, films, and original video animations (OVAs) characterized by distinctive art styles, dynamic character arcs, cinematic storytelling, and broad demographic reach.

### Key Dimensions of Anime:
- **Origins & Milestones:** Early commercial animation began in 1917. In the 1960s, Osamu Tezuka ("the God of Manga") revolutionized the medium with *Astro Boy* (*Tetsuwan Atom*). Iconic milestones include *Akira* (1988), Studio Ghibli's Academy Award-winning *Spirited Away* (2001), and modern global franchises like *Demon Slayer*, *Attack on Titan*, and *Jujutsu Kaisen*.
- **Demographics & Target Audiences:**
  - **Shōnen:** Action/adventure aimed at young male audiences (*Naruto*, *One Piece*, *Dragon Ball*).
  - **Seinen:** Mature psychological, philosophical, or gritty narratives (*Vinland Saga*, *Monster*, *Berserk*).
  - **Shōjo & Josei:** Character-driven romance, interpersonal drama, and personal growth (*Fruits Basket*, *Nana*).
  - **Kodomomuke:** Media created specifically for young children (*Pokémon*, *Doraemon*).
- **Major Genres:** Includes **Mecha** (giant piloted robots), **Isekai** (protagonists transported to fantasy worlds), **Slice of Life** (realistic everyday vignettes), **Cyberpunk**, and **Supernatural Fantasy**.
- **Global Impact:** Anime is a multibillion-dollar worldwide industry influencing global cinema, digital gaming, fashion, music, and contemporary art.`,
    sources: [
      {
        title: 'Encyclopaedia Britannica - Anime (Japanese Animation)',
        url: 'https://www.britannica.com/art/anime-Japanese-animation',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
      {
        title: 'The Japan Foundation - Japanese Animation History & Preservation',
        url: 'https://www.jpf.go.jp/e/project/culture/media/anime/',
        domain: 'jpf.go.jp',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 4. ARTIFICIAL INTELLIGENCE
  // =========================================================================
  {
    topic: 'Artificial Intelligence (AI)',
    keywords: ['what is artificial intelligence', 'what is ai', 'define artificial intelligence', 'ai definition', 'how ai works', 'explain artificial intelligence'],
    patterns: [
      /\bwhat\s+(is|are)\s+(artificial\s+intelligence|ai)\b/i,
      /\bdefine\s+(artificial\s+intelligence|ai)\b/i,
      /\bhow\s+does\s+ai\s+work\b/i,
      /\bexplain\s+(artificial\s+intelligence|ai)\b/i,
    ],
    category: 'Technology & AI',
    answer: `**Artificial Intelligence (AI)** is the branch of computer science dedicated to developing computational systems and algorithms that perform tasks normally requiring human cognition. These capabilities include natural language processing, visual recognition, logical reasoning, strategic planning, decision-making, and creative synthesis.

### Core Disciplines of AI:
- **Machine Learning (ML):** Algorithms that analyze large volumes of empirical data, infer mathematical patterns, and optimize predictive models without explicit rule-based hardcoding.
- **Deep Learning & Artificial Neural Networks:** Multi-layered architectures inspired by biological neural connections, enabling breakthroughs in computer vision, acoustic transcription, and autonomous robotics.
- **Large Language Models (LLMs) & Generative AI:** Transformer neural networks (such as Google Gemini) trained on vast multimodal corpora, utilizing self-attention mechanisms to understand semantic context and generate fluent text, code, audio, and images.
- **Computer Vision & Robotics:** Sensor interpretation (LiDAR, RGB cameras) powering autonomous vehicles, medical imaging diagnostics, and industrial automation.

### Current Frontiers:
- **Narrow AI (ANI):** Specialized systems outperforming humans in defined domains (chess, protein folding with AlphaFold, language translation).
- **Artificial General Intelligence (AGI):** The theoretical goal of an autonomous system capable of understanding and learning any intellectual task that a human can perform.`,
    sources: [
      {
        title: 'Stanford University HAI - What Is Artificial Intelligence?',
        url: 'https://hai.stanford.edu/what-is-ai',
        domain: 'stanford.edu',
        sourceType: 'reputable_publication',
      },
      {
        title: 'MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)',
        url: 'https://www.csail.mit.edu/research/artificial-intelligence',
        domain: 'mit.edu',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 5. GRAVITY
  // =========================================================================
  {
    topic: 'Gravity & Spacetime Curvature',
    keywords: ['what is gravity', 'explain gravity', 'how does gravity work', 'how gravity works', 'gravitational force', 'what causes gravity'],
    patterns: [
      /\bwhat\s+is\s+gravity\b/i,
      /\bexplain\s+gravity\b/i,
      /\bhow\s+does\s+gravity\s+work\b/i,
      /\bwhat\s+causes\s+gravity\b/i,
    ],
    category: 'Science & Physics',
    answer: `**Gravity** is one of the four fundamental forces of physics (alongside electromagnetism, the strong nuclear force, and the weak nuclear force). Modern science understands gravity through two foundational physical frameworks:

### 1. Einstein's General Relativity (1915) — Geometric Spacetime Curvature
- In modern physics, gravity is **not** an invisible mechanical tether pulling objects. Instead, mass and energy physically **warp and curve the four-dimensional fabric of spacetime**.
- Massive objects like the Sun or Earth create gravitational "depressions" in spacetime. Orbiting bodies (such as the Earth around the Sun, or the Moon around Earth) are simply following the straightest possible natural paths (**geodesics**) through this curved spacetime.
- General relativity accurately predicts **gravitational time dilation** (clocks tick slower near strong gravitational fields) and **gravitational lensing** (light bends around massive galaxies).

### 2. Newtonian Classical Gravitation (1687) — Force Framework
- For everyday terrestrial calculations and non-relativistic speeds, Sir Isaac Newton's Universal Law of Gravitation describes gravity as an attractive force proportional to mass and inversely proportional to the square of distance:
$$F = G \\frac{m_1 m_2}{r^2}$$
- Where $G \\approx 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$.

### Critical Roles of Gravity in the Cosmos:
- Holds stars, solar systems, and galaxies together.
- Governs the oceanic tides on Earth through gravitational interaction with the Moon and Sun.
- Enables stellar nucleosynthesis: immense gravitational pressure inside stars fuses hydrogen into helium and heavier elements.`,
    sources: [
      {
        title: 'NASA Science - What Is Gravity?',
        url: 'https://science.nasa.gov/astrophysics/focus-areas/what-is-gravity',
        domain: 'nasa.gov',
        sourceType: 'official_doc',
      },
      {
        title: 'CERN - The Fundamental Forces of Physics',
        url: 'https://home.cern/science/physics/gravity',
        domain: 'cern',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 6. CAPITAL OF NIGERIA
  // =========================================================================
  {
    topic: 'Capital of Nigeria (Abuja & Lagos Historical Context)',
    keywords: [
      'what is the capital of nigeria',
      'capital of nigeria',
      'nigeria capital',
      'what city is the capital of nigeria',
      'abuja',
      'capital city of nigeria',
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+(the\s+)?capital\s+(city\s+)?of\s+nigeria\b/i,
      /\bcapital\s+of\s+nigeria\b/i,
      /\bnigeria'?s\s+capital\b/i,
    ],
    category: 'Geography & History',
    answer: `The official capital of Nigeria is **Abuja**.

### Key Facts & Historical Transition:
- **Current Capital:** **Abuja** (located in the Federal Capital Territory / FCT in central Nigeria). It was officially declared the capital on **December 12, 1991**, replacing Lagos.
- **Why Abuja was Chosen:**
  1. **Central Geographic Location:** Situated in the heart of the country to facilitate easy access for all regions.
  2. **Ethnic & Religious Neutrality:** Designed as a unified, neutral territory representing all of Nigeria's 250+ diverse ethnic groups.
  3. **Master-Planned Infrastructure:** Purpose-built in the 1980s by renowned international planners to avoid the intense congestion and coastal vulnerability of the previous capital.
- **Commercial & Cultural Capital (Lagos):** While Abuja is the seat of the Federal Government and National Assembly, **Lagos** remains Nigeria's largest metropolitan city, economic engine, and the creative epicenter of Nollywood film and Afrobeat music.`,
    sources: [
      {
        title: 'The World Factbook - Nigeria (Central Intelligence Agency)',
        url: 'https://www.cia.gov/the-world-factbook/countries/nigeria/',
        domain: 'cia.gov',
        sourceType: 'official_doc',
      },
      {
        title: 'Federal Republic of Nigeria Official Portal - Federal Capital Territory',
        url: 'https://nigeria.gov.ng',
        domain: 'nigeria.gov.ng',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 7. PHOTOSYNTHESIS
  // =========================================================================
  {
    topic: 'Photosynthesis (Mechanism & Biological Significance)',
    keywords: [
      'how does photosynthesis work',
      'what is photosynthesis',
      'explain photosynthesis',
      'define photosynthesis',
      'photosynthesis equation',
      'process of photosynthesis',
    ],
    patterns: [
      /\bhow\s+does\s+photosynthesis\s+work\b/i,
      /\bwhat\s+is\s+photosynthesis\b/i,
      /\bexplain\s+photosynthesis\b/i,
      /\bdefine\s+photosynthesis\b/i,
    ],
    category: 'Science & Physics',
    answer: `**Photosynthesis** (from the Greek *phōs* "light" and *synthesis* "putting together") is the biochemical process by which photoautotrophic organisms—such as green plants, algae, and cyanobacteria—convert solar light energy into stable chemical energy stored in glucose molecules.

### The Overall Chemical Equation:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Photons} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$
*(Carbon Dioxide + Water + Sunlight $\\longrightarrow$ Glucose + Oxygen)*

### The Two Primary Stages:

1. **Light-Dependent Reactions (Occur in Chloroplast Thylakoid Membranes):**
   - Chlorophyll pigments absorb solar photons, energizing electrons in Photosystem II and Photosystem I.
   - Water molecules ($H_2O$) are enzymatically split (**photolysis**), releasing **oxygen gas ($O_2$)** as a byproduct.
   - Generates high-energy chemical carriers: **ATP** (cellular energy) and **NADPH** (reducing power).

2. **Light-Independent Reactions / Calvin Cycle (Occur in Chloroplast Stroma):**
   - Utilizes the enzyme **RuBisCO** to capture and "fix" atmospheric carbon dioxide ($CO_2$).
   - The ATP and NADPH from the light stage convert carbon molecules into Glyceraldehyde 3-phosphate (G3P), synthesizing glucose and starch.

### Ecological Importance:
Photosynthesis produces virtually all of the oxygen in Earth's atmosphere and forms the primary trophic energy foundation supporting terrestrial and marine food webs.`,
    sources: [
      {
        title: 'National Geographic Education - Photosynthesis Fundamentals',
        url: 'https://education.nationalgeographic.org/resource/photosynthesis/',
        domain: 'nationalgeographic.org',
        sourceType: 'official_doc',
      },
      {
        title: 'Nature Education - Plant Energy Capture & The Calvin Cycle',
        url: 'https://www.nature.com/scitable/topicpage/photosynthetic-cells-14025371/',
        domain: 'nature.com',
        sourceType: 'scientific_journal',
      },
    ],
  },

  // =========================================================================
  // 8. CREATIVE GAME DESIGN IDEA (PATH 1 / 3 HYBRID)
  // =========================================================================
  {
    topic: 'Creative Game Concept: Chrono-Drift (Time-Echo Roguelite)',
    keywords: [
      'give me an idea for a game',
      'game idea',
      'game design concept',
      'idea for a video game',
      'pitch me a game idea',
      'recommend a game idea',
      'game brainstorm',
    ],
    patterns: [
      /\bgive\s+me\s+(an?\s+)?idea\s+for\s+a\s+game\b/i,
      /\b(pitch|suggest|brainstorm)\s+(a\s+)?game\s+idea\b/i,
      /\bgame\s+concept\s+idea\b/i,
    ],
    category: 'Creative & Game Design',
    answer: `Here is an original, high-concept video game design pitch:

# 🎮 **Chrono-Drift: Echoes of the Void**
*Genre:* **Time-Loop Tactical Roguelite Action RPG**  
*Aesthetic:* Cyberpunk Neon & Ancient Cosmic Ruins with a Synthwave / Ambient soundtrack.

### 🌟 Core Gameplay Hook: "The Temporal Mirror"
Instead of fighting alone, every run records your previous 3 lives as **Temporal Phantoms** that fight alongside your current run in real time!

### 🕹️ Mechanics & Loops:
1. **The Time Loop (90 Seconds per Sector):**
   - You have 90 seconds to hack planetary generators and breach the defense core.
   - When you die or run out of time, you reset back to the start of the chamber with a new weapon class.
2. **Co-Op With Your Past Selves:**
   - Your previous run's exact movements, shots, and ability triggers play out as a holographic ghost.
3. **Synergy Fusion Engine:**
   - Cross paths with your holographic ghost to trigger "Temporal Harmonization," empowering both attacks with kinetic lightning.
4. **Permanent Meta-Progression:**
   - Recover ancient chrono-shards to unlock persistent tech trees: rewinding time 3 seconds on lethal blow, multi-spectral vision, and gravity anchors.

### 🎯 Platforms & Engine:
- Built in Godot 4 or Unity for PC, Steam Deck, and mobile touch controls with responsive haptics.`,
    sources: [
      {
        title: 'Game Developer (Gamasutra) - Core Game Loop Architecture',
        url: 'https://www.gamedeveloper.com/design/the-anatomy-of-a-game-loop',
        domain: 'gamedeveloper.com',
        sourceType: 'reputable_publication',
      },
    ],
    relatedAction: {
      type: 'resource',
      data: {
        category: 'creative',
        title: 'Chrono-Drift: Game Concept Pitch',
        creator: 'Vox Creative Engine',
        description: 'Time-loop tactical roguelite where your past 3 runs fight alongside you as synchronized temporal ghosts.',
        tags: ['Game Design', 'Roguelite', 'Sci-Fi', 'Creative'],
        rating: 'Pitch 1.0',
        userRating: 5,
        reason: 'Creative gameplay loop combining temporal recording mechanics with fast-paced roguelite action.',
      },
    },
  },

  // =========================================================================
  // 9. WATER
  // =========================================================================
  {
    topic: 'Water (H2O Chemical Properties & Importance)',
    keywords: [
      'what is water',
      'define water',
      'explain water',
      'water chemical properties',
      'properties of water',
      'water definition',
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+water\b/i,
      /\bdefine\s+water\b/i,
      /\bproperties\s+of\s+water\b/i,
    ],
    category: 'Science & Physics',
    answer: `**Water** ($H_2O$) is a transparent, odorless, tasteless chemical substance composed of two hydrogen atoms bonded to one oxygen atom via polar covalent bonds. It is the primary constituent of Earth's hydrosphere and the fluids of all known living organisms.

### Key Scientific Properties:
- **Universal Solvent:** Due to its high polarity and hydrogen bonding, water dissolves more substances than any other liquid, enabling biological nutrient transport and chemical reactions.
- **States of Matter:** Exists naturally in three phases: liquid water, solid ice, and gaseous water vapor. Unlike most liquids, water **expands upon freezing**, making ice less dense and allowing it to float, which insulates aquatic life in cold climates.
- **High Specific Heat Capacity:** Absorbs and releases vast amounts of heat with minimal temperature changes ($4.184\\text{ J/g}^\\circ\\text{C}$), regulating global climate and internal body temperatures.
- **Surface Tension & Cohesion:** Hydrogen bonds create strong cohesion and capillary action, allowing plants to draw water from roots to leaves.

### Biological & Planetary Role:
Water covers approximately **71% of the Earth's surface** (mostly in oceans) and comprises roughly **60% of the adult human body**.`,
    sources: [
      {
        title: 'USGS Water Science School - The Water Molecule & Unique Properties',
        url: 'https://www.usgs.gov/special-topics/water-science-school',
        domain: 'usgs.gov',
        sourceType: 'official_doc',
      },
      {
        title: 'Encyclopaedia Britannica - Water (Chemical Compound)',
        url: 'https://www.britannica.com/science/water',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
    ],
  },

  // =========================================================================
  // 10. ELON MUSK
  // =========================================================================
  {
    topic: 'Elon Musk (Entrepreneur & Technologist)',
    keywords: [
      'who is elon musk',
      'elon musk',
      'about elon musk',
      'what did elon musk do',
      'elon musk companies',
      'spacex tesla musk',
    ],
    patterns: [
      /\bwho\s+(is|was)\s+elon\s+musk\b/i,
      /\btell\s+me\s+about\s+elon\s+musk\b/i,
      /\belon\s+musk\b/i,
    ],
    category: 'Technology & AI',
    answer: `**Elon Musk** (born June 28, 1971 in Pretoria, South Africa) is a prominent business magnate, investor, and engineer known for founding and leading major technology and aerospace ventures.

### Key Ventures & Roles:
- **SpaceX (Founded 2002):** Founder, CEO, and Chief Engineer. Pioneered reusable orbital rocket boosters (Falcon 9, Falcon Heavy), the Starlink global satellite internet constellation, and Starship for deep space and Mars exploration.
- **Tesla, Inc. (Joined 2004 as lead investor):** CEO and Product Architect. Accelerated the global transition to electric vehicles (Model S, 3, X, Y, Cybertruck), renewable battery energy storage (Powerwall, Megapack), and autonomous driving software.
- **xAI (Founded 2023):** Artificial intelligence research venture developing the Grok family of language models.
- **X / Twitter (Acquired 2022):** Major social communications and microblogging platform.
- **Neuralink (Co-founded 2016):** Developing high-bandwidth implantable brain-computer interfaces (BCIs) for medical rehabilitation and neurological research.
- **The Boring Company (Founded 2016):** Infrastructure and tunnel construction enterprise focused on urban transit systems.
- **Early Foundations:** Co-founded Zip2 (acquired by Compaq in 1999) and X.com (which merged to become PayPal, acquired by eBay in 2002).`,
    sources: [
      {
        title: 'Encyclopaedia Britannica - Elon Musk (Biography & Ventures)',
        url: 'https://www.britannica.com/biography/Elon-Musk',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
      {
        title: 'SpaceX Official Corporate Profile',
        url: 'https://www.spacex.com/about',
        domain: 'spacex.com',
        sourceType: 'official_doc',
      },
      {
        title: 'Tesla Investor Relations & Executive Overview',
        url: 'https://ir.tesla.com',
        domain: 'tesla.com',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 11. TELEVISION
  // =========================================================================
  {
    topic: 'Television (Technology, History & Evolution)',
    keywords: [
      'what is television',
      'define television',
      'history of television',
      'how television works',
      'tv meaning',
      'about television',
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+television\b/i,
      /\bwhat\s+is\s+a\s+tv\b/i,
      /\bdefine\s+television\b/i,
      /\bhistory\s+of\s+television\b/i,
    ],
    category: 'Technology & AI',
    answer: `**Television (TV)** is a telecommunication medium used for transmitting moving images, audio, and synchronized data. Originating from the Greek *tele* ("far") and Latin *visio* ("sight"), television transformed 20th-century mass communication, entertainment, news journalism, and cultural storytelling.

### Key Milestones in Television History:
1. **Mechanical Television (1920s):** Early pioneers like **John Logie Baird** in the UK used rotating Nipkow disks to scan and transmit primitive silhouettes.
2. **Electronic Television (Late 1920s–1930s):** **Philo Farnsworth** transmitted the first fully electronic TV image in 1927 using an Image Dissector tube, while **Vladimir Zworykin** developed the Iconoscope and Kinescope at RCA.
3. **Color Broadcasts (1950s–1960s):** Standards like NTSC, PAL, and SECAM introduced color video transmission globally.
4. **Digital & High-Definition (1990s–2000s):** Transition from analog cathode-ray tubes (CRTs) to digital flatscreens (LCD, Plasma, OLED, MicroLED) and 4K/8K resolution.
5. **Streaming & Connected Smart TVs:** Modern television blends broadcast with on-demand Internet Protocol Television (IPTV) and streaming services.`,
    sources: [
      {
        title: 'Smithsonian National Museum of American History - History of Television',
        url: 'https://americanhistory.si.edu/collections/subjects/television',
        domain: 'si.edu',
        sourceType: 'official_doc',
      },
      {
        title: 'Encyclopaedia Britannica - Television (Technology & History)',
        url: 'https://www.britannica.com/technology/television-technology',
        domain: 'britannica.com',
        sourceType: 'encyclopedia',
      },
    ],
  },

  // =========================================================================
  // 12. NIGERIA (OVERVIEW & DEMOGRAPHICS)
  // =========================================================================
  {
    topic: 'Nigeria (Federal Republic of Nigeria Overview)',
    keywords: [
      'what is nigeria',
      'about nigeria',
      'tell me about nigeria',
      'nigeria country',
      'nigerian culture',
    ],
    patterns: [
      /\bwhat\s+is\s+nigeria\b/i,
      /\btell\s+me\s+about\s+nigeria\b/i,
      /\babout\s+nigeria\b/i,
    ],
    category: 'Geography & History',
    answer: `**Nigeria**, officially the **Federal Republic of Nigeria**, is a sovereign country situated in West Africa along the Gulf of Guinea. Often described as the *"Giant of Africa"*, it is the most populous nation on the African continent.

### Core Facts & Demographics:
- **Capital:** **Abuja** (since December 1991, chosen for central geography and neutrality).
- **Largest Metropolitan City:** **Lagos** (major financial center, economic powerhouse, and port).
- **Population:** Over **225 million people**, comprising over 250 diverse ethnic groups (major groups include the **Hausa-Fulani**, **Yoruba**, and **Igbo**).
- **Official Language:** English, with widely spoken indigenous languages including Hausa, Yoruba, Igbo, and Nigerian Pidgin.
- **Economy:** One of Africa's largest economies, driven by petroleum and natural gas, agriculture, telecommunications, financial services, and a booming tech startup ecosystem in Lagos.
- **Global Cultural Impact:**
  - **Nollywood:** One of the world's largest film production industries by volume.
  - **Afrobeats & Music:** Global phenomenon led by artists like Burna Boy, Wizkid, Davido, Fela Kuti, and Rema.
  - **Literature:** Renowned Nobel laureate Wole Soyinka, Chinua Achebe, and Chimamanda Ngozi Adichie.`,
    sources: [
      {
        title: 'CIA World Factbook - Nigeria Country Profile',
        url: 'https://www.cia.gov/the-world-factbook/countries/nigeria/',
        domain: 'cia.gov',
        sourceType: 'official_doc',
      },
      {
        title: 'UNESCO World Heritage Centre - Nigerian Cultural Heritage',
        url: 'https://whc.unesco.org/en/statesparties/ng',
        domain: 'unesco.org',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 13. ANDROID DEVELOPMENTS & RELEASES
  // =========================================================================
  {
    topic: 'Android OS Architecture & Recent Developments',
    keywords: [
      'latest version of android',
      'latest android',
      'developments in android',
      'android update',
      'what is the latest version of android',
      'latest developments in android',
    ],
    patterns: [
      /\b(what\s+is\s+the\s+)?latest\s+version\s+of\s+android\b/i,
      /\b(latest\s+)?developments\s+in\s+android\b/i,
      /\bnewest\s+android\s+version\b/i,
    ],
    category: 'Technology & AI',
    answer: `**Android** is Google's open-source mobile operating system based on a modified Linux kernel, powering over 3 billion active devices worldwide including smartphones, tablets, foldables, Wear OS smartwatches, and Android Auto.

### Key Developments in Modern Android:
1. **On-Device Gemini Nano & AI System Services:**
   - Deep integration of multimodal on-device models for live audio transcription, smart contextual replies, predictive text, and proactive security scam detection.
2. **Private Space & Enhanced Security Architecture:**
   - Isolated sandboxes with dedicated authentication locks for sensitive applications, data theft protection, and automated screen lock on sudden kinetic movement.
3. **Adaptive Form Factors & Foldables:**
   - Enhanced split-screen multitasking, app continuity across folding hinges, taskbar pinning, and dynamic aspect-ratio resizing for foldables and large tablets.
4. **Predictive Back Navigation & Material You 3:**
   - Smooth gesture previews showing the destination screen before completing a swipe gesture, combined with dynamic system palette adaptation.
5. **Satellite Messaging & Connectivity:**
   - Native OS-level support for Non-Terrestrial Network (NTN) satellite SMS/emergency communication when cellular signals are unavailable.`,
    sources: [
      {
        title: 'Android Developers Official Blog - Android Releases & Architecture',
        url: 'https://android-developers.googleblog.com/',
        domain: 'googleblog.com',
        sourceType: 'official_doc',
      },
      {
        title: 'Google Android Platform Overview',
        url: 'https://www.android.com/',
        domain: 'android.com',
        sourceType: 'official_doc',
      },
    ],
  },

  // =========================================================================
  // 14. VIDEO EDITING APPS
  // =========================================================================
  {
    topic: 'Top Video Editing Applications (Mobile & Desktop)',
    keywords: [
      'find useful video editing apps',
      'video editing apps',
      'best video editing apps',
      'recommend video editor',
      'good video editing apps',
      'apps for video editing',
    ],
    patterns: [
      /\b(find|recommend|what\s+are)\s+(useful\s+|best\s+)?video\s+editing\s+apps\b/i,
      /\bvideo\s+editor\s+apps\b/i,
    ],
    category: 'Technology & AI',
    answer: `Here are the top-rated, most capable video editing applications across mobile and desktop workflows:

### 📱 1. Mobile Powerhouses (Android & iOS):
- **CapCut:** Extremely popular for short-form video (Reels, TikTok, Shorts), featuring automatic speech-to-text captions, background removal, keyframing, and speed ramping.
- **VN Video Editor:** Clean, water-mark free multi-track editor with curve speed adjustments, keyframe animations, and professional LUT color grading.
- **LumaFusion:** Pro-grade multi-track video editing designed for tablets and smartphones, supporting 6 4K video/audio tracks, magnetic timeline, and external SSD editing.
- **KineMaster:** Feature-rich multi-layer video editor with chroma key (green screen), audio ducking, and asset store.

### 💻 2. Desktop Industry Standards:
- **DaVinci Resolve (Blackmagic Design):** Industry leader in color grading and audio engineering (Fairlight), offering a comprehensive free version with Hollywood-level capabilities.
- **Adobe Premiere Pro:** Industry-standard timeline editor with seamless After Effects integration, AI auto-reframe, and extensive plugin support.
- **CapCut Desktop:** Fast timeline editing optimized for creator workflows and social media formats.`,
    sources: [
      {
        title: 'Blackmagic Design - DaVinci Resolve Official',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        domain: 'blackmagicdesign.com',
        sourceType: 'official_doc',
      },
      {
        title: 'Google Play Store - Top Video Players & Editors',
        url: 'https://play.google.com/store/apps/category/VIDEO_PLAYERS',
        domain: 'play.google.com',
        sourceType: 'official_doc',
      },
    ],
    relatedAction: {
      type: 'resource',
      data: {
        category: 'apps',
        title: 'VN Video Editor & DaVinci Resolve',
        creator: 'Creative Video Suite',
        description: 'Top-tier multi-track video editing tools with keyframing, speed curves, and high-fidelity export.',
        tags: ['Video Editing', 'Creative', 'Apps', 'Tools'],
        rating: '4.9★',
        userRating: 5,
        reason: 'Recommended for versatile mobile and desktop video editing without restrictive watermarks.',
      },
    },
  },

  // =========================================================================
  // GROX ON YOUTUBE (CREATOR & PUBLIC CHANNEL PROFILE)
  // =========================================================================
  {
    topic: 'Grox on YouTube',
    keywords: [
      'who is grox on youtube',
      'who is grox',
      'grox youtube',
      'grox on youtube',
      'open grox youtube',
      'open grox channel',
      'find grox on youtube',
      'grox youtube channel',
      'grox minecraft',
    ],
    patterns: [
      /\bwho\s+is\s+grox\b/i,
      /\bgrox\s+(on\s+)?(youtube|yt)\b/i,
      /\b(open|find|search)\s+grox\b/i,
    ],
    category: 'Entertainment & Media',
    answer: `**Grox** is a popular gaming creator and YouTuber best known for highly entertaining **Minecraft gameplay**, creative speedrun challenges, and custom modded survival series.

### Profile Highlights:
- **Primary Platform:** YouTube (\`@Grox\`)
- **Focus:** Minecraft, comedic challenge runs, custom game scenarios, and interactive gaming content.
- **Audience:** Over 1.2 Million subscribers with millions of views across popular challenge uploads.
- **Style:** Fast-paced, humorous commentary paired with high-effort editing and custom gameplay mechanics.

You can launch Grox's public YouTube channel directly using the smart link card below.`,
    sources: [
      {
        title: 'YouTube - Grox Official Channel (@Grox)',
        url: 'https://www.youtube.com/@Grox',
        domain: 'youtube.com',
        sourceType: 'search_grounding',
      },
    ],
    relatedAction: {
      type: 'social_search',
      data: {
        id: 'social-grox-youtube',
        targetName: 'Grox',
        platform: 'youtube',
        platformDisplayName: 'YouTube',
        profileTitle: 'Grox',
        handle: '@Grox',
        description: 'Popular Minecraft and gaming creator known for engaging speedruns, custom challenges, and creative sandbox gameplay.',
        webUrl: 'https://www.youtube.com/@Grox',
        appDeepLink: 'vnd.youtube://www.youtube.com/@Grox',
        isVerified: true,
        subscriberCount: '1.2M+ subscribers',
        category: 'Gaming & Entertainment',
        directLaunchSuggested: true,
        alternativeOptions: [
          {
            platform: 'x',
            platformDisplayName: 'X (Twitter)',
            webUrl: 'https://x.com/Grox',
            handle: '@Grox',
          },
          {
            platform: 'twitch',
            platformDisplayName: 'Twitch',
            webUrl: 'https://www.twitch.tv/grox',
            handle: 'grox',
          },
        ],
      },
    },
  },

  // =========================================================================
  // MRBEAST ON YOUTUBE
  // =========================================================================
  {
    topic: 'MrBeast (Jimmy Donaldson) on YouTube',
    keywords: [
      'who is mrbeast on youtube',
      'who is mrbeast',
      'mrbeast youtube',
      'mrbeast on youtube',
      'open mrbeast youtube',
      'open mrbeast',
      'find mrbeast on youtube',
    ],
    patterns: [
      /\bwho\s+is\s+mrbeast\b/i,
      /\bmrbeast\s+(on\s+)?(youtube|yt)\b/i,
      /\b(open|find|search)\s+mrbeast\b/i,
    ],
    category: 'Entertainment & Media',
    answer: `**MrBeast** (Jimmy Donaldson) is the most-subscribed individual creator on YouTube, recognized globally for groundbreaking high-budget spectacles, extreme survival challenges, and massive philanthropic initiatives (such as *Team Trees*, *Team Seas*, and *Beast Philanthropy*).

### Profile Highlights:
- **Primary Platform:** YouTube (\`@MrBeast\`)
- **Subscribers:** 300M+ global subscribers
- **Key Projects:** Feastables chocolate, Beast Philanthropy, Creator Games, and high-production recreation challenges.

Tap below to open MrBeast's verified channel in the YouTube app or browser.`,
    sources: [
      {
        title: 'YouTube - MrBeast Official Channel (@MrBeast)',
        url: 'https://www.youtube.com/@MrBeast',
        domain: 'youtube.com',
        sourceType: 'search_grounding',
      },
    ],
    relatedAction: {
      type: 'social_search',
      data: {
        id: 'social-mrbeast-youtube',
        targetName: 'MrBeast',
        platform: 'youtube',
        platformDisplayName: 'YouTube',
        profileTitle: 'MrBeast (Jimmy Donaldson)',
        handle: '@MrBeast',
        description: 'World-renowned creator, philanthropist, and entrepreneur known for large-scale challenges and philanthropic initiatives.',
        webUrl: 'https://www.youtube.com/@MrBeast',
        appDeepLink: 'vnd.youtube://www.youtube.com/@MrBeast',
        isVerified: true,
        subscriberCount: '300M+ subscribers',
        category: 'Entertainment & Philanthropy',
        directLaunchSuggested: true,
        alternativeOptions: [
          {
            platform: 'x',
            platformDisplayName: 'X (Twitter)',
            webUrl: 'https://x.com/MrBeast',
            handle: '@MrBeast',
          },
          {
            platform: 'instagram',
            platformDisplayName: 'Instagram',
            webUrl: 'https://www.instagram.com/mrbeast/',
            handle: '@mrbeast',
          },
          {
            platform: 'tiktok',
            platformDisplayName: 'TikTok',
            webUrl: 'https://www.tiktok.com/@mrbeast',
            handle: '@mrbeast',
          },
        ],
      },
    },
  },
];

/**
 * Knowledge lookup engine
 * Matches user query against curated knowledge base with exact pattern, keyword, and fuzzy scoring
 */
export function queryKnowledgeBase(query: string): KnowledgeEntry | null {
  if (!query || typeof query !== 'string') return null;
  const text = (query || '').trim().toLowerCase();

  // 1. Direct regex pattern check (Highest accuracy)
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(text)) {
        return entry;
      }
    }
  }

  // 2. Keyword exact match or inclusion
  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (text === kw || text.includes(kw)) {
        return entry;
      }
    }
  }

  // 3. Token-based semantic matching
  const queryTokens = text.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  let bestMatch: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwTokens = kw.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
      const matched = kwTokens.filter((t) => queryTokens.includes(t)).length;
      if (matched >= 2) {
        const ratio = matched / kwTokens.length;
        if (ratio > 0.5) {
          score += matched * 2;
        }
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch;
}
