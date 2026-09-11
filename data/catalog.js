window.HERMIT_CATALOG = [
  ["Short Circuit",1986,"Electric Dream"],["Short Circuit 2",1988,"Electric Dream"],["Innerspace",1987,"Electric Dream"],["*batteries not included",1987,"Electric Dream"],["Flight of the Navigator",1986,"Electric Dream"],["D.A.R.Y.L.",1985,"Electric Dream"],["Explorers",1985,"Electric Dream"],["Real Genius",1985,"Electric Dream"],["Weird Science",1985,"Electric Dream"],["My Science Project",1985,"Electric Dream"],["SpaceCamp",1986,"Electric Dream"],["The Last Starfighter",1984,"Electric Dream"],
  ["Back to the Future",1985,"Time Warp"],["Back to the Future Part II",1989,"Time Warp"],["Back to the Future Part III",1990,"Time Warp"],["Bill & Ted's Excellent Adventure",1989,"Time Warp"],["Bill & Ted's Bogus Journey",1991,"Time Warp"],["Time Bandits",1981,"Time Warp"],["Peggy Sue Got Married",1986,"Time Warp"],["Somewhere in Time",1980,"Time Warp"],["The Philadelphia Experiment",1984,"Time Warp"],["Millennium",1989,"Time Warp"],["Freejack",1992,"Time Warp"],["Timerider: The Adventure of Lyle Swann",1982,"Time Warp"],["Young Einstein",1988,"Time Warp"],
  ["Big",1988,"Wish Switch"],["Vice Versa",1988,"Wish Switch"],["Like Father Like Son",1987,"Wish Switch"],["18 Again!",1988,"Wish Switch"],["Dream a Little Dream",1989,"Wish Switch"],["Teen Witch",1989,"Wish Switch"],["Mannequin",1987,"Wish Switch"],["Mannequin Two: On the Move",1991,"Wish Switch"],["Splash",1984,"Wish Switch"],["Maid to Order",1987,"Wish Switch"],["Chances Are",1989,"Wish Switch"],["Switch",1991,"Wish Switch"],
  ["Ghostbusters",1984,"Creature Feature"],["Ghostbusters II",1989,"Creature Feature"],["Gremlins",1984,"Creature Feature"],["Gremlins 2: The New Batch",1990,"Creature Feature"],["Beetlejuice",1988,"Creature Feature"],["The Monster Squad",1987,"Creature Feature"],["Little Monsters",1989,"Creature Feature"],["The Gate",1987,"Creature Feature"],["House II: The Second Story",1987,"Creature Feature"],["Harry and the Hendersons",1987,"Creature Feature"],["Arachnophobia",1990,"Creature Feature"],["Critters",1986,"Creature Feature"],
  ["Mr. Nanny",1993,"Action Hero"],["Suburban Commando",1991,"Action Hero"],["3 Ninjas",1992,"Action Hero"],["3 Ninjas Kick Back",1994,"Action Hero"],["3 Ninjas Knuckle Up",1995,"Action Hero"],["Surf Ninjas",1993,"Action Hero"],["Sidekicks",1992,"Action Hero"],["Teenage Mutant Ninja Turtles",1990,"Action Hero"],["Teenage Mutant Ninja Turtles II: The Secret of the Ooze",1991,"Action Hero"],["Teenage Mutant Ninja Turtles III",1993,"Action Hero"],["The Last Dragon",1985,"Action Hero"],["Remo Williams: The Adventure Begins",1985,"Action Hero"],
  ["Adventures in Babysitting",1987,"Family Chaos"],["Uncle Buck",1989,"Family Chaos"],["The Great Outdoors",1988,"Family Chaos"],["Don't Tell Mom the Babysitter's Dead",1991,"Family Chaos"],["Troop Beverly Hills",1989,"Family Chaos"],["Dutch",1991,"Family Chaos"],["Curly Sue",1991,"Family Chaos"],["Problem Child",1990,"Family Chaos"],["Problem Child 2",1991,"Family Chaos"],["Camp Nowhere",1994,"Family Chaos"],["Heavyweights",1995,"Family Chaos"],["Houseguest",1995,"Family Chaos"],
  ["WarGames",1983,"Arcade Underground"],["Tron",1982,"Arcade Underground"],["The Wizard",1989,"Arcade Underground"],["Cloak & Dagger",1984,"Arcade Underground"],["Sneakers",1992,"Arcade Underground"],["Hackers",1995,"Arcade Underground"],["Electric Dreams",1984,"Arcade Underground"],["Johnny Mnemonic",1995,"Arcade Underground"],["Last Action Hero",1993,"Arcade Underground"],["Stay Tuned",1992,"Arcade Underground"],["Matinee",1993,"Arcade Underground"],["Blank Check",1994,"Arcade Underground"],
  ["The Princess Bride",1987,"Fantasy Sunday"],["Willow",1988,"Fantasy Sunday"],["Labyrinth",1986,"Fantasy Sunday"],["The Dark Crystal",1982,"Fantasy Sunday"],["The NeverEnding Story",1984,"Fantasy Sunday"],["The NeverEnding Story II: The Next Chapter",1990,"Fantasy Sunday"],["Return to Oz",1985,"Fantasy Sunday"],["Hook",1991,"Fantasy Sunday"],["The Indian in the Cupboard",1995,"Fantasy Sunday"],["The Pagemaster",1994,"Fantasy Sunday"],["The Rocketeer",1991,"Fantasy Sunday"],["Masters of the Universe",1987,"Fantasy Sunday"],
  ["Airborne",1993,"Wheels and Air"],["Rad",1986,"Wheels and Air"],["BMX Bandits",1983,"Wheels and Air"],["Gleaming the Cube",1989,"Wheels and Air"]
].map((movie, index) => ({
  id: `MOV-${String(index + 1).padStart(3, "0")}`,
  title: movie[0],
  year: movie[1],
  collection: movie[2],
  runtimeSeconds: 6000,
  videoId: "",
  cleared: false
}));

// Add rights-cleared YouTube commercial IDs here. Blank IDs display a timed Hermit TV station card.
window.HERMIT_COMMERCIALS = [
  { id: "AD-001", title: "Hermit TV intermission", durationSeconds: 60, videoId: "", cleared: true },
  { id: "AD-002", title: "Tonight on Hermit TV", durationSeconds: 60, videoId: "", cleared: true },
  { id: "AD-003", title: "Now showing", durationSeconds: 60, videoId: "", cleared: true }
];
