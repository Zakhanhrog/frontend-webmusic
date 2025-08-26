import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Crown, ListPlus, Plus, Heart, Headphones } from 'lucide-react';
import Button from '../common/Button';
import { LikeButton } from '../../modules/music/components/LikeButton';
import { AddToPlaylistModal } from '../../modules/music/components/AddToPlaylistModal';
import { useAudio } from '../../hooks/useAudio';
import { useAuth } from '../../hooks/useAuth';
import { musicService } from '../../modules/music/services/musicService';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const SongListItem = ({ song, index, onPlay }) => {
    const { isPlaying, currentSong, addToQueue } = useAudio();
    const { isAuthenticated } = useAuth();
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(song.isLikedByCurrentUser);
    const [likeCount, setLikeCount] = useState(song.likeCount);

    const isCurrentlyPlaying = isPlaying && currentSong?.id === song.id;

    const handlePlayPause = () => {
        if (onPlay) {
            onPlay(song);
        }
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        addToQueue(song);
        toast.success(`Đã thêm "${song.title}" vào hàng đợi`);
    };

    const handleToggleLike = useCallback(async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thích bài hát');
            return;
        }

        try {
            const newIsLiked = !isLiked;
            const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
            
            // Optimistic update
            setIsLiked(newIsLiked);
            setLikeCount(newLikeCount);

            const response = await musicService.toggleSongLike(song.id);
            
            if (!response.success) {
                // Rollback on failure
                setIsLiked(!newIsLiked);
                setLikeCount(likeCount);
                toast.error('Có lỗi xảy ra khi thích bài hát');
            }
        } catch (error) {
            // Rollback on error
            setIsLiked(!isLiked);
            setLikeCount(likeCount);
            console.error('Failed to toggle song like:', error);
            toast.error('Có lỗi xảy ra khi thích bài hát');
        }
    }, [isAuthenticated, isLiked, likeCount, song.id]);

    return (
        <>
            <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
                {/* Index */}
                <div className="text-sm text-slate-400 w-6 text-center">
                    {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="relative">
                    <img
                        src={
                            song.thumbnailPath
                                ? `${API_BASE_URL}${song.thumbnailPath}`
                                : "https://via.placeholder.com/48"
                        }
                        alt={song.title}
                        className="w-12 h-12 rounded-md object-cover"
                    />
                    {song.isPremium && (
                        <Crown className="absolute top-1 left-1 w-3 h-3 text-amber-400 fill-amber-400" />
                    )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                    <Link
                        to={`/song/${song.id}`}
                        className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:underline block"
                    >
                        {song.title}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {song.singers ? song.singers.map((s) => s.name).join(", ") : song.creatorName}
                    </p>
                </div>

                {/* Listen Count */}
                <div className="hidden md:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Headphones size={16} />
                    <span>{song.listenCount?.toLocaleString("vi-VN") || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleAddToQueue}
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content="Thêm vào hàng đợi"
                    >
                        <ListPlus size={18} />
                    </Button>
                    
                    <LikeButton
                        initialIsLiked={isLiked}
                        initialLikeCount={likeCount}
                        onToggleLike={handleToggleLike}
                        showCount={false}
                        size={18}
                    />
                    
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsAddToPlaylistModalOpen(true)}
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content="Thêm vào playlist"
                    >
                        <Plus size={18} />
                    </Button>
                    
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handlePlayPause}
                    >
                        {isCurrentlyPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                </div>
            </div>

            {/* Add to Playlist Modal */}
            {isAddToPlaylistModalOpen && (
                <AddToPlaylistModal
                    isOpen={isAddToPlaylistModalOpen}
                    onClose={() => setIsAddToPlaylistModalOpen(false)}
                    songToAdd={song}
                />
            )}
        </>
    );
};

export default SongListItem;
