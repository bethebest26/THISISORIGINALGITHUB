const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/purchaseDetails=\{purchaseDetails\}\n\s+purchaseDetails=\{purchaseDetails\}/g, `purchaseDetails={purchaseDetails}`);

fs.writeFileSync('src/App.tsx', content);
