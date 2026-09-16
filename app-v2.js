(function () {
  "use strict";

  const engine = window.HermitEngine;
  const catalog = Array.isArray(window.HERMIT_CATALOG) ? window.HERMIT_CATALOG : [];
  const $ = id => document.getElementById(id);
  const els = {
    clock: $("stationClock"), mode: $("modeLabel"), title: $("nowTitle"), programTime: $("programTime"),
    enter: $("enterButton"), stationCard: $("stationCard"), cardLabel: $("stationCardLabel"),
    cardTitle: $("stationCardTitle"), cardCountdown: $("stationCardCountdown"), startOver: $("startOverButton"),
    rewind: $("rewindButton"), live: $("liveButton"), position: $("positionLabel"), remaining: $("remainingLabel"),
    progress: $("progressBar"), next: $("nextCards"), guide: $("guideRows"), guideDate: $("guideDate"), share: $("shareButton"), shareStatus: $("shareStatus")
  };

  let player = null;
  let playerReady = false;
  let apiRequested = false;
  let entered = false;
  let loadedKey = "";
  let loadedMovieVideoId = "";
  const failedMovieVideoIds = new Set();
  let scheduleKey = "";
  let schedule = [];
  let mode = "live";
  let timeShiftBaseMs = 0;
  let timeShiftStartedMs = 0;
  let currentDirectUrl = "";

  const directPlayer = document.createElement("video");
  directPlayer.id = "archiveFillerPlayer";
  directPlayer.playsInline = true;
  directPlayer.controls = true;
  directPlayer.preload = "auto";
  directPlayer.hidden = true;
  Object.assign(directPlayer.style, {
    position:"absolute", inset:"0", width:"100%", height:"100%",
    objectFit:"contain", background:"#000", zIndex:"2"
  });
  document.querySelector(".screen-shell")?.appendChild(directPlayer);

  function activeClockMs() {
    return mode === "live" ? Date.now() : timeShiftBaseMs + (Date.now() - timeShiftStartedMs);
  }

  function ensureSchedule(nowMs) {
    const key = engine.dateKey(nowMs);
    if (key !== scheduleKey) {
      scheduleKey = key;
      const availableCatalog = catalog.filter(movie => !failedMovieVideoIds.has(movie.videoId));
      schedule = engine.createDaySchedule(nowMs, availableCatalog);
      renderGuide();
    }
  }

  function formatStationTime(ms) {
    return new Intl.DateTimeFormat("en-US", {timeZone:engine.TIME_ZONE,hour:"numeric",minute:"2-digit"}).format(new Date(ms));
  }

  function formatDuration(seconds) {
    const value=Math.max(0,Math.floor(Number(seconds)||0));
    const h=Math.floor(value/3600),m=Math.floor((value%3600)/60),s=value%60;
    if(h)return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function movieHue(movie) {
    let hash = 0;
    for (const char of movie.title) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    return Math.abs(hash) % 360;
  }

  function artForMovie(movie) {
    if (movie.posterUrl) return movie.posterUrl;
    if (movie.videoId) return `https://i.ytimg.com/vi/${movie.videoId}/maxresdefault.jpg`;
    return "assets/hermit-tv-preview.jpg";
  }

  function setProgramArt(movie) {
    document.body.style.setProperty("--program-hue", movieHue(movie));
    document.body.style.setProperty("--program-art", `url("${artForMovie(movie)}")`);
  }

  function renderGuide() {
    if(!schedule.length)return;
    els.guideDate.textContent = new Intl.DateTimeFormat("en-US", {timeZone:engine.TIME_ZONE,weekday:"long",month:"long",day:"numeric"}).format(new Date(schedule[0].startsAtMs));
    els.guide.innerHTML = schedule.map(item => `<article class="guide-row" data-id="${item.id}"><time>${formatStationTime(item.startsAtMs)}</time><strong>${item.movie.title}</strong><span>${item.movie.year} · ${item.movie.collection}</span></article>`).join("");
  }

  let renderedNextBlockKey = "";
  function renderNext(currentBlock) {
    const nextBlockKey = currentBlock ? String(currentBlock.id || currentBlock.startsAtMs || "") + ":" + String((currentBlock.movie && currentBlock.movie.videoId) || "") : "";
    if (nextBlockKey && nextBlockKey === renderedNextBlockKey) return;
    renderedNextBlockKey = nextBlockKey;
    const currentIndex = schedule.findIndex(item => item.id === currentBlock.id);
    els.next.innerHTML = [1,2,3].map(step => {
      const item = schedule[(currentIndex + step) % schedule.length];
      const hue = movieHue(item.movie);
      const art = artForMovie(item.movie).replace(/"/g, "%22");
      return `<article class="next-card" style="--card-hue:${hue};--card-art:url('${art}')"><time>${formatStationTime(item.startsAtMs)}</time><div><h3>${item.movie.title}</h3><p>${item.movie.year} · ${item.movie.collection}</p></div></article>`;
    }).join("");
  }

  function youtubeFrame(){
    try{return player&&typeof player.getIframe==="function"?player.getIframe():document.getElementById("player");}catch(_){return document.getElementById("player");}
  }

  function showYoutube(){
    directPlayer.pause();
    directPlayer.hidden=true;
    const frame=youtubeFrame();if(frame)frame.hidden=false;
  }

  function showDirect(){
    const frame=youtubeFrame();if(frame)frame.hidden=true;
    els.stationCard.hidden=true;
    directPlayer.hidden=false;
  }

  function stopAllMedia(){
    directPlayer.pause();directPlayer.hidden=true;
    if(player&&playerReady&&typeof player.stopVideo==="function")try{player.stopVideo();}catch(_){}
  }

  function showStationCard(state) {
    stopAllMedia();
    els.stationCard.hidden = false;
    els.cardLabel.textContent = "HERMIT TV";
    els.cardTitle.textContent = state.segment.title || "Next movie starts on schedule";
    els.cardCountdown.textContent = `${formatDuration(state.segmentRemaining)} until the next movie`;
  }

  function loadDirect(state,mediaKey){
    showDirect();
    const url=state.segment.sourceUrl;
    const target=Math.max(0,Number(state.mediaSeconds)||0);
    if(currentDirectUrl!==url){
      currentDirectUrl=url;
      directPlayer.src=url;
      directPlayer.load();
      directPlayer.addEventListener("loadedmetadata",()=>{
        try{directPlayer.currentTime=Math.min(target,Math.max(0,(directPlayer.duration||target)-.05));}catch(_){}
        directPlayer.play().catch(()=>{});
      },{once:true});
      loadedKey=mediaKey;
      return;
    }
    if(loadedKey!==mediaKey){
      loadedKey=mediaKey;
      try{directPlayer.currentTime=target;}catch(_){}
      directPlayer.play().catch(()=>{});
      return;
    }
    if(mode==="live"&&!directPlayer.paused&&Number.isFinite(directPlayer.currentTime)){
      const drift=target-directPlayer.currentTime;
      if(Math.abs(drift)>1.5)try{directPlayer.currentTime=target;}catch(_){}
    }
  }

  function learnYoutubeRuntime(state){
    if(!playerReady||state.segment.kind!=="movie"||!player||typeof player.getDuration!=="function")return;
    const duration=Math.floor(Number(player.getDuration())||0);
    if(duration<600||duration>engine.BLOCK_SECONDS)return;
    const movie=state.block.movie;
    if(!movie||movie.videoId!==loadedMovieVideoId)return;
    if(Math.abs((Number(movie.runtimeSeconds)||0)-duration)>1){
      movie.runtimeSeconds=duration;
      try{localStorage.setItem(`hermit_runtime:${movie.videoId}`,String(duration));}catch(_){}
    }
  }

  function restoreLearnedRuntimes(){
    catalog.forEach(movie=>{
      try{
        const learned=Number(localStorage.getItem(`hermit_runtime:${movie.videoId}`)||0);
        if(learned>=600&&learned<=engine.BLOCK_SECONDS)movie.runtimeSeconds=Math.floor(learned);
      }catch(_){}
    });
  }

  function loadMedia(state) {
    if (!entered) return;
    const direct=!!state.segment.sourceUrl;
    const youtube=!!state.segment.videoId;
    const playable=state.segment.cleared&&(direct||youtube);
    const mediaKey = `${state.block.id}:${state.segment.stationStart}:${state.segment.sourceUrl||state.segment.videoId||"station"}`;

    if (!playable) {
      showStationCard(state);
      loadedKey = mediaKey;
      return;
    }

    if(direct){loadDirect(state,mediaKey);return;}

    showYoutube();
    els.stationCard.hidden = true;
    if (!playerReady) {loadYouTubeApi();return;}
    if (loadedKey !== mediaKey) {
      loadedKey = mediaKey;
      loadedMovieVideoId = state.segment.kind === "movie" ? state.segment.videoId : "";
      player.loadVideoById({videoId:state.segment.videoId,startSeconds:state.mediaSeconds});
      return;
    }
    learnYoutubeRuntime(state);
    if (mode === "live" && player.getPlayerState() === YT.PlayerState.PLAYING) {
      const drift = state.mediaSeconds - player.getCurrentTime();
      if (Math.abs(drift) > 2.5) player.seekTo(state.mediaSeconds, true);
    }
  }

  function tick() {
    const now = activeClockMs();
    ensureSchedule(now);
    const state = engine.resolve(now, schedule, []);
    const liveSchedule=engine.createDaySchedule(Date.now(),catalog);
    const liveState = engine.resolve(Date.now(),liveSchedule,[]);
    els.clock.textContent = `${formatStationTime(Date.now())} local`;
    const isFiller=state.segment.kind==="filler";
    els.mode.textContent = mode === "live" ? (isFiller ? "LIVE · VINTAGE INTERMISSION" : "LIVE CHANNEL") : "TIME SHIFTED";
    els.title.textContent = isFiller ? state.segment.title : state.block.movie.title;
    setProgramArt(state.block.movie);
    els.programTime.textContent = `${formatStationTime(state.block.startsAtMs)}–${formatStationTime(state.block.endsAtMs)}`;
    els.position.textContent = mode !== "live"
      ? `${formatDuration(state.blockElapsed)} from slot start`
      : isFiller
        ? `Filler ${formatDuration(state.segmentElapsed)} / ${formatDuration(state.segment.duration)}`
        : state.segment.kind==="station" ? "Brief dead air before the next movie" : "Synced with every live viewer";
    els.remaining.textContent = isFiller
      ? `${formatDuration(state.blockRemaining)} until next movie`
      : `${formatDuration(state.blockRemaining)} remaining in slot`;
    els.progress.style.width = `${Math.min(100,(state.blockElapsed/state.block.blockSeconds)*100)}%`;
    document.querySelectorAll(".guide-row").forEach(row => row.classList.toggle("current", row.dataset.id === state.block.id));
    renderNext(liveState.block);
    loadMedia(state);
  }

  function enterStation() {
    entered = true;
    els.enter.hidden = true;
    loadYouTubeApi();
    tick();
  }

  function loadYouTubeApi() {
    if (apiRequested || playerReady) return;
    apiRequested = true;
    if (window.YT && window.YT.Player) {window.onYouTubeIframeAPIReady();return;}
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(tag);
  }

  function startOver() {
    const liveSchedule = engine.createDaySchedule(Date.now(), catalog);
    const live = engine.resolve(Date.now(), liveSchedule, []);
    mode = "timeshift";
    timeShiftBaseMs = live.block.startsAtMs;
    timeShiftStartedMs = Date.now();
    loadedKey = "";
    tick();
  }

  function rewind() {
    mode = "timeshift";
    timeShiftBaseMs = activeClockMs() - 30000;
    timeShiftStartedMs = Date.now();
    loadedKey = "";
    tick();
  }

  function joinLive() {mode="live";loadedKey="";tick();}

  function localShareCredit(reference) {
    if(window.ControlPhi&&typeof window.ControlPhi.ensureShareCredit==="function"){
      try{const result=window.ControlPhi.ensureShareCredit(reference,"web_share_api");if(result)return result;}catch(_){}
    }
    return{awarded:0,progressToNextCoin:0,balance:0};
  }

  async function shareChannel() {
    const title = els.title.textContent && !els.title.textContent.includes("Loading") ? els.title.textContent : document.title;
    const share = { title:`${title} · ${document.title}`, text:`Watch ${title} live on ${document.title}.`, url:location.href };
    if (!navigator.share) {
      try {await navigator.clipboard.writeText(share.url);els.shareStatus.textContent="Link copied. Open Android Share to earn 1/10 StarCoin.";}
      catch (_) {els.shareStatus.textContent="Sharing is unavailable in this browser.";}
      return;
    }
    try {
      await navigator.share(share);
      const result = localShareCredit(share.url);
      els.shareStatus.textContent = result.awarded ? "Shared · 1 StarCoin completed!" : `Shared · StarCoin progress ${result.progressToNextCoin||0}/10`;
    } catch (error) {
      if (!error || error.name !== "AbortError") els.shareStatus.textContent = "Share did not complete.";
    }
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", {
      width:"100%", height:"100%", playerVars:{playsinline:1,controls:1,enablejsapi:1,origin:location.origin,widget_referrer:location.href},
      events:{
        onReady:() => {playerReady=true;player.unMute();player.setVolume(100);tick();},
        onStateChange:event=>{
          if(event.data===YT.PlayerState.PLAYING||event.data===YT.PlayerState.ENDED){
            try{const state=engine.resolve(activeClockMs(),schedule,[]);learnYoutubeRuntime(state);}catch(_){}
            if(event.data===YT.PlayerState.ENDED)setTimeout(tick,0);
          }
        },
        onError:() => {
          if (loadedMovieVideoId) failedMovieVideoIds.add(loadedMovieVideoId);
          scheduleKey = "";loadedKey = "";loadedMovieVideoId = "";
          setTimeout(tick, 250);
        }
      }
    });
  };

  directPlayer.addEventListener("ended",()=>setTimeout(tick,0));
  els.enter.addEventListener("click", enterStation);
  els.startOver.addEventListener("click", startOver);
  els.rewind.addEventListener("click", rewind);
  els.live.addEventListener("click", joinLive);
  els.share.addEventListener("click", shareChannel);

  restoreLearnedRuntimes();
  ensureSchedule(Date.now());
  tick();
  setInterval(tick, 1000);
})();
