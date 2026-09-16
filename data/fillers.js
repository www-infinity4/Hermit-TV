(function(){
  "use strict";

  // Small, verified starter library for deterministic end-of-movie gap filling.
  // Keep this list intentionally easy to audit: exact duration + direct media URL.
  window.HERMIT_FILLERS = [
    {
      id:"IA-DRIVEIN-INTERMISSION-13",
      title:"Drive-In Intermission 13",
      durationSeconds:308,
      sourceType:"archive-mp4",
      sourceUrl:"https://archive.org/download/DriveInIntermission13/Drive-inIntermission13_512kb.mp4",
      sourcePage:"https://archive.org/details/DriveInIntermission13",
      license:"Public Domain",
      cleared:true,
      maxPerGap:3
    },
    {
      id:"IA-HOT-DOG-2",
      title:"Vintage Drive-In Hot Dog Ad",
      durationSeconds:25,
      sourceType:"archive-mp4",
      sourceUrl:"https://archive.org/download/HotDog2/hot_dog_2.mp4",
      sourcePage:"https://archive.org/details/HotDog2",
      license:"Public Domain Mark 1.0",
      cleared:true,
      maxPerGap:20
    }
  ];

  window.HERMIT_FILLER_POLICY = {
    version:"2026-09-16.1",
    rule:"movie-first-then-pack-largest-fitting-fillers",
    maximumDeadAirSeconds:24,
    sourcePolicy:"Use only individually reviewed filler items with an explicit reusable/public-domain status and a stable direct media URL."
  };
})();
