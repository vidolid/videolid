import React from 'react';
import { Link } from 'react-router-dom';  // ← This was missing

const Hero = () => {
  return (
<div className="full-width-box index-title">
        <div className="container">
             
            <div className="hero text-center">
              <div className="title text-center" style={{ color: '#014042' }}>
                <h1>Professional Editing, Simplified</h1>
                <h2>Transform your ideas into stunning visuals — no technical skills required.</h2>
              </div>
            </div>
        
         <nav className="tools-lists no-select">
  <ul style={{ margin: '20px' }}>
    {[
      ['video-editor', 'Video editor', (
        <>
          <rect x="10" y="13" width="32" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M21 19L33 26L21 33V19Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </>
      )],
      ['add-subtitles-to-video', 'Add subtitles', (
        <>
          <rect x="10" y="13" width="32" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M16 27H28M16 32H36M32 27H36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </>
      )],
      ['compress-video', 'Compress', (
        <path d="M19 19L12 12M19 19H13M19 19V13M33 19L40 12M33 19H39M33 19V13M19 33L12 40M19 33H13M19 33V39M33 33L40 40M33 33H39M33 33V39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      )],
      ['resize-video', 'Resize', (
        <path d="M10 10H22M10 10V22M10 10L20 20M42 10H30M42 10V22M42 10L32 20M10 42H22M10 42V30M10 42L20 32M42 42H30M42 42V30M42 42L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      )],
      ['cut-video', 'Cut', (
        <>
          <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="18" cy="34" r="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M22 21L38 12M22 29L38 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M12 26H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </>
      )],
    ].map(([slug, label, icon]) => (
      <li key={slug}>
        <Link to={`/${slug}`} className="item">
          <span>
            <i className="icon">
              <svg width="52px" height="52px" viewBox="0 0 52 52">
                {icon}
              </svg>
            </i>
            <span>{label}</span>
          </span>
        </Link>
      </li>
    ))}
  </ul>
</nav>
          <div className="Hero_hero__kXuIl">
            <div className="Hero_content___6Pbs">
              <div className="Hero_titleContainer__I5X5F">
                <div className="Breadcrumbs_container__10Z3y">
                  <a className="Breadcrumbs_lastBreadcrumbLink__FqWAy" href="/video-editor">
                    Video Editor
                  </a>
                </div>
                <div className="Hero_title__47F_l">
                  <h1 className="RichTextEditor_h1__O_jeG" dir="ltr">
                    <span>ONLINE VIDEO EDITOR</span>
                  </h1>
                </div>
              </div>
              <div className="Hero_ctaContainer__LIf1r">
                <a
                  className="Hero_cta__CM8UF"
                  data-testid="get-started-button"
                  href="https://www.videolid.com/studio/editor?redirect_source=%2Fvideo-editor&tooltip=editor&locale=en"
                >
                  Edit Video
                  <div className="Hero_icon__kGQOF">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
                    </svg>
                  </div>
                </a>
                <a
                  href="https://www.videolid.com/studio/editor?redirect_source=%2Fvideo-editor&tooltip=editor&sample=true&sample_type=default"
                  target="_self"
                  className="Hero_sample__yZLec"
                >
                  or, try a sample
                </a>
              </div>
            </div>
            <video poster="" autoPlay loop className="Hero_media__Iko0V" playsInline muted>
              <source src="/media/hero_image_template.mp4" />
            </video>
          </div>

         
        </div>
      </div>
      );
    };
export default Hero;