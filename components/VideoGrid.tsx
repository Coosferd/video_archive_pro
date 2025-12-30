
import React from 'react';
import { VideoWork } from '../types';
import VideoCard from './VideoCard';

interface Props {
  videos: VideoWork[];
  onVideoClick: (video: VideoWork) => void;
  onEditClick: (video: VideoWork) => void;
}

const VideoGrid: React.FC<Props> = ({ videos, onVideoClick, onEditClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onClick={() => onVideoClick(video)} 
          onEditClick={onEditClick}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
