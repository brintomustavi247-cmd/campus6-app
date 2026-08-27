const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // General theme replacements
  content = content.replace(/bg-\[\#0F1720\]/g, 'bg-[#0F111A]');
  content = content.replace(/bg-\[\#020617\]/g, 'bg-[#0F111A]');
  content = content.replace(/bg-\[\#064E3B\]/g, 'bg-[#1E2030]');
  content = content.replace(/bg-\[\#047857\]/g, 'bg-gradient-to-r from-red-600/40 to-red-900/40');
  content = content.replace(/bg-\[\#0b1220\]/g, 'bg-[#1E2030]');

  // Emerald -> Red / Neutral
  content = content.replace(/emerald-50/g, 'slate-50');
  content = content.replace(/emerald-100/g, 'slate-100');
  content = content.replace(/emerald-200/g, 'slate-200');
  content = content.replace(/emerald-300/g, 'red-300');
  content = content.replace(/emerald-400/g, 'red-400');
  content = content.replace(/emerald-500/g, 'red-500');
  content = content.replace(/emerald-600/g, 'red-600');
  content = content.replace(/emerald-700/g, 'red-700');
  content = content.replace(/emerald-800/g, 'red-800');
  content = content.replace(/emerald-900/g, 'red-900');
  content = content.replace(/emerald-950/g, 'slate-950');
  
  // Teal -> Red / Neutral
  content = content.replace(/teal-50/g, 'slate-50');
  content = content.replace(/teal-100/g, 'slate-100');
  content = content.replace(/teal-200/g, 'slate-200');
  content = content.replace(/teal-300/g, 'red-300');
  content = content.replace(/teal-400/g, 'red-400');
  content = content.replace(/teal-500/g, 'red-500');
  content = content.replace(/teal-600/g, 'red-600');
  content = content.replace(/teal-700/g, 'red-700');
  content = content.replace(/teal-800/g, 'red-800');
  content = content.replace(/teal-900/g, 'red-900');
  content = content.replace(/teal-950/g, 'slate-950');
  
  // Cyan -> Red / Neutral (was used in Login page)
  content = content.replace(/cyan-50/g, 'slate-50');
  content = content.replace(/cyan-100/g, 'slate-100');
  content = content.replace(/cyan-200/g, 'slate-200');
  content = content.replace(/cyan-300/g, 'red-300');
  content = content.replace(/cyan-400/g, 'red-400');
  content = content.replace(/cyan-500/g, 'red-500');
  content = content.replace(/cyan-600/g, 'red-600');
  content = content.replace(/cyan-700/g, 'red-700');
  content = content.replace(/cyan-800/g, 'red-800');
  content = content.replace(/cyan-900/g, 'red-900');
  content = content.replace(/cyan-950/g, 'slate-950');

  // Blue -> Red / Neutral
  content = content.replace(/blue-50/g, 'slate-50');
  content = content.replace(/blue-100/g, 'slate-100');
  content = content.replace(/blue-200/g, 'slate-200');
  content = content.replace(/blue-300/g, 'yellow-300');
  content = content.replace(/blue-400/g, 'yellow-400');
  content = content.replace(/blue-500/g, 'yellow-500');
  content = content.replace(/blue-600/g, 'yellow-600');
  content = content.replace(/blue-700/g, 'yellow-700');
  content = content.replace(/blue-800/g, 'yellow-800');
  content = content.replace(/blue-900/g, 'yellow-900');
  content = content.replace(/blue-950/g, 'slate-950');

  // Indigo -> Red / Neutral
  content = content.replace(/indigo-50/g, 'slate-50');
  content = content.replace(/indigo-100/g, 'slate-100');
  content = content.replace(/indigo-200/g, 'slate-200');
  content = content.replace(/indigo-300/g, 'red-300');
  content = content.replace(/indigo-400/g, 'red-400');
  content = content.replace(/indigo-500/g, 'red-500');
  content = content.replace(/indigo-600/g, 'red-600');
  content = content.replace(/indigo-700/g, 'red-700');
  content = content.replace(/indigo-800/g, 'red-800');
  content = content.replace(/indigo-900/g, 'red-900');
  content = content.replace(/indigo-950/g, 'slate-950');
  
  // Slate background replacements for nested elements
  content = content.replace(/bg-slate-900/g, 'bg-[#1E2030]');
  content = content.replace(/bg-slate-950/g, 'bg-[#161825]');
  content = content.replace(/bg-slate-800/g, 'bg-[#1E2030]');
  
  // Revert any slate-950 from emerald-950 if we want them as #1E2030 or #161825
  // (We'll just leave slate-950 since it maps well enough or use tailwind classes)
  
  // Specific Yellow highlights previously using gold/amber
  content = content.replace(/bg-\[\#D4A72C\]/g, 'bg-yellow-400');
  content = content.replace(/text-\[\#D4A72C\]/g, 'text-yellow-400');
  content = content.replace(/border-\[\#D4A72C\]/g, 'border-yellow-400');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Theme replacement complete.');
