import fs from 'fs';
import { execSync } from 'child_process';

function htmlToJsx(html) {
    let jsx = html;
    
    // Replace class= with className=
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    jsx = jsx.replace(/style="display: block; box-sizing: border-box; height: 250px; width: 669px;"/g, "style={{ display: 'block', boxSizing: 'border-box', height: '250px', width: '669px' }}");
    jsx = jsx.replace(/style="font-size: 2rem;"/g, "style={{ fontSize: '2rem' }}");
    jsx = jsx.replace(/style="color: #666; margin-top: 1rem;"/g, "style={{ color: '#666', marginTop: '1rem' }}");
    jsx = jsx.replace(/style="color: var\(--primary\);"/g, "style={{ color: 'var(--primary)' }}");
    jsx = jsx.replace(/style="margin: 1rem 0;"/g, "style={{ margin: '1rem 0' }}");
    jsx = jsx.replace(/style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f0f0f0; align-items: center;"/g, "style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}");
    jsx = jsx.replace(/style="display: flex; align-items: center; gap: 12px;"/g, "style={{ display: 'flex', alignItems: 'center', gap: '12px' }}");
    jsx = jsx.replace(/style="font-weight: bold; width: 25px; color: #666;"/g, "style={{ fontWeight: 'bold', width: '25px', color: '#666' }}");
    jsx = jsx.replace(/style="display: flex; flex-direction: column;"/g, "style={{ display: 'flex', flexDirection: 'column' }}");
    jsx = jsx.replace(/style="font-weight: bold; color: #333;"/g, "style={{ fontWeight: 'bold', color: '#333' }}");
    jsx = jsx.replace(/style="color: #888;"/g, "style={{ color: '#888' }}");
    jsx = jsx.replace(/style="color: #aaa; font-size: 10px;"/g, "style={{ color: '#aaa', fontSize: '10px' }}");
    jsx = jsx.replace(/style="font-weight: bold; color: #d32f2f; background: #fff5f5; padding: 4px 8px; border-radius: 4px;"/g, "style={{ fontWeight: 'bold', color: '#d32f2f', background: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}");
    jsx = jsx.replace(/style="font-size: 2.2rem; margin-bottom: 1rem;"/g, "style={{ fontSize: '2.2rem', marginBottom: '1rem' }}");
    jsx = jsx.replace(/style="display: inline-block;"/g, "style={{ display: 'inline-block' }}");
    jsx = jsx.replace(/style="text-decoration: none; color: inherit;"/g, "style={{ textDecoration: 'none', color: 'inherit' }}");
    jsx = jsx.replace(/style="background:#0f172a; color:#fff; padding:30px 20px; margin-top:40px;"/g, "style={{ background:'#0f172a', color:'#fff', padding:'30px 20px', marginTop:'40px' }}");
    jsx = jsx.replace(/style="max-width:1200px; margin:auto; display:flex; flex-wrap:wrap; gap:30px;"/g, "style={{ maxWidth:'1200px', margin:'auto', display:'flex', flexWrap:'wrap', gap:'30px' }}");
    jsx = jsx.replace(/style="flex:1; min-width:250px;"/g, "style={{ flex:1, minWidth:'250px' }}");
    jsx = jsx.replace(/style="margin-bottom:10px;"/g, "style={{ marginBottom:'10px' }}");
    jsx = jsx.replace(/style="list-style:none; padding:0; line-height:1.8;"/g, "style={{ listStyle:'none', padding:0, lineHeight:'1.8' }}");
    jsx = jsx.replace(/style="color:#cbd5f5; text-decoration:none;"/g, "style={{ color:'#cbd5f5', textDecoration:'none' }}");
    jsx = jsx.replace(/style="font-size:0.9rem; margin-top:10px;"/g, "style={{ fontSize:'0.9rem', marginTop:'10px' }}");
    jsx = jsx.replace(/style="text-align:center; margin-top:25px; border-top:1px solid #1e293b; padding-top:15px; font-size:0.9rem;"/g, "style={{ textAlign:'center', marginTop:'25px', borderTop:'1px solid #1e293b', paddingTop:'15px', fontSize:'0.9rem' }}");

    jsx = jsx.replace(/<br>/g, '<br />');
    jsx = jsx.replace(/<hr>/g, '<hr />');
    jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');

    jsx = jsx.replace(/<img(.*?)>/g, (match) => {
        if (match.endsWith('/>')) return match;
        return match.replace(/>$/, ' />');
    });

    jsx = jsx.replace(/<input(.*?)>/g, (match) => {
        if (match.endsWith('/>')) return match;
        return match.replace(/>$/, ' />');
    });
    
    // Remove inline styles to avoid parsing errors
    jsx = jsx.replace(/style="[^"]*"/g, "");

    return jsx;
}

try {
    // We get file straight from git command skipping powershell >> utf16le issue
    const content = execSync('git show HEAD:index.html', { encoding: 'utf-8' });

    const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
    const match = content.match(bodyRegex);

    let bodyContent = '';
    if (match) {
        bodyContent = match[1];
        // Remove scripts directly inside the string
        bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else {
        bodyContent = '<div className="error">Could not parse body from git content</div>';
    }

    const homeJsx = `import React, { useEffect } from 'react';\nimport '../assets/style.css';\n\nexport default function Home() {\n    return (\n        <>\n            ${htmlToJsx(bodyContent)}\n        </>\n    );\n}\n`;

    fs.writeFileSync('src/pages/Home.jsx', homeJsx);
    console.log('Successfully extracted and parsed from git HEAD:index.html');
} catch (error) {
    console.error('Error during git show or parsing:', error);
}
