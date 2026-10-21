const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send({ status: 'success', message: '🚀 Node.js API 배포 완료!' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ uptime: process.uptime(), status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
