
import React, { useState, useEffect } from 'react';
import { VideoWork } from '../types';
import { getPlatform, getThumbnail } from '../services/dataService';

interface Props {
  video: VideoWork;
  onSave: (updated: VideoWork) => void;
  onClose: () => void;
}

const EditModal: React.FC<Props> = ({ video, onSave, onClose }) => {
  const [form, setForm] = useState<VideoWork>({ ...video });

  const handleUrlChange = (url: string) => {
    const platform = getPlatform(url);
    const thumb = getThumbnail(url);
    setForm(prev => ({ 
      ...prev, 
      url, 
      platform, 
      thumbnail: prev.thumbnail.includes('picsum') ? thumb : prev.thumbnail 
    }));
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Project
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Project Title</label>
            <input 
              type="text" 
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="e.g. Summer Music Festival 2023"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Video URL (YT, VK, Vimeo)</label>
            <input 
              type="text" 
              value={form.url}
              onChange={e => handleUrlChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Paste new link here"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Thumbnail URL (Optional)</label>
            <input 
              type="text" 
              value={form.thumbnail}
              onChange={e => setForm(prev => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Year / Date</label>
              <input 
                type="text" 
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Platform</label>
              <select 
                value={form.platform}
                onChange={e => setForm(prev => ({ ...prev, platform: e.target.value as any }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="vk">VK</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Tags (Comma separated)</label>
            <input 
              type="text" 
              value={form.tags.join(', ')}
              onChange={e => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={() => onSave({ ...form, isEdited: true })}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Save Changes
          </button>
          <button 
            onClick={onClose}
            className="px-6 bg-white/5 hover:bg-white/10 text-slate-400 font-bold uppercase tracking-widest py-4 rounded-2xl transition-all border border-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
