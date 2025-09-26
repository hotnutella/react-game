#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const commands = {
  'generate-types': {
    description: 'Generate TypeScript types from manifest files',
    usage: 'react-game generate-types <manifests-dir>',
    example: 'react-game generate-types src/manifests'
  },
  'watch-manifests': {
    description: 'Watch manifest files and auto-regenerate types',
    usage: 'react-game watch-manifests <manifests-dir>',
    example: 'react-game watch-manifests src/manifests'
  },
  'init-manifests': {
    description: 'Initialize manifest system in your project',
    usage: 'react-game init-manifests [manifests-dir]',
    example: 'react-game init-manifests src/manifests'
  }
};

function showHelp() {
  console.log('🎮 ReactGame CLI - Manifest Management Tools\n');
  console.log('Available commands:\n');
  
  Object.entries(commands).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(16)} ${info.description}`);
    console.log(`  ${''.padEnd(16)} Usage: ${info.usage}`);
    console.log(`  ${''.padEnd(16)} Example: ${info.example}\n`);
  });
}

function initManifests(manifestsDir: string = 'src/manifests') {
  console.log(`🚀 Initializing ReactGame manifest system in ${manifestsDir}/\n`);
  
  // Create manifests directory
  if (!fs.existsSync(manifestsDir)) {
    fs.mkdirSync(manifestsDir, { recursive: true });
    console.log(`✅ Created directory: ${manifestsDir}/`);
  }
  
  // Create example manifest
  const exampleManifest = {
    textures: {
      hero: '/assets/hero.png',
      enemy: '/assets/enemy.png',
      background: '/assets/background.jpg'
    },
    metadata: {
      version: '1.0.0',
      name: 'Game Assets',
      description: 'Main game asset manifest'
    }
  };
  
  const manifestPath = path.join(manifestsDir, 'game_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    fs.writeFileSync(manifestPath, JSON.stringify(exampleManifest, null, 2));
    console.log(`✅ Created example manifest: ${manifestPath}`);
  }
  
  // Generate initial types
  console.log(`\n🔄 Generating initial types...`);
  const generateScript = path.join(__dirname, 'generate-consolidated-types.js');
  const { generateConsolidatedTypes } = require(generateScript);
  generateConsolidatedTypes(manifestsDir);
  
  console.log(`\n🎉 ReactGame manifest system initialized!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Edit ${manifestPath} with your asset paths`);
  console.log(`   2. Run: react-game watch-manifests ${manifestsDir}`);
  console.log(`   3. Use: import { useGameManifest } from './${manifestsDir}/manifestTypes';`);
  console.log(`   4. In component: const { assets } = useGameManifest();`);
}

function main() {
  const [,, command, ...args] = process.argv;
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  const cliDir = path.dirname(__filename);
  
  switch (command) {
    case 'generate-types': {
      const manifestsDir = args[0];
      if (!manifestsDir) {
        console.error('❌ Error: manifests directory required');
        console.log(`Usage: ${commands['generate-types'].usage}`);
        process.exit(1);
      }
      
      const scriptPath = path.join(cliDir, 'generate-consolidated-types.js');
      const child = spawn('node', [scriptPath, manifestsDir], { stdio: 'inherit' });
      child.on('exit', process.exit);
      break;
    }
    
    case 'watch-manifests': {
      const manifestsDir = args[0];
      if (!manifestsDir) {
        console.error('❌ Error: manifests directory required');
        console.log(`Usage: ${commands['watch-manifests'].usage}`);
        process.exit(1);
      }
      
      const scriptPath = path.join(cliDir, 'watch-manifests.js');
      const child = spawn('node', [scriptPath, manifestsDir], { stdio: 'inherit' });
      child.on('exit', process.exit);
      break;
    }
    
    case 'init-manifests': {
      const manifestsDir = args[0] || 'src/manifests';
      initManifests(manifestsDir);
      break;
    }
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "react-game help" to see available commands');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
