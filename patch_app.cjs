const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const \[unlockedVersions, setUnlockedVersions\] = useState<string\[\]>\(\[\]\);/, `const [unlockedVersions, setUnlockedVersions] = useState<string[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<Record<string, { purchasedAt: string, expiresAt: string }>>({});`);

content = content.replace(/dbService\.getUserPurchasedVersions\(user\.id\)\.then\(purchased => \{[\s\S]*?\}\);/, `dbService.getUserPurchasedVersions(user.id).then(purchased => {
                setUnlockedVersions(purchased || []);
              });
              dbService.getPurchaseDetails(user.id).then(details => {
                setPurchaseDetails(details || {});
              });`);

content = content.replace(/unlockedVersions=\{unlockedVersions\}/g, `unlockedVersions={unlockedVersions}
                purchaseDetails={purchaseDetails}`);

fs.writeFileSync('src/App.tsx', content);
