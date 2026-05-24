const fs = require('fs');

const filePath = 'c:/Users/aayan/OneAtlas.dev_Team3/packages/ai-engine/src/generators/intelligence/archetype-page-generator.ts';
const content = fs.readFileSync(filePath, 'utf8');

let modeStack = ['code'];
let braceCountStack = [0];
let history = [];

function getLineAndCol(index) {
  const before = content.substring(0, index);
  const lines = before.split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const next = content[i + 1];
  const mode = modeStack[modeStack.length - 1];

  if (mode === 'code') {
    if (char === '/' && next === '/') {
      modeStack.push('comment');
      i++;
    } else if (char === '/' && next === '*') {
      modeStack.push('multicomment');
      i++;
    } else if (char === "'") {
      modeStack.push('single');
      history.push({ mode: 'single', pos: getLineAndCol(i) });
    } else if (char === '"') {
      modeStack.push('double');
      history.push({ mode: 'double', pos: getLineAndCol(i) });
    } else if (char === '`') {
      modeStack.push('template');
      history.push({ mode: 'template', pos: getLineAndCol(i) });
    } else if (char === '{') {
      braceCountStack[braceCountStack.length - 1]++;
    } else if (char === '}') {
      if (braceCountStack[braceCountStack.length - 1] > 0) {
        braceCountStack[braceCountStack.length - 1]--;
      } else if (modeStack.length > 1) {
        // Exit interpolation
        const oldMode = modeStack.pop();
        braceCountStack.pop();
        history.pop(); // pop corresponding template from history
      } else {
        console.log(`Extra closing brace '}' at line ${getLineAndCol(i).line}, col ${getLineAndCol(i).col}`);
      }
    } else if (char === '\\') {
      i++;
    }
  } else if (mode === 'template') {
    if (char === '`') {
      modeStack.pop();
      history.pop();
    } else if (char === '$' && next === '{') {
      modeStack.push('code');
      braceCountStack.push(0);
      history.push({ mode: 'interpolation', pos: getLineAndCol(i) });
      i++;
    } else if (char === '\\') {
      i++;
    }
  } else if (mode === 'single') {
    if (char === "'") {
      modeStack.pop();
      history.pop();
    } else if (char === '\\') {
      i++;
    }
  } else if (mode === 'double') {
    if (char === '"') {
      modeStack.pop();
      history.pop();
    } else if (char === '\\') {
      i++;
    }
  } else if (mode === 'comment') {
    if (char === '\n') {
      modeStack.pop();
    }
  } else if (mode === 'multicomment') {
    if (char === '*' && next === '/') {
      modeStack.pop();
      i++;
    }
  }
}

console.log('Final Stack:', modeStack);
console.log('Final Braces:', braceCountStack);
if (history.length > 0) {
  console.log('Open items in stack:');
  history.forEach(item => {
    console.log(`- Type: ${item.mode} started at Line ${item.pos.line}, Col ${item.pos.col}`);
  });
} else {
  console.log('Everything successfully balanced!');
}
