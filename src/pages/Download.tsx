import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaDownload, FaLock, FaSpinner } from 'react-icons/fa';

export function Download() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(true);

  const randomUrls = [ 
  'https://omg10.com/4/10055984',
  'https://periodicdisease.com/HE9TFh',
  'https://cr.tatsmanaffects.com/ihfG5d3y35dLqc/94691',
  'https://dulyhagglermounting.com/2082665'
];

  useEffect(() => {
    const timer = setTimeout(() => {
        setVideoUrl(sessionStorage.getItem('videoUrl'));
        setVideoTitle(sessionStorage.getItem('videoTitle'));
        setPreparing(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);
  
  const handleDownload = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
      setTimeout(() => window.location.href = randomUrls[Math.floor(Math.random() * randomUrls.length)], 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#09090b]">
      <Helmet><title>Unduh Terenkripsi - PlokStream</title></Helmet>

      <div className="bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
            <FaLock className="text-4xl text-blue-500" />
        </div>
        
        <h1 className="text-4xl font-black mb-4 text-white">Tautan Tersedia</h1>
        
        {preparing ? (
             <div className="flex flex-col items-center gap-4 text-slate-400 py-8">
                 <FaSpinner className="animate-spin text-3xl text-blue-600" />
             </div>
        ) : (
          videoUrl ? (
            <div className="space-y-8 mt-8">
              <p className="text-blue-400 font-bold text-lg line-clamp-2 px-6 py-4 bg-blue-900/20 rounded-xl border border-blue-500/20">{videoTitle}</p>
              <button onClick={handleDownload} className="w-full bg-blue-600 text-white px-8 py-5 rounded-xl flex items-center justify-center mx-auto hover:bg-blue-500 transition-all font-black text-xl gap-4 group">
                <FaDownload className="group-hover:-translate-y-1 transition-transform" /> Simpan File Asli
              </button>
            </div>
          ) : (
            <p className="text-red-400 font-bold py-8">Sesi tidak valid. Harap ulangi dari awal.</p>
          )
        )}
      </div>
    </div>
  );
}