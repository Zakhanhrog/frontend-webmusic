import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Play } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { musicService } from '../../modules/music/services/musicService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const PlaylistCard = ({ playlist }) => {
    const { playPlaylist } = useAudio();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handlePlayPlaylist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await musicService.getPlaylistDetails(playlist.id);
            if (response.success && response.data.songs && response.data.songs.length > 0) {
                const playlistData = response.data;

                if (!isAuthenticated) {
                    const firstPlayableSong = playlistData.songs.find(s => !s.isPremium);
                    if (!firstPlayableSong) {
                        toast.info('Playlist này chỉ chứa các bài hát Premium. Vui lòng đăng nhập.');
                        navigate('/login');
                        return;
                    }
                }

                playPlaylist(playlistData);
            } else {
                toast.warn('Playlist này không có bài hát nào để phát.');
            }
        } catch (error) {
            console.error("Failed to play playlist:", error);
            toast.error('Không thể phát playlist này.');
        }
    };

    return (
        <div className="group relative block p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors duration-300">
            <Link to={`/playlist/${playlist.id}`}>
                <div className="relative w-full aspect-square rounded-md overflow-hidden mb-4">
                    {playlist.thumbnailPath ? (
                        <img
                            src={`${API_BASE_URL}${playlist.thumbnailPath}`}
                            alt={playlist.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                            <Music className="w-1/2 h-1/2 text-slate-400" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                            onClick={handlePlayPlaylist}
                            className="w-12 h-12 bg-music-500 hover:bg-music-600 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg"
                        >
                            <Play size={24} className="ml-1" />
                        </button>
                    </div>
                </div>
            </Link>
            <div>
                <Link
                    to={`/playlist/${playlist.id}`}
                    className="font-semibold truncate text-slate-800 dark:text-slate-100 block hover:underline"
                >
                    {playlist.name}
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    Tạo bởi {playlist.creatorName}
                </p>
            </div>
        </div>
    );
};

export default PlaylistCard;