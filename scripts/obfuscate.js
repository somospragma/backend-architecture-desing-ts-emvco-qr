const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  
  const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.8,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArray: true,
    stringArrayThreshold: 0.8,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    domainLock: [],
    reservedNames: [],
    seed: 0
  });

  fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
  console.log(`Obfuscated: ${filePath}`);
}

function obfuscateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      obfuscateDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      obfuscateFile(filePath);
    }
  });
}

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log('Starting obfuscation...');
  obfuscateDirectory(distPath);
  console.log('Obfuscation completed!');
} else {
  console.error('dist directory not found. Run build first.');
  process.exit(1);
}