
import { VideoWork } from '../types';
import { getAllEdits } from './storageService';

export const processRawData = (dataSources: string[]): VideoWork[] => {
  const videos: VideoWork[] = [];
  const seenWorkKeys = new Set<string>();
  const localEdits = getAllEdits();

  dataSources.forEach((source) => {
    const lines = source.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    const headerRow = lines[0].toLowerCase();
    const columns = headerRow.split(/\t| {2,}/).map(c => c.trim());
    
    const nameIdx = columns.findIndex(c => c.includes('name') || c.includes('url'));
    const titleIdx = columns.findIndex(c => c.includes('title') || c.includes('название'));
    const tagsIdx = columns.findIndex(c => c.includes('tags'));
    const dateIdx = columns.findIndex(c => c.includes('date'));

    lines.slice(1).forEach((line, lineIndex) => {
      const parts = line.split(/\t| {2,}/).map(p => p.trim());
      if (parts.length < 1) return;

      const rawUrl = parts[nameIdx !== -1 ? nameIdx : 0] || "";
      const rawTitle = titleIdx !== -1 ? parts[titleIdx] : "";
      let rawTags = parts[tagsIdx !== -1 ? tagsIdx : 2] || "";
      let rawDate = parts[dateIdx !== -1 ? dateIdx : 1] || "";

      // DATA FIX: If date column contains common tags and no numbers, swap them
      const isActuallyTag = (str: string) => /cringe|private|commercial|report|freelance|smm|talking head/i.test(str) && !/\d/.test(str);
      const isActuallyDate = (str: string) => /\d{4}|until/i.test(str);

      if (isActuallyTag(rawDate) && isActuallyDate(rawTags)) {
        [rawDate, rawTags] = [rawTags, rawDate];
      }

      const urlMatch = rawUrl.match(/(https?:\/\/[^\s,]+)/);
      if (!urlMatch) return;
      
      const cleanUrl = urlMatch[1].replace(/[)\]"”'.,]+$/, ''); 
      const workKey = `vid-${cleanUrl.toLowerCase()}-${rawDate}`;
      
      if (seenWorkKeys.has(workKey)) return;
      seenWorkKeys.add(workKey);

      if (localEdits[workKey]) {
        videos.push(localEdits[workKey]);
        return;
      }

      const tags = rawTags.split(/[,;|]+/).map(t => t.trim()).filter(t => t.length > 1);
      
      videos.push({
        id: workKey,
        url: cleanUrl,
        cleanUrl: cleanUrl,
        title: rawTitle || "Untitled Project",
        tags,
        date: rawDate.trim() || "Archive",
        platform: getPlatform(cleanUrl),
        thumbnail: getThumbnail(cleanUrl)
      });
    });
  });

  return videos.sort((a, b) => b.date.localeCompare(a.date));
};

export const getPlatform = (url: string): VideoWork['platform'] => {
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'youtube';
  if (lowUrl.includes('vimeo.com')) return 'vimeo';
  if (lowUrl.includes('vk.com')) return 'vk';
  if (lowUrl.includes('tiktok.com')) return 'tiktok';
  if (lowUrl.includes('instagram.com')) return 'instagram';
  return 'other';
};

export const getThumbnail = (url: string): string => {
  if (url.includes('shorts/')) {
    const id = url.split('shorts/')[1]?.split(/[?&]/)[0];
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  }
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://img.youtube.com/vi/${ytMatch[2]}/mqdefault.jpg`;
  }
  
  if (url.includes('vimeo')) {
    const id = url.match(/vimeo.com\/(\d+)/)?.[1] || 'vimeo';
    return `https://picsum.photos/seed/vimeo-${id}/640/360?blur=1`;
  }

  return `https://picsum.photos/seed/${btoa(url).slice(-10)}/640/360`;
};
