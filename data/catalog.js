// Playback policy: R-rated and age-restricted movie entries are excluded from this channel rotation.
// Full-length movies currently offered free by established YouTube movie channels.
// Recheck availability periodically because publishers can change or remove embeds.
window.HERMIT_CATALOG = [
  { id:"MOV-001", title:"The Phantom Planet", year:1961, collection:"Atomic Sci-Fi", runtimeSeconds:4920, videoId:"MqaN40sbap4", cleared:true },
  { id:"MOV-002", title:"Things to Come", year:1936, collection:"Future Worlds", runtimeSeconds:5820, videoId:"22cOGjikPG8", cleared:true },
  { id:"MOV-004", title:"The Amazing Transparent Man", year:1960, collection:"Strange Science", runtimeSeconds:4680, videoId:"OvJS9WFW7Uc", cleared:true },
  { id:"MOV-005", title:"Attack from Space", year:1965, collection:"Space Adventure", runtimeSeconds:3000, videoId:"duc_edJQaxU", cleared:true },
  { id:"MOV-006", title:"Phantom from Space", year:1953, collection:"Alien Signal", runtimeSeconds:4380, videoId:"SN8R3k73qj0", cleared:true },
  { id:"MOV-007", title:"Missile to the Moon", year:1958, collection:"Moon Mission", runtimeSeconds:4680, videoId:"PkSlAmx_wnk", cleared:true },
  { id:"MOV-008", title:"The Monster of Piedras Blancas", year:1959, collection:"Creature Feature", runtimeSeconds:4740, videoId:"SYKl4PtdPUA", cleared:true },
  { id:"MOV-009", title:"The Santa Trap", year:2002, collection:"Family Night", runtimeSeconds:5280, videoId:"GJytAtSuEew", cleared:true },
  { id:"MOV-010", title:"A Christmas Karen", year:2022, collection:"Comedy Night", runtimeSeconds:5940, videoId:"6nJ8n3MIiZY", cleared:true },
  { id:"MOV-011", title:"A Room to Share", year:2024, collection:"Romantic Comedy", runtimeSeconds:5400, videoId:"8s7XqNWiTrw", cleared:true },
  { id:"MOV-012", title:"Runs in the Family", year:2023, collection:"Adventure Comedy", runtimeSeconds:6300, videoId:"AuwUwN1JVec", cleared:true },
  { id:"MOV-013", title:"Moving McAllister", year:2007, collection:"Road Comedy", runtimeSeconds:5340, videoId:"mVZOMXWsExs", cleared:true },
].map(movie => ({ ...movie, posterUrl:"" }));

// Add sponsor video IDs here. Blank IDs display synchronized station cards.
window.HERMIT_COMMERCIALS = [
  { id:"AD-001", title:"Hermit TV intermission", durationSeconds:60, videoId:"", cleared:true },
  { id:"AD-002", title:"Tonight on Hermit TV", durationSeconds:60, videoId:"", cleared:true },
  { id:"AD-003", title:"Now showing", durationSeconds:60, videoId:"", cleared:true }
];
