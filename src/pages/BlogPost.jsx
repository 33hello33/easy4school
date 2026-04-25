import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';
import { supabase } from '../lib/supabaseClient';
import '../assets/style.css';

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoUrl, setLogoUrl] = useState('/img/easy4school.png');

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('setting_value')
                    .eq('setting_key', 'logo_url')
                    .single();
                if (!error && data && data.setting_value) {
                    setLogoUrl(data.setting_value);
                }
            } catch (err) {
                console.error("Lỗi tải logo:", err);
            }
        };

        const fetchPost = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) {
                    console.error("Không tìm thấy bài viết:", error);
                } else {
                    setPost(data);
                    // Tracking lượt xem bài viết
                    trackPageView(window.location.pathname, true, data.id);
                    
                    // Cập nhật thẻ meta SEO nếu có
                    if (data.meta_title) document.title = data.meta_title;
                    else document.title = data.title;
                    
                    if (data.meta_description) {
                        let metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) metaDesc.setAttribute('content', data.meta_description);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải bài viết:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogo();
        fetchPost();
        
        // Scroll lên top khi mở bài
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return <div style={{textAlign: 'center', padding: '100px'}}>Đang tải bài viết...</div>;
    }

    if (!post) {
        return (
            <div style={{textAlign: 'center', padding: '100px'}}>
                <h2>Không tìm thấy bài viết</h2>
                <Link to="/" style={{color: 'var(--primary)', textDecoration: 'underline'}}>Quay về trang chủ</Link>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header>
                <div className="logo">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <img src={logoUrl} alt="LogoEasy4School" className="logo-img" />
                        <div>EASY<span>4SCHOOL</span></div>
                    </Link>
                </div>
                <a href="https://zalo.me/0878771668" className="btn-zalo-top"><i className="fab fa-whatsapp"></i> Tư vấn ngay</a>
            </header>

            <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
                    <i className="bx bx-arrow-back" style={{marginRight: '5px'}}></i> Quay lại
                </Link>
                
                <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '20px', lineHeight: '1.3' }}>{post.title}</h1>
                <div style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }}>
                    Ngày đăng: {new Date(post.created_at).toLocaleDateString('vi-VN')}
                </div>

                {post.feature_image && (
                    <img 
                        src={post.feature_image} 
                        alt={post.title} 
                        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '30px', objectFit: 'cover' }} 
                    />
                )}

                <div 
                    className="post-content"
                    style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#334155' }}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
            </main>

            <footer style={{ background:'#0f172a', color:'#fff', padding:'30px 20px', marginTop:'40px' }}>
                <div style={{ maxWidth:'1200px', margin:'auto', display:'flex', flexWrap:'wrap', gap:'30px' }}>
                    <div style={{ flex:1, minWidth:'250px' }}>
                        <h3 style={{ marginBottom:'10px' }}>CÔNG TY TNHH GIÁO DỤC - CÔNG NGHỆ LEAFEDU</h3>
                        <p>Mã số thuế: 3604088901</p>
                        <p>Địa chỉ: Đường D, Khu 2005, Tổ 44, Khu Phố Long Đức 1, Phường Tam Phước, Tỉnh Đồng Nai, Việt Nam</p>
                        <p>Điện thoại: 0878 771 668</p>
                    </div>

                    <div style={{ flex:1, minWidth:'250px' }}>
                        <h3 style={{ marginBottom:'10px' }}>Giải pháp quản lý</h3>
                        <ul style={{ listStyle:'none', padding:0, lineHeight:'1.8' }}>
                            <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý trung tâm tiếng anh</a></li>
                            <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp toán</a></li>
                            <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp vẽ</a></li>
                            <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp nhạc</a></li>
                            <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp năng khiếu</a></li>
                        </ul>
                    </div>

                    <div style={{ flex:1, minWidth:'250px' }}>
                        <h3 style={{ marginBottom:'10px' }}>Easy4School</h3>
                        <p>Giải pháp quản lý trường học toàn diện</p>
                        <p style={{ fontSize:'0.9rem', marginTop:'10px' }}>
                            Dễ dàng sử dụng - Tiết kiệm chi phí - Thiết kế riêng biệt
                        </p>
                    </div>
                </div>
                <div style={{ textAlign:'center', marginTop:'25px', borderTop:'1px solid #1e293b', paddingTop:'15px', fontSize:'0.9rem' }}>
                    &copy; 2024 Easy4School. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
