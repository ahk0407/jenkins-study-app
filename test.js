const assert = require('assert');

// 간단한 기능 검증 로직
console.log('단위 테스트 실행 중...');
try {
  assert.strictEqual(1 + 1, 3, '기본 연산 테스트 통과');
  console.log('✅ 모든 단위 테스트를 통과했습니다.');
  process.exit(0);
} catch (err) {
  console.error('❌ 테스트 실패:', err.message);
  process.exit(1);
}
