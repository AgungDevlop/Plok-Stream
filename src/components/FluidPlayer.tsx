import React, { useEffect, useRef, useId } from 'react';

declare global {
  interface Window {
    fluidplayer: any;
  }
}

interface FluidPlayerProps {
  src: string;
  title: string;
}

const FluidPlayer: React.FC<FluidPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstance = useRef<any>(null);
  const uniqueId = useId();

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElementId = videoRef.current.id;

    const initPlayer = () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
      playerInstance.current = window.fluidplayer(
        videoElementId,
        {
          layoutControls: {
            controlBar: {
              autoHideTimeout: 3,
              animated: true,
              autoHide: true
            },
            htmlOnPauseBlock: {
              html: title,
              height: null,
              width: null
            },
            autoPlay: false,
            mute: true,
            allowTheatre: true,
            playPauseAnimation: false,
            playbackRateEnabled: false,
            allowDownload: false,
            playButtonShowing: true,
            fillToContainer: false,
            primaryColor: "#3b82f6",
            posterImage: ""
          },
          vastOptions: {
            adList: [],
            adCTAText: false,
            adCTATextPosition: ""
          }
        }
      );
    };

    const checkInterval = setInterval(() => {
      if (typeof window.fluidplayer === 'function') {
        clearInterval(checkInterval);
        initPlayer();
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [src, title, uniqueId]);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800 bg-black">
        <video ref={videoRef} id={uniqueId} style={{ width: '100%', height: '100%' }}>
            <source src={src} type="video/mp4" />
        </video>
    </div>
  );
};

export default FluidPlayer;