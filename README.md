# Hermit TV

Hermit TV is a synchronized, single-channel movie website. Every viewer in Live mode sees the program or commercial assigned to the current Central Time broadcast moment. Viewers can start over or rewind into a personal time-shifted showing, then use Join live to return to the shared channel.

## Current foundation

- free full-length YouTube movie rotation from established film channels
- deterministic 24-hour guide regenerated from the station date
- twelve two-hour movie slots per day
- three synchronized three-minute commercial breaks within each slot, with three one-minute spots per break
- synchronized movie return after every break
- Start over, Rewind 30 sec and Join live controls
- responsive theater interface for phones and desktops
- saturated movie-specific color backgrounds with poster and YouTube-thumbnail support
- Open Graph and X large-image sharing metadata
- YouTube IFrame Player API integration
- scheduler excludes every entry without a usable YouTube video ID

## Add approved sources

Edit `data/catalog.js`. A movie becomes playable only when it has both a YouTube `videoId` and `cleared: true`. The original commercial-release wish list was replaced because those full movies were not available as free authorized embeds.

```js
{
  title: "A free full movie",
  videoId: "AUTHORIZED_VIDEO_ID",
  cleared: true
}
```

Commercial sources are in `HERMIT_COMMERCIALS` in the same file. Blank commercial IDs intentionally display a synchronized Hermit TV station card instead of failing playback.

An approved movie background can be placed in `posterUrl`. If that field is blank and a YouTube video ID exists, Hermit TV uses the YouTube thumbnail. Otherwise it uses the original Hermit TV theater artwork and a color generated from the movie title.

## Broadcast clock

The engine uses `America/Chicago`. Each client derives the same active block and segment from the current absolute timestamp. Movie segments carry a source offset, so returning from a commercial resumes the movie at the correct point instead of advancing it during the break.

The daily order is deterministic: everyone receives the same lineup for a given date without a server. A later scheduled job can write editorially approved daily lineups without changing the player contract.

## Rights and embedding

Only connect uploads supplied by a rightsholder or authorized distributor and permitted for embedding. The player keeps YouTube controls visible and does not cover them with interface elements.
