// src/components/ToolsGallery.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Converters share one pattern, so they are generated from format lists.
const makeConverters = (kind, formats) =>
  formats.map(([slug, label]) => ({
    slug: `${slug}-converter`,
    icon: kind.icon,
    title: `${label} converter`,
    description: `Convert ${kind.noun} files to ${label} online, quickly and for free.`,
  }));

const videoConverters = makeConverters({ icon: "🔄", noun: "video" }, [
  ["mp4", "MP4"],
  ["avi", "AVI"],
  ["mov", "MOV"],
  ["mkv", "MKV"],
  ["webm", "WEBM"],
  ["wmv", "WMV"],
  ["hevc", "HEVC"],
  ["m4v", "M4V"],
  ["ogv", "OGV"],
  ["ts", "TS"],
  ["asf", "ASF"],
  ["swf", "SWF"],
  ["vob", "VOB"],
  ["xvid", "XVID"],
  ["3gp", "3GP"],
]);

const audioConverters = makeConverters({ icon: "🎧", noun: "audio" }, [
  ["mp3", "MP3"],
  ["wav", "WAV"],
  ["ogg", "OGG"],
  ["m4a", "M4A"],
  ["m4r", "M4R"],
  ["opus", "OPUS"],
  ["flac", "FLAC"],
  ["aac", "AAC"],
  ["aiff", "AIFF"],
  ["amr", "AMR"],
  ["wma", "WMA"],
]);

const imageConverters = makeConverters({ icon: "🖼️", noun: "image" }, [
  ["jpg", "JPG"],
  ["png", "PNG"],
  ["webp", "WEBP"],
  ["gif", "GIF"],
  ["bmp", "BMP"],
  ["heic", "HEIC"],
  ["svg", "SVG"],
  ["tiff", "TIFF"],
]);

const tools = [
  // ── Video editing ──
  {
    slug: "video-editor",
    image: "/images/video-editor.png",
    icon: "🎬",
    title: "Video editor",
    description:
      "Your online all-in-one video editor. Combine and manage video, images, text and music in the multi-track timeline.",
  },
  {
    slug: "add-subtitles-to-video",
    image: "/images/add-subtitles.png",
    icon: "💬",
    title: "Add subtitles",
    description:
      "The tool allows you to add subtitles to a video of any format, and personalize the text font.",
  },
  {
    slug: "compress-video",
    image: "/images/compress-video.jpg",
    icon: "🗜️",
    title: "Compress video",
    description:
      "Use this tool to compress a video of any format quickly and easily.",
  },
  {
    slug: "add-audio-to-video",
    icon: "🎵",
    title: "Add audio to video",
    description:
      "Add music or a voice track to your video, and mix it with the original sound or replace it.",
  },
  {
    slug: "add-emojis-to-video",
    icon: "😀",
    title: "Add emojis to video",
    description: "Place emojis on your video to add personality and emphasis.",
  },
  {
    slug: "add-image-to-video",
    icon: "🖼️",
    title: "Add image to video",
    description:
      "Overlay a logo or image on your video and choose its position, size and opacity.",
  },
  {
    slug: "add-photo-to-video",
    icon: "📷",
    title: "Add photo to video",
    description:
      "Put a photo on top of your video and place it where you want it.",
  },
  {
    slug: "add-shapes-to-video",
    icon: "🔷",
    title: "Add shapes to video",
    description:
      "Draw colored shapes on your video to highlight or cover parts of the frame.",
  },
  {
    slug: "add-stickers-to-video",
    icon: "⭐",
    title: "Add stickers to video",
    description: "Decorate your video with stickers and image overlays.",
  },
  {
    slug: "add-text-to-video",
    icon: "🔤",
    title: "Add text to video",
    description:
      "Add text to your video with custom size, color, position and timing.",
  },
  {
    slug: "adjust-video",
    icon: "🎚️",
    title: "Adjust video",
    description:
      "Change the brightness, contrast, saturation and hue of your video.",
  },
  {
    slug: "change-video-speed",
    icon: "⏩",
    title: "Change video speed",
    description: "Speed your video up or slow it down, from 0.25x to 4x.",
  },
  {
    slug: "crop-video",
    icon: "✂️",
    title: "Crop video",
    description:
      "Crop your video to remove unwanted edges or change its shape.",
  },
  {
    slug: "cut-video",
    icon: "🎞️",
    title: "Cut video",
    description: "Trim your video by choosing a start and end time.",
  },
  {
    slug: "filter-video",
    icon: "🎨",
    title: "Filter video",
    description:
      "Apply filters like grayscale, sepia, vintage, warm and cool to your video.",
  },
  {
    slug: "flip-video",
    icon: "↔️",
    title: "Flip video",
    description: "Mirror your video horizontally, vertically or both.",
  },
  {
    slug: "loop-video",
    icon: "🔁",
    title: "Loop video",
    description: "Repeat your video as many times as you need.",
  },
  {
    slug: "meme-maker",
    icon: "😂",
    title: "Meme maker",
    description: "Add top and bottom text to a video or image to make a meme.",
  },
  {
    slug: "merge-video",
    icon: "🔗",
    title: "Merge video",
    description: "Join several video clips into one file.",
  },
  {
    slug: "mute-video",
    icon: "🔇",
    title: "Mute video",
    description: "Remove the audio track from your video.",
  },
  {
    slug: "resize-video",
    icon: "📐",
    title: "Resize video",
    description:
      "Change the width and height of your video for any screen or platform.",
  },
  {
    slug: "reverse-video",
    icon: "⏪",
    title: "Reverse video",
    description: "Play your video backwards, with or without audio.",
  },
  {
    slug: "rotate-video",
    icon: "🔃",
    title: "Rotate video",
    description: "Rotate your video by 90°, 180° or 270°.",
  },
  {
    slug: "slideshow-maker",
    icon: "🖼️",
    title: "Slideshow maker",
    description: "Turn your photos into a video slideshow.",
  },
  {
    slug: "split-video",
    icon: "🪓",
    title: "Split video",
    description: "Split your video into parts at the times you choose.",
  },
  {
    slug: "stop-motion",
    icon: "🧱",
    title: "Stop motion",
    description: "Turn a sequence of images into a stop-motion video.",
  },
  {
    slug: "video-maker",
    icon: "🎥",
    title: "Video maker",
    description: "Create a video from your images and clips in a few clicks.",
  },

  // ── GIF ──
  {
    slug: "gif-maker",
    icon: "👾",
    title: "GIF maker",
    description: "Turn any part of a video into an animated GIF.",
  },
  {
    slug: "gif-editor",
    icon: "🪄",
    title: "GIF editor",
    description: "Change the speed and size of your GIF.",
  },

  // ── Audio ──
  {
    slug: "cut-audio",
    icon: "🎼",
    title: "Cut audio",
    description: "Trim an audio file by choosing a start and end time.",
  },
  {
    slug: "merge-audio",
    icon: "🎶",
    title: "Merge audio",
    description: "Join several audio files into one.",
  },

  // ── Recorders ──
  {
    slug: "audio-recorder",
    icon: "🎙️",
    title: "Audio recorder",
    description: "Record audio from your microphone right in your browser.",
  },
  {
    slug: "screen-recorder",
    icon: "🖥️",
    title: "Screen recorder",
    description: "Record your screen with sound, with nothing to install.",
  },
  {
    slug: "presentation-recorder",
    icon: "📽️",
    title: "Presentation recorder",
    description:
      "Record your slides and voice to share a presentation as a video.",
  },
  {
    slug: "webcam-recorder",
    icon: "📹",
    title: "Webcam recorder",
    description: "Record video from your webcam and microphone.",
  },

  // ── AI tools ──
  {
    slug: "audio-to-text",
    icon: "📝",
    title: "Audio to text",
    description: "Transcribe speech from an audio file into text.",
  },
  {
    slug: "audio-translator",
    icon: "🌍",
    title: "Audio translator",
    description: "Translate spoken audio into English text.",
  },
  {
    slug: "auto-subtitle-generator",
    icon: "🤖",
    title: "Auto subtitle generator",
    description:
      "Generate subtitles for your video automatically from its speech.",
  },
  {
    slug: "text-to-speech",
    icon: "🗣️",
    title: "Text to speech",
    description:
      "Turn written text into natural-sounding speech and download it as audio.",
  },
  {
    slug: "translate-english-video",
    icon: "🌐",
    title: "Translate video to English",
    description: "Add English subtitles to a video in another language.",
  },
  {
    slug: "video-to-text",
    icon: "📄",
    title: "Video to text",
    description: "Get a text transcript of everything said in your video.",
  },
  {
    slug: "video-translator",
    icon: "🈯",
    title: "Video translator",
    description: "Translate the speech in your video and add subtitles.",
  },

  // ── Converters ──
  {
    slug: "video-converter",
    icon: "🔄",
    title: "Video converter",
    description: "Convert video between all popular formats.",
  },
  ...videoConverters,
  {
    slug: "audio-converter",
    icon: "🎧",
    title: "Audio converter",
    description: "Convert audio between all popular formats.",
  },
  ...audioConverters,
  {
    slug: "image-converter",
    icon: "🖼️",
    title: "Image converter",
    description: "Convert images between all popular formats.",
  },
  ...imageConverters,
  {
    slug: "dpi-converter",
    icon: "🔍",
    title: "DPI converter",
    description: "Change the DPI of an image for print or web.",
  },
];

const ToolsGallery = () => {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      )
    : tools;

  return (
    <div className="full-width-box all-tools-section">
      <div className="pageToolsHero">
        <h1 className="pageToolsHero__title">Videolid Tools</h1>
        <h2 className="pageToolsHero__subtitle">
          Easy-to-use online tools for creating media content
        </h2>
        <div className="pageToolsHero__searchInput">
          <div className="pageToolsSearchInput">
            <input
              className="pageToolsSearchInput__input"
              type="search"
              placeholder="Search tools"
              aria-label="Search tools"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <img
              className="pageToolsSearchInput__icon"
              src="/assets/images/landing/magnifier.svg"
              alt=""
              width="14"
              height="14"
            />
          </div>
        </div>
      </div>

      <div className="pageToolsGalleryLayout">
        {visible.map((tool) => (
          <Link
            key={tool.slug}
            to={`/${tool.slug}`}
            className="pageToolsGalleryLink"
          >
            <span className="pageToolsGalleryLink__image">
              <div className="pageToolsGalleryLinkImage">
                {tool.image ? (
                  <img
                    className="pageToolsGalleryLinkImage__image"
                    src={tool.image}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      minHeight: 120,
                      fontSize: 48,
                    }}
                  >
                    {tool.icon}
                  </div>
                )}
              </div>
            </span>
            <span className="pageToolsGalleryLink__title">{tool.title}</span>
            <span className="pageToolsGalleryLink__description">
              {tool.description}
            </span>
          </Link>
        ))}

        {visible.length === 0 && (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            No tools match "{query}". Try a format name like MP4, or an action
            like trim.
          </p>
        )}
      </div>
    </div>
  );
};

export default ToolsGallery;
