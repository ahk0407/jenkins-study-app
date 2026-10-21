const assert = require('assert');

console.log('단위 테스트 실행 중...');
try {
  // 1 + 1의 기댓값을 3으로 변경하여 강제 에러 발생
  assert.strictEqual(1 + 1, 2, '기본 연산 테스트 통과');
  console.log('✅ 모든 단위 테스트를 통과했습니다.');
  process.exit(0);
} catch (err) {
  console.error('❌ 테스트 실패:', err.message);
  process.exit(1); // 0이 아닌 종료 코드로 파이프라인 중단 유도
}
