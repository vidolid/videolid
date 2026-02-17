import React, { useState } from 'react';
const ToolsGallery = () => {
  const tools = [
    { href: '/video-editor', image: '/images/video-editor.png', title: 'Video editor', description: 'Your online all-in-one video editor. Combine and manage video, images, text and music in the multi-track timeline.' },
    { href: '/add-subtitles-to-video', image: '/images/add-subtitles.png', title: 'Add subtitles', description: 'The tool allows you to add subtitles to a video of any format, and personalize the text font.' },
    { href: '/compress-video', image: '/images/compress-video.jpg', title: 'Compress video', description: 'Use this tool to compress a video of any format quickly and easily.' },
    // Add more tools...
  ];

  return (
    <div className="full-width-box all-tools-section">
      <div className="pageToolsHero">
        <h1 className="pageToolsHero__title">Videolid Tools</h1>
        <h2 className="pageToolsHero__subtitle">Easy-to-use online tools for creating media content</h2>
        <div className="pageToolsHero__searchInput">
          <div className="pageToolsSearchInput">
            <input className="pageToolsSearchInput__input" type="search" placeholder="Search tools" />
            <img className="pageToolsSearchInput__icon" src="/assets/images/landing/magnifier.svg" alt="magnifier" width="14" height="14" />
          </div>
        </div>
      </div>

      <div className="pageToolsGalleryLayout">
        {tools.map((tool, index) => (
          <a key={index} href={tool.href} className="pageToolsGalleryLink">
            <span className="pageToolsGalleryLink__image">
              <div className="pageToolsGalleryLinkImage">
                <img className="pageToolsGalleryLinkImage__image" src={tool.image} alt="" />
              </div>
            </span>
            <span className="pageToolsGalleryLink__title">{tool.title}</span>
            <span className="pageToolsGalleryLink__description">{tool.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
export default ToolsGallery;