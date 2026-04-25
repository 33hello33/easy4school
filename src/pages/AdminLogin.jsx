import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/admin.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Just redirecting for UI demonstration purposes (mocking authentication)
        if(username && password) {
            navigate('/admin');
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h2>Admin Panel</h2>
                        <p>Đăng nhập để quản lý nội dung</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <i className='bx bx-user'></i>
                                <input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    placeholder="Nhập tên đăng nhập" 
                                    required 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-wrapper">
                                <i className='bx bx-lock-alt'></i>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Nhập mật khẩu" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" name="remember" />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                        </div>
                        <button type="submit" className="btn-login">Đăng nhập</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
