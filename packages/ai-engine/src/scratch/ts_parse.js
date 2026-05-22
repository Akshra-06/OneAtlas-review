const ts = require('typescript');
const fs = require('fs');

const filePath = 'c:/Users/aayan/OneAtlas.dev_Team3/OneaAtlas-Backend/packages/ai-engine/src/generators/intelligence/archetype-page-generator.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');

const sourceFile = ts.createSourceFile(
  filePath,
  fileContent,
  ts.ScriptTarget.Latest,
  true
);

console.log('Syntactical diagnostics:');
const diagnostics = sourceFile.parseDiagnostics || [];
diagnostics.forEach(diag => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(diag.start);
  console.log(`Line ${line + 1}, Col ${character + 1}: ${diag.messageText}`);
});

// Let's trace template literal nodes in AST
function printTemplateLiterals(node) {
  if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    console.log(`Template literal at Line ${line + 1}, Col ${character + 1}: ${node.getText(sourceFile).substring(0, 40)}...`);
  }
  ts.forEachChild(node, printTemplateLiterals);
}

console.log('\nParsed template literals in AST:');
printTemplateLiterals(sourceFile);
