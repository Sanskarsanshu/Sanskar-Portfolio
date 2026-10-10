const fs = require('fs');
const file = 'd:/portfolio/lib/projects.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/url: "#"/g, 'url: "/404"');
fs.writeFileSync(file, content);
console.log('Replaced');
