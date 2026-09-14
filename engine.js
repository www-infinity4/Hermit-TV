(function(root){
  "use strict";
  const TIME_ZONE=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Chicago";
  const BLOCK_SECONDS=7200;
  const MIN_MOVIE_SECONDS=3600;
  const SLOT_COUNT=12;
  const OFFSETS={"HERMIT-TV":0,"HERMIT TV":0,"STAR-LAUNCHER":1,"STAR LAUNCHER":1,"HBO":2,"CINEMAX":3,"SHOWTIME":4,"STARZ":5,"ENCORE":6,"TNT":7};

  function stationParts(date){const parts=new Intl.DateTimeFormat("en-US",{timeZone:TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date);return Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,Number(p.value)]));}
  function zonedToUtc(year,month,day,hour=0,minute=0,second=0){const target=Date.UTC(year,month-1,day,hour,minute,second);let guess=target;for(let i=0;i<4;i++){const p=stationParts(new Date(guess)),represented=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess+=target-represented;}return guess;}
  function dateKey(nowMs){const p=stationParts(new Date(nowMs));return`${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}`;}
  function mondayIndex(nowMs){const weekday=new Intl.DateTimeFormat("en-US",{timeZone:TIME_ZONE,weekday:"short"}).format(new Date(nowMs));return({Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6})[weekday]??0;}
  function hash(text){let value=2166136261;for(let i=0;i<String(text).length;i++)value=Math.imul(value^String(text).charCodeAt(i),16777619);return value>>>0;}
  function seededShuffle(items,seedText){if(root.InfinityChannelPolicy)return root.InfinityChannelPolicy.seededShuffle(items,seedText);const copy=items.slice();let seed=hash(seedText);const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  function movieRuntimeSeconds(movie){return Math.max(60,Math.floor(Number(movie&&movie.runtimeSeconds)||6000));}
  function eligibleMovies(catalog){const seen=new Set();return(Array.isArray(catalog)?catalog:[]).filter(movie=>{const runtime=Number(movie&&movie.runtimeSeconds),id=movie&&movie.videoId;if(!movie||!movie.cleared||!id||!Number.isFinite(runtime)||runtime<MIN_MOVIE_SECONDS||runtime>BLOCK_SECONDS||seen.has(id))return false;seen.add(id);return true;});}
  function channelKey(){return String((root.INFINITY_CHANNEL&&root.INFINITY_CHANNEL.id)||location.pathname.split("/").filter(Boolean)[0]||"MOVIE").toUpperCase();}
  function missingMovie(key,index){return{id:`MOVIE-FRESH-${key}-${index}`,title:"Fresh movie source needed",year:null,collection:"Repeat blocked by seven-day movie deck",runtimeSeconds:BLOCK_SECONDS,videoId:"",source:"Movie network inventory",cleared:false,refill:true,posterUrl:""};}

  function createDaySchedule(nowMs,catalog){
    const p=stationParts(new Date(nowMs)),midnightMs=zonedToUtc(p.year,p.month,p.day),todayKey=dateKey(nowMs),dayOfDeck=mondayIndex(nowMs),epochDay=Math.floor(midnightMs/86400000),weekNumber=Math.floor((epochDay-dayOfDeck)/7),eligible=eligibleMovies(catalog);
    if(!eligible.length)throw new Error("No verified feature-length movies fit the two-hour channel slot.");
    const base=eligible.slice().sort((a,b)=>String(a.videoId).localeCompare(String(b.videoId)));
    const fingerprint=base.map(movie=>movie.videoId).join("|");
    const cycle=seededShuffle(base,`infinity-movie-network-week-v4:${weekNumber}:${fingerprint}`);
    const key=channelKey(),offset=Object.prototype.hasOwnProperty.call(OFFSETS,key)?OFFSETS[key]:hash(key)%Math.max(1,Math.min(cycle.length,12));
    const rotated=cycle.slice(offset).concat(cycle.slice(0,offset));
    return Array.from({length:SLOT_COUNT},(_,index)=>{
      const deckIndex=dayOfDeck*SLOT_COUNT+index;
      const movie=rotated[deckIndex]||missingMovie(todayKey,index);
      const startsAtMs=midnightMs+index*BLOCK_SECONDS*1000;
      return{id:`${todayKey}-${String(index).padStart(2,"0")}`,movie,startsAtMs,endsAtMs:startsAtMs+BLOCK_SECONDS*1000,blockSeconds:BLOCK_SECONDS,fullStationSeconds:BLOCK_SECONDS};
    });
  }

  function playableAds(commercials){return(Array.isArray(commercials)?commercials:[]).filter(ad=>ad&&ad.cleared&&ad.videoId&&Number(ad.durationSeconds||0)>0);}
  function fallbackBreaks(block,runtime,count){const usableStart=900,usableEnd=Math.max(usableStart,runtime-900),span=Math.max(0,usableEnd-usableStart);if(count<1||span<600)return[];const seed=hash(`${channelKey()}:${block.id}`);return Array.from({length:count},(_,i)=>{const base=(i+1)/(count+1),jitter=((hash(`${seed}:${i}`)%181)-90);return Math.max(usableStart,Math.min(usableEnd,Math.round(usableStart+span*base+jitter)));}).sort((a,b)=>a-b);}
  function createSegments(block,commercials){
    const runtime=Math.min(BLOCK_SECONDS,movieRuntimeSeconds(block.movie));
    const ads=playableAds(commercials);
    let budget=Math.max(0,BLOCK_SECONDS-runtime),selectedAds=[];
    for(let i=0;i<ads.length&&selectedAds.length<2;i++){const ad=ads[i],duration=Math.min(90,Math.max(1,Math.floor(Number(ad.durationSeconds)||30)));if(duration<=budget){selectedAds.push({...ad,__duration:duration});budget-=duration;}}
    const requestedCount=selectedAds.length;
    const policy=root.InfinityChannelPolicy;
    const breaks=requestedCount?(policy?policy.staggeredBreaks({channelId:channelKey(),blockId:block.id,dateKey:String(block.id||"").slice(0,10),runtimeSeconds:runtime,blockSeconds:BLOCK_SECONDS,count:requestedCount,edgeSeconds:900}):fallbackBreaks(block,runtime,requestedCount)):[];
    const boundaries=[0,...breaks.filter(n=>n>0&&n<runtime),runtime],segments=[];let stationOffset=0,adIndex=0;
    function push(segment,requested){const remaining=BLOCK_SECONDS-stationOffset;if(remaining<=0)return false;const duration=Math.min(Math.max(1,Math.floor(requested)),remaining);segments.push({...segment,stationStart:stationOffset,duration});stationOffset+=duration;return duration===requested;}
    for(let i=0;i<boundaries.length-1;i++){const sourceStart=boundaries[i];if(!push({kind:"movie",title:block.movie.title,videoId:block.movie.videoId,cleared:!!block.movie.cleared,sourceStart},boundaries[i+1]-sourceStart))break;if(i<boundaries.length-2&&selectedAds.length){const ad=selectedAds[adIndex++%selectedAds.length];push({kind:"commercial",title:ad.title||"Station break",videoId:ad.videoId,cleared:true,sourceStart:0},ad.__duration);}}
    if(stationOffset<BLOCK_SECONDS)push({kind:"station",title:block.movie.refill?"Fresh movie source required":"Next movie starts at the next two-hour slot",videoId:"",cleared:true,sourceStart:0},BLOCK_SECONDS-stationOffset);
    return segments;
  }

  function resolve(nowMs,schedule,commercials){const block=schedule.find(item=>nowMs>=item.startsAtMs&&nowMs<item.endsAtMs)||schedule[schedule.length-1]||schedule[0],blockElapsed=Math.max(0,Math.min(BLOCK_SECONDS-1,Math.floor((nowMs-block.startsAtMs)/1000))),segments=createSegments(block,commercials),segment=segments.find(item=>blockElapsed>=item.stationStart&&blockElapsed<item.stationStart+item.duration)||segments[segments.length-1],segmentElapsed=Math.max(0,blockElapsed-segment.stationStart),segmentIndex=segments.indexOf(segment);let movieReturnsIn=segment.duration-segmentElapsed;for(let i=segmentIndex+1;segment.kind==="commercial"&&i<segments.length&&segments[i].kind==="commercial";i++)movieReturnsIn+=segments[i].duration;return{block,segment,segmentElapsed,blockElapsed,mediaSeconds:segment.sourceStart+segmentElapsed,segmentRemaining:Math.max(0,segment.duration-segmentElapsed),movieReturnsIn:Math.max(0,movieReturnsIn),blockRemaining:Math.max(0,BLOCK_SECONDS-blockElapsed)};}

  root.HermitEngine={version:"movie-network-v4",independentBreaks:true,TIME_ZONE,BLOCK_SECONDS,stationParts,zonedToUtc,dateKey,mondayIndex,stationDurationSeconds:()=>BLOCK_SECONDS,createDaySchedule,createSegments,resolve};
})(window);
