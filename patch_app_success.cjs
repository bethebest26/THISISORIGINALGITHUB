const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/dbService\.recordPurchase\(user\.id, String\(buyVolumeId\), buyCourse\.id\);/, `const versionStr = \`\${buyCourse.id}-\${buyVolumeId}\`;
    dbService.recordPurchase(user.id, versionStr, buyCourse.id);
    dbService.getPurchaseDetails(user.id).then(details => {
      setPurchaseDetails(details || {});
    });`);

fs.writeFileSync('src/App.tsx', content);
