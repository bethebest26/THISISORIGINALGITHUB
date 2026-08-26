const fs = require('fs');
let content = fs.readFileSync('src/components/CourseList.tsx', 'utf8');

content = content.replace(
    /<span>\{isExpired \? 'Unlock Again' : 'Unlock'\}<\/span>/g,
    `<span>{isExpired ? \`Buy Again - ₹\${course.price || 999}\` : \`Buy Now - ₹\${course.price || 999}\`}</span>`
);

fs.writeFileSync('src/components/CourseList.tsx', content);
