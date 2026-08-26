const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/setUnlockedVersions\(prev => \[\.\.\.prev, String\(buyVolumeId\), \`\$\{buyCourse\.id\}-\$\{buyVolumeId\}\`\]\);/, `setUnlockedVersions(prev => [...prev, versionStr]);`);

fs.writeFileSync('src/App.tsx', content);
