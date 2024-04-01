import React,{useEffect,useState} from 'react'
import UserLoginIcon from '../icon/UserLoginIcon'
import PasswordIcon from '../icon/PasswordIcon'
import axios from "axios";
import './LogInPage.css'
function LogInPage() {
  
  return (
    <div>
      <div class="backdrop"></div>
      <div class="center">
        <div class="login">login</div>
        <form>
          <div class="txt_field">
            <div class="Icon-wrap">
              <UserLoginIcon />
            </div>
            <input type="text" placeholder="Username" required />
            <span></span>
          </div>
          <div class="txt_field">
            <div class="Icon-wrap">
              <PasswordIcon />
            </div>
            <input type="password" placeholder="Password" required />
            <span></span>
          </div>
          <div className="login-btn">
            <input type="submit" value="Login" />
          </div>
          
        </form>
      </div>

    </div>

  )
}

export default LogInPage