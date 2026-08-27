const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/@media \(min-width: 640px\) \{\s*\/\* Bengali Typography Rules \*\//, '@media (min-width: 640px) {}\n/* Bengali Typography Rules */');
fs.writeFileSync('src/index.css', css, 'utf8');
