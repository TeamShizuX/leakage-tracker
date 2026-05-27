const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If it contains supabaseAdmin, skip or standardize
      if (content.includes('supabaseAdmin')) {
          continue;
      }

      if (content.match(/import\s+\{\s*supabase\s*\}\s+from\s+['"]@\/lib\/supabase['"]/)) {
        content = content.replace(/import\s+\{\s*supabase\s*\}\s+from\s+['"]@\/lib\/supabase['"]/g, `import { supabaseAdmin as supabase } from '@/lib/supabase'`);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('src/app/api');
