/* eslint-disable */
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const pureHttp = require('../..');

console.log('Loading SSL certificates...');

// Load certificate files
const certPath = path.join(__dirname, 'localhost.crt');
const keyPath = path.join(__dirname, 'localhost.key');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('Certificate files not found!');
  console.log('Generating certificates now...');

  const { execSync } = require('child_process');
  execSync(
    `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout ${keyPath} -out ${certPath} -days 365`,
    { stdio: 'inherit' }
  );
}

const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

const server = https.createServer({ key, cert });

const app = pureHttp({ server });

app.use([bodyParser.json(), bodyParser.urlencoded({ extended: true })]);

app.post('/', (req, res) => {
  res.send(req.body);
});

app.get('/error', (req, res) => {
  throw new Error('New error.');
});

app.get('/test', (req, res) => {
  res.send('Test.');
});

app.get('/', (req, res) => {
  res.send('HTTPS Server is running!');
});

app.listen(3000, () => {
  console.log('\n✅ HTTPS Server is listening on port 3000...');
  console.log('\n📝 Test endpoints:');
  console.log('  GET  /       - Welcome message');
  console.log('  GET  /test   - Test endpoint');
  console.log('  GET  /error  - Throws an error');
  console.log('  POST /       - Echoes request body');
  console.log('\n🧪 Test with curl:');
  console.log('  curl -k https://localhost:3000/test');
  console.log('  curl -k -X POST https://localhost:3000/ -H "Content-Type: application/json" -d \'{"hello":"world"}\'');
  console.log('\n🌐 Or visit: https://localhost:3000/');
  console.log('   (Accept the security warning for self-signed certificate)\n');
});
