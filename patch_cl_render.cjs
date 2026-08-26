const fs = require('fs');
let content = fs.readFileSync('src/components/CourseList.tsx', 'utf8');

content = content.replace(/const isUnlocked = unlockedVersions\.includes\(String\(volNum\)\) \|\|[\s\S]*?\(!vol\.isPremium && volNum === 1\); \/\/ free\/non-premium first volume/, `const vKey = \`\${course.id}-\${volNum}\`;
                        const pDetails = purchaseDetails[vKey] || purchaseDetails[String(volNum)];
                        const now = Date.now();
                        const isExpired = pDetails && new Date(pDetails.expiresAt).getTime() < now;
                        const daysLeft = pDetails && !isExpired ? Math.max(0, Math.ceil((new Date(pDetails.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;

                        const isUnlocked = (unlockedVersions.includes(String(volNum)) || 
                                           unlockedVersions.includes(vKey) ||
                                           (!vol.isPremium && volNum === 1)) && !isExpired; // free/non-premium first volume`);

content = content.replace(/\{isUnlocked \? \([\s\S]*?Launch\n\s+<\/button>\n\s+\) : \([\s\S]*?<\/button>\n\s+\)\}/, `{isUnlocked ? (
                                <div className="flex flex-col items-end">
                                  <button
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        onOpenLogin();
                                      } else {
                                        onSelectCourse(course, volNum);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
                                  >
                                    Launch {daysLeft !== null ? \`(\${daysLeft}d left)\` : ''}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <button
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        onOpenLogin();
                                      } else {
                                        onBuyCourse(course, volNum);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer flex items-center space-x-1"
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span>{isExpired ? 'Unlock Again' : 'Unlock'}</span>
                                  </button>
                                  {isExpired && pDetails && (
                                     <span className="text-[9px] text-rose-500 mt-1 leading-tight text-right">Expired on {new Date(pDetails.expiresAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              )}`);

fs.writeFileSync('src/components/CourseList.tsx', content);
