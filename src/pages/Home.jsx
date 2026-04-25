import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/style.css';
import { supabase } from '../lib/supabaseClient';
import { initializeHomeCharts } from '../lib/chartjsSetup';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [logoUrl, setLogoUrl] = useState('img/easy4school.png');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(3);
                if (error) throw error;
                setPosts(data || []);
            } catch (err) {
                console.error("Lỗi tải bài viết:", err);
            }
        };
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
        fetchPosts();
        fetchLogo();
    }, []);

    useEffect(() => {
        // Khởi tạo các biểu đồ dashboard
        initializeHomeCharts();
    }, []);
    return (
        <>
            

    <header>
    <div className="logo">
    <img src={logoUrl} alt="LogoEasy4School" className="logo-img" />
       <div>EASY<span>4SCHOOL</span></div>
    </div>
        <a href="https://zalo.me/0878771668" className="btn-zalo-top"><i className="fab fa-whatsapp"></i> Tư vấn ngay</a>
    </header>

    <section className="hero">
        <h1>Easy4School – Giải Pháp Quản Lý Trường Học <span>Thông Minh & Tiết Kiệm</span></h1>
        <p>Ra đời với sứ mệnh giúp chủ trường Mầm non, Trung tâm Anh ngữ tối ưu vận hành, tăng hiệu quả quản lý với chi phí thấp nhất thị trường.</p>
        <div className="cta-group">
            <a href="#contact" className="btn btn-main">Nhận Demo Miễn Phí</a>
            <a href="https://zalo.me/0878771668" className="btn btn-sub">Liên hệ Zalo: 0878 771 668</a>
        </div>
    </section>

    <section className="section section-intro">
        <div className="text-center">
            <h2 style={{ fontSize: '2rem' }}>Thiết kế riêng cho từng ngôi trường</h2>
            <p style={{ color: '#666', marginTop: '1rem' }}>Chúng tôi hiểu mỗi ngôi trường là duy nhất. Phần mềm được tùy chỉnh để khớp hoàn toàn với quy trình của bạn.</p>
        </div>
        <div className="mission-grid">
            <div className="mission-card text-center">
                <i className="fas fa-clock-rotate-left fa-3x" style={{ color: 'var(--primary)' }}></i>
                <h3 style={{ margin: '1rem 0' }}>Tiết kiệm thời gian</h3>
                <p>Tự động hóa 80% công việc thủ công hàng ngày của quản lý và giáo viên.</p>
            </div>
            <div className="mission-card text-center">
                <i className="fas fa-hand-holding-dollar fa-3x" style={{ color: 'var(--primary)' }}></i>
                <h3 style={{ margin: '1rem 0' }}>Chi phí rẻ nhất</h3>
                <p>Giải pháp tối ưu ngân sách, phù hợp cả với những trung tâm nhỏ mới khởi nghiệp.</p>
            </div>
            <div className="mission-card text-center">
                <i className="fas fa-chart-line fa-3x" style={{ color: 'var(--primary)' }}></i>
                <h3 style={{ margin: '1rem 0' }}>Tăng hiệu quả</h3>
                <p>Báo cáo trực quan giúp bạn nắm bắt tình hình tài chính và đào tạo trong 1 giây.</p>
            </div>
        </div>
    </section>

    <section className="section features">
        <div className="text-center">
            <h2 style={{ fontSize: '2rem' }}>Tính năng mạnh mẽ - Vận hành trơn tru</h2>
        </div>
        <div className="feature-grid">
            <div className="feature-item">
                <i className="fas fa-user-graduate"></i>
                <div>
                    <h3>Quản lý học sinh & lớp học</h3>
                    <p>Điểm danh, sắp lịch học, quản lý hồ sơ học viên chi tiết.</p>
                </div>
            </div>
            <div className="feature-item">
                <i className="fas fa-file-invoice-dollar"></i>
                <div>
                    <h3>Quản lý học phí & công nợ</h3>
                    <p>Theo dõi học phí, báo nợ, minh bạch mọi khoản thu.</p>
                </div>
            </div>
            <div className="feature-item">
                <i className="fas fa-print"></i>
                <div>
                    <h3>Xuất phiếu thu hàng loạt</h3>
                    <p>Xuất hóa đơn, thông báo học phí hàng loạt để gửi qua Zalo cho phụ huynh.</p>
                </div>
            </div>
            <div className="feature-item">
                <i className="fas fa-boxes-stacked"></i>
                <div>
                    <h3>Quản lý bán hàng - Kho</h3>
                    <p>Theo dõi nhập xuất tồn đồng phục, giáo trình, đồ dùng học tập.</p>
                </div>
            </div>
            <div className="feature-item">
                <i className="fas fa-pie-chart"></i>
                <div>
                    <h3>Báo cáo doanh thu & lợi nhuận</h3>
                    <p>Tổng hợp số liệu tài chính tự động, chính xác tuyệt đối.</p>
                </div>
            </div>
            <div className="feature-item">
                <i className="fas fa-comment-dots"></i>
                <div>
                    <h3>Chăm sóc khách hàng</h3>
                    <p>Phân công nhân viên chăm sóc, phân loại, chăm sóc hàng ngày.</p>
                </div>
            </div>
        </div>
        
              <div className="carousel-container">
            <div className="carousel-slide" id="carouselSlide">
                <div className="slide-item">
                    <div className="image-wrapper">
                        <img src="img/tongquan.jpg" className="img-blur" /> <img src="img/tongquan.jpg" className="img-main" /> </div>
                    <div className="slide-caption">Quản lý trung tâm cực kỳ đơn giản</div>
                </div>
                
                <div className="slide-item">
                    <div className="image-wrapper">
                        <img src="img/xuathd.jpg" className="img-blur" />
                        <img src="img/xuathd.jpg" className="img-main" />
                    </div>
                    <div className="slide-caption">Xuất hóa đơn dễ dàng theo tháng hoặc buổi học</div>
                </div>
        
                <div className="slide-item">
                    <div className="image-wrapper">
                        <img src="img/banhang.jpg" className="img-blur" />
                        <img src="img/banhang.jpg" className="img-main" />
                    </div>
                    <div className="slide-caption">Bán hàng dễ dàng cho học sinh</div>
                </div>
        
                <div className="slide-item">
                    <div className="image-wrapper">
                        <img src="img/quanlythuchi.jpg" className="img-blur" />
                        <img src="img/quanlythuchi.jpg" className="img-main" />
                    </div>
                    <div className="slide-caption">Quản lý nợ chưa thu, quá hạn đóng tiền</div>
                </div>
            </div>
        </div>
    </section>

    <section className="section section-intro">
        <div className="text-center">
            <h2 style={{ fontSize: '2rem' }}>Báo Cáo Chi Tiết Tăng Trường Lợi Nhuận Doanh Thu</h2>
        </div>
        <div className="glass-card">
                    
             
                    
                    <div id="reports" className="content-section active">
                        <div className="reports-filter-controls">
                            <div className="date-range-filter">
                                <label htmlFor="report-from-date">Từ ngày:</label>
                                <input type="date" id="report-from-date" className="form-control" />
                            </div>
                            <div className="date-range-filter">
                                <label htmlFor="report-to-date">Đến ngày:</label>
                                <input type="date" id="report-to-date" className="form-control" />
                            </div>
                            <div className="date-range-filter">
                                <label htmlFor="report-staff-filter">Nhân viên:</label>
                                <select id="report-staff-filter" className="form-control" onchange="renderReports()"><option value="">Tất cả nhân viên</option><option value="Ms Loan">Ms Loan</option><option value="Ms Uyên">Ms Uyên</option><option value="Ms Lài">Ms Lài</option></select>
                            </div>
                            <button className="btn btn-secondary" onclick="resetReportDateFilter()">
                                <i className="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                        <div className="reports-grid">
                            
                            <div className="overview-cards">
                                <div className="overview-card">
                                    <div className="card-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="card-content">
                                        <h3 id="total-customers-count">149</h3>
                                        <p>Tổng học viên</p>
                                    </div>
                                </div>
                                
                                <div className="overview-card">
                                    <div className="card-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="card-content">
                                        <h3 id="total-care-count">152.493.014 VNĐ (89 đơn)</h3>
                                        <p>Tổng doanh thu</p>
                                    </div>
                                </div>
                                
                                <div className="overview-card">
                                    <div className="card-icon">
                                        <i className="fas fa-calendar-day"></i>
                                    </div>
                                    <div className="card-content">
                                        <h3 id="today-customers-count">2</h3>
                                        <p>Học viên mới tháng này</p>
                                    </div>
                                </div>
                                
                                <div className="overview-card">
                                    <div className="card-icon">
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <div className="card-content">
                                        <h3 id="top-staff-name">Cập nhật sau</h3>
                                        <p>Nhân viên tích cực nhất</p>
                                    </div>
                                </div>
                            </div>
        
                            
                            <div className="charts-container">
                                <div className="chart-card">
                                    <h3><i className="fas fa-chart-pie"></i> Cơ cấu doanh thu, chi phí trong tháng</h3>
                                    <canvas id="cocauthuchiChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
                                
                                <div className="chart-card">
                                    <h3><i className="fas fa-chart-bar"></i> Biểu đồ tăng trưởng doanh thu các tháng</h3>
                                    <canvas id="tangtruongdoanhthuChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
                                
                                <div className="chart-card">
                                    <h3><i className="fas fa-chart-line"></i> Biểu đồ tăng trưởng lợi nhuận các tháng</h3>
                                    <canvas id="tangtruongloinhuanChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
        
                                <div className="chart-card">
                                    <h3><i className="fas fa-share-alt"></i> Tăng trưởng học viên các tháng</h3>
                                    <canvas id="tangtruonghocvienChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>               
        
                                <div className="chart-card">
                                    <h3><i className="fas fa-trophy"></i> Cơ cấu doanh thu theo lớp</h3>
                                    <canvas id="cocaudoanhthulopChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
                                
                                <div className="chart-card">
                                    <h3><i className="fas fa-calendar-alt"></i> Thống kê nợ theo lớp</h3>
                                    <canvas id="thongkenolopChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
        
                                <div className="chart-card">
                                    <h3><i className="fas fa-trophy"></i> Tổng công nợ trong tháng</h3>
                                    <div id="tongcongnotrongthangChart" className="top-list">
                    <div className="top-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                        <div className="top-item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="top-item-rank" style={{ fontWeight: 'bold', width: '25px', color: '#666' }}>1</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Nguyễn Gia Bảo</span>
                                <small style={{ color: '#888' }}>Mã HV: HV0134 | Lớp: Everybody Up 1+</small>
                                <small style={{ color: '#aaa', fontSize: '10px' }}>HĐ: HD0000278</small>
                            </div>
                        </div>
                        <div className="top-item-count" style={{ fontWeight: 'bold', color: '#d32f2f', background: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}>
                            3.170.000 đ
                        </div>
                    </div>
                
                    <div className="top-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                        <div className="top-item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="top-item-rank" style={{ fontWeight: 'bold', width: '25px', color: '#666' }}>2</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Võ Phạm Minh Quân</span>
                                <small style={{ color: '#888' }}>Mã HV: HV0082 | Lớp: Everybody Up 1+</small>
                                <small style={{ color: '#aaa', fontSize: '10px' }}>HĐ: HD0000287</small>
                            </div>
                        </div>
                        <div className="top-item-count" style={{ fontWeight: 'bold', color: '#d32f2f', background: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}>
                            2.305.000 đ
                        </div>
                    </div>
                </div>
                                </div>
                                
                                <div className="chart-card">
                                    <h3><i className="fas fa-money-bill-wave"></i> Báo cáo sĩ số học sinh từng lớp</h3>
                                    <canvas id="sisotunglopChart" width="669" height="250" style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}></canvas>
                                </div>
                                
                            </div>
                        </div>
                    </div>
        
        
        </div>
    </section>
    
    <section className="section text-center" id="contact">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Bắt đầu số hóa trường học của bạn ngay!</h2>
        <p>Liên hệ để được tư vấn và trải nghiệm bản Demo dành riêng cho bạn.</p>
        <div className="contact-info">
            Zalo hỗ trợ: <a href="https://zalo.me/0878771668">0878 771 668</a>
        </div>
        <a href="https://zalo.me/0878771668" className="btn btn-main" style={{ display: 'inline-block' }}>Đăng ký Demo ngay</a>
    </section>
    
<section className="section partners features">
    <div className="text-center">
        <h2 style={{ fontSize: '2rem' }}>Hơn 100+ Trường học & Trung tâm tin dùng</h2>
    </div>
    <div className="partner-slider">
        <img src="img/mamla.png" alt="Hệ thống trường mầm non lá" />
        <img src="img/eskills.png" alt="Trung tâm Anh ngữ Eskils" />
        <img src="img/baominh.jpg" alt="Trung tâm Anh ngữ Bảo Minh" />
        <img src="img/buoctien.png" alt="Trung tâm Anh ngữ Bước Tiến" />
        <img src="img/seungri.png" alt="CLB Taekwondo Seungri" />
        <img src="img/mattroibe.jpg" alt="Trường mầm non Mặt Trời Bé" />
        <img src="img/doremi.png" alt="Trường mầm non Doremi" />
        <img src="img/mls.png" alt="Trung tâm tiếng hoa MLS" />
        <img src="img/yesican.png" alt="Trung tâm Anh ngữ YES I CAN" />
        <img src="img/phongle.jpg" alt="Trung tâm Anh ngữ Phong Lê" />
        <img src="img/jcam.png" alt="Trung tâm Anh ngữ JC CAMBRIGDE" />
        <img src="img/mathfriends.jpg" alt="Trung tâm Toán Math Friends" />
        <img src="img/tkstudio.jpg" alt="Trung tâm Thể Thao TK Studio" />
        <img src="img/allez.png" alt="Trung tâm Thể Thao Allez Sport" />
        <img src="img/amber.jpg" alt="Trung tâm Anh ngữ Amber" />
        <img src="img/hochai.png" alt="Trung tâm Luyện thi bồi dưỡng kiến thức Học Hải" />
        <img src="img/hcenter.png" alt="Trung tâm Anh ngữ Hcenter" />
        <img src="img/icandoit.png" alt="Trung tâm Anh ngữ I Can Do It" />
        <img src="img/maihieu.png" alt="Trung tâm Anh ngữ Mai Hiếu" />
        <img src="img/collins.png" alt="Trung tâm Anh ngữ Collins" />
        <img src="img/smile-center.png" alt="Trung tâm Anh ngữ Smile Center" />
        <img src="img/anhbinhminh.png" alt="Trường mầm non Ánh Bình Minh" />
        <img src="img/newstar.png" alt="Trường mầm non New Star" />
        <img src="img/tuoihong.png" alt="Trường mầm non Tuổi Hồng" />
        <img src="img/cophuong.png" alt="Dạy thêm Cô Phượng" />
    </div>
</section>

    <section className="section blog" id="blog">
    <div className="text-center">
        <h2 style={{ fontSize: '2rem' }}>Chia sẻ kinh nghiệm quản lý</h2>
    </div>
    <div className="feature-grid">
        {posts.length > 0 ? posts.map(post => (
            <article key={post.id} className="feature-item blog-card">
                <div className="blog-content">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt || post.meta_description || 'Xem chi tiết bài viết...'}</p>
                    <Link to={`/blog/${post.slug}`} className="read-more">Xem thêm</Link>
                </div>
            </article>
        )) : (
            <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Chưa có bài viết nào.</p>
        )}
    </div>
</section>
    
    <section className="section features">
    <div className="text-center">
        <h2 style={{ fontSize: '2rem' }}>Làm chủ Easy4School trong 5 phút</h2>
    </div>
    <div className="feature-grid">
        <div className="feature-item">
            <i className="fas fa-video"></i>
            <div>
                <h3>Hướng dẫn cài đặt</h3>
                <p>Xem video hướng dẫn thiết lập thông tin trường lần đầu tiên.</p>
            </div>
        </div>
        <a href="/file/HuongDanEasy4School.pdf" download="Huong-Dan-Su-Dung-Easy4School.pdf" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-item">
                <i className="fas fa-book"></i>
                <div>
                    <h3>Tài liệu hướng dẫn</h3>
                    <p>File PDF chi tiết cách sử dụng các tính năng điểm danh, báo cáo.</p>
                </div>
            </div>
        </a>
    </div>
</section>
    
<footer style={{ background:'#0f172a', color:'#fff', padding:'30px 20px', marginTop:'40px' }}>
    <div style={{ maxWidth:'1200px', margin:'auto', display:'flex', flexWrap:'wrap', gap:'30px' }}>

        
        <div style={{ flex:1, minWidth:'250px' }}>
            <h3 style={{ marginBottom:'10px' }}>CÔNG TY TNHH GIÁO DỤC - CÔNG NGHỆ LEAFEDU</h3>
            <p>Mã số thuế: 3604088901</p>
            <p>Địa chỉ: Đường D, Khu 2005, Tổ 44, Khu Phố Long Đức 1, Phường Tam Phước, Tỉnh Đồng Nai, Việt Nam</p>
            <p>Điện thoại: 0878 771 668</p>
            <p>Tình trạng: Đang hoạt động</p>
        </div>

        
        <div style={{ flex:1, minWidth:'250px' }}>
            <h3 style={{ marginBottom:'10px' }}>Giải pháp quản lý</h3>
            <ul style={{ listStyle:'none', padding:0, lineHeight:'1.8' }}>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý trung tâm tiếng anh</a></li>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp toán</a></li>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp vẽ</a></li>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp nhạc</a></li>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp năng khiếu</a></li>
                <li><a href="#" style={{ color:'#cbd5f5', textDecoration:'none' }}>Phần mềm quản lý lớp học – Tinh gọn, tiết kiệm và quản lý chặt chẽ</a></li>
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

    <a href="https://zalo.me/0878771668" className="zalo-float" target="_blank">
        <i className="fab fa-whatsapp"></i>
    </a>


        </>
    );
}
