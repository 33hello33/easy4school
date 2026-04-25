import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import BlogPost from './pages/BlogPost';
import { trackPageView } from './lib/analytics';

function App() {
  useEffect(() => {
    // Tracking lượt truy cập website
    trackPageView(window.location.pathname);
    
    const applySEO = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;
        if (data) {
          data.forEach(item => {
            if (item.setting_key === 'site_title' && item.setting_value) {
              document.title = item.setting_value;
            }
            if (item.setting_key === 'site_description' && item.setting_value) {
              let metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
              }
              metaDesc.content = item.setting_value;
            }
            if (item.setting_key === 'meta_keywords' && item.setting_value) {
              let metaKey = document.querySelector('meta[name="keywords"]');
              if (!metaKey) {
                metaKey = document.createElement('meta');
                metaKey.name = "keywords";
                document.head.appendChild(metaKey);
              }
              metaKey.content = item.setting_value;
            }
            if (item.setting_key === 'favicon_url' && item.setting_value) {
              let linkFavicon = document.querySelector('link[rel="icon"]');
              if (!linkFavicon) {
                linkFavicon = document.createElement('link');
                linkFavicon.rel = "icon";
                document.head.appendChild(linkFavicon);
              }
              linkFavicon.href = item.setting_value;
            }
          });
        }
      } catch (err) {
        console.error("Lỗi cài đặt SEO:", err);
      }
    };
    applySEO();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
