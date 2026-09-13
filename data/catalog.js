// Seven-day family rotation: 84 unique, full-length ordinary YouTube uploads.
// Each source labels the upload as family, kids, faith, holiday, or animation programming.
(function () {
  "use strict";

  const current = [
    ["Daddy Daughter Trip",5795,"fIhM9MiEN50","Movie Central"],
    ["Mayberry Man",5927,"a_AwfI9TPY8","EncourageTV"],
    ["Accidental Family",5672,"XH63ZMpgsAk","Movie Central"],
    ["Pretty Outrageous",4542,"wbzh-m3cCmc","Family Central"],
    ["Opposite Day",4856,"M18tKPAGlJ4","Girls Night In Movies"],
    ["Stinky Summer",5415,"Gxa3gWpVPes","Family Central"],
    ["Cleaver Family Reunion",5445,"r7urqvC_avI","Movie Central"]
  ];

  const week = [
    ["The Little Mermaid",5887,"D7UeODAj7Sc","Family Central"],
    ["Space Dogs: Adventures to the Moon",4547,"rnl9rrARyNc","Family Central"],
    ["Bunyan & Babe",5093,"_f9pyIOgrAs","Family Central"],
    ["A Nanny for Christmas",5260,"BaZ_HEj3_0o","Family Central"],
    ["A Cat's Life",4902,"oVIsHiuiNj4","Family Central"],
    ["Jumbo",4559,"LE8z71LEqbY","Family Central"],
    ["Albert: Up, Up and Away!",4821,"orI0kGFOncY","Shout! Studios"],
    ["Tad: The Lost Explorer",5516,"BCiJ_oEZp10","Family Central"],
    ["The Jungle Bunch",5840,"ginVeOgYhF0","Shout! Studios"],
    ["Super Bear",5113,"G_Frl_QRVqs","Family Central"],
    ["Christmas Cupcakes",5303,"PLfY5kkilDo","Family Central"],
    ["The Dog Who Saved Christmas",5305,"W-nwHSugFHU","Family Central"],
    ["Christmas Town",4945,"daB9TDs3zmE","Family Central"],
    ["Maybe I'm Fine",5137,"dX4VsKS0MAM","Family Central"],
    ["The Tree That Saved Christmas",5283,"7jhgkEuCfiQ","Family Central"],
    ["Little Town",5421,"rZWEznf7UIo","Family Central"],
    ["Saving Santaland",5450,"d-EIS1Uik8M","Family Central"],
    ["A Royal Christmas Ball",5271,"ll7_eVUkzdQ","Family Central"],
    ["Camp Cool Kids",6265,"y428AwGDCnE","Family Central"],
    ["Aperture Kids and the Mysterious Neighbor",5195,"fpkKrYxj-w0","Family Central"],
    ["Bilal: A New Breed of Hero",6584,"krRTgW3tEr8","Family Central"],
    ["Finding Callaro",4768,"2_Cej0gyVhY","Family Central"],
    ["Dino King: Journey to Fire Mountain",5653,"1w0CUvjRAqc","Family Central"],
    ["The Terrible Adventure",5636,"8xaioT3zu_Q","Family Central"],
    ["Dreambuilders",4829,"sXuXuVoQrJ0","Shout! Studios"],
    ["Boonie Bears: The Big Shrink",5390,"3opY2JZUR8E","Family Central"],
    ["Abner the Invisible Dog",5363,"-iVnZI_q0Y4","Family Central"],
    ["Island of Lost Girls",6116,"vBM107TcfVU","Family Central"],
    ["Alone for Christmas",5369,"7t9Kr0Ji0Ew","Family Central"],
    ["Jungle Shuffle",4892,"JRkhO0l_5hk","Family Central"],
    ["Little Bite in the Big City",4453,"8X9hkxYZcb4","Family Central"],
    ["Skydog",6528,"MMKHRyb6PfI","Family Central"],
    ["Santa Claws",5188,"pwOPU84i538","Family Central"],
    ["Finding Normal",5349,"_I4IF_89eE0","Pinnacle Peak"],
    ["Hearts & Horses",3919,"hmpKtzVF4-E","EncourageTV"],
    ["Take Time to Dance",5701,"j3Sdr6Na0uY","Christian Movies"],
    ["My Private Line to God",4955,"eMuQb0_j7GY","EncourageTV"],
    ["The Ground Beneath Our Feet",5375,"tCEItdHHkws","EncourageTV"],
    ["Touched by Grace",5735,"5FFoURg1Y6o","Christian Movies"],
    ["Mum Said",5577,"O-9hwCESRAA","EncourageTV"],
    ["Courageous Love",6018,"t21hgLkHQH8","EncourageTV"],
    ["Forgiveness Girl",6661,"SMhZXMNPzD8","EncourageTV"],
    ["Miracle Mile",4954,"LUyJNh3_tv0","EncourageTV"],
    ["Hee Haw Farm",3949,"EwjctUn1Sas","EncourageTV"],
    ["Parents for Christmas",4600,"p7-MaSWDWn0","EncourageTV"],
    ["The Fix It Boys",4805,"JTdhu1fy500","EncourageTV Kids"],
    ["Meant to Be",5967,"KIAxYLg8rBo","Pinnacle Peak"],
    ["A Holiday Homecoming",5074,"-henyvmkaOI","Movie Central"],
    ["Tiger",5077,"gLgbxd2wCYY","Family Central"],
    ["A Family Lost",5252,"VRITJKBXABI","Movie Central"],
    ["A Doggone Adventure",5073,"KFTBJ1P6wzM","Movie Central"],
    ["A Gift Horse",4970,"AwyNQenGeBM","Movie Central"],
    ["Nessie and Me",5376,"NE98-Gsxa8s","Movie Central"],
    ["The Little Alien",4838,"e3EtgCCBjJ8","Shout! Studios"],
    ["A Monster in Paris",5392,"MdMhe5BEw_w","Shout! Studios"],
    ["Deep Sea",6744,"3-dwGGwoIcQ","Shout! Studios"],
    ["Snowtime!",4933,"zwdXNakjztU","Shout! Studios"],
    ["Maya the Bee 3: The Golden Orb",5297,"ZzVOrzxko6I","Shout! Studios"],
    ["A Plumm Summer",6134,"TZR9exgWiJQ","Shout! Studios"],
    ["Cats",5446,"QrnXZgFYMbk","Shout! Studios"],
    ["The Fairy Princess and the Unicorn",4833,"LlP7Zd0gBgI","Shout! Studios"],
    ["Asterix: The Mansion of the Gods",5123,"tgSOI0DwpoE","Shout! Studios"],
    ["Opal Dream",5127,"bwnXCtBHKmQ","Shout! Studios"],
    ["Spark: A Space Tail",5510,"h7Piwq21Yoc","Shout! Studios"],
    ["The Last Warrior",5628,"1y1B03RysOc","Shout! Studios"],
    ["A Piece of Cake",4684,"XaaUyj8QlgA","Shout! Studios"],
    ["Cinderella and the Secret Prince",5234,"LTsSLTL9U7k","Shout! Studios"],
    ["Postman Pat: The Movie",5243,"4pJKCjejgCs","Shout! Studios"],
    ["Kikoriki: Team Invincible",5470,"vZT3O3Gp7Mk","Shout! Studios"],
    ["Big Fish & Begonia",6321,"PfdB7CBqLtA","Shout! Studios"],
    ["Tito and the Birds",4413,"DJGggt11Ou0","Shout! Studios"],
    ["Asterix: The Secret of the Magic Potion",4890,"H57O9gyNrM0","Shout! Studios"],
    ["Mee-Shee: The Water Giant",5664,"jAYtNYu5pp4","FilmRise Movies"],
    ["Miracle at Sage Creek",5016,"gYp_hRYT7dw","FilmRise Movies"],
    ["A Christmas Karen",5877,"6nJ8n3MIiZY","FilmRise Movies"],
    ["The Book of Esther",5366,"YCdCul9v9IA","Pinnacle Peak"],
    ["Lucy Shimmers and the Prince of Peace",5251,"BhRNnsC0ugA","EncourageTV Kids"]
  ];

  const rows = current.concat(week);
  if (rows.length !== 84 || new Set(rows.map(row => row[2])).size !== 84) {
    throw new Error("HBO weekly catalog must contain 84 unique videos.");
  }

  window.HERMIT_CATALOG = rows.map(function (row, index) {
    return {
      id:"HBO-WEEK-" + String(index + 1).padStart(3,"0"),
      title:row[0],
      year:null,
      collection:"Family Feature",
      runtimeSeconds:row[1],
      videoId:row[2],
      source:row[3],
      networkChannel:"Hermit TV",
      contentClass:"Family",
      rating:"Family",
      cleared:true,
      posterUrl:""
    };
  });

  window.INFINITY_CHANNEL = {
    id:"HERMIT-TV",
    sourcePolicy:"Full-length ordinary uploads from family-focused distributors; no YouTube Movies DRM IDs and no R-rated rotation.",
    schedulePolicy:"A complete 84-slot week is loaded at once and cycles without a repeat until all 84 slots have aired."
  };

  window.HERMIT_COMMERCIALS = [
    {id:"AD-001",title:"Hermit TV intermission",durationSeconds:60,videoId:"",cleared:true},
    {id:"AD-002",title:"Tonight on Hermit TV",durationSeconds:60,videoId:"",cleared:true},
    {id:"AD-003",title:"Now showing",durationSeconds:60,videoId:"",cleared:true}
  ];
})();
