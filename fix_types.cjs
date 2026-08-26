const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/export interface ExpandedLesson \{[\s\S]*?\}/, `export interface ExpandedLesson {
  id: string | number;
  title?: string;
  content?: string;
  readingCards?: any[];
  imageUrl?: string;
  readingTime?: string;
  difficulty?: string;
  realLifeExample?: { title: string; scenario: string; analysis: string; conclusion: string; };
  mcqs?: any[];
}`);
fs.writeFileSync('src/types.ts', content);
