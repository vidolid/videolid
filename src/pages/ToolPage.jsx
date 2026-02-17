// src/pages/ToolPage.jsx
import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toolsConfig from '../data/toolsConfig';
import './ToolPage.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-worker.workers.dev';

const ToolPage = () => {
  const { toolSlug } = useParams();
  const config = toolsConfig[toolSlug];

  if (!config) return <NotFound />;
  if (config.isIndex) return <ToolsIndex />;

  return config.isRecorder
    ? <RecorderPage config={config} toolSlug={toolSlug} />
    : config.isTextInput
    ? <TextInputPage config={config} toolSlug={toolSlug} />
    : <UploadPage config={config} toolSlug={toolSlug} />;
};

// ─── Upload-based Tool Page ───────────────────────────────────────────────────
const UploadPage = ({ config, toolSlug }) => {
  const [files, setFiles]         = useState([]);
  const [options, setOptions]     = useState(buildDefaultOptions(config.options));
  const [status, setStatus]       = useState('idle'); // idle | uploading | processing | done | error
  const [progress, setProgress]   = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [jobId, setJobId]         = useState(null);
  const fileInputRef              = useRef();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setStatus('idle');
    setResultUrl(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(dropped);
    setStatus('idle');
    setResultUrl(null);
  };

  const handleOptionChange = (id, value) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleProcess = async () => {
    if (!files.length) return;
    setStatus('uploading');
    setProgress(10);
    setErrorMsg('');

    try {
      const formData = new FormData();
      files.forEach((f, i) => formData.append(i === 0 ? 'file' : `file_${i}`, f));
      formData.append('tool', toolSlug);
      formData.append('options', JSON.stringify(options));
      if (config.fixedOutput) formData.append('outputFormat', config.fixedOutput);

      setProgress(30);
      const res = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Processing failed');
      }

      const data = await res.json();
      setJobId(data.jobId);
      setStatus('processing');
      setProgress(50);

      // Poll for job completion
      await pollJobStatus(data.jobId, setProgress, setStatus, setResultUrl);

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  const pollJobStatus = async (id, setProgress, setStatus, setResultUrl) => {
    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      await sleep(2000);
      try {
        const res = await fetch(`${API_BASE}/api/status/${id}`);
        const data = await res.json();
        if (data.status === 'done') {
          setProgress(100);
          setStatus('done');
          setResultUrl(`${API_BASE}/api/download/${data.fileId}`);
          return;
        }
        if (data.status === 'error') {
          throw new Error(data.error || 'Processing failed');
        }
        setProgress(50 + Math.min(40, attempts * 2));
      } catch (e) {
        throw e;
      }
      attempts++;
    }
    throw new Error('Processing timed out. Please try again.');
  };

  return (
    <div className="tool-page">
      <div className="tool-page__header">
        <span className="tool-page__icon">{config.icon}</span>
        <div>
          <h1 className="tool-page__title">{config.title}</h1>
          <p className="tool-page__description">{config.description}</p>
        </div>
      </div>

      <div className="tool-page__body">
        {/* Upload Area */}
        {status === 'idle' || status === 'error' ? (
          <div
            className="tool-upload-zone"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={config.acceptedFormats}
              multiple={config.multipleFiles}
              onChange={handleFileChange}
              style={{ display: 'none' }}
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
                  {config.multipleFiles ? 'Drop files here or click to upload' : 'Drop your file here or click to upload'}
                </p>
                <p className="tool-upload-zone__hint">
                  Accepts: {config.acceptedFormats?.replace(/,/g, ', ')}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Options */}
        {files.length > 0 && config.options?.length > 0 && status === 'idle' && (
          <div className="tool-options">
            <h3 className="tool-options__title">Options</h3>
            <div className="tool-options__grid">
              {config.options.map(opt => (
                <OptionControl
                  key={opt.id}
                  option={opt}
                  value={options[opt.id]}
                  onChange={val => handleOptionChange(opt.id, val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        {files.length > 0 && status === 'idle' && (
          <button className="tool-btn tool-btn--primary" onClick={handleProcess}>
            {config.icon} {config.title}
          </button>
        )}

        {/* Progress */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="tool-progress">
            <div className="tool-progress__bar">
              <div
                className="tool-progress__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="tool-progress__label">
              {status === 'uploading' ? 'Uploading...' : `Processing... ${progress}%`}
            </p>
          </div>
        )}

        {/* Result */}
        {status === 'done' && resultUrl && (
          <div className="tool-result">
            <span className="tool-result__icon">✅</span>
            <p className="tool-result__title">Done! Your file is ready.</p>
            <a
              href={resultUrl}
              download
              className="tool-btn tool-btn--success"
            >
              ⬇️ Download
            </a>
            <button
              className="tool-btn tool-btn--secondary"
              onClick={() => { setFiles([]); setStatus('idle'); setResultUrl(null); }}
            >
              Process Another File
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="tool-error">
            <span>❌</span>
            <p>{errorMsg}</p>
            <button
              className="tool-btn tool-btn--secondary"
              onClick={() => setStatus('idle')}
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
  const [text, setText]           = useState('');
  const [options, setOptions]     = useState(buildDefaultOptions(config.options));
  const [status, setStatus]       = useState('idle');
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');

  const handleProcess = async () => {
    if (!text.trim()) return;
    setStatus('processing');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolSlug, text, options }),
      });
      if (!res.ok) throw new Error('Processing failed');
      const data = await res.json();
      setResultUrl(`${API_BASE}/api/download/${data.fileId}`);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-page__header">
        <span className="tool-page__icon">{config.icon}</span>
        <div>
          <h1 className="tool-page__title">{config.title}</h1>
          <p className="tool-page__description">{config.description}</p>
        </div>
      </div>
      <div className="tool-page__body">
        <textarea
          className="tool-textarea"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
        />
        {config.options?.length > 0 && (
          <div className="tool-options">
            <h3 className="tool-options__title">Options</h3>
            <div className="tool-options__grid">
              {config.options.map(opt => (
                <OptionControl
                  key={opt.id}
                  option={opt}
                  value={options[opt.id]}
                  onChange={val => setOptions(prev => ({ ...prev, [opt.id]: val }))}
                />
              ))}
            </div>
          </div>
        )}
        {status === 'idle' && (
          <button className="tool-btn tool-btn--primary" onClick={handleProcess} disabled={!text.trim()}>
            {config.icon} Convert to Speech
          </button>
        )}
        {status === 'processing' && <p className="tool-progress__label">Processing...</p>}
        {status === 'done' && resultUrl && (
          <div className="tool-result">
            <p className="tool-result__title">✅ Done!</p>
            <a href={resultUrl} download className="tool-btn tool-btn--success">⬇️ Download Audio</a>
            <button className="tool-btn tool-btn--secondary" onClick={() => { setText(''); setStatus('idle'); setResultUrl(null); }}>
              Start Over
            </button>
          </div>
        )}
        {status === 'error' && <p className="tool-error">{errorMsg}</p>}
      </div>
    </div>
  );
};

// ─── Recorder Tool Page ───────────────────────────────────────────────────────
const RecorderPage = ({ config, toolSlug }) => {
  const [recording, setRecording]   = useState(false);
  const [mediaURL, setMediaURL]     = useState(null);
  const [status, setStatus]         = useState('idle');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [resultUrl, setResultUrl]   = useState(null);
  const mediaRecorderRef            = useRef(null);
  const chunksRef                   = useRef([]);

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      let stream;
      if (toolSlug === 'screen-recorder' || toolSlug === 'presentation-recorder') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else if (toolSlug === 'webcam-recorder') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setMediaURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setRecording(true);
      setStatus('recording');
    } catch (err) {
      alert('Could not access device: ' + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setStatus('idle');
  };

  const uploadRecording = async () => {
    if (!mediaURL) return;
    setUploadStatus('uploading');
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('tool', toolSlug);
    formData.append('options', JSON.stringify({}));
    try {
      const res = await fetch(`${API_BASE}/api/process`, { method: 'POST', body: formData });
      const data = await res.json();
      setResultUrl(`${API_BASE}/api/download/${data.fileId}`);
      setUploadStatus('done');
    } catch (err) {
      setUploadStatus('error');
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-page__header">
        <span className="tool-page__icon">{config.icon}</span>
        <div>
          <h1 className="tool-page__title">{config.title}</h1>
          <p className="tool-page__description">{config.description}</p>
        </div>
      </div>
      <div className="tool-page__body">
        {!recording && !mediaURL && (
          <button className="tool-btn tool-btn--primary tool-btn--large" onClick={startRecording}>
            🔴 Start Recording
          </button>
        )}
        {recording && (
          <button className="tool-btn tool-btn--danger tool-btn--large" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}
        {mediaURL && (
          <div className="tool-recorder__preview">
            {toolSlug === 'audio-recorder'
              ? <audio src={mediaURL} controls className="tool-recorder__audio" />
              : <video src={mediaURL} controls className="tool-recorder__video" />
            }
            <div className="tool-recorder__actions">
              <a href={mediaURL} download="recording.webm" className="tool-btn tool-btn--success">
                ⬇️ Download Recording
              </a>
              <button className="tool-btn tool-btn--primary" onClick={uploadRecording}>
                ☁️ Save & Process
              </button>
              <button className="tool-btn tool-btn--secondary" onClick={() => { setMediaURL(null); setUploadStatus('idle'); }}>
                🔄 Record Again
              </button>
            </div>
          </div>
        )}
        {uploadStatus === 'uploading' && <p className="tool-progress__label">Uploading...</p>}
        {uploadStatus === 'done' && resultUrl && (
          <div className="tool-result">
            <p className="tool-result__title">✅ Saved!</p>
            <a href={resultUrl} download className="tool-btn tool-btn--success">⬇️ Download Processed File</a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── All Tools Index ──────────────────────────────────────────────────────────
const ToolsIndex = () => {
  const [search, setSearch] = useState('');
  const allTools = Object.entries(toolsConfig).filter(([, c]) => !c.isIndex);
  const filtered = allTools.filter(([slug, c]) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce((acc, [slug, config]) => {
    const cat = config.category || 'Other';
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
          value={search}
          onChange={e => setSearch(e.target.value)}
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
    </div>
  );
};

// ─── Option Control ───────────────────────────────────────────────────────────
const OptionControl = ({ option, value, onChange }) => {
  switch (option.type) {
    case 'range':
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}: <strong>{value}{option.unit || ''}</strong></span>
          <input type="range" min={option.min} max={option.max} value={value} onChange={e => onChange(Number(e.target.value))} className="tool-option__range" />
        </label>
      );
    case 'select':
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <select value={value} onChange={e => onChange(e.target.value)} className="tool-option__select">
            {option.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      );
    case 'checkbox':
      return (
        <label className="tool-option tool-option--checkbox">
          <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
          <span className="tool-option__label">{option.label}</span>
        </label>
      );
    case 'color':
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="tool-option__color" />
        </label>
      );
    case 'number':
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input type="number" min={option.min} max={option.max} value={value} placeholder={option.placeholder} onChange={e => onChange(Number(e.target.value))} className="tool-option__input" />
        </label>
      );
    case 'text':
      return (
        <label className="tool-option">
          <span className="tool-option__label">{option.label}</span>
          <input type="text" value={value} placeholder={option.placeholder || option.default} onChange={e => onChange(e.target.value)} className="tool-option__input" />
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
const buildDefaultOptions = (options = []) =>
  options.reduce((acc, o) => ({ ...acc, [o.id]: o.default ?? '' }), {});

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default ToolPage;