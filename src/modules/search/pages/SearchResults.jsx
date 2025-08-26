// frontend-webmusic/src/modules/search/pages/SearchResults.jsx

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { musicService } from '../../music/services/musicService';
import SongListItem from '../../../components/music/SongListItem';
import PlaylistCard from '../../../components/music/PlaylistCard';
import ArtistCard from '../../../components/music/ArtistCard';
import { useAudio } from '../../../hooks/useAudio';
import { toast } from 'react-toastify';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useDebounce } from '../../../hooks/useDebounce';

const SkeletonGrid = ({ CardComponent, count = 5 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className={`aspect-square bg-slate-200 dark:bg-slate-800 ${CardComponent === ArtistCard ? 'rounded-full' : 'rounded-lg'}`}></div>
                <div className="h-4 mt-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 mt-1 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
        ))}
    </div>
);

const SkeletonList = ({ count = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

const TABS = ['all', 'songs', 'playlists', 'singers'];

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const activeTab = searchParams.get('tab') || 'all';

    const debouncedQuery = useDebounce(query, 500);
    const { playSong } = useAudio();

    const fetchSongs = useCallback((params) => musicService.getAllSongs({ ...params, search: debouncedQuery }), [debouncedQuery]);
    const fetchPlaylists = useCallback((params) => musicService.searchPlaylists({ ...params, keyword: debouncedQuery }), [debouncedQuery]);
    const fetchSingers = useCallback((params) => musicService.searchSingers({ ...params, keyword: debouncedQuery }), [debouncedQuery]);

    const { items: songs, loading: songsLoading, hasMore: hasMoreSongs, lastElementRef: lastSongRef, reset: resetSongs } = useInfiniteScroll({ fetcher: fetchSongs, limit: 10 });
    const { items: playlists, loading: playlistsLoading, hasMore: hasMorePlaylists, lastElementRef: lastPlaylistRef, reset: resetPlaylists } = useInfiniteScroll({ fetcher: fetchPlaylists, limit: 10 });
    const { items: singers, loading: singersLoading, hasMore: hasMoreSingers, lastElementRef: lastSingerRef, reset: resetSingers } = useInfiniteScroll({ fetcher: fetchSingers, limit: 10 });

    useEffect(() => {
        if (debouncedQuery) {
            resetSongs();
            resetPlaylists();
            resetSingers();
        }
    }, [debouncedQuery, resetSongs, resetPlaylists, resetSingers]);

    const handleTabChange = (tab) => {
        setSearchParams({ q: query, tab });
    };

    const renderTabContent = () => {
        const renderSongsSection = (isFullPage = false) => (
            songs.length > 0 || songsLoading ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Bài hát</h2>
                    <div className="space-y-2">
                        {songs.map((song, index) => (
                            <div ref={isFullPage && songs.length === index + 1 ? lastSongRef : null} key={song.id}>
                                <SongListItem song={song} index={index} onPlay={() => playSong(song, songs)} />
                            </div>
                        ))}
                    </div>
                    {songsLoading && <SkeletonList count={3} />}
                    {!songsLoading && !hasMoreSongs && isFullPage && <p className="text-center mt-4 text-slate-500">Đã hết kết quả</p>}
                </section>
            ) : null
        );

        const renderPlaylistsSection = (isFullPage = false) => (
            playlists.length > 0 || playlistsLoading ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Playlists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {playlists.map((p, index) => (
                            <div ref={isFullPage && playlists.length === index + 1 ? lastPlaylistRef : null} key={p.id}>
                                <PlaylistCard playlist={p} />
                            </div>
                        ))}
                    </div>
                    {playlistsLoading && <SkeletonGrid CardComponent={PlaylistCard} count={5} />}
                    {!playlistsLoading && !hasMorePlaylists && isFullPage && <p className="text-center mt-4 text-slate-500">Đã hết kết quả</p>}
                </section>
            ) : null
        );

        const renderSingersSection = (isFullPage = false) => (
            singers.length > 0 || singersLoading ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Nghệ sĩ</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {singers.map((artist, index) => (
                            <div ref={isFullPage && singers.length === index + 1 ? lastSingerRef : null} key={artist.id}>
                                <ArtistCard artist={artist} />
                            </div>
                        ))}
                    </div>
                    {singersLoading && <SkeletonGrid CardComponent={ArtistCard} count={5} />}
                    {!singersLoading && !hasMoreSingers && isFullPage && <p className="text-center mt-4 text-slate-500">Đã hết kết quả</p>}
                </section>
            ) : null
        );

        const noResults = !songsLoading && !playlistsLoading && !singersLoading && songs.length === 0 && playlists.length === 0 && singers.length === 0;

        switch (activeTab) {
            case 'songs':
                return songs.length > 0 || songsLoading ? renderSongsSection(true) : <p>Không tìm thấy bài hát nào.</p>;
            case 'playlists':
                return playlists.length > 0 || playlistsLoading ? renderPlaylistsSection(true) : <p>Không tìm thấy playlist nào.</p>;
            case 'singers':
                return singers.length > 0 || singersLoading ? renderSingersSection(true) : <p>Không tìm thấy nghệ sĩ nào.</p>;
            case 'all':
            default:
                return noResults ? <p>Không tìm thấy kết quả nào.</p> : (
                    <>
                        {renderSongsSection()}
                        {renderPlaylistsSection()}
                        {renderSingersSection()}
                    </>
                );
        }
    };

    if (!query) {
        return <div className="text-center py-10"><h1 className="text-2xl font-bold">Tìm kiếm</h1><p className="text-slate-500 dark:text-slate-400">Vui lòng nhập từ khóa để tìm kiếm bài hát, playlist, nghệ sĩ...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Kết quả tìm kiếm cho "{query}"</h1>
                <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                                    activeTab === tab
                                        ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                                }`}
                            >
                                {tab === 'all' ? 'Tất cả' : tab}
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

export default SearchResults;