---
type: source
tags: [database, index, mysql, performance]
updated: 2026-06-13
sources:
  - raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md
---

# 인덱스 걸었는데 왜 3초나 걸리죠 — 인덱스의 함정 (쇼츠)

- **원본**: `raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md`
- **링크**: https://www.youtube.com/shorts/s_k13KVAFVU

## 핵심 주장

1. 인덱스가 있어도 타지 않는 3가지 함정: 앞쪽 와일드카드 / 묵시적 형변환 / 컬럼에 함수 적용
2. EXPLAIN type `index` ≠ 인덱스 최적화 — 커버링 인덱스가 아니면 풀 스캔보다 느릴 수 있음
3. 진짜 인덱스 효과: EXPLAIN type이 `ref` 또는 `range`일 때
4. MySQL 8.0 함수 기반 인덱스로 `DATE(col)` 케이스 일부 해결 가능

## 맥락

신입 개발자 실수 패턴을 실제 사례(500만 건 테이블, 3초 쿼리)로 보여주는 영상.
인덱스를 "있냐 없냐"가 아니라 "어떻게 타느냐"의 관점으로 봐야 한다는 메시지.

## 다루는 개념

- [[database-index]]
- [[explain]]
- [[covering-index]]
