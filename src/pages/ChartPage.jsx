// frontend-webmusic/src/pages/ChartPage.jsx

import React, { useState, useCallback } from 'react';
import { useAudio } from '../hooks/useAudio';
import { musicService } from '../modules/music/services/musicService';
import ChartList from '../components/music/ChartList';
import RealTimeChart from '../components/music/RealTimeChart';
import TopChartSection from '../components/music/TopChartSection';
import Button from '../components/common/Button';
import { Play, Loader2, TrendingUp, Clock, Calendar, Music } from 'lucide-react';
import { toast } from 'react-toastify';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const ChartPage = () => {
    const [selectedSongIndex, setSelectedSongIndex] = useState(null);
    const { playSong } = useAudio();

    const fetchChartData = useCallback((params) => musicService.getChart(params), []);

    const {
        items: chartData,
        loading,
        hasMore,
        lastElementRef,
        error
    } = useInfiniteScroll({ fetcher: fetchChartData, limit: 20 });

    if (error && !loading) {
        toast.error("Đã có lỗi xảy ra khi tải bảng xếp hạng.");
    }

    const handlePlayAll = () => {
        if (!chartData || chartData.length === 0) {
            toast.info("Bảng xếp hạng trống.");
            return;
        }
        const songList = chartData.map(entry => entry.song);
        playSong(songList[0], songList);
    };

    const handlePlaySong = (songToPlay) => {
        if (!chartData || chartData.length === 0) return;
        const songList = chartData.map(entry => entry.song);
        playSong(songToPlay, songList);
    };

    const currentDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isLoadingFirstTime = loading && chartData.length === 0;
    const isLoadingMore = loading && chartData.length > 0;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10 dark:from-cyan-400/5 dark:via-blue-500/3 dark:to-purple-500/5" />
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
                <div className="relative z-10 px-6 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="text-left">
                                    <h1 className="text-6xl lg:text-7xl font-black">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                            # MuzoChart
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-8">
                                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Cập nhật hàng giờ</span></div>
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{currentDate}</span></div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    onClick={handlePlayAll}
                                    disabled={loading || chartData.length === 0}
                                    size="lg"
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Phát tất cả
                                </Button>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm rounded-lg border border-white/30 dark:border-slate-700/40">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium">Top 100 bài hát</span>
                                </div>
                            </div>
                        </div>
                        {!isLoadingFirstTime && chartData.length > 0 && (
                            <div className="mb-8">
                                <RealTimeChart
                                    chartData={chartData}
                                    selectedSongIndex={selectedSongIndex}
                                    onSelectSong={setSelectedSongIndex}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Content */}
            <div className="relative z-10 -mt-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {!isLoadingFirstTime && chartData.length >= 3 && (
                        <TopChartSection
                            chartData={chartData}
                            onPlaySong={handlePlaySong}
                        />
                    )}
                    <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-20">
                            <div className="h-full bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-slate-900/95 dark:via-slate-900/50 dark:to-transparent rounded-b-2xl"></div>
                        </div>
                        {isLoadingFirstTime ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">Đang tải bảng xếp hạng...</p>
                            </div>
                        ) : chartData.length > 0 ? (
                            <ChartList
                                chartData={chartData}
                                lastItemRef={lastElementRef}
                                isLoadingMore={isLoadingMore}
                            />
                        ) : (
                            <div className="text-center py-20">
                                <Music className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Không có dữ liệu bảng xếp hạng</h3>
                                <p className="text-slate-500 dark:text-slate-400">Vui lòng thử lại sau</p>
                            </div>
                        )}
                        {!loading && !hasMore && chartData.length > 0 && (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Đã hết bảng xếp hạng.</p>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes pulse-border { 0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(6, 182, 212, 0); } }
                .animate-pulse-border { animation: pulse-border 2s infinite; }
            `}</style>
        </div>
    );
};

export default ChartPage;