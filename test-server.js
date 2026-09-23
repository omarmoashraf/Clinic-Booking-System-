const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', body);
    res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: "error", message: `Cannot find ${req.url} on this server` }));
  });
}).listen(8080, () => console.log('Listening on 8080'));
