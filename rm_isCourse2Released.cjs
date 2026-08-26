const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/const \[isCourse2Released, setIsCourse2Released\] = useState\(false\);\s*\n/g, '');

fs.writeFileSync('src/components/Dashboard.tsx', content);
