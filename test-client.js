const fs = require('fs');
async function run() {
  const code = fs.readFileSync('src/lib/api/http-client.ts', 'utf8');
  // I'll just write a quick typescript file and run it
}
run();
