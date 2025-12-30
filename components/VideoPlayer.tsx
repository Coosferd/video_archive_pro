
import React from 'react';
import { VideoWork } from '../types';

interface Props {
  video: VideoWork;
  onClose: () => void;
}

const VideoPlayer: React.FC<Props> = ({ video, onClose }) => {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('shorts/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1`;
    }
    
    // Vimeo detection
    const vimeoMatch = url.match(/vimeo.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(video.url);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020408]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10 transition-all duration-500">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors p-4 rounded-full hover:bg-white/5"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/10">
          {embedUrl ? (
            <iframe 
              src={embedUrl} 
              className="w-full h-full" 
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-900">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">External Platform Playback</h3>
              <p className="text-slate-400 mb-10 max-w-md leading-relaxed">
                Platforms like VK, Instagram, and TikTok restrict viewing inside other apps. Click below to view the original work.
              </p>
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Open Original Content
              </a>
            </div>
          )}
        </div>

        <div className="mt-10 w-full flex flex-wrap justify-center gap-2">
          {video.tags.map((tag, i) => (
            <span key={i} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {tag}
            </span>
          ))}
          <span className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
            {video.date || 'Collection'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
