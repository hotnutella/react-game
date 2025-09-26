#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateConsolidatedTypes } = require('./generate-consolidated-types');

/**
 * Watch all manifest.json files in a directory and auto-regenerate consolidated types
 * Usage: node scripts/watch-manifests.js demo/manifests
 */

function watchManifestsFolder(manifestsDir) {
  console.log(`👀 Watching ${manifestsDir}/ for manifest changes...`);
  console.log(`🔄 Will regenerate manifestTypes.ts when manifests change`);
  
  // Function to regenerate all types
  function regenerateTypes() {
    console.log(`\n🔄 Regenerating consolidated types...`);
    try {
      generateConsolidatedTypes(manifestsDir);
    } catch (error) {
      console.error(`❌ Error generating types:`, error.message);
    }
  }
  
  // Generate initial types
  console.log('\n🔄 Initial generation of manifest types...');
  regenerateTypes();
  
  // Watch the manifests directory for changes
  fs.watch(manifestsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`\n📁 ${eventType}: ${filename}`);
      if (eventType === 'change' || eventType === 'rename') {
        // Small delay to ensure file is fully written
        setTimeout(() => {
          regenerateTypes();
        }, 100);
      }
    }
  });
  
  console.log('\n💡 Press Ctrl+C to stop watching');
  console.log('💡 Add/edit .json files in', manifestsDir, 'to auto-generate types');
}

// Command line usage
if (require.main === module) {
  const [,, manifestsDir] = process.argv;
  
  if (!manifestsDir) {
    console.log('Usage: node watch-manifests.js <manifests-dir>');
    console.log('Example: node watch-manifests.js demo/manifests');
    process.exit(1);
  }
  
  watchManifestsFolder(manifestsDir);
}

module.exports = { watchManifestsFolder };
