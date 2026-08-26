const fs = require('fs');
let content = fs.readFileSync('src/components/CourseList.tsx', 'utf8');

const regex = /<p className="text-xs font-bold text-slate-800">Version \{volNum\}: \{vol\.title\}<\/p>\s+\{isUnlocked \? \(\s+<div className="flex flex-col items-end">/;

const replacement = `<p className="text-xs font-bold text-slate-800">Version {volNum}: {vol.title}</p>
                                  {isUnlocked ? (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {vol.description}
                                </p>
                              </div>
                              {/* Button */}
                              {isUnlocked ? (
                                <div className="flex flex-col items-end">`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/CourseList.tsx', content);
