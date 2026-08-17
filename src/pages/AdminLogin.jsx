import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/admin.css';
import { supabase } from '../lib/supabaseClient';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!username.trim() || !password.trim()) {
            setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        setLoading(true);
        try {
            // Query Supabase table users
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username.trim())
                .eq('password', password.trim())
                .maybeSingle();

            if (error) {
                console.error("Lỗi đăng nhập:", error);
                setErrorMsg('Không thể kết nối cơ sở dữ liệu. Chi tiết: ' + error.message);
            } else if (!data) {
                setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
            } else {
                // Login successful - store user session
                const sessionUser = {
                    id: data.id || data.username,
                    username: data.username,
                    name: data.name || data.fullname || data.username,
                    role: data.role || 'Admin'
                };
                sessionStorage.setItem('easy4school_admin_session', JSON.stringify(sessionUser));
                navigate('/admin');
            }
        } catch (err) {
            console.error("Exception in login:", err);
            setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h2>Admin Easy4School</h2>
                        <p>Đăng nhập quản trị hệ thống</p>
                    </div>

                    {errorMsg && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập (Username)</label>
                            <div className="input-wrapper">
                                <i className='bx bx-user'></i>
                                <input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    placeholder="Nhập username nhân viên" 
                                    required 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu (Password)</label>
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
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" name="remember" />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                        </div>
                        <button type="submit" className="btn-login" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                            {loading ? (
                                <><i className='bx bx-loader-alt bx-spin' style={{ marginRight: '8px' }}></i>Đang kiểm tra...</>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
