// Unique seed bucket 1/8 for Hermit TV.
// Control Phi's movie source farm expands this channel toward 96 distinct,
// profile-matched full movies. The seed IDs are never shared with another
// movie-channel seed catalog.
(function(){
  "use strict";

  const rows = [
    ["Jumbo", 4559, "LE8z71LEqbY", "Family Central"],
    ["A Royal Christmas Ball", 5271, "ll7_eVUkzdQ", "Family Central"],
    ["Dreambuilders", 4829, "sXuXuVoQrJ0", "Shout! Studios"],
    ["Boonie Bears: The Big Shrink", 5390, "3opY2JZUR8E", "Family Central"],
    ["Little Bite in the Big City", 4453, "8X9hkxYZcb4", "Family Central"],
    ["Tiger", 5077, "gLgbxd2wCYY", "Family Central"],
    ["Maya the Bee 3: The Golden Orb", 5297, "ZzVOrzxko6I", "Shout! Studios"],
    ["Big Fish & Begonia", 6321, "PfdB7CBqLtA", "Shout! Studios"]
  ];

  window.HERMIT_CATALOG = rows.map(function(row,index){
    return {
      id:"HERMIT-TV-SEED-" + String(index+1).padStart(3,"0"),
      title:row[0], year:null, collection:"Family Adventure Seed", runtimeSeconds:row[1],
      videoId:row[2], source:row[3], networkChannel:"Hermit TV", contentClass:"Seed Feature",
      rating:"Unrated", cleared:true, posterUrl:""
    };
  });

  window.INFINITY_CHANNEL = {
    id:"HERMIT-TV",
    sourcePolicy:"Unique static seed bucket 1/8. Runtime catalog expansion comes from Hermit TV's own Control Phi source profile.",
    schedulePolicy:"Seven-day no-repeat scheduler. Missing inventory stays empty until unique sources are harvested; it never wraps the seed list."
  };

  window.HERMIT_COMMERCIALS = [{id:"AD-001",title:"Hermit TV intermission",durationSeconds:60,videoId:"",cleared:true}];
})();
