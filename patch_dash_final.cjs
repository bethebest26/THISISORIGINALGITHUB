const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Remove the teaser
const teaserRegex = /\s*\{\/\* Locked course teaser at the end \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Right: Personal Progression Feed \/ Achievements \*\/\}/;
content = content.replace(teaserRegex, `
          </div>
        </div>

        {/* Right: Personal Progression Feed / Achievements */}`);

// 2. Remove isCourse2 and isReleased logic
content = content.replace(/const isCourse2 = course\.id === "attract-women-2026";\s*const isReleased = !isCourse2 \|\| isCourse2Released;\s*return \(/g, `return (`);

content = content.replace(/className=\{\`group relative overflow-hidden w-full h-full glass-card rounded-3xl p-5 shadow-sm border border-slate-200\/50 flex flex-col justify-between gap-4 transition-all duration-300 \$\{\s*isReleased \? "glass-card-hover" : "border-amber-500\/10"\s*\}\`\}/g, `className="group relative overflow-hidden w-full h-full glass-card rounded-3xl p-5 shadow-sm border border-slate-200/50 flex flex-col justify-between gap-4 transition-all duration-300 glass-card-hover"`);

content = content.replace(/className=\{\`w-full h-full object-cover transition-transform duration-300 \$\{\s*isReleased \? "group-hover:scale-105" : "brightness-\[0\.4\] filter blur-\[1px\]"\s*\}\`\}/g, `className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"`);

content = content.replace(/\{!isReleased && \([\s\S]*?\}\)/g, ``);

// Remove the {!isReleased ? ( ... ) : ( ... )} condition around buttons
content = content.replace(/\{!isReleased \? \([\s\S]*?\) : \(\s*<div className="flex flex-col space-y-2 w-full mt-2">/g, `<div className="flex flex-col space-y-2 w-full mt-2">`);
// Don't forget to remove the closing )} for that ternary
content = content.replace(/<\/div>\s*\}\)\}\s*<\/div>\s*<\/div>\s*\{!user &&/g, `</div>\n                    </div>\n                  </div>\n                </div>\n              );\n            })}\n          </div>\n        </div>\n\n        {/* Right: Personal Progression Feed / Achievements */}\n        <div className="space-y-6">\n          <h2 className="font-display font-bold text-xl text-slate-800 tracking-tight flex items-center space-x-2">\n            <Star className="w-5 h-5 text-yellow-500" />\n            <span>Learning Milestones</span>\n          </h2>\n\n          {!user &&`);
// Wait, the regex for replacing `</div>\n                </div>\n              );\n            })}\n` etc is safer manually.

fs.writeFileSync('src/components/Dashboard.tsx', content);
