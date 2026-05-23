import { useState, useCallback } from "react";
import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage";
import PlayMenuPage from "./pages/PlayMenuPage";
import LearnMenuPage from "./pages/LearnMenuPage";
import CreateMenuPage from "./pages/CreateMenuPage";
import LessonsPage from "./pages/LessonsPage";
import LessonPlayerPage from "./pages/LessonPlayerPage";
import FreePlayPage from "./pages/FreePlayPage";
import RhythmGamePage from "./pages/RhythmGamePage";
import SimonSaysPage from "./pages/SimonSaysPage";
import EarTrainerPage from "./pages/EarTrainerPage";
import LoopStudioPage from "./pages/LoopStudioPage";
import StickerBookPage from "./pages/StickerBookPage";
import FunFactsPage from "./pages/FunFactsPage";
import NoteMatchPage from "./pages/NoteMatchPage";
import DetectivePage from "./pages/DetectivePage";
import SongStudioPage from "./pages/SongStudioPage";
import StickerToast from "./components/StickerToast";
import RankUpCelebration from "./components/RankUpCelebration";

function App() {
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    perfect: 0, great: 0, good: 0, miss: 0, streak: 0, maxStreak: 0
  });

  const resetGame = useCallback(() => {
    setScore(0);
    setGameStats({ perfect: 0, great: 0, good: 0, miss: 0, streak: 0, maxStreak: 0 });
  }, []);

  return (
    <div className="App min-h-screen">
      <HashRouter>
        <StickerToast />
        <RankUpCelebration />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayMenuPage />} />
            <Route path="/learn" element={<LearnMenuPage />} />
            <Route path="/create" element={<CreateMenuPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:num" element={<LessonPlayerPage />} />
            <Route path="/free-play" element={<FreePlayPage />} />
            <Route path="/rhythm-game" element={
              <RhythmGamePage score={score} setScore={setScore} gameStats={gameStats} setGameStats={setGameStats} resetGame={resetGame} />
            } />
            <Route path="/simon-says" element={
              <SimonSaysPage score={score} setScore={setScore} gameStats={gameStats} setGameStats={setGameStats} resetGame={resetGame} />
            } />
            <Route path="/ear-trainer" element={<EarTrainerPage />} />
            <Route path="/loop-studio" element={<LoopStudioPage />} />
            <Route path="/fun-facts" element={<FunFactsPage />} />
            <Route path="/note-match" element={<NoteMatchPage />} />
            <Route path="/detective" element={<DetectivePage />} />
            <Route path="/song-studio" element={<SongStudioPage />} />
            <Route path="/sticker-book" element={<StickerBookPage />} />
          </Routes>
        </AnimatePresence>
      </HashRouter>
    </div>
  );
}

export default App;
