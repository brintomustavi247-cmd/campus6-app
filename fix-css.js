const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Find where @media (min-width: 640px) { is and what's after it.
// It seems the regex removed the inside of the media query and its closing brace!
// Let's replace:
// @media (min-width: 640px) {  /* Bengali Typography Rules */
// with:
// @media (min-width: 640px) {}  /* Bengali Typography Rules */

css = css.replace(/@media \(min-width: 640px\) \{\s*\/\* Bengali Typography Rules \*\//, '@media (min-width: 640px) {}\n/* Bengali Typography Rules */');

fs.writeFileSync('src/index.css', css, 'utf8');
