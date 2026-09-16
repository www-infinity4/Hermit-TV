(function(root){
  "use strict";

  const engine=root.HermitEngine;
  if(!engine||engine.__exactFillerPacking)return;

  const BLOCK_SECONDS=Math.max(60,Number(engine.BLOCK_SECONDS)||7200);
  const baseResolve=engine.resolve;

  function movieRuntimeSeconds(movie){
    return Math.max(60,Math.min(BLOCK_SECONDS,Math.floor(Number(movie&&movie.runtimeSeconds)||BLOCK_SECONDS)));
  }

  function eligibleFillers(){
    return (Array.isArray(root.HERMIT_FILLERS)?root.HERMIT_FILLERS:[])
      .filter(item=>item&&item.cleared&&item.sourceUrl&&Number(item.durationSeconds)>0)
      .map(item=>({...item,durationSeconds:Math.max(1,Math.floor(Number(item.durationSeconds)))}))
      .sort((a,b)=>b.durationSeconds-a.durationSeconds||String(a.id).localeCompare(String(b.id)));
  }

  function packGap(block,gapSeconds){
    const fillers=eligibleFillers();
    const packed=[];
    let remaining=Math.max(0,Math.floor(gapSeconds));
    const used=new Map();

    // Greedy largest-fit packing is deliberate here. With the starter library,
    // 16:43 becomes 5:08 + 5:08 + 5:08 + :25 + :25 + :25 = 16:39,
    // leaving only four seconds of dead air.
    while(remaining>0){
      let chosen=null;
      for(const filler of fillers){
        const count=used.get(filler.id)||0;
        const cap=Math.max(1,Math.floor(Number(filler.maxPerGap)||99));
        if(count>=cap||filler.durationSeconds>remaining)continue;
        chosen=filler;
        break;
      }
      if(!chosen)break;
      packed.push(chosen);
      used.set(chosen.id,(used.get(chosen.id)||0)+1);
      remaining-=chosen.durationSeconds;
      if(packed.length>120)break;
    }

    return{packed,remaining};
  }

  function createSegments(block){
    const runtime=movieRuntimeSeconds(block.movie);
    const segments=[];
    let stationStart=0;

    segments.push({
      kind:"movie",
      title:block.movie.title,
      videoId:block.movie.videoId||"",
      sourceUrl:block.movie.sourceUrl||"",
      sourceType:block.movie.sourceType||"youtube",
      cleared:!!block.movie.cleared,
      sourceStart:0,
      stationStart:0,
      duration:runtime
    });
    stationStart=runtime;

    const gap=Math.max(0,BLOCK_SECONDS-runtime);
    const plan=packGap(block,gap);
    for(const filler of plan.packed){
      segments.push({
        kind:"filler",
        title:filler.title||"Vintage intermission",
        fillerId:filler.id,
        sourceUrl:filler.sourceUrl,
        sourceType:filler.sourceType||"archive-mp4",
        sourcePage:filler.sourcePage||"",
        license:filler.license||"",
        videoId:"",
        cleared:true,
        sourceStart:0,
        stationStart,
        duration:filler.durationSeconds
      });
      stationStart+=filler.durationSeconds;
    }

    if(stationStart<BLOCK_SECONDS){
      segments.push({
        kind:"station",
        title:"Next movie starts on the two-hour mark",
        videoId:"",
        sourceUrl:"",
        sourceType:"station",
        cleared:true,
        sourceStart:0,
        stationStart,
        duration:BLOCK_SECONDS-stationStart
      });
    }

    return segments;
  }

  function resolve(nowMs,schedule){
    const block=schedule.find(item=>nowMs>=item.startsAtMs&&nowMs<item.endsAtMs)||schedule[schedule.length-1]||schedule[0];
    if(!block)return baseResolve(nowMs,schedule,[]);
    const blockElapsed=Math.max(0,Math.min(BLOCK_SECONDS-1,Math.floor((nowMs-block.startsAtMs)/1000)));
    const segments=createSegments(block);
    const segment=segments.find(item=>blockElapsed>=item.stationStart&&blockElapsed<item.stationStart+item.duration)||segments[segments.length-1];
    const segmentElapsed=Math.max(0,blockElapsed-segment.stationStart);
    return{
      block,segment,segmentElapsed,blockElapsed,
      mediaSeconds:segment.sourceStart+segmentElapsed,
      segmentRemaining:Math.max(0,segment.duration-segmentElapsed),
      movieReturnsIn:Math.max(0,BLOCK_SECONDS-blockElapsed),
      blockRemaining:Math.max(0,BLOCK_SECONDS-blockElapsed),
      fillerPlan:segments.filter(item=>item.kind==="filler")
    };
  }

  engine.createSegments=createSegments;
  engine.resolve=resolve;
  engine.__exactFillerPacking=true;
  engine.fillerPackingVersion="2026-09-16.1";
})(window);
