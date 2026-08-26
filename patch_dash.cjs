const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/unlockedVersions\?: string\[\];/, `unlockedVersions?: string[];
  purchaseDetails?: Record<string, { purchasedAt: string, expiresAt: string }>;`);

content = content.replace(/unlockedVersions = \[\],/, `unlockedVersions = [],
  purchaseDetails = {},`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
