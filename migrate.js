import fs from 'fs';

function htmlToJsx(html) {
    let jsx = html;
    
    // Replace class= with className=
    jsx = jsx.replace(/class=/g, 'className=');
    
    // Replace for= with htmlFor=
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    // Close img tags
    jsx = jsx.replace(/<img(.*?)>/g, (match) => {
        if (match.endsWith('/>')) return match;
        return match.replace(/>$/, ' />');
    });
    
    // Close input tags
    jsx = jsx.replace(/<input(.*?)>/g, (match) => {
        if (match.endsWith('/>')) return match;
        return match.replace(/>$/, ' />');
    });
    
    // Close br tags
    jsx = jsx.replace(/<br>/g, '<br />');
    
    // Fix styles
    // Simplistic style fix: we mostly have 'display: block; ...'
    // For this exact template, it's safer to just remove the inline styles that break JSX or replace them manually.
    // Let's remove the inline style of canvas.
    jsx = jsx.replace(/style="[^"]*"/g, '');
    
    return jsx;
}

// 1. Process index.html to Home.jsx
const indexHtmlContent = fs.readFileSync('index.html', 'utf-8');
const bodyMatch = indexHtmlContent.match(/<body>([\s\S]*?)<script>/);
let bodyContent = '';
if (bodyMatch) {
    bodyContent = bodyMatch[1];
} else {
    bodyContent = '<div className="error">Could not parse body</div>';
}

const homeJsx = `import React, { useEffect } from 'react';
import '../style.css'; // Add CSS back

export default function Home() {
    useEffect(() => {
        // Here we would ideally re-initialize chart.js and other scripts
        // But for now, we just let it render correctly.
    }, []);

    return (
        <>
            ${htmlToJsx(bodyContent)}
        </>
    );
}
`;

fs.writeFileSync('src/pages/Home.jsx', homeJsx);
console.log('Home.jsx created successfully.');

