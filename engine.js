(function (root) {
  "use strict";

  const TIME_ZONE = "America/Chicago";
  const BLOCK_SECONDS = 7200;
  const BREAK_AFTER_CONTENT_SECONDS = [1500, 3000, 4500];

  function stationParts(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
  }

  function zonedToUtc(year, month, day, hour = 0, minute = 0, second = 0) {
    const target = Date.UTC(year, month - 1, day, hour, minute, second);
    let guess = target;
    for (let i = 0; i < 4; i++) {
      const p = stationParts(new Date(guess));
      const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      guess += target - represented;
    }
    return guess;
  }

  function dateKey(nowMs) {
    const p = stationParts(new Date(nowMs));
    return `${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}`;
  }

  function hash(text) {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
    return value >>> 0;
  }

  function seededShuffle(items, seedText) {
    const copy = items.slice();
    let seed = hash(seedText);
    const random = () => {
      seed += 0x6D2B79F5;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function createDaySchedule(nowMs, catalog) {
    const p = stationParts(new Date(nowMs));
    const midnightMs = zonedToUtc(p.year, p.month, p.day);
    const featured = seededShuffle(catalog, dateKey(nowMs)).slice(0, 12);
    return featured.map((movie, index) => ({
      id: `${dateKey(nowMs)}-${String(index).padStart(2,"0")}`,
      movie,
      startsAtMs: midnightMs + index * BLOCK_SECONDS * 1000,
      endsAtMs: midnightMs + (index + 1) * BLOCK_SECONDS * 1000,
      blockSeconds: BLOCK_SECONDS
    }));
  }

  function createSegments(block, commercials) {
    const runtime = Math.min(block.movie.runtimeSeconds || 6000, BLOCK_SECONDS - 540);
    const boundaries = [0, ...BREAK_AFTER_CONTENT_SECONDS.filter(n => n < runtime), runtime];
    const segments = [];
    let stationOffset = 0;
    let adIndex = 0;
    for (let i = 0; i < boundaries.length - 1; i++) {
      const sourceStart = boundaries[i];
      const duration = boundaries[i + 1] - sourceStart;
      segments.push({kind:"movie", title:block.movie.title, videoId:block.movie.videoId, cleared:block.movie.cleared, sourceStart, stationStart:stationOffset, duration});
      stationOffset += duration;
      if (i < boundaries.length - 2) {
        const ad = commercials[adIndex++ % commercials.length];
        segments.push({kind:"commercial", title:ad.title, videoId:ad.videoId, cleared:ad.cleared, sourceStart:0, stationStart:stationOffset, duration:180});
        stationOffset += 180;
      }
    }
    if (stationOffset < BLOCK_SECONDS) {
      segments.push({kind:"station", title:"Coming up next", videoId:"", cleared:true, sourceStart:0, stationStart:stationOffset, duration:BLOCK_SECONDS-stationOffset});
    }
    return segments;
  }

  function resolve(nowMs, schedule, commercials) {
    const block = schedule.find(item => nowMs >= item.startsAtMs && nowMs < item.endsAtMs) || schedule[0];
    const blockElapsed = Math.max(0, Math.floor((nowMs - block.startsAtMs) / 1000));
    const segments = createSegments(block, commercials);
    const segment = segments.find(item => blockElapsed >= item.stationStart && blockElapsed < item.stationStart + item.duration) || segments[segments.length - 1];
    const segmentElapsed = Math.max(0, blockElapsed - segment.stationStart);
    return {
      block, segment, segmentElapsed, blockElapsed,
      mediaSeconds: segment.sourceStart + segmentElapsed,
      segmentRemaining: Math.max(0, segment.duration - segmentElapsed),
      blockRemaining: Math.max(0, block.blockSeconds - blockElapsed)
    };
  }

  root.HermitEngine = { TIME_ZONE, BLOCK_SECONDS, stationParts, zonedToUtc, dateKey, createDaySchedule, createSegments, resolve };
})(window);
