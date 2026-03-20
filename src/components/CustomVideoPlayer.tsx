import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, 
  FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaCopy 
} from 'react-icons/fa';

interface CustomVideoPlayerProps {
  src: string;
  title: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  let controlsTimeout: ReturnType<typeof setTimeout>;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const handleMainInteraction = () => {
    togglePlayPause();
  };
  
  const handleProgressInteraction = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (Number(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newVolume = Number(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    clearTimeout(controlsTimeout);
    if (isPlaying) {
      controlsTimeout = setTimeout(() => setIsControlsVisible(false), 3000);
    }
  };
  
  const shareUrl = window.location.href;
  const shareTitle = title;
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram') => { 
    let url = ''; 
    switch (platform) { 
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break; 
      case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`; break; 
      case 'whatsapp': url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`; break; 
      case 'telegram': url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`; break; 
    } 
    window.open(url, '_blank'); 
    setIsSharePanelOpen(false); 
  };
  
  const handleCopyLink = () => { 
    navigator.clipboard.writeText(shareUrl); 
    alert('Link copied to clipboard!'); 
    setIsSharePanelOpen(false); 
  };
  
  useEffect(() => { 
    const video = videoRef.current; 
    if (video) { 
      video.play().catch(() => setIsPlaying(false)); 
      const setVideoDuration = () => setDuration(video.duration); 
      video.addEventListener('loadedmetadata', setVideoDuration); 
      const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement); 
      document.addEventListener('fullscreenchange', onFullscreenChange); 
      return () => { 
        video.removeEventListener('loadedmetadata', setVideoDuration); 
        document.removeEventListener('fullscreenchange', onFullscreenChange); 
      } 
    } 
  }, [src]);

  return (
    <div 
        ref={containerRef} 
        className="relative w-full aspect-video bg-black cursor-pointer rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
            clearTimeout(controlsTimeout);
            if(isPlaying) setIsControlsVisible(false);
        }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={handleMainInteraction}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload"
      />
      
      {!isPlaying && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-blue-600/80 backdrop-blur-md p-5 rounded-full transition-transform duration-300 hover:scale-110 shadow-lg shadow-blue-500/30"
            onClick={handleMainInteraction}
          >
            <FaPlay size={36} className="text-white ml-1.5" />
          </div>
      )}

      <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-md tracking-wide">
        Vidify Stream
      </div>
      
      {isSharePanelOpen && (
        <div className="absolute bottom-20 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl z-20 flex items-center gap-2">
            <button onClick={() => handleShare('facebook')} className="p-2.5 rounded-full hover:bg-slate-800 transition-colors"><FaFacebook size={20} className="text-[#1877F2]" /></button>
            <button onClick={() => handleShare('twitter')} className="p-2.5 rounded-full hover:bg-slate-800 transition-colors"><FaTwitter size={20} className="text-[#1DA1F2]" /></button>
            <button onClick={() => handleShare('whatsapp')} className="p-2.5 rounded-full hover:bg-slate-800 transition-colors"><FaWhatsapp size={20} className="text-[#25D366]" /></button>
            <button onClick={() => handleShare('telegram')} className="p-2.5 rounded-full hover:bg-slate-800 transition-colors"><FaTelegram size={20} className="text-[#0088cc]" /></button>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button onClick={handleCopyLink} className="p-2.5 rounded-full hover:bg-slate-800 transition-colors"><FaCopy size={18} className="text-slate-300" /></button>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressInteraction}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all accent-blue-500 mb-4"
        />
        <div className="flex items-center justify-between text-white px-2">
          <div className="flex items-center gap-5">
            <button onClick={handleMainInteraction} className="hover:text-blue-400 transition-colors">
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>
            <div className="flex items-center gap-3 group">
                <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">{isMuted || volume === 0 ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}</button>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-0 group-hover:w-24 opacity-0 group-hover:opacity-100 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer transition-all duration-300 accent-blue-500 origin-left" />
            </div>
            <span className="text-sm font-medium text-slate-300 hidden sm:block tracking-wide">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSharePanelOpen(!isSharePanelOpen)} className={`transition-colors ${isSharePanelOpen ? 'text-blue-500' : 'hover:text-blue-400'}`}><FaShareAlt size={18} /></button>
            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors">{isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;