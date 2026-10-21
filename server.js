const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// DB 접속 풀 설정 (환경변수 또는 기본값)
const pool = new Pool({
  host: process.env.DB_HOST || 'my-postgres-db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'study_db',
  port: 5432,
});

app.get('/', async (req, res) => {
  try {
    // DB 현재 시간 질의
    const dbRes = await pool.query('SELECT NOW() as now');
    res.send({
      status: 'success',
      message: '🚀 Node.js + PostgreSQL 연동 배포 완료!',
      dbTime: dbRes.rows[0].now
    });
  } catch (err) {
    res.status(500).send({
      status: 'error',
      message: 'DB 연결 실패',
      error: err.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ uptime: process.uptime(), status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
