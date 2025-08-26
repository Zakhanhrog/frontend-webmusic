import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import SongListItem from '../components/music/SongListItem';
import PlaylistCard from '../components/music/PlaylistCard';
import ArtistCard from '../components/music/ArtistCard';
import { useAudio } from '../hooks/useAudio';
import { Sparkles } from 'lucide-react';

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'songs', label: 'Bài hát' },
    { key: 'playlists', label: 'Playlists' },
    { key: 'singers', label: 'Nghệ sĩ' },
];

const AIResultsPage = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { playSong } = useAudio();

    const mood = searchParams.get('mood');
    const activeTab = searchParams.get('tab') || 'all';
    const results = location.state?.results;

    if (!results) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Không có dữ liệu gợi ý</h1>
                <p className="text-slate-500 dark:text-slate-400">Vui lòng thử lại tính năng gợi ý từ MuzoAI.</p>
            </div>
        );
    }

    const { songs = [], playlists = [], singers = [] } = results;

    const handleTabChange = (tab) => {
        setSearchParams({ mood, tab });
    };

    const renderSongsSection = () => (
        <section>
            <h2 className="text-2xl font-semibold mb-4">Bài hát</h2>
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
    );

    const renderPlaylistsSection = () => (
        <section>
            <h2 className="text-2xl font-semibold mb-4">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {playlists.map(playlist => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
            </div>
        </section>
    );

    const renderSingersSection = () => (
        <section>
            <h2 className="text-2xl font-semibold mb-4">Nghệ sĩ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {singers.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
            </div>
        </section>
    );

    const renderTabContent = () => {
        const noResults = songs.length === 0 && playlists.length === 0 && singers.length === 0;

        if (noResults) {
            return <p className="text-slate-500 dark:text-slate-400">Không tìm thấy kết quả phù hợp với cảm xúc này.</p>;
        }

        switch (activeTab) {
            case 'songs':
                return songs.length > 0 ? renderSongsSection() : <p>Không có bài hát nào được gợi ý.</p>;
            case 'playlists':
                return playlists.length > 0 ? renderPlaylistsSection() : <p>Không có playlist nào được gợi ý.</p>;
            case 'singers':
                return singers.length > 0 ? renderSingersSection() : <p>Không có nghệ sĩ nào được gợi ý.</p>;
            case 'all':
            default:
                return (
                    <>
                        {songs.length > 0 && renderSongsSection()}
                        {playlists.length > 0 && renderPlaylistsSection()}
                        {singers.length > 0 && renderSingersSection()}
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

                <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
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
            </div>

            <div className="space-y-12">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AIResultsPage;