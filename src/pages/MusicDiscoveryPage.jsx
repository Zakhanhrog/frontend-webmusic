// frontend-webmusic/src/pages/MusicDiscoveryPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "../components/music/HeroSlider";
import FeaturedSongs from "../components/music/FeaturedSongs";
import SuggestedSongs from "../components/music/SuggestedSongs";
import PlaylistCard from "../components/music/PlaylistCard";
import SongCard from "../components/music/SongCard";
import ArtistCard from "../components/music/ArtistCard";
import ChartList from "../components/music/ChartList";
import { musicService } from "../modules/music/services/musicService";
import { toast } from "react-toastify";
import { useAudio } from "../hooks/useAudio";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { Music, Play, Youtube, Facebook, Instagram, Twitter } from "lucide-react";

const Section = ({ title, viewAllLink = "#", onPlayAll, children }) => (
    <section className="space-y-6">
      <div className="group relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>
          {onPlayAll && (
              <button
                  onClick={onPlayAll}
                  className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600/80 rounded-full text-slate-800 dark:text-white
                     opacity-0 group-hover:opacity-100
                     transform scale-75 group-hover:scale-100
                     transition-all duration-300 ease-in-out"
                  aria-label={`Phát tất cả ${title}`}
                  data-tooltip-id="global-tooltip"
                  data-tooltip-content={`Phát tất cả`}
              >
                <Play size={20} className="ml-0.5" />
              </button>
          )}
        </div>

        {viewAllLink && (
            <Link
                to={viewAllLink}
                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Tất cả
            </Link>
        )}
      </div>
      {children}
    </section>
);

const Footer = () => {
  return (
      <footer className="relative bg-slate-50 dark:bg-slate-900 mt-16 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">Doanh nghiệp quản lý</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">
                Công ty Cổ phần Tập đoàn Muzo Việt Nam. GCĐKKD: 1234567890 do sở KH & ĐT TP.HN cấp ngày 9/9/2025.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Địa chỉ: Số 23, Lô TT01, Mỹ Đình 2, Hà Nội, Việt Nam.
              </p>
              <div className="mt-4">
                <h5 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">Người chịu trách nghiệm nội dung</h5>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Ông Ngô Gia Khánh</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">Thông tin dịch vụ</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">
                GPMXH: 888/GP-BTTTT do Bộ Thông Tin và Truyền Thông cấp ngày 22/9/2025.
              </p>
              <div className="mt-4">
                <p className="text-slate-600 dark:text-slate-400 text-xs">CSKH/Liên hệ qua Zalo: 0987654321</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Email: contact@Muzo.com.vn</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <Link to="/" className="inline-flex items-center mb-4 group">
                <div className="w-20 h-20 group-hover:scale-105 transition-all duration-300">
                  <img src="/logo/Muzo.png" alt="Muzo Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
              <div className="flex items-center gap-4 mb-4">
                <a href="#" aria-label="Facebook" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" aria-label="Instagram" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" aria-label="Twitter" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" aria-label="Youtube" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 dark:text-red-400">Gia Khánh - Trần Tú - Phạm Khánh - Thái Hưng</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Muzo Music Platform. Dự án học tập tại CodeGym Hà Nội.
            </p>
          </div>
        </div>
      </footer>
  );
};

const SkeletonGrid = ({ items = 5, type = "default", cols = 5 }) => (
    <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${cols} gap-x-6 gap-y-8`}
    >
      {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="space-y-2 animate-pulse">
            <div
                className={`aspect-square bg-slate-200 dark:bg-slate-800 ${
                    type === "artist" ? "rounded-full" : "rounded-lg"
                }`}
            ></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          </div>
      ))}
    </div>
);

const MusicDiscoveryPage = () => {
  const { playSong } = useAudio();
  const [topSongs, setTopSongs] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [mostLikedSongs, setMostLikedSongs] = useState([]);
  const [mostLikedPlaylists, setMostLikedPlaylists] = useState([]);
  const [topSingers, setTopSingers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSongsForInfiniteScroll = useCallback((params) => musicService.getAllSongs(params), []);
  const {
    items: recentSongs,
    loading: recentSongsLoading,
    hasMore: hasMoreRecentSongs,
    lastElementRef
  } = useInfiniteScroll({ fetcher: fetchSongsForInfiniteScroll, limit: 10 });

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const [
          topSongsRes,
          topPlaylistsRes,
          recentPlaylistsRes,
          mostLikedSongsRes,
          mostLikedPlaylistsRes,
          topSingersRes,
          chartRes
        ] = await Promise.all([
          musicService.getTopSongs(5),
          musicService.getTopListenedPlaylists(),
          musicService.getRecentPlaylists(5),
          musicService.getMostLikedSongs(5),
          musicService.getMostLikedPlaylists(5),
          musicService.getTopSingers(5),
          musicService.getChart({ page: 1, limit: 100 }) // Lấy chart một lần
        ]);

        // SỬA LỖI Ở ĐÂY: Truy cập vào response.data để lấy mảng dữ liệu
        if (topSongsRes.success) setTopSongs(topSongsRes.data || []);
        if (topPlaylistsRes.success) {
          const visiblePlaylists = (topPlaylistsRes.data || []).filter(p => p.visibility === 'PUBLIC');
          setTopPlaylists(visiblePlaylists);
        }
        if (recentPlaylistsRes.success) {
          const visiblePlaylists = (recentPlaylistsRes.data || []).filter(p => p.visibility === 'PUBLIC');
          setRecentPlaylists(visiblePlaylists);
        }
        if (mostLikedSongsRes.success) setMostLikedSongs(mostLikedSongsRes.data || []);
        if (mostLikedPlaylistsRes.success) {
          const visiblePlaylists = (mostLikedPlaylistsRes.data || []).filter(p => p.visibility === 'PUBLIC');
          setMostLikedPlaylists(visiblePlaylists);
        }
        if (topSingersRes.success) setTopSingers(topSingersRes.data || []);
        if (chartRes.success) {
          // Chart API giờ trả về object, cần truy cập vào data.content
          const chartEntries = chartRes.data?.content || [];
          setChartData(chartEntries);
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
        toast.error("Không thể tải dữ liệu trang chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const handlePlaySingleSong = (songToPlay, contextPlaylist) => {
    playSong(songToPlay, contextPlaylist);
  };

  const handlePlayAll = (songList) => {
    if (!songList || songList.length === 0) {
      toast.info("Không có bài hát nào trong danh sách này.");
      return;
    }
    playSong(songList[0], songList);
  };

  const chartSongs = chartData.map(entry => entry.song);

  return (
      <div className="space-y-16">
        <HeroSlider />
        <FeaturedSongs playlists={mostLikedPlaylists} />

        <Section title="Playlist Nghe Nhiều" viewAllLink="/playlists?category=top-listened">
          {loading ? <SkeletonGrid items={5} /> : topPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {topPlaylists.slice(0, 5).map((p) => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có playlist nào để hiển thị.</p>}
        </Section>

        <SuggestedSongs />

        <Section title="Bài hát nghe nhiều" viewAllLink="/all-songs?category=popular" onPlayAll={() => handlePlayAll(topSongs)}>
          {loading ? <SkeletonGrid items={5} /> : topSongs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {topSongs.map((song) => <SongCard key={song.id} song={song} onPlay={() => handlePlaySingleSong(song, topSongs)} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có bài hát nào để hiển thị.</p>}
        </Section>

        <Section title="#MuzoChart" viewAllLink="/charts" onPlayAll={() => handlePlayAll(chartSongs.slice(0, 5))}>
          {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-3 rounded-lg animate-pulse"><div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div><div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-md ml-4"></div><div className="flex-1 ml-4 space-y-2"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div><div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div></div></div>
                ))}
              </div>
          ) : chartData.length > 0 ? <ChartList chartData={chartData.slice(0, 5)} /> : <p className="text-slate-500 dark:text-slate-400">Không có dữ liệu bảng xếp hạng.</p>}
        </Section>

        <Section title="Mới Phát Hành" viewAllLink="/all-songs" onPlayAll={() => handlePlayAll(recentSongs)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {recentSongs.map((song, index) => {
              const isLastElement = recentSongs.length === index + 1;
              return (
                  <div ref={isLastElement ? lastElementRef : null} key={song.id}>
                    <SongCard song={song} onPlay={() => handlePlaySingleSong(song, recentSongs)} />
                  </div>
              );
            })}
          </div>
          {recentSongsLoading && <SkeletonGrid items={5} cols={5}/>}
          {!recentSongsLoading && !hasMoreRecentSongs && recentSongs.length > 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 col-span-full mt-4">
                Đã hết bài hát để hiển thị.
              </p>
          )}
        </Section>

        <Section title="Playlist Mới" viewAllLink="/playlists?category=recent">
          {loading ? <SkeletonGrid items={5} /> : recentPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {recentPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có playlist mới nào để hiển thị.</p>}
        </Section>

        <Section title="Được Yêu Thích Nhất" onPlayAll={() => handlePlayAll(mostLikedSongs)}>
          {loading ? <SkeletonGrid items={5} /> : mostLikedSongs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {mostLikedSongs.map((song) => <SongCard key={song.id} song={song} onPlay={() => handlePlaySingleSong(song, mostLikedSongs)} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có bài hát nào được yêu thích để hiển thị.</p>}
        </Section>

        <Section title="Playlist Được Yêu Thích" viewAllLink="/playlists?category=most-liked">
          {loading ? <SkeletonGrid items={5} /> : mostLikedPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {mostLikedPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có playlist nào được yêu thích để hiển thị.</p>}
        </Section>

        <Section title="Nghệ sĩ nổi bật">
          {loading ? <SkeletonGrid items={5} type="artist" /> : topSingers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                {topSingers.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
              </div>
          ) : <p className="text-slate-500 dark:text-slate-400">Không có nghệ sĩ nào để hiển thị.</p>}
        </Section>

        <Footer />
      </div>
  );
};

export default MusicDiscoveryPage;