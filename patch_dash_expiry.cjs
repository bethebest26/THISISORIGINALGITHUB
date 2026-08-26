const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/const isVol1Unlocked = progress\.unlockedVol1Courses\?\.includes\(course\.id\) \|\|[\s\S]*?unlockedVersions\.includes\(\`\$\{course\.id\}-2\`\);/, `const v1Key = \`\${course.id}-1\`;
              const v2Key = \`\${course.id}-2\`;
              
              const pDetailsV1 = purchaseDetails[v1Key] || purchaseDetails["1"];
              const pDetailsV2 = purchaseDetails[v2Key] || purchaseDetails["2"];
              
              const now = Date.now();
              const isV1Expired = pDetailsV1 && new Date(pDetailsV1.expiresAt).getTime() < now;
              const v1DaysLeft = pDetailsV1 && !isV1Expired ? Math.max(0, Math.ceil((new Date(pDetailsV1.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;

              const isV2Expired = pDetailsV2 && new Date(pDetailsV2.expiresAt).getTime() < now;
              const v2DaysLeft = pDetailsV2 && !isV2Expired ? Math.max(0, Math.ceil((new Date(pDetailsV2.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;
              
              const isVol1Unlocked = (progress.unlockedVol1Courses?.includes(course.id) || unlockedVersions.includes("1") || unlockedVersions.includes(v1Key)) && !isV1Expired;
              const isVol2Unlocked = (progress.unlockedCourses.includes(course.id) || unlockedVersions.includes("2") || unlockedVersions.includes(v2Key)) && !isV2Expired;`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
