const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
  });
  return results;
}

const files = walk('frontend/src');
const hooks = ['useEffect', 'useState', 'useMemo', 'useCallback', 'useRef', 'useContext'];

let errors = 0;
files.forEach((f) => {
  const content = fs.readFileSync(f, 'utf8');
  hooks.forEach((h) => {
    // Check if hook is called directly e.g. useEffect( but NOT React.useEffect(
    const callRegex = new RegExp(`(?<![.\\w])${h}\\s*\\(`, 'g');
    if (callRegex.test(content)) {
      // Find import from 'react'
      const match = content.match(/import\s+([^;]+)\s+from\s+['"]react['"]/);
      if (!match || !match[1].includes(h)) {
        console.log(`❌ MISSING IMPORT in ${f}: ${h}`);
        errors++;
      }
    }
  });
});

if (errors === 0) {
  console.log('✅ All React hooks are properly imported across all files!');
} else {
  console.log(`Found ${errors} missing hook imports.`);
}

