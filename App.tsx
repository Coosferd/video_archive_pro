
import React, { useState, useMemo, useEffect } from 'react';
import { VideoWork, FilterState } from './types';
import { processRawData } from './services/dataService';
import { saveEdit } from './services/storageService';
import { rawData1, rawData2 } from './constants';
import VideoGrid from './components/VideoGrid';
import FilterBar from './components/FilterBar';
import VideoPlayer from './components/VideoPlayer';
import EditModal from './components/EditModal';

const App: React.FC = () => {
  const [allVideos, setAllVideos] = useState<VideoWork[]>([]);
  const [filters, setFilters] = useState<FilterState>({ search: '', selectedTags: [], selectedDates: [] });
  const [selectedVideo, setSelectedVideo] = useState<VideoWork | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    const combinedData = processRawData([rawData1, rawData2]);
    setAllVideos(combinedData);
  };

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredVideos = useMemo(() => {
    const query = filters.search.toLowerCase();
    return allVideos.filter(v => {
      const matchesSearch = query === '' || 
                            v.cleanUrl.toLowerCase().includes(query) ||
                            v.title.toLowerCase().includes(query) ||
                            v.tags.some(t => t.includes(query)) ||
                            v.date.toLowerCase().includes(query);
      const matchesTag = filters.selectedTags.length === 0 || filters.selectedTags.every(tag => v.tags.includes(tag));
      const matchesDate = filters.selectedDates.length === 0 || filters.selectedDates.includes(v.date);
      return matchesSearch && matchesTag && matchesDate;
    });
  }, [allVideos, filters]);

  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};
    // Calculate stats based on search and selected dates, but NOT selected tags (to see siblings)
    const baseList = allVideos.filter(v => {
      const matchesSearch = filters.search === '' || 
                            v.cleanUrl.toLowerCase().includes(filters.search.toLowerCase()) ||
                            v.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesDate = filters.selectedDates.length === 0 || filters.selectedDates.includes(v.date);
      return matchesSearch && matchesDate;
    });

    baseList.forEach(v => {
      v.tags.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });
    return stats;
  }, [allVideos, filters.search, filters.selectedDates]);

  const dateStats = useMemo(() => {
    const stats: Record<string, number> = {};
    // Calculate stats based on search and selected tags, but NOT selected dates
    const baseList = allVideos.filter(v => {
      const matchesSearch = filters.search === '' || 
                            v.cleanUrl.toLowerCase().includes(filters.search.toLowerCase()) ||
                            v.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesTag = filters.selectedTags.length === 0 || filters.selectedTags.every(tag => v.tags.includes(tag));
      return matchesSearch && matchesTag;
    });

    baseList.forEach(v => {
      stats[v.date] = (stats[v.date] || 0) + 1;
    });
    return stats;
  }, [allVideos, filters.search, filters.selectedTags]);

  const sortedTags = useMemo(() => Object.keys(tagStats).sort(), [tagStats]);
  const sortedDates = useMemo(() => {
    // Sort years ascending: until 2014, then 2014-2018, etc.
    return Object.keys(dateStats).sort((a, b) => {
      const getYear = (s: string) => {
        const match = s.match(/\d{4}/);
        return match ? parseInt(match[0]) : 0;
      };
      return getYear(a) - getYear(b);
    });
  }, [dateStats]);

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags.filter(t => t !== tag) 
        : [...prev.selectedTags, tag]
    }));
  };

  const toggleDate = (date: string) => {
    setFilters(prev => ({
      ...prev,
      selectedDates: prev.selectedDates.includes(date)
        ? prev.selectedDates.filter(d => d !== date)
        : [...prev.selectedDates, date]
    }));
  };

  const clearFilters = () => setFilters({ search: '', selectedTags: [], selectedDates: [] });

  const handleSaveEdit = (updated: VideoWork) => {
    saveEdit(updated);
    loadData();
    setEditingVideo(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-white font-black text-xl tracking-widest uppercase italic">Master Database v4.5</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <nav className="glass-nav sticky top-0 z-50 border-b border-white/5 px-4 py-4 sm:px-8">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20">
              VA
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white uppercase italic">
                PRO <span className="text-blue-500">Video</span> Archive
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
                {allVideos.length} PROJECTS FOUND
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by title, URL or tags..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-slate-600 text-sm font-medium"
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto p-4 sm:p-8">
        <div className="space-y-8 mb-12 bg-white/2 p-6 rounded-[2rem] border border-white/5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Filter Laboratory</h2>
            <button 
              onClick={clearFilters}
              className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Reset All
            </button>
          </div>

          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Categories (Multiple)</h3>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(tag => {
                const count = tagStats[tag];
                const active = filters.selectedTags.includes(tag);
                if (count === 0 && !active) return null;
                return (
                  <button 
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      active 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tag} <span className={`ml-1 opacity-50 font-medium`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Time Periods (Multiple)</h3>
            <div className="flex flex-wrap gap-2">
              {sortedDates.map(date => {
                const count = dateStats[date];
                const active = filters.selectedDates.includes(date);
                if (count === 0 && !active) return null;
                return (
                  <button 
                    key={date}
                    onClick={() => toggleDate(date)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      active 
                        ? 'bg-white text-black border-white shadow-xl' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {date} <span className={`ml-1 opacity-50 font-medium`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-white font-black uppercase tracking-widest text-sm">
            Showing <span className="text-blue-500">{filteredVideos.length}</span> Results
          </p>
        </div>

        <VideoGrid 
          videos={filteredVideos} 
          onVideoClick={setSelectedVideo} 
          onEditClick={setEditingVideo}
        />

        {filteredVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 bg-white/2 rounded-[3rem] border border-dashed border-white/10">
            <svg className="w-16 h-16 text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em]">No intersection found</p>
            <button onClick={clearFilters} className="mt-6 text-blue-500 font-bold uppercase text-xs hover:underline tracking-widest">Reset filters</button>
          </div>
        )}
      </main>

      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {editingVideo && <EditModal video={editingVideo} onSave={handleSaveEdit} onClose={() => setEditingVideo(null)} />}
    </div>
  );
};

export default App;
