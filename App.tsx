
import React, { useState, useMemo, useEffect } from 'react';
import { VideoWork, FilterState } from './types.ts';
import { processRawData } from './services/dataService.ts';
import { saveEdit } from './services/storageService.ts';
import { rawData1, rawData2, rawData3, rawData4 } from './constants.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import VideoPlayer from './components/VideoPlayer.tsx';
import EditModal from './components/EditModal.tsx';

const App: React.FC = () => {
  const [allVideos, setAllVideos] = useState<VideoWork[]>([]);
  const [filters, setFilters] = useState<FilterState>({ search: '', selectedTags: [], selectedDates: [] });
  const [selectedVideo, setSelectedVideo] = useState<VideoWork | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    try {
      const sources = [rawData1, rawData2, rawData3, rawData4].filter(s => typeof s === 'string' && s.trim().length > 0);
      const combinedData = processRawData(sources);
      setAllVideos(combinedData);
    } catch (err) {
      console.error("Critical error during data sync:", err);
      setAllVideos([]);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredVideos = useMemo(() => {
    const query = filters.search.toLowerCase();
    return allVideos.filter(v => {
      if (!v) return false;
      const title = v.title?.toLowerCase() || "";
      const url = v.cleanUrl?.toLowerCase() || "";
      const matchesSearch = query === '' || 
                            url.includes(query) ||
                            title.includes(query) ||
                            (v.tags && v.tags.some(t => t?.toLowerCase().includes(query)));
      const matchesTag = filters.selectedTags.length === 0 || 
                         (v.tags && filters.selectedTags.every(tag => v.tags.includes(tag)));
      const matchesDate = filters.selectedDates.length === 0 || filters.selectedDates.includes(v.date);
      return matchesSearch && matchesTag && matchesDate;
    });
  }, [allVideos, filters]);

  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allVideos.forEach(v => {
      if (v && v.tags) {
        v.tags.forEach(tag => {
          if (tag) stats[tag] = (stats[tag] || 0) + 1;
        });
      }
    });
    return stats;
  }, [allVideos]);

  const dateStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allVideos.forEach(v => {
      if (v && v.date) stats[v.date] = (stats[v.date] || 0) + 1;
    });
    return stats;
  }, [allVideos]);

  const sortedTags = useMemo(() => Object.keys(tagStats).sort(), [tagStats]);
  const sortedDates = useMemo(() => Object.keys(dateStats).sort().reverse(), [dateStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-white font-black text-xl tracking-widest uppercase italic animate-pulse">Syncing Archive...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <nav className="glass-nav sticky top-0 z-50 border-b border-white/5 px-4 py-6 sm:px-12">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl shadow-blue-500/30">VA</div>
            <div>
              <h1 className="font-black text-3xl tracking-tighter text-white uppercase italic leading-none">Editor <span className="text-blue-500">Archive</span></h1>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                  {allVideos.length} PROJECTS TOTAL
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name, tags or link..." 
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-white placeholder-slate-700 text-lg font-medium"
            />
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto p-4 sm:p-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 backdrop-blur-sm">
          <section>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Categories ({sortedTags.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(tag => {
                const active = filters.selectedTags.includes(tag);
                return (
                  <button 
                    key={tag}
                    onClick={() => setFilters(p => ({...p, selectedTags: active ? p.selectedTags.filter(t => t !== tag) : [...p.selectedTags, tag]}))}
                    className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all border ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                  >
                    {tag} <span className="ml-1 opacity-40">({tagStats[tag]})</span>
                  </button>
                );
              })}
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Timeline
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedDates.map(date => {
                const active = filters.selectedDates.includes(date);
                return (
                  <button 
                    key={date}
                    onClick={() => setFilters(p => ({...p, selectedDates: active ? p.selectedDates.filter(d => d !== date) : [...p.selectedDates, date]}))}
                    className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all border ${active ? 'bg-white text-black shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                  >
                    {date} <span className="ml-1 opacity-40">({dateStats[date]})</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between mb-8 px-4">
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
             Showing <span className="text-blue-500">{filteredVideos.length}</span> projects
           </h2>
        </div>

        <VideoGrid videos={filteredVideos} onVideoClick={setSelectedVideo} onEditClick={setEditingVideo} />
        
        {filteredVideos.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-white font-black text-4xl opacity-10 uppercase italic tracking-tighter">No projects found</h3>
          </div>
        )}
      </main>

      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {editingVideo && <EditModal video={editingVideo} onSave={(u) => { saveEdit(u); loadData(); setEditingVideo(null); }} onClose={() => setEditingVideo(null)} />}
    </div>
  );
};

export default App;
