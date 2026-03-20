import React, { useState, useRef, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';

interface VideoCardProps {
  id: string;
  judul: string;
  url: string;
}

const ADS = [
  'https://omg10.com/4/10055984',
  'https://periodicdisease.com/HE9TFh',
  'https://cr.tatsmanaffects.com/ihfG5d3y35dLqc/94691',
  'https://dulyhagglermounting.com/2082665'
];

const VideoCard: React.FC<VideoCardProps> = ({ id, judul, url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const scrubberInterval = useRef<number | null>(null);

  const forceThumbnailUrl = `${url}#t=0.1`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && isVideoLoaded) {
      let currentTime = 10; 
      videoRef.current.currentTime = currentTime;
      scrubberInterval.current = window.setInterval(() => {
        if (videoRef.current) {
          currentTime += 15; 
          if (currentTime >= videoRef.current.duration) currentTime = 10; 
          videoRef.current.currentTime = currentTime;
        }
      }, 700); 
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (scrubberInterval.current !== null) {
      window.clearInterval(scrubberInterval.current);
      scrubberInterval.current = null;
    }
    if (videoRef.current) videoRef.current.currentTime = 0.1;
  };

  useEffect(() => {
    return () => {
      if (scrubberInterval.current !== null) window.clearInterval(scrubberInterval.current);
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Set status ke LocalStorage agar tab baru tidak ikut trigger iklan
    localStorage.setItem('plok_ad_cooldown', Date.now().toString());

    const targetUrl = `${window.location.origin}${window.location.pathname}#/?v=${id}`;
    window.open(targetUrl, '_blank');
    
    // Redirect tab lama ke Iklan
    setTimeout(() => {
      window.location.href = ADS[Math.floor(Math.random() * ADS.length)];
    }, 500); 
  };

  return (
    <a 
      href={`#/?v=${id}`}
      onClick={handleCardClick}
      className="group flex flex-col gap-2.5 outline-none cursor-pointer w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      <div className="relative w-full aspect-video bg-[#111] rounded-md overflow-hidden shadow-lg border border-white/5 transition-all duration-300 group-hover:border-red-600/50 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] group-hover:-translate-y-1 transform-gpu z-10 group-hover:z-20">
        <video 
          ref={videoRef}
          src={forceThumbnailUrl} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
          preload="metadata"
          muted
          playsInline
          onLoadedMetadata={() => setIsVideoLoaded(true)}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
        
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 items-start z-20">
            <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-widest uppercase">HD</span>
            <span className="bg-black/80 backdrop-blur-md text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 tracking-widest uppercase">Premium</span>
        </div>

        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-20 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="bg-red-600/90 backdrop-blur-sm p-3 md:p-4 rounded-full text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]">
            <FaPlay size={16} className="ml-1 md:text-xl" />
          </div>
        </div>

        {isHovered && isVideoLoaded && (
            <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-pulse z-20" style={{ width: '100%' }} />
        )}
      </div>

      <div className="px-1 mt-1">
        <h3 className="text-slate-200 font-bold text-sm md:text-base line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">{judul}</h3>
        <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>PlokStream HD</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>Eksklusif</span>
        </div>
      </div>
    </a>
  );
};

export default VideoCard;