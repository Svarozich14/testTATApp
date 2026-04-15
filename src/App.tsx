import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage/ui/SearchPage';
import { TourPage } from './pages/TourPage/ui/TourPage';

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/tour/:priceId/:hotelId" element={<TourPage />} />
        </Routes>
      </div>
    </Router>
  );
}
