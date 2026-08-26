const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/\{isVol1Unlocked \? \([\s\S]*?Vol 1<\/span>\n\s+<\/button>\n\s+\)\}/, `{isVol1Unlocked ? (
                          <div className="flex flex-col">
                            <button
                              onClick={() => onSelectCourse(course, 1)}
                              className="py-2 rounded-xl border border-white/50 text-xs font-semibold text-blue-600 bg-white/45 backdrop-blur-sm hover:bg-white/55 active:scale-[0.98] transition-all cursor-pointer text-center"
                            >
                              Vol 1 {v1DaysLeft !== null ? \`(\${v1DaysLeft}d left)\` : ''}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <button
                              onClick={() => {
                                if (onBuyCourse) {
                                  onBuyCourse(course, 1);
                                }
                              }}
                              className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 border border-blue-500/10 shadow-sm transition-all cursor-pointer flex justify-center items-center space-x-1"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{isV1Expired ? 'Unlock Again' : 'Vol 1'}</span>
                            </button>
                            {isV1Expired && pDetailsV1 && (
                               <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV1.expiresAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}`);

content = content.replace(/\{isVol2Unlocked \? \([\s\S]*?Unlock Vol 2\n\s+<\/button>\n\s+\)\}/, `{isVol2Unlocked ? (
                          <div className="flex flex-col">
                            <button
                              onClick={() => onSelectCourse(course, 2)}
                              className="py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-white/40 hover:bg-white/60 border border-white/50 transition-all cursor-pointer text-center"
                            >
                              Vol 2 {v2DaysLeft !== null ? \`(\${v2DaysLeft}d left)\` : ''}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <button
                              onClick={() => {
                                if (onBuyCourse) {
                                  onBuyCourse(course, 2);
                                }
                              }}
                              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] border border-slate-200/40 transition-all cursor-pointer text-center"
                            >
                              {isV2Expired ? 'Unlock Again' : 'Unlock Vol 2'}
                            </button>
                            {isV2Expired && pDetailsV2 && (
                               <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV2.expiresAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
