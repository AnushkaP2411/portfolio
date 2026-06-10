const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const key = process.env.WEB3FORMS_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const payload = JSON.stringify({
    access_key: key,
    name,
    email,
    message,
    subject: 'New message from your portfolio'
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.web3forms.com',
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (response.statusCode === 200 && data.success) {
            res.status(200).json(data);
          } else {
            res.status(500).json({ error: 'Mail service error', statusCode: response.statusCode, details: data });
          }
        } catch {
          res.status(500).json({ error: 'Invalid response from mail service', raw: body });
        }
        resolve();
      });
    });

    request.on('error', () => {
      res.status(500).json({ error: 'Failed to send message' });
      resolve();
    });

    request.write(payload);
    request.end();
  });
};
