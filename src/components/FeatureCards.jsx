import React, { useState } from 'react';
const FeatureCards = () => {
  const features = [
    {
      image: '/images/video-editor.png',
      title: 'Add Audio to Video',
      description: 'Improve videos with thousands of royalty-free songs and sound effects from Videolid\'s built-in music library. Mix, match, and layer tracks to craft dynamic and engaging content.'
    },
    {
      image: '/images/video-editor.png',
      title: 'Text-based Editor',
      description: 'Save time with text-based editing. Use an auto-generated transcript to delete or trim video sections effortlessly by editing the text directly in the online Video Editor.'
    },
    {
      image: '/images/video-editor.png',
      title: 'Video Trimmer',
      description: 'Quickly trim, split, and cut your content with a user-friendly editing timeline designed for frame-by-frame precision — and anyone can start for free!'
    },
    // Add more features...
  ];

  return (
    <div className="full-width-box landing-video-examples">
      <div className="ContentCardCarousel_contentCardCarousel__47gKr">
        <div className="ContentCarousel_arrowContainer__Kpoy6">
          <div className="ContentCarousel_contentCarousel__fzJwI">
            <div className="ContentCarousel_content__k3qoc">
              {features.map((feature, index) => (
                <div key={index} className="ContentCard_contentCardLink__zSXjj ContentCardCarousel_card__clY7Y">
                  <img
                    src={feature.image}
                    className="ContentCard_media__CmXE2 ContentCardCarousel_cardMedia__ZZ1KG"
                    alt={feature.title}
                  />
                  <div className="ContentCard_content__FPtx0">
                    <div>
                      <h3 className="RichTextEditor_h3__uOeNB" dir="ltr">
                        <span>{feature.title}</span>
                      </h3>
                    </div>
                    <div>
                      <p className="RichTextEditor_p__54CwQ" dir="ltr">
                        <span>{feature.description}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FeatureCards;