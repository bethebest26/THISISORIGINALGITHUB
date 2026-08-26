const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/realLifeExample\?: \{ title: string; scenario: string; analysis: string; conclusion: string; \};/, "realLifeExample?: { title: string; scenario: string; analysis: string; conclusion: string; outcome?: string; };");

content = content.replace(/mcqs\?: any\[\];/, "mcqs?: any[];\n  graphic?: any;\n  traitNumber?: number | string;\n  introduction?: string;\n  practiceExercise?: { task: string; hint: string; };\n  selfReflection?: { prompt: string; placeholder: string; };\n  summary?: string;");

fs.writeFileSync('src/types.ts', content);
