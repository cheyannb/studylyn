import Home from './pages/Home';
import SetDetails from './pages/SetDetails';
import StudyFlashcard from './pages/StudyFlashcard';
import StudyLearn from './pages/StudyLearn';
import StudyTest from './pages/StudyTest';
import Pricing from './pages/Pricing';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SetDetails": SetDetails,
    "StudyFlashcard": StudyFlashcard,
    "StudyLearn": StudyLearn,
    "StudyTest": StudyTest,
    "Pricing": Pricing,
    "Explore": Explore,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};