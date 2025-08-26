import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Music } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useDarkMode } from '../../hooks/useDarkMode';
import { musicService } from '../../modules/music/services/musicService';
import Button from '../common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const FeaturedSongs = ({ playlists = [] }) => {
    const { currentSong, isPlaying, playSong } = useAudio();
    const { isDarkMode } = useDarkMode();
    const [playlistsWithSongs, setPlaylistsWithSongs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chỉ hiển thị playlists thật từ API và filter out admin-hidden playlists
    const displayPlaylists = playlists.length > 0 ? 
        playlists.filter(playlist => playlist.visibility === 'PUBLIC').slice(0, 3) : [];

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            if (displayPlaylists.length === 0) return;
            
            setLoading(true);
            try {
                const playlistDetails = await Promise.all(
                    displayPlaylists.map(async (playlist) => {
                        if (playlist.songs && playlist.songs.length > 0) {
                            return playlist; // Đã có songs
                        }
                        try {
                            const details = await musicService.getPlaylistDetails(playlist.id);
                            return details.success ? { ...playlist, songs: details.data.songs || [] } : playlist;
                        } catch (error) {
                            console.error('Failed to fetch playlist details:', error);
                            return playlist;
                        }
                    })
                );
                setPlaylistsWithSongs(playlistDetails);
            } catch (error) {
                console.error('Error fetching playlist details:', error);
                setPlaylistsWithSongs(displayPlaylists);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [displayPlaylists.length]);

    const handlePlayPlaylist = async (playlist) => {
        if (!playlist.songs || playlist.songs.length === 0) {
            return;
        }
        playSong(playlist.songs[0], playlist.songs);
    };

    const isCurrentlyPlaying = (playlist) => {
        if (!playlist.songs || playlist.songs.length === 0) return false;
        return isPlaying && currentSong?.id === playlist.songs[0]?.id;
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('vi-VN');
    };

    if (displayPlaylists.length === 0) {
        return null; // Không hiển thị gì nếu không có playlists
    }

    const finalPlaylists = playlistsWithSongs.length > 0 ? playlistsWithSongs : displayPlaylists;

    return (
        <section className="space-y-6">
            {/* Header - Căn chỉnh với các section khác */}
            <div className="group relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Có Thể Bạn Thích
                    </h2>
                </div>
            </div>

            {/* Featured Playlists Grid - Horizontal Rectangle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalPlaylists.map((playlist, index) => (
                    <div 
                        key={playlist.id} 
                        className="group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-300 shadow-md hover:shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                    >
                        {/* Background Gradient Overlay */}
                        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                            index === 0 ? 'bg-gradient-to-br from-emerald-500/5 to-cyan-500/5' :
                            index === 1 ? 'bg-gradient-to-br from-purple-500/5 to-pink-500/5' :
                            'bg-gradient-to-br from-orange-500/5 to-yellow-500/5'
                        }`} />

                        {/* Content - Horizontal Layout */}
                        <div className="relative z-10 flex items-center gap-3">
                            {/* Playlist Thumbnail */}
                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                                    {playlist.thumbnailPath ? (
                                        <img 
                                            src={`${API_BASE_URL}${playlist.thumbnailPath}`}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                                            <Music className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    
                                    {/* Overlay Controls */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <Button
                                            size="icon"
                                            onClick={() => handlePlayPlaylist(playlist)}
                                            className={`w-6 h-6 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 ${
                                                isCurrentlyPlaying(playlist) 
                                                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                                                    : 'bg-white/20 hover:bg-white/40 text-white'
                                            }`}
                                        >
                                            {isCurrentlyPlaying(playlist) ? (
                                                <Pause size={12} />
                                            ) : (
                                                <Play size={12} className="ml-0.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Playing Indicator */}
                                {isCurrentlyPlaying(playlist) && (
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                        <div className="flex items-center gap-1 bg-cyan-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-lg">
                                            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                            Phát
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Playlist Info */}
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 truncate">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">
                                        Creator {playlist.creatorName || 'Muzo'}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Music size={10} />
                                        {playlist.songCount || 0} bài hát
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={10} />
                                        {formatNumber(playlist.likeCount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedSongs;
