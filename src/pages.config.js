import Explore from './pages/Explore';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import SetDetails from './pages/SetDetails';
import Settings from './pages/Settings';
import StudyFlashcard from './pages/StudyFlashcard';
import StudyLearn from './pages/StudyLearn';
import StudyTest from './pages/StudyTest';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import PracticeTests from './pages/PracticeTests';
import TakePracticeTest from './pages/TakePracticeTest';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Explore": Explore,
    "Home": Home,
    "Pricing": Pricing,
    "SetDetails": SetDetails,
    "Settings": Settings,
    "StudyFlashcard": StudyFlashcard,
    "StudyLearn": StudyLearn,
    "StudyTest": StudyTest,
    "Leaderboard": Leaderboard,
    "Achievements": Achievements,
    "PracticeTests": PracticeTests,
    "TakePracticeTest": TakePracticeTest,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};