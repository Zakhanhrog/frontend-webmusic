import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowUp, ArrowDown, Minus, Pause, Crown, Headphones, Heart } from 'lucide-react';
import Button from '../../../components/common/Button';
import { useAudio } from '../../../hooks/useAudio';
import { useDarkMode } from '../../../hooks/useDarkMode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const ChartItem = ({ chartEntry, onPlay, index }) => {
    const { rank, previousRank, song } = chartEntry;
    const { currentSong, isPlaying } = useAudio();
    const { isDarkMode } = useDarkMode();

    if (!song) {
        return null;
    }

    const isCurrentlyPlaying = isPlaying && currentSong?.id === song.id;

    const getRankChange = () => {
        if (previousRank === null || previousRank === undefined) {
            return { icon: Minus, color: 'text-slate-400 dark:text-slate-500', text: '-', bgColor: 'bg-transparent' };
        }
        if (rank < previousRank) {
            const change = previousRank - rank;
            return { icon: ArrowUp, color: 'text-green-600 dark:text-green-400', text: change.toString(), bgColor: 'bg-transparent' };
        }
        if (rank > previousRank) {
            const change = rank - previousRank;
            return { icon: ArrowDown, color: 'text-red-600 dark:text-red-400', text: change.toString(), bgColor: 'bg-transparent' };
        }
        return { icon: Minus, color: 'text-slate-400 dark:text-slate-500', text: '-', bgColor: 'bg-transparent' };
    };

    const rankChange = getRankChange();

    const getRankDisplay = () => {
        if (rank === 1) {
            return {
                color: 'text-yellow-500',
                bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                textColor: 'text-white',
                shadow: 'shadow-lg shadow-yellow-500/30',
                icon: Crown
            };
        }
        if (rank === 2) {
            return {
                color: 'text-slate-400',
                bgColor: 'bg-gradient-to-br from-slate-300 to-slate-500',
                textColor: 'text-white',
                shadow: 'shadow-lg shadow-slate-500/30'
            };
        }
        if (rank === 3) {
            return {
                color: 'text-amber-600',
                bgColor: 'bg-gradient-to-br from-amber-500 to-amber-700',
                textColor: 'text-white',
                shadow: 'shadow-lg shadow-amber-500/30'
            };
        }
        return {
            color: 'text-slate-600 dark:text-slate-300',
            bgColor: 'bg-slate-100 dark:bg-slate-700',
            textColor: 'text-slate-700 dark:text-slate-300',
            shadow: 'shadow-md'
        };
    };

    const rankDisplay = getRankDisplay();

    const formatDuration = (duration) => {
        if (!duration) return '';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
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

    return (
        <div className={`group transition-all duration-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 relative overflow-hidden ${
            isCurrentlyPlaying ? 'bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20' : ''
        }`}>
            {/* Background Animation for Currently Playing */}
            {isCurrentlyPlaying && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-400/10 dark:to-blue-400/10 animate-pulse" />
            )}

            {/* Grid Layout matching header */}
            <div className="grid grid-cols-[4rem_1rem_1fr_12rem_5rem_5rem_5rem_3rem] gap-4 items-center px-6 py-4 relative z-10">
                {/* Rank */}
                <div className="flex items-center justify-center">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${rankDisplay.bgColor} ${rankDisplay.textColor} ${rankDisplay.shadow} ${
                        isCurrentlyPlaying ? 'scale-110' : ''
                    }`}>
                        {rankDisplay.icon && rank <= 3 ? (
                            <rankDisplay.icon className="w-5 h-5" />
                        ) : (
                            rank
                        )}
                        {isCurrentlyPlaying && (
                            <div className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Rank Change */}
                <div className="flex items-center justify-center">
                    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${rankChange.color}`}>
                        <rankChange.icon className="w-3 h-3 mb-0.5" />
                        <span className="text-xs font-medium leading-none">{rankChange.text}</span>
                    </div>
                </div>

                {/* Song Info */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                        <img 
                            src={song.thumbnailPath ? `${API_BASE_URL}${song.thumbnailPath}` : 'https://via.placeholder.com/56'} 
                            alt={song.title} 
                            className={`w-full h-full object-cover transition-all duration-300 ${isCurrentlyPlaying ? 'scale-110' : 'group-hover:scale-105'}`} 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onPlay(song)}
                                className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white border-none"
                            >
                                {isCurrentlyPlaying ? (
                                    <Pause size={18} />
                                ) : (
                                    <Play size={18} className="ml-0.5" />
                                )}
                            </Button>
                        </div>
                        {song.isPremium && (
                            <div className="absolute top-1 right-1 bg-amber-400 rounded-full p-1">
                                <Crown className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <Link 
                            to={`/song/${song.id}`} 
                            className={`font-semibold text-base truncate hover:underline block transition-colors duration-300 ${
                                isCurrentlyPlaying 
                                    ? 'text-cyan-600 dark:text-cyan-400' 
                                    : 'text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
                            }`}
                        >
                            {song.title}
                        </Link>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                            {song.singers ? song.singers.map(s => s.name).join(', ') : song.artist || 'Unknown Artist'}
                        </div>
                    </div>
                </div>

                {/* Artists (Desktop) */}
                <div className="hidden md:block text-sm text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {song.singers ? song.singers.map(s => s.name).join(', ') : song.artist || 'Unknown Artist'}
                </div>

                {/* Duration (Desktop) */}
                <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400 text-center group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                    {formatDuration(song.duration)}
                </div>

                {/* Listen Count (Desktop) */}
                <div className="hidden md:flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 gap-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                    <Headphones className="w-4 h-4" />
                    <span>{formatNumber(song.listenCount)}</span>
                </div>

                {/* Like Count (Desktop) */}
                <div className="hidden md:flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 gap-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                    <Heart className="w-4 h-4" />
                    <span>{formatNumber(song.likeCount)}</span>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlay(song)}
                        className={`w-10 h-10 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                            isCurrentlyPlaying 
                                ? 'opacity-100 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30' 
                                : 'text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30'
                        }`}
                    >
                        {isCurrentlyPlaying ? (
                            <Pause size={20} />
                        ) : (
                            <Play size={20} className="ml-0.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default ChartItem;