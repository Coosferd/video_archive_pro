
export interface VideoWork {
  id: string;
  url: string;
  title: string;
  tags: string[];
  date: string;
  platform: 'youtube' | 'vimeo' | 'vk' | 'tiktok' | 'instagram' | 'other';
  thumbnail: string;
  cleanUrl: string;
  isEdited?: boolean;
}

export interface FilterState {
  search: string;
  selectedTags: string[];
  selectedDates: string[];
}
