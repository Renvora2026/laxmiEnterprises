const fs = require('fs');

let c = fs.readFileSync('src/components/ClientsPage.jsx', 'utf8');

// 1. Add erpApi import if not present
if (!c.includes('import { erpApi }')) {
  c = c.replace('import { downloadCSV }', 'import { erpApi } from "../services/api";\nimport { downloadCSV }');
}



// 3. Update the button
c = c.replace('onClick={handleResetDemo}', 'onClick={handleRefreshDb}');
c = c.replace('title="Restore 12 verified demo industrial accounts"', 'title="Refresh live clients from MySQL database"');
c = c.replace('<RotateCcw size={14} /> Reset Demo Data', '<RotateCcw size={14} /> Refresh DB');

fs.writeFileSync('src/components/ClientsPage.jsx', c, 'utf8');
console.log('Successfully patched ClientsPage.jsx');
