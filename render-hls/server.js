const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const HLS_DIR = '/tmp/hls';
const CHUNK_SIZE = 256 * 1024;

if (!fs.existsSync(HLS_DIR)) fs.mkdirSync(HLS_DIR, { recursive: true });

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  next();
});

const streams = {};

async function fetchAndPipe(url, writable, stopCheck) {
  const connect = async () => {
    while (true) {
      if (stopCheck()) { try { writable.end(); } catch(e) {} return; }
      try {
        const r = await fetch(url);
        if (stopCheck()) { try { writable.end(); } catch(e) {} return; }
        if (!r.ok) { await new Promise(r => setTimeout(r, 3000)); continue; }
        const reader = r.body.getReader();
        while (true) {
          if (stopCheck()) { reader.cancel(); try { writable.end(); } catch(e) {} return; }
          const { done, value } = await reader.read();
          if (done) break;
          const ok = writable.write(value);
          if (!ok) await new Promise(r => writable.once('drain', r));
        }
      } catch (e) {
        console.error('fetchAndPipe error:', e.message);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  };
  connect();
}

function getStream(channelId, url) {
  const existing = streams[channelId];
  if (existing && existing.url === url && existing.process.exitCode === null) {
    existing.lastAccess = Date.now();
    return existing;
  }
  if (existing) {
    existing.process.kill('SIGKILL');
    clearTimeout(existing.restartTimer);
    delete streams[channelId];
  }
  const outDir = path.join(HLS_DIR, channelId);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const segPattern = path.join(outDir, 'seg_%03d.ts');
  const playlistPath = path.join(outDir, 'playlist.m3u8');

  const ff = spawn('ffmpeg', [
    '-fflags', 'nobuffer',
    '-flags', 'low_delay',
    '-analyzeduration', '5000000',
    '-probesize', '5000000',
    '-i', 'pipe:0',
    '-c', 'copy',
    '-f', 'hls',
    '-hls_time', '4',
    '-hls_list_size', '10',
    '-hls_flags', 'delete_segments+split_by_time',
    '-hls_segment_filename', segPattern,
    playlistPath
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  const streamObj = { url, process: ff, outDir, segPattern, playlistPath, lastAccess: Date.now(), buf: '', restartTimer: null };
  streams[channelId] = streamObj;

  ff.stdin.on('error', () => {}); // ignore EPIPE after kill
  fetchAndPipe(url, ff.stdin, () => streams[channelId] !== streamObj);

  ff.stderr.on('data', d => {
    streamObj.buf += d.toString();
    if (streamObj.buf.length > 10000) streamObj.buf = streamObj.buf.slice(-5000);
  });

  const restart = () => {
    if (streams[channelId] !== streamObj) return;
    streamObj.restartTimer = setTimeout(() => {
      console.log(`Restarting FFmpeg for ${channelId}`);
      getStream(channelId, url);
    }, 2000);
  };

  ff.on('exit', (code) => {
    console.log(`FFmpeg ${channelId} exited with code ${code}`);
    restart();
  });
  ff.on('error', (err) => {
    console.error(`FFmpeg ${channelId} error:`, err.message);
    restart();
  });

  return streamObj;
}

async function waitForPlaylist(playlistPath, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (fs.statSync(playlistPath).size > 0) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

app.get('/hls/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url query parameter');

  const stream = getStream(channelId, url);
  const exists = await waitForPlaylist(stream.playlistPath);

  if (!exists) {
    const stderr = stream.buf || 'no stderr captured';
    return res.status(504).send('FFmpeg failed to produce playlist.\n' + stderr);
  }

  try {
    let content = fs.readFileSync(stream.playlistPath, 'utf8');
    content = content.replace(/seg_(\d+)\.ts/g, `/hls/${channelId}/seg_$1.ts`);
    content = content.replace(/#EXT-X-VERSION:\d+/, '#EXT-X-VERSION:3');
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.set('Cache-Control', 'no-cache');
    res.send(content);
  } catch (e) {
    res.status(500).send('Playlist error: ' + e.message);
  }
});

app.get('/hls/:channelId/:segment', (req, res) => {
  const segPath = path.join(HLS_DIR, req.params.channelId, req.params.segment);
  const safe = path.normalize(segPath).startsWith(path.normalize(HLS_DIR));
  if (!safe) return res.status(403).send('Forbidden');
  res.set('Cache-Control', 'public, max-age=30');
  res.sendFile(segPath, err => {
    if (err) res.status(404).send('Segment not found');
  });
});

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send('Upstream error');
    res.set('Content-Type', r.headers.get('content-type') || 'video/mp2t');
    res.set('Cache-Control', 'no-cache');
    const reader = r.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(value);
      }
    };
    pump();
  } catch (e) {
    res.status(502).send('Proxy error: ' + e.message);
  }
});

app.get('/health', (req, res) => res.send('OK'));

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of Object.entries(streams)) {
    if (now - s.lastAccess > 60000) {
      try { s.process.kill('SIGKILL'); } catch (e) {}
      delete streams[id];
      fs.rmSync(s.outDir, { recursive: true, force: true });
    }
  }
}, 30000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('HLS server running on port', PORT));
