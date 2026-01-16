import Achievements from './pages/Achievements';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import PracticeTests from './pages/PracticeTests';
import Pricing from './pages/Pricing';
import SelectPracticeTest from './pages/SelectPracticeTest';
import SetDetails from './pages/SetDetails';
import Settings from './pages/Settings';
import StudyFlashcard from './pages/StudyFlashcard';
import StudyLearn from './pages/StudyLearn';
import StudyTest from './pages/StudyTest';
import TakePracticeTest from './pages/TakePracticeTest';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "Explore": Explore,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "PracticeTests": PracticeTests,
    "Pricing": Pricing,
    "SelectPracticeTest": SelectPracticeTest,
    "SetDetails": SetDetails,
    "Settings": Settings,
    "StudyFlashcard": StudyFlashcard,
    "StudyLearn": StudyLearn,
    "StudyTest": StudyTest,
    "TakePracticeTest": TakePracticeTest,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};