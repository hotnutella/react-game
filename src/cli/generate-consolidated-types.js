#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate a consolidated manifestTypes.ts file with all manifest interfaces
 * Usage: node scripts/generate-consolidated-types.js demo/manifests
 */

function toPascalCase(str) {
  return str
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function generateManifestName(filename) {
  const baseName = path.basename(filename, '.json');
  return toPascalCase(baseName) + 'Assets';
}

function generateConsolidatedTypes(manifestsDir) {
  try {
    console.log(`🔍 Scanning ${manifestsDir} for manifest files...`);
    
    if (!fs.existsSync(manifestsDir)) {
      throw new Error(`Manifests directory does not exist: ${manifestsDir}`);
    }
    
    const files = fs.readdirSync(manifestsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('⚠️  No manifest files found');
      return;
    }
    
    console.log(`📋 Found ${files.length} manifest(s): ${files.join(', ')}`);
    
    const interfaces = [];
    const hooks = [];
    const exports = [];
    
    // Process each manifest file
    for (const file of files) {
      const manifestPath = path.join(manifestsDir, file);
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      if (!manifest.textures) {
        console.warn(`⚠️  Skipping ${file}: no textures property`);
        continue;
      }
      
      const assetKeys = Object.keys(manifest.textures);
      const interfaceName = generateManifestName(file);
      const baseName = path.basename(file, '.json');
      const hookName = 'use' + toPascalCase(baseName);
      
      console.log(`✨ ${file} → ${interfaceName} + ${hookName}() (${assetKeys.length} assets)`);
      
      // Generate interface
      const interfaceCode = `export interface ${interfaceName} {
${assetKeys.map(key => `  ${key}: string;`).join('\n')}
}`;
      
      // Generate custom hook
      const hookCode = `export function ${hookName}() {
  return useManifest<${interfaceName}>('/manifests/${file}');
}`;
      
      interfaces.push(interfaceCode);
      hooks.push(hookCode);
      exports.push(interfaceName);
      exports.push(hookName);
    }
    
    // Generate the consolidated file
    const outputPath = path.join(manifestsDir, 'manifestTypes.ts');
    
    // Calculate correct relative path from manifestsDir to src/manifest
    const manifestsDirAbs = path.resolve(manifestsDir);
    const srcManifestAbs = path.resolve('src/manifest');
    const relativePath = path.relative(manifestsDirAbs, srcManifestAbs);
    
    const fileContent = `// Auto-generated from manifest files in ${path.relative(process.cwd(), manifestsDir)}
// Do not edit manually - regenerated when manifests change

import { useManifest } from '${relativePath}';

${interfaces.join('\n\n')}

${hooks.join('\n\n')}

// Export type map for easy access
export type ManifestTypes = {
${files.map(file => {
  const manifestName = path.basename(file, '.json');
  const interfaceName = generateManifestName(file);
  return `  '${manifestName}': ${interfaceName};`;
}).join('\n')}
};
`;

    fs.writeFileSync(outputPath, fileContent);
    
    console.log(`\n✅ Generated consolidated types in ${outputPath}`);
    const interfaceNames = interfaces.map((_, i) => files[i] ? generateManifestName(files[i]) : '').filter(Boolean);
    const hookNames = hooks.map((_, i) => files[i] ? 'use' + toPascalCase(path.basename(files[i], '.json')) : '').filter(Boolean);
    console.log(`📦 Interfaces: ${interfaceNames.join(', ')}`);
    console.log(`🎣 Hooks: ${hookNames.join(', ')}`);
    console.log(`🎯 Usage: const { assets } = ${hookNames[0]}();`);
    
  } catch (error) {
    console.error('❌ Error generating consolidated types:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const [,, manifestsDir] = process.argv;
  
  if (!manifestsDir) {
    console.log('Usage: node generate-consolidated-types.js <manifests-dir>');
    console.log('Example: node generate-consolidated-types.js demo/manifests');
    process.exit(1);
  }
  
  generateConsolidatedTypes(manifestsDir);
}

module.exports = { generateConsolidatedTypes, generateManifestName };
