
import { VideoWork } from '../types.ts';
import { getAllEdits } from './storageService.ts';

export const processRawData = (dataSources: string[]): VideoWork[] => {
  const videos: VideoWork[] = [];
  const localEdits = getAllEdits();
  
  const isTag = (s: string) => /cringe|private|commercial|report|freelance|smm|talking head|copyes|pokolenium|vertical|public|youtube|education|gamedev|travel|showreel|university/i.test(s);
  const isDate = (s: string) => /\d{4}|until/i.test(s);

  dataSources.forEach((source, sourceIdx) => {
    if (!source || source.trim().length < 5) return;
    
    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('tags') || !firstLine.includes('http');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const separator = source.includes('\t') ? '\t' : ',';

    dataLines.forEach((line, lineIdx) => {
      let parts: string[] = [];
      if (separator === ',') {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        parts = matches ? matches.map(m => m.replace(/"/g, '')) : [];
      } else {
        parts = line.split('\t').map(p => p.trim());
      }

      let url = "";
      let urlColIdx = -1;
      for (let i = 0; i < parts.length; i++) {
        const match = parts[i].match(/(https?:\/\/[^\s,]+)/);
        if (match) {
          url = match[1].replace(/[)\]"”'.,]+$/, '');
          urlColIdx = i;
          break;
        }
      }
      
      if (url) {
        const otherParts = parts.filter((_, idx) => idx !== urlColIdx);
        let rawDate = "";
        let rawTags = "";
        let rawTitle = "";

        otherParts.forEach(part => {
          if (isDate(part)) rawDate = part;
          else if (isTag(part)) rawTags = part;
          else if (part.length > 2 && !rawTitle) rawTitle = part;
        });

        if (!rawTitle) {
          rawTitle = parts[urlColIdx].replace(url, '').trim() || "Project Archive";
        }

        const tags = rawTags.split(/[,;|]+/).map(t => t.trim()).filter(t => t.length > 1);
        const finalDate = rawDate.trim() || "2014-2024";

        const id = `v-${sourceIdx}-${lineIdx}-${url.length}-${url.slice(-5)}`;
        
        if (localEdits[id]) {
          videos.push(localEdits[id]);
        } else {
          videos.push({
            id,
            url: url,
            cleanUrl: url,
            title: rawTitle.replace(/[“”""]/g, ''),
            tags,
            date: finalDate,
            platform: getPlatform(url),
            thumbnail: getThumbnail(url)
          });
        }
      }
    });
  });

  return videos.sort((a, b) => {
    const getYear = (s: string) => {
      const m = s.match(/\d{4}/);
      return m ? parseInt(m[0]) : 0;
    };
    return getYear(b.date) - getYear(a.date);
  });
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
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://img.youtube.com/vi/${ytMatch[2]}/mqdefault.jpg`;
  }
  
  if (url.includes('vimeo')) {
    const id = url.match(/vimeo.com\/(?:video\/)?(\d+)/)?.[1] || 'vimeo';
    return `https://picsum.photos/seed/vimeo-${id}/640/360?blur=1`;
  }

  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return `https://picsum.photos/seed/${Math.abs(hash)}/640/360`;
};
