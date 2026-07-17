import React, { useState, useRef, useEffect } from 'react';

// Each entry mirrors the data-src-* / data-type-* attributes from the
// original Clideo markup: three encodings per video (av1, hvc, avc)
// so the browser can pick whichever codec it supports.
const VIDEOS = [
  {
    label: 'Loop',
    av1: 'https://static.clideo.com/media/loop-video.av1.mp4',
    hvc: 'https://static.clideo.com/media/loop-video.hvc.mp4',
    avc: 'https://static.clideo.com/media/loop-video.avc.mp4',
  },
  {
    label: 'Stop motion',
    av1: 'https://static.clideo.com/media/stop-motion-processed.av1.mp4',
    hvc: 'https://static.clideo.com/media/stop-motion-processed.hvc.mp4',
    avc: 'https://static.clideo.com/media/stop-motion-processed.avc.mp4',
  },
  {
    label: 'Reverse',
    av1: 'https://static.clideo.com/media/reverse-video.av1.mp4',
    hvc: 'https://static.clideo.com/media/reverse-video.hvc.mp4',
    avc: 'https://static.clideo.com/media/reverse-video.avc.mp4',
  },
  {
    label: 'Meme',
    av1: 'https://static.clideo.com/media/meme-maker-processed.av1.mp4',
    hvc: 'https://static.clideo.com/media/meme-maker-processed.hvc.mp4',
    avc: 'https://static.clideo.com/media/meme-maker-processed.avc.mp4',
  },
  {
    label: 'Speed',
    av1: 'https://static.clideo.com/media/slow-motion-index.av1.mp4',
    hvc: 'https://static.clideo.com/media/slow-motion-index.hvc.mp4',
    avc: 'https://static.clideo.com/media/slow-motion-index.avc.mp4',
  },
];

const VideoExamples = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  const current = VIDEOS[currentIndex];

  // Whenever the selected video changes, the <source> tags below get new
  // src values, but a <video> won't pick those up on its own — it needs
  // an explicit .load() to re-fetch, then we resume playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    video.load();

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false)); // autoplay can be blocked by the browser
    }
  }, [currentIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="full-width-box landing-video-examples">
      <div className="container text-center">
        <div className="video-examples no-select">
          <h2 className="section-title">Made with our tools</h2>

          <div className="ui-player-wrapper">
            <div className="ui-player">
              <video
                ref={videoRef}
                preload="auto"
                loop
                muted
                playsInline
                webkit-playsinline="true"
                className={`is-loaded${isPlaying ? ' is-playing' : ''}`}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
              >
                <source data-type="av1" src={current.av1} type="video/mp4; codecs=av01.0.04M.08" />
                <source data-type="hvc" src={current.hvc} type="video/mp4; codecs=hvc1.1.6.L90.90" />
                <source data-type="avc" src={current.avc} type="video/mp4; codecs=avc1.42C01E" />
              </video>

              {isLoading && <div className="spinner-border" />}

              <div className="media-controls" onClick={togglePlay}>
                <span className={isPlaying ? 'mc-pause' : 'mc-play'} />
              </div>
            </div>
          </div>

          <div className="video-list">
            <ul>
              {VIDEOS.map((video, index) => (
                <li
                  key={video.label}
                  className={index === currentIndex ? 'current' : ''}
                  onClick={() => setCurrentIndex(index)}
                >
                  {video.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoExamples;