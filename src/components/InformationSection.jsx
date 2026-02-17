import React, { useState } from 'react';
const InformationSection = () => {
  return (
    <div className="Home_informationSection__h7wjK">
      <div className="Home_colorSectionWrapper__WFYmO">
        <div className="Home_colorSectionContainer__NsmJz">
          <div className="Home_colorSectionLeft__9OtPi">
            <video
              className="Home_colorSectionVideo__6hb0T"
              src="https://cdn-useast1.kapwing.com/static/4Ss-hompagecollab1_1.mp4"
              poster="https://cdn-useast1.kapwing.com/static/pH--1poster.webp"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="Home_colorSectionRight__I5d_B">
            <div className="Home_colorSectionText__5awB0">
              <div className="Home_sectionHeader__FO0Eg">From first draft to final video, 10x faster</div>
              <div className="Home_sectionDescription__It37N">
                Videolid streamlines your team's video creation process and centers it in one content home base. 
                Automate away tedious tasks with AI tools and templates, stay up-to-date on project status, and 
                give in-line feedback. Say goodbye to "could you send that to me again?"
              </div>
              <a href="/studio/editor" className="TealButton_linkWrapper__BJivI">
                <div className="TealButton_tealButton__OLu72">
                  Start creating faster
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="TealButton_chevron__abU2j" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InformationSection;