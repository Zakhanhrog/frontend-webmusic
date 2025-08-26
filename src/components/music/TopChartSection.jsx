import React from 'react';
import { Play, Pause, Crown } from 'lucide-react';
import Button from '../common/Button';
import { useAudio } from '../../hooks/useAudio';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const TopChartSection = ({ chartData, onPlaySong }) => {
    const { currentSong, isPlaying } = useAudio();
    const { isDarkMode } = useDarkMode();

    if (!chartData || chartData.length < 3) {
        return null;
    }

    const top3 = chartData.slice(0, 3);
    const percentages = ['50%', '27%', '23%']; // Mock percentages

    return (
        <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl">
                {top3.map((entry, index) => {
                    const isCurrentlyPlaying = isPlaying && currentSong?.id === entry.song.id;
                    const rankColors = [
                        {
                            bg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
                            border: 'border-purple-300 dark:border-purple-600',
                            text: 'text-purple-600 dark:text-purple-400',
                            number: 'text-purple-700 dark:text-purple-300',
                            accent: 'bg-purple-500'
                        },
                        {
                            bg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/30',
                            border: 'border-slate-300 dark:border-slate-600',
                            text: 'text-slate-600 dark:text-slate-400',
                            number: 'text-slate-700 dark:text-slate-300',
                            accent: 'bg-slate-500'
                        },
                        {
                            bg: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
                            border: 'border-amber-300 dark:border-amber-600',
                            text: 'text-amber-600 dark:text-amber-400',
                            number: 'text-amber-700 dark:text-amber-300',
                            accent: 'bg-amber-500'
                        }
                    ];

                    const colors = rankColors[index];

                    return (
                        <div 
                            key={entry.song.id}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${colors.bg} ${colors.border} hover:scale-105 hover:shadow-lg group`}
                        >
                            {/* Rank Number */}
                            <div className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black text-white ${colors.accent}`}>
                                {index + 1}
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onPlaySong(entry.song)}
                                    className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-lg"
                                >
                                    {isCurrentlyPlaying ? (
                                        <Pause size={14} />
                                    ) : (
                                        <Play size={14} className="ml-0.5" />
                                    )}
                                </Button>
                            </div>

                            {/* Song Image */}
                            <div className="relative mx-auto mb-3" style={{ width: '90px', height: '90px' }}>
                                <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
                                    <img 
                                        src={entry.song.thumbnailPath ? 
                                            `${API_BASE_URL}${entry.song.thumbnailPath}` : 
                                            'https://via.placeholder.com/120'
                                        }
                                        alt={entry.song.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {entry.song.isPremium && (
                                        <div className="absolute top-1.5 right-1.5 bg-amber-400 rounded-full p-0.5">
                                            <Crown className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Play Button Center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 rounded-lg">
                                    <Button
                                        size="icon"
                                        onClick={() => onPlaySong(entry.song)}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white border-none"
                                    >
                                        {isCurrentlyPlaying ? (
                                            <Pause size={20} />
                                        ) : (
                                            <Play size={20} className="ml-1" />
                                        )}
                                    </Button>
                                </div>

                                {/* Playing Indicator */}
                                {isCurrentlyPlaying && (
                                    <div className="absolute -inset-1 rounded-lg border-2 border-cyan-400 animate-pulse" />
                                )}
                            </div>

                            {/* Song Info */}
                            <div className="text-center">
                                <Link 
                                    to={`/song/${entry.song.id}`}
                                    className={`block font-bold text-base mb-1 truncate hover:underline transition-colors ${
                                        isCurrentlyPlaying 
                                            ? 'text-cyan-600 dark:text-cyan-400' 
                                            : colors.number
                                    }`}
                                    title={entry.song.title}
                                >
                                    {entry.song.title}
                                </Link>
                                <div className={`text-xs mb-2 truncate ${colors.text}`} title={entry.song.singers?.map(s => s.name).join(', ')}>
                                    {entry.song.singers?.map(s => s.name).join(', ') || 'Unknown Artist'}
                                </div>

                                {/* Percentage */}
                                <div className={`text-2xl font-black ${colors.number} mb-2`}>
                                    {percentages[index]}
                                </div>

                                {/* Stats */}
                                <div className="flex justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span>{entry.song.listenCount?.toLocaleString('vi-VN') || 0} lượt nghe</span>
                                    <span>•</span>
                                    <span>{entry.song.likeCount?.toLocaleString('vi-VN') || 0} lượt thích</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopChartSection;
