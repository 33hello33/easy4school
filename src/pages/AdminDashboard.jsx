import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/admin.css';
import { supabase } from '../lib/supabaseClient';

const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            } else if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Giữ lại độ trong suốt bằng cách dùng WebP hoặc PNG
            const outputFormat = (file.type === 'image/png') ? 'image/webp' : 'image/jpeg';
            
            let quality = 0.9;
            let dataUrl = canvas.toDataURL(outputFormat, quality);
            
            // Loop step down quality until string size < ~135000 chars (~100KB)
            while (dataUrl.length > 135000 && quality > 0.1) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL(outputFormat, quality);
            }
            callback(dataUrl);
        };
    };
};

const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
};

const uploadImageToSupabase = async (dataUrl, folderPath) => {
    try {
        const blob = dataURLtoBlob(dataUrl);
        const fileExt = blob.type.split('/')[1] || 'jpeg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, blob, {
                contentType: blob.type
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        alert('Lỗi tải ảnh lên Storage: ' + error.message);
        return null;
    }
};

export default function AdminDashboard() {
    const [view, setView] = useState('dashboard');
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // Post States
    const [postTitle, setPostTitle] = useState('');
    const [postMetaTitle, setPostMetaTitle] = useState('');
    const [postMetaDesc, setPostMetaDesc] = useState('');
    const [postStatus, setPostStatus] = useState('published');
    const [postFeatureImage, setPostFeatureImage] = useState('');
    const [editingPostId, setEditingPostId] = useState(null);

    // Posts List State
    const [postsList, setPostsList] = useState([]);
    
    // Settings States
    const [siteTitle, setSiteTitle] = useState('');
    const [siteDescription, setSiteDescription] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    // Analytics States
    const [stats, setStats] = useState({
        totalVisitors: 0,
        postReaders: 0,
        postViews: 0,
        growth: 0,
        chartData: []
    });

    // ===== HOMEPAGE CONTENT STATES =====
    const [heroHeading, setHeroHeading] = useState('Giải Pháp Quản Lý Trường Học');
    const [heroSubheading, setHeroSubheading] = useState('Thông Minh & Tiết Kiệm');
    const [heroDescription, setHeroDescription] = useState('Giúp chủ trường Mầm non, Trung tâm Anh ngữ tối ưu vận hành, tăng hiệu quả quản lý với chi phí thấp nhất thị trường.');
    const [heroSaving, setHeroSaving] = useState(false);

    // Carousel States
    const [carouselItems, setCarouselItems] = useState([]);
    const [newCarouselImg, setNewCarouselImg] = useState(null);
    const [newCarouselCaption, setNewCarouselCaption] = useState('');
    const [carouselSaving, setCarouselSaving] = useState(false);

    // Partner Logos States
    const [partnerLogos, setPartnerLogos] = useState([]);
    const [newPartnerImg, setNewPartnerImg] = useState(null);
    const [newPartnerName, setNewPartnerName] = useState('');
    const [partnerSaving, setPartnerSaving] = useState(false);
    const [partnerInputMode, setPartnerInputMode] = useState('file'); // 'file' | 'url'
    const [newPartnerUrl, setNewPartnerUrl] = useState('');

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPostsList(data || []);
        } catch (err) {
            console.error("Lỗi tải bài viết:", err);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            if (data) {
                data.forEach(item => {
                    if (item.setting_key === 'site_title') setSiteTitle(item.setting_value);
                    if (item.setting_key === 'site_description') setSiteDescription(item.setting_value);
                    if (item.setting_key === 'meta_keywords') setMetaKeywords(item.setting_value);
                    if (item.setting_key === 'logo_url') setLogoUrl(item.setting_value);
                });
            }
        } catch (err) {
            console.error("Lỗi tải cấu hình:", err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            // 1. Tổng lượt vào website (theo session_id để tính là "người")
            const { data: visitorsData, error: vError } = await supabase
                .from('page_views')
                .select('session_id');
            
            if (vError) throw vError;
            
            const uniqueSessions = new Set(visitorsData.map(v => v.session_id));
            const totalVisitors = uniqueSessions.size;

            // 2. Lượt xem bài viết
            const { count: postViews, error: pvError } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })
                .eq('is_post', true);
                
            if (pvError) throw pvError;

            // 3. Số người đọc bài viết
            const { data: readersData, error: rError } = await supabase
                .from('page_views')
                .select('session_id')
                .eq('is_post', true);

            if (rError) throw rError;
            const uniqueReaders = new Set(readersData.map(r => r.session_id)).size;

            // 4. Lấy dữ liệu cho biểu đồ 14 ngày (Mock logic từ created_at thực tế)
            const today = new Date();
            const last14Days = Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(today.getDate() - (13 - i));
                return date.toISOString().split('T')[0];
            });

            const { data: chartEntries } = await supabase
                .from('page_views')
                .select('created_at')
                .gte('created_at', last14Days[0]);

            const chartMap = {};
            last14Days.forEach(date => chartMap[date] = 0);
            chartEntries?.forEach(entry => {
                const date = entry.created_at.split('T')[0];
                if (chartMap[date] !== undefined) chartMap[date]++;
            });

            setStats({
                totalVisitors,
                postReaders: uniqueReaders,
                postViews: postViews || 0,
                growth: 15.2, // Tính logic tăng trưởng có thể phức tạp hơn, tạm để 15.2%
                chartData: last14Days.map(date => chartMap[date])
            });

        } catch (err) {
            console.error("Lỗi tải thống kê:", err);
        }
    };

    // ===== HOMEPAGE FETCH FUNCTIONS =====
    const fetchHeroContent = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('setting_key, setting_value')
                .in('setting_key', ['hero_heading', 'hero_subheading', 'hero_description']);
            if (data) {
                data.forEach(item => {
                    if (item.setting_key === 'hero_heading') setHeroHeading(item.setting_value || 'Giải Pháp Quản Lý Trường Học');
                    if (item.setting_key === 'hero_subheading') setHeroSubheading(item.setting_value || 'Thông Minh & Tiết Kiệm');
                    if (item.setting_key === 'hero_description') setHeroDescription(item.setting_value || '');
                });
            }
        } catch(e) { console.error(e); }
    };

    const fetchCarouselItems = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('setting_value')
                .eq('setting_key', 'carousel_items').single();
            if (data && data.setting_value) {
                setCarouselItems(JSON.parse(data.setting_value));
            } else {
                // Defaults
                setCarouselItems([
                    { id: 1, src: '/img/tongquan.jpg', caption: 'Quản lý trung tâm cực kỳ đơn giản' },
                    { id: 2, src: '/img/xuathd.jpg', caption: 'Xuất hóa đơn dễ dàng theo tháng hoặc buổi học' },
                    { id: 3, src: '/img/banhang.jpg', caption: 'Bán hàng dễ dàng cho học sinh' },
                    { id: 4, src: '/img/quanlythuchi.jpg', caption: 'Quản lý nợ chưa thu, quá hạn đóng tiền' }
                ]);
            }
        } catch(e) { console.error(e); }
    };

const DEFAULT_PARTNER_LOGOS = [
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

    const fetchPartnerLogos = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('setting_value')
                .eq('setting_key', 'partner_logos').single();
            if (data && data.setting_value) {
                const parsed = JSON.parse(data.setting_value);
                setPartnerLogos(parsed.length > 0 ? parsed : DEFAULT_PARTNER_LOGOS);
            } else {
                setPartnerLogos(DEFAULT_PARTNER_LOGOS);
            }
        } catch(e) { 
            setPartnerLogos(DEFAULT_PARTNER_LOGOS);
        }
    };

    const upsertSetting = async (key, value) => {
        const { data: existing } = await supabase.from('site_settings').select('id').eq('setting_key', key);
        if (existing && existing.length > 0) {
            await supabase.from('site_settings').update({ setting_value: value }).eq('setting_key', key);
        } else {
            await supabase.from('site_settings').insert([{ setting_key: key, setting_value: value }]);
        }
    };

    const handleSaveHero = async () => {
        setHeroSaving(true);
        try {
            await upsertSetting('hero_heading', heroHeading);
            await upsertSetting('hero_subheading', heroSubheading);
            await upsertSetting('hero_description', heroDescription);
            alert('Đã lưu nội dung Hero thành công!');
        } catch(e) { alert('Lỗi: ' + e.message); }
        setHeroSaving(false);
    };

    const handleNewCarouselImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        compressImage(file, (b64) => setNewCarouselImg(b64));
    };

    const handleAddCarouselItem = async () => {
        if (!newCarouselImg || !newCarouselCaption) { alert('Vui lòng chọn ảnh và nhập mô tả!'); return; }
        setCarouselSaving(true);
        try {
            const uploadedUrl = await uploadImageToSupabase(newCarouselImg, 'carousel');
            if (!uploadedUrl) { setCarouselSaving(false); return; }
            const newItem = { id: Date.now(), src: uploadedUrl, caption: newCarouselCaption };
            const updated = [...carouselItems, newItem];
            await upsertSetting('carousel_items', JSON.stringify(updated));
            setCarouselItems(updated);
            setNewCarouselImg(null);
            setNewCarouselCaption('');
            document.getElementById('carousel-img-input').value = '';
            alert('Đã thêm ảnh carousel thành công!');
        } catch(e) { alert('Lỗi: ' + e.message); }
        setCarouselSaving(false);
    };

    const handleDeleteCarouselItem = async (id) => {
        if (!window.confirm('Xóa ảnh này khỏi carousel?')) return;
        const updated = carouselItems.filter(i => i.id !== id);
        await upsertSetting('carousel_items', JSON.stringify(updated));
        setCarouselItems(updated);
    };

    const handleNewPartnerImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        compressImage(file, (b64) => setNewPartnerImg(b64));
    };

    const handleAddPartner = async () => {
        const name = newPartnerName.trim();
        if (!name) { alert('Vui lòng nhập tên trường/trung tâm!'); return; }
        setPartnerSaving(true);
        try {
            let finalSrc = '';
            if (partnerInputMode === 'url') {
                if (!newPartnerUrl.trim()) { alert('Vui lòng nhập URL ảnh!'); setPartnerSaving(false); return; }
                finalSrc = newPartnerUrl.trim();
            } else {
                if (!newPartnerImg) { alert('Vui lòng chọn ảnh logo!'); setPartnerSaving(false); return; }
                finalSrc = await uploadImageToSupabase(newPartnerImg, 'partners');
                if (!finalSrc) { setPartnerSaving(false); return; }
            }
            const newItem = { id: Date.now(), src: finalSrc, name };
            const updated = [...partnerLogos, newItem];
            await upsertSetting('partner_logos', JSON.stringify(updated));
            setPartnerLogos(updated);
            setNewPartnerImg(null);
            setNewPartnerName('');
            setNewPartnerUrl('');
            if (document.getElementById('partner-img-input')) document.getElementById('partner-img-input').value = '';
            alert('Đã thêm logo đối tác thành công!');
        } catch(e) { alert('Lỗi: ' + e.message); }
        setPartnerSaving(false);
    };

    const handleDeletePartner = async (id) => {
        if (!window.confirm('Xóa logo đối tác này?')) return;
        const updated = partnerLogos.filter(i => i.id !== id);
        await upsertSetting('partner_logos', JSON.stringify(updated));
        setPartnerLogos(updated);
    };

    useEffect(() => {
        if (view === 'posts') {
            fetchPosts();
        } else if (view === 'settings') {
            fetchSettings();
        } else if (view === 'statistics') {
            fetchAnalytics();
        } else if (view === 'homepage') {
            fetchHeroContent();
            fetchCarouselItems();
            fetchPartnerLogos();
        }
    }, [view]);
    // Initialize Quill and Tagify (mocking logic)
    useEffect(() => {
        if (view === 'editor' && !editorRef.current) {
            // Need setTimeout because Quill requires DOM element to be in the document
            setTimeout(() => {
                if(window.Quill && document.getElementById('editor')){
                     editorRef.current = new window.Quill('#editor', {
                        modules: {
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],        
                                ['blockquote', 'code-block'],
                                [{ 'header': 1 }, { 'header': 2 }],               
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'indent': '-1'}, { 'indent': '+1' }],          
                                [{ 'direction': 'rtl' }],                         
                                [{ 'size': ['small', false, 'large', 'huge'] }],  
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                [{ 'color': [] }, { 'background': [] }],          
                                [{ 'align': [] }],
                                ['link', 'image', 'video'],                       
                                ['clean']   
                            ]
                        },
                        theme: 'snow',
                        placeholder: 'Viết nội dung bài của bạn tại đây...'
                    });
                }
            }, 100);
        } else if (view !== 'editor') {
            editorRef.current = null; // reset if leave editor view
        }
    }, [view]);

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const stored = sessionStorage.getItem('easy4school_admin_session');
            return stored ? JSON.parse(stored) : null;
        } catch(e) { return null; }
    });

    useEffect(() => {
        const stored = sessionStorage.getItem('easy4school_admin_session');
        if (!stored) {
            navigate('/admin/login');
        } else {
            try {
                setCurrentUser(JSON.parse(stored));
            } catch(e) {}
        }
    }, [navigate]);

    // Handle Logout
    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('easy4school_admin_session');
        navigate('/admin/login');
    };

    const handleSavePost = async () => {
        if (!postTitle) {
            alert("Vui lòng nhập tiêu đề bài viết!");
            return;
        }
        
        let content = '';
        if (editorRef.current) {
            content = editorRef.current.root.innerHTML;
        }

        let finalFeatureImage = postFeatureImage;
        if (postFeatureImage && postFeatureImage.startsWith('data:')) {
            const uploadedUrl = await uploadImageToSupabase(postFeatureImage, 'posts');
            if (!uploadedUrl) return; // Dừng lại nếu upload lỗi
            finalFeatureImage = uploadedUrl;
            setPostFeatureImage(finalFeatureImage);
        }

        const toSlug = (str) => {
            return str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        };
        const slug = toSlug(postTitle);

        const postData = { 
            title: postTitle, 
            slug: slug, 
            content: content, 
            meta_title: postMetaTitle, 
            meta_description: postMetaDesc, 
            status: postStatus === 'published' ? 'published' : 'draft',
            feature_image: finalFeatureImage || null
        };

        try {
            let errorResult;
            if (editingPostId) {
                const { error } = await supabase.from('posts').update(postData).eq('id', editingPostId);
                errorResult = error;
            } else {
                const { error } = await supabase.from('posts').insert([postData]);
                errorResult = error;
            }
                
            if (errorResult) {
                console.error("Supabase Error:", errorResult);
                if (errorResult.message && errorResult.message.includes('value too long')) {
                    alert("Ảnh dung lượng quá lớn hoặc bảng trong Database chưa được thiết lập cột TEXT. Vui lòng vào Supabase SQL Editor chạy lệnh: ALTER TABLE posts ALTER COLUMN feature_image TYPE TEXT;");
                } else {
                    alert("Lưu thất bại! Chi tiết lỗi: " + errorResult.message);
                }
            } else {
                alert("Đã lưu bài viết thành công!");
                setView('posts');
                setEditingPostId(null);
                setPostTitle('');
                setPostMetaTitle('');
                setPostMetaDesc('');
                setPostFeatureImage('');
                if(editorRef.current) editorRef.current.root.innerHTML = '';
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi cấu hình Database. Vui lòng kiểm tra lại!");
        }
    };

    const handleEditPost = (post) => {
        setEditingPostId(post.id);
        setPostTitle(post.title || '');
        setPostMetaTitle(post.meta_title || '');
        setPostMetaDesc(post.meta_description || '');
        setPostStatus(post.status || 'published');
        setPostFeatureImage(post.feature_image || '');
        
        setView('editor');
        
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.root.innerHTML = post.content || '';
            }
        }, 200);
    };

    const handleDeletePost = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                const { error } = await supabase.from('posts').delete().eq('id', id);
                if (error) throw error;
                fetchPosts();
            } catch (err) {
                console.error("Lỗi xóa bài:", err);
                alert("Đã xảy ra lỗi khi xóa bài viết.");
            }
        }
    };

    const handleNewPost = () => {
        setEditingPostId(null);
        setPostTitle('');
        setPostMetaTitle('');
        setPostMetaDesc('');
        setPostFeatureImage('');
        setPostStatus('published');
        setView('editor');
        setTimeout(() => {
            if(editorRef.current) editorRef.current.root.innerHTML = '';
        }, 200);
    };

    const handleSaveSettings = async () => {
        try {
            let finalLogoUrl = logoUrl;
            if (logoUrl && logoUrl.startsWith('data:')) {
                const uploadedUrl = await uploadImageToSupabase(logoUrl, 'logos');
                if (!uploadedUrl) return;
                finalLogoUrl = uploadedUrl;
                setLogoUrl(finalLogoUrl);
            }

            const updates = [
                { setting_key: 'site_title', setting_value: siteTitle },
                { setting_key: 'site_description', setting_value: siteDescription },
                { setting_key: 'meta_keywords', setting_value: metaKeywords },
                { setting_key: 'logo_url', setting_value: finalLogoUrl }
            ];
            
            for (let setting of updates) {
                const { error: matchError, data: matchData } = await supabase
                    .from('site_settings')
                    .select('id')
                    .eq('setting_key', setting.setting_key);

                if (matchData && matchData.length > 0) {
                    await supabase
                        .from('site_settings')
                        .update({ setting_value: setting.setting_value })
                        .eq('setting_key', setting.setting_key);
                } else {
                    await supabase
                        .from('site_settings')
                        .insert([setting]);
                }
            }
            alert("Đã lưu cấu hình thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu cấu hình!");
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        compressImage(file, (compressedBase64) => {
            setLogoUrl(compressedBase64);
        });
    };

    const handleFeatureImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        compressImage(file, (compressedBase64) => {
            setPostFeatureImage(compressedBase64);
        });
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className='bx bxs-school' style={{fontSize: '32px', color: 'var(--primary-color)'}}></i>
                    <h3>Easy4School</h3>
                </div>
                <div className="sidebar-menu">
                    <a href="#" className={`menu-item ${view === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('dashboard'); }}>
                        <i className='bx bx-home-alt'></i>
                        <span>Tổng quan</span>
                    </a>
                    <a href="#" className={`menu-item ${view === 'posts' || view === 'editor' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('posts'); }}>
                        <i className='bx bx-news'></i>
                        <span>Bài viết</span>
                    </a>
                    <a href="#" className={`menu-item ${view === 'homepage' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('homepage'); }}>
                        <i className='bx bx-palette'></i>
                        <span>Nội dung Trang chủ</span>
                    </a>
                    <a href="#" className={`menu-item ${view === 'tags' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('tags'); }}>
                        <i className='bx bx-purchase-tag-alt'></i>
                        <span>Tạo Tags</span>
                    </a>
                    <a href="#" className={`menu-item ${view === 'statistics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('statistics'); }}>
                        <i className='bx bx-bar-chart-alt-2'></i>
                        <span>Thống kê</span>
                    </a>
                    <a href="#" className={`menu-item ${view === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('settings'); }}>
                        <i className='bx bx-cog'></i>
                        <span>Cấu hình Web (SEO)</span>
                    </a>
                    <a href="#" className="menu-item" style={{marginTop: 'auto'}} onClick={handleLogout}>
                        <i className='bx bx-log-out'></i>
                        <span>Đăng xuất</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    <div className="page-title">
                        {view === 'dashboard' && 'Tổng quan'}
                        {view === 'posts' && 'Quản lý Bài viết'}
                        {view === 'editor' && 'Soạn thảo Bài viết'}
                        {view === 'homepage' && 'Nội dung Trang chủ'}
                        {view === 'tags' && 'Quản lý Tags'}
                        {view === 'statistics' && 'Thống kê truy cập'}
                        {view === 'settings' && 'Cấu hình Web (Metadata & SEO)'}
                    </div>
                    <div className="topbar-right">
                        <div className="admin-profile">
                            <div className="admin-avatar">
                                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span>{currentUser?.name || currentUser?.username || 'Admin'}</span>
                            <i className='bx bx-chevron-down'></i>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {/* Dashboard View */}
                    {view === 'dashboard' && (
                        <div className="view-section active">
                            <div className="card">
                                <h3 className="card-title">Xin chào Admin!</h3>
                                <p style={{color: 'var(--gray-color)', marginTop: '10px'}}>Chào mừng bạn đến với trang quản trị Easy4School. Tại đây bạn có thể quản lý bài viết, cấu hình website chuẩn SEO.</p>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'}}>
                                <div className="card">
                                    <h3 className="card-title">Bài viết</h3>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)'}}>12</div>
                                </div>
                                <div className="card">
                                    <h3 className="card-title">Tags</h3>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)'}}>8</div>
                                </div>
                                <div className="card">
                                    <h3 className="card-title">Lượt xem</h3>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)'}}>1,204</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manage Posts View */}
                    {view === 'posts' && (
                        <div className="view-section active">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Quản lý Bài viết</h3>
                                    <button className="btn btn-primary" onClick={handleNewPost}>
                                        <i className='bx bx-plus'></i> Viết bài mới
                                    </button>
                                </div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Tiêu đề</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày tạo</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postsList.length > 0 ? postsList.map(post => (
                                            <tr key={post.id}>
                                                <td>{post.title}</td>
                                                <td>
                                                    <span className={`status-badge status-${post.status}`}>
                                                        {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                                    </span>
                                                </td>
                                                <td>{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td className="actions">
                                                    <button className="action-btn" onClick={() => handleEditPost(post)}><i className='bx bx-edit-alt'></i></button>
                                                    <button className="action-btn delete" onClick={() => handleDeletePost(post.id)}><i className='bx bx-trash'></i></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center' }}>Chưa có bài viết nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Create/Edit Post View */}
                    {view === 'editor' && (
                        <div className="view-section active">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Soạn thảo Bài viết</h3>
                                    <div>
                                        <button className="btn btn-outline" onClick={() => setView('posts')}>Hủy</button>
                                        <button className="btn btn-primary" style={{marginLeft: '10px'}} onClick={handleSavePost}>Lưu & Xuất bản</button>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-col" style={{flex: 2}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Tiêu đề bài viết</label>
                                        <input type="text" className="custom-input" placeholder="Nhập tiêu đề..." value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>Nội dung (Có thể chèn hình, video)</label>
                                        <div id="editor" style={{height: '400px'}}></div>
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>SEO Meta Title</label>
                                        <input type="text" className="custom-input" placeholder="Tiêu đề hiển thị trên Google (tối đa 60 ký tự)" value={postMetaTitle} onChange={(e) => setPostMetaTitle(e.target.value)} />
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>SEO Meta Description</label>
                                        <textarea className="custom-input" placeholder="Mô tả tóm tắt cho bài viết chuẩn SEO (tối đa 150-160 ký tự)" value={postMetaDesc} onChange={(e) => setPostMetaDesc(e.target.value)}></textarea>
                                    </div>
                                    <div className="form-col" style={{flex: 1}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Ảnh đại diện (Feature Image)</label>
                                        <div 
                                            className="image-upload-box" 
                                            style={{position: 'relative', cursor: 'pointer', textAlign: 'center', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                            onClick={() => document.getElementById('feature-image-upload').click()}
                                        >
                                            {postFeatureImage ? (
                                                <>
                                                    <img src={postFeatureImage} alt="Feature" style={{maxWidth: '100%', maxHeight: '150px', objectFit: 'contain'}} />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPostFeatureImage(''); }}
                                                        style={{position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'}}
                                                        title="Xóa ảnh"
                                                    >
                                                        <i className='bx bx-x'></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <div>
                                                    <i className='bx bx-cloud-upload'></i>
                                                    <p>Kéo thả ảnh hoặc click để tải lên</p>
                                                </div>
                                            )}
                                            <input 
                                                id="feature-image-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                style={{display: 'none'}} 
                                                onChange={handleFeatureImageUpload} 
                                            />
                                        </div>
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>Tags</label>
                                        <input name="basic" className="custom-input" value="Quản lý, Giáo dục" readOnly />
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>Trạng thái</label>
                                        <select className="custom-input" value={postStatus} onChange={(e) => setPostStatus(e.target.value)}>
                                            <option value="published">Đã xuất bản</option>
                                            <option value="draft">Bản nháp</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== HOMEPAGE CONTENT VIEW ===== */}
                    {view === 'homepage' && (
                        <div className="view-section active">

                            {/* --- HERO SECTION EDITOR --- */}
                            <div className="card" style={{marginBottom: '24px'}}>
                                <div className="card-header">
                                    <h3 className="card-title">✏️ Nội dung Hero (Màn hình đầu tiên)</h3>
                                    <button className="btn btn-primary" onClick={handleSaveHero} disabled={heroSaving}>
                                        {heroSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                                <div style={{display:'grid', gap:'16px'}}>
                                    <div>
                                        <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'14px'}}>Tiêu đề chính (Dòng 1)</label>
                                        <input type="text" className="custom-input" value={heroHeading} onChange={e => setHeroHeading(e.target.value)} placeholder="Giải Pháp Quản Lý Trường Học" />
                                        <small style={{color:'#888', marginTop:'4px', display:'block'}}>Hiển thị trên đầu trang chủ màu đen</small>
                                    </div>
                                    <div>
                                        <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'14px'}}>Tiêu đề phụ (Dòng 2 – màu gradient)</label>
                                        <input type="text" className="custom-input" value={heroSubheading} onChange={e => setHeroSubheading(e.target.value)} placeholder="Thông Minh & Tiết Kiệm" />
                                    </div>
                                    <div>
                                        <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'14px'}}>Đoạn mô tả ngắn</label>
                                        <textarea className="custom-input" rows={3} value={heroDescription} onChange={e => setHeroDescription(e.target.value)} placeholder="Mô tả ngắn gọn về giải pháp..." />
                                    </div>
                                </div>
                            </div>

                            {/* --- CAROUSEL IMAGES EDITOR --- */}
                            <div className="card" style={{marginBottom: '24px'}}>
                                <div className="card-header">
                                    <h3 className="card-title">🖼️ Hình ảnh Giao diện thực tế (Carousel)</h3>
                                </div>
                                <p style={{color:'#666', marginBottom:'16px', fontSize:'14px'}}>Tải lên các ảnh screenshot giao diện phần mềm để hiển thị trong section "Xem giao diện thực tế".</p>

                                {/* Existing items */}
                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'12px', marginBottom:'24px'}}>
                                    {carouselItems.map(item => (
                                        <div key={item.id} style={{border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', background:'#f8fafc'}}>
                                            <img src={item.src} alt={item.caption} style={{width:'100%', height:'140px', objectFit:'cover', display:'block'}} />
                                            <div style={{padding:'10px'}}>
                                                <p style={{fontSize:'13px', color:'#334155', marginBottom:'8px', fontWeight:'500'}}>{item.caption}</p>
                                                <button
                                                    onClick={() => handleDeleteCarouselItem(item.id)}
                                                    style={{background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600'}}
                                                >🗑️ Xóa</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new */}
                                <div style={{background:'#f0f4ff', borderRadius:'12px', padding:'20px', border:'2px dashed #c7d2fe'}}>
                                    <h4 style={{marginBottom:'16px', color:'#4f46e5', fontSize:'14px', fontWeight:'700'}}>+ Thêm ảnh mới vào Carousel</h4>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'end'}}>
                                        <div>
                                            <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px'}}>Chọn ảnh</label>
                                            <input id="carousel-img-input" type="file" accept="image/*" className="custom-input" onChange={handleNewCarouselImageUpload} style={{padding:'6px'}} />
                                            {newCarouselImg && <img src={newCarouselImg} alt="preview" style={{marginTop:'8px', height:'80px', borderRadius:'6px', objectFit:'cover'}} />}
                                        </div>
                                        <div>
                                            <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px'}}>Mô tả ảnh (hiển thị bên dưới)</label>
                                            <input type="text" className="custom-input" value={newCarouselCaption} onChange={e => setNewCarouselCaption(e.target.value)} placeholder="VD: Quản lý học viên dễ dàng" />
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={handleAddCarouselItem} disabled={carouselSaving}>
                                        {carouselSaving ? 'Đang tải lên...' : '+ Thêm vào Carousel'}
                                    </button>
                                </div>
                            </div>

                            {/* --- PARTNER LOGOS EDITOR --- */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">🏫 Logo Đối tác (Trường hợp tác)</h3>
                                </div>
                                <p style={{color:'#666', marginBottom:'16px', fontSize:'14px'}}>Quản lý danh sách logo trường/trung tâm chạy trong thanh marquee.</p>

                                {/* Existing partners */}
                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px', marginBottom:'24px'}}>
                                    {partnerLogos.map(item => (
                                        <div key={item.id} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px', background:'white', textAlign:'center'}}>
                                            <img src={item.src} alt={item.name} style={{height:'60px', objectFit:'contain', display:'block', margin:'0 auto 8px'}} />
                                            <p style={{fontSize:'12px', color:'#475569', fontWeight:'600', marginBottom:'8px'}}>{item.name}</p>
                                            <button
                                                onClick={() => handleDeletePartner(item.id)}
                                                style={{background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', padding:'3px 8px', fontSize:'11px', cursor:'pointer', fontWeight:'600'}}
                                            >🗑️ Xóa</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new partner */}
                                <div style={{background:'#f0fdf4', borderRadius:'12px', padding:'20px', border:'2px dashed #86efac'}}>
                                    <h4 style={{marginBottom:'16px', color:'#16a34a', fontSize:'14px', fontWeight:'700'}}>+ Thêm logo đối tác mới</h4>
                                    <div style={{marginBottom:'12px'}}>
                                        <label style={{fontWeight:'600', fontSize:'13px', marginRight:'16px'}}>Cách thêm logo:</label>
                                        <label style={{marginRight:'12px', cursor:'pointer'}}>
                                            <input type="radio" name="partnerMode" checked={partnerInputMode==='file'} onChange={() => setPartnerInputMode('file')} /> Tải file ảnh lên
                                        </label>
                                        <label style={{cursor:'pointer'}}>
                                            <input type="radio" name="partnerMode" checked={partnerInputMode==='url'} onChange={() => setPartnerInputMode('url')} /> Dùng URL ảnh
                                        </label>
                                    </div>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'end'}}>
                                        <div>
                                            {partnerInputMode === 'file' ? (
                                                <>
                                                    <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px'}}>Chọn file logo</label>
                                                    <input id="partner-img-input" type="file" accept="image/*" className="custom-input" onChange={handleNewPartnerImageUpload} style={{padding:'6px'}} />
                                                    {newPartnerImg && <img src={newPartnerImg} alt="preview" style={{marginTop:'8px', height:'60px', objectFit:'contain'}} />}
                                                </>
                                            ) : (
                                                <>
                                                    <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px'}}>URL ảnh logo</label>
                                                    <input type="url" className="custom-input" value={newPartnerUrl} onChange={e => setNewPartnerUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                                                    {newPartnerUrl && <img src={newPartnerUrl} alt="preview" style={{marginTop:'8px', height:'60px', objectFit:'contain'}} onError={e => e.target.style.display='none'} />}
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px'}}>Tên trường / Trung tâm</label>
                                            <input type="text" className="custom-input" value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} placeholder="VD: Trung tâm Ánh Minh" />
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" style={{marginTop:'16px', background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'none'}} onClick={handleAddPartner} disabled={partnerSaving}>
                                        {partnerSaving ? 'Đang lưu...' : '+ Thêm Logo Đối Tác'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags Management View */}
                    {view === 'tags' && (
                        <div className="view-section active">
                            <div className="card">
                                <h3 className="card-title">Quản lý Tags</h3>
                                <div className="form-row">
                                    <div className="form-col" style={{flex: 1}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Tên Tag mới</label>
                                        <input type="text" className="custom-input" placeholder="Nhập tên tag..." />
                                        <button className="btn btn-primary" style={{marginTop: '15px'}}>Thêm Tag</button>
                                    </div>
                                    <div className="form-col" style={{flex: 2}}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên Tag</th>
                                                    <th>Slug</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Quản lý</td>
                                                    <td>quan-ly</td>
                                                    <td className="actions">
                                                        <button className="action-btn delete"><i className='bx bx-trash'></i></button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics View */}
                    {view === 'statistics' && (
                        <div className="view-section active">
                            <div className="card">
                                <h3 className="card-title">Thống kê truy cập website</h3>
                                <p style={{color: 'var(--gray-color)', marginTop: '10px'}}>Đo lường số lượt truy cập website, lượng người đọc và lượt xem bài viết.</p>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px'}}>
                                <div className="card">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <h3 className="card-title" style={{fontSize: '14px', color: 'var(--gray-color)'}}>Người vào website</h3>
                                        <i className='bx bx-globe' style={{fontSize: '24px', color: 'var(--primary-color)'}}></i>
                                    </div>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: '#333', marginTop: '10px'}}>{stats.totalVisitors.toLocaleString()}</div>
                                    <div style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>
                                        <i className='bx bx-up-arrow-alt'></i> +12% so với tháng trước
                                    </div>
                                </div>
                                <div className="card">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <h3 className="card-title" style={{fontSize: '14px', color: 'var(--gray-color)'}}>Người đọc bài viết</h3>
                                        <i className='bx bx-user-check' style={{fontSize: '24px', color: '#ff9800'}}></i>
                                    </div>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: '#333', marginTop: '10px'}}>{stats.postReaders.toLocaleString()}</div>
                                    <div style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>
                                        <i className='bx bx-up-arrow-alt'></i> +5% so với tháng trước
                                    </div>
                                </div>
                                <div className="card">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <h3 className="card-title" style={{fontSize: '14px', color: 'var(--gray-color)'}}>Lượt xem bài viết</h3>
                                        <i className='bx bx-show' style={{fontSize: '24px', color: '#f44336'}}></i>
                                    </div>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: '#333', marginTop: '10px'}}>{stats.postViews.toLocaleString()}</div>
                                    <div style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>
                                        <i className='bx bx-up-arrow-alt'></i> +18% so với tháng trước
                                    </div>
                                </div>
                                <div className="card">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <h3 className="card-title" style={{fontSize: '14px', color: 'var(--gray-color)'}}>Tăng trưởng hàng tháng</h3>
                                        <i className='bx bx-line-chart' style={{fontSize: '24px', color: '#4caf50'}}></i>
                                    </div>
                                    <div style={{fontSize: '32px', fontWeight: '700', color: '#333', marginTop: '10px'}}>+{stats.growth}%</div>
                                    <div style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>
                                        Trung bình 6 tháng qua
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="card-title">Biểu đồ lượt truy cập 14 ngày qua</h3>
                                <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '15px', paddingTop: '20px', borderBottom: '1px solid #eee' }}>
                                    {(stats.chartData.length > 0 ? stats.chartData : [0,0,0,0,0,0,0,0,0,0,0,0,0,0]).map((h, i) => {
                                        const max = Math.max(...stats.chartData, 1);
                                        const heightPercent = (h / max) * 100;
                                        return (
                                            <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                                                <div style={{ backgroundColor: 'var(--primary-color)', width: '100%', height: `${heightPercent}%`, borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'all 0.3s ease' }} title={`Ngày ${i+1}: ${h} lượt`}></div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: 'var(--gray-color)', fontSize: '14px', fontWeight: '500' }}>
                                    <span>2 tuần trước</span>
                                    <span>1 tuần trước</span>
                                    <span>Hôm nay</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings / SEO View */}
                    {view === 'settings' && (
                        <div className="view-section active">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Cấu hình Web (Metadata & SEO)</h3>
                                    <button className="btn btn-primary" onClick={handleSaveSettings}>Lưu cấu hình</button>
                                </div>
                                <div className="form-row">
                                    <div className="form-col">
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Tên Site (Site Title)</label>
                                        <input type="text" className="custom-input" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} />
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>Mô tả chung (Meta Description)</label>
                                        <textarea className="custom-input" value={siteDescription} onChange={e => setSiteDescription(e.target.value)} />
                                        
                                        <label style={{display: 'block', margin: '20px 0 8px', fontWeight: '500'}}>Từ khóa (Meta Keywords)</label>
                                        <input className="custom-input" value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} />
                                    </div>
                                    <div className="form-col">
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Logo</label>
                                        <div 
                                            className="image-upload-box" 
                                            style={{position: 'relative', padding: '20px', cursor: 'pointer', textAlign: 'center', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                            onClick={() => document.getElementById('logo-upload-input').click()}
                                        >
                                            {logoUrl ? (
                                                <>
                                                    <img src={logoUrl} alt="Logo Preview" style={{maxWidth: '100%', maxHeight: '100px', objectFit: 'contain'}} />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
                                                        style={{position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'}}
                                                        title="Xóa ảnh"
                                                    >
                                                        <i className='bx bx-x'></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <div><i className='bx bx-upload'></i> Tải logo mới lên</div>
                                            )}
                                            <input 
                                                id="logo-upload-input" 
                                                type="file" 
                                                accept="image/*" 
                                                style={{display: 'none'}} 
                                                onChange={handleLogoUpload} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
