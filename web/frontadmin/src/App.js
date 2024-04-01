import './App.css';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './page/HomePage';
import UserPage from './page/UserPage';
import SearchPage from './page/SearchPage';
import Sidebar from './element/Sidebar';
import LogInPage from './page/LogInPage';

function App() {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';

  return (
    <div className="App">
      <div className='container'>
        {showSidebar && (
          <div className='sidebarContainer'><Sidebar /></div>
        )}
        <div className='page'>
          <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/user" element={<UserPage />}/>
            <Route path="/search" element={<SearchPage />}/>
            <Route path="/login" element={<LogInPage />}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
