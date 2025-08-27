// frontend-webmusic/src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/layout/LandingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Login, Register, Profile } from "./modules/auth";
import ChangePassword from "./modules/auth/pages/ChangePassword";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import MusicDiscoveryPage from "./pages/MusicDiscoveryPage";
import ArtistDetailPage from "./modules/music/pages/ArtistDetailPage";
import ChartPage from './pages/ChartPage';
import AIResultsPage from './pages/AIResultsPage';
import {
  UserManagement,
  SingerManagement,
  SongManagementAdmin,
  CreateSongAdmin,
  EditSongAdmin,
  SubmissionManagement,
  CreatorManagement,
  CreatorDetailPage,
  TagManagement,
} from "./modules/admin";
import {
  SongManagement,
  PlaylistManagement,
  SongDetail,
  PlaylistDetailPage,
  AllPlaylistsPage,
  AllSongsPage,
} from "./modules/music";
import {
  CreatorDashboard,
  MySubmissions,
  SongSubmission,
} from "./modules/creator";
import MyPublishedSongs from "./modules/creator/pages/MyPublishedSongs";
import SubmissionDetail from "./modules/creator/pages/SubmissionDetail";
import {
  PremiumUpgrade,
  TransactionHistory,
  PaymentResult,
} from "./modules/premium";
import { SearchResults } from "./modules/search";
import { ToastContainer } from "react-toastify";
import { ThemeProvider, useDarkMode } from "./hooks/useDarkMode.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { AudioProvider } from "./hooks/useAudio.jsx";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";
import NotFoundPage from "./pages/NotFoundPage";

function AppContent() {
  const { isDarkMode } = useDarkMode();

  return (
      <>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<MusicDiscoveryPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/song/:songId" element={<SongDetail />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/playlists" element={<AllPlaylistsPage />} />
            <Route path="/all-songs" element={<AllSongsPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
            <Route path="/singer/:id" element={<ArtistDetailPage />} />
            <Route path="charts" element={<ChartPage />} />
            <Route path="/ai-results" element={<AIResultsPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/songs" element={<SongManagement />} />
              <Route path="/my-playlists" element={<PlaylistManagement />} />
              <Route path="/premium" element={<PremiumUpgrade />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/transactions" element={<TransactionHistory />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />

              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/creators" element={<CreatorManagement />} />
              <Route path="/admin/creators/:creatorId" element={<CreatorDetailPage />} />
              <Route path="/admin/singers" element={<SingerManagement />} />
              <Route path="/admin/songs" element={<SongManagementAdmin />} />
              <Route path="/admin/songs/new" element={<CreateSongAdmin />} />
              <Route path="/admin/songs/edit/:songId" element={<EditSongAdmin />} />
              <Route path="/admin/submissions" element={<SubmissionManagement />} />
              <Route path="/admin/tags" element={<TagManagement />} />

              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/creator/my-library" element={<MyPublishedSongs />} />
              <Route path="/creator/my-submissions" element={<MySubmissions />} />
              <Route path="/creator/my-submissions/:submissionId" element={<SubmissionDetail />} />
              <Route path="/creator/submission/new" element={<SongSubmission />} />
              <Route path="/creator/submission/edit/:submissionId" element={<SongSubmission />} />

            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Tooltip
            id="global-tooltip"
            style={{
              backgroundColor: isDarkMode ? "rgb(6, 182, 212)" : "rgb(8, 145, 178)",
              color: "#FFFFFF",
              borderRadius: "8px",
            }}
            opacity={1}
            offset={10}
        />
        <ToastContainer
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            theme={isDarkMode ? "dark" : "light"}
            position="bottom-right"
        />
      </>
  );
}

function App() {
  return (
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AudioProvider>
              <AppContent />
            </AudioProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
  );
}

export default App;