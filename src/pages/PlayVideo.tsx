import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaDownload, FaSpinner, FaShareAlt, FaRegBookmark, FaBookmark, FaCalendarAlt, FaTags, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLayout } from '../context/LayoutContext';
import VideoCard from '../components/VideoCard';

declare global {
  interface Window {
    fluidPlayer?: (elementId: string, options?: any) => any;
  }
}

interface VideoData {
  id: string;
  Judul: string;
  Url: string;
}

const ADS = [
  'https://omg10.com/4/10055984',
  'https://periodicdisease.com/HE9TFh',
  'https://cr.tatsmanaffects.com/ihfG5d3y35dLqc/94691',
  'https://dulyhagglermounting.com/2082665'
];

export function PlayVideo() {
  const { id: pathId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('v');
  const id = pathId || queryId;

  const navigate = useNavigate();
  const { setShowSearch } = useLayout();

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>(''); 
  const [isBuffering, setIsBuffering] = useState(false); 
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  const playerInstance = useRef<any>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const videosPerPage = 18;

  const videoTags = useMemo(() => {
    return videoTitle.toLowerCase().replace(/[^\w\s]|_/g, "").split(/\s+/).filter(w => w.length > 3).slice(0, 6);
  }, [videoTitle]);

  useEffect(() => {
    setShowSearch(true);
    setCurrentPage(1); 
    const fetchVideoData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/AgungDevlop/Viral/refs/heads/main/Video.json');
        const data: VideoData[] = await response.json();
        setVideos(data);
        if (id) {
            const video = data.find(item => item.id === id);
            if (video) {
              setVideoUrl(video.Url);
              setVideoTitle(video.Judul);
              sessionStorage.setItem('videoUrl', video.Url);
              sessionStorage.setItem('videoTitle', video.Judul);
              setIsBuffering(true);
              
              const bookmarks = JSON.parse(localStorage.getItem('plok_bookmarks') || '[]');
              setIsSaved(bookmarks.some((b: { id: string }) => b.id === id));

              try {
                const videoResponse = await fetch(video.Url);
                const videoBlob = await videoResponse.blob();
                setBlobUrl(URL.createObjectURL(videoBlob));
              } catch (e) {
                setBlobUrl(video.Url);
              } finally {
                setIsBuffering(false);
              }
            } else {
              navigate('/');
            }
        }
      } catch (error) { 
        navigate('/'); 
      } finally { 
        setLoading(false); 
      }
    };
    if (id) fetchVideoData(); else navigate('/');
    
    return () => { 
      if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl); 
      setShowSearch(false); 
    };
  }, [id, navigate, setShowSearch]);
  
  useEffect(() => {
    if (!blobUrl) return;
    const handlePlayerEventRedirect = () => {
        const now = Date.now();
        const lastAd = localStorage.getItem('plok_ad_cooldown');
        
        if (!lastAd || now - parseInt(lastAd, 10) > 180000) {
            localStorage.setItem('plok_ad_cooldown', now.toString());
            window.open(window.location.href, '_blank');
            setTimeout(() => {
                window.location.href = ADS[Math.floor(Math.random() * ADS.length)];
            }, 500);
        }
    };

    const initPlayer = () => {
      if (playerInstance.current) playerInstance.current.destroy();
      if (typeof window.fluidPlayer === 'function') {
        playerInstance.current = window.fluidPlayer('video-player-enterprise', {
          layoutControls: {
            controlBar: { autoHideTimeout: 3, animated: true, autoHide: true },
            autoPlay: true, mute: false, allowTheatre: true, primaryColor: "#DC2626"
          }
        });
        ['play', 'pause', 'seeked'].forEach(evt => playerInstance.current.on(evt, handlePlayerEventRedirect));
      }
    };
    
    const checkInterval = setInterval(() => {
        if (typeof window.fluidPlayer === 'function') { clearInterval(checkInterval); initPlayer(); }
    }, 100);
    return () => { clearInterval(checkInterval); if (playerInstance.current) playerInstance.current.destroy(); };
  }, [blobUrl]);

  const processedVideos = useMemo(() => {
    if (!videos.length || !videoTitle) return [];

    const stopWords = new Set(['dan', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'ini', 'itu', 'ada', 'viral', 'video', 'terbaru', '2024', 'shorts', 'full', 'part']);
    const titleWords = videoTitle.toLowerCase().replace(/[^\w\s]|_/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));

    const otherVideos = videos.filter(v => v.id !== id);

    const scoredVideos = otherVideos.map(v => {
        const targetWords = v.Judul.toLowerCase().replace(/[^\w\s]|_/g, "").split(/\s+/);
        let score = 0;
        titleWords.forEach(tw => {
            if (targetWords.includes(tw)) score++;
        });
        return { ...v, score };
    });

    const related = scoredVideos.filter(v => v.score > 0).sort((a, b) => b.score - a.score);
    const unrelated = scoredVideos.filter(v => v.score === 0);

    const newestUnrelated = [...unrelated].reverse();
    const recent = newestUnrelated.slice(0, 30);
    const restRandom = newestUnrelated.slice(30).sort(() => 0.5 - Math.random());

    return [...related, ...recent, ...restRandom];
  }, [videos, id, videoTitle]);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = processedVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(processedVideos.length / videosPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      if (recommendationsRef.current) {
        const yOffset = -90; 
        const y = recommendationsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleDownloadClick = useCallback(() => {
    const now = Date.now();
    const lastAd = localStorage.getItem('plok_ad_cooldown');
    
    if (!lastAd || now - parseInt(lastAd, 10) > 180000) {
      localStorage.setItem('plok_ad_cooldown', now.toString());
      window.open('/#/download', '_blank');
      setTimeout(() => {
        window.location.href = ADS[Math.floor(Math.random() * ADS.length)];
      }, 500);
    } else {
      window.open('/#/download', '_blank');
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: videoTitle,
      text: `Tonton ${videoTitle} eksklusif di PlokStream HD`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Tautan disalin ke clipboard!");
      }
    } catch (error) {
    }
  }, [videoTitle]);

  const toggleBookmark = useCallback(() => {
    if (!id || !videoTitle || !videoUrl) return;
    const bookmarks = JSON.parse(localStorage.getItem('plok_bookmarks') || '[]');
    const isCurrentlySaved = bookmarks.some((b: { id: string }) => b.id === id);
    
    if (isCurrentlySaved) {
      const newBookmarks = bookmarks.filter((b: { id: string }) => b.id !== id);
      localStorage.setItem('plok_bookmarks', JSON.stringify(newBookmarks));
      setIsSaved(false);
    } else {
      bookmarks.push({ id, title: videoTitle, url: videoUrl, addedAt: new Date().toISOString() });
      localStorage.setItem('plok_bookmarks', JSON.stringify(bookmarks));
      setIsSaved(true);
    }
  }, [id, videoTitle, videoUrl]);

  if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0a0a0a]">
        <FaSpinner className="animate-spin text-4xl text-[#DC2626]" />
      </div>
  );

  return (
    <div className="w-full bg-[#050505] min-h-screen pb-20">
      <Helmet>
        <title>{`${videoTitle} - PlokStream HD`}</title>
        <meta property="og:title" content={`${videoTitle} - PlokStream HD`} />
        <meta property="og:description" content={`Tonton video eksklusif ${videoTitle} secara instan dengan resolusi tinggi di PlokStream.`} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="w-full bg-black lg:pt-4 border-b border-white/5 pb-4 md:pb-6">
        <div className="container mx-auto max-w-[1400px] px-0 lg:px-6 xl:px-8">
            <div className="w-full aspect-video lg:rounded-md overflow-hidden bg-black relative shadow-2xl group border-0 lg:border border-white/10">
                {isBuffering && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3">
                        <FaSpinner className="animate-spin text-3xl text-red-600" />
                    </div>
                )}
                <video id="video-player-enterprise" className="w-full h-full object-contain bg-black" key={blobUrl} playsInline>
                    <source src={blobUrl} type="video/mp4" />
                </video>
            </div>
            
            <div className="pt-4 lg:pt-6 px-4 lg:px-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">HD 1080p</span>
                    <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5"><FaCalendarAlt /> Baru Saja</span>
                </div>
                
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-100 leading-tight tracking-tight mb-5 md:mb-6 break-words">
                  {videoTitle}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
                        <button 
                            onClick={handleNativeShare}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#111] hover:bg-[#222] text-slate-200 transition-colors font-bold text-xs md:text-sm border border-white/5 active:scale-95"
                        >
                            <FaShareAlt size={16}/> Bagikan
                        </button>

                        <button 
                            onClick={toggleBookmark}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded transition-colors font-bold text-xs md:text-sm border active:scale-95 ${
                                isSaved 
                                ? 'bg-red-600/10 border-red-500/50 text-red-600' 
                                : 'bg-[#111] hover:bg-[#222] border-white/5 text-slate-200'
                            }`}
                        >
                            {isSaved ? <FaBookmark size={16}/> : <FaRegBookmark size={16}/>} 
                            {isSaved ? 'Tersimpan' : 'Simpan'}
                        </button>
                    </div>

                    <button 
                        onClick={handleDownloadClick} 
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-xs md:text-sm transition-all bg-[#DC2626] text-white hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/20 w-full md:w-auto mt-2 md:mt-0"
                    >
                        <FaDownload size={16} /> Unduh Resolusi Asli
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1400px] px-4 lg:px-6 xl:px-8 mt-4 lg:mt-6">
        <div className="flex flex-col w-full">
          {videoTags.length > 0 && (
              <div className="pb-6 border-b border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <FaTags size={12} />
                      <h4 className="font-bold text-xs tracking-widest uppercase">Kategori Terkait</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {videoTags.map(tag => (
                          <Link key={tag} to={`/?search=${tag}`} className="bg-[#111] border border-white/5 hover:bg-[#1a1a1a] text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors">
                              {tag}
                          </Link>
                      ))}
                  </div>
              </div>
          )}

          <div ref={recommendationsRef} className="mt-8 md:mt-10 scroll-mt-24">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 md:w-2 h-6 md:h-7 bg-[#DC2626] rounded" />
                Rekomendasi & Terbaru
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8">
              {currentVideos.map((video) => (
                <VideoCard key={video.id} id={video.id} judul={video.Judul} url={video.Url} />
              ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-12 md:mt-16 pt-6 border-t border-white/5">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-[#111] border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                        <FaChevronLeft size={12} />
                    </button>
                    <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1 || (currentPage === 1 && page === 3) || (currentPage === totalPages && page === totalPages - 2))
                            .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && <span className="text-slate-600 px-1 font-bold text-xs">...</span>}
                                <button onClick={() => handlePageChange(page)} className={`w-8 h-9 md:w-10 md:h-10 flex items-center justify-center rounded text-xs md:text-sm font-black transition-all active:scale-90 ${currentPage === page ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#111]'}`}>
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-[#111] border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}