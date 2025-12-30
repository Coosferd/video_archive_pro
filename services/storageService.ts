
import { VideoWork } from '../types';

const STORAGE_KEY = 'v-archive-edits';

export const saveEdit = (video: VideoWork) => {
  const edits = getAllEdits();
  edits[video.id] = video;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
};

export const getAllEdits = (): Record<string, VideoWork> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const clearAllEdits = () => {
  localStorage.removeItem(STORAGE_KEY);
};
