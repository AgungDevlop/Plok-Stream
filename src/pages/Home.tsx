import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaSpinner, FaChevronLeft, FaChevronRight, FaFire, FaTags, FaPlayCircle } from 'react-icons/fa';
import { useLayout } from '../context/LayoutContext';
import VideoCard from '../components/VideoCard';

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

export function Home() {
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<VideoData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { setShowSearch } = useLayout();
  const searchRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const videosPerPage = 30;

  useEffect(() => {
    setShowSearch(false);
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/AgungDevlop/Viral/refs/heads/main/Video.json');
        const data: VideoData[] = await response.json();
        
        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }
        
        setVideos(data);
      } catch (error) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      setShowSearch(true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowSearch]);

  useEffect(() => {
    setSearchTerm(urlSearchQuery);
    setCurrentPage(1); 
  }, [urlSearchQuery]);

  const hashtags = useMemo(() => {
    if (videos.length === 0) return [];
    const stopWords = new Set(['dan', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'ini', 'itu', 'ada', 'viral', 'video', 'terbaru', '2024', 'shorts', 'full', 'part', 'the', 'of', 'in', 'and', 'with']);
    const wordCounts: { [key: string]: number } = {};
    
    videos.forEach(video => {
      const words = video.Judul.toLowerCase().replace(/[^\w\s]|_/g, "").split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word)) wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    return Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 25).map(entry => entry[0]);
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (!urlSearchQuery) return videos;
    const query = urlSearchQuery.toLowerCase();
    return videos.filter(video => video.Judul.toLowerCase().includes(query));
  }, [videos, urlSearchQuery]);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 1) {
      const query = value.toLowerCase();
      setSuggestions(videos.filter(video => video.Judul.toLowerCase().includes(query)).slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const executeSearch = (query: string) => {
    setShowSuggestions(false);
    navigate(query.trim() ? `/?search=${encodeURIComponent(query.trim())}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const handleSuggestionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    localStorage.setItem('plok_ad_cooldown', Date.now().toString());

    const targetUrl = `${window.location.origin}${window.location.pathname}#/?v=${id}`;
    window.open(targetUrl, '_blank');
    
    setTimeout(() => {
      window.location.href = ADS[Math.floor(Math.random() * ADS.length)];
    }, 500);
  };

  return (
    <div className="w-full bg-[#050505] min-h-screen pb-20">
      <Helmet><title>PlokStream | Premium Video Eksklusif HD</title></Helmet>

      <div className="w-full bg-[#0a0a0a] pt-6 pb-8 md:pt-10 md:pb-12 border-b border-white/5 relative z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-tight flex items-center justify-center gap-3 uppercase">
            <FaFire className="text-red-600" /> Eksplorasi <span className="text-red-600">Konten Viral</span>
          </h1>

          <div ref={searchRef} className="relative group w-full mx-auto max-w-3xl z-50">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl shadow-red-900/10">
                <FaSearch className="absolute left-5 md:left-6 text-slate-400 text-lg group-focus-within:text-red-600 transition-colors z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari model, kategori, atau studio..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchTerm.trim().length > 1 && setShowSuggestions(true)}
                  className="w-full bg-[#111] border border-white/10 text-white rounded-md py-3.5 md:py-4 pl-12 md:pl-14 pr-24 focus:outline-none focus:border-red-600/50 focus:bg-[#151515] focus:ring-2 focus:ring-red-600/20 transition-all text-sm md:text-base font-semibold shadow-inner"
                />
                <button type="submit" className="absolute right-1.5 md:right-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 md:px-8 py-2 md:py-2.5 rounded transition-all active:scale-95 text-xs md:text-sm tracking-wide uppercase">
                  Cari
                </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-[100] text-left flex flex-col animate-fade-in">
                    <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                        {suggestions.map((video) => (
                            <a key={video.id} href={`#/?v=${video.id}`} onClick={(e) => handleSuggestionClick(e, video.id)} className="flex items-center gap-4 px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer transition-colors border-b border-white/5 last:border-0 group">
                                <div className="w-20 md:w-28 aspect-video rounded overflow-hidden bg-[#050505] flex-shrink-0 relative">
                                    <video src={`${video.Url}#t=0.1`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" preload="metadata" muted playsInline />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <FaPlayCircle className="text-white text-xl drop-shadow-md" />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 justify-center">
                                    <span className="text-slate-200 font-bold line-clamp-2 text-sm md:text-sm group-hover:text-red-600 transition-colors leading-tight">{video.Judul}</span>
                                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-1.5 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> HD Premium
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full border-b border-white/5 bg-[#080808] py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
                <FaTags className="text-red-600 text-sm" />
                <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase">Kategori Populer</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
                {hashtags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => executeSearch(tag)} 
                      className={`px-3 md:px-4 py-1.5 rounded border text-xs md:text-sm font-bold capitalize transition-all active:scale-95 ${
                        urlSearchQuery.toLowerCase() === tag 
                        ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/20' 
                        : 'bg-[#111] border-white/5 text-slate-400 hover:bg-[#1a1a1a] hover:text-white hover:border-white/20'
                      }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-10 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-3 border-b border-white/5 pb-4">
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="w-1.5 md:w-2 h-6 md:h-7 bg-red-600 rounded" />
            {urlSearchQuery ? `Hasil: "${urlSearchQuery}"` : "Video Terbaru"}
          </h2>
          <span className="text-xs text-slate-500 font-bold tracking-widest uppercase bg-[#111] px-3 py-1.5 rounded border border-white/5">
              Menampilkan {filteredVideos.length} Video
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-5">
            <FaSpinner className="animate-spin text-4xl text-red-600" />
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Memuat Katalog Server...</p>
          </div>
        ) : currentVideos.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-[#0a0a0a] rounded-lg border border-white/5">
            <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-5 shadow-inner">
                <FaSearch className="text-2xl text-slate-600" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2">Tidak Ada Hasil</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6 max-w-sm text-center px-4">Konten yang Anda cari tidak tersedia. Coba gunakan kata kunci yang lebih umum.</p>
            <button onClick={() => executeSearch('')} className="bg-[#111] hover:bg-white/10 text-white font-bold px-6 py-2.5 rounded transition-all text-xs tracking-wide active:scale-95 border border-white/10">Tampilkan Semua Video</button>
          </div>
        )}
      </div>
    </div>
  );
}