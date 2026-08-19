import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/style.css';
import { supabase } from '../lib/supabaseClient';
import { initializeHomeCharts } from '../lib/chartjsSetup';

const DEFAULT_CAROUSEL = [
    { id: 1, src: '/img/tongquan.jpg', caption: 'Quản lý trung tâm cực kỳ đơn giản' },
    { id: 2, src: '/img/xuathd.jpg', caption: 'Xuất hóa đơn dễ dàng theo tháng hoặc buổi học' },
    { id: 3, src: '/img/banhang.jpg', caption: 'Bán hàng dễ dàng cho học sinh' },
    { id: 4, src: '/img/quanlythuchi.jpg', caption: 'Quản lý nợ chưa thu, quá hạn đóng tiền' }
];

const DEFAULT_PARTNERS = [
    { id: 1, src: '/img/logoschool/mamla.png', name: 'Mầm non Lá' },
    { id: 2, src: '/img/logoschool/eskills.png', name: 'Eskills' },
    { id: 3, src: '/img/logoschool/baominh.jpg', name: 'Bảo Minh' },
    { id: 4, src: '/img/logoschool/buoctien.png', name: 'Bước Tiến' },
    { id: 5, src: '/img/logoschool/seungri.png', name: 'Seungri' },
    { id: 6, src: '/img/logoschool/mattroibe.jpg', name: 'Mặt Trời Bé' },
    { id: 7, src: '/img/logoschool/doremi.png', name: 'Doremi' },
    { id: 8, src: '/img/logoschool/mls.png', name: 'MLS' },
    { id: 9, src: '/img/logoschool/yesican.png', name: 'Yes I Can' },
    { id: 10, src: '/img/logoschool/phongle.jpg', name: 'Phong Lê' },
    { id: 11, src: '/img/logoschool/jcam.png', name: 'JC Cambridge' },
    { id: 12, src: '/img/logoschool/mathfriends.jpg', name: 'Math Friends' },
    { id: 13, src: '/img/logoschool/tkstudio.jpg', name: 'TK Studio' },
    { id: 14, src: '/img/logoschool/allez.png', name: 'Allez Sport' },
    { id: 15, src: '/img/logoschool/amber.jpg', name: 'Amber' },
    { id: 16, src: '/img/logoschool/hochai.png', name: 'Học Hải' },
    { id: 17, src: '/img/logoschool/hcenter.png', name: 'Hcenter' },
    { id: 18, src: '/img/logoschool/icandoit.png', name: 'I Can Do It' },
    { id: 19, src: '/img/logoschool/maihieu.png', name: 'Mai Hiếu' },
    { id: 20, src: '/img/logoschool/collins.png', name: 'Collins' },
    { id: 21, src: '/img/logoschool/smile-center.png', name: 'Smile Center' },
    { id: 22, src: '/img/logoschool/anhbinhminh.png', name: 'Ánh Bình Minh' },
    { id: 23, src: '/img/logoschool/newstar.png', name: 'New Star' },
    { id: 24, src: '/img/logoschool/tuoihong.png', name: 'Tuổi Hồng' },
    { id: 25, src: '/img/logoschool/cophuong.png', name: 'Cô Phượng' },
    { id: 26, src: '/img/logoschool/camvan.jpg', name: 'Cam Vân' },
    { id: 27, src: '/img/logoschool/thanhdat.jpg', name: 'Thành Đạt' },
];

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [logoUrl, setLogoUrl] = useState('/img/easy4school.png');
    const [scrolled, setScrolled] = useState(false);
    const [heroHeading, setHeroHeading] = useState('Giải Pháp Quản Lý Trường Học');
    const [heroSubheading, setHeroSubheading] = useState('Thông Minh & Tiết Kiệm');
    const [heroDescription, setHeroDescription] = useState('Giúp chủ trường Mầm non, Trung tâm Anh ngữ tối ưu vận hành, tăng hiệu quả quản lý với chi phí thấp nhất thị trường.');
    const [carouselItems, setCarouselItems] = useState(DEFAULT_CAROUSEL);
    const [partnerLogos, setPartnerLogos] = useState(DEFAULT_PARTNERS);
    const [previewIndex, setPreviewIndex] = useState(null);

    useEffect(() => {
        if (previewIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setPreviewIndex(null);
            if (e.key === 'ArrowRight') setPreviewIndex((prev) => (prev !== null ? (prev + 1) % carouselItems.length : null));
            if (e.key === 'ArrowLeft') setPreviewIndex((prev) => (prev !== null ? (prev - 1 + carouselItems.length) % carouselItems.length : null));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewIndex, carouselItems.length]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Posts (tải tất cả bài viết đã xuất bản)
                const { data: postsData } = await supabase.from('posts').select('*')
                    .eq('status', 'published').order('created_at', { ascending: false });
                setPosts(postsData || []);

                // All site settings at once
                const { data: settings } = await supabase.from('site_settings').select('setting_key, setting_value');
                if (settings) {
                    settings.forEach(item => {
                        if (item.setting_key === 'logo_url' && item.setting_value) setLogoUrl(item.setting_value);
                        if (item.setting_key === 'hero_heading' && item.setting_value) setHeroHeading(item.setting_value);
                        if (item.setting_key === 'hero_subheading' && item.setting_value) setHeroSubheading(item.setting_value);
                        if (item.setting_key === 'hero_description' && item.setting_value) setHeroDescription(item.setting_value);
                        if (item.setting_key === 'carousel_items' && item.setting_value) {
                            try { setCarouselItems(JSON.parse(item.setting_value)); } catch (e) { }
                        }
                        if (item.setting_key === 'partner_logos' && item.setting_value) {
                            try {
                                const parsed = JSON.parse(item.setting_value);
                                if (parsed && parsed.length > 0) setPartnerLogos(parsed);
                            } catch (e) { }
                        }
                    });
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu trang chủ:', err);
            }
        };
        fetchAll();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        initializeHomeCharts();
    }, []);

    return (
        <>
            {/* ===== HEADER ===== */}
            <header className={scrolled ? 'header-scrolled' : ''}>
                <div className="logo">
                    <img src={logoUrl} alt="LogoEasy4School" className="logo-img" />
                    <div className="logo-text">EASY<span>4SCHOOL</span></div>
                </div>
                <nav className="header-nav">
                    <a href="#features" className="nav-link">Tính năng</a>
                    <a href="#reports" className="nav-link">Báo cáo</a>
                    <a href="#partners" className="nav-link">Khách hàng</a>
                    <a href="#contact" className="nav-link">Liên hệ</a>
                </nav>
                <a href="https://zalo.me/0878771668" className="btn-zalo-top">
                    <i className="fab fa-whatsapp"></i>
                    <span>Tư vấn ngay</span>
                </a>
            </header>

            {/* ===== HERO ===== */}
            <section className="hero">
                <div className="hero-bg-orb hero-orb-1"></div>
                <div className="hero-bg-orb hero-orb-2"></div>
                <div className="hero-bg-orb hero-orb-3"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        Phần mềm được 100+ trường tin dùng
                    </div>
                    <h1>
                        {heroHeading}<br />
                        <span className="hero-gradient-text">{heroSubheading}</span>
                    </h1>
                    <p>{heroDescription}</p>
                    <div className="cta-group">
                        <a href="#contact" className="btn btn-main">
                            <i className="fas fa-rocket"></i>
                            Nhận Demo Miễn Phí
                        </a>
                        <a href="https://zalo.me/0878771668" className="btn btn-sub">
                            <i className="fab fa-whatsapp"></i>
                            Zalo: 0878 771 668
                        </a>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="hero-stat-item">
                        <span className="hero-stat-number">100+</span>
                        <span className="hero-stat-label">Trường tin dùng</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat-item">
                        <span className="hero-stat-number">80%</span>
                        <span className="hero-stat-label">Tiết kiệm thời gian</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat-item">
                        <span className="hero-stat-number">5 phút</span>
                        <span className="hero-stat-label">Để làm chủ</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat-item">
                        <span className="hero-stat-number">24/7</span>
                        <span className="hero-stat-label">Hỗ trợ kỹ thuật</span>
                    </div>
                </div>
            </section>

            {/* ===== WHY SECTION ===== */}
            <section className="section why-section">
                <div className="section-header">
                    <div className="section-tag">Tại sao chọn chúng tôi</div>
                    <h2>Thiết kế riêng cho từng ngôi trường</h2>
                    <p>Chúng tôi hiểu mỗi ngôi trường là duy nhất. Phần mềm được tùy chỉnh để khớp hoàn toàn với quy trình của bạn.</p>
                </div>
                <div className="why-grid">
                    <div className="why-card">
                        <div className="why-card-header">
                            <div className="why-card-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                <i className="fas fa-clock-rotate-left"></i>
                            </div>
                            <h3>Tiết kiệm thời gian</h3>
                        </div>
                        <div className="why-number">01</div>
                        <p>Tự động hóa 80% công việc thủ công hàng ngày của quản lý và giáo viên.</p>
                        <div className="why-card-footer">
                            <span>Tiết kiệm 4+ giờ/ngày</span>
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>
                    <div className="why-card">
                        <div className="why-card-header">
                            <div className="why-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                                <i className="fas fa-hand-holding-dollar"></i>
                            </div>
                            <h3>Chi phí rẻ nhất</h3>
                        </div>
                        <div className="why-number">02</div>
                        <p>Giải pháp tối ưu ngân sách, phù hợp cả với những trung tâm nhỏ mới khởi nghiệp.</p>
                        <div className="why-card-footer">
                            <span>Từ 165.000đ/tháng</span>
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>
                    <div className="why-card">
                        <div className="why-card-header">
                            <div className="why-card-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>Tăng hiệu quả</h3>
                        </div>
                        <div className="why-number">03</div>
                        <p>Báo cáo trực quan giúp bạn nắm bắt tình hình tài chính và đào tạo trong 1 giây.</p>
                        <div className="why-card-footer">
                            <span>Báo cáo thời gian thực</span>
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className="section features-section" id="features">
                <div className="section-header">
                    <div className="section-tag">Tính năng</div>
                    <h2>Tính năng mạnh mẽ – Vận hành trơn tru</h2>
                    <p>Tất cả công cụ bạn cần để điều hành một ngôi trường hiệu quả trong một nền tảng duy nhất.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))', color: '#667eea' }}>
                                <i className="fas fa-user-graduate"></i>
                            </div>
                            <h3>Quản lý học sinh &amp; lớp học</h3>
                        </div>
                        <p>Điểm danh, sắp lịch học, quản lý hồ sơ học viên chi tiết một cách dễ dàng.</p>
                        <div className="feature-card-tag">Quản lý</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(245,87,108,0.15), rgba(240,147,32,0.15))', color: '#f5576c' }}>
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <h3>Quản lý học phí &amp; công nợ</h3>
                        </div>
                        <p>Theo dõi học phí, tự động báo nợ, minh bạch mọi khoản thu cho phụ huynh.</p>
                        <div className="feature-card-tag">Tài chính</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.15))', color: '#4facfe' }}>
                                <i className="fas fa-print"></i>
                            </div>
                            <h3>Xuất phiếu thu hàng loạt</h3>
                        </div>
                        <p>Xuất hóa đơn, thông báo học phí hàng loạt gửi qua Zalo cho phụ huynh chỉ 1 click.</p>
                        <div className="feature-card-tag">Tự động</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(67,233,123,0.15), rgba(56,249,215,0.15))', color: '#43e97b' }}>
                                <i className="fas fa-boxes-stacked"></i>
                            </div>
                            <h3>Quản lý bán hàng – Kho</h3>
                        </div>
                        <p>Theo dõi nhập xuất tồn đồng phục, giáo trình, đồ dùng học tập chính xác.</p>
                        <div className="feature-card-tag">Kho vận</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(250,112,154,0.15), rgba(254,225,64,0.15))', color: '#fa709a' }}>
                                <i className="fas fa-chart-pie"></i>
                            </div>
                            <h3>Báo cáo doanh thu &amp; lợi nhuận</h3>
                        </div>
                        <p>Tổng hợp số liệu tài chính tự động, biểu đồ trực quan chính xác tuyệt đối.</p>
                        <div className="feature-card-tag">Phân tích</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-header">
                            <div className="feature-card-icon" style={{ background: 'linear-gradient(135deg, rgba(161,140,209,0.15), rgba(251,194,235,0.15))', color: '#a18cd1' }}>
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <h3>Chăm sóc khách hàng</h3>
                        </div>
                        <p>Phân công nhân viên chăm sóc, phân loại, theo dõi tiến độ chăm sóc hàng ngày.</p>
                        <div className="feature-card-tag">CRM</div>
                    </div>
                </div>

                {/* Carousel */}
                <div className="carousel-wrapper">
                    <div className="carousel-label">📸 Xem giao diện thực tế (Click vào ảnh để phóng to)</div>
                    <div className="carousel-container">
                        <div className="carousel-track">
                            {[...carouselItems, ...carouselItems].map((item, idx) => (
                                <div
                                    key={`${item.id}-${idx}`}
                                    className="carousel-item-card"
                                    onClick={() => setPreviewIndex(idx % carouselItems.length)}
                                    title="Click để phóng to ảnh"
                                >
                                    <div className="image-wrapper">
                                        <img src={item.src} className="img-main" alt={item.caption || 'Giao diện phần mềm'} />
                                        <div className="zoom-overlay">
                                            <i className="fas fa-search-plus"></i>
                                            <span>Phóng to</span>
                                        </div>
                                    </div>
                                    <div className="slide-caption">{item.caption}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== REPORTS SECTION ===== */}
            <section className="section reports-landing-section" id="reports">
                <div className="section-header">
                    <div className="section-tag">Phân tích &amp; Báo cáo</div>
                    <h2>Báo Cáo Chi Tiết – Tăng Trưởng Lợi Nhuận</h2>
                    <p>Dashboard trực quan giúp bạn luôn nắm chắc tình hình kinh doanh.</p>
                </div>
                <div className="glass-card">
                    <div id="reports-panel" className="content-section active">
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
                                <select id="report-staff-filter" className="form-control"><option value="">Tất cả nhân viên</option><option value="Ms Loan">Ms Loan</option><option value="Ms Uyên">Ms Uyên</option><option value="Ms Lài">Ms Lài</option></select>
                            </div>
                            <button className="btn btn-secondary">
                                <i className="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                        <div className="reports-grid">
                            <div className="overview-cards">
                                <div className="overview-card">
                                    <div className="card-icon"><i className="fas fa-users"></i></div>
                                    <div className="card-content">
                                        <h3 id="total-customers-count">149</h3>
                                        <p>Tổng học viên</p>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className="card-icon"><i className="fas fa-chart-line"></i></div>
                                    <div className="card-content">
                                        <h3 id="total-care-count">152.493.014 VNĐ</h3>
                                        <p>Tổng doanh thu</p>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className="card-icon"><i className="fas fa-calendar-day"></i></div>
                                    <div className="card-content">
                                        <h3 id="today-customers-count">2</h3>
                                        <p>Học viên mới tháng này</p>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className="card-icon"><i className="fas fa-star"></i></div>
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
                                            <div className="top-item-count" style={{ fontWeight: 'bold', color: '#d32f2f', background: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}>3.170.000 đ</div>
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
                                            <div className="top-item-count" style={{ fontWeight: 'bold', color: '#d32f2f', background: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}>2.305.000 đ</div>
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

            {/* ===== CTA SECTION ===== */}
            <section className="cta-section" id="contact">
                <div className="cta-bg-orb cta-orb-1"></div>
                <div className="cta-bg-orb cta-orb-2"></div>
                <div className="cta-content">
                    <div className="cta-icon">🚀</div>
                    <h2>Bắt đầu số hóa trường học của bạn ngay!</h2>
                    <p>Liên hệ để được tư vấn và trải nghiệm bản Demo dành riêng cho bạn — hoàn toàn miễn phí.</p>
                    <div className="cta-actions">
                        <a href="https://zalo.me/0878771668" className="btn-cta-main">
                            <i className="fas fa-rocket"></i>
                            Đăng ký Demo ngay
                        </a>
                        <div className="cta-contact-row">
                            <span>Hoặc liên hệ Zalo:</span>
                            <a href="https://zalo.me/0878771668" className="cta-phone">0878 771 668</a>
                        </div>
                    </div>
                    <div className="cta-trust">
                        <div className="cta-trust-item"><i className="fas fa-shield-alt"></i> Bảo mật dữ liệu</div>
                        <div className="cta-trust-item"><i className="fas fa-clock"></i> Hỗ trợ 24/7</div>
                        <div className="cta-trust-item"><i className="fas fa-star"></i> Miễn phí cài đặt</div>
                    </div>
                </div>
            </section>

            {/* ===== PARTNERS SECTION ===== */}
            <section className="section partners-section" id="partners">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <div className="partners-badge">🏫 Đối tác tin dùng</div>
                    <h2 className="partners-title">Hơn <span className="partners-count">100+</span> Trường học &amp; Trung tâm</h2>
                    <p className="partners-subtitle">Được các trường hàng đầu tin tưởng lựa chọn trên toàn quốc</p>
                </div>
                <div className="partner-marquee-wrapper">
                    <div className="partner-marquee">
                        <div className="partner-track">
                            {partnerLogos.map(item => (
                                <div key={item.id} className="partner-logo-item">
                                    <img src={item.src} alt={item.name} />
                                </div>
                            ))}
                        </div>
                        <div className="partner-track partner-track-clone" aria-hidden="true">
                            {partnerLogos.map(item => (
                                <div key={`clone-${item.id}`} className="partner-logo-item">
                                    <img src={item.src} alt="" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BLOG SECTION ===== */}
            <section className="section blog-section" id="blog">
                <div className="section-header">
                    <div className="section-tag">Blog</div>
                    <h2>Chia sẻ kinh nghiệm quản lý</h2>
                    <p>Những bài viết hữu ích giúp bạn điều hành trường học tốt hơn mỗi ngày.</p>
                </div>
                <div className="blog-grid">
                    {posts.length > 0 ? posts.map(post => (
                        <article key={post.id} className="blog-card-new">
                            {post.feature_image && (
                                <div className="blog-card-img-wrapper">
                                    <img src={post.feature_image} alt={post.title} className="blog-card-img" />
                                </div>
                            )}
                            <div className="blog-card-body">
                                <div className="blog-card-tag-label">Quản lý</div>
                                <h3>{post.title}</h3>
                                <p>{post.excerpt || post.meta_description || 'Xem chi tiết bài viết...'}</p>
                            </div>
                            <div className="blog-card-footer-new">
                                <Link to={`/blog/${post.slug}`} className="read-more-new">
                                    Đọc tiếp <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </article>
                    )) : (
                        <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: '#888' }}>Chưa có bài viết nào.</p>
                    )}
                </div>
            </section>

            {/* ===== GUIDE SECTION ===== */}
            <section className="section guide-section">
                <div className="section-header">
                    <div className="section-tag">Bắt đầu nhanh</div>
                    <h2>Làm chủ Easy4School trong 5 phút</h2>
                </div>
                <div className="guide-grid">
                    <div className="guide-card">
                        <div className="guide-step">1</div>
                        <i className="fas fa-video"></i>
                        <h3>Hướng dẫn cài đặt</h3>
                        <p>Xem video hướng dẫn thiết lập thông tin trường lần đầu tiên nhanh chóng.</p>
                    </div>
                    <a href="/file/HuongDanEasy4School.pdf" download="Huong-Dan-Su-Dung-Easy4School.pdf" style={{ textDecoration: 'none' }}>
                        <div className="guide-card">
                            <div className="guide-step">2</div>
                            <i className="fas fa-book"></i>
                            <h3>Tài liệu hướng dẫn</h3>
                            <p>File PDF chi tiết cách sử dụng các tính năng điểm danh, báo cáo đầy đủ.</p>
                            <div className="guide-download"><i className="fas fa-download"></i> Tải xuống miễn phí</div>
                        </div>
                    </a>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="site-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src={logoUrl} alt="Easy4School" className="footer-logo-img" />
                            <span className="footer-logo-text">EASY<span>4SCHOOL</span></span>
                        </div>
                        <p className="footer-desc">Giải pháp quản lý trường học toàn diện – Dễ dùng, tiết kiệm, thiết kế riêng cho từng trường.</p>
                        <div className="footer-social">
                            <a href="https://zalo.me/0878771668" className="social-btn" title="Zalo">
                                <i className="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <h4>Giải pháp quản lý</h4>
                        <ul>
                            <li><a href="#">Phần mềm quản lý trung tâm tiếng Anh</a></li>
                            <li><a href="#">Phần mềm quản lý lớp Toán</a></li>
                            <li><a href="#">Phần mềm quản lý lớp Vẽ</a></li>
                            <li><a href="#">Phần mềm quản lý lớp Nhạc</a></li>
                            <li><a href="#">Phần mềm quản lý lớp Năng khiếu</a></li>
                        </ul>
                    </div>
                    <div className="footer-contact-col">
                        <h4>Thông tin liên hệ</h4>
                        <div className="footer-contact-item">
                            <i className="fas fa-building"></i>
                            <span>CÔNG TY TNHH GIÁO DỤC – CÔNG NGHỆ LEAFEDU</span>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fas fa-id-card"></i>
                            <span>MST: 3604088901</span>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>Đường D, Khu 2005, Tổ 44, KP Long Đức 1, P. Tam Phước, Đồng Nai</span>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fas fa-phone"></i>
                            <a href="tel:0878771668">0878 771 668</a>
                        </div>
                        <div className="footer-status">
                            <span className="status-dot"></span>
                            Đang hoạt động
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2024 Easy4School. All rights reserved.</span>
                    <span>Thiết kế bởi <strong>LeafEdu</strong></span>
                </div>
            </footer>

            {/* Zalo Float */}
            <a href="https://zalo.me/0878771668" className="zalo-float" target="_blank" rel="noreferrer" title="Chat Zalo">
                <i className="fab fa-whatsapp"></i>
            </a>

            {/* Image Lightbox Modal */}
            {previewIndex !== null && carouselItems[previewIndex] && (
                <div className="lightbox-modal-backdrop" onClick={() => setPreviewIndex(null)}>
                    <div className="lightbox-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close-btn" onClick={() => setPreviewIndex(null)} title="Đóng (Esc)">
                            <i className="fas fa-times"></i>
                        </button>
                        {carouselItems.length > 1 && (
                            <>
                                <button
                                    className="lightbox-nav-btn lightbox-prev-btn"
                                    onClick={() => setPreviewIndex((previewIndex - 1 + carouselItems.length) % carouselItems.length)}
                                    title="Ảnh trước (Mũi tên trái)"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button
                                    className="lightbox-nav-btn lightbox-next-btn"
                                    onClick={() => setPreviewIndex((previewIndex + 1) % carouselItems.length)}
                                    title="Ảnh tiếp theo (Mũi tên phải)"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </>
                        )}
                        <div className="lightbox-image-box">
                            <img
                                src={carouselItems[previewIndex].src}
                                alt={carouselItems[previewIndex].caption || 'Giao diện thực tế'}
                                className="lightbox-img"
                            />
                        </div>
                        {carouselItems[previewIndex].caption && (
                            <div className="lightbox-caption-bar">
                                <span className="lightbox-caption-text">{carouselItems[previewIndex].caption}</span>
                                <span className="lightbox-counter-badge">{previewIndex + 1} / {carouselItems.length}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
