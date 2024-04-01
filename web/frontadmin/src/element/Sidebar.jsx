import React from 'react'
import { NavLink } from 'react-router-dom';
import HomeIcon from '../icon/HomeIcon';
import UserIcon from '../icon/UserIcon';
import AdminIcon from '../icon/AdminIcon';
import SearchIcon from '../icon/SearchIcon';
import LogoutIcon from '../icon/LogoutIcon';
import '../element/Sidebar.css'
function Sidebar() {
  return (
    <div className='sidebar'>

      <div className='sidebar-header'>
        <div className="headericon-wrap">
          <AdminIcon/>
        </div>
        <div className="header-admin">
          Admin
        </div>
      </div>

      <div className='sidebar-menu'>
        <div className="menu-wrap">
          <NavLink to='/' activeClassName="active">
            <div className="icon-wrap"><HomeIcon /></div>
            <div className="menu-link">Home</div>
          </NavLink>
        </div>
        <div className="menu-wrap">
          <NavLink to='/User' activeClassName="active">
            <div className="icon-wrap"><UserIcon /></div>
            <div className="menu-link">Infomation user</div>
          </NavLink>
        </div>
        <div className="menu-wrap">
          <NavLink to='/Search' activeClassName="active">
            <div className="icon-wrap"><SearchIcon /></div>
            <div className="menu-link">Search & History</div>
          </NavLink>
        </div>

      </div>

      <button className="sidebar-foot">
        <div className="footicon-wrap">
          <LogoutIcon />
        </div>
        <div className="foot-logout">
          Logout
        </div>
      </button>

    </div>
  )
}

export default Sidebar