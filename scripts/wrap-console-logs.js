/**
 * Script to wrap console.log statements in __DEV__ checks
 * This helps prepare code for production by removing console.logs in production builds
 * 
 * Usage: node scripts/wrap-console-logs.js
 * 
 * Note: This is a helper script. Review changes before committing.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '..', 'src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/*.test.js',
  '**/*.spec.js',
];

// Patterns to match console.log statements
const CONSOLE_PATTERNS = [
  /console\.log\(/g,
  /console\.warn\(/g,
  /console\.error\(/g,
  /console\.debug\(/g,
  /console\.info\(/g,
];

// Check if already wrapped
function isAlreadyWrapped(code, index) {
  const before = code.substring(Math.max(0, index - 50), index);
  return before.includes('__DEV__') || before.includes('if (__DEV__)');
}

function wrapConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // Process each console pattern
  CONSOLE_PATTERNS.forEach(pattern => {
    const matches = [...content.matchAll(new RegExp(pattern.source, 'g'))];
    
    // Process from end to start to maintain indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const index = match.index;
      
      // Skip if already wrapped
      if (isAlreadyWrapped(content, index)) {
        continue;
      }

      // Find the line start
      const lineStart = content.lastIndexOf('\n', index) + 1;
      const lineEnd = content.indexOf('\n', index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
      
      // Skip if it's already in a conditional
      if (line.trim().startsWith('if') || line.trim().startsWith('}')) {
        continue;
      }

      // Get indentation
      const indent = line.match(/^\s*/)[0];
      
      // Find the matching closing parenthesis
      let depth = 0;
      let endIndex = index;
      let inString = false;
      let stringChar = null;
      
      for (let j = index; j < content.length; j++) {
        const char = content[j];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && content[j - 1] !== '\\') {
          inString = false;
          stringChar = null;
        } else if (!inString) {
          if (char === '(') depth++;
          if (char === ')') {
            depth--;
            if (depth === 0) {
              endIndex = j + 1;
              break;
            }
          }
        }
      }

      // Extract the console statement
      const consoleStatement = content.substring(index, endIndex);
      const fullLine = content.substring(lineStart, Math.max(lineEnd, endIndex));
      
      // Wrap it
      const wrapped = `${indent}if (__DEV__) {\n${indent}  ${consoleStatement}\n${indent}}`;
      
      // Replace
      content = content.substring(0, index) + wrapped + content.substring(endIndex);
      modified = true;
      changes.push({
        file: filePath,
        line: content.substring(0, index).split('\n').length,
        original: fullLine.trim(),
        wrapped: wrapped.trim()
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { modified, changes };
}

// Main execution
function main() {
  console.log('🔍 Searching for console.log statements...\n');
  
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: SRC_DIR,
    ignore: EXCLUDE_PATTERNS,
    absolute: true
  });

  let totalModified = 0;
  let totalChanges = 0;
  const allChanges = [];

  files.forEach(file => {
    const result = wrapConsoleLogs(file);
    if (result.modified) {
      totalModified++;
      totalChanges += result.changes.length;
      allChanges.push(...result.changes);
      console.log(`✅ Modified: ${path.relative(SRC_DIR, file)} (${result.changes.length} changes)`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files modified: ${totalModified}`);
  console.log(`   Total changes: ${totalChanges}`);
  
  if (allChanges.length > 0) {
    console.log(`\n⚠️  Please review the changes before committing!`);
    console.log(`   Some console.log statements may need manual adjustment.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { wrapConsoleLogs };

