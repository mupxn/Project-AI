import './App.css';
import React from 'react';
import { Route , Routes } from "react-router-dom";
import HomePage from "./page/HomePage"
import UserPage from "./page/UserPage"
import SearchPage from './page/SearchPage';
import Sidebar from './element/Sidebar';
function App() {
  return (
    <div className="App">
      <div className='container'>
        <div className='sidebarContainer'><Sidebar/></div>
        <div className='page'>
          <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/user" element={<UserPage />}/>
            <Route path="/search" element={<SearchPage />}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
