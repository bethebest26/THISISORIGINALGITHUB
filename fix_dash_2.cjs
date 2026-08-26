const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const regex = /const isVol1Unlocked = \([\s\S]*?\{ \/\* Right: Personal Progression Feed \/ Achievements \*\//;

const replacement = `const isVol1Unlocked = (progress.unlockedVol1Courses?.includes(course.id) || unlockedVersions.includes("1") || unlockedVersions.includes(v1Key)) && !isV1Expired;
              const isVol2Unlocked = (progress.unlockedCourses.includes(course.id) || unlockedVersions.includes("2") || unlockedVersions.includes(v2Key)) && !isV2Expired;

              return (
                <div 
                  key={course.id}
                  className="group relative overflow-hidden w-full h-full glass-card rounded-3xl p-5 shadow-sm border border-slate-200/50 flex flex-col justify-between gap-4 transition-all duration-300 glass-card-hover"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="w-full h-32 rounded-xl overflow-hidden shrink-0 border border-white/40 bg-slate-900">
                      <img 
                        src={course.bannerUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block text-[10px] font-semibold text-blue-600 bg-white/40 border border-white/50 px-2 py-0.5 rounded-full mb-1">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-800 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 w-full mt-2">
                    <button
                      onClick={() => setPreviewCourse(course)}
                      className="w-full py-2 rounded-xl border border-blue-200 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50/50 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview Course</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {isVol1Unlocked ? (
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
                            <span>{isV1Expired ? \`Buy Again - ₹\${course.price || 499}\` : \`Buy Now - ₹\${course.price || 499}\`}</span>
                          </button>
                          {isV1Expired && pDetailsV1 && (
                             <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV1.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      {isVol2Unlocked ? (
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
                            <span>{isV2Expired ? \`Buy Again - ₹\${course.price || 999}\` : \`Buy Now - ₹\${course.price || 999}\`}</span>
                          </button>
                          {isV2Expired && pDetailsV2 && (
                             <span className="text-[9px] text-rose-500 mt-1 leading-tight text-center">Expired on {new Date(pDetailsV2.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Personal Progression Feed / Achievements */`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Dashboard.tsx', content);
