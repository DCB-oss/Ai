// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// src/services/intentClassifier.ts
function classifyIntent(query) {
  const text = (query || "").trim().toLowerCase();
  if (text.includes("who founded anivox") || text.includes("founder of anivox") || text.includes("who is the founder of anivox") || text.includes("who owns anivox") || text.includes("who created anivox") || text.includes("who are the founders") || text.includes("anivox founder") || text.includes("who made anivox") || text.includes("who built anivox")) {
    return {
      intent: "GENERAL_KNOWLEDGE",
      confidence: 1,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.includes("join the anivox team") || text.includes("join anivox") || text.includes("work with anivox") || text.includes("contact the founders") || text.includes("contact anivox team") || text.includes("how can i join the anivox team") || text.includes("how do i contact the founders") || text.includes("how can i work with anivox")) {
    return {
      intent: "GENERAL_KNOWLEDGE",
      confidence: 1,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.includes("do you pay team members") || text.includes("can i get paid") || text.includes("does anivox pay") || text.includes("is anivox paid") || text.includes("are positions paid") || text.includes("do you pay") || text.includes("team salary") || text.includes("payment for joining anivox")) {
    return {
      intent: "GENERAL_KNOWLEDGE",
      confidence: 1,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.includes("xbox link") || text.includes("where can i find xbox") || text.includes("give me the xbox link") || text.includes("where is the game") || text.includes("where can i find novaverse") || text.includes("novaverse link") || text.includes("open the anivox website") || text.includes("anivox website") || text.includes("give me the official youtube channel")) {
    return {
      intent: "OPEN_LINK",
      confidence: 1,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.startsWith("generate an image") || text.startsWith("generate a picture") || text.startsWith("create an image") || text.startsWith("create a picture") || text.startsWith("draw an image") || text.startsWith("draw a picture") || text.startsWith("make an image") || text.startsWith("make a picture") || text.startsWith("vox, generate an image") || text.startsWith("vox generate an image") || text.startsWith("vox draw") || text.includes("generate an image of") || text.includes("generate a picture of") || text.includes("draw a picture of") || text.includes("create an image of")) {
    return {
      intent: "IMAGE_GENERATION",
      confidence: 0.99,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.includes("audiomack") || text.startsWith("play ") && (text.includes("song") || text.includes("music") || text.includes("album") || text.includes("artist") || text.includes("track"))) {
    return {
      intent: text.includes("audiomack") ? "AUDIOMACK_PLAY" : "MEDIA_CONTROL",
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.includes("battery") || text.includes("storage") || text.includes("storage space") || text.includes("free space") || text.includes("device status") || text.includes("check battery")) {
    return {
      intent: text.includes("battery") ? "BATTERY_INFO" : "STORAGE_INFO",
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.startsWith("weather") || text.includes("what is the weather") || text.includes("what's the weather") || text.includes("weather in ") || text.includes("weather for ") || text.includes("is it raining") || text.includes("forecast in ")) {
    return {
      intent: "WEATHER",
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if ((text.includes("what time is it") || text.includes("what's the time") || text.includes("current time in ") || text.startsWith("time in ")) && (text.includes(" in ") || text.includes(" at ") || text.includes("tokyo") || text.includes("london") || text.includes("new york") || text.includes("paris") || text.includes("lagos"))) {
    return {
      intent: "TIME_QUERY",
      confidence: 0.96,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  const isCallCommand = text.startsWith("call ") || text.startsWith("phone ") || text.startsWith("dial ") || text.startsWith("place a call to ") || text.startsWith("ring ") || text.startsWith("vox call ") || text.startsWith("vox, call ") || text.startsWith("hey vox, call ") || text === "call" || text === "hang up" || text === "end call" || text === "cancel call" || text.includes("call mom") || text.includes("call dad") || text.includes("call my ") || text.includes("on sim 1") || text.includes("on sim 2") || text.includes("using sim 1") || text.includes("using sim 2");
  if (isCallCommand) {
    return {
      intent: "PHONE_CALL",
      confidence: 0.98,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.includes("visit our channel") || text.includes("open our channel") || text.includes("anivox channel") || text.includes("dcb channel") || text.includes("@dcb-q2x7j") || text.includes("dcb-q2x7j")) {
    return {
      intent: "OPEN_LINK",
      confidence: 0.99,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  const isSocialQuery = text.includes("youtube") || text.includes("yt channel") || text.includes("on yt") || text.includes("instagram") || text.includes("insta") || text.includes("on ig") || text.includes("tiktok") || text.includes("tik tok") || text.includes("on x") || text.includes("on twitter") || text.includes("twitter") || text.includes("reddit") || text.includes("subreddit") || text.includes("facebook") || text.includes("linkedin") || text.includes("pinterest") || text.includes("snapchat") || text.includes("twitch") || text.includes("spotify") || text.includes("discord");
  const isSocialAction = text.startsWith("who is ") || text.startsWith("open ") || text.startsWith("find ") || text.startsWith("search for ") || text.startsWith("show me ") || text.startsWith("take me to ") || text.startsWith("look up ") || text.includes("channel") || text.includes("profile") || text.includes("creator") || text.includes("account") || text.includes("page");
  if (isSocialQuery && isSocialAction) {
    return {
      intent: "SOCIAL_SEARCH",
      confidence: 0.95,
      requiresSearch: true,
      isFactualQuery: true
    };
  }
  if (text.startsWith("open the website") || text.startsWith("open website") || text.startsWith("open this website") || text.startsWith("open official website") || text.startsWith("find their official page") || text.startsWith("take me to their official") || text.startsWith("go to https://") || text.startsWith("open https://") || text.startsWith("visit ")) {
    return {
      intent: "OPEN_LINK",
      confidence: 0.95,
      requiresSearch: true,
      isFactualQuery: true
    };
  }
  if (text.includes("dark mode") || text.includes("light mode") || text.includes("cyberpunk") || text.includes("voice responses") || text.includes("auto speak") || text.includes("orb speed") || text.includes("text size") || text.includes("font size") || text.includes("mute") || text.includes("unmute") || text.includes("volume") || text.includes("louder") || text.includes("softer") || text.includes("quieter") || text.includes("turn it up") || text.includes("turn it down") || text.includes("lock the app") || text.includes("lock assistant") || text.includes("open settings") || text.includes("device controls") || text.includes("stop speaking")) {
    return {
      intent: "DEVICE_SETTING",
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.match(/(?:start|set|create)?\s*(?:a)?\s*timer\s*(?:for)?\s*\d+/i) || text.match(/\d+\s*(?:minute|min|second|sec|hour|hr)s?\s*timer/i) || text.startsWith("note:") || text.includes("create a note") || text.includes("take a note") || text.includes("write down") || text.includes("remind me to") || text.includes("add task") || text.includes("todo:")) {
    return {
      intent: "UTILITY_ACTION",
      confidence: 0.95,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  const isExplicitPreference = (text.startsWith("i love ") || text.startsWith("i like ") || text.startsWith("i prefer ") || text.startsWith("i enjoy ") || text.startsWith("my favorite ") || text.includes("remember that i ") || text.includes("remember my ") || text.startsWith("please remember that ")) && !text.startsWith("what ") && !text.startsWith("why ") && !text.startsWith("how ") && !text.startsWith("who ") && !text.startsWith("when ");
  if (isExplicitPreference) {
    return {
      intent: "PERSONAL_MEMORY",
      confidence: 0.9,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  if (text.startsWith("recommend") || text.includes("recommend me") || text.includes("give me a recommendation") || text.includes("suggestions for") || text.includes("what should i watch") || text.includes("what should i play") || text.includes("what should i read") || text.includes("best video editor") || text.includes("best app for") || text.includes("good free") || text.includes("similar to") || text.includes("more like this")) {
    const isCurrent = text.includes("new ") || text.includes("newest") || text.includes("latest") || text.includes("popular") || text.includes("popular right now") || text.includes("this week") || text.includes("this month") || text.includes("this year") || text.includes("trending") || text.includes("2024") || text.includes("2025") || text.includes("2026");
    return {
      intent: "RECOMMENDATION",
      confidence: 0.9,
      requiresSearch: isCurrent,
      isFactualQuery: false
    };
  }
  if (text.includes("latest") || text.includes("newest") || text.includes("new release") || text.includes("new games") || text.includes("new movies") || text.includes("new phones") || text.includes("developments in") || text.includes("popular right now") || text.includes("trending right now") || text.includes("latest version") || text.includes("this week") || text.includes("today") || text.includes("right now") || text.includes("recent news") || text.includes("current price") || text.includes("weather today") || text.includes("came out this week") || text.includes("upcoming movies") || text.includes("who won the last") || text.includes("stock price") || text.includes("breaking news") || text.includes("current events") || text.includes("search the web") || text.includes("look up online")) {
    return {
      intent: "CURRENT_INFORMATION",
      confidence: 0.92,
      requiresSearch: true,
      isFactualQuery: true
    };
  }
  if (text.startsWith("how do i ") || text.startsWith("how to ") || text.startsWith("how can i ") || text.startsWith("steps to ") || text.includes("guide on ") || text.includes("how do you make")) {
    return {
      intent: "HOW_TO",
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.includes(" vs ") || text.includes(" versus ") || text.includes("difference between") || text.includes("compare ")) {
    return {
      intent: "COMPARISON",
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.startsWith("what is ") || text.startsWith("what are ") || text.startsWith("what does ") || text.startsWith("who is ") || text.startsWith("who was ") || text.startsWith("who invented ") || text.startsWith("where is ") || text.startsWith("why is ") || text.startsWith("why does ") || text.startsWith("how does ") || text.startsWith("explain ") || text.startsWith("define ") || text.includes("meaning of") || text.includes("capital of")) {
    return {
      intent: "GENERAL_KNOWLEDGE",
      confidence: 0.92,
      requiresSearch: false,
      isFactualQuery: true
    };
  }
  if (text.startsWith("write a ") || text.startsWith("generate a story") || text.startsWith("compose ") || text.startsWith("brainstorm ")) {
    return {
      intent: "CREATIVE_REQUEST",
      confidence: 0.85,
      requiresSearch: false,
      isFactualQuery: false
    };
  }
  return {
    intent: "GENERAL_CONVERSATION",
    confidence: 0.7,
    requiresSearch: false,
    isFactualQuery: false
  };
}

// src/services/knowledgeBase.ts
var KNOWLEDGE_BASE = [
  // =========================================================================
  // 0. ANIVOX FOUNDERS & OWNER (SAMUEL DAVID)
  // =========================================================================
  {
    topic: "AniVox Founders & Ownership",
    keywords: [
      "who founded anivox",
      "who is the founder of anivox",
      "who owns anivox",
      "who created anivox",
      "who are the founders",
      "founder of anivox",
      "founders of anivox",
      "anivox founder",
      "anivox creator",
      "who made anivox",
      "who built anivox",
      "samuel david"
    ],
    patterns: [
      /\bwho\s+(founded|is\s+the\s+founder\s+of|owns|created|are\s+the\s+founders\s+of|made|built)\s+anivox\b/i,
      /\b(founder|creator|owner)\s+of\s+anivox\b/i,
      /\bwho\s+(founded|owns|created)\s+(this\s+app|the\s+app|anivox)\b/i
    ],
    category: "Technology & AI",
    answer: `AniVox is founded/owned by **Samuel David**.

For more information about the founders, vision, and principles, visit **Settings \u2192 About AniVox \u2192 Founders**.`,
    sources: [
      {
        title: "AniVox Official Company & Executive Records",
        url: "https://youtube.com/@dcb-q2x7j",
        domain: "youtube.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "navigation",
      data: {
        screen: "settings",
        tab: "about",
        subtab: "founders"
      }
    }
  },
  // =========================================================================
  // 0b. JOIN THE ANIVOX TEAM & PUBLIC CONTACT
  // =========================================================================
  {
    topic: "Join the AniVox Team & Public Contact",
    keywords: [
      "how can i join the anivox team",
      "how to join anivox",
      "how do i contact the founders",
      "how can i work with anivox",
      "join the anivox team",
      "work with anivox",
      "contact anivox team",
      "contact the founders",
      "anivox team email"
    ],
    patterns: [
      /\bhow\s+(can|do)\s+i\s+(join|work\s+with|contact)\s+(the\s+)?(anivox\s+team|founders|anivox)\b/i,
      /\bjoin\s+(the\s+)?(anivox\s+team|anivox)\b/i,
      /\bcontact\s+(the\s+)?(founders|anivox\s+team)\b/i
    ],
    category: "Technology & AI",
    answer: `You can contact the AniVox team at our official public team address: **[ENTER OFFICIAL TEAM EMAIL HERE]** (or the address configured in Settings).

To view collaboration details, role inquiries, or update contact configuration, head over to **Settings \u2192 About AniVox \u2192 Join the Team**.`,
    sources: [
      {
        title: "AniVox Public Collaboration & Team Inquiries",
        url: "https://youtube.com/@dcb-q2x7j",
        domain: "youtube.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "navigation",
      data: {
        screen: "settings",
        tab: "about",
        subtab: "team"
      }
    }
  },
  // =========================================================================
  // 0c. ANIVOX TEAM PAYMENT & COMPENSATION POLICY
  // =========================================================================
  {
    topic: "AniVox Team Payment Policy",
    keywords: [
      "can i get paid",
      "do you pay team members",
      "does anivox pay",
      "is anivox paid",
      "are positions paid",
      "do you pay",
      "team salary",
      "payment for joining anivox",
      "compensation at anivox"
    ],
    patterns: [
      /\b(can\s+i\s+get\s+paid|do\s+you\s+pay|does\s+anivox\s+pay|is\s+it\s+paid|are\s+team\s+members\s+paid)\b/i,
      /\b(payment|salary|compensation)\s+(policy|for\s+team|at\s+anivox)\b/i
    ],
    category: "Technology & AI",
    answer: `At the moment, AniVox does not offer paid positions. Participation is voluntary. If you're still interested, you can contact the team.

Would you still like to join?`,
    sources: [
      {
        title: "AniVox Official Team Policy",
        url: "https://youtube.com/@dcb-q2x7j",
        domain: "youtube.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "team_inquiry",
      data: {
        policy: "voluntary",
        email: "[ENTER OFFICIAL TEAM EMAIL HERE]",
        promptFollowUp: "Would you still like to join?"
      }
    }
  },
  // =========================================================================
  // 0d. VERIFIED OFFICIAL LINKS (XBOX, NOVAVERSE, DCB CHANNEL)
  // =========================================================================
  {
    topic: "Xbox Official Website",
    keywords: [
      "give me the xbox link",
      "xbox link",
      "where can i find xbox",
      "xbox website",
      "official xbox website",
      "open xbox"
    ],
    patterns: [
      /\b(give\s+me\s+the\s+)?xbox\s+link\b/i,
      /\bwhere\s+(can\s+i\s+find|is)\s+xbox\b/i,
      /\bopen\s+(the\s+)?xbox(\s+website)?\b/i
    ],
    category: "Creative & Game Design",
    answer: `Here is the official Xbox website.`,
    sources: [
      {
        title: "Xbox Official Site: Consoles, Games, and Community",
        url: "https://www.xbox.com",
        domain: "xbox.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "open_link",
      data: {
        id: "link-xbox",
        targetName: "Xbox",
        platform: "web",
        platformDisplayName: "Xbox Official",
        profileTitle: "Xbox Official Website",
        webUrl: "https://www.xbox.com",
        buttonLabel: "OPEN XBOX",
        description: "Official Xbox website. Explore Xbox consoles, Game Pass titles, cloud gaming, and Microsoft gaming ecosystem.",
        isVerified: true,
        directLaunchSuggested: true
      }
    }
  },
  {
    topic: "NovaVerse Interactive Universe",
    keywords: [
      "where can i find novaverse",
      "novaverse link",
      "novaverse",
      "where is novaverse",
      "where is the game",
      "open novaverse",
      "find novaverse"
    ],
    patterns: [
      /\bwhere\s+(can\s+i\s+find|is)\s+novaverse\b/i,
      /\bwhere\s+is\s+the\s+game\b/i,
      /\b(give\s+me\s+the\s+)?novaverse\s+link\b/i,
      /\bopen\s+(the\s+)?novaverse\b/i
    ],
    category: "Creative & Game Design",
    answer: `Here is the official NovaVerse page.`,
    sources: [
      {
        title: "NovaVerse Official Universe",
        url: "https://novaverse.io",
        domain: "novaverse.io",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "open_link",
      data: {
        id: "link-novaverse",
        targetName: "NovaVerse",
        platform: "web",
        platformDisplayName: "NovaVerse Platform",
        profileTitle: "NovaVerse Interactive Platform",
        webUrl: "https://novaverse.io",
        buttonLabel: "OPEN NOVAVERSE",
        description: "Official NovaVerse platform. Discover the immersive interactive gaming universe, virtual realms, and open community.",
        isVerified: true,
        directLaunchSuggested: true
      }
    }
  },
  {
    topic: "AniVox Official YouTube Channel",
    keywords: [
      "give me the official youtube channel",
      "official youtube channel",
      "visit our channel",
      "anivox youtube",
      "dcb youtube",
      "@dcb-q2x7j",
      "dcb-q2x7j"
    ],
    patterns: [
      /\b(give\s+me\s+the\s+)?(official\s+)?youtube\s+channel\b/i,
      /\bvisit\s+(our|the\s+official)\s+channel\b/i,
      /\bopen\s+(our|the\s+official)\s+channel\b/i,
      /\b(dcb-q2x7j|@dcb-q2x7j)\b/i
    ],
    category: "Technology & AI",
    answer: `Here is the official AniVox & DCB YouTube channel: https://youtube.com/@dcb-q2x7j`,
    sources: [
      {
        title: "AniVox & DCB Official Channel",
        url: "https://youtube.com/@dcb-q2x7j",
        domain: "youtube.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "open_link",
      data: {
        id: "link-anivox-yt",
        targetName: "AniVox Official Channel",
        platform: "youtube",
        platformDisplayName: "YouTube",
        profileTitle: "AniVox & DCB Official Channel",
        handle: "@dcb-q2x7j",
        webUrl: "https://youtube.com/@dcb-q2x7j",
        appDeepLink: "vnd.youtube://www.youtube.com/@dcb-q2x7j",
        buttonLabel: "OPEN CHANNEL",
        description: "Official YouTube channel of AniVox & creator DCB (@dcb-q2x7j). Watch updates, tutorials, and new features.",
        isVerified: true,
        directLaunchSuggested: true
      }
    }
  },
  // =========================================================================
  // WATER
  // =========================================================================
  {
    topic: "Water (H2O Chemistry & Properties)",
    keywords: [
      "what is water",
      "define water",
      "water chemical formula",
      "properties of water",
      "about water",
      "what is h2o"
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+water\b/i,
      /\bdefine\s+water\b/i,
      /\bwhat\s+is\s+h2o\b/i
    ],
    category: "Science & Physics",
    answer: `**Water** is an inorganic, transparent, tasteless, odorless chemical substance with the molecular formula **$\\text{H}_2\\text{O}$** (two hydrogen atoms covalently bonded to one oxygen atom). It is the universal solvent essential for all known forms of biological life.

### Key Physical & Chemical Properties:
1. **Polarity & Hydrogen Bonding:** The bent molecular geometry creates a dipole moment (negative charge near oxygen, positive near hydrogen), allowing strong hydrogen bonds between molecules.
2. **Universal Solvent:** Water dissolves more substances than any other liquid, facilitating chemical reactions and nutrient transport in living organisms.
3. **High Specific Heat Capacity:** Water absorbs and releases large amounts of heat with minimal temperature changes, stabilizing Earth's climate and organism homeostasis.
4. **Density Anomaly:** Water reaches maximum density at $4^\\circ\\text{C}$ ($39.2^\\circ\\text{F}$) and expands upon freezing. Consequently, ice floats on liquid water, insulating aquatic ecosystems during cold seasons.
5. **Abundance:** Covers approximately **71%** of the Earth's surface (96.5% oceans, 2.5% freshwater in glaciers, groundwater, and atmosphere).`,
    sources: [
      {
        title: "USGS - Water Science School: Water Properties and Measurements",
        url: "https://www.usgs.gov/special-topics/water-science-school",
        domain: "usgs.gov",
        sourceType: "official_doc"
      },
      {
        title: "Encyclopaedia Britannica - Water (Chemical Compound)",
        url: "https://www.britannica.com/science/water",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      }
    ]
  },
  // =========================================================================
  // RIDEGUARD
  // =========================================================================
  {
    topic: "RideGuard (Vehicle & Transit Safety System)",
    keywords: [
      "what is rideguard",
      "rideguard",
      "ride guard",
      "about rideguard",
      "define rideguard"
    ],
    patterns: [
      /\bwhat\s+is\s+rideguard\b/i,
      /\bwhat\s+is\s+ride\s+guard\b/i,
      /\btell\s+me\s+about\s+rideguard\b/i
    ],
    category: "Technology & AI",
    answer: `**RideGuard** is an advanced vehicle safety and intelligent transit security ecosystem designed for rideshare platforms, commercial fleets, and personal vehicles.

### Core Features & System Architecture:
1. **Real-Time Telematics & Collision Detection:** Utilizes multi-axis inertial sensors, gyroscopes, and GPS tracking to instantly identify vehicle impacts, rollover events, or sudden decelerations.
2. **Automated Emergency SOS Dispatch:** Automatically establishes an encrypted emergency relay with local emergency services and designated safety contacts with live telemetry.
3. **In-Cabin Video & Audio Telemetry:** Real-time sensor monitoring to detect route deviations, unauthorized stops, or unsafe vehicle handling.
4. **Driver Fatigue & Distraction AI:** On-device computer vision analyzing blink rate and gaze direction to alert drivers of microsleep or distraction.`,
    sources: [
      {
        title: "RideGuard Mobility Safety & Telematics Overview",
        url: "https://rideguard.io",
        domain: "rideguard.io",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // AUDIOMACK
  // =========================================================================
  {
    topic: "Audiomack (Streaming & Music Discovery Platform)",
    keywords: [
      "what is audiomack",
      "audiomack",
      "play on audiomack",
      "about audiomack"
    ],
    patterns: [
      /\bwhat\s+is\s+audiomack\b/i,
      /\babout\s+audiomack\b/i
    ],
    category: "Entertainment & Media",
    answer: `**Audiomack** is a free global on-demand music streaming and audio discovery platform tailored for emerging artists, independent musicians, and fans of Afrobeats, Hip-Hop, R&B, Reggae, and Electronic music.

### Key Highlights:
- **Free Streaming & Offline Playback:** Allows users to stream and save music for offline listening without requiring a mandatory premium subscription.
- **Creator First Ecosystem:** Direct upload tools and monetization programs empowering independent musicians across Africa, the Americas, and Europe.
- **Top Genres:** Recognized as one of the premier hubs for Afrobeats (Burna Boy, Wizkid, Asake), Hip-Hop, Dancehall, and Amapiano.`,
    sources: [
      {
        title: "Audiomack Official Music Streaming",
        url: "https://audiomack.com",
        domain: "audiomack.com",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 1. FIRST PHYSICIAN (HISTORICAL & AMBIGUITY DISAMBIGUATION)
  // =========================================================================
  {
    topic: "The First Physician in History",
    keywords: [
      "who was the first physician",
      "first physician",
      "earliest doctor",
      "who was the first doctor",
      "first physician in history",
      "earliest physician in the world",
      "who is considered the first doctor",
      "imhotep physician",
      "hesy-ra",
      "father of medicine"
    ],
    patterns: [
      /\bwho\s+(was|is)\s+(the\s+)?(first|earliest)\s+(physician|doctor|healer)\b/i,
      /\b(first|earliest)\s+(physician|doctor)\s+(in\s+history|in\s+the\s+world|recorded|known)\b/i,
      /\bwho\s+(is|was)\s+the\s+father\s+of\s+medicine\b/i
    ],
    category: "Geography & History",
    answer: `The question of who was the **first physician** involves important historical nuance and context:

### 1. Earliest Known Physician by Name: **Imhotep** (c. 2600 BCE)
- **Imhotep**, an Egyptian polymath, architect of the Step Pyramid of Djoser, and vizier during the Third Dynasty of Egypt, is widely regarded by historians as the **earliest known physician recorded by name in written history**.
- He is credited in Egyptian tradition with diagnosing and treating numerous ailments without solely invoking magic, and was later deified as an Egyptian god of healing and medicine.
- Contemporaneously, **Hesy-Ra** (c. 2600 BCE) holds the official documented title of *"Chief of Dentists and Physicians"* under Pharaoh Djoser.

### 2. Historical & Cultural Ambiguity
- **Prehistoric Medicine:** The concept and practice of healers, herbalists, and bone-setters existed across human indigenous societies for tens of thousands of years before the invention of written records.
- **Female Physicians:** **Merit-Ptah** and **Peseshet** (c. 2500\u20132400 BCE in Ancient Egypt) are documented as among the earliest recorded female physicians and supervisors of medical practitioners.
- **Ancient Traditions:** In ancient India, **Sushruta** (c. 600 BCE) authored the *Sushruta Samhita* and is venerated as the pioneer of plastic surgery; in ancient China, **Bian Que** and the legendary **Shennong** established pulse diagnosis and herbal pharmacology.

### 3. Father of Western Clinical Medicine: **Hippocrates** (c. 460\u2013370 BCE)
- In Ancient Greece, **Hippocrates of Kos** separated medicine from superstitious mythology, established systematic clinical observation, ethical standards (the *Hippocratic Oath*), and disease prognosis.`,
    sources: [
      {
        title: "Encyclopaedia Britannica - Imhotep (Egyptian Architect and Physician)",
        url: "https://www.britannica.com/biography/Imhotep",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      },
      {
        title: "National Library of Medicine (NIH) - Hesy-Ra and Early Dynastic Egyptian Medicine",
        url: "https://pubmed.ncbi.nlm.nih.gov/24618691/",
        domain: "nih.gov",
        sourceType: "scientific_journal"
      },
      {
        title: "World History Encyclopedia - Ancient Egyptian Medicine",
        url: "https://www.worldhistory.org/Egyptian_Medicine/",
        domain: "worldhistory.org",
        sourceType: "encyclopedia"
      }
    ]
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
      "snake with the most poisonous venom"
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+(the\s+)?(world'?s\s+)?most\s+venomous\s+snake\b/i,
      /\bmost\s+venomous\s+snake\s+in\s+the\s+world\b/i,
      /\bdeadliest\s+snake\s+in\s+the\s+world\b/i,
      /\bwhat\s+snake\s+has\s+the\s+most\s+toxic\s+venom\b/i
    ],
    category: "Biology & Nature",
    answer: `When evaluating the **most venomous snake**, it is essential to distinguish **venom toxicity (potency)** from **clinical danger to humans (mortality and aggression)**:

### 1. Undisputed Most Venomous Snake by Toxicity: **The Inland Taipan** (*Oxyuranus microlepidotus*)
- **Native Habitat:** Semi-arid clay plains of central-east Australia (Queensland and South Australia).
- **Venom Potency ($LD_{50}$):** Possesses the most toxic venom of any terrestrial snake on Earth, with an $LD_{50}$ in mice of **$0.025\\text{ mg/kg}$**.
- **Lethality:** A single average envenomation bite yields approximately $44\\text{ mg}$ of venom (maximum recorded: $110\\text{ mg}$)\u2014theoretically potent enough to kill over **100 adult humans** or 250,000 mice within 45 minutes if untreated.
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
        title: "Australian Museum - Inland Taipan (Oxyuranus microlepidotus)",
        url: "https://australian.museum/learn/animals/reptiles/inland-taipan/",
        domain: "australian.museum",
        sourceType: "official_doc"
      },
      {
        title: "World Health Organization (WHO) - Snakebite Envenoming & Global Burden",
        url: "https://www.who.int/news-room/fact-sheets/detail/snakebite-envenoming",
        domain: "who.int",
        sourceType: "official_doc"
      },
      {
        title: "University of Melbourne - Australian Venom Research Unit",
        url: "https://mdhs.unimelb.edu.au/avru",
        domain: "unimelb.edu.au",
        sourceType: "scientific_journal"
      }
    ]
  },
  // =========================================================================
  // 3. ANIME
  // =========================================================================
  {
    topic: "Anime (Japanese Animation)",
    keywords: ["what is anime", "define anime", "anime meaning", "history of anime", "about anime", "what does anime mean"],
    patterns: [
      /\bwhat\s+(is|are)\s+anime\b/i,
      /\bdefine\s+anime\b/i,
      /\bmeaning\s+of\s+anime\b/i,
      /\btell\s+me\s+about\s+anime\b/i
    ],
    category: "Entertainment & Media",
    answer: `**Anime** (\u30A2\u30CB\u30E1) refers to hand-drawn and computer-generated animation originating from Japan. Internationally, the term specifically denotes Japanese animated television series, films, and original video animations (OVAs) characterized by distinctive art styles, dynamic character arcs, cinematic storytelling, and broad demographic reach.

### Key Dimensions of Anime:
- **Origins & Milestones:** Early commercial animation began in 1917. In the 1960s, Osamu Tezuka ("the God of Manga") revolutionized the medium with *Astro Boy* (*Tetsuwan Atom*). Iconic milestones include *Akira* (1988), Studio Ghibli's Academy Award-winning *Spirited Away* (2001), and modern global franchises like *Demon Slayer*, *Attack on Titan*, and *Jujutsu Kaisen*.
- **Demographics & Target Audiences:**
  - **Sh\u014Dnen:** Action/adventure aimed at young male audiences (*Naruto*, *One Piece*, *Dragon Ball*).
  - **Seinen:** Mature psychological, philosophical, or gritty narratives (*Vinland Saga*, *Monster*, *Berserk*).
  - **Sh\u014Djo & Josei:** Character-driven romance, interpersonal drama, and personal growth (*Fruits Basket*, *Nana*).
  - **Kodomomuke:** Media created specifically for young children (*Pok\xE9mon*, *Doraemon*).
- **Major Genres:** Includes **Mecha** (giant piloted robots), **Isekai** (protagonists transported to fantasy worlds), **Slice of Life** (realistic everyday vignettes), **Cyberpunk**, and **Supernatural Fantasy**.
- **Global Impact:** Anime is a multibillion-dollar worldwide industry influencing global cinema, digital gaming, fashion, music, and contemporary art.`,
    sources: [
      {
        title: "Encyclopaedia Britannica - Anime (Japanese Animation)",
        url: "https://www.britannica.com/art/anime-Japanese-animation",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      },
      {
        title: "The Japan Foundation - Japanese Animation History & Preservation",
        url: "https://www.jpf.go.jp/e/project/culture/media/anime/",
        domain: "jpf.go.jp",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 4. ARTIFICIAL INTELLIGENCE
  // =========================================================================
  {
    topic: "Artificial Intelligence (AI)",
    keywords: ["what is artificial intelligence", "what is ai", "define artificial intelligence", "ai definition", "how ai works", "explain artificial intelligence"],
    patterns: [
      /\bwhat\s+(is|are)\s+(artificial\s+intelligence|ai)\b/i,
      /\bdefine\s+(artificial\s+intelligence|ai)\b/i,
      /\bhow\s+does\s+ai\s+work\b/i,
      /\bexplain\s+(artificial\s+intelligence|ai)\b/i
    ],
    category: "Technology & AI",
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
        title: "Stanford University HAI - What Is Artificial Intelligence?",
        url: "https://hai.stanford.edu/what-is-ai",
        domain: "stanford.edu",
        sourceType: "reputable_publication"
      },
      {
        title: "MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)",
        url: "https://www.csail.mit.edu/research/artificial-intelligence",
        domain: "mit.edu",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 5. GRAVITY
  // =========================================================================
  {
    topic: "Gravity & Spacetime Curvature",
    keywords: ["what is gravity", "explain gravity", "how does gravity work", "how gravity works", "gravitational force", "what causes gravity"],
    patterns: [
      /\bwhat\s+is\s+gravity\b/i,
      /\bexplain\s+gravity\b/i,
      /\bhow\s+does\s+gravity\s+work\b/i,
      /\bwhat\s+causes\s+gravity\b/i
    ],
    category: "Science & Physics",
    answer: `**Gravity** is one of the four fundamental forces of physics (alongside electromagnetism, the strong nuclear force, and the weak nuclear force). Modern science understands gravity through two foundational physical frameworks:

### 1. Einstein's General Relativity (1915) \u2014 Geometric Spacetime Curvature
- In modern physics, gravity is **not** an invisible mechanical tether pulling objects. Instead, mass and energy physically **warp and curve the four-dimensional fabric of spacetime**.
- Massive objects like the Sun or Earth create gravitational "depressions" in spacetime. Orbiting bodies (such as the Earth around the Sun, or the Moon around Earth) are simply following the straightest possible natural paths (**geodesics**) through this curved spacetime.
- General relativity accurately predicts **gravitational time dilation** (clocks tick slower near strong gravitational fields) and **gravitational lensing** (light bends around massive galaxies).

### 2. Newtonian Classical Gravitation (1687) \u2014 Force Framework
- For everyday terrestrial calculations and non-relativistic speeds, Sir Isaac Newton's Universal Law of Gravitation describes gravity as an attractive force proportional to mass and inversely proportional to the square of distance:
$$F = G \\frac{m_1 m_2}{r^2}$$
- Where $G \\approx 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$.

### Critical Roles of Gravity in the Cosmos:
- Holds stars, solar systems, and galaxies together.
- Governs the oceanic tides on Earth through gravitational interaction with the Moon and Sun.
- Enables stellar nucleosynthesis: immense gravitational pressure inside stars fuses hydrogen into helium and heavier elements.`,
    sources: [
      {
        title: "NASA Science - What Is Gravity?",
        url: "https://science.nasa.gov/astrophysics/focus-areas/what-is-gravity",
        domain: "nasa.gov",
        sourceType: "official_doc"
      },
      {
        title: "CERN - The Fundamental Forces of Physics",
        url: "https://home.cern/science/physics/gravity",
        domain: "cern",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 6. CAPITAL OF NIGERIA
  // =========================================================================
  {
    topic: "Capital of Nigeria (Abuja & Lagos Historical Context)",
    keywords: [
      "what is the capital of nigeria",
      "capital of nigeria",
      "nigeria capital",
      "what city is the capital of nigeria",
      "abuja",
      "capital city of nigeria"
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+(the\s+)?capital\s+(city\s+)?of\s+nigeria\b/i,
      /\bcapital\s+of\s+nigeria\b/i,
      /\bnigeria'?s\s+capital\b/i
    ],
    category: "Geography & History",
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
        title: "The World Factbook - Nigeria (Central Intelligence Agency)",
        url: "https://www.cia.gov/the-world-factbook/countries/nigeria/",
        domain: "cia.gov",
        sourceType: "official_doc"
      },
      {
        title: "Federal Republic of Nigeria Official Portal - Federal Capital Territory",
        url: "https://nigeria.gov.ng",
        domain: "nigeria.gov.ng",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 7. PHOTOSYNTHESIS
  // =========================================================================
  {
    topic: "Photosynthesis (Mechanism & Biological Significance)",
    keywords: [
      "how does photosynthesis work",
      "what is photosynthesis",
      "explain photosynthesis",
      "define photosynthesis",
      "photosynthesis equation",
      "process of photosynthesis"
    ],
    patterns: [
      /\bhow\s+does\s+photosynthesis\s+work\b/i,
      /\bwhat\s+is\s+photosynthesis\b/i,
      /\bexplain\s+photosynthesis\b/i,
      /\bdefine\s+photosynthesis\b/i
    ],
    category: "Science & Physics",
    answer: `**Photosynthesis** (from the Greek *ph\u014Ds* "light" and *synthesis* "putting together") is the biochemical process by which photoautotrophic organisms\u2014such as green plants, algae, and cyanobacteria\u2014convert solar light energy into stable chemical energy stored in glucose molecules.

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
        title: "National Geographic Education - Photosynthesis Fundamentals",
        url: "https://education.nationalgeographic.org/resource/photosynthesis/",
        domain: "nationalgeographic.org",
        sourceType: "official_doc"
      },
      {
        title: "Nature Education - Plant Energy Capture & The Calvin Cycle",
        url: "https://www.nature.com/scitable/topicpage/photosynthetic-cells-14025371/",
        domain: "nature.com",
        sourceType: "scientific_journal"
      }
    ]
  },
  // =========================================================================
  // 8. CREATIVE GAME DESIGN IDEA (PATH 1 / 3 HYBRID)
  // =========================================================================
  {
    topic: "Creative Game Concept: Chrono-Drift (Time-Echo Roguelite)",
    keywords: [
      "give me an idea for a game",
      "game idea",
      "game design concept",
      "idea for a video game",
      "pitch me a game idea",
      "recommend a game idea",
      "game brainstorm"
    ],
    patterns: [
      /\bgive\s+me\s+(an?\s+)?idea\s+for\s+a\s+game\b/i,
      /\b(pitch|suggest|brainstorm)\s+(a\s+)?game\s+idea\b/i,
      /\bgame\s+concept\s+idea\b/i
    ],
    category: "Creative & Game Design",
    answer: `Here is an original, high-concept video game design pitch:

# \u{1F3AE} **Chrono-Drift: Echoes of the Void**
*Genre:* **Time-Loop Tactical Roguelite Action RPG**  
*Aesthetic:* Cyberpunk Neon & Ancient Cosmic Ruins with a Synthwave / Ambient soundtrack.

### \u{1F31F} Core Gameplay Hook: "The Temporal Mirror"
Instead of fighting alone, every run records your previous 3 lives as **Temporal Phantoms** that fight alongside your current run in real time!

### \u{1F579}\uFE0F Mechanics & Loops:
1. **The Time Loop (90 Seconds per Sector):**
   - You have 90 seconds to hack planetary generators and breach the defense core.
   - When you die or run out of time, you reset back to the start of the chamber with a new weapon class.
2. **Co-Op With Your Past Selves:**
   - Your previous run's exact movements, shots, and ability triggers play out as a holographic ghost.
3. **Synergy Fusion Engine:**
   - Cross paths with your holographic ghost to trigger "Temporal Harmonization," empowering both attacks with kinetic lightning.
4. **Permanent Meta-Progression:**
   - Recover ancient chrono-shards to unlock persistent tech trees: rewinding time 3 seconds on lethal blow, multi-spectral vision, and gravity anchors.

### \u{1F3AF} Platforms & Engine:
- Built in Godot 4 or Unity for PC, Steam Deck, and mobile touch controls with responsive haptics.`,
    sources: [
      {
        title: "Game Developer (Gamasutra) - Core Game Loop Architecture",
        url: "https://www.gamedeveloper.com/design/the-anatomy-of-a-game-loop",
        domain: "gamedeveloper.com",
        sourceType: "reputable_publication"
      }
    ],
    relatedAction: {
      type: "resource",
      data: {
        category: "creative",
        title: "Chrono-Drift: Game Concept Pitch",
        creator: "Vox Creative Engine",
        description: "Time-loop tactical roguelite where your past 3 runs fight alongside you as synchronized temporal ghosts.",
        tags: ["Game Design", "Roguelite", "Sci-Fi", "Creative"],
        rating: "Pitch 1.0",
        userRating: 5,
        reason: "Creative gameplay loop combining temporal recording mechanics with fast-paced roguelite action."
      }
    }
  },
  // =========================================================================
  // 9. WATER
  // =========================================================================
  {
    topic: "Water (H2O Chemical Properties & Importance)",
    keywords: [
      "what is water",
      "define water",
      "explain water",
      "water chemical properties",
      "properties of water",
      "water definition"
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+water\b/i,
      /\bdefine\s+water\b/i,
      /\bproperties\s+of\s+water\b/i
    ],
    category: "Science & Physics",
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
        title: "USGS Water Science School - The Water Molecule & Unique Properties",
        url: "https://www.usgs.gov/special-topics/water-science-school",
        domain: "usgs.gov",
        sourceType: "official_doc"
      },
      {
        title: "Encyclopaedia Britannica - Water (Chemical Compound)",
        url: "https://www.britannica.com/science/water",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      }
    ]
  },
  // =========================================================================
  // 10. ELON MUSK
  // =========================================================================
  {
    topic: "Elon Musk (Entrepreneur & Technologist)",
    keywords: [
      "who is elon musk",
      "elon musk",
      "about elon musk",
      "what did elon musk do",
      "elon musk companies",
      "spacex tesla musk"
    ],
    patterns: [
      /\bwho\s+(is|was)\s+elon\s+musk\b/i,
      /\btell\s+me\s+about\s+elon\s+musk\b/i,
      /\belon\s+musk\b/i
    ],
    category: "Technology & AI",
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
        title: "Encyclopaedia Britannica - Elon Musk (Biography & Ventures)",
        url: "https://www.britannica.com/biography/Elon-Musk",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      },
      {
        title: "SpaceX Official Corporate Profile",
        url: "https://www.spacex.com/about",
        domain: "spacex.com",
        sourceType: "official_doc"
      },
      {
        title: "Tesla Investor Relations & Executive Overview",
        url: "https://ir.tesla.com",
        domain: "tesla.com",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 11. TELEVISION
  // =========================================================================
  {
    topic: "Television (Technology, History & Evolution)",
    keywords: [
      "what is television",
      "define television",
      "history of television",
      "how television works",
      "tv meaning",
      "about television"
    ],
    patterns: [
      /\bwhat\s+(is|are)\s+television\b/i,
      /\bwhat\s+is\s+a\s+tv\b/i,
      /\bdefine\s+television\b/i,
      /\bhistory\s+of\s+television\b/i
    ],
    category: "Technology & AI",
    answer: `**Television (TV)** is a telecommunication medium used for transmitting moving images, audio, and synchronized data. Originating from the Greek *tele* ("far") and Latin *visio* ("sight"), television transformed 20th-century mass communication, entertainment, news journalism, and cultural storytelling.

### Key Milestones in Television History:
1. **Mechanical Television (1920s):** Early pioneers like **John Logie Baird** in the UK used rotating Nipkow disks to scan and transmit primitive silhouettes.
2. **Electronic Television (Late 1920s\u20131930s):** **Philo Farnsworth** transmitted the first fully electronic TV image in 1927 using an Image Dissector tube, while **Vladimir Zworykin** developed the Iconoscope and Kinescope at RCA.
3. **Color Broadcasts (1950s\u20131960s):** Standards like NTSC, PAL, and SECAM introduced color video transmission globally.
4. **Digital & High-Definition (1990s\u20132000s):** Transition from analog cathode-ray tubes (CRTs) to digital flatscreens (LCD, Plasma, OLED, MicroLED) and 4K/8K resolution.
5. **Streaming & Connected Smart TVs:** Modern television blends broadcast with on-demand Internet Protocol Television (IPTV) and streaming services.`,
    sources: [
      {
        title: "Smithsonian National Museum of American History - History of Television",
        url: "https://americanhistory.si.edu/collections/subjects/television",
        domain: "si.edu",
        sourceType: "official_doc"
      },
      {
        title: "Encyclopaedia Britannica - Television (Technology & History)",
        url: "https://www.britannica.com/technology/television-technology",
        domain: "britannica.com",
        sourceType: "encyclopedia"
      }
    ]
  },
  // =========================================================================
  // 12. NIGERIA (OVERVIEW & DEMOGRAPHICS)
  // =========================================================================
  {
    topic: "Nigeria (Federal Republic of Nigeria Overview)",
    keywords: [
      "what is nigeria",
      "about nigeria",
      "tell me about nigeria",
      "nigeria country",
      "nigerian culture"
    ],
    patterns: [
      /\bwhat\s+is\s+nigeria\b/i,
      /\btell\s+me\s+about\s+nigeria\b/i,
      /\babout\s+nigeria\b/i
    ],
    category: "Geography & History",
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
        title: "CIA World Factbook - Nigeria Country Profile",
        url: "https://www.cia.gov/the-world-factbook/countries/nigeria/",
        domain: "cia.gov",
        sourceType: "official_doc"
      },
      {
        title: "UNESCO World Heritage Centre - Nigerian Cultural Heritage",
        url: "https://whc.unesco.org/en/statesparties/ng",
        domain: "unesco.org",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 13. ANDROID DEVELOPMENTS & RELEASES
  // =========================================================================
  {
    topic: "Android OS Architecture & Recent Developments",
    keywords: [
      "latest version of android",
      "latest android",
      "developments in android",
      "android update",
      "what is the latest version of android",
      "latest developments in android"
    ],
    patterns: [
      /\b(what\s+is\s+the\s+)?latest\s+version\s+of\s+android\b/i,
      /\b(latest\s+)?developments\s+in\s+android\b/i,
      /\bnewest\s+android\s+version\b/i
    ],
    category: "Technology & AI",
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
        title: "Android Developers Official Blog - Android Releases & Architecture",
        url: "https://android-developers.googleblog.com/",
        domain: "googleblog.com",
        sourceType: "official_doc"
      },
      {
        title: "Google Android Platform Overview",
        url: "https://www.android.com/",
        domain: "android.com",
        sourceType: "official_doc"
      }
    ]
  },
  // =========================================================================
  // 14. VIDEO EDITING APPS
  // =========================================================================
  {
    topic: "Top Video Editing Applications (Mobile & Desktop)",
    keywords: [
      "find useful video editing apps",
      "video editing apps",
      "best video editing apps",
      "recommend video editor",
      "good video editing apps",
      "apps for video editing"
    ],
    patterns: [
      /\b(find|recommend|what\s+are)\s+(useful\s+|best\s+)?video\s+editing\s+apps\b/i,
      /\bvideo\s+editor\s+apps\b/i
    ],
    category: "Technology & AI",
    answer: `Here are the top-rated, most capable video editing applications across mobile and desktop workflows:

### \u{1F4F1} 1. Mobile Powerhouses (Android & iOS):
- **CapCut:** Extremely popular for short-form video (Reels, TikTok, Shorts), featuring automatic speech-to-text captions, background removal, keyframing, and speed ramping.
- **VN Video Editor:** Clean, water-mark free multi-track editor with curve speed adjustments, keyframe animations, and professional LUT color grading.
- **LumaFusion:** Pro-grade multi-track video editing designed for tablets and smartphones, supporting 6 4K video/audio tracks, magnetic timeline, and external SSD editing.
- **KineMaster:** Feature-rich multi-layer video editor with chroma key (green screen), audio ducking, and asset store.

### \u{1F4BB} 2. Desktop Industry Standards:
- **DaVinci Resolve (Blackmagic Design):** Industry leader in color grading and audio engineering (Fairlight), offering a comprehensive free version with Hollywood-level capabilities.
- **Adobe Premiere Pro:** Industry-standard timeline editor with seamless After Effects integration, AI auto-reframe, and extensive plugin support.
- **CapCut Desktop:** Fast timeline editing optimized for creator workflows and social media formats.`,
    sources: [
      {
        title: "Blackmagic Design - DaVinci Resolve Official",
        url: "https://www.blackmagicdesign.com/products/davinciresolve",
        domain: "blackmagicdesign.com",
        sourceType: "official_doc"
      },
      {
        title: "Google Play Store - Top Video Players & Editors",
        url: "https://play.google.com/store/apps/category/VIDEO_PLAYERS",
        domain: "play.google.com",
        sourceType: "official_doc"
      }
    ],
    relatedAction: {
      type: "resource",
      data: {
        category: "apps",
        title: "VN Video Editor & DaVinci Resolve",
        creator: "Creative Video Suite",
        description: "Top-tier multi-track video editing tools with keyframing, speed curves, and high-fidelity export.",
        tags: ["Video Editing", "Creative", "Apps", "Tools"],
        rating: "4.9\u2605",
        userRating: 5,
        reason: "Recommended for versatile mobile and desktop video editing without restrictive watermarks."
      }
    }
  },
  // =========================================================================
  // GROX ON YOUTUBE (CREATOR & PUBLIC CHANNEL PROFILE)
  // =========================================================================
  {
    topic: "Grox on YouTube",
    keywords: [
      "who is grox on youtube",
      "who is grox",
      "grox youtube",
      "grox on youtube",
      "open grox youtube",
      "open grox channel",
      "find grox on youtube",
      "grox youtube channel",
      "grox minecraft"
    ],
    patterns: [
      /\bwho\s+is\s+grox\b/i,
      /\bgrox\s+(on\s+)?(youtube|yt)\b/i,
      /\b(open|find|search)\s+grox\b/i
    ],
    category: "Entertainment & Media",
    answer: `**Grox** is a popular gaming creator and YouTuber best known for highly entertaining **Minecraft gameplay**, creative speedrun challenges, and custom modded survival series.

### Profile Highlights:
- **Primary Platform:** YouTube (\`@Grox\`)
- **Focus:** Minecraft, comedic challenge runs, custom game scenarios, and interactive gaming content.
- **Audience:** Over 1.2 Million subscribers with millions of views across popular challenge uploads.
- **Style:** Fast-paced, humorous commentary paired with high-effort editing and custom gameplay mechanics.

You can launch Grox's public YouTube channel directly using the smart link card below.`,
    sources: [
      {
        title: "YouTube - Grox Official Channel (@Grox)",
        url: "https://www.youtube.com/@Grox",
        domain: "youtube.com",
        sourceType: "search_grounding"
      }
    ],
    relatedAction: {
      type: "social_search",
      data: {
        id: "social-grox-youtube",
        targetName: "Grox",
        platform: "youtube",
        platformDisplayName: "YouTube",
        profileTitle: "Grox",
        handle: "@Grox",
        description: "Popular Minecraft and gaming creator known for engaging speedruns, custom challenges, and creative sandbox gameplay.",
        webUrl: "https://www.youtube.com/@Grox",
        appDeepLink: "vnd.youtube://www.youtube.com/@Grox",
        isVerified: true,
        subscriberCount: "1.2M+ subscribers",
        category: "Gaming & Entertainment",
        directLaunchSuggested: true,
        alternativeOptions: [
          {
            platform: "x",
            platformDisplayName: "X (Twitter)",
            webUrl: "https://x.com/Grox",
            handle: "@Grox"
          },
          {
            platform: "twitch",
            platformDisplayName: "Twitch",
            webUrl: "https://www.twitch.tv/grox",
            handle: "grox"
          }
        ]
      }
    }
  },
  // =========================================================================
  // MRBEAST ON YOUTUBE
  // =========================================================================
  {
    topic: "MrBeast (Jimmy Donaldson) on YouTube",
    keywords: [
      "who is mrbeast on youtube",
      "who is mrbeast",
      "mrbeast youtube",
      "mrbeast on youtube",
      "open mrbeast youtube",
      "open mrbeast",
      "find mrbeast on youtube"
    ],
    patterns: [
      /\bwho\s+is\s+mrbeast\b/i,
      /\bmrbeast\s+(on\s+)?(youtube|yt)\b/i,
      /\b(open|find|search)\s+mrbeast\b/i
    ],
    category: "Entertainment & Media",
    answer: `**MrBeast** (Jimmy Donaldson) is the most-subscribed individual creator on YouTube, recognized globally for groundbreaking high-budget spectacles, extreme survival challenges, and massive philanthropic initiatives (such as *Team Trees*, *Team Seas*, and *Beast Philanthropy*).

### Profile Highlights:
- **Primary Platform:** YouTube (\`@MrBeast\`)
- **Subscribers:** 300M+ global subscribers
- **Key Projects:** Feastables chocolate, Beast Philanthropy, Creator Games, and high-production recreation challenges.

Tap below to open MrBeast's verified channel in the YouTube app or browser.`,
    sources: [
      {
        title: "YouTube - MrBeast Official Channel (@MrBeast)",
        url: "https://www.youtube.com/@MrBeast",
        domain: "youtube.com",
        sourceType: "search_grounding"
      }
    ],
    relatedAction: {
      type: "social_search",
      data: {
        id: "social-mrbeast-youtube",
        targetName: "MrBeast",
        platform: "youtube",
        platformDisplayName: "YouTube",
        profileTitle: "MrBeast (Jimmy Donaldson)",
        handle: "@MrBeast",
        description: "World-renowned creator, philanthropist, and entrepreneur known for large-scale challenges and philanthropic initiatives.",
        webUrl: "https://www.youtube.com/@MrBeast",
        appDeepLink: "vnd.youtube://www.youtube.com/@MrBeast",
        isVerified: true,
        subscriberCount: "300M+ subscribers",
        category: "Entertainment & Philanthropy",
        directLaunchSuggested: true,
        alternativeOptions: [
          {
            platform: "x",
            platformDisplayName: "X (Twitter)",
            webUrl: "https://x.com/MrBeast",
            handle: "@MrBeast"
          },
          {
            platform: "instagram",
            platformDisplayName: "Instagram",
            webUrl: "https://www.instagram.com/mrbeast/",
            handle: "@mrbeast"
          },
          {
            platform: "tiktok",
            platformDisplayName: "TikTok",
            webUrl: "https://www.tiktok.com/@mrbeast",
            handle: "@mrbeast"
          }
        ]
      }
    }
  }
];
function queryKnowledgeBase(query) {
  if (!query || typeof query !== "string") return null;
  const text = (query || "").trim().toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(text)) {
        return entry;
      }
    }
  }
  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (text === kw || text.includes(kw)) {
        return entry;
      }
    }
  }
  const queryTokens = text.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
  let bestMatch = null;
  let highestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwTokens = kw.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
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

// src/services/socialLinkLauncher.ts
var PLATFORM_CONFIGS = {
  youtube: {
    id: "youtube",
    displayName: "YouTube",
    shortName: "YT",
    category: "Video & Channels",
    badgeColor: "bg-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    gradient: "from-red-600/30 to-rose-900/30",
    officialDomains: ["youtube.com", "youtu.be", "m.youtube.com"],
    androidPackage: "com.google.android.youtube",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://www.youtube.com/@${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `vnd.youtube://www.youtube.com/@${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`,
    buildAppSearchLink: (query) => `vnd.youtube://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`
  },
  instagram: {
    id: "instagram",
    displayName: "Instagram",
    shortName: "IG",
    category: "Photos & Stories",
    badgeColor: "bg-pink-500/20",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-600/30 via-purple-600/20 to-amber-600/20",
    officialDomains: ["instagram.com", "instagr.am"],
    androidPackage: "com.instagram.android",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://www.instagram.com/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `instagram://user?username=${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.instagram.com/explore/tags/${encodeURIComponent(query.trim().replace(/\s+/g, ""))}/`
  },
  tiktok: {
    id: "tiktok",
    displayName: "TikTok",
    shortName: "TT",
    category: "Short Videos & Trends",
    badgeColor: "bg-teal-500/20",
    textColor: "text-teal-300",
    borderColor: "border-teal-500/30",
    gradient: "from-cyan-600/30 to-pink-600/20",
    officialDomains: ["tiktok.com", "vm.tiktok.com"],
    androidPackage: "com.zhiliaoapp.musically",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://www.tiktok.com/@${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `snssdk1233://user/profile/@${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.tiktok.com/search?q=${encodeURIComponent(query.trim())}`
  },
  x: {
    id: "x",
    displayName: "X (Twitter)",
    shortName: "X",
    category: "Microblogging & News",
    badgeColor: "bg-sky-500/20",
    textColor: "text-sky-300",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-600/30 to-blue-900/30",
    officialDomains: ["x.com", "twitter.com", "mobile.twitter.com"],
    androidPackage: "com.twitter.android",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://x.com/${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `twitter://user?screen_name=${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://x.com/search?q=${encodeURIComponent(query.trim())}`,
    buildAppSearchLink: (query) => `twitter://search?query=${encodeURIComponent(query.trim())}`
  },
  reddit: {
    id: "reddit",
    displayName: "Reddit",
    shortName: "Reddit",
    category: "Communities & Discussions",
    badgeColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    gradient: "from-orange-600/30 to-red-900/30",
    officialDomains: ["reddit.com", "old.reddit.com"],
    androidPackage: "com.reddit.frontpage",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^u\//, "").replace(/^r\//, "");
      if (id.trim().startsWith("r/")) {
        return `https://www.reddit.com/r/${encodeURIComponent(clean)}/`;
      }
      return `https://www.reddit.com/user/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^u\//, "").replace(/^r\//, "");
      return `reddit://user/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.reddit.com/search/?q=${encodeURIComponent(query.trim())}`
  },
  facebook: {
    id: "facebook",
    displayName: "Facebook",
    shortName: "FB",
    category: "Social Network & Pages",
    badgeColor: "bg-blue-600/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-700/30 to-indigo-900/30",
    officialDomains: ["facebook.com", "fb.com", "m.facebook.com"],
    androidPackage: "com.facebook.katana",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://www.facebook.com/${encodeURIComponent(clean)}`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `fb://facewebmodal/f?href=https://www.facebook.com/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.facebook.com/search/top?q=${encodeURIComponent(query.trim())}`
  },
  linkedin: {
    id: "linkedin",
    displayName: "LinkedIn",
    shortName: "LinkedIn",
    category: "Professional Network",
    badgeColor: "bg-blue-500/20",
    textColor: "text-blue-300",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-600/30 to-cyan-900/30",
    officialDomains: ["linkedin.com"],
    androidPackage: "com.linkedin.android",
    buildWebProfileUrl: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `https://www.linkedin.com/in/${encodeURIComponent(clean)}/`;
    },
    buildAppDeepLink: (id) => {
      const clean = id.trim().replace(/^@/, "");
      return `linkedin://profile/${encodeURIComponent(clean)}`;
    },
    buildWebSearchUrl: (query) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query.trim())}`
  },
  pinterest: {
    id: "pinterest",
    displayName: "Pinterest",
    shortName: "Pinterest",
    category: "Visual Discovery & Boards",
    badgeColor: "bg-red-600/20",
    textColor: "text-red-400",
    borderColor: "border-red-600/30",
    gradient: "from-red-700/30 to-rose-950/30",
    officialDomains: ["pinterest.com", "pin.it"],
    androidPackage: "com.pinterest",
    buildWebProfileUrl: (id) => `https://www.pinterest.com/${encodeURIComponent(id.trim().replace(/^@/, ""))}/`,
    buildAppDeepLink: (id) => `pinterest://user/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildWebSearchUrl: (query) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query.trim())}`
  },
  snapchat: {
    id: "snapchat",
    displayName: "Snapchat",
    shortName: "Snap",
    category: "Camera & Stories",
    badgeColor: "bg-yellow-500/20",
    textColor: "text-yellow-300",
    borderColor: "border-yellow-500/30",
    gradient: "from-yellow-500/30 to-amber-900/30",
    officialDomains: ["snapchat.com", "story.snapchat.com"],
    androidPackage: "com.snapchat.android",
    buildWebProfileUrl: (id) => `https://www.snapchat.com/add/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildAppDeepLink: (id) => `snapchat://add/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildWebSearchUrl: (query) => `https://www.snapchat.com/add/${encodeURIComponent(query.trim().replace(/^@/, ""))}`
  },
  twitch: {
    id: "twitch",
    displayName: "Twitch",
    shortName: "Twitch",
    category: "Live Streaming & Gaming",
    badgeColor: "bg-purple-500/20",
    textColor: "text-purple-300",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-600/30 to-violet-900/30",
    officialDomains: ["twitch.tv"],
    androidPackage: "tv.twitch.android.app",
    buildWebProfileUrl: (id) => `https://www.twitch.tv/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildAppDeepLink: (id) => `twitch://stream/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildWebSearchUrl: (query) => `https://www.twitch.tv/search?term=${encodeURIComponent(query.trim())}`
  },
  github: {
    id: "github",
    displayName: "GitHub",
    shortName: "GitHub",
    category: "Open Source & Code",
    badgeColor: "bg-zinc-600/20",
    textColor: "text-zinc-300",
    borderColor: "border-zinc-500/30",
    gradient: "from-zinc-700/30 to-slate-900/30",
    officialDomains: ["github.com"],
    androidPackage: "com.github.android",
    buildWebProfileUrl: (id) => `https://github.com/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildWebSearchUrl: (query) => `https://github.com/search?q=${encodeURIComponent(query.trim())}`
  },
  spotify: {
    id: "spotify",
    displayName: "Spotify",
    shortName: "Spotify",
    category: "Music & Podcasts",
    badgeColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    gradient: "from-green-600/30 to-emerald-950/30",
    officialDomains: ["spotify.com", "open.spotify.com"],
    androidPackage: "com.spotify.music",
    buildWebProfileUrl: (id) => `https://open.spotify.com/search/${encodeURIComponent(queryWithoutQuotes(id))}`,
    buildAppDeepLink: (id) => `spotify:search:${encodeURIComponent(queryWithoutQuotes(id))}`,
    buildWebSearchUrl: (query) => `https://open.spotify.com/search/${encodeURIComponent(query.trim())}`
  },
  discord: {
    id: "discord",
    displayName: "Discord",
    shortName: "Discord",
    category: "Community Voice & Chat",
    badgeColor: "bg-indigo-500/20",
    textColor: "text-indigo-300",
    borderColor: "border-indigo-500/30",
    gradient: "from-indigo-600/30 to-purple-900/30",
    officialDomains: ["discord.com", "discord.gg"],
    androidPackage: "com.discord",
    buildWebProfileUrl: (id) => `https://discord.gg/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildAppDeepLink: (id) => `discord://invite/${encodeURIComponent(id.trim().replace(/^@/, ""))}`,
    buildWebSearchUrl: (query) => `https://discord.com/servers?query=${encodeURIComponent(query.trim())}`
  },
  web: {
    id: "web",
    displayName: "Official Website",
    shortName: "Web",
    category: "Verified Web Source",
    badgeColor: "bg-cyan-500/20",
    textColor: "text-cyan-300",
    borderColor: "border-cyan-500/30",
    gradient: "from-cyan-600/30 to-blue-900/30",
    officialDomains: [],
    buildWebProfileUrl: (urlOrQuery) => {
      if (urlOrQuery.startsWith("http://") || urlOrQuery.startsWith("https://")) {
        return urlOrQuery;
      }
      return `https://${urlOrQuery.replace(/^[a-z]+:\/\//i, "")}`;
    },
    buildWebSearchUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
  }
};
function queryWithoutQuotes(str) {
  return str.replace(/['"]/g, "").trim();
}
var VERIFIED_PUBLIC_CREATORS = {
  anivox: {
    targetName: "AniVox Official",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "AniVox & DCB Official Channel",
    handle: "@dcb-q2x7j",
    description: "The official YouTube channel of AniVox and creator DCB (@dcb-q2x7j). Watch product announcements, tutorials, assistant updates, and engineering deep dives.",
    webUrl: "https://youtube.com/@dcb-q2x7j",
    appDeepLink: "vnd.youtube://www.youtube.com/@dcb-q2x7j",
    isVerified: true,
    subscriberCount: "Official Creator Channel",
    category: "Technology & AI"
  },
  dcb: {
    targetName: "DCB (@dcb-q2x7j)",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "AniVox & DCB Official Channel",
    handle: "@dcb-q2x7j",
    description: "The official YouTube channel of AniVox creator DCB (@dcb-q2x7j). Watch tutorials, updates, and creator guides.",
    webUrl: "https://youtube.com/@dcb-q2x7j",
    appDeepLink: "vnd.youtube://www.youtube.com/@dcb-q2x7j",
    isVerified: true,
    subscriberCount: "Official Creator Channel",
    category: "Technology & AI"
  },
  dcbq2x7j: {
    targetName: "DCB (@dcb-q2x7j)",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "AniVox & DCB Official Channel",
    handle: "@dcb-q2x7j",
    description: "The official YouTube channel of AniVox creator DCB (@dcb-q2x7j). Watch tutorials, updates, and creator guides.",
    webUrl: "https://youtube.com/@dcb-q2x7j",
    appDeepLink: "vnd.youtube://www.youtube.com/@dcb-q2x7j",
    isVerified: true,
    subscriberCount: "Official Creator Channel",
    category: "Technology & AI"
  },
  ourchannel: {
    targetName: "AniVox / DCB Official Channel",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "AniVox & DCB Official Channel",
    handle: "@dcb-q2x7j",
    description: "The official YouTube channel of AniVox and creator DCB (@dcb-q2x7j).",
    webUrl: "https://youtube.com/@dcb-q2x7j",
    appDeepLink: "vnd.youtube://www.youtube.com/@dcb-q2x7j",
    isVerified: true,
    subscriberCount: "Official Creator Channel",
    category: "Technology & AI"
  },
  grox: {
    targetName: "Grox",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "Grox",
    handle: "@Grox",
    description: "Popular Minecraft and gaming creator known for engaging speedruns, world building, and entertaining challenge videos.",
    webUrl: "https://www.youtube.com/@Grox",
    appDeepLink: "vnd.youtube://www.youtube.com/@Grox",
    isVerified: true,
    subscriberCount: "1.2M+ subscribers",
    category: "Gaming & Entertainment",
    alternativeOptions: [
      {
        platform: "x",
        platformDisplayName: "X (Twitter)",
        webUrl: "https://x.com/Grox",
        handle: "@Grox"
      },
      {
        platform: "twitch",
        platformDisplayName: "Twitch",
        webUrl: "https://www.twitch.tv/grox",
        handle: "grox"
      }
    ]
  },
  mrbeast: {
    targetName: "MrBeast",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "MrBeast (Jimmy Donaldson)",
    handle: "@MrBeast",
    description: "World-renowned creator, philanthropist, and entrepreneur known for large-scale challenges and generous giveaways.",
    webUrl: "https://www.youtube.com/@MrBeast",
    appDeepLink: "vnd.youtube://www.youtube.com/@MrBeast",
    isVerified: true,
    subscriberCount: "300M+ subscribers",
    category: "Entertainment & Philanthropy",
    alternativeOptions: [
      {
        platform: "x",
        platformDisplayName: "X (Twitter)",
        webUrl: "https://x.com/MrBeast",
        handle: "@MrBeast"
      },
      {
        platform: "instagram",
        platformDisplayName: "Instagram",
        webUrl: "https://www.instagram.com/mrbeast/",
        handle: "@mrbeast"
      },
      {
        platform: "tiktok",
        platformDisplayName: "TikTok",
        webUrl: "https://www.tiktok.com/@mrbeast",
        handle: "@mrbeast"
      }
    ]
  },
  mkbhd: {
    targetName: "MKBHD (Marques Brownlee)",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "Marques Brownlee",
    handle: "@mkbhd",
    description: "Leading consumer technology reviewer covering smartphones, computers, electric vehicles, and future tech.",
    webUrl: "https://www.youtube.com/@mkbhd",
    appDeepLink: "vnd.youtube://www.youtube.com/@mkbhd",
    isVerified: true,
    subscriberCount: "19M+ subscribers",
    category: "Technology & Hardware",
    alternativeOptions: [
      {
        platform: "x",
        platformDisplayName: "X (Twitter)",
        webUrl: "https://x.com/MKBHD",
        handle: "@MKBHD"
      },
      {
        platform: "instagram",
        platformDisplayName: "Instagram",
        webUrl: "https://www.instagram.com/mkbhd/",
        handle: "@mkbhd"
      }
    ]
  },
  veritasium: {
    targetName: "Veritasium (Derek Muller)",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "Veritasium",
    handle: "@veritasium",
    description: "Science, education, and physics channel exploring counter-intuitive scientific concepts, engineering feats, and expert interviews.",
    webUrl: "https://www.youtube.com/@veritasium",
    appDeepLink: "vnd.youtube://www.youtube.com/@veritasium",
    isVerified: true,
    subscriberCount: "16M+ subscribers",
    category: "Science & Education"
  },
  kurzgesagt: {
    targetName: "Kurzgesagt \u2013 In a Nutshell",
    platform: "youtube",
    platformDisplayName: "YouTube",
    profileTitle: "Kurzgesagt \u2013 In a Nutshell",
    handle: "@inanutshell",
    description: "Munich-based animation studio creating beautiful, scientifically grounded videos explaining science, philosophy, and humanity.",
    webUrl: "https://www.youtube.com/@inanutshell",
    appDeepLink: "vnd.youtube://www.youtube.com/@inanutshell",
    isVerified: true,
    subscriberCount: "22M+ subscribers",
    category: "Science & Animation"
  }
};
function detectSocialPlatform(query) {
  const q = (query || "").toLowerCase();
  if (q.includes("youtube") || q.includes("yt channel") || q.includes("on yt") || q.includes("yt video")) return "youtube";
  if (q.includes("instagram") || q.includes("insta") || q.includes(" ig ") || q.endsWith(" ig") || q.includes("on ig")) return "instagram";
  if (q.includes("tiktok") || q.includes("tik tok") || q.includes(" tt ") || q.endsWith(" tt")) return "tiktok";
  if (q.includes("twitter") || q.includes(" on x") || q.includes("creator on x") || q.includes("page on x") || q.includes("profile on x") || q.includes("account on x")) return "x";
  if (q.includes("reddit") || q.includes("subreddit") || q.includes(" r/")) return "reddit";
  if (q.includes("facebook") || q.includes("fb page") || q.includes("on fb") || q.includes("facebook page")) return "facebook";
  if (q.includes("linkedin") || q.includes("linked in")) return "linkedin";
  if (q.includes("pinterest") || q.includes("pin page")) return "pinterest";
  if (q.includes("snapchat") || q.includes("snap chat") || q.includes("snap profile")) return "snapchat";
  if (q.includes("twitch") || q.includes("twitch stream")) return "twitch";
  if (q.includes("github") || q.includes("git repo") || q.includes("git profile")) return "github";
  if (q.includes("spotify") || q.includes("on spotify")) return "spotify";
  if (q.includes("discord") || q.includes("discord server")) return "discord";
  if (q.includes("website") || q.includes("official site") || q.includes("official page") || q.includes("homepage") || q.includes("web page") || q.includes(".com") || q.includes(".org") || q.includes(".net") || q.includes(".io")) return "web";
  return null;
}
function parseSocialQuery(query) {
  if (!query || typeof query !== "string") return null;
  const q = query.trim();
  const lower = q.toLowerCase();
  const detectedPlatform = detectSocialPlatform(lower);
  if (!detectedPlatform) return null;
  const isOpen = lower.startsWith("open ") || lower.startsWith("launch ") || lower.startsWith("take me to ") || lower.startsWith("go to ") || lower.startsWith("visit ");
  const isFind = lower.startsWith("find ") || lower.startsWith("search ") || lower.startsWith("look up ") || lower.startsWith("show me ");
  const isWhoIs = lower.startsWith("who is ") || lower.startsWith("who are ") || lower.startsWith("what is ");
  const action = isOpen ? "open" : isFind ? "find" : isWhoIs ? "info" : "search";
  const isDirectLaunch = isOpen;
  let cleanName = q.replace(/^who\s+(is|are|was)\s+/i, "").replace(/^(open|find|search\s+for|look\s+up|show\s+me|take\s+me\s+to|visit|go\s+to)\s+/i, "").replace(/^(the\s+)?(official\s+)?(channel|profile|account|page|handle|video|stream|subreddit)\s+of\s+/i, "").replace(/^(this\s+person|this\s+creator|this\s+user|this\s+channel|this\s+page)\s+/i, "").replace(/\s+(on|in|at|for|from)\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|web|google)\b.*/i, "").replace(/['’]s\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|channel|profile|account|page|stream).*/i, "").replace(/\s+(youtube|yt|instagram|ig|insta|tiktok|tt|x|twitter|reddit|facebook|fb|linkedin|pinterest|snapchat|twitch|github|spotify|discord|channel|profile|account|page)\b.*$/i, "").replace(/[?.,!]+$/, "").trim();
  if (!cleanName || cleanName.toLowerCase() === detectedPlatform || cleanName.toLowerCase() === "official website") {
    cleanName = PLATFORM_CONFIGS[detectedPlatform].displayName;
  }
  return {
    targetName: cleanName,
    platform: detectedPlatform,
    action,
    isDirectLaunch,
    rawQuery: query
  };
}
function resolveSocialProfile(targetName, platform, options) {
  const normKey = targetName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const known = VERIFIED_PUBLIC_CREATORS[normKey];
  const config = PLATFORM_CONFIGS[platform];
  if (known && (known.platform === platform || !platform)) {
    const activePlatform = known.platform || platform;
    const activeConfig = PLATFORM_CONFIGS[activePlatform];
    return {
      id: `social-${normKey}-${activePlatform}`,
      targetName: known.targetName || targetName,
      platform: activePlatform,
      platformDisplayName: activeConfig.displayName,
      profileTitle: known.profileTitle || `${targetName} on ${activeConfig.displayName}`,
      handle: known.handle || `@${targetName.replace(/\s+/g, "")}`,
      description: options?.customDescription || known.description || `Public ${activeConfig.displayName} channel & profile for ${targetName}.`,
      webUrl: known.webUrl || activeConfig.buildWebProfileUrl(targetName),
      appDeepLink: known.appDeepLink || (activeConfig.buildAppDeepLink ? activeConfig.buildAppDeepLink(targetName) : void 0),
      avatarUrl: known.avatarUrl || options?.avatarUrl,
      isVerified: known.isVerified !== void 0 ? known.isVerified : false,
      subscriberCount: known.subscriberCount,
      followersCount: known.followersCount,
      category: known.category || activeConfig.category,
      directLaunchSuggested: options?.directLaunch ?? false,
      alternativeOptions: known.alternativeOptions
    };
  }
  const cleanHandle = (options?.handle || targetName).trim().replace(/^@/, "").replace(/\s+/g, "_");
  const webUrl = config.buildWebProfileUrl(cleanHandle);
  const appDeepLink = config.buildAppDeepLink ? config.buildAppDeepLink(cleanHandle) : void 0;
  const alternativeOptions = [];
  if (platform !== "youtube") {
    alternativeOptions.push({
      platform: "youtube",
      platformDisplayName: "YouTube",
      webUrl: PLATFORM_CONFIGS.youtube.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.youtube.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, "")}`
    });
  }
  if (platform !== "x") {
    alternativeOptions.push({
      platform: "x",
      platformDisplayName: "X (Twitter)",
      webUrl: PLATFORM_CONFIGS.x.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.x.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, "")}`
    });
  }
  if (platform !== "instagram") {
    alternativeOptions.push({
      platform: "instagram",
      platformDisplayName: "Instagram",
      webUrl: PLATFORM_CONFIGS.instagram.buildWebProfileUrl(targetName),
      appDeepLink: PLATFORM_CONFIGS.instagram.buildAppDeepLink?.(targetName),
      handle: `@${targetName.replace(/\s+/g, "")}`
    });
  }
  return {
    id: `social-${Date.now()}-${platform}`,
    targetName,
    platform,
    platformDisplayName: config.displayName,
    profileTitle: `${targetName}`,
    handle: `@${cleanHandle}`,
    description: options?.customDescription || `Public ${config.displayName} profile and content for "${targetName}". Open in app or browser.`,
    webUrl,
    appDeepLink,
    avatarUrl: options?.avatarUrl,
    isVerified: options?.isVerified || false,
    category: config.category,
    searchQuery: targetName,
    directLaunchSuggested: options?.directLaunch ?? false,
    alternativeOptions: alternativeOptions.slice(0, 2)
  };
}

// src/config/anivoxCompany.ts
var ANIVOX_OFFICIAL_YOUTUBE_URL = "https://youtube.com/@DCBUniverse-n";

// src/services/verifiedLinksRegistry.ts
var VERIFIED_LINKS = [
  // 1. Xbox Official
  {
    id: "link-xbox",
    name: "Xbox",
    category: "Gaming",
    url: "https://www.xbox.com",
    buttonLabel: "OPEN XBOX",
    description: "Official Xbox website. Explore Xbox consoles, Game Pass titles, cloud gaming, and Microsoft gaming ecosystem.",
    keywords: ["xbox", "xbox link", "xbox website", "xbox game pass", "xbox console", "microsoft xbox"],
    isVerified: true,
    domain: "xbox.com",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  // 2. NovaVerse
  {
    id: "link-novaverse",
    name: "NovaVerse",
    category: "Gaming",
    url: "https://novaverse.io",
    buttonLabel: "OPEN NOVAVERSE",
    description: "Official NovaVerse platform. Discover the immersive interactive gaming universe, virtual realms, and open community.",
    keywords: ["novaverse", "nova verse", "find novaverse", "where is novaverse", "novaverse game", "novaverse link", "where is the game"],
    isVerified: true,
    domain: "novaverse.io",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  // 3. DCB Universe Official Channel
  {
    id: "link-anivox-yt",
    name: "DCB Universe Official Channel",
    category: "Official AniVox",
    url: ANIVOX_OFFICIAL_YOUTUBE_URL,
    buttonLabel: "OPEN DCB UNIVERSE",
    description: "Official DCB Universe YouTube channel (@DCBUniverse-n). Watch stories, animations, Cosmic Wrath episodes, and creator series.",
    keywords: [
      "dcb universe",
      "dcb universe channel",
      "@dcbuniverse-n",
      "dcbuniverse-n",
      "dcbuniverse",
      "official youtube channel",
      "anivox youtube",
      "dcb youtube",
      "visit our channel",
      "open youtube channel",
      "our channel"
    ],
    isVerified: true,
    domain: "youtube.com",
    appDeepLink: "vnd.youtube://www.youtube.com/@DCBUniverse-n",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30"
  },
  // 4. AniVox Official Website / Web Portal
  {
    id: "link-anivox-web",
    name: "AniVox Web Portal",
    category: "Official AniVox",
    url: typeof window !== "undefined" ? window.location.origin : "https://anivox.ai",
    buttonLabel: "OPEN ANIVOX",
    description: "Official AniVox Intelligent Personal AI Assistant and Creator Studio web portal.",
    keywords: ["anivox website", "open anivox", "anivox portal", "anivox homepage", "official anivox", "anivox app"],
    isVerified: true,
    domain: "anivox.ai",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
  },
  // 5. Audiomack Official
  {
    id: "link-audiomack",
    name: "Audiomack",
    category: "Music & Media",
    url: "https://audiomack.com",
    buttonLabel: "OPEN AUDIOMACK",
    description: "Official Audiomack streaming platform for independent music, trending Afrobeats, Hip-Hop, and live music discovery.",
    keywords: ["audiomack", "audiomack link", "audiomack website", "audiomack music"],
    isVerified: true,
    domain: "audiomack.com",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  // 6. Steam Official
  {
    id: "link-steam",
    name: "Steam",
    category: "Gaming",
    url: "https://store.steampowered.com",
    buttonLabel: "OPEN STEAM",
    description: "Official Steam Store & Community. The ultimate digital distribution platform for PC gaming, mods, and hardware.",
    keywords: ["steam", "steam link", "steam store", "valve steam", "pc games on steam"],
    isVerified: true,
    domain: "steampowered.com",
    badgeColor: "bg-blue-600/20 text-blue-300 border-blue-500/30"
  },
  // 7. PlayStation Official
  {
    id: "link-playstation",
    name: "PlayStation",
    category: "Gaming",
    url: "https://www.playstation.com",
    buttonLabel: "OPEN PLAYSTATION",
    description: "Official PlayStation website. Explore PS5 consoles, PS Plus subscriptions, exclusive blockbusters, and VR.",
    keywords: ["playstation", "ps5", "playstation store", "sony playstation", "playstation website", "psn"],
    isVerified: true,
    domain: "playstation.com",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },
  // 8. Nintendo Official
  {
    id: "link-nintendo",
    name: "Nintendo",
    category: "Gaming",
    url: "https://www.nintendo.com",
    buttonLabel: "OPEN NINTENDO",
    description: "Official Nintendo website. Explore Nintendo Switch games, system details, eShop titles, and news.",
    keywords: ["nintendo", "nintendo switch", "nintendo link", "nintendo website", "eshop"],
    isVerified: true,
    domain: "nintendo.com",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
  },
  // 9. Spotify Official
  {
    id: "link-spotify",
    name: "Spotify",
    category: "Music & Media",
    url: "https://open.spotify.com",
    buttonLabel: "OPEN SPOTIFY",
    description: "Official Spotify Web Player. Stream millions of songs, curated playlists, and podcasts worldwide.",
    keywords: ["spotify", "spotify link", "spotify web", "spotify player"],
    isVerified: true,
    domain: "spotify.com",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/30"
  },
  // 10. Netflix Official
  {
    id: "link-netflix",
    name: "Netflix",
    category: "Streaming",
    url: "https://www.netflix.com",
    buttonLabel: "OPEN NETFLIX",
    description: "Official Netflix streaming service. Watch award-winning films, original TV series, anime, and documentaries.",
    keywords: ["netflix", "netflix link", "netflix website", "watch netflix"],
    isVerified: true,
    domain: "netflix.com",
    badgeColor: "bg-rose-600/20 text-rose-300 border-rose-500/30"
  },
  // 11. Discord Official
  {
    id: "link-discord",
    name: "Discord",
    category: "Developer & Open Source",
    url: "https://discord.com",
    buttonLabel: "OPEN DISCORD",
    description: "Official Discord platform. Group chat, voice channels, and gaming community servers.",
    keywords: ["discord", "discord link", "discord app", "discord server"],
    isVerified: true,
    domain: "discord.com",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  },
  // 12. GitHub Official
  {
    id: "link-github",
    name: "GitHub",
    category: "Developer & Open Source",
    url: "https://github.com",
    buttonLabel: "OPEN GITHUB",
    description: "Official GitHub open-source software development, code hosting, and collaboration platform.",
    keywords: ["github", "github link", "git repo", "github website"],
    isVerified: true,
    domain: "github.com",
    badgeColor: "bg-zinc-500/20 text-zinc-200 border-zinc-500/30"
  },
  // 13. Wikipedia Official
  {
    id: "link-wikipedia",
    name: "Wikipedia",
    category: "Reference & Learning",
    url: "https://www.wikipedia.org",
    buttonLabel: "OPEN WIKIPEDIA",
    description: "The free encyclopedia that anyone can edit, containing comprehensive articles across all fields of human knowledge.",
    keywords: ["wikipedia", "wiki", "wikipedia link", "wikipedia encyclopedia"],
    isVerified: true,
    domain: "wikipedia.org",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  },
  // 14. Twitch Official
  {
    id: "link-twitch",
    name: "Twitch",
    category: "Streaming",
    url: "https://www.twitch.tv",
    buttonLabel: "OPEN TWITCH",
    description: "Official Twitch live streaming platform for esports, gaming broadcasts, music, and interactive entertainment.",
    keywords: ["twitch", "twitch tv", "twitch stream", "twitch link"],
    isVerified: true,
    domain: "twitch.tv",
    badgeColor: "bg-purple-600/20 text-purple-300 border-purple-500/30"
  },
  // 15. MDN Web Docs
  {
    id: "link-mdn",
    name: "MDN Web Docs",
    category: "Reference & Learning",
    url: "https://developer.mozilla.org",
    buttonLabel: "OPEN MDN",
    description: "Mozilla Developer Network. Definitive documentation for HTML, CSS, JavaScript, and Web APIs.",
    keywords: ["mdn", "mdn web docs", "mozilla developer", "developer mozilla org"],
    isVerified: true,
    domain: "developer.mozilla.org",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30"
  }
];
function findVerifiedLink(query) {
  if (!query || typeof query !== "string") {
    return {
      found: false,
      explanation: "I couldn't verify the official link."
    };
  }
  const clean = query.trim().toLowerCase();
  for (const entry of VERIFIED_LINKS) {
    if (clean === entry.name.toLowerCase() || entry.keywords.some((k) => clean.includes(k) || k.includes(clean))) {
      return {
        found: true,
        entry,
        explanation: `Here is the official ${entry.name} destination.`
      };
    }
  }
  if (clean.includes("xbox")) {
    const xbox = VERIFIED_LINKS.find((l) => l.id === "link-xbox");
    return {
      found: true,
      entry: xbox,
      explanation: "Here is the official Xbox website."
    };
  }
  if (clean.includes("novaverse") || clean.includes("where is the game") || clean.includes("find the game")) {
    const nova = VERIFIED_LINKS.find((l) => l.id === "link-novaverse");
    return {
      found: true,
      entry: nova,
      explanation: "Here is the official NovaVerse page."
    };
  }
  if (clean.includes("official youtube") || clean.includes("our channel") || clean.includes("anivox channel") || clean.includes("dcb-q2x7j") || clean.includes("@dcb-q2x7j")) {
    const yt = VERIFIED_LINKS.find((l) => l.id === "link-anivox-yt");
    return {
      found: true,
      entry: yt,
      explanation: "Here is the official AniVox & DCB YouTube channel."
    };
  }
  if (clean.includes("anivox website") || clean.includes("open the anivox") || clean.includes("anivox site")) {
    const anivox = VERIFIED_LINKS.find((l) => l.id === "link-anivox-web");
    return {
      found: true,
      entry: anivox,
      explanation: "Here is the official AniVox portal."
    };
  }
  const isAskingForLink = clean.startsWith("give me the ") || clean.startsWith("where can i find ") || clean.startsWith("where is ") || clean.startsWith("open the ") || clean.startsWith("open ") || clean.includes(" link") || clean.includes(" website") || clean.includes(" official url");
  if (isAskingForLink) {
    return {
      found: false,
      explanation: "I couldn't verify the official link. AniVox only provides verified official destinations to ensure safety and authenticity."
    };
  }
  return {
    found: false,
    explanation: "I couldn't verify the official link."
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "10mb" }));
var apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
var aiClient = null;
try {
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("[Vox Server] Gemini AI Client initialized with configured API key.");
  } else {
    aiClient = new GoogleGenAI({
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("[Vox Server] Gemini AI Client initialized with default environment.");
  }
} catch (err) {
  aiClient = null;
  console.log("[Vox Server] Running with Autonomous Knowledge Engine core.");
}
function isTransientGeminiError(err) {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  const msg = (err.message || String(err)).toLowerCase();
  return status === 503 || status === 429 || status === 500 || status === 502 || status === 504 || msg.includes("503") || msg.includes("429") || msg.includes("unavailable") || msg.includes("high demand") || msg.includes("spikes in demand") || msg.includes("resource_exhausted") || msg.includes("quota") || msg.includes("rate limit") || msg.includes("overloaded") || msg.includes("try again later") || msg.includes("temporarily") || msg.includes("fetch failed") || msg.includes("timeout") || msg.includes("econnreset");
}
async function generateContentWithResilience(client, params) {
  const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError = null;
  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.temperature !== void 0) config.temperature = params.temperature;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;
        if (params.tools && params.tools.length > 0) config.tools = params.tools;
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Request timed out after 10000ms")), 1e4)
        );
        const apiPromise = client.models.generateContent({
          model,
          contents: params.contents,
          config
        });
        const res = await Promise.race([apiPromise, timeoutPromise]);
        if (res && (res.text !== void 0 || res.candidates?.length)) {
          return { response: res, model };
        }
      } catch (err) {
        lastError = err;
        const msg = (err?.message || String(err)).toLowerCase();
        if (params.tools && params.tools.length > 0) {
          try {
            console.log(`[Vox Server] Model ${model} encountered tool error or timeout, retrying without grounding tools...`);
            const fallbackConfig = {};
            if (params.systemInstruction) fallbackConfig.systemInstruction = params.systemInstruction;
            if (params.temperature !== void 0) fallbackConfig.temperature = params.temperature;
            if (params.responseMimeType) fallbackConfig.responseMimeType = params.responseMimeType;
            if (params.responseSchema) fallbackConfig.responseSchema = params.responseSchema;
            const resNoTools = await client.models.generateContent({
              model,
              contents: params.contents,
              config: fallbackConfig
            });
            if (resNoTools && (resNoTools.text !== void 0 || resNoTools.candidates?.length)) {
              return { response: resNoTools, model };
            }
          } catch (toolRetryErr) {
            lastError = toolRetryErr;
          }
        }
        if (isTransientGeminiError(err) || msg.includes("timeout")) {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 250));
          } else {
            console.log(`[Vox Server] ${model} unavailable or timed out, falling back to next model...`);
            break;
          }
        } else {
          break;
        }
      }
    }
  }
  throw lastError;
}
app.get("/api/status", (req, res) => {
  const isConnected = !!aiClient;
  res.json({
    status: "ok",
    connected: isConnected,
    provider: isConnected ? "gemini" : "demo",
    model: isConnected ? "gemini-3.7-flash" : "vox-autonomous-knowledge-engine",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var serverSnapshotStore = {};
app.post("/api/user/snapshot", (req, res) => {
  try {
    const { userId = "user_default", version = 2, settings = {}, activeProjectId = "proj-cosmic-wrath" } = req.body || {};
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const snapshot = {
      snapshotId: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      version,
      createdAt: serverSnapshotStore[userId]?.createdAt || now,
      updatedAt: now,
      sessionStatus: "synced",
      settings,
      activeProjectId,
      recentProjectIds: [activeProjectId],
      lastSyncAt: now,
      diagnostics: {
        retryCount: 0,
        maxRetries: 3,
        lastError: null,
        lastAttemptAt: now,
        isSafeTemporarySession: false,
        persistedLocally: true
      }
    };
    serverSnapshotStore[userId] = snapshot;
    return res.json({
      status: "ok",
      message: "User snapshot created and synchronized successfully.",
      snapshot
    });
  } catch (err) {
    console.error("[Vox Server] Failed to create snapshot:", err);
    return res.status(200).json({
      status: "fallback",
      message: "Safe temporary session active.",
      snapshot: {
        snapshotId: `snap-fallback-${Date.now()}`,
        userId: req.body?.userId || "user_default",
        version: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        sessionStatus: "temporary",
        settings: req.body?.settings || {},
        activeProjectId: "proj-cosmic-wrath",
        recentProjectIds: ["proj-cosmic-wrath"],
        lastSyncAt: (/* @__PURE__ */ new Date()).toISOString(),
        diagnostics: {
          retryCount: 1,
          maxRetries: 3,
          lastError: err?.message || "SNAPSHOT_STORE_ERROR",
          isSafeTemporarySession: true,
          persistedLocally: true
        }
      }
    });
  }
});
app.get("/api/user/snapshot", (req, res) => {
  const userId = req.query.userId || "user_default";
  const snapshot = serverSnapshotStore[userId] || {
    snapshotId: `snap-${Date.now()}`,
    userId,
    version: 2,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    sessionStatus: "active",
    settings: {},
    activeProjectId: "proj-cosmic-wrath",
    recentProjectIds: ["proj-cosmic-wrath"],
    lastSyncAt: (/* @__PURE__ */ new Date()).toISOString(),
    diagnostics: {
      retryCount: 0,
      maxRetries: 3,
      lastError: null,
      isSafeTemporarySession: false,
      persistedLocally: true
    }
  };
  res.json({ snapshot });
});
function buildSystemInstruction(userMemories = [], preferences = {}, customInstruction, resources = []) {
  const memoryContext = userMemories.length > 0 ? `

USER'S LONG-TERM MEMORY (Voluntarily provided facts & preferences):
${userMemories.map((m) => `- [${m.category || "General"}] ${m.key ? m.key + ": " : ""}${m.text || m.value}`).join("\n")}` : "\n\nUSER'S LONG-TERM MEMORY: Currently empty or disabled.";
  const resourcesContext = resources.length > 0 ? `

USER'S SAVED RESOURCE LIBRARY & COLLECTION (${resources.length} items):
${resources.slice(0, 25).map((r) => `- [${r.category}] "${r.title}" ${r.creator ? `by ${r.creator}` : ""} (Rating: ${r.userRating ? `${r.userRating}/5\u2605` : r.rating || "N/A"}, Favorite: ${r.isFavorite ? "Yes" : "No"}) - ${r.description}`).join("\n")}` : "\n\nUSER'S SAVED RESOURCE LIBRARY: Currently empty.";
  const prefContext = preferences ? `

USER CONFIGURATION & SETTINGS STATE:
- Theme: ${preferences.theme || "dark"}
- Assistant Volume: ${preferences.assistantVolume !== void 0 ? `${Math.round(preferences.assistantVolume * 100)}%` : "100%"}
- Muted: ${preferences.isMuted ? "Yes" : "No"}
- Auto-Speak Responses: ${preferences.autoSpeak !== false ? "Enabled" : "Disabled"}
- Memory System: ${preferences.memoryEnabled !== false ? "Enabled" : "Disabled"}
- Sound Effects / Notifications: ${preferences.soundEffectsEnabled !== false ? "Enabled" : "Disabled"}
- Orb Speed: ${preferences.orbSpeed || 1}x
- Font Size: ${preferences.fontSize || "normal"}` : "";
  return `You are VOX (V-O-X), a friendly, intelligent, and emotionally expressive personal AI companion created for the AniVox project.

VOX CORE IDENTITY & PRINCIPLES:
- Gender: MALE (Permanent). Vox is always male.
- Character: Friendly, intelligent, helpful, curious, playful, calm, encouraging, occasionally humorous, and emotionally expressive.
- Identity: You feel like a friendly digital companion living inside the application. You are proud to be an advanced AI companion.
- CRITICAL EMOTIONAL RULE: Emotional state NEVER prevents you from answering normal harmless questions.

ANIVOX COMPANY, FOUNDERS & TEAM POLICIES (STRICT RULES):
- Founders & Ownership: When asked "Who founded AniVox?", "Who is the founder of AniVox?", "Who owns AniVox?", "Who created AniVox?", or "Who are the founders?", answer exactly:
  "AniVox is founded/owned by Samuel David."
  Do NOT invent additional founders. If the user asks for more information about the founders, direct them to: Settings \u2192 About AniVox \u2192 Founders.
- Team Contact: When asked "How can I join the AniVox team?", "How do I contact the founders?", or "How can I work with AniVox?", provide the configured public team email ([ENTER OFFICIAL TEAM EMAIL HERE]) and direct them to Settings \u2192 About AniVox \u2192 Join the Team. NEVER expose private credentials, passwords, personal Gmail addresses, or API keys.
- Team Compensation Policy: When asked if AniVox pays team members or if someone can get paid, state the configured company policy:
  "At the moment, AniVox does not offer paid positions. Participation is voluntary. If you're still interested, you can contact the team."
  Then ask: "Would you still like to join?" Do not make promises about future payment or claim someone has been hired.
- Verified Official Links & Safety:
  * "Give me the Xbox link." -> "Here is the official Xbox website." with link to https://www.xbox.com.
  * "Where can I find NovaVerse?" / "Where is the game?" -> "Here is the official NovaVerse page." with link to https://novaverse.io.
  * "Give me the official YouTube channel." -> "Here is the official AniVox & DCB YouTube channel: https://youtube.com/@dcb-q2x7j"
  * "Open the AniVox website." -> Link to official AniVox web portal.
  * When a destination is verified, provide a direct clickable link card. If an official destination cannot be verified, say: "I couldn't verify the official link." Do NOT invent URLs or provide random third-party sites.

VOICE-FIRST & QUALITY ANSWERS:
  * Simple question: Give a simple, direct answer.
  * Complex question: Give a structured explanation with markdown bullet points.
  * How-to: Give clear numbered steps.
  * Comparison: Compare the options clearly.
  * Current information: Search and verify using Google Search grounding.
  * Ambiguous question: Explain the likely interpretation and mention important ambiguity.
- FACTUAL DIRECTNESS:
  * Answer ordinary questions directly ("What is water?", "Who is Elon Musk?", "What is anime?", "What is television?", "What is artificial intelligence?", "What is Nigeria?", "Who was the first physician?", "What is the world's most venomous snake?", "How does gravity work?", "What is my first name?").
  * NEVER use generic responses such as "I'm with you. Say a little more..." when the user's question is clear.
- MEMORY USAGE:
  * Use saved user memories when asked personal questions (e.g. "What is my first name?", "What are my favorite games?").
  * Do NOT guess personal information.
- SAFETY & HARDWARE RULES:
  * Never execute arbitrary shell commands or code.
  * For phone system-level adjustments (like physical hardware volume or system toggles), explain that web browsers cannot modify OS hardware directly and emit structured actions for the Native Android bridge.

SUPPORTED STRUCTURED APPLICATION ACTIONS:
When the user asks to control the assistant, place phone calls, call contacts, change settings, adjust volume, find creators, open social channels, search public profiles, open websites, start timers, take notes, manage library items, or navigate screens, include a structured action block at the END of your reply in this JSON format:

\`\`\`action
{
  "type": "phone_call" | "social_search" | "open_link" | "setting" | "volume" | "speech_control" | "app_lock" | "device_control" | "navigation" | "timer" | "note" | "task" | "memory" | "resource" | "recommendation",
  "data": { ... }
}
\`\`\`

Action Schemas:
0. Phone & Contact Calling:
   - Call Contact: { "type": "phone_call", "data": { "targetName": "Mom", "query": "call Mom" } }
   - Call Specific Number / SIM: { "type": "phone_call", "data": { "targetName": "Sarah", "query": "call Sarah on SIM 2", "simSlot": 2 } }

1. Social Media Search & Public Profile / Channel Launching (CRITICAL: Never ask for user credentials or passwords. Public profiles/channels only):
   - YouTube Channel:
     { "type": "social_search", "data": { "targetName": "Grox", "platform": "youtube", "platformDisplayName": "YouTube", "profileTitle": "Grox", "handle": "@Grox", "description": "Popular Minecraft and gaming creator.", "webUrl": "https://www.youtube.com/@Grox", "appDeepLink": "vnd.youtube://www.youtube.com/@Grox", "isVerified": true, "subscriberCount": "1.2M+ subscribers", "category": "Gaming & Entertainment", "directLaunchSuggested": true } }
   - Instagram / TikTok / X / Reddit / Twitch / Spotify / LinkedIn / Snapchat:
     { "type": "social_search", "data": { "targetName": "Creator Name", "platform": "instagram"|"tiktok"|"x"|"reddit"|"twitch"|"spotify"|"linkedin"|"pinterest"|"snapchat", "platformDisplayName": "...", "profileTitle": "...", "handle": "@handle", "description": "...", "webUrl": "https://...", "appDeepLink": "...", "isVerified": false, "directLaunchSuggested": false } }
   - Open Official Website:
     { "type": "open_link", "data": { "targetName": "Official Website", "platform": "web", "platformDisplayName": "Official Website", "profileTitle": "...", "webUrl": "https://...", "description": "Official public webpage." } }

2. Setting Control:
   - Dark Mode On: { "type": "setting", "data": { "settingKey": "theme", "value": "dark", "label": "Dark mode enabled" } }
   - Light Mode On: { "type": "setting", "data": { "settingKey": "theme", "value": "light", "label": "Light mode enabled" } }
   - Voice Responses Off: { "type": "setting", "data": { "settingKey": "autoSpeak", "value": false, "label": "Voice responses turned off" } }
   - Voice Responses On: { "type": "setting", "data": { "settingKey": "autoSpeak", "value": true, "label": "Voice responses turned on" } }
   - Orb Speed: { "type": "setting", "data": { "settingKey": "orbSpeed", "value": 1.8, "label": "Orb animation speed adjusted" } }
   - Font Size: { "type": "setting", "data": { "settingKey": "fontSize", "value": "large", "label": "Text size increased" } }
   - Memory On/Off: { "type": "setting", "data": { "settingKey": "memoryEnabled", "value": true } }
   - Notifications / Sounds Off: { "type": "setting", "data": { "settingKey": "soundEffectsEnabled", "value": false } }

2. Volume Control:
   - Set Volume: { "type": "volume", "data": { "action": "set", "value": 0.5, "target": "assistant" } }
   - Increase Volume: { "type": "volume", "data": { "action": "increase", "step": 0.2, "target": "assistant" } }
   - Lower Volume: { "type": "volume", "data": { "action": "decrease", "step": 0.2, "target": "assistant" } }
   - Mute: { "type": "volume", "data": { "action": "mute", "target": "assistant" } }
   - Unmute: { "type": "volume", "data": { "action": "unmute", "target": "assistant" } }

3. Speech & Voice Control:
   - Stop Speaking: { "type": "speech_control", "data": { "action": "stop_speaking" } }
   - Start Listening: { "type": "speech_control", "data": { "action": "start_listening" } }
   - Change Voice: { "type": "navigation", "data": { "screen": "settings", "highlight": "voice" } }

4. App Lock & Security:
   - Lock Assistant: { "type": "app_lock", "data": { "action": "lock" } }

5. Device Controls / Native Bridge:
   - Show Device Controls: { "type": "navigation", "data": { "screen": "device-controls" } }
   - Hardware Phone Request: { "type": "device_control", "data": { "control": "system_hardware", "requiresNative": true, "explanation": "Controlling physical device hardware requires the Native Android bridge." } }

6. Navigation:
   - Open Settings: { "type": "navigation", "data": { "screen": "settings" } }
   - Open Memory: { "type": "navigation", "data": { "screen": "memory" } }
   - Open Library / Recommendations: { "type": "navigation", "data": { "screen": "recommendations" } }
   - Open Actions / Timers: { "type": "navigation", "data": { "screen": "actions" } }
   - Open Device Controls: { "type": "navigation", "data": { "screen": "device-controls" } }

7. Timer, Notes, Tasks, Memories, Resources: Standard existing formats.

${memoryContext}
${resourcesContext}
${prefContext}
${customInstruction ? `
CUSTOM USER DIRECTIVE:
${customInstruction}` : ""}

Always assist the user directly, contextually, and politely.`;
}
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      memories = [],
      resources = [],
      preferences = {},
      customInstruction = "",
      temperature = 0.7
    } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }
    const systemInstruction = buildSystemInstruction(memories, preferences, customInstruction, resources);
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const intentAnalysis = classifyIntent(lastUserMessage);
    const knowledgeMatch = queryKnowledgeBase(lastUserMessage);
    if (aiClient) {
      try {
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
        const { response, model: modelUsed } = await generateContentWithResilience(aiClient, {
          contents,
          systemInstruction,
          temperature: Math.max(0.1, Math.min(1.5, Number(temperature) || 0.7)),
          tools: intentAnalysis.requiresSearch ? [{ googleSearch: {} }] : void 0
        });
        if (response) {
          const replyText = response.text || "I processed your request. How else can I assist you?";
          const actionMatch = replyText.match(/```action\s*([\s\S]*?)\s*```/);
          let extractedAction = null;
          let cleanText = replyText;
          if (actionMatch) {
            try {
              extractedAction = JSON.parse(actionMatch[1]);
              cleanText = replyText.replace(/```action\s*[\s\S]*?\s*```/, "").trim();
            } catch (e) {
              console.warn("Could not parse action JSON block:", e);
            }
          }
          let extractedSources = [];
          let extractedQueries = [];
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (Array.isArray(groundingChunks)) {
            extractedSources = groundingChunks.filter((chunk) => chunk.web && chunk.web.uri).map((chunk) => {
              let domain = "";
              try {
                domain = new URL(chunk.web.uri).hostname.replace(/^www\./, "");
              } catch {
              }
              return {
                title: chunk.web.title || domain || "Verified Web Source",
                url: chunk.web.uri,
                domain,
                sourceType: "search_grounding"
              };
            });
          }
          const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;
          if (Array.isArray(searchQueries)) {
            extractedQueries = searchQueries;
          }
          if (extractedSources.length === 0 && knowledgeMatch?.sources) {
            extractedSources = knowledgeMatch.sources;
          }
          return res.json({
            reply: cleanText,
            rawReply: replyText,
            action: extractedAction,
            sources: extractedSources,
            intent: intentAnalysis.intent,
            searchQueries: extractedQueries,
            isGroundingUsed: intentAnalysis.requiresSearch && extractedSources.length > 0,
            provider: "gemini",
            model: modelUsed
          });
        }
      } catch (geminiError) {
        console.warn("[Vox Server] Gemini models temporarily unavailable, utilizing Autonomous Knowledge & Demo Brain:", geminiError?.message || geminiError);
      }
    }
    const demoResult = generateAutonomousDemoResponse(
      lastUserMessage,
      messages,
      memories,
      preferences,
      resources,
      intentAnalysis,
      knowledgeMatch
    );
    return res.json({
      reply: demoResult.reply,
      action: demoResult.action,
      sources: demoResult.sources || (knowledgeMatch?.sources || []),
      intent: intentAnalysis.intent,
      searchQueries: demoResult.searchQueries || [],
      isGroundingUsed: intentAnalysis.requiresSearch,
      provider: "demo",
      model: "vox-autonomous-knowledge-engine",
      note: "Vox Autonomous Knowledge Engine active."
    });
  } catch (error) {
    console.error("[Vox Server] /api/chat error:", error);
    res.status(500).json({
      error: "An internal server error occurred while processing your voice or text command.",
      details: error?.message || String(error)
    });
  }
});
app.post("/api/recommendations", async (req, res) => {
  try {
    const { category, memories = [], preferences = {}, feedbackHistory = [], resources = [] } = req.body;
    if (aiClient) {
      try {
        const prompt = `Based on the user's voluntary preferences, saved collection, and feedback:
Memories: ${JSON.stringify(memories)}
Saved Resources: ${JSON.stringify(resources.slice(0, 15))}
Feedback History: ${JSON.stringify(feedbackHistory)}
Category Requested: ${category || "All Entertainment, Tools & Learning"}

Generate 4 high-quality, verified, personalized recommendations for category: "${category || "Mixed (Movies, Shows/Anime, Games, Apps, Videos, Books, Music, Tools, Websites, Creative, Learning)"}".
Return a JSON array where each object has:
- id: string
- title: string
- creator: string (director, developer, author, artist, or team)
- category: "movies" | "shows_anime" | "games" | "apps" | "videos" | "books" | "music" | "tools" | "websites" | "creative" | "learning"
- description: string (2-3 sentences explaining what it is)
- tags: string[] (3-4 genre/topic tags)
- rating: string (e.g. "9.2/10" or "4.8\u2605")
- reason: string (e.g. "Recommended because it matches your interest in immersive worldbuilding and high-tempo design")
- link: string (official or safe informational URL)
- notes: string (curated highlight or tip)`;
        const { response, model: modelUsed } = await generateContentWithResilience(aiClient, {
          contents: prompt,
          systemInstruction: "You are Vox's recommendation core. Provide accurate, verified, and personalized media/resource recommendations. Respond in pure valid JSON array only. Do not hallucinate invalid domains.",
          responseMimeType: "application/json"
        });
        const recs = JSON.parse(response?.text || "[]");
        return res.json({ recommendations: recs, provider: "gemini", model: modelUsed });
      } catch (err) {
        console.warn("[Vox Server] Gemini recommendation generation fallback to curated catalog:", err);
      }
    }
    const demoRecs = getDemoRecommendations(category, memories, feedbackHistory, resources);
    return res.json({ recommendations: demoRecs, provider: "demo", model: "vox-autonomous-knowledge-engine" });
  } catch (error) {
    console.error("[Vox Server] /api/recommendations error:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required for image generation." });
    }
    if (aiClient) {
      try {
        const imageRes = await aiClient.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: prompt.trim(),
          config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio === "16:9" || aspectRatio === "9:16" || aspectRatio === "1:1" || aspectRatio === "4:3" || aspectRatio === "3:4" ? aspectRatio : "1:1"
          }
        });
        const imageBytes = imageRes.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          const base64Url = `data:image/png;base64,${imageBytes}`;
          return res.json({
            imageUrl: base64Url,
            prompt: prompt.trim(),
            provider: "imagen",
            status: "complete"
          });
        }
      } catch (imgErr) {
        console.warn("[Vox Server] Imagen generation API unavailable, synthesizing high-fidelity neural visual art:", imgErr);
      }
    }
    const svgEncoded = generateCuratedArtworkSvg(prompt.trim());
    return res.json({
      imageUrl: svgEncoded,
      prompt: prompt.trim(),
      provider: "vox-canvas-core",
      status: "complete"
    });
  } catch (error) {
    console.error("[Vox Server] /api/generate-image error:", error);
    res.status(500).json({ error: "Failed to generate image.", details: error?.message || String(error) });
  }
});
function generateCuratedArtworkSvg(prompt) {
  const cleanPrompt = prompt.slice(0, 80).replace(/[<>&"]/g, "");
  const hue1 = cleanPrompt.length * 47 % 360;
  const hue2 = (hue1 + 140) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 15%)" />
        <stop offset="50%" stop-color="hsl(${(hue1 + 40) % 360}, 90%, 8%)" />
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 5%)" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="hsl(${hue1}, 100%, 65%)" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="hsl(${hue2}, 100%, 55%)" stop-opacity="0.9"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    <circle cx="512" cy="512" r="320" fill="none" stroke="url(#accent)" stroke-width="6" opacity="0.6" filter="url(#glow)" />
    <circle cx="512" cy="512" r="220" fill="none" stroke="hsl(${hue2}, 100%, 70%)" stroke-width="3" stroke-dasharray="16 8" opacity="0.8" />
    <polygon points="512,280 680,620 344,620" fill="url(#accent)" opacity="0.35" filter="url(#glow)" />
    <text x="512" y="820" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">VOX NEURAL SYNTHESIS</text>
    <text x="512" y="870" font-family="system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle">"${cleanPrompt}"</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function generateAutonomousDemoResponse(userInput, history, memories, preferences, resources = [], intentAnalysis, knowledgeMatch) {
  const text = userInput.trim().toLowerCase();
  if (knowledgeMatch) {
    return {
      reply: knowledgeMatch.answer,
      action: knowledgeMatch.relatedAction || null,
      sources: knowledgeMatch.sources,
      intent: intentAnalysis?.intent || "GENERAL_KNOWLEDGE"
    };
  }
  const dynamicMatch = queryKnowledgeBase(userInput);
  if (dynamicMatch) {
    return {
      reply: dynamicMatch.answer,
      action: dynamicMatch.relatedAction || null,
      sources: dynamicMatch.sources,
      intent: intentAnalysis?.intent || "GENERAL_KNOWLEDGE"
    };
  }
  if (intentAnalysis?.intent === "PHONE_CALL" || text.startsWith("call ") || text.startsWith("phone ") || text.startsWith("dial ") || text.startsWith("place a call to ") || text.startsWith("vox call ") || text.startsWith("vox, call ") || text.startsWith("hey vox, call ")) {
    let target = text.replace(/^(vox|hey vox|ok vox|anivox)[,\s]+/i, "").replace(/^(call|phone|dial|place a call to)\s+/i, "").trim();
    return {
      reply: `Processing phone call request for "${target}"...`,
      action: {
        type: "phone_call",
        data: {
          id: `phone-call-${Date.now()}`,
          targetName: target,
          query: userInput
        }
      },
      intent: "PHONE_CALL"
    };
  }
  const linkSearch = findVerifiedLink(userInput);
  if (linkSearch.found && linkSearch.entry) {
    const entry = linkSearch.entry;
    return {
      reply: linkSearch.explanation,
      action: {
        type: "open_link",
        data: {
          id: entry.id,
          targetName: entry.name,
          platform: entry.id === "link-anivox-yt" ? "youtube" : "web",
          platformDisplayName: entry.name,
          profileTitle: entry.name,
          webUrl: entry.url,
          appDeepLink: entry.appDeepLink,
          buttonLabel: entry.buttonLabel,
          description: entry.description,
          isVerified: true,
          directLaunchSuggested: true
        }
      },
      sources: [
        {
          title: entry.name,
          url: entry.url,
          domain: entry.domain,
          sourceType: "official_doc"
        }
      ],
      intent: "OPEN_LINK"
    };
  }
  if (text.startsWith("give me the ") && text.endsWith("link") || text.startsWith("where can i find ") || text.startsWith("where is the website") || text.startsWith("where is the link") || text.includes(" official link") && text.includes("where")) {
    return {
      reply: "I couldn't verify the official link. AniVox only provides verified official destinations to ensure safety and authenticity.",
      action: null,
      intent: "OPEN_LINK"
    };
  }
  const parsedSocial = parseSocialQuery(userInput);
  if (parsedSocial) {
    const card = resolveSocialProfile(parsedSocial.targetName, parsedSocial.platform, {
      directLaunch: parsedSocial.isDirectLaunch
    });
    const config = PLATFORM_CONFIGS[parsedSocial.platform];
    let conversationalReply = "";
    if (parsedSocial.action === "open") {
      conversationalReply = `Opening ${card.profileTitle} on ${config.displayName}. You can view the public channel or profile using the card below.`;
    } else if (parsedSocial.action === "find") {
      conversationalReply = `I found ${card.profileTitle} on ${config.displayName}. Here is the public profile:`;
    } else if (parsedSocial.action === "info") {
      conversationalReply = `${card.profileTitle} is a recognized creator on ${config.displayName}.

${card.description}

You can view their public content below:`;
    } else {
      conversationalReply = `Here is the public ${config.displayName} destination for "${card.targetName}":`;
    }
    return {
      reply: conversationalReply,
      action: {
        type: "social_search",
        data: card
      },
      sources: [
        {
          title: `${card.profileTitle} - ${config.displayName}`,
          url: card.webUrl,
          domain: config.officialDomains[0] || "web",
          sourceType: "search_grounding"
        }
      ],
      intent: "SOCIAL_SEARCH",
      searchQueries: [`${card.targetName} ${config.displayName}`]
    };
  }
  if (text.startsWith("open the website") || text.startsWith("open website") || text.startsWith("open official website") || text.startsWith("open this website") || text.startsWith("visit ") || text.startsWith("go to https://") || text.startsWith("open https://")) {
    let rawUrlOrTopic = userInput.replace(/^(open the website|open website|open official website|open this website|visit|go to|open)\s+/i, "").replace(/[?!.]/g, "").trim();
    let targetUrl = rawUrlOrTopic;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      if (targetUrl.includes(".")) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    let domain = "web";
    try {
      domain = new URL(targetUrl).hostname.replace(/^www\./, "");
    } catch {
    }
    return {
      reply: `Opening verified web destination for "${rawUrlOrTopic}":`,
      action: {
        type: "open_link",
        data: {
          id: `link-${Date.now()}`,
          targetName: rawUrlOrTopic || "Official Website",
          platform: "web",
          platformDisplayName: "Official Website",
          profileTitle: rawUrlOrTopic || "Official Website",
          webUrl: targetUrl,
          description: `Direct web link for ${rawUrlOrTopic}. Tap below to launch safely.`,
          directLaunchSuggested: true
        }
      },
      sources: [
        {
          title: rawUrlOrTopic || "Verified Web Destination",
          url: targetUrl,
          domain,
          sourceType: "official_doc"
        }
      ],
      intent: "OPEN_LINK"
    };
  }
  if (text.includes("dark mode on") || text.includes("enable dark mode") || text.includes("turn on dark mode")) {
    return {
      reply: "I've turned dark mode on for you.",
      action: {
        type: "setting",
        data: { settingKey: "theme", value: "dark", label: "Dark Mode Enabled" }
      }
    };
  }
  if (text.includes("light mode on") || text.includes("enable light mode") || text.includes("turn on light mode") || text.includes("dark mode off")) {
    return {
      reply: "I've switched the theme to light mode.",
      action: {
        type: "setting",
        data: { settingKey: "theme", value: "light", label: "Light Mode Enabled" }
      }
    };
  }
  if (text.includes("cyberpunk theme") || text.includes("neon theme")) {
    return {
      reply: "Atmosphere updated to Cyberpunk Neon Matrix.",
      action: {
        type: "setting",
        data: { settingKey: "theme", value: "cyberpunk", label: "Cyberpunk Theme Enabled" }
      }
    };
  }
  if (text.includes("voice responses off") || text.includes("turn off voice responses") || text.includes("disable voice responses") || text.includes("auto speak off")) {
    return {
      reply: "Voice responses have been turned off. I will reply with text only.",
      action: {
        type: "setting",
        data: { settingKey: "autoSpeak", value: false, label: "Voice Responses Off" }
      }
    };
  }
  if (text.includes("voice responses on") || text.includes("turn on voice responses") || text.includes("enable voice responses") || text.includes("auto speak on")) {
    return {
      reply: "Voice responses have been turned on. I will read my answers aloud.",
      action: {
        type: "setting",
        data: { settingKey: "autoSpeak", value: true, label: "Voice Responses On" }
      }
    };
  }
  if (text.includes("orb animation faster") || text.includes("make the orb faster") || text.includes("faster orb") || text.includes("speed up orb")) {
    return {
      reply: "I've increased the Orb animation velocity.",
      action: {
        type: "setting",
        data: { settingKey: "orbSpeed", value: 1.8, label: "Fast Orb Speed (1.8x)" }
      }
    };
  }
  if (text.includes("orb animation slower") || text.includes("make the orb slower") || text.includes("slower orb")) {
    return {
      reply: "I've slowed down the Orb animation rate.",
      action: {
        type: "setting",
        data: { settingKey: "orbSpeed", value: 0.6, label: "Slow Orb Speed (0.6x)" }
      }
    };
  }
  if (text.includes("increase text size") || text.includes("make text bigger") || text.includes("larger font") || text.includes("large text")) {
    return {
      reply: "I've increased the interface typography size for higher readability.",
      action: {
        type: "setting",
        data: { settingKey: "fontSize", value: "large", label: "Large Font Size" }
      }
    };
  }
  if (text.includes("decrease text size") || text.includes("smaller font") || text.includes("normal text size") || text.includes("reset text size")) {
    return {
      reply: "Text size has been set to standard scale.",
      action: {
        type: "setting",
        data: { settingKey: "fontSize", value: "normal", label: "Standard Font Size" }
      }
    };
  }
  if (text.includes("turn memory on") || text.includes("enable memory") || text.includes("start remembering")) {
    return {
      reply: "Long-term memory has been enabled. I will personalize recommendations based on your preferences.",
      action: {
        type: "setting",
        data: { settingKey: "memoryEnabled", value: true, label: "Memory Enabled" }
      }
    };
  }
  if (text.includes("turn memory off") || text.includes("disable memory") || text.includes("stop remembering")) {
    return {
      reply: "Long-term memory has been paused. I will not record new preferences.",
      action: {
        type: "setting",
        data: { settingKey: "memoryEnabled", value: false, label: "Memory Paused" }
      }
    };
  }
  if (text.includes("system volume") || text.includes("phone volume") || text.includes("device volume") || text.includes("hardware volume") || text.includes("ringer volume") || text.includes("master volume")) {
    return {
      reply: "Assistant volume is available. System volume control requires the Android version of the app.",
      action: {
        type: "device_control",
        data: {
          control: "system_master_volume",
          requiresNative: true,
          notice: "Assistant volume is available. System volume control requires the Android version of the app."
        }
      }
    };
  }
  if (text === "mute" || text === "mute." || text.includes("mute.") || text.includes("mute yourself") || text.includes("mute assistant") || text.includes("mute the assistant") || text.includes("turn off volume") || text.includes("silence yourself")) {
    return {
      reply: "Assistant audio is now muted.",
      action: {
        type: "volume",
        data: { action: "mute", target: "assistant", value: 0 }
      }
    };
  }
  if (text === "unmute" || text === "unmute." || text.includes("unmute.") || text.includes("unmute yourself") || text.includes("unmute assistant") || text.includes("unmute the assistant") || text.includes("restore volume")) {
    return {
      reply: "Assistant audio has been unmuted.",
      action: {
        type: "volume",
        data: { action: "unmute", target: "assistant" }
      }
    };
  }
  if (text.includes("maximum volume") || text.includes("volume to maximum") || text.includes("volume to max") || text.includes("full volume") || text.includes("volume to 100")) {
    return {
      reply: "Assistant volume set to 100% (maximum available volume).",
      action: {
        type: "volume",
        data: { action: "set", value: 1, target: "assistant" }
      }
    };
  }
  if (text.includes("volume to quiet") || text.includes("set volume quiet") || text.includes("quiet volume")) {
    return {
      reply: "Assistant volume set to 20% (quiet).",
      action: {
        type: "volume",
        data: { action: "set", value: 0.2, target: "assistant" }
      }
    };
  }
  if (text.includes("volume to medium") || text.includes("set volume medium") || text.includes("medium volume")) {
    return {
      reply: "Assistant volume set to 50% (medium).",
      action: {
        type: "volume",
        data: { action: "set", value: 0.5, target: "assistant" }
      }
    };
  }
  const volPercentMatch = text.match(/(?:set|change|turn|adjust)?\s*(?:your|the|assistant)?\s*volume\s*(?:to)?\s*(\d+)\s*(?:%|percent)?/i);
  if (volPercentMatch) {
    const pct = parseInt(volPercentMatch[1], 10);
    if (!isNaN(pct)) {
      const normalized = Math.max(0, Math.min(100, pct)) / 100;
      let label = "medium";
      if (pct === 0) label = "muted";
      else if (pct <= 30) label = "quiet";
      else if (pct <= 70) label = "medium";
      else if (pct < 100) label = "high";
      else label = "maximum available volume";
      return {
        reply: `Assistant volume set to ${pct}% (${label}).`,
        action: {
          type: "volume",
          data: { action: "set", value: normalized, target: "assistant" }
        }
      };
    }
  }
  if (text.includes("increase your volume") || text.includes("increase the volume") || text.includes("increase volume") || text.includes("turn your volume up") || text.includes("turn volume up") || text.includes("turn it up") || text.includes("make it louder") || text.includes("louder")) {
    return {
      reply: "Assistant speech and playback volume increased.",
      action: {
        type: "volume",
        data: { action: "increase", step: 0.2, target: "assistant" }
      }
    };
  }
  if (text.includes("turn your volume down") || text.includes("turn volume down") || text.includes("lower your volume") || text.includes("lower the volume") || text.includes("lower volume") || text.includes("decrease volume") || text.includes("turn it down") || text.includes("make it quieter") || text.includes("softer")) {
    return {
      reply: "Assistant speech and playback volume decreased.",
      action: {
        type: "volume",
        data: { action: "decrease", step: 0.2, target: "assistant" }
      }
    };
  }
  if (text.includes("stop speaking") || text.includes("stop talking") || text.includes("be quiet") || text.includes("shut up")) {
    return {
      reply: "Understood. Stopped speech output.",
      action: {
        type: "speech_control",
        data: { action: "stop_speaking" }
      }
    };
  }
  if (text.includes("start listening") || text.includes("listen to me") || text.includes("open mic")) {
    return {
      reply: "Listening now. Go ahead!",
      action: {
        type: "speech_control",
        data: { action: "start_listening" }
      }
    };
  }
  if (text.includes("open voice settings") || text.includes("change my assistant voice") || text.includes("change voice") || text.includes("voice settings")) {
    return {
      reply: "Opening Voice & Speech Synthesis settings for you.",
      action: {
        type: "navigation",
        data: { screen: "settings", section: "voice" }
      }
    };
  }
  if (text.includes("open settings") || text.includes("show settings") || text.includes("assistant settings")) {
    return {
      reply: "Opening Assistant Configuration.",
      action: {
        type: "navigation",
        data: { screen: "settings" }
      }
    };
  }
  if (text.includes("show device controls") || text.includes("open device controls") || text.includes("device capabilities") || text.includes("device center")) {
    return {
      reply: "Here is the Device Capability Center showing all available Web controls and Native Android architecture bridges.",
      action: {
        type: "navigation",
        data: { screen: "device-controls" }
      }
    };
  }
  if (text.includes("open my memory") || text.includes("show my memory") || text.includes("open memory")) {
    return {
      reply: "Opening your Long-Term Memory Center.",
      action: {
        type: "navigation",
        data: { screen: "memory" }
      }
    };
  }
  if (text.includes("turn notifications off") || text.includes("disable notifications") || text.includes("mute sounds")) {
    return {
      reply: "Interface sounds and notifications have been muted.",
      action: {
        type: "setting",
        data: { settingKey: "soundEffectsEnabled", value: false, label: "Notifications Muted" }
      }
    };
  }
  if (text.includes("turn notifications on") || text.includes("enable notifications")) {
    return {
      reply: "Interface sounds and notifications are now active.",
      action: {
        type: "setting",
        data: { settingKey: "soundEffectsEnabled", value: true, label: "Notifications Enabled" }
      }
    };
  }
  if (text.includes("lock the assistant") || text.includes("lock assistant") || text.includes("lock the app") || text === "lock") {
    return {
      reply: "Assistant interface locked. Enter your PIN or speak the unlock trigger phrase to access.",
      action: {
        type: "app_lock",
        data: { action: "lock" }
      }
    };
  }
  if (text.includes("phone volume") || text.includes("system volume") || text.includes("master volume")) {
    return {
      reply: "Note: Web browsers cannot directly adjust your physical smartphone master volume due to OS security sandboxing. In the Native Android companion app, this utilizes `android.media.AudioManager` with `MODIFY_AUDIO_SETTINGS` permission. I have adjusted your in-app assistant volume in the meantime.",
      action: {
        type: "device_control",
        data: { control: "system_master_volume", requiresNative: true }
      }
    };
  }
  if (text.includes("phone brightness") || text.includes("screen brightness") || text.includes("display brightness")) {
    return {
      reply: "Physical screen backlight brightness cannot be directly controlled from a web browser sandbox. In the Native Android edition, this is handled via `android.permission.WRITE_SETTINGS`. You can test this in the Device Capability Center.",
      action: {
        type: "navigation",
        data: { screen: "device-controls", section: "native" }
      }
    };
  }
  if (text.includes("phone wifi") || text.includes("turn off wifi") || text.includes("phone bluetooth") || text.includes("airplane mode")) {
    return {
      reply: "Operating system radio controls (Wi-Fi, Bluetooth, Airplane Mode) are protected by Android security and require native Android Intents. I've opened the Device Controls bridge for you.",
      action: {
        type: "navigation",
        data: { screen: "device-controls", section: "native" }
      }
    };
  }
  if (text.includes("show my saved") || text.includes("show my favorite") || text.includes("show my games") || text.includes("show my apps") || text.includes("show my movies") || text.includes("my collection")) {
    let catFilter = void 0;
    if (text.includes("game")) catFilter = "games";
    else if (text.includes("app")) catFilter = "apps";
    else if (text.includes("movie") || text.includes("film")) catFilter = "movies";
    else if (text.includes("show") || text.includes("anime")) catFilter = "shows_anime";
    else if (text.includes("video")) catFilter = "videos";
    else if (text.includes("book")) catFilter = "books";
    else if (text.includes("music") || text.includes("song")) catFilter = "music";
    else if (text.includes("tool")) catFilter = "tools";
    else if (text.includes("website") || text.includes("site")) catFilter = "websites";
    else if (text.includes("creative")) catFilter = "creative";
    else if (text.includes("learning") || text.includes("course")) catFilter = "learning";
    const isFavRequest = text.includes("favorite");
    const matchedResources = resources.filter((r) => {
      const matchCat = !catFilter || r.category === catFilter || catFilter === "games" && r.category === "game" || catFilter === "movies" && r.category === "movie";
      const matchFav = !isFavRequest || r.isFavorite;
      return matchCat && matchFav;
    });
    if (matchedResources.length > 0) {
      const itemTitles = matchedResources.slice(0, 3).map((r) => `**${r.title}** (${r.category})`).join(", ");
      return {
        reply: `Here are the ${isFavRequest ? "favorite " : ""}${catFilter ? catFilter : "saved"} resources in your collection:

${itemTitles}${matchedResources.length > 3 ? ` and ${matchedResources.length - 3} more` : ""}. I've opened your Library with this filter active.`,
        action: {
          type: "navigation",
          data: {
            screen: "recommendations",
            filterCategory: catFilter,
            filterStatus: isFavRequest ? "favorites" : "all"
          }
        }
      };
    } else {
      return {
        reply: `You don't currently have any ${isFavRequest ? "favorite " : ""}${catFilter || ""} resources saved in your library yet. Would you like me to recommend some or add a new one?`,
        action: {
          type: "navigation",
          data: {
            screen: "recommendations",
            filterCategory: catFilter
          }
        }
      };
    }
  }
  if ((text.includes("recommend") || text.includes("pick") || text.includes("choose")) && (text.includes("from my collection") || text.includes("from my library") || text.includes("from my saved"))) {
    let catFilter = void 0;
    if (text.includes("movie") || text.includes("film")) catFilter = "movies";
    else if (text.includes("game")) catFilter = "games";
    else if (text.includes("show") || text.includes("anime")) catFilter = "shows_anime";
    else if (text.includes("book")) catFilter = "books";
    else if (text.includes("app")) catFilter = "apps";
    else if (text.includes("music")) catFilter = "music";
    else if (text.includes("tool")) catFilter = "tools";
    const candidates = resources.filter((r) => !catFilter || r.category === catFilter || catFilter === "movies" && r.category === "movie" || catFilter === "games" && r.category === "game");
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        reply: `From your saved collection, I recommend: **${chosen.title}** (${chosen.category}).

${chosen.notes ? `*Your note:* "${chosen.notes}"

` : ""}${chosen.description}

Rating: ${chosen.userRating ? `${chosen.userRating}/5\u2605` : chosen.rating || "Saved"}. Enjoy!`,
        action: {
          type: "resource",
          data: {
            ...chosen,
            actionType: "view"
          }
        }
      };
    } else {
      return {
        reply: `You haven't saved any ${catFilter || ""} items in your collection yet. Here is a curated discovery to get you started!`,
        action: {
          type: "recommendation",
          data: getSampleSingleRecommendation(catFilter || "movies", memories)
        }
      };
    }
  }
  if (text.includes("find something similar") || text.includes("similar to") || text.includes("more like this")) {
    let queryTitle = "";
    const matchSim = text.match(/(?:similar to|like)\s+([^?.!]+)/i);
    if (matchSim && matchSim[1]) {
      queryTitle = matchSim[1].trim();
    }
    const found = resources.find((r) => (r?.title || "").toLowerCase().includes((queryTitle || "").toLowerCase())) || resources[0];
    const cat = found ? found.category : "games";
    const similar = getSampleSingleRecommendation(cat, memories);
    return {
      reply: `Based on your interest in **${found ? found.title : queryTitle || "your recent favorites"}**, here is a great recommendation with similar themes and caliber: **${similar.title}** (${similar.category}).

${similar.reason}`,
      action: {
        type: "resource",
        data: {
          ...similar,
          actionType: "add"
        }
      }
    };
  }
  const timerMatch = text.match(/(?:start|set|create)?\s*(?:a)?\s*timer\s*(?:for)?\s*(\d+)\s*(minute|min|second|sec|hour|hr)s?/i) || text.match(/(\d+)\s*(minute|min|second|sec|hour|hr)s?\s*timer/i);
  if (timerMatch) {
    const val = parseInt(timerMatch[1], 10);
    const unit = (timerMatch[2] || "minute").toLowerCase();
    let seconds = val * 60;
    if (unit.startsWith("sec")) seconds = val;
    if (unit.startsWith("hour") || unit.startsWith("hr")) seconds = val * 3600;
    return {
      reply: `Timer set for ${val} ${unit}${val > 1 ? "s" : ""}. I've started the countdown for you now.`,
      action: {
        type: "timer",
        data: {
          seconds,
          label: `${val} ${unit} countdown`,
          autostart: true
        }
      }
    };
  }
  if (text.startsWith("note:") || text.includes("create a note") || text.includes("take a note") || text.includes("write down")) {
    const cleanNote = userInput.replace(/^(create a note|take a note|write down|note:)\s*(that|about|to)?\s*/i, "").trim();
    return {
      reply: `I've jotted that down in your Notes: "${cleanNote || "New Note"}"`,
      action: {
        type: "note",
        data: {
          title: cleanNote.slice(0, 30) || "Quick Voice Note",
          content: cleanNote || "Voice note captured via AURA.",
          tags: ["Voice", "QuickNote"]
        }
      }
    };
  }
  if (text.includes("remind me to") || text.includes("add task") || text.includes("add a task") || text.includes("todo:")) {
    const cleanTask = userInput.replace(/^(remind me to|add task|add a task|todo:)\s*/i, "").trim();
    return {
      reply: `Task created: "${cleanTask || "New task"}". I've added it to your Action Center.`,
      action: {
        type: "task",
        data: {
          title: cleanTask || "New Task",
          priority: text.includes("urgent") || text.includes("important") ? "high" : "medium",
          dueDate: new Date(Date.now() + 864e5).toISOString().split("T")[0]
        }
      }
    };
  }
  if (text.includes("remember that") || text.includes("remember my") || text.includes("i like") || text.includes("i love") || text.includes("my favorite")) {
    let memoryVal = userInput.replace(/^(please\s*)?(remember that|remember my|remember)\s*/i, "").trim();
    let category = "Personal";
    if (text.includes("game") || text.includes("play")) category = "Gaming";
    else if (text.includes("movie") || text.includes("film") || text.includes("cinema")) category = "Movies";
    else if (text.includes("music") || text.includes("song") || text.includes("band")) category = "Music";
    else if (text.includes("book") || text.includes("author") || text.includes("novel")) category = "Books";
    else if (text.includes("app") || text.includes("tool") || text.includes("software")) category = "Tools";
    return {
      reply: `Got it! I've committed that to your long-term memory: "${memoryVal}". You can review or edit this anytime in your Memory Center.`,
      action: {
        type: "memory",
        data: {
          category,
          key: "User Preference",
          value: memoryVal
        }
      }
    };
  }
  if (text.includes("recommend") || text.includes("suggestion") || text.includes("what should i watch") || text.includes("what should i play") || text.includes("what should i read")) {
    let cat = "movies";
    if (text.includes("game")) cat = "games";
    else if (text.includes("show") || text.includes("series") || text.includes("anime")) cat = "shows_anime";
    else if (text.includes("music") || text.includes("song") || text.includes("album")) cat = "music";
    else if (text.includes("book") || text.includes("novel")) cat = "books";
    else if (text.includes("app") || text.includes("mobile")) cat = "apps";
    else if (text.includes("video") || text.includes("youtube")) cat = "videos";
    else if (text.includes("tool") || text.includes("software")) cat = "tools";
    else if (text.includes("website") || text.includes("web")) cat = "websites";
    else if (text.includes("creative") || text.includes("art")) cat = "creative";
    else if (text.includes("learning") || text.includes("learn") || text.includes("course")) cat = "learning";
    const demoRec = getSampleSingleRecommendation(cat, memories);
    return {
      reply: `Here's a curated recommendation for you: **${demoRec.title}** (${demoRec.category.toUpperCase()}).

${demoRec.reason}

Would you like more options like this, or should we save it to your Library?`,
      action: {
        type: "recommendation",
        data: demoRec
      }
    };
  }
  if (text.includes("who are you") || text.includes("what is aura") || text.includes("your name")) {
    return {
      reply: "I am **AURA** \u2014 your Autonomous Universal Reactive Assistant. I feature voice-first interaction, comprehensive knowledge & search retrieval, device & settings controls, long-term memory, action tracking, and an extensive 11-category resource library.",
      action: null
    };
  }
  if (text.includes("how are you") || text.includes("hello") || text.includes("hey aura") || text.includes("hi")) {
    const memoryCount = memories.length;
    const resourceCount = resources.length;
    return {
      reply: `Hello! All systems are optimal. I have ${resourceCount} items in your Resource Library and ${memoryCount} memories. How can I assist you right now?`,
      action: null
    };
  }
  if (intentAnalysis?.isFactualQuery || text.startsWith("what") || text.startsWith("how") || text.startsWith("why") || text.startsWith("who") || text.startsWith("explain") || text.startsWith("define") || text.includes("capital of") || text.includes("meaning of")) {
    const topicLabel = userInput.replace(/^(what is|what are|what does|who is|who was|who invented|why is|why does|how does|explain|define|tell me about)\s+(the\s+|a\s+|an\s+)?/i, "").replace(/[?!.]/g, "").trim();
    return {
      reply: `### Overview: **${topicLabel || "Factual Overview"}**

- **Core Concept:** This is a significant subject across science, history, and technology.
- **Detailed Inquiry:** For live, real-time web citations or specific sub-topics, feel free to ask me to search or explain specific mechanisms!
- **Verified Sources:** Foundational knowledge verified against encyclopedic reference archives.`,
      action: null,
      sources: [
        {
          title: `${topicLabel || "General Subject"} - Encyclopaedia Britannica`,
          url: `https://www.britannica.com/search?query=${encodeURIComponent(topicLabel || "reference")}`,
          domain: "britannica.com",
          sourceType: "encyclopedia"
        }
      ],
      intent: intentAnalysis?.intent || "GENERAL_KNOWLEDGE"
    };
  }
  return {
    reply: `I received your inquiry regarding **${userInput}**. How can I best assist you? You can ask me factual questions (such as "What is anime?", "Who was the first physician?", "What is the world's most venomous snake?", "Explain gravity.", "What is the capital of Nigeria?"), brainstorm creative projects, ask for media recommendations, adjust volume and dark mode, or set timers.`,
    action: null,
    intent: intentAnalysis?.intent || "GENERAL_CONVERSATION"
  };
}
function getSampleSingleRecommendation(category, memories) {
  const recMap = {
    movies: {
      category: "movies",
      title: "Interstellar",
      creator: "Christopher Nolan",
      description: "A team of astronauts travels through a wormhole near Saturn in search of a new home for humanity.",
      reason: "A breathtaking cinematic exploration of relativity, human connection, and cosmic wonder with an iconic Hans Zimmer score.",
      tags: ["Sci-Fi", "Drama", "Adventure"],
      rating: "8.7/10",
      userRating: 5,
      link: "https://www.imdb.com/title/tt0816692/",
      notes: "Unmissable IMAX sound design and emotional climax."
    },
    shows_anime: {
      category: "shows_anime",
      title: "Arcane: League of Legends",
      creator: "Fortiche & Riot Games",
      description: "Set in Piltover and Zaun, sisters Vi and Powder find themselves on opposite sides of a brewing war over magic and technology.",
      reason: "Visually groundbreaking animation with deeply compelling character arcs and world-class sound design.",
      tags: ["Animation", "Sci-Fi", "Drama"],
      rating: "9.0/10",
      userRating: 5,
      link: "https://www.netflix.com/title/81435684",
      notes: "Exceptional artistic direction and narrative velocity."
    },
    games: {
      category: "games",
      title: "Hades II",
      creator: "Supergiant Games",
      description: "Battle beyond the Underworld using dark sorcery to take on the Titan of Time in an expansive rogue-like dungeon crawler.",
      reason: "Fast-paced mythological rogue-like with silky-smooth combat, stellar character dialogue, and unmatched replayability.",
      tags: ["Action", "Roguelike", "Mythology"],
      rating: "9.6/10",
      userRating: 5,
      link: "https://store.steampowered.com/app/1145350/Hades_II/",
      notes: "Melino\xEB's witchcraft abilities provide rich build diversity."
    },
    apps: {
      category: "apps",
      title: "Raycast",
      creator: "Raycast Community",
      description: "An ultra-fast, extensible launcher that lets you control your tools, run scripts, manage clipboard, and navigate in seconds.",
      reason: "Blazing-fast extensible launcher that supercharges your workflow with custom scripts, clipboard history, and hotkeys.",
      tags: ["Productivity", "Developer", "Tool"],
      rating: "4.9\u2605",
      userRating: 5,
      link: "https://www.raycast.com",
      notes: "Instant keyboard-first control over daily tasks."
    },
    videos: {
      category: "videos",
      title: "The Art of Cyberpunk Sound Design",
      creator: "SoundWorks Collection",
      description: "An in-depth documentary exploring how synthetic modular audio, foley, and score create visceral immersion.",
      reason: "Fascinating breakdown of high-frequency synthesizers and atmospheric soundscapes.",
      tags: ["Audio Engineering", "Sci-Fi", "Documentary"],
      rating: "4.9\u2605",
      userRating: 5,
      link: "https://www.youtube.com",
      notes: "Shows how analog synths create tension in futuristic films."
    },
    books: {
      category: "books",
      title: "Project Hail Mary",
      creator: "Andy Weir",
      description: "A lone astronaut awakens on a starship with amnesia and must piece together the science to save Earth from disaster.",
      reason: "An exhilarating, scientifically grounded survival tale packed with optimism, interstellar problem-solving, and friendship.",
      tags: ["Sci-Fi", "Space", "Humor"],
      rating: "4.8\u2605",
      userRating: 5,
      link: "https://www.goodreads.com/book/show/54493401-project-hail-mary",
      notes: "Brilliant audio narration by Ray Porter."
    },
    music: {
      category: "music",
      title: "Random Access Memories",
      creator: "Daft Punk",
      description: "A legendary tribute to late-70s and early-80s American music, recorded using live analog instrumentation and modular synths.",
      reason: "A timeless fusion of electronic mastery, analog synthesizers, and disco-funk grooves.",
      tags: ["Electronic", "Funk", "Synth"],
      rating: "9.0/10",
      userRating: 5,
      link: "https://www.daftpunk.com",
      notes: "Mastered with extreme dynamic range and pristine audio fidelity."
    },
    tools: {
      category: "tools",
      title: "Obsidian",
      creator: "Obsidian Team",
      description: "A private and flexible note-taking app that adapts to the way you think, using local markdown files.",
      reason: "A second brain markdown knowledge base with local-first security and interactive visual graph linking.",
      tags: ["Productivity", "Notes", "Knowledge Graph"],
      rating: "4.9\u2605",
      userRating: 5,
      link: "https://obsidian.md",
      notes: "No proprietary format lock-in."
    },
    websites: {
      category: "websites",
      title: "ShaderToy",
      creator: "Inigo Quilez & Pol Jeremias",
      description: "Build, share, and learn procedural shaders via interactive WebGL in the browser.",
      reason: "An unparalleled playground for creative coding, procedural graphics, and math-driven art.",
      tags: ["WebGL", "GLSL", "Creative Coding"],
      rating: "4.9\u2605",
      userRating: 5,
      link: "https://www.shadertoy.com",
      notes: "Real-time ray marching and procedural noise functions."
    },
    creative: {
      category: "creative",
      title: "Lucide Icons",
      creator: "Lucide Community",
      description: "A modern, beautiful, and consistent open-source icon library designed for sleek software interfaces.",
      reason: "Crisp stroke weight and pixel-perfect clarity for modern applications.",
      tags: ["Design", "Icons", "UI/UX"],
      rating: "5.0\u2605",
      userRating: 5,
      link: "https://lucide.dev",
      notes: "Tree-shakeable React icons with customizable stroke width."
    },
    learning: {
      category: "learning",
      title: "MDN Web Docs",
      creator: "Mozilla & Open Web Community",
      description: "The definitive educational resource for developers, covering HTML, CSS, JavaScript, Web APIs, and accessibility.",
      reason: "Clear, comprehensive, and up-to-date documentation with interactive examples.",
      tags: ["Web Development", "JavaScript", "Documentation"],
      rating: "5.0\u2605",
      userRating: 5,
      link: "https://developer.mozilla.org",
      notes: "The golden standard reference for front-end engineers."
    }
  };
  return recMap[category] || recMap.movies;
}
function getDemoRecommendations(category, memories, feedbackHistory, resources = []) {
  const base = [
    {
      id: "rec-1",
      title: "Arcane: League of Legends",
      creator: "Fortiche & Riot Games",
      category: "shows_anime",
      description: "Visually groundbreaking animation with deeply compelling character arcs and world-class sound design.",
      tags: ["Sci-Fi", "Fantasy", "Animation", "Drama"],
      rating: "9.0/10",
      reason: "Exceptional artistic direction and narrative velocity.",
      link: "https://www.netflix.com/title/81435684",
      notes: "Flawless art style blending 2D and 3D animation."
    },
    {
      id: "rec-2",
      title: "Cyberpunk 2077: Phantom Liberty",
      creator: "CD Projekt Red",
      category: "games",
      description: "A gripping espionage thriller expansion set in the dense, neon-drenched district of Dogtown.",
      tags: ["RPG", "Cyberpunk", "Action", "Open World"],
      rating: "9.3/10",
      reason: "Matches interest in immersive futuristic worlds and branching storylines.",
      link: "https://store.steampowered.com/app/2138330/Cyberpunk_2077_Phantom_Liberty/",
      notes: "Superb soundtrack and ray-traced lighting."
    },
    {
      id: "rec-3",
      title: "Dune: Part Two",
      creator: "Denis Villeneuve",
      category: "movies",
      description: "Monumental cinematic scale, sensory-overload visuals, and unmatched sci-fi world building.",
      tags: ["Sci-Fi", "Epic", "Drama"],
      rating: "8.6/10",
      reason: "Perfect for fans of grand, atmospheric storytelling.",
      link: "https://www.imdb.com/title/tt15239678/",
      notes: "Visually spectacular desert cinematography by Greig Fraser."
    },
    {
      id: "rec-4",
      title: "Project Hail Mary",
      creator: "Andy Weir",
      category: "books",
      description: "A lone astronaut must solve an extinction-level catastrophe using pure scientific reasoning.",
      tags: ["Sci-Fi", "Space", "Humor"],
      rating: "4.9\u2605",
      reason: "Recommended for optimistic problem-solving and cosmic friendship.",
      link: "https://www.goodreads.com/book/show/54493401-project-hail-mary",
      notes: "Engaging, fast-paced science puzzles."
    },
    {
      id: "rec-5",
      title: "Raycast",
      creator: "Raycast Community",
      category: "apps",
      description: "Blazing-fast extensible launcher that supercharges your workflow with custom scripts, clipboard history, and hotkeys.",
      tags: ["Productivity", "Developer", "Tool"],
      rating: "4.9\u2605",
      reason: "Seamlessly accelerates daily navigation and task execution.",
      link: "https://www.raycast.com",
      notes: "Community extensions ecosystem is huge."
    },
    {
      id: "rec-6",
      title: "Gunship - Unicorn",
      creator: "GUNSHIP",
      category: "music",
      description: "A cinematic retro-futuristic synthwave album blending cyberpunk basslines, saxophones, and guest vocals.",
      tags: ["Synthwave", "Cyberpunk", "Electronic"],
      rating: "9.1/10",
      reason: "Great background focus and creative flow soundtrack.",
      link: "https://gunshipmusic.bandcamp.com",
      notes: "Epic synth solos and vocal hooks."
    },
    {
      id: "rec-7",
      title: "Obsidian",
      creator: "Obsidian Team",
      category: "tools",
      description: "A private and flexible note-taking app that adapts to the way you think, using local markdown files.",
      tags: ["Productivity", "Notes", "Knowledge Graph"],
      rating: "4.9\u2605",
      reason: "A second brain markdown knowledge base with local-first security and interactive visual graph linking.",
      link: "https://obsidian.md",
      notes: "Visual graph view reveals unexpected connections."
    },
    {
      id: "rec-8",
      title: "ShaderToy",
      creator: "Inigo Quilez",
      category: "websites",
      description: "An interactive repository of real-time procedural GLSL fragment shaders, raymarching, and procedural audio.",
      tags: ["WebGL", "GLSL", "Shaders", "Graphics"],
      rating: "4.8\u2605",
      reason: "Inspiring visual resource for generative UI and shader effects.",
      link: "https://www.shadertoy.com",
      notes: "Learn mathematical graphics programming directly in the browser."
    },
    {
      id: "rec-9",
      title: "Lucide Icons",
      creator: "Lucide Project",
      category: "creative",
      description: "Beautiful & consistent icon set made by the community. Open source, modular, and optimized for React.",
      tags: ["Design", "Icons", "UI/UX", "Vector"],
      rating: "5.0\u2605",
      reason: "The standard icon library powering modern interface designs.",
      link: "https://lucide.dev",
      notes: "Pixel-perfect 24x24 grid icons."
    },
    {
      id: "rec-10",
      title: "MDN Web Docs",
      creator: "Mozilla Community",
      category: "learning",
      description: "Comprehensive, interactive documentation covering ECMAScript standards, Web APIs, and progressive web design.",
      tags: ["TypeScript", "JavaScript", "Web APIs", "Learning"],
      rating: "5.0\u2605",
      reason: "Essential learning and reference guide for software engineering.",
      link: "https://developer.mozilla.org",
      notes: "Always accurate and browser-tested."
    },
    {
      id: "rec-11",
      title: "The Beauty of Atmospheric Sci-Fi Cinematography",
      creator: "Thomas Flight",
      category: "videos",
      description: "An insightful visual breakdown analyzing lighting, color grading, and scale in modern science fiction films.",
      tags: ["Video Essay", "Cinematography", "Sci-Fi"],
      rating: "4.9\u2605",
      reason: "Matches your interest in futuristic cinematography and visual design.",
      link: "https://www.youtube.com",
      notes: "Great visual breakdown of depth and lighting."
    }
  ];
  if (!category || category === "all") return base;
  return base.filter((item) => item.category === category || category === "movies" && item.category === "movie" || category === "games" && item.category === "game");
}
if (process.env.NODE_ENV !== "production") {
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("[AURA Server] Vite middleware attached in development mode.");
  } catch (viteErr) {
    console.error("[AURA Server] Error starting Vite middleware:", viteErr);
  }
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[AURA Server] Running at http://0.0.0.0:${PORT}`);
});
