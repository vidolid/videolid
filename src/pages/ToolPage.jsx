// src/pages/ToolPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import toolsConfig from "../data/toolsConfig";
import "./ToolPage.css";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://videolid-api.vidolid.workers.dev";

const ToolPage = () => {
  const { toolSlug } = useParams();
  const config = toolsConfig[toolSlug];

  if (!config) return <NotFound />;
  if (config.isIndex) return <ToolsIndex />;

  return config.isRecorder ? (
    <RecorderPage config={config} toolSlug={toolSlug} />
  ) : config.isTextInput ? (
    <TextInputPage config={config} toolSlug={toolSlug} />
  ) : (
    <UploadPage config={config} toolSlug={toolSlug} />
  );
};

// ─── API helpers (shared by all three tool pages) ─────────────────────────────

// Sends the Firebase token when someone is signed in, so the Worker applies their plan.
// Signed-out visitors get no header and are treated as the free tier.
const authHeaders = async () => {
  try {
    const user = getAuth().currentUser;
    return user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
  } catch {
    return {};
  }
};

// File names can contain spaces, %, # etc., so encode each path segment
const downloadUrl = (fileId) =>
  `${API_BASE}/api/download/${fileId.split("/").map(encodeURIComponent).join("/")}`;

// Starts a job, polls until it finishes, and returns the download URL.
// `init` is the fetch init for POST /api/process (FormData or JSON body).
const runJob = async (init, onProgress) => {
  const res = await fetch(`${API_BASE}/api/process`, {
    ...init,
    headers: { ...(await authHeaders()), ...init.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Processing failed");
  }

  const { jobId } = await res.json();
  onProgress?.(50);

  let failedPolls = 0;
  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    let data;
    try {
      data = await (await fetch(`${API_BASE}/api/status/${jobId}`)).json();
      failedPolls = 0;
    } catch {
      // Tolerate a dropped request or two before giving up
      if (++failedPolls >= 3)
        throw new Error("Lost connection. Please try again.");
      continue;
    }
    if (data.status === "done") {
      onProgress?.(100);
      return downloadUrl(data.fileId);
    }
    if (data.status === "error")
      throw new Error(data.error || "Processing failed");
    onProgress?.(50 + Math.min(40, i * 2));
  }
  throw new Error("Processing timed out. Please try again.");
};

const PageHeader = ({ config }) => (
  <div className="tool-page__header">
    <span className="tool-page__icon">{config.icon}</span>
    <div>
      <h1 className="tool-page__title">{config.title}</h1>
      <p className="tool-page__description">{config.description}</p>
    </div>
  </div>
);

// ─── Upload-based Tool Page ───────────────────────────────────────────────────
// Optional config.extraFile = { label: 'Audio file', accept: '.mp3,.wav' } adds a second picker
// for tools that need a different kind of file next to the main one (audio, overlay image, subtitles).
const UploadPage = ({ config, toolSlug }) => {
  const [files, setFiles] = useState([]);
  const [extra, setExtra] = useState(null);
  const [options, setOptions] = useState(buildDefaultOptions(config.options));
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef();
  const extraInputRef = useRef();

  const pickFiles = (list) => {
    const picked = Array.from(list);
    setFiles(config.multipleFiles ? picked : picked.slice(0, 1));
    setStatus("idle");
    setResultUrl(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    pickFiles(e.dataTransfer.files);
  };

  const reset = () => {
    setFiles([]);
    setExtra(null);
    setStatus("idle");
    setResultUrl(null);
  };

  const ready = files.length > 0 && (!config.extraFile || extra);

  const handleProcess = async () => {
    if (!ready) return;
    setStatus("uploading");
    setProgress(10);
    setErrorMsg("");

    try {
      // Order matters: the Worker treats the first file as the main one
      const formData = new FormData();
      [...files, ...(extra ? [extra] : [])].forEach((f, i) =>
        formData.append(i === 0 ? "file" : `file_${i}`, f),
      );
      formData.append("tool", toolSlug);
      formData.append("options", JSON.stringify(options));
      if (config.fixedOutput)
        formData.append("outputFormat", config.fixedOutput);

      setProgress(30);
      const url = await runJob({ method: "POST", body: formData }, (p) => {
        setProgress(p);
        setStatus((s) => (s === "uploading" ? "processing" : s));
      });
      setResultUrl(url);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="tool-page">
      <PageHeader config={config} />

      <div className="tool-page__body">
        {/* Upload Area */}
        {status === "idle" || status === "error" ? (
          <div
            className="tool-upload-zone"
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              fileInputRef.current?.click()
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={config.acceptedFormats}
              multiple={config.multipleFiles}
              onChange={(e) => pickFiles(e.target.files)}
              style={{ display: "none" }}
            />
            {files.length ? (
              <div className="tool-upload-zone__files">
                {files.map((f, i) => (
                  <div key={i} className="tool-upload-zone__file">
                    <span>📄</span>
                    <span>{f.name}</span>
                    <span className="tool-upload-zone__file-size">
                      ({(f.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tool-upload-zone__placeholder">
                <span className="tool-upload-zone__icon">☁️</span>
                <p className="tool-upload-zone__text">
                  {config.multipleFiles
                    ? "Drop files here or click to upload"
                    : "Drop your file here or click to upload"}
                </p>
                <p className="tool-upload-zone__hint">
                  Accepts: {config.acceptedFormats?.replace(/,/g, ", ")}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Second file picker (audio track, overlay image, subtitles...) */}
        {config.extraFile && files.length > 0 && status === "idle" && (
          <>
            <input
              ref={extraInputRef}
              type="file"
              accept={config.extraFile.accept}
              onChange={(e) => setExtra(e.target.files[0] || null)}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="tool-btn tool-btn--secondary"
              onClick={() => extraInputRef.current?.click()}
            >
              {extra
                ? `${config.extraFile.label}: ${extra.name}`
                : `➕ Choose ${config.extraFile.label}`}
            </button>
          </>
        )}

        {/* Options */}
        {files.length > 0 &&
          config.options?.length > 0 &&
          status === "idle" && (
            <div className="tool-options">
              <h3 className="tool-options__title">Options</h3>
              <div className="tool-options__grid">
                {config.options.map((opt) => (
                  <OptionControl
                    key={opt.id}
                    option={opt}
                    value={options[opt.id]}
                    onChange={(val) =>
                      setOptions((prev) => ({ ...prev, [opt.id]: val }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

        {/* Process Button */}
        {files.length > 0 && status === "idle" && (
          <button
            className="tool-btn tool-btn--primary"
            onClick={handleProcess}
            disabled={!ready}
          >
            {config.icon} {config.title}
          </button>
        )}

        {/* Progress */}
        {(status === "uploading" || status === "processing") && (
          <div className="tool-progress">
            <div className="tool-progress__bar">
              <div
                className="tool-progress__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="tool-progress__label">
              {status === "uploading"
                ? "Uploading..."
                : `Processing... ${progress}%`}
            </p>
          </div>
        )}

        {/* Result */}
        {status === "done" && resultUrl && (
          <div className="tool-result">
            <span className="tool-result__icon">✅</span>
            <p className="tool-result__title">Done! Your file is ready.</p>
            <a href={resultUrl} download className="tool-btn tool-btn--success">
              ⬇️ Download
            </a>
            <button className="tool-btn tool-btn--secondary" onClick={reset}>
              Process Another File
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="tool-error">
            <span>❌</span>
            <p>{errorMsg}</p>
            <button
              className="tool-btn tool-btn--secondary"
              onClick={() => setStatus("idle")}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Text Input Tool Page (e.g. Text to Speech) ───────────────────────────────
const TextInputPage = ({ config, toolSlug }) => {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(buildDefaultOptions(config.options));
  const [status, setStatus] = useState("idle");
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleProcess = async () => {
    if (!text.trim()) return;
    setStatus("processing");
    setErrorMsg("");
    try {
      // The Worker answers with a job id, so this must poll just like the upload tools
      const url = await runJob({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: toolSlug, text, options }),
      });
      setResultUrl(url);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="tool-page">
      <PageHeader config={config} />
      <div className="tool-page__body">
        <textarea
          className="tool-textarea"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          maxLength={config.maxChars || 4096}
        />
        {config.options?.length > 0 && (
          <div className="tool-options">
            <h3 className="tool-options__title">Options</h3>
            <div className="tool-options__grid">
              {config.options.map((opt) => (
                <OptionControl
                  key={opt.id}
                  option={opt}
                  value={options[opt.id]}
                  onChange={(val) =>
                    setOptions((prev) => ({ ...prev, [opt.id]: val }))
                  }
                />
              ))}
            </div>
          </div>
        )}
        {status === "idle" && (
          <button
            className="tool-btn tool-btn--primary"
            onClick={handleProcess}
            disabled={!text.trim()}
          >
            {config.icon} {config.buttonLabel || "Convert to Speech"}
          </button>
        )}
        {status === "processing" && (
          <p className="tool-progress__label">Processing...</p>
        )}
        {status === "done" && resultUrl && (
          <div className="tool-result">
            <p className="tool-result__title">✅ Done!</p>
            <a href={resultUrl} download className="tool-btn tool-btn--success">
              ⬇️ Download Audio
            </a>
            <button
              className="tool-btn tool-btn--secondary"
              onClick={() => {
                setText("");
                setStatus("idle");
                setResultUrl(null);
              }}
            >
              Start Over
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="tool-error">
            <p>{errorMsg}</p>
            <button
              className="tool-btn tool-btn--secondary"
              onClick={() => setStatus("idle")}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Recorder Tool Page ───────────────────────────────────────────────────────
const RecorderPage = ({ config, toolSlug }) => {
  const [recording, setRecording] = useState(false);
  const [mediaURL, setMediaURL] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingRef = useRef({ blob: null, ext: "webm" });

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      let stream;
      if (
        toolSlug === "screen-recorder" ||
        toolSlug === "presentation-recorder"
      ) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } else if (toolSlug === "webcam-recorder") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        // Use the type the browser really recorded (Safari makes MP4, others WebM)
        const mime = (recorder.mimeType || "video/webm").split(";")[0];
        const blob = new Blob(chunksRef.current, { type: mime });
        recordingRef.current = {
          blob,
          ext: mime.includes("mp4") ? "mp4" : "webm",
        };
        setMediaURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        // Also runs when the user ends screen sharing from the browser's own "Stop sharing" button
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      alert("Could not access device: " + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const recordAgain = () => {
    if (mediaURL) URL.revokeObjectURL(mediaURL);
    setMediaURL(null);
    setResultUrl(null);
    setUploadStatus("idle");
  };

  const uploadRecording = async () => {
    const { blob, ext } = recordingRef.current;
    if (!blob) return;
    setUploadStatus("uploading");
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", blob, `recording.${ext}`);
    formData.append("tool", toolSlug);
    formData.append("options", JSON.stringify({}));
    try {
      setResultUrl(await runJob({ method: "POST", body: formData }));
      setUploadStatus("done");
    } catch (err) {
      setUploadStatus("error");
      setErrorMsg(err.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="tool-page">
      <PageHeader config={config} />
      <div className="tool-page__body">
        {!recording && !mediaURL && (
          <button
            className="tool-btn tool-btn--primary tool-btn--large"
            onClick={startRecording}
          >
            🔴 Start Recording
          </button>
        )}
        {recording && (
          <button
            className="tool-btn tool-btn--danger tool-btn--large"
            onClick={stopRecording}
          >
            ⏹ Stop Recording
          </button>
        )}
        {mediaURL && !recording && (
          <div className="tool-recorder__preview">
            {toolSlug === "audio-recorder" ? (
              <audio src={mediaURL} controls className="tool-recorder__audio" />
            ) : (
              <video src={mediaURL} controls className="tool-recorder__video" />
            )}
            <div className="tool-recorder__actions">
              <a
                href={mediaURL}
                download={`recording.${recordingRef.current.ext}`}
                className="tool-btn tool-btn--success"
              >
                ⬇️ Download Recording
              </a>
              <button
                className="tool-btn tool-btn--primary"
                onClick={uploadRecording}
                disabled={uploadStatus === "uploading"}
              >
                ☁️ Save & Process
              </button>
              <button
                className="tool-btn tool-btn--secondary"
                onClick={recordAgain}
              >
                🔄 Record Again
              </button>
            </div>
          </div>
        )}
        {uploadStatus === "uploading" && (
          <p className="tool-progress__label">Uploading and processing...</p>
        )}
        {uploadStatus === "error" && <p className="tool-error">{errorMsg}</p>}
        {uploadStatus === "done" && resultUrl && (
          <div className="tool-result">
            <p className="tool-result__title">✅ Saved!</p>
            <a href={resultUrl} download className="tool-btn tool-btn--success">
              ⬇️ Download Processed File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Google AdSense unit ──────────────────────────────────────────────────────
// Needs the AdSense <script> in index.html. The ad slot only fills once adsbygoogle.push() runs.
const AdUnit = ({ slot }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocker or already initialised */
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3836811743595012"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

// ─── All Tools Index ──────────────────────────────────────────────────────────
const ToolsIndex = () => {
  const [search, setSearch] = useState("");
  const allTools = Object.entries(toolsConfig).filter(([, c]) => !c.isIndex);
  const q = search.toLowerCase();
  const filtered = allTools.filter(
    ([, c]) =>
      c.title.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q),
  );

  // Group by category
  const grouped = filtered.reduce((acc, [slug, config]) => {
    const cat = config.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ slug, ...config });
    return acc;
  }, {});

  return (
    <div className="tools-index">
      <div className="tools-index__header">
        <h1>All Tools</h1>
        <p>Browse all {allTools.length} tools</p>
        <input
          className="tools-index__search"
          type="search"
          placeholder="Search tools..."
          aria-label="Search tools"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="tools-index__category">
          <h2 className="tools-index__category-title">{category}</h2>
          <div className="tools-index__grid">
            {items.map(({ slug, title, description, icon }) => (
              <Link key={slug} to={`/${slug}`} className="tools-index__card">
                <span className="tools-index__card-icon">{icon}</span>
                <span className="tools-index__card-title">{title}</span>
                <span className="tools-index__card-desc">{description}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <AdUnit slot="2404764141" />
    </div>
  );
};

// ─── Option Control ───────────────────────────────────────────────────────────
const OptionControl = ({ option, value, onChange }) => {
  switch (option.type) {
    case "range":
      return (
        <label className="tool-option">
          <span className="tool-option__label">
            {option.label}:{" "}
            <strong>
              {value}
              {option.unit || ""}
            </strong>
          </span>
          <input
            type="range"
            min={option.min}
            max={option.max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="tool-option__range"
          />
        </label>
      );
    case "select":
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="tool-option__select"
          >
            {option.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      );
    case "checkbox":
      return (
        <label className="tool-option tool-option--checkbox">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="tool-option__label">{option.label}</span>
        </label>
      );
    case "color":
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="tool-option__color"
          />
        </label>
      );
    case "number":
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input
            type="number"
            min={option.min}
            max={option.max}
            value={value}
            placeholder={option.placeholder}
            onChange={(e) => onChange(Number(e.target.value))}
            className="tool-option__input"
          />
        </label>
      );
    case "text":
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input
            type="text"
            value={value}
            placeholder={option.placeholder || option.default}
            onChange={(e) => onChange(e.target.value)}
            className="tool-option__input"
          />
        </label>
      );
    default:
      return null;
  }
};

// ─── Not Found ────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="tool-not-found">
    <h1>404 — Tool Not Found</h1>
    <Link to="/tools">Browse All Tools →</Link>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Every control needs a real starting value, otherwise the UI shows one thing
// (e.g. a select's first option) while the Worker receives an empty string.
const defaultFor = (o) => {
  if (o.default !== undefined) return o.default;
  switch (o.type) {
    case "select":
      return o.options?.[0] ?? "";
    case "checkbox":
      return false;
    case "range":
    case "number":
      return o.min ?? 0;
    case "color":
      return "#ffffff";
    default:
      return "";
  }
};

const buildDefaultOptions = (options = []) =>
  options.reduce((acc, o) => ({ ...acc, [o.id]: defaultFor(o) }), {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default ToolPage;
