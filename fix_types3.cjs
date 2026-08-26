const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(/realLifeExample\?: \{ title: string; scenario: string; analysis: string; conclusion: string; outcome\?: string; \};/, "realLifeExample?: { title?: string; scenario?: string; analysis?: string; conclusion?: string; outcome?: string; };");
content = content.replace(/practiceExercise\?: \{ task: string; hint: string; \};/, "practiceExercise?: any;");
content = content.replace(/selfReflection\?: \{ prompt: string; placeholder: string; \};/, "selfReflection?: any;");
content = content.replace(/summary\?: string;/, "summary?: any;");

fs.writeFileSync('src/types.ts', content);
