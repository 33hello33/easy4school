import { supabase } from './supabaseClient';

// Hàm tạo session ID đơn giản để tránh đếm trùng trong một lân truy cập
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
};

export const trackPageView = async (path, isPost = false, postId = null) => {
    try {
        const { error } = await supabase.from('page_views').insert([{
            page_path: path,
            is_post: isPost,
            post_id: postId,
            session_id: getSessionId(),
            user_agent: navigator.userAgent
        }]);
        if (error) console.error('Tracking error:', error);
    } catch (err) {
        console.error('Analytics failed:', err);
    }
};
