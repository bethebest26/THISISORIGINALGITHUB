const fs = require('fs');
let content = fs.readFileSync('src/components/CourseList.tsx', 'utf8');

content = content.replace(/unlockedVersions\?: string\[\];.*?\n/, `unlockedVersions?: string[]; // Received from parent to track purchased versions
  purchaseDetails?: Record<string, { purchasedAt: string, expiresAt: string }>;\n`);

content = content.replace(/unlockedVersions = \[\],\n/, `unlockedVersions = [],
  purchaseDetails = {},\n`);

fs.writeFileSync('src/components/CourseList.tsx', content);
