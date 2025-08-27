import React, { useState, useEffect } from 'react';
import { musicService } from '../../modules/music/services/musicService';
import SongCard from './SongCard';
import Button from '../common/Button';
import { useAudio } from '../../hooks/useAudio';
import { toast } from 'react-toastify';
import { RefreshCw, Loader2, Crown } from 'lucide-react';

const SuggestedSongs = () => {
    const [randomSongs, setRandomSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { playSong } = useAudio();

    const fetchRandomSongs = async (showRefreshLoader = false) => {
        if (showRefreshLoader) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await musicService.getRandomSongs(9);
            if (response.success) {
                setRandomSongs(response.data);
            } else {
                toast.error('Không thể tải danh sách bài hát gợi ý');
            }
        } catch (error) {
            console.error('Error fetching random songs:', error);
            toast.error('Có lỗi xảy ra khi tải bài hát gợi ý');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRandomSongs();
    }, []);

    const handlePlaySong = (song) => {
        playSong(song, randomSongs);
    };

    const handleRefresh = () => {
        fetchRandomSongs(true);
    };

    if (loading) {
        return (
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Gợi Ý Bài Hát
                    </h2>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 animate-pulse">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Gợi Ý Bài Hát
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Làm mới gợi ý"
                >
                    {refreshing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Songs List */}
            {randomSongs.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                    {randomSongs.map((song) => (
                        <div
                            key={song.id}
                            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
                            onClick={() => handlePlaySong(song)}
                        >
                            {/* Song Thumbnail */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={song.thumbnailPath ? `${import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn'}${song.thumbnailPath}` : 'https://via.placeholder.com/64'}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Play button overlay */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                                        <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                                {/* Premium badge if applicable */}
                                {song.isPremium && (
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                        <Crown className="w-3.5 h-3.5 text-white fill-white" />
                                    </div>
                                )}
                            </div>

                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                    {song.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">
                                    {song.singers && song.singers.length > 0 
                                        ? song.singers.map(s => s.name).join(', ')
                                        : 'Unknown Artist'
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-slate-400">Không có bài hát gợi ý nào để hiển thị.</p>
                </div>
            )}
        </section>
    );
};

export default SuggestedSongs;
