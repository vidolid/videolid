import React, { useState } from 'react';

const Hero = () => {
  return (
<div className="full-width-box index-title">
        <div className="container">
          <nav className="tools-lists no-select">
            <ul style={{ margin: '20px' }}>
              <li>
                <a href="/video-editor" className="item">
                  <span>
                    <i className="icon">
                      <svg width="80px" height="80px" viewBox="0 0 52 52">
                        <path d="M21 33.171L33.397 26L21 18.829V33.171ZM23 22.296L29.403 26L23 29.704V22.296ZM37 13H15C12.243 13 10 15.243 10 18V34C10 36.757 12.243 39 15 39H37C39.757 39 42 36.757 42 34V18C42 15.243 39.757 13 37 13ZM40 34C40 35.654 38.654 37 37 37H15C13.346 37 12 35.654 12 34V18C12 16.346 13.346 15 15 15H37C38.654 15 40 16.346 40 18V34Z" />
                      </svg>
                    </i>
                    <span>Video editor</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/add-subtitles-to-video" className="item">
                  <span>
                    <i className="icon">
                      <svg width="52px" height="52px" viewBox="0 0 52 52">
                        <path d="M37,13H15c-2.757,0-5,2.243-5,5v16c0,2.757,2.243,5,5,5h22c2.757,0,5-2.243,5-5V18C42,15.243,39.757,13,37,13z M40,34 c0,1.654-1.346,3-3,3H15c-1.654,0-3-1.346-3-3V18c0-1.654,1.346-3,3-3h22c1.654,0,3,1.346,3,3V34z M18,26h16v2H18V26z M21,30h10v2 H21V30z" />
                      </svg>
                    </i>
                    <span>Add subtitles</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/compress-video" className="item">
                  <span>
                    <i className="icon">
                      <svg width="52px" height="52px" viewBox="0 0 52 52">
                        <path d="M22.914,26l-5.707,5.707l-1.414-1.414L19.086,27H10v-2h9.086l-3.293-3.293l1.414-1.414L22.914,26z M42,25h-9.086l3.293-3.293l-1.414-1.414L29.086,26l5.707,5.707l1.414-1.414L32.914,27H42V25z M20.293,34.793l1.414,1.414L25,32.914V42h2v-9.086l3.293,3.293l1.414-1.414L26,29.086L20.293,34.793z M31.707,17.207l-1.414-1.414L27,19.086V10h-2v9.086l-3.293-3.293l-1.414,1.414L26,22.914L31.707,17.207z" />
                      </svg>
                    </i>
                    <span>Compress</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/resize-video" className="item">
                  <span>
                    <i className="icon">
                      <svg width="52px" height="52px" viewBox="0 0 52 52">
                        <path d="M13,13v26h26V13H13z M37,37H15V15h22V37z M26.793,23.793L31.586,19H27v-2h8v8h-2v-4.586l-4.793,4.793L26.793,23.793z M25,35h-8v-8h2v4.586l4.793-4.793l1.414,1.414L20.414,33H25V35z" />
                      </svg>
                    </i>
                    <span>Resize</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/cut-video" className="item">
                  <span>
                    <i className="icon">
                      <svg width="52px" height="52px" viewBox="0 0 52 52">
                        <path d="M15.756,15.671c-0.371-0.409-0.339-1.042,0.071-1.412c0.41-0.372,1.042-0.338,1.413,0.07l7,7.738c0.371,0.409,0.339,1.042-0.071,1.412c-0.191,0.174-0.432,0.259-0.67,0.259c-0.273,0-0.544-0.111-0.742-0.329L15.756,15.671zM38,33.5c0,2.481-2.019,4.5-4.5,4.5S29,35.981,29,33.5c0-0.886,0.266-1.707,0.71-2.404L26,26.994l-3.71,4.102C22.733,31.793,23,32.614,23,33.5c0,2.481-2.019,4.5-4.5,4.5S14,35.981,14,33.5s2.019-4.5,4.5-4.5c0.87,0,1.676,0.26,2.365,0.688l13.897-15.359c0.371-0.409,1.002-0.442,1.412-0.07c0.409,0.37,0.441,1.003,0.07,1.412l-8.896,9.833l3.785,4.186C31.823,29.26,32.629,29,33.5,29C35.981,29,38,31.019,38,33.5z M21,33.5c0-1.379-1.122-2.5-2.5-2.5S16,32.121,16,33.5s1.122,2.5,2.5,2.5S21,34.879,21,33.5z M36,33.5c0-1.379-1.121-2.5-2.5-2.5S31,32.121,31,33.5s1.121,2.5,2.5,2.5S36,34.879,36,33.5z" />
                      </svg>
                    </i>
                    <span>Cut</span>
                  </span>
                </a>
              </li>
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

          <div className="hero-wrapper">
            <div className="hero text-center">
              <div className="title text-center" style={{ color: '#014042' }}>
                <h1>Professional Editing, Simplified</h1>
                <h2>Transform your ideas into stunning visuals — no technical skills required.</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    };
export default Hero;