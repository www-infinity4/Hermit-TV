(function () {
  "use strict";

  const engine = window.HermitEngine;
  const catalog = window.HERMIT_CATALOG;
  const commercials = window.HERMIT_COMMERCIALS;
  const $ = id => document.getElementById(id);
  const els = {
    clock: $("stationClock"), mode: $("modeLabel"), title: $("nowTitle"), programTime: $("programTime"),
    enter: $("enterButton"), stationCard: $("stationCard"), cardLabel: $("stationCardLabel"),
    cardTitle: $("stationCardTitle"), cardCountdown: $("stationCardCountdown"), startOver: $("startOverButton"),
    rewind: $("rewindButton"), live: $("liveButton"), position: $("positionLabel"), remaining: $("remainingLabel"),
    progress: $("progressBar"), next: $("nextCards"), guide: $("guideRows"), guideDate: $("guideDate")
  };

  let player = null;
  let playerReady = false;
  let entered = false;
  let loadedKey = "";
  let loadedMovieVideoId = "";
  const failedMovieVideoIds = new Set();
  let scheduleKey = "";
  let schedule = [];
  let mode = "live";
  let timeShiftBaseMs = 0;
  let timeShiftStartedMs = 0;

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
    const mins = Math.max(0, Math.ceil(seconds / 60));
    return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins} min`;
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
    els.guideDate.textContent = new Intl.DateTimeFormat("en-US", {timeZone:engine.TIME_ZONE,weekday:"long",month:"long",day:"numeric"}).format(new Date(schedule[0].startsAtMs));
    els.guide.innerHTML = schedule.map(item => `<article class="guide-row" data-id="${item.id}"><time>${formatStationTime(item.startsAtMs)}</time><strong>${item.movie.title}</strong><span>${item.movie.year} · ${item.movie.collection}</span></article>`).join("");
  }

  function renderNext(currentBlock) {
    const currentIndex = schedule.findIndex(item => item.id === currentBlock.id);
    els.next.innerHTML = [1,2,3].map(step => {
      const item = schedule[(currentIndex + step) % schedule.length];
      const hue = movieHue(item.movie);
      const art = artForMovie(item.movie).replace(/"/g, "%22");
      return `<article class="next-card" style="--card-hue:${hue};--card-art:url('${art}')"><time>${formatStationTime(item.startsAtMs)}</time><div><h3>${item.movie.title}</h3><p>${item.movie.year} · ${item.movie.collection}</p></div></article>`;
    }).join("");
  }

  function showStationCard(state) {
    els.stationCard.hidden = false;
    if (state.segment.kind === "movie") {
      els.cardLabel.textContent = "SCHEDULED NOW";
      els.cardTitle.textContent = state.block.movie.title;
      els.cardCountdown.textContent = "Movie source not connected yet";
      return;
    }
    if (state.segment.kind === "commercial") {
      els.cardLabel.textContent = "COMMERCIAL BREAK";
      els.cardTitle.textContent = state.segment.title;
      els.cardCountdown.textContent = `${formatDuration(state.movieReturnsIn)} until the movie returns`;
      return;
    }
    els.cardLabel.textContent = "HERMIT TV";
    els.cardTitle.textContent = state.segment.title;
    els.cardCountdown.textContent = `${formatDuration(state.segmentRemaining)} until the next movie`;
  }

  function loadMedia(state) {
    if (!entered) return;
    const playable = state.segment.videoId && state.segment.cleared;
    const mediaKey = `${state.block.id}:${state.segment.stationStart}:${state.segment.videoId}`;
    if (!playable) {
      showStationCard(state);
      if (playerReady && loadedKey !== mediaKey) player.stopVideo();
      loadedKey = mediaKey;
      return;
    }
    els.stationCard.hidden = true;
    if (!playerReady) return;
    if (loadedKey !== mediaKey) {
      loadedKey = mediaKey;
      loadedMovieVideoId = state.segment.kind === "movie" ? state.segment.videoId : "";
      player.loadVideoById({videoId:state.segment.videoId,startSeconds:state.mediaSeconds});
      return;
    }
    if (mode === "live" && player.getPlayerState() === YT.PlayerState.PLAYING) {
      const drift = state.mediaSeconds - player.getCurrentTime();
      if (Math.abs(drift) > 2.5) player.seekTo(state.mediaSeconds, true);
    }
  }

  function tick() {
    const now = activeClockMs();
    ensureSchedule(now);
    const state = engine.resolve(now, schedule, commercials);
    const liveState = engine.resolve(Date.now(), engine.createDaySchedule(Date.now(), catalog), commercials);
    els.clock.textContent = `${formatStationTime(Date.now())} CT`;
    els.mode.textContent = mode === "live" ? (state.segment.kind === "commercial" ? "LIVE · COMMERCIAL BREAK" : "LIVE CHANNEL") : "TIME SHIFTED";
    els.title.textContent = state.block.movie.title;
    setProgramArt(state.block.movie);
    els.programTime.textContent = `${formatStationTime(state.block.startsAtMs)}–${formatStationTime(state.block.endsAtMs)}`;
    els.position.textContent = mode === "live" ? "Synced with every live viewer" : `${formatDuration(state.blockElapsed)} from start`;
    els.remaining.textContent = `${formatDuration(state.blockRemaining)} remaining in slot`;
    els.progress.style.width = `${Math.min(100,(state.blockElapsed/state.block.blockSeconds)*100)}%`;
    document.querySelectorAll(".guide-row").forEach(row => row.classList.toggle("current", row.dataset.id === state.block.id));
    renderNext(liveState.block);
    loadMedia(state);
  }

  function enterStation() {
    entered = true;
    els.enter.hidden = true;
    tick();
  }

  function startOver() {
    const liveSchedule = engine.createDaySchedule(Date.now(), catalog);
    const live = engine.resolve(Date.now(), liveSchedule, commercials);
    mode = "timeshift";
    timeShiftBaseMs = live.block.startsAtMs;
    timeShiftStartedMs = Date.now();
    loadedKey = "";
    tick();
  }

  function rewind() {
    const current = activeClockMs();
    mode = "timeshift";
    timeShiftBaseMs = current - 30000;
    timeShiftStartedMs = Date.now();
    loadedKey = "";
    tick();
  }

  function joinLive() {
    mode = "live";
    loadedKey = "";
    tick();
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", {
      width:"100%", height:"100%", playerVars:{playsinline:1,controls:1,enablejsapi:1,origin:location.origin},
      events:{
        onReady:() => { playerReady=true; tick(); },
        onError:() => {
          if (loadedMovieVideoId) failedMovieVideoIds.add(loadedMovieVideoId);
          scheduleKey = "";
          loadedKey = "";
          loadedMovieVideoId = "";
          setTimeout(tick, 250);
        }
      }
    });
  };

  els.enter.addEventListener("click", enterStation);
  els.startOver.addEventListener("click", startOver);
  els.rewind.addEventListener("click", rewind);
  els.live.addEventListener("click", joinLive);

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  ensureSchedule(Date.now());
  tick();
  setInterval(tick, 1000);
})();
