document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation System ---
    const menuItems = document.querySelectorAll('.menu-item[data-view]');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    function switchView(viewId) {
        // Hide all views
        viewSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(`view-${viewId}`);
        if(targetView) {
            targetView.classList.add('active');
        }

        // Update active menu link
        menuItems.forEach(item => {
            if(item.dataset.view === viewId || (viewId === 'editor' && item.dataset.view === 'posts')) {
                item.classList.add('active');
                if(viewId !== 'editor') {
                    pageTitle.textContent = item.querySelector('span').textContent;
                } else {
                    pageTitle.textContent = 'Soạn thảo Bài viết';
                }
            } else {
                item.classList.remove('active');
            }
        });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') !== '#') return; // let logout link work
            e.preventDefault();
            const viewId = item.dataset.view;
            switchView(viewId);
        });
    });

    // --- Create/Edit Post Button Handling ---
    const btnCreatePost = document.getElementById('btn-create-post');
    const btnCancelPost = document.getElementById('btn-cancel-post');

    if(btnCreatePost) {
        btnCreatePost.addEventListener('click', () => {
            switchView('editor');
        });
    }

    if(btnCancelPost) {
        btnCancelPost.addEventListener('click', () => {
            switchView('posts');
        });
    }

    // --- Initialize Quill WYSIWYG Editor ---
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults
        [{ 'align': [] }],
        ['link', 'image', 'video'],                       // add's image support
        ['clean']                                         // remove formatting button
    ];

    if(document.getElementById('editor')) {
        const quill = new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow',
            placeholder: 'Viết nội dung bài của bạn tại đây...'
        });
    }

    // --- Initialize Tagify (for Input tags) ---
    // Posts tags
    const tagInput = document.querySelector('.tagify-input');
    if(tagInput) {
        new Tagify(tagInput, {
            whitelist: ["Quản lý", "Giáo dục", "Lợi nhuận", "Trung tâm Anh ngữ", "Công nghệ"],
            maxTags: 10,
            dropdown: {
                maxItems: 20,           
                classname: "tags-look", 
                enabled: 0,             
                closeOnSelect: false    
            }
        });
    }

    // SEO keywords
    const keywordsInput = document.querySelector('.tagify-keywords');
    if(keywordsInput) {
        new Tagify(keywordsInput);
    }
});
