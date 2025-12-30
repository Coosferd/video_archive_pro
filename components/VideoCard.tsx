
import React, { useState } from 'react';
import { VideoWork } from '../types';

interface Props {
  video: VideoWork;
  onClick: () => void;
  onEditClick: (video: VideoWork) => void;
}

const VideoCard: React.FC<Props> = ({ video, onClick, onEditClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="video-card-hover group bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full relative shadow-2xl">
      {/* Edit Button - Visible on Hover */}
      <button 
        onClick={(e) => { e.stopPropagation(); onEditClick(video); }}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white/50 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <div className="relative aspect-video bg-slate-900 overflow-hidden" onClick={onClick}>
        {!imageLoaded && <div className="absolute inset-0 bg-slate-800 animate-pulse"></div>}
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${imageLoaded ? 'opacity-60 group-hover:opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="text-white font-black text-sm uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
            {video.title}
          </h4>
        </div>

        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
            video.platform === 'youtube' ? 'bg-red-600 text-white' :
            video.platform === 'vk' ? 'bg-blue-600 text-white' :
            video.platform === 'vimeo' ? 'bg-blue-400 text-white' : 'bg-slate-700 text-slate-300'
          }`}>
            {video.platform}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1" onClick={onClick}>
        <div className="flex flex-wrap gap-1.5">
          {video.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[8px] font-black bg-white/5 px-2 py-1 rounded-md text-slate-500 uppercase tracking-widest border border-white/5">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{video.date}</span>
           {video.isEdited && (
             <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">Edited</span>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
