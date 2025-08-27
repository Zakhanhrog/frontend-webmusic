import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import SongListItem from '../components/music/SongListItem';
import PlaylistCard from '../components/music/PlaylistCard';
import ArtistCard from '../components/music/ArtistCard';
import { useAudio } from '../hooks/useAudio';
import { Sparkles, Frown, Search } from 'lucide-react';
import Button from '../components/common/Button';

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'songs', label: 'Bài hát' },
    { key: 'playlists', label: 'Playlists' },
    { key: 'singers', label: 'Nghệ sĩ' },
];

const AIResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { playSong } = useAudio();

    // Sửa lỗi: Cần cả setter để cập nhật state
    const [results, setResults] = useState(location.state?.results);

    // Sửa lỗi: Dùng useEffect để đồng bộ state với location.state khi có navigation mới
    useEffect(() => {
        if (location.state?.results) {
            setResults(location.state.results);
            // Reset về tab 'all' mỗi khi có kết quả mới
            setSearchParams({ mood: searchParams.get('mood'), tab: 'all' });
        }
    }, [location.key]); // Lắng nghe `location.key` - nó sẽ thay đổi sau mỗi lần navigate

    const mood = searchParams.get('mood');
    const activeTab = searchParams.get('tab') || 'all';

    const handleTabChange = (tab) => {
        setSearchParams({ mood, tab });
    };

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20">
                <Search className="w-16 h-16 text-slate-400 mb-4" />
                <h1 className="text-2xl font-bold">Không có dữ liệu gợi ý</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Có vẻ như bạn đã truy cập trực tiếp trang này. Vui lòng thử lại tính năng gợi ý từ MuzoAI.</p>
                <Button onClick={() => navigate('/')} variant="primary">
                    Về trang chủ
                </Button>
            </div>
        );
    }

    const { songs = [], playlists = [], singers = [] } = results;
    const noResultsFound = songs.length === 0 && playlists.length === 0 && singers.length === 0;

    const renderNoResults = (message) => (
        <div className="flex flex-col items-center text-center py-12">
            <Frown className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
    );

    const renderSongsSection = () => (
        songs.length > 0 && (
            <section>
                <h2 className="text-2xl font-semibold mb-4">Bài hát gợi ý</h2>
                <div className="space-y-2">
                    {songs.map((song, index) => (
                        <SongListItem
                            key={song.id}
                            song={song}
                            index={index}
                            onPlay={() => playSong(song, songs)}
                        />
                    ))}
                </div>
            </section>
        )
    );

    const renderPlaylistsSection = () => (
        playlists.length > 0 && (
            <section>
                <h2 className="text-2xl font-semibold mb-4">Playlists phù hợp</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {playlists.map(playlist => (
                        <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                </div>
            </section>
        )
    );

    const renderSingersSection = () => (
        singers.length > 0 && (
            <section>
                <h2 className="text-2xl font-semibold mb-4">Có thể bạn sẽ thích nghệ sĩ này</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {singers.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                </div>
            </section>
        )
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'songs':
                return songs.length > 0 ? renderSongsSection() : renderNoResults("Không có bài hát nào được gợi ý.");
            case 'playlists':
                return playlists.length > 0 ? renderPlaylistsSection() : renderNoResults("Không có playlist nào được gợi ý.");
            case 'singers':
                return singers.length > 0 ? renderSingersSection() : renderNoResults("Không có nghệ sĩ nào được gợi ý.");
            case 'all':
            default:
                return (
                    <>
                        {renderSongsSection()}
                        {renderPlaylistsSection()}
                        {renderSingersSection()}
                    </>
                );
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600" />
                    <h1 className="text-3xl font-bold">Gợi ý từ MuzoAI</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                    Dành cho cảm xúc: <span className="font-semibold italic">"{mood}"</span>
                </p>

                {!noResultsFound && (
                    <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                        activeTab === tab.key
                                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            <div className="space-y-12">
                {noResultsFound
                    ? renderNoResults("Rất tiếc, Muzo không tìm thấy kết quả nào phù hợp. Vui lòng thử lại với một mô tả khác nhé!")
                    : renderTabContent()
                }
            </div>
        </div>
    );
};

export default AIResultsPage;