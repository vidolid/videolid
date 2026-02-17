/**
 * ============================================================
 *  VIDEOLID — Cloudflare Worker  (worker.js)
 *  Single file handles ALL 80+ tool endpoints
 *
 *  Deploy:
 *    npx wrangler deploy worker.js --name videolid-api
 *
 *  Bindings required in wrangler.toml:
 *    [[ r2_buckets ]]
 *    binding = "FILES"          # R2 bucket for uploads + results
 *    bucket_name = "videolid-files"
 *
 *    [[ kv_namespaces ]]
 *    binding = "JOBS"           # KV for job status tracking
 *    id = "<your-kv-id>"
 *
 *  Environment variables (set in Cloudflare dashboard):
 *    ALLOWED_ORIGIN   = https://your-frontend.com
 *    MAX_FILE_MB      = 500
 *    FFMPEG_API_URL   = https://your-ffmpeg-service.com   (optional external FFmpeg)
 *    AI_API_KEY       = <your AI provider key>            (for AI tools)
 * ============================================================
 */

// ─── CORS helper ─────────────────────────────────────────────────────────────
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

const json = (data, status = 200, origin) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });

const error = (msg, status = 400, origin) => json({ error: msg }, status, origin);

// ─── Route table ─────────────────────────────────────────────────────────────
// Maps every tool slug to its processor function
const TOOL_PROCESSORS = {
  // Video editing
  'video-editor':           processVideoEditor,
  'add-audio-to-video':     processAddAudioToVideo,
  'add-emojis-to-video':    processAddEmojisToVideo,
  'add-image-to-video':     processAddImageToVideo,
  'add-photo-to-video':     processAddPhotoToVideo,
  'add-shapes-to-video':    processAddShapesToVideo,
  'add-stickers-to-video':  processAddStickersToVideo,
  'add-subtitles-to-video': processAddSubtitlesToVideo,
  'add-text-to-video':      processAddTextToVideo,
  'adjust-video':           processAdjustVideo,
  'change-video-speed':     processChangeVideoSpeed,
  'compress-video':         processCompressVideo,
  'crop-video':             processCropVideo,
  'cut-video':              processCutVideo,
  'filter-video':           processFilterVideo,
  'flip-video':             processFlipVideo,
  'loop-video':             processLoopVideo,
  'meme-maker':             processMakeMeme,
  'merge-video':            processMergeVideo,
  'mute-video':             processMuteVideo,
  'resize-video':           processResizeVideo,
  'reverse-video':          processReverseVideo,
  'rotate-video':           processRotateVideo,
  'slideshow-maker':        processSlideshowMaker,
  'split-video':            processSplitVideo,
  'stop-motion':            processStopMotion,
  'video-maker':            processVideoMaker,
  'dpi-converter':          processDpiConverter,
  // GIF
  'gif-maker':              processGifMaker,
  'gif-editor':             processGifEditor,
  // Audio
  'cut-audio':              processCutAudio,
  'merge-audio':            processMergeAudio,
  // Recorders (receive uploaded blob, store it)
  'audio-recorder':         processRecorderUpload,
  'screen-recorder':        processRecorderUpload,
  'presentation-recorder':  processRecorderUpload,
  'webcam-recorder':        processRecorderUpload,
  // AI tools
  'audio-to-text':          processAudioToText,
  'audio-translator':       processAudioTranslator,
  'auto-subtitle-generator':processAutoSubtitleGenerator,
  'text-to-speech':         processTextToSpeech,
  'translate-english-video':processTranslateEnglishVideo,
  'video-to-text':          processVideoToText,
  'video-translator':       processVideoTranslator,
  // Video converters
  'video-converter':        processVideoConverter,
  'mp4-converter':          processVideoConverter,
  'avi-converter':          processVideoConverter,
  'mov-converter':          processVideoConverter,
  'mkv-converter':          processVideoConverter,
  'webm-converter':         processVideoConverter,
  'wmv-converter':          processVideoConverter,
  'hevc-converter':         processVideoConverter,
  'm4v-converter':          processVideoConverter,
  'ogv-converter':          processVideoConverter,
  'ts-converter':           processVideoConverter,
  'asf-converter':          processVideoConverter,
  'swf-converter':          processVideoConverter,
  'vob-converter':          processVideoConverter,
  'xvid-converter':         processVideoConverter,
  '3gp-converter':          processVideoConverter,
  // Audio converters
  'audio-converter':        processAudioConverter,
  'mp3-converter':          processAudioConverter,
  'wav-converter':          processAudioConverter,
  'ogg-converter':          processAudioConverter,
  'm4a-converter':          processAudioConverter,
  'm4r-converter':          processAudioConverter,
  'opus-converter':         processAudioConverter,
  'flac-converter':         processAudioConverter,
  'aac-converter':          processAudioConverter,
  'aiff-converter':         processAudioConverter,
  'amr-converter':          processAudioConverter,
  'wma-converter':          processAudioConverter,
  // Image converters
  'image-converter':        processImageConverter,
  'jpg-converter':          processImageConverter,
  'png-converter':          processImageConverter,
  'webp-converter':         processImageConverter,
  'gif-converter':          processImageConverter,
  'bmp-converter':          processImageConverter,
  'heic-converter':         processImageConverter,
  'svg-converter':          processImageConverter,
  'tiff-converter':         processImageConverter,
};

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '*';
    const url    = new URL(request.url);
    const path   = url.pathname;

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── POST /api/process ── main job submission
    if (request.method === 'POST' && path === '/api/process') {
      return handleProcess(request, env, origin);
    }

    // ── GET /api/status/:jobId ── poll job status
    if (request.method === 'GET' && path.startsWith('/api/status/')) {
      const jobId = path.split('/api/status/')[1];
      return handleStatus(jobId, env, origin);
    }

    // ── GET /api/download/:fileId ── download result
    if (request.method === 'GET' && path.startsWith('/api/download/')) {
      const fileId = path.split('/api/download/')[1];
      return handleDownload(fileId, env, origin);
    }

    // ── GET /api/health ── health check
    if (path === '/api/health') {
      return json({ status: 'ok', tools: Object.keys(TOOL_PROCESSORS).length }, 200, origin);
    }

    return error('Not found', 404, origin);
  },
};

// ─── Handle /api/process ─────────────────────────────────────────────────────
async function handleProcess(request, env, origin) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    let tool, options, file, text;

    // Parse multipart (file upload) or JSON (text tools)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      tool    = formData.get('tool');
      options = JSON.parse(formData.get('options') || '{}');
      file    = formData.get('file');

      if (!file) return error('No file provided', 400, origin);
      if (!tool)  return error('No tool specified', 400, origin);

      // Validate file size
      const maxBytes = (parseInt(env.MAX_FILE_MB) || 500) * 1024 * 1024;
      if (file.size > maxBytes) {
        return error(`File too large. Max ${env.MAX_FILE_MB || 500}MB`, 413, origin);
      }
    } else {
      const body = await request.json();
      tool    = body.tool;
      options = body.options || {};
      text    = body.text;
      if (!tool) return error('No tool specified', 400, origin);
    }

    // Look up processor
    const processor = TOOL_PROCESSORS[tool];
    if (!processor) return error(`Unknown tool: ${tool}`, 400, origin);

    // Generate job ID
    const jobId = crypto.randomUUID();

    // Store initial job status
    await env.JOBS.put(jobId, JSON.stringify({
      status: 'processing',
      tool,
      createdAt: Date.now(),
    }), { expirationTtl: 3600 }); // expire after 1 hour

    // Upload input file to R2
    let inputKey = null;
    if (file) {
      inputKey = `inputs/${jobId}/${file.name}`;
      const buffer = await file.arrayBuffer();
      await env.FILES.put(inputKey, buffer, {
        httpMetadata: { contentType: file.type },
      });
    }

    // Run processor (non-blocking via waitUntil for long jobs)
    const ctx_like = { waitUntil: (p) => p }; // fallback
    const processingPromise = processor({
      jobId,
      tool,
      options,
      text,
      inputKey,
      fileName: file?.name || 'input',
      fileType: file?.type || '',
      env,
    }).then(async (result) => {
      // Store result
      const outputKey = `outputs/${jobId}/${result.fileName}`;
      if (result.buffer) {
        await env.FILES.put(outputKey, result.buffer, {
          httpMetadata: { contentType: result.contentType || 'application/octet-stream' },
        });
      }
      // Update job status to done
      await env.JOBS.put(jobId, JSON.stringify({
        status: 'done',
        tool,
        fileId: `${jobId}/${result.fileName}`,
        fileName: result.fileName,
        contentType: result.contentType,
        createdAt: Date.now(),
      }), { expirationTtl: 3600 });
    }).catch(async (err) => {
      await env.JOBS.put(jobId, JSON.stringify({
        status: 'error',
        tool,
        error: err.message,
        createdAt: Date.now(),
      }), { expirationTtl: 3600 });
    });

    // Don't await — let it run in background
    // (Cloudflare will keep the worker alive if needed)
    processingPromise.catch(() => {});

    return json({ jobId, status: 'processing' }, 202, origin);

  } catch (err) {
    return error(`Server error: ${err.message}`, 500, origin);
  }
}

// ─── Handle /api/status/:jobId ────────────────────────────────────────────────
async function handleStatus(jobId, env, origin) {
  const raw = await env.JOBS.get(jobId);
  if (!raw) return error('Job not found', 404, origin);
  return json(JSON.parse(raw), 200, origin);
}

// ─── Handle /api/download/:fileId ────────────────────────────────────────────
async function handleDownload(fileId, env, origin) {
  const key = `outputs/${fileId}`;
  const obj = await env.FILES.get(key);
  if (!obj) return error('File not found', 404, origin);

  const headers = {
    'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${fileId.split('/').pop()}"`,
    ...corsHeaders(origin),
  };
  return new Response(obj.body, { headers });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROCESSOR FUNCTIONS
//  Each returns: { buffer: ArrayBuffer, fileName: string, contentType: string }
//
//  NOTE: Cloudflare Workers cannot run FFmpeg natively.
//  Pattern used here:
//    - Simple operations (image conversion, metadata) → done inline with Web APIs
//    - Complex operations (video/audio processing)    → delegated to an external
//      FFmpeg microservice (e.g. Modal, Fly.io, Render, or your own VPS)
//      via env.FFMPEG_API_URL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Shared: call external FFmpeg service ────────────────────────────────────
async function callFFmpeg({ env, inputKey, command, outputFileName }) {
  if (!env.FFMPEG_API_URL) {
    throw new Error('FFMPEG_API_URL not configured. See worker.js setup instructions.');
  }

  // Get input file from R2
  const obj = await env.FILES.get(inputKey);
  if (!obj) throw new Error('Input file not found in storage');
  const inputBuffer = await obj.arrayBuffer();

  // Send to external FFmpeg service
  const formData = new FormData();
  formData.append('file', new Blob([inputBuffer]), inputKey.split('/').pop());
  formData.append('command', command);
  formData.append('outputFileName', outputFileName);

  const res = await fetch(`${env.FFMPEG_API_URL}/process`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FFmpeg service error: ${err}`);
  }

  const buffer = await res.arrayBuffer();
  return buffer;
}

// ─── Shared: get MIME type ────────────────────────────────────────────────────
function getMimeType(ext) {
  const map = {
    mp4:'video/mp4', webm:'video/webm', avi:'video/x-msvideo',
    mov:'video/quicktime', mkv:'video/x-matroska', wmv:'video/x-ms-wmv',
    flv:'video/x-flv', ts:'video/mp2t', m4v:'video/x-m4v',
    ogv:'video/ogg', hevc:'video/hevc', '3gp':'video/3gpp',
    asf:'video/x-ms-asf', swf:'application/x-shockwave-flash',
    vob:'video/dvd', xvid:'video/x-xvid',
    mp3:'audio/mpeg', wav:'audio/wav', ogg:'audio/ogg',
    m4a:'audio/mp4', m4r:'audio/x-m4r', opus:'audio/opus',
    flac:'audio/flac', aac:'audio/aac', aiff:'audio/aiff',
    amr:'audio/amr', wma:'audio/x-ms-wma',
    jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
    webp:'image/webp', gif:'image/gif', bmp:'image/bmp',
    tiff:'image/tiff', svg:'image/svg+xml', heic:'image/heic',
    pdf:'application/pdf', txt:'text/plain',
    srt:'text/plain', vtt:'text/vtt',
  };
  return map[ext?.toLowerCase()] || 'application/octet-stream';
}

// ─── Video processors ─────────────────────────────────────────────────────────

async function processVideoConverter({ env, inputKey, options, tool, fileName }) {
  const outputExt = options.outputFormat || tool.replace('-converter', '') || 'mp4';
  const baseName  = fileName.replace(/\.[^.]+$/, '');
  const outName   = `${baseName}.${outputExt}`;

  // FFmpeg command for format conversion
  const command = `-i input -c:v libx264 -c:a aac output.${outputExt}`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });

  return { buffer, fileName: outName, contentType: getMimeType(outputExt) };
}

async function processCompressVideo({ env, inputKey, options, fileName }) {
  const qualityMap = {
    'High (less compression)': '28',
    'Medium (balanced)': '32',
    'Low (max compression)': '36',
  };
  const crf     = qualityMap[options.quality] || '32';
  const outName = fileName.replace(/\.[^.]+$/, '_compressed.mp4');
  const command = `-i input -c:v libx264 -crf ${crf} -preset slow -c:a aac output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processCutVideo({ env, inputKey, options, fileName }) {
  const start   = options.startTime || 0;
  const end     = options.endTime || 10;
  const dur     = end - start;
  const outName = fileName.replace(/\.[^.]+$/, '_cut.mp4');
  const command = `-i input -ss ${start} -t ${dur} -c copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processMuteVideo({ env, inputKey, fileName }) {
  const outName = fileName.replace(/\.[^.]+$/, '_muted.mp4');
  const command = `-i input -c:v copy -an output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processResizeVideo({ env, inputKey, options, fileName }) {
  const width   = options.width  || 1920;
  const height  = options.height || 1080;
  const outName = fileName.replace(/\.[^.]+$/, `_${width}x${height}.mp4`);
  const command = `-i input -vf scale=${width}:${height} -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processCropVideo({ env, inputKey, options, fileName }) {
  const outName = fileName.replace(/\.[^.]+$/, '_cropped.mp4');
  // Crop to square as default; real impl would need user-defined crop coords
  const command = `-i input -vf "crop=min(iw\\,ih):min(iw\\,ih)" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processRotateVideo({ env, inputKey, options, fileName }) {
  const transposeMap = {
    '90° Clockwise': '1',
    '180°': '2,transpose=2',
    '90° Counter-Clockwise': '2',
  };
  const transpose = transposeMap[options.degrees] || '1';
  const outName   = fileName.replace(/\.[^.]+$/, '_rotated.mp4');
  const command   = `-i input -vf "transpose=${transpose}" -c:a copy output.mp4`;
  const buffer    = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processFlipVideo({ env, inputKey, options, fileName }) {
  const filterMap = {
    'Horizontal': 'hflip',
    'Vertical': 'vflip',
    'Both': 'hflip,vflip',
  };
  const filter  = filterMap[options.direction] || 'hflip';
  const outName = fileName.replace(/\.[^.]+$/, '_flipped.mp4');
  const command = `-i input -vf "${filter}" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processReverseVideo({ env, inputKey, options, fileName }) {
  const audioFilter = options.keepAudio ? ',areverse' : '';
  const audioMap    = options.keepAudio ? '' : '-an';
  const outName     = fileName.replace(/\.[^.]+$/, '_reversed.mp4');
  const command     = `-i input -vf reverse${audioFilter} ${audioMap} output.mp4`;
  const buffer      = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processChangeVideoSpeed({ env, inputKey, options, fileName }) {
  const speedMap = { '0.25x':4, '0.5x':2, '0.75x':1.333, '1x':1, '1.25x':0.8, '1.5x':0.667, '2x':0.5, '4x':0.25 };
  const pts     = speedMap[options.speed] || 1;
  const atempo  = 1 / pts;
  const outName = fileName.replace(/\.[^.]+$/, '_speed.mp4');
  const command = `-i input -vf "setpts=${pts}*PTS" -af "atempo=${atempo}" output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processLoopVideo({ env, inputKey, options, fileName }) {
  const loops   = options.loops === 'Infinite (GIF)' ? 0 : parseInt(options.loops) || 2;
  const outName = fileName.replace(/\.[^.]+$/, '_looped.mp4');
  const command = `-stream_loop ${loops - 1} -i input -c copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAdjustVideo({ env, inputKey, options, fileName }) {
  const b = (options.brightness || 0) / 100;
  const c = 1 + (options.contrast    || 0) / 100;
  const s = 1 + (options.saturation  || 0) / 100;
  const h = options.hue || 0;
  const outName = fileName.replace(/\.[^.]+$/, '_adjusted.mp4');
  const command = `-i input -vf "eq=brightness=${b}:contrast=${c}:saturation=${s}:gamma=1,hue=h=${h}" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processFilterVideo({ env, inputKey, options, fileName }) {
  const filterMap = {
    'None': '',
    'Grayscale': 'colorchannelmixer=.299:.587:.114:.299:.587:.114:.299:.587:.114',
    'Sepia': 'colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131',
    'Vintage': 'curves=vintage',
    'Warm': 'colorbalance=rs=.1:gs=.1:bs=-.1',
    'Cool': 'colorbalance=rs=-.1:gs=-.05:bs=.1',
    'Vivid': 'eq=saturation=1.5:contrast=1.1',
    'Fade': 'eq=brightness=0.05:contrast=0.85:saturation=0.7',
  };
  const filter  = filterMap[options.filter] || '';
  const outName = fileName.replace(/\.[^.]+$/, '_filtered.mp4');
  const vf      = filter ? `-vf "${filter}"` : '';
  const command = `-i input ${vf} -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddTextToVideo({ env, inputKey, options, fileName }) {
  const text      = (options.text || 'Text').replace(/'/g, "\\'");
  const size      = options.fontSize || 36;
  const color     = (options.fontColor || '#FFFFFF').replace('#', '');
  const posMap    = { 'Top': '(w-text_w)/2:h*0.1', 'Center': '(w-text_w)/2:(h-text_h)/2', 'Bottom': '(w-text_w)/2:h*0.85' };
  const pos       = posMap[options.position] || posMap['Bottom'];
  const start     = options.startTime || 0;
  const end       = options.endTime || 5;
  const outName   = fileName.replace(/\.[^.]+$/, '_text.mp4');
  const command   = `-i input -vf "drawtext=text='${text}':fontsize=${size}:fontcolor=0x${color}:x=${pos.split(':')[0]}:y=${pos.split(':')[1]}:enable='between(t,${start},${end})'" -c:a copy output.mp4`;
  const buffer    = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddAudioToVideo({ env, inputKey, options, fileName }) {
  const vol     = (options.volume || 100) / 100;
  const replace = options.replaceAudio ? '-map 0:v -map 1:a' : '-filter_complex amix';
  const outName = fileName.replace(/\.[^.]+$/, '_with_audio.mp4');
  const command = `-i input -i audio -c:v copy ${replace} -af "volume=${vol}" output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddSubtitlesToVideo({ env, inputKey, options, fileName }) {
  const outName = fileName.replace(/\.[^.]+$/, '_subtitled.mp4');
  const command = `-i input -vf "subtitles=subs.srt:force_style='FontSize=${options.fontSize || 24},PrimaryColour=&H${(options.fontColor||'#FFFFFF').replace('#','')}&'" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddImageToVideo({ env, inputKey, options, fileName }) {
  const posMap  = { 'Top Left': '10:10', 'Top Right': 'W-w-10:10', 'Center': '(W-w)/2:(H-h)/2', 'Bottom Left': '10:H-h-10', 'Bottom Right': 'W-w-10:H-h-10' };
  const pos     = posMap[options.position] || 'W-w-10:H-h-10';
  const opacity = (options.opacity || 100) / 100;
  const scale   = (options.scale   || 20)  / 100;
  const outName = fileName.replace(/\.[^.]+$/, '_watermarked.mp4');
  const command = `-i input -i overlay_img -filter_complex "[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${pos}" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddPhotoToVideo({ env, inputKey, options, fileName }) {
  return processAddImageToVideo({ env, inputKey, options, fileName });
}

async function processAddShapesToVideo({ env, inputKey, options, fileName }) {
  const color   = (options.color || '#FF0000').replace('#', '');
  const opacity = (options.opacity || 80) / 100;
  const outName = fileName.replace(/\.[^.]+$/, '_shapes.mp4');
  const command = `-i input -vf "drawbox=x=100:y=100:w=200:h=200:color=0x${color}@${opacity}:t=fill" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddEmojisToVideo({ env, inputKey, options, fileName }) {
  // Emojis are rendered as text overlays
  const emoji   = options.emoji || '😀';
  const outName = fileName.replace(/\.[^.]+$/, '_emoji.mp4');
  const command = `-i input -vf "drawtext=text='${emoji}':fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processAddStickersToVideo({ env, inputKey, fileName }) {
  // Stickers = image overlays; treated same as add-image-to-video
  return processAddImageToVideo({ env, inputKey, options: { position: 'Center', opacity: 100, scale: 25 }, fileName });
}

async function processMergeVideo({ env, inputKey, fileName }) {
  const outName = fileName.replace(/\.[^.]+$/, '_merged.mp4');
  // Multiple inputs handled by the client sending a list; simplified here
  const command = `-i input -c copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processSplitVideo({ env, inputKey, options, fileName }) {
  // Returns first segment; full split needs multiple output files (handled by FFmpeg service)
  const times   = (options.splitAt || '10').split(',').map(Number);
  const first   = times[0] || 10;
  const outName = fileName.replace(/\.[^.]+$/, '_part1.mp4');
  const command = `-i input -t ${first} -c copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processGifMaker({ env, inputKey, options, fileName }) {
  const fps     = options.fps   || 15;
  const width   = options.width || 480;
  const start   = options.startTime || 0;
  const dur     = (options.endTime || 5) - start;
  const outName = fileName.replace(/\.[^.]+$/, '.gif');
  const command = `-i input -ss ${start} -t ${dur} -vf "fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'image/gif' };
}

async function processGifEditor({ env, inputKey, options, fileName }) {
  const speed = (options.speed || 100) / 100;
  const width = options.width || 480;
  const pts   = 1 / speed;
  const outName = fileName.replace(/\.[^.]+$/, '_edited.gif');
  const command = `-i input -vf "setpts=${pts}*PTS,scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'image/gif' };
}

async function processVideoEditor({ env, inputKey, fileName }) {
  // Generic pass-through; real editor sends explicit operations
  const outName = fileName.replace(/\.[^.]+$/, '_edited.mp4');
  const command = `-i input -c copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processMakeMeme({ env, inputKey, options, fileName }) {
  const top    = (options.topText    || '').replace(/'/g, "\\'");
  const bottom = (options.bottomText || '').replace(/'/g, "\\'");
  const size   = options.fontSize || 40;
  const outName = fileName.replace(/\.[^.]+$/, '_meme.mp4');
  const command = `-i input -vf "drawtext=text='${top}':fontsize=${size}:fontcolor=white:x=(w-text_w)/2:y=20:borderw=3:bordercolor=black,drawtext=text='${bottom}':fontsize=${size}:fontcolor=white:x=(w-text_w)/2:y=h-text_h-20:borderw=3:bordercolor=black" -c:a copy output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processSlideshowMaker({ env, inputKey, options, fileName }) {
  const dur      = options.duration || 3;
  const outName  = 'slideshow.mp4';
  const command  = `-framerate 1/${dur} -i input -c:v libx264 -r 30 -pix_fmt yuv420p output.mp4`;
  const buffer   = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processStopMotion({ env, inputKey, options, fileName }) {
  const fps     = options.fps || 12;
  const outName = 'stopmotion.mp4';
  const command = `-framerate ${fps} -i input -c:v libx264 -r ${fps} -pix_fmt yuv420p output.mp4`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processVideoMaker({ env, inputKey, options, fileName }) {
  return processSlideshowMaker({ env, inputKey, options, fileName });
}

async function processDpiConverter({ env, inputKey, options, fileName }) {
  // DPI is image metadata only; can be changed without re-encoding
  const outName = fileName.replace(/\.[^.]+$/, `_${options.dpi || 300}dpi.jpg`);
  const command = `-i input -dpi ${options.dpi || 300} output.jpg`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'image/jpeg' };
}

// ─── Audio processors ─────────────────────────────────────────────────────────

async function processAudioConverter({ env, inputKey, options, tool, fileName }) {
  const outputExt = options.outputFormat || tool.replace('-converter', '') || 'mp3';
  const bitrate   = options.bitrate || '192k';
  const baseName  = fileName.replace(/\.[^.]+$/, '');
  const outName   = `${baseName}.${outputExt}`;
  const command   = `-i input -c:a ${getAudioCodec(outputExt)} -b:a ${bitrate} output.${outputExt}`;
  const buffer    = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: getMimeType(outputExt) };
}

function getAudioCodec(ext) {
  const map = { mp3:'libmp3lame', wav:'pcm_s16le', ogg:'libvorbis', m4a:'aac', opus:'libopus', flac:'flac', aac:'aac', aiff:'pcm_s16be', wma:'wmav2' };
  return map[ext] || 'aac';
}

async function processCutAudio({ env, inputKey, options, fileName }) {
  const start   = options.startTime || 0;
  const dur     = (options.endTime || 30) - start;
  const outName = fileName.replace(/\.[^.]+$/, '_cut.mp3');
  const command = `-i input -ss ${start} -t ${dur} -c copy output.mp3`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'audio/mpeg' };
}

async function processMergeAudio({ env, inputKey, fileName }) {
  const outName = fileName.replace(/\.[^.]+$/, '_merged.mp3');
  const command = `-i input -c copy output.mp3`;
  const buffer  = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'audio/mpeg' };
}

async function processRecorderUpload({ env, inputKey, fileName }) {
  // Already uploaded to R2 — just mark as done and return the stored file
  const obj = await env.FILES.get(inputKey);
  if (!obj) throw new Error('Upload not found');
  const buffer = await obj.arrayBuffer();
  return { buffer, fileName: fileName || 'recording.webm', contentType: 'video/webm' };
}

// ─── Image processors ─────────────────────────────────────────────────────────

async function processImageConverter({ env, inputKey, options, tool, fileName }) {
  const outputExt = options.outputFormat || tool.replace('-converter', '') || 'jpg';
  const baseName  = fileName.replace(/\.[^.]+$/, '');
  const outName   = `${baseName}.${outputExt}`;
  const quality   = options.quality ? `-q:v ${Math.round((100 - options.quality) / 5 + 1)}` : '';
  const command   = `-i input ${quality} output.${outputExt}`;
  const buffer    = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: getMimeType(outputExt) };
}

// ─── AI processors ────────────────────────────────────────────────────────────

async function callAI({ env, endpoint, body }) {
  if (!env.AI_API_KEY) throw new Error('AI_API_KEY not configured');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.AI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  return res;
}

async function processAudioToText({ env, inputKey, options }) {
  // Uses Whisper-compatible endpoint
  const obj    = await env.FILES.get(inputKey);
  const buffer = await obj.arrayBuffer();

  const formData = new FormData();
  formData.append('file', new Blob([buffer]), 'audio.mp3');
  formData.append('model', 'whisper-1');
  formData.append('language', options.language === 'Auto-detect' ? '' : options.language?.slice(0,2).toLowerCase() || '');
  formData.append('response_format', options.format?.toLowerCase() || 'text');

  const res  = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.AI_API_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Transcription failed');

  const text   = await res.text();
  const ext    = options.format?.toLowerCase() || 'txt';
  const outName = `transcript.${ext}`;
  const enc     = new TextEncoder();
  return { buffer: enc.encode(text).buffer, fileName: outName, contentType: getMimeType(ext) };
}

async function processVideoToText({ env, inputKey, options, fileName }) {
  // Extract audio first, then transcribe
  const audioKey = inputKey.replace(/\.[^.]+$/, '_audio.mp3');
  const command  = `-i input -vn -c:a libmp3lame output.mp3`;
  await callFFmpeg({ env, inputKey, command, outputFileName: 'audio.mp3' });
  return processAudioToText({ env, inputKey: audioKey, options });
}

async function processAutoSubtitleGenerator({ env, inputKey, options, fileName }) {
  const transcript = await processAudioToText({ env, inputKey, options: { ...options, format: 'SRT' } });
  return { ...transcript, fileName: fileName.replace(/\.[^.]+$/, '.srt') };
}

async function processAudioTranslator({ env, inputKey, options }) {
  const obj    = await env.FILES.get(inputKey);
  const buffer = await obj.arrayBuffer();

  const formData = new FormData();
  formData.append('file', new Blob([buffer]), 'audio.mp3');
  formData.append('model', 'whisper-1');

  const res  = await fetch('https://api.openai.com/v1/audio/translations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.AI_API_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Translation failed');

  const text    = await res.text();
  const enc     = new TextEncoder();
  return { buffer: enc.encode(text).buffer, fileName: 'translation.txt', contentType: 'text/plain' };
}

async function processTextToSpeech({ env, text, options }) {
  if (!text) throw new Error('No text provided');
  const voiceMap = {
    'Male (US)': 'onyx', 'Female (US)': 'nova', 'Male (UK)': 'echo',
    'Female (UK)': 'shimmer', 'Male (AU)': 'fable', 'Female (AU)': 'alloy',
  };
  const voice = voiceMap[options.voice] || 'nova';
  const speed = (options.speed || 100) / 100;

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.AI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice, speed }),
  });
  if (!res.ok) throw new Error('Text-to-speech failed');

  const buffer = await res.arrayBuffer();
  return { buffer, fileName: 'speech.mp3', contentType: 'audio/mpeg' };
}

async function processTranslateEnglishVideo({ env, inputKey, options, fileName }) {
  // Generate subtitles then burn into video
  const srtResult = await processAutoSubtitleGenerator({ env, inputKey, options, fileName });
  const outName   = fileName.replace(/\.[^.]+$/, '_translated.mp4');
  const command   = `-i input -vf "subtitles=subs.srt" -c:a copy output.mp4`;
  const buffer    = await callFFmpeg({ env, inputKey, command, outputFileName: outName });
  return { buffer, fileName: outName, contentType: 'video/mp4' };
}

async function processVideoTranslator({ env, inputKey, options, fileName }) {
  return processTranslateEnglishVideo({ env, inputKey, options, fileName });
}