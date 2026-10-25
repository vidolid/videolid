import {
  verifyFirebaseToken,
  requireFirebaseAuth,
  checkAndIncrementUsage,
  getUsage,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
  r2Path,
  PLANS,
  AuthError,
  jsonResponse,
  errorResponse,
} from "./firebase-worker-auth.js";

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
});

// ─── Route table ─────────────────────────────────────────────────────────────
// Maps every tool slug to its processor function
const TOOL_PROCESSORS = {
  // Video editing
  "video-editor": processVideoEditor,
  "add-audio-to-video": processAddAudioToVideo,
  "add-emojis-to-video": processAddEmojisToVideo,
  "add-image-to-video": processAddImageToVideo,
  "add-photo-to-video": processAddPhotoToVideo,
  "add-shapes-to-video": processAddShapesToVideo,
  "add-stickers-to-video": processAddStickersToVideo,
  "add-subtitles-to-video": processAddSubtitlesToVideo,
  "add-text-to-video": processAddTextToVideo,
  "adjust-video": processAdjustVideo,
  "change-video-speed": processChangeVideoSpeed,
  "compress-video": processCompressVideo,
  "crop-video": processCropVideo,
  "cut-video": processCutVideo,
  "filter-video": processFilterVideo,
  "flip-video": processFlipVideo,
  "loop-video": processLoopVideo,
  "meme-maker": processMakeMeme,
  "merge-video": processMergeVideo,
  "mute-video": processMuteVideo,
  "resize-video": processResizeVideo,
  "reverse-video": processReverseVideo,
  "rotate-video": processRotateVideo,
  "slideshow-maker": processSlideshowMaker,
  "split-video": processSplitVideo,
  "stop-motion": processStopMotion,
  "video-maker": processVideoMaker,
  "dpi-converter": processDpiConverter,
  // GIF
  "gif-maker": processGifMaker,
  "gif-editor": processGifEditor,
  // Audio
  "cut-audio": processCutAudio,
  "merge-audio": processMergeAudio,
  // Recorders (receive uploaded blob, store it)
  "audio-recorder": processRecorderUpload,
  "screen-recorder": processRecorderUpload,
  "presentation-recorder": processRecorderUpload,
  "webcam-recorder": processRecorderUpload,
  // AI tools
  "audio-to-text": processAudioToText,
  "audio-translator": processAudioTranslator,
  "auto-subtitle-generator": processAutoSubtitleGenerator,
  "text-to-speech": processTextToSpeech,
  "translate-english-video": processTranslateEnglishVideo,
  "video-to-text": processVideoToText,
  "video-translator": processVideoTranslator,
  // Video converters
  "video-converter": processVideoConverter,
  "mp4-converter": processVideoConverter,
  "avi-converter": processVideoConverter,
  "mov-converter": processVideoConverter,
  "mkv-converter": processVideoConverter,
  "webm-converter": processVideoConverter,
  "wmv-converter": processVideoConverter,
  "hevc-converter": processVideoConverter,
  "m4v-converter": processVideoConverter,
  "ogv-converter": processVideoConverter,
  "ts-converter": processVideoConverter,
  "asf-converter": processVideoConverter,
  "swf-converter": processVideoConverter,
  "vob-converter": processVideoConverter,
  "xvid-converter": processVideoConverter,
  "3gp-converter": processVideoConverter,
  // Audio converters
  "audio-converter": processAudioConverter,
  "mp3-converter": processAudioConverter,
  "wav-converter": processAudioConverter,
  "ogg-converter": processAudioConverter,
  "m4a-converter": processAudioConverter,
  "m4r-converter": processAudioConverter,
  "opus-converter": processAudioConverter,
  "flac-converter": processAudioConverter,
  "aac-converter": processAudioConverter,
  "aiff-converter": processAudioConverter,
  "amr-converter": processAudioConverter,
  "wma-converter": processAudioConverter,
  // Image converters
  "image-converter": processImageConverter,
  "jpg-converter": processImageConverter,
  "png-converter": processImageConverter,
  "webp-converter": processImageConverter,
  "gif-converter": processImageConverter,
  "bmp-converter": processImageConverter,
  "heic-converter": processImageConverter,
  "svg-converter": processImageConverter,
  "tiff-converter": processImageConverter,
};

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "*";
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      // Firebase handles login/signup on the frontend; the Worker only verifies tokens.

      // ── Usage ──
      if (method === "GET" && path === "/api/usage") {
        const { uid, plan } = await requireFirebaseAuth(request, env);
        const usage = await getUsage(uid, plan, env);
        return jsonResponse(usage, 200, origin);
      }

      // ── API Keys ──
      if (method === "GET" && path === "/api/keys") {
        const { uid } = await requireFirebaseAuth(request, env);
        const keys = await listApiKeys(uid, env);
        return jsonResponse({ keys }, 200, origin);
      }

      if (method === "POST" && path === "/api/keys") {
        const { uid, email } = await requireFirebaseAuth(request, env);
        const { name } = await request.json().catch(() => ({}));
        const apiKey = await createApiKey(uid, email, name, env);
        return jsonResponse(
          { apiKey, message: "Save this key — it won't be shown again" },
          201,
          origin,
        );
      }

      if (method === "DELETE" && path.startsWith("/api/keys/")) {
        const { uid } = await requireFirebaseAuth(request, env);
        const key = decodeURIComponent(path.split("/api/keys/")[1]);
        await revokeApiKey(uid, key, env);
        return jsonResponse({ success: true }, 200, origin);
      }

      // ── Billing ──
      if (method === "POST" && path === "/api/billing/checkout") {
        const { uid, email } = await requireFirebaseAuth(request, env);
        const { plan } = await request.json();
        const checkoutUrl = await createCheckoutSession(uid, email, plan, env);
        return jsonResponse({ url: checkoutUrl }, 200, origin);
      }

      if (method === "POST" && path === "/api/billing/portal") {
        const { uid } = await requireFirebaseAuth(request, env);
        const portalUrl = await createPortalSession(uid, env);
        return jsonResponse({ url: portalUrl }, 200, origin);
      }

      // Stripe webhooks are unauthenticated (Stripe signs them instead)
      if (method === "POST" && path === "/api/billing/webhook") {
        return handleStripeWebhook(request, env, origin);
      }

      // ── Process (main job route) ──
      if (method === "POST" && path === "/api/process") {
        return handleProcess(request, env, ctx, origin);
      }

      // ── Status & Download ──
      if (method === "GET" && path.startsWith("/api/status/")) {
        const jobId = path.split("/api/status/")[1];
        const raw = await env.JOBS.get(jobId);
        if (!raw) return errorResponse("Job not found", 404, origin);
        return jsonResponse(JSON.parse(raw), 200, origin);
      }

      if (method === "GET" && path.startsWith("/api/download/")) {
        // FIX: file names with spaces/unicode arrive percent-encoded; decode before the R2 lookup
        const fileId = decodeURIComponent(path.split("/api/download/")[1]);
        return handleDownload(fileId, env, origin);
      }

      if (path === "/api/health") {
        return jsonResponse({ status: "ok" }, 200, origin);
      }

      return errorResponse("Not found", 404, origin);
    } catch (err) {
      // AuthError → 401, everything else → 500
      const status = err instanceof AuthError ? 401 : 500;
      return errorResponse(err.message, status, origin);
    }
  },
};

// ─── Handle /api/process ─────────────────────────────────────────────────────
async function handleProcess(request, env, ctx, origin) {
  // 1. Identify the user (Firebase token OR anonymous free tier)
  let uid = "anonymous";
  let plan = "free";

  try {
    const auth = await requireFirebaseAuth(request, env);
    uid = auth.uid;
    plan = auth.plan;
  } catch (e) {
    if (!(e instanceof AuthError)) throw e;
    // Unauthenticated requests are allowed under free limits.
    // Throw here instead if you want to require login.
  }

  // 2. Parse the request
  const contentType = request.headers.get("Content-Type") || "";
  let tool, options, text;
  const files = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    tool = formData.get("tool");
    try {
      options = JSON.parse(formData.get("options") || "{}");
    } catch {
      return errorResponse("Invalid options", 400, origin);
    }
    // FIX: the frontend sends fixedOutput as a separate form field; honour it
    const fixedOutput = formData.get("outputFormat");
    if (fixedOutput && !options.outputFormat)
      options.outputFormat = String(fixedOutput);

    // FIX: collect ALL uploads. The frontend names them "file", "file_1", "file_2", ...
    const first = formData.get("file");
    if (first && typeof first !== "string") files.push(first);
    for (let i = 1; i < 50; i++) {
      const f = formData.get(`file_${i}`);
      if (!f || typeof f === "string") break;
      files.push(f);
    }

    if (!files.length) return errorResponse("No file provided", 400, origin);
    if (!tool) return errorResponse("No tool specified", 400, origin);

    // 3. Enforce plan file size limit (per file)
    const planConfig = PLANS[plan] || PLANS.free;
    const maxBytes = planConfig.maxFileMB * 1024 * 1024;
    if (files.some((f) => f.size > maxBytes)) {
      return errorResponse(
        `File too large. Your ${planConfig.name} plan allows up to ${planConfig.maxFileMB}MB per file.`,
        413,
        origin,
      );
    }
  } else {
    const body = await request.json();
    tool = body.tool;
    options = body.options || {};
    text = body.text;
    if (!tool) return errorResponse("No tool specified", 400, origin);
  }

  // 4. FIX: validate the tool BEFORE spending the user's monthly quota
  const processor = TOOL_PROCESSORS[tool];
  if (!processor) return errorResponse(`Unknown tool: ${tool}`, 400, origin);

  await checkAndIncrementUsage(uid, plan, env);

  // 5. Generate job ID and store initial status
  const jobId = crypto.randomUUID();
  await env.JOBS.put(
    jobId,
    JSON.stringify({ status: "processing", tool, uid, createdAt: Date.now() }),
    { expirationTtl: 3600 },
  );

  // 6. Upload every input to R2, scoped under the user's UID
  const inputKeys = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    // Prefix extra files with their index so two files with the same name can't collide
    const key = r2Path.input(uid, jobId, i === 0 ? f.name : `${i}_${f.name}`);
    await env.FILES.put(key, await f.arrayBuffer(), {
      httpMetadata: { contentType: f.type },
    });
    inputKeys.push(key);
  }

  // 7. Run processor in the background
  const processingPromise = processor({
    jobId,
    tool,
    options,
    text,
    inputKey: inputKeys[0] || null, // primary file (video, audio, first image...)
    inputKeys, // all files, in upload order
    fileName: files[0]?.name || "input",
    fileType: files[0]?.type || "",
    uid,
    plan,
    env,
  })
    .then(async (result) => {
      const outputKey = r2Path.output(uid, jobId, result.fileName);

      if (result.buffer) {
        await env.FILES.put(outputKey, result.buffer, {
          httpMetadata: {
            contentType: result.contentType || "application/octet-stream",
          },
        });
      }

      await env.JOBS.put(
        jobId,
        JSON.stringify({
          status: "done",
          tool,
          uid,
          fileId: `${uid}/${jobId}/${result.fileName}`,
          fileName: result.fileName,
          contentType: result.contentType,
          createdAt: Date.now(),
        }),
        { expirationTtl: 3600 },
      );
    })
    .catch(async (err) => {
      await env.JOBS.put(
        jobId,
        JSON.stringify({
          status: "error",
          tool,
          uid,
          error: err.message,
          createdAt: Date.now(),
        }),
        { expirationTtl: 3600 },
      );
    });

  ctx.waitUntil(processingPromise);

  return jsonResponse({ jobId, status: "processing" }, 202, origin);
}

// ─── Handle /api/download/:fileId ────────────────────────────────────────────
async function handleDownload(fileId, env, origin) {
  const key = `outputs/${fileId}`;
  const obj = await env.FILES.get(key);
  if (!obj) return errorResponse("File not found", 404, origin);

  // Header values must be plain ASCII, so unicode names go in filename* instead
  const name = fileId.split("/").pop();
  const asciiName = name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");

  const headers = {
    "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
    "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    ...corsHeaders(origin),
  };
  return new Response(obj.body, { headers });
}

// ─── FFmpeg service client ───────────────────────────────────────────────────
// Contract with the FFmpeg service (multipart/form-data):
//   file           primary input, referenced as `input` in the command
//   file_1..file_N extra inputs, each sent under a safe unique file name.
//                  In `command`, write input_1, input_2... and this function swaps in
//                  the real file name before sending. The service must save every
//                  uploaded part to its working directory under its file name.
//   command        FFmpeg arguments, using `input` and `output.<ext>`
//   outputFileName name to give the result
async function callFFmpeg({
  env,
  inputKey,
  extraKeys = [],
  extraFiles = [],
  command,
  outputFileName,
}) {
  if (!env.FFMPEG_API_URL) {
    throw new Error(
      "FFMPEG_API_URL not configured. See worker.js setup instructions.",
    );
  }

  const obj = await env.FILES.get(inputKey);
  if (!obj) throw new Error("Input file not found in storage");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([await obj.arrayBuffer()]),
    inputKey.split("/").pop(),
  );

  // Gather extra inputs (from R2, plus any generated in memory such as an SRT)
  const extras = [];
  for (const key of extraKeys) {
    const o = await env.FILES.get(key);
    if (!o) throw new Error("An extra input file was not found in storage");
    extras.push({ name: key.split("/").pop(), data: await o.arrayBuffer() });
  }
  for (const f of extraFiles) extras.push(f);

  const safeNames = extras.map(
    (e, i) => `in${i + 1}_${e.name.replace(/[^A-Za-z0-9._-]/g, "_")}`,
  );
  extras.forEach((e, i) =>
    formData.append(`file_${i + 1}`, new Blob([e.data]), safeNames[i]),
  );

  const finalCommand = command.replace(/\binput_(\d+)\b/g, (_, n) => {
    const name = safeNames[Number(n) - 1];
    if (!name)
      throw new Error(`This tool needs more input files (missing input ${n}).`);
    return name;
  });

  formData.append("command", finalCommand);
  formData.append("outputFileName", outputFileName);

  const res = await fetch(`${env.FFMPEG_API_URL}/process`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FFmpeg service error: ${err.slice(0, 300)}`);
  }
  return res.arrayBuffer();
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
function getMimeType(ext) {
  const map = {
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    ts: "video/mp2t",
    m4v: "video/x-m4v",
    ogv: "video/ogg",
    hevc: "video/hevc",
    "3gp": "video/3gpp",
    asf: "video/x-ms-asf",
    swf: "application/x-shockwave-flash",
    vob: "video/dvd",
    xvid: "video/x-xvid",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    m4r: "audio/x-m4r",
    opus: "audio/opus",
    flac: "audio/flac",
    aac: "audio/aac",
    aiff: "audio/aiff",
    amr: "audio/amr",
    wma: "audio/x-ms-wma",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    svg: "image/svg+xml",
    heic: "image/heic",
    pdf: "application/pdf",
    txt: "text/plain",
    srt: "text/plain",
    vtt: "text/vtt",
    json: "application/json",
  };
  return map[ext?.toLowerCase()] || "application/octet-stream";
}

// Options arrive from the browser, so every value that ends up inside an FFmpeg
// command is coerced or whitelisted first.
const num = (v, d) => {
  const n = Number(v);
  return v !== "" && v != null && Number.isFinite(n) ? n : d;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const even = (n) => Math.max(2, Math.round(n) - (Math.round(n) % 2));
const baseName = (f) => f.replace(/\.[^.]+$/, "");
const named = (f, suffix) => baseName(f) + suffix; // works even when f has no extension
const hexColor = (v, d) =>
  /^#?[0-9a-fA-F]{6}$/.test(String(v || "")) ? String(v).replace("#", "") : d;
const assColor = (hex) => hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2); // RRGGBB → BBGGRR
// Text that goes inside drawtext='...': drop characters that could break out of the quoting
const ffText = (s) =>
  String(s ?? "")
    .replace(/["`$\\%\r\n]/g, "")
    .replace(/'/g, "\u2019");
const encode = (s) => new TextEncoder().encode(s).buffer;

async function ffmpeg(
  p,
  command,
  outName,
  contentType = "video/mp4",
  extra = {},
) {
  const buffer = await callFFmpeg({
    env: p.env,
    inputKey: p.inputKey,
    command,
    outputFileName: outName,
    ...extra,
  });
  return { buffer, fileName: outName, contentType };
}

// Keys of the files uploaded after the primary one (overlay image, audio track, SRT, more clips...)
function extraKeysFor(p, what, min = 1) {
  const keys = (p.inputKeys || []).slice(1);
  if (keys.length < min) {
    throw new Error(
      `This tool needs ${what}. Upload it together with your main file.`,
    );
  }
  return keys;
}

// ─── Video processors ─────────────────────────────────────────────────────────

// FIX: every format used to be encoded with libx264/aac, which fails for webm, ogv, wmv, swf, vob...
const H264 = "-c:v libx264 -pix_fmt yuv420p -c:a aac";
const VIDEO_CODECS = {
  mp4: { ext: "mp4", args: H264 },
  m4v: { ext: "m4v", args: H264 },
  mov: { ext: "mov", args: H264 },
  mkv: { ext: "mkv", args: H264 },
  ts: { ext: "ts", args: H264 },
  "3gp": { ext: "3gp", args: H264 },
  avi: { ext: "avi", args: "-c:v mpeg4 -q:v 4 -c:a libmp3lame" },
  webm: { ext: "webm", args: "-c:v libvpx-vp9 -b:v 0 -crf 32 -c:a libopus" },
  ogv: { ext: "ogv", args: "-c:v libtheora -q:v 7 -c:a libvorbis" },
  wmv: { ext: "wmv", args: "-c:v wmv2 -c:a wmav2" },
  asf: { ext: "asf", args: "-c:v wmv2 -c:a wmav2" },
  swf: { ext: "swf", args: "-c:v flv1 -c:a libmp3lame -ar 44100" },
  vob: { ext: "vob", args: "-c:v mpeg2video -c:a ac3 -f vob" },
  xvid: { ext: "avi", args: "-c:v mpeg4 -vtag xvid -q:v 4 -c:a libmp3lame" },
  hevc: {
    ext: "mp4",
    args: "-c:v libx265 -tag:v hvc1 -pix_fmt yuv420p -c:a aac",
  },
};

async function processVideoConverter(p) {
  const want = String(
    p.options.outputFormat || p.tool.replace("-converter", ""),
  ).toLowerCase();
  const spec = VIDEO_CODECS[want] || VIDEO_CODECS.mp4;
  return ffmpeg(
    p,
    `-i input ${spec.args} output.${spec.ext}`,
    named(p.fileName, `.${spec.ext}`),
    getMimeType(spec.ext),
  );
}

async function processCompressVideo(p) {
  const qualityMap = {
    "High (less compression)": "28",
    "Medium (balanced)": "32",
    "Low (max compression)": "36",
  };
  const crf = qualityMap[p.options.quality] || "32";
  return ffmpeg(
    p,
    `-i input -c:v libx264 -crf ${crf} -preset medium -pix_fmt yuv420p -c:a aac output.mp4`,
    named(p.fileName, "_compressed.mp4"),
  );
}

async function processCutVideo(p) {
  const start = Math.max(0, num(p.options.startTime, 0));
  const end = num(p.options.endTime, 10);
  if (end <= start) throw new Error("End time must be after the start time.");
  // Re-encode so the cut is exact (stream copy can only cut on keyframes)
  const command = `-ss ${start} -i input -t ${end - start} -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_cut.mp4"));
}

async function processMuteVideo(p) {
  return ffmpeg(
    p,
    "-i input -c:v copy -an output.mp4",
    named(p.fileName, "_muted.mp4"),
  );
}

async function processResizeVideo(p) {
  const w = even(clamp(num(p.options.width, 1920), 16, 7680));
  const h = even(clamp(num(p.options.height, 1080), 16, 4320));
  return ffmpeg(
    p,
    `-i input -vf scale=${w}:${h} -c:a copy output.mp4`,
    named(p.fileName, `_${w}x${h}.mp4`),
  );
}

async function processCropVideo(p) {
  // Crops to a centered square; real coordinates would need extra options from the UI
  const command = `-i input -vf "crop=min(iw\\,ih):min(iw\\,ih)" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_cropped.mp4"));
}

async function processRotateVideo(p) {
  const transposeMap = {
    "90° Clockwise": "1",
    "180°": "2,transpose=2",
    "90° Counter-Clockwise": "2",
  };
  const transpose = transposeMap[p.options.degrees] || "1";
  return ffmpeg(
    p,
    `-i input -vf "transpose=${transpose}" -c:a copy output.mp4`,
    named(p.fileName, "_rotated.mp4"),
  );
}

async function processFlipVideo(p) {
  const filterMap = {
    Horizontal: "hflip",
    Vertical: "vflip",
    Both: "hflip,vflip",
  };
  const filter = filterMap[p.options.direction] || "hflip";
  return ffmpeg(
    p,
    `-i input -vf "${filter}" -c:a copy output.mp4`,
    named(p.fileName, "_flipped.mp4"),
  );
}

async function processReverseVideo(p) {
  // FIX: "areverse" is an audio filter and can't be chained inside -vf
  const command = p.options.keepAudio
    ? "-i input -vf reverse -af areverse output.mp4"
    : "-i input -vf reverse -an output.mp4";
  return ffmpeg(p, command, named(p.fileName, "_reversed.mp4"));
}

// atempo only accepts 0.5–2.0 per stage, so 0.25x and 4x need two chained stages
function atempoChain(factor) {
  const stages = [];
  let r = factor;
  while (r > 2) {
    stages.push(2);
    r /= 2;
  }
  while (r < 0.5) {
    stages.push(0.5);
    r /= 0.5;
  }
  stages.push(Number(r.toFixed(4)));
  return stages.map((v) => `atempo=${v}`).join(",");
}

async function processChangeVideoSpeed(p) {
  const speedMap = {
    "0.25x": 0.25,
    "0.5x": 0.5,
    "0.75x": 0.75,
    "1x": 1,
    "1.25x": 1.25,
    "1.5x": 1.5,
    "2x": 2,
    "4x": 4,
  };
  const speed = speedMap[p.options.speed] || 1;
  const command = `-i input -vf "setpts=${(1 / speed).toFixed(4)}*PTS" -af "${atempoChain(speed)}" output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_speed.mp4"));
}

async function processLoopVideo(p) {
  const infinite = p.options.loops === "Infinite (GIF)";
  if (infinite) {
    // FIX: stream_loop -1 never terminates; "infinite" means a GIF that loops forever
    const command = `-i input -vf "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif`;
    return ffmpeg(p, command, named(p.fileName, "_loop.gif"), "image/gif");
  }
  const loops = clamp(parseInt(p.options.loops) || 2, 1, 20);
  return ffmpeg(
    p,
    `-stream_loop ${loops - 1} -i input -c copy output.mp4`,
    named(p.fileName, "_looped.mp4"),
  );
}

async function processAdjustVideo(p) {
  const b = clamp(num(p.options.brightness, 0) / 100, -1, 1);
  const c = clamp(1 + num(p.options.contrast, 0) / 100, 0, 3);
  const s = clamp(1 + num(p.options.saturation, 0) / 100, 0, 3);
  const h = clamp(num(p.options.hue, 0), -180, 180);
  const command = `-i input -vf "eq=brightness=${b}:contrast=${c}:saturation=${s}:gamma=1,hue=h=${h}" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_adjusted.mp4"));
}

async function processFilterVideo(p) {
  const filterMap = {
    None: "",
    Grayscale: "colorchannelmixer=.299:.587:.114:.299:.587:.114:.299:.587:.114",
    Sepia: "colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131",
    Vintage: "curves=vintage",
    Warm: "colorbalance=rs=.1:gs=.1:bs=-.1",
    Cool: "colorbalance=rs=-.1:gs=-.05:bs=.1",
    Vivid: "eq=saturation=1.5:contrast=1.1",
    Fade: "eq=brightness=0.05:contrast=0.85:saturation=0.7",
  };
  const filter = filterMap[p.options.filter] || "";
  const vf = filter ? `-vf "${filter}"` : "";
  return ffmpeg(
    p,
    `-i input ${vf} -c:a copy output.mp4`,
    named(p.fileName, "_filtered.mp4"),
  );
}

async function processAddTextToVideo(p) {
  const text = ffText(p.options.text || "Text");
  const size = clamp(num(p.options.fontSize, 36), 8, 300);
  const color = hexColor(p.options.fontColor, "FFFFFF");
  const posMap = {
    Top: { x: "(w-text_w)/2", y: "h*0.1" },
    Center: { x: "(w-text_w)/2", y: "(h-text_h)/2" },
    Bottom: { x: "(w-text_w)/2", y: "h*0.85" },
  };
  const pos = posMap[p.options.position] || posMap.Bottom;
  const start = Math.max(0, num(p.options.startTime, 0));
  const end = num(p.options.endTime, 5);
  const command = `-i input -vf "drawtext=text='${text}':fontsize=${size}:fontcolor=0x${color}:x=${pos.x}:y=${pos.y}:enable='between(t,${start},${end})'" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_text.mp4"));
}

async function processAddAudioToVideo(p) {
  // The audio track is the second uploaded file
  const keys = extraKeysFor(p, "an audio file");
  const vol = clamp(num(p.options.volume, 100) / 100, 0, 4);
  const outName = named(p.fileName, "_with_audio.mp4");
  const extra = { extraKeys: [keys[0]] };

  const replaceCmd = `-i input -i input_1 -map 0:v -map 1:a -c:v copy -af "volume=${vol}" -shortest output.mp4`;
  if (p.options.replaceAudio)
    return ffmpeg(p, replaceCmd, outName, "video/mp4", extra);

  // Mix with the original sound; if the video has no audio track the mix fails, so fall back to replace
  const mixCmd = `-i input -i input_1 -filter_complex "[1:a]volume=${vol}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0[a]" -map 0:v -map "[a]" -c:v copy output.mp4`;
  try {
    return await ffmpeg(p, mixCmd, outName, "video/mp4", extra);
  } catch {
    return ffmpeg(p, replaceCmd, outName, "video/mp4", extra);
  }
}

async function processAddSubtitlesToVideo(p) {
  // FIX: the subtitle file (SRT/VTT/ASS) is the second upload; it was never sent before
  const keys = extraKeysFor(p, "a subtitle file (.srt, .vtt or .ass)");
  const size = clamp(num(p.options.fontSize, 24), 8, 120);
  const color = assColor(hexColor(p.options.fontColor, "FFFFFF"));
  const command = `-i input -vf "subtitles=input_1:force_style='FontSize=${size},PrimaryColour=&H00${color}&'" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_subtitled.mp4"), "video/mp4", {
    extraKeys: [keys[0]],
  });
}

async function processAddImageToVideo(p) {
  // FIX: the overlay image is the second upload; it was never sent before
  const keys = extraKeysFor(p, "an image to overlay");
  const posMap = {
    "Top Left": "10:10",
    "Top Right": "W-w-10:10",
    Center: "(W-w)/2:(H-h)/2",
    "Bottom Left": "10:H-h-10",
    "Bottom Right": "W-w-10:H-h-10",
  };
  const pos = posMap[p.options.position] || "W-w-10:H-h-10";
  const opacity = clamp(num(p.options.opacity, 100) / 100, 0, 1);
  const scale = clamp(num(p.options.scale, 20) / 100, 0.01, 2);
  const command = `-i input -i input_1 -filter_complex "[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${pos}" -c:a copy output.mp4`;
  return ffmpeg(
    p,
    command,
    named(p.fileName, "_watermarked.mp4"),
    "video/mp4",
    { extraKeys: [keys[0]] },
  );
}

async function processAddPhotoToVideo(p) {
  return processAddImageToVideo(p);
}

async function processAddStickersToVideo(p) {
  // Stickers are image overlays, centered
  return processAddImageToVideo({
    ...p,
    options: { position: "Center", opacity: 100, scale: 25 },
  });
}

async function processAddShapesToVideo(p) {
  const color = hexColor(p.options.color, "FF0000");
  const opacity = clamp(num(p.options.opacity, 80) / 100, 0, 1);
  const command = `-i input -vf "drawbox=x=100:y=100:w=200:h=200:color=0x${color}@${opacity}:t=fill" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_shapes.mp4"));
}

async function processAddEmojisToVideo(p) {
  // Needs an emoji-capable font installed on the FFmpeg server
  const emoji = ffText(p.options.emoji || "😀");
  const command = `-i input -vf "drawtext=text='${emoji}':fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_emoji.mp4"));
}

// Shared by merge-video: scale every clip to 1280x720, same fps, then concat
async function processMergeVideo(p) {
  const keys = extraKeysFor(p, "at least two videos", 1).slice(0, 9);
  const n = keys.length + 1;
  const idx = [...Array(n).keys()];
  const inputs = ["-i input", ...keys.map((_, i) => `-i input_${i + 1}`)].join(
    " ",
  );
  const vf = idx.map(
    (i) =>
      `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`,
  );
  const af = idx.map(
    (i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`,
  );
  const outName = named(p.fileName, "_merged.mp4");
  const extra = { extraKeys: keys };
  const enc = "-c:v libx264 -pix_fmt yuv420p";

  const withAudio = `${inputs} -filter_complex "${[...vf, ...af].join(";")};${idx.map((i) => `[v${i}][a${i}]`).join("")}concat=n=${n}:v=1:a=1[v][a]" -map "[v]" -map "[a]" ${enc} -c:a aac output.mp4`;
  try {
    return await ffmpeg(p, withAudio, outName, "video/mp4", extra);
  } catch {
    // At least one clip has no audio track: merge the video only
    const videoOnly = `${inputs} -filter_complex "${vf.join(";")};${idx.map((i) => `[v${i}]`).join("")}concat=n=${n}:v=1:a=0[v]" -map "[v]" ${enc} output.mp4`;
    return ffmpeg(p, videoOnly, outName, "video/mp4", extra);
  }
}

async function processSplitVideo(p) {
  // Returns the first segment only (the API returns a single file per job)
  const first =
    String(p.options.splitAt || "10")
      .split(",")
      .map(Number)
      .find((n) => Number.isFinite(n) && n > 0) || 10;
  return ffmpeg(
    p,
    `-i input -t ${first} -c copy output.mp4`,
    named(p.fileName, "_part1.mp4"),
  );
}

// Builds a video out of the uploaded images (slideshow and stop-motion share this)
async function imagesToVideo(
  p,
  { perImage, outName, frameMode = false, fps = 30 },
) {
  const keys = (p.inputKeys || []).slice(1).slice(0, 99);
  const n = keys.length + 1;
  const idx = [...Array(n).keys()];
  const loopArgs = frameMode ? "-loop 1 -t 1" : `-loop 1 -t ${perImage}`;
  const inputs = [
    `${loopArgs} -i input`,
    ...keys.map((_, i) => `${loopArgs} -i input_${i + 1}`),
  ].join(" ");
  const tail = frameMode
    ? `,fps=${fps},trim=end_frame=1,setpts=PTS-STARTPTS`
    : `,fps=${fps}`;
  const vf = idx.map(
    (i) =>
      `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1${tail},format=yuv420p[v${i}]`,
  );
  const command = `${inputs} -filter_complex "${vf.join(";")};${idx.map((i) => `[v${i}]`).join("")}concat=n=${n}:v=1:a=0[v]" -map "[v]" -r ${fps} -c:v libx264 -pix_fmt yuv420p output.mp4`;
  return ffmpeg(p, command, outName, "video/mp4", { extraKeys: keys });
}

async function processSlideshowMaker(p) {
  const dur = clamp(num(p.options.duration, 3), 0.5, 30);
  return imagesToVideo(p, { perImage: dur, outName: "slideshow.mp4" });
}

async function processStopMotion(p) {
  const fps = clamp(num(p.options.fps, 12), 1, 60);
  return imagesToVideo(p, { frameMode: true, fps, outName: "stopmotion.mp4" });
}

async function processVideoMaker(p) {
  return processSlideshowMaker(p);
}

async function processGifMaker(p) {
  const fps = clamp(num(p.options.fps, 15), 1, 30);
  const width = clamp(num(p.options.width, 480), 64, 1280);
  const start = Math.max(0, num(p.options.startTime, 0));
  const dur = Math.max(0.1, num(p.options.endTime, 5) - start);
  const command = `-i input -ss ${start} -t ${dur} -vf "fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif`;
  return ffmpeg(p, command, named(p.fileName, ".gif"), "image/gif");
}

async function processGifEditor(p) {
  const speed = clamp(num(p.options.speed, 100) / 100, 0.1, 10);
  const width = clamp(num(p.options.width, 480), 64, 1280);
  const command = `-i input -vf "setpts=${(1 / speed).toFixed(4)}*PTS,scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif`;
  return ffmpeg(p, command, named(p.fileName, "_edited.gif"), "image/gif");
}

async function processVideoEditor(p) {
  // Generic pass-through; the real editor sends explicit operations
  return ffmpeg(
    p,
    "-i input -c copy output.mp4",
    named(p.fileName, "_edited.mp4"),
  );
}

async function processMakeMeme(p) {
  const top = ffText(p.options.topText);
  const bottom = ffText(p.options.bottomText);
  const size = clamp(num(p.options.fontSize, 40), 8, 200);
  const style = `fontsize=${size}:fontcolor=white:x=(w-text_w)/2:borderw=3:bordercolor=black`;
  const command = `-i input -vf "drawtext=text='${top}':${style}:y=20,drawtext=text='${bottom}':${style}:y=h-text_h-20" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_meme.mp4"));
}

async function processDpiConverter(p) {
  // NOTE: FFmpeg has no -dpi option, so this will fail on a stock FFmpeg build.
  // Setting DPI needs an image tool (e.g. ImageMagick: -density N -units PixelsPerInch).
  const dpi = clamp(num(p.options.dpi, 300), 36, 1200);
  return ffmpeg(
    p,
    `-i input -dpi ${dpi} output.jpg`,
    named(p.fileName, `_${dpi}dpi.jpg`),
    "image/jpeg",
  );
}

// ─── Audio processors ─────────────────────────────────────────────────────────

// bitrate: whether a user-chosen bitrate applies to this codec
const AUDIO_CODECS = {
  mp3: { args: "-c:a libmp3lame", bitrate: true },
  wav: { args: "-c:a pcm_s16le" },
  ogg: { args: "-c:a libvorbis", bitrate: true },
  m4a: { args: "-c:a aac", bitrate: true },
  m4r: { args: "-c:a aac -f ipod", bitrate: true }, // FIX: .m4r isn't a known extension, so force the container
  opus: { args: "-c:a libopus", bitrate: true },
  flac: { args: "-c:a flac" },
  aac: { args: "-c:a aac", bitrate: true },
  aiff: { args: "-c:a pcm_s16be" },
  amr: { args: "-c:a libopencore_amrnb -ar 8000 -ac 1 -b:a 12.2k" }, // FIX: AMR needs its own codec and fixed settings
  wma: { args: "-c:a wmav2", bitrate: true },
};

async function processAudioConverter(p) {
  const want = String(
    p.options.outputFormat || p.tool.replace("-converter", ""),
  ).toLowerCase();
  const ext = AUDIO_CODECS[want] ? want : "mp3";
  const spec = AUDIO_CODECS[ext];
  const bitrate = /^\d{2,3}k$/.test(String(p.options.bitrate))
    ? p.options.bitrate
    : "192k";
  const br = spec.bitrate ? ` -b:a ${bitrate}` : "";
  return ffmpeg(
    p,
    `-i input -vn ${spec.args}${br} output.${ext}`,
    named(p.fileName, `.${ext}`),
    getMimeType(ext),
  );
}

async function processCutAudio(p) {
  const start = Math.max(0, num(p.options.startTime, 0));
  const end = num(p.options.endTime, 30);
  if (end <= start) throw new Error("End time must be after the start time.");
  // FIX: stream copy only works when the output keeps the input's format; otherwise re-encode to mp3
  const srcExt = (p.fileName.match(/\.([^.]+)$/) || [])[1]?.toLowerCase();
  const keep = AUDIO_CODECS[srcExt] ? srcExt : null;
  const ext = keep || "mp3";
  const codec = keep ? "-c copy" : "-c:a libmp3lame";
  return ffmpeg(
    p,
    `-ss ${start} -i input -t ${end - start} ${codec} output.${ext}`,
    named(p.fileName, `_cut.${ext}`),
    getMimeType(ext),
  );
}

async function processMergeAudio(p) {
  const keys = extraKeysFor(p, "at least two audio files", 1).slice(0, 19);
  const n = keys.length + 1;
  const idx = [...Array(n).keys()];
  const inputs = ["-i input", ...keys.map((_, i) => `-i input_${i + 1}`)].join(
    " ",
  );
  const af = idx.map(
    (i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`,
  );
  const command = `${inputs} -filter_complex "${af.join(";")};${idx.map((i) => `[a${i}]`).join("")}concat=n=${n}:v=0:a=1[a]" -map "[a]" -c:a libmp3lame -b:a 192k output.mp3`;
  return ffmpeg(p, command, named(p.fileName, "_merged.mp3"), "audio/mpeg", {
    extraKeys: keys,
  });
}

async function processRecorderUpload(p) {
  // Already uploaded to R2: return the stored file as the result
  const obj = await p.env.FILES.get(p.inputKey);
  if (!obj) throw new Error("Upload not found");
  return {
    buffer: await obj.arrayBuffer(),
    fileName: p.fileName || "recording.webm",
    contentType: p.fileType || "video/webm",
  };
}

// ─── Image processor ──────────────────────────────────────────────────────────

const IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "heic",
  "svg",
];

async function processImageConverter(p) {
  const want = String(
    p.options.outputFormat || p.tool.replace("-converter", ""),
  ).toLowerCase();
  const ext = IMAGE_FORMATS.includes(want) ? want : "jpg";
  const q = p.options.quality
    ? clamp(num(p.options.quality, 90), 1, 100)
    : null;
  let quality = "";
  if (q && (ext === "jpg" || ext === "jpeg"))
    quality = `-q:v ${clamp(Math.round((100 - q) / 5 + 1), 2, 31)}`;
  if (q && ext === "webp") quality = `-quality ${q}`;
  return ffmpeg(
    p,
    `-i input ${quality} output.${ext}`,
    named(p.fileName, `.${ext}`),
    getMimeType(ext),
  );
}

// ─── AI processors ────────────────────────────────────────────────────────────

// FIX: Whisper wants ISO codes ("en"), but the UI sends names ("English"); slice(0, 2) turned "Spanish" into "sp"
const LANG_CODES = {
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  portuguese: "pt",
  dutch: "nl",
  russian: "ru",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  arabic: "ar",
  hindi: "hi",
  turkish: "tr",
  polish: "pl",
  ukrainian: "uk",
  swedish: "sv",
  indonesian: "id",
  vietnamese: "vi",
  thai: "th",
  hebrew: "he",
  greek: "el",
  czech: "cs",
  romanian: "ro",
  hungarian: "hu",
  swahili: "sw",
  shona: "sn",
};
function langCode(label) {
  const l = String(label || "")
    .toLowerCase()
    .trim();
  if (!l || l.startsWith("auto")) return "";
  if (/^[a-z]{2}$/.test(l)) return l;
  return LANG_CODES[l.split(/[ (]/)[0]] || "";
}

// FIX: the API accepts text|srt|vtt|json (not "txt"), and an empty language value is rejected
const WHISPER_FORMATS = {
  txt: "text",
  text: "text",
  srt: "srt",
  vtt: "vtt",
  json: "json",
};
const FORMAT_EXT = { text: "txt", srt: "srt", vtt: "vtt", json: "json" };

async function whisper(
  env,
  audioKey,
  { endpoint = "transcriptions", language = "", format = "text" } = {},
) {
  if (!env.AI_API_KEY) throw new Error("AI_API_KEY not configured");
  const obj = await env.FILES.get(audioKey);
  if (!obj) throw new Error("Audio file not found in storage");

  const fd = new FormData();
  fd.append("file", new Blob([await obj.arrayBuffer()]), "audio.mp3");
  fd.append("model", "whisper-1");
  fd.append("response_format", format);
  if (language && endpoint === "transcriptions")
    fd.append("language", language);

  const res = await fetch(`https://api.openai.com/v1/audio/${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.AI_API_KEY}` },
    body: fd,
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    throw new Error(
      `${endpoint === "translations" ? "Translation" : "Transcription"} failed: ${detail}`,
    );
  }
  return res.text();
}

// FIX: extract a small mono MP3 and SAVE it to R2 (the old code never stored it, so the next step found nothing)
async function extractAudio(p) {
  const audioKey = p.inputKey.replace(/[^/]+$/, "") + "extracted_audio.mp3";
  const buffer = await callFFmpeg({
    env: p.env,
    inputKey: p.inputKey,
    command: "-i input -vn -ac 1 -ar 16000 -b:a 64k output.mp3",
    outputFileName: "audio.mp3",
  });
  if (buffer.byteLength > 25 * 1024 * 1024) {
    throw new Error(
      "This file is too long to transcribe (limit is about 50 minutes of audio).",
    );
  }
  await p.env.FILES.put(audioKey, buffer, {
    httpMetadata: { contentType: "audio/mpeg" },
  });
  return audioKey;
}

const textResult = (text, fileName, ext) => ({
  buffer: encode(text),
  fileName,
  contentType: getMimeType(ext),
});

async function processAudioToText(p) {
  const format =
    WHISPER_FORMATS[String(p.options.format || "txt").toLowerCase()] || "text";
  const ext = FORMAT_EXT[format];
  const audioKey = await extractAudio(p);
  const text = await whisper(p.env, audioKey, {
    language: langCode(p.options.language),
    format,
  });
  return textResult(text, named(p.fileName, `.${ext}`), ext);
}

// Video and audio both go through the same extract → transcribe path
async function processVideoToText(p) {
  return processAudioToText(p);
}

async function processAutoSubtitleGenerator(p) {
  const audioKey = await extractAudio(p);
  const srt = await whisper(p.env, audioKey, {
    language: langCode(p.options.language),
    format: "srt",
  });
  return textResult(srt, named(p.fileName, ".srt"), "srt");
}

async function processAudioTranslator(p) {
  const format =
    WHISPER_FORMATS[String(p.options.format || "txt").toLowerCase()] || "text";
  const ext = FORMAT_EXT[format];
  const audioKey = await extractAudio(p);
  const text = await whisper(p.env, audioKey, {
    endpoint: "translations",
    format,
  });
  return textResult(text, named(p.fileName, `_translation.${ext}`), ext);
}

// Translate SRT text cue by cue (timestamps untouched) into another language
async function translateSrt(env, srt, language) {
  const lang =
    String(language)
      .replace(/[^\p{L} ()-]/gu, "")
      .slice(0, 40) || "English";
  const cues = srt.trim().split(/\n\s*\n/);
  const out = [];
  for (let i = 0; i < cues.length; i += 80) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Translate the subtitle text into ${lang}. Keep every cue number and timestamp line exactly as given. Return only the SRT.`,
          },
          { role: "user", content: cues.slice(i, i + 80).join("\n\n") },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Subtitle translation failed (${res.status})`);
    const data = await res.json();
    out.push(data.choices[0].message.content.trim());
  }
  return out.join("\n\n") + "\n";
}

// FIX: previously produced a transcript in the ORIGINAL language and never passed any SRT to FFmpeg
async function burnTranslatedSubtitles(p, targetLanguage) {
  const audioKey = await extractAudio(p);
  let srt = await whisper(p.env, audioKey, {
    endpoint: "translations",
    format: "srt",
  }); // → English
  if (!srt.trim()) throw new Error("No speech was detected in this video.");
  if (!/^english/i.test(targetLanguage))
    srt = await translateSrt(p.env, srt, targetLanguage);

  const command = `-i input -vf "subtitles=input_1" -c:a copy output.mp4`;
  return ffmpeg(p, command, named(p.fileName, "_translated.mp4"), "video/mp4", {
    extraFiles: [{ name: "translated.srt", data: encode(srt) }],
  });
}

async function processTranslateEnglishVideo(p) {
  return burnTranslatedSubtitles(p, "English");
}

async function processVideoTranslator(p) {
  const target =
    p.options.targetLanguage ||
    p.options.language ||
    p.options.target ||
    "English";
  return burnTranslatedSubtitles(p, String(target));
}

async function processTextToSpeech(p) {
  const { env, text, options } = p;
  if (!text || !text.trim()) throw new Error("No text provided");
  if (text.length > 4096)
    throw new Error("Text is too long. The limit is 4,096 characters.");
  if (!env.AI_API_KEY) throw new Error("AI_API_KEY not configured");

  const voiceMap = {
    "Male (US)": "onyx",
    "Female (US)": "nova",
    "Male (UK)": "echo",
    "Female (UK)": "shimmer",
    "Male (AU)": "fable",
    "Female (AU)": "alloy",
  };
  const voice = voiceMap[options.voice] || "nova";
  const speed = clamp(num(options.speed, 100) / 100, 0.25, 4);

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "tts-1", input: text, voice, speed }),
  });
  if (!res.ok)
    throw new Error(
      `Text-to-speech failed: ${(await res.text()).slice(0, 200)}`,
    );

  return {
    buffer: await res.arrayBuffer(),
    fileName: "speech.mp3",
    contentType: "audio/mpeg",
  };
}
