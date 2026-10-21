const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// JSON 요청 본문 파싱 미들웨어
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'my-postgres-db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'study_db',
  port: 5432,
});

// 테이블 자동 생성 (서버 구동 시 초기화)
const initDB = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ todos 테이블 준비 완료');
  } catch (err) {
    console.error('❌ 테이블 생성 실패:', err.message);
  }
};
initDB();

// 1. 기본 상태 확인
app.get('/', async (req, res) => {
  res.send({ status: 'success', message: '🚀 TODO CRUD API 서비스 가동 중!' });
});

// 2. 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).json({ uptime: process.uptime(), status: 'healthy' });
});

// 3. [READ] 전체 TODO 목록 조회
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json({ count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. [CREATE] 새 TODO 등록
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title 항목이 누락되었습니다.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
