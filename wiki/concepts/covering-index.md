---
type: concept
tags: [database, mysql, index, performance]
updated: 2026-06-13
sources:
  - raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md
---

# 커버링 인덱스 (Covering Index)

## 개념

쿼리에 필요한 **모든 컬럼이 인덱스 안에 포함**되어 있어서, 테이블(실제 데이터)에 전혀 접근하지 않고 **인덱스만으로 결과를 반환**하는 최적화 상태.

## 왜 빠른가 — Random I/O 제거

[[database-index]]의 일반적인 탐색 흐름:

```
인덱스에서 행 위치 찾기
    → 테이블에서 실제 데이터 읽기  ← Random I/O (가장 비싼 연산)
```

커버링 인덱스:

```
인덱스에서 데이터까지 바로 읽기  → 끝  (테이블 접근 없음)
```

테이블은 디스크의 여러 위치에 흩어져 있어서 접근할 때마다 Random I/O가 발생한다.
인덱스는 상대적으로 작고 정렬되어 있어 Sequential I/O에 가깝다.
커버링 인덱스는 이 비용 구조 차이를 이용한다.

## 확인 방법

[[explain]] 결과 `Extra` 컬럼에 `Using index` 표시 → 커버링 인덱스 사용 중.

## 예시

```sql
-- 인덱스: INDEX idx_name_id ON users(name, id)
SELECT id, name FROM users WHERE name LIKE '김%';
-- id, name 모두 인덱스 안에 있음 → 테이블 접근 불필요 → 커버링 ✅
```

```sql
-- 인덱스: INDEX idx_name ON users(name)
SELECT id, name, email FROM users WHERE name LIKE '김%';
-- email이 인덱스에 없음 → 테이블 접근 필요 → 커버링 아님 ❌
```

## EXPLAIN type `index`와의 관계

| EXPLAIN 결과 | 의미 | 속도 |
|---|---|---|
| `type=index` + `Extra: Using index` | 인덱스 풀 스캔이지만 커버링 → 테이블 접근 없음 | 빠름 |
| `type=index` + `Extra: Using where` | 인덱스 풀 스캔 + 테이블 랜덤 I/O | **풀 스캔보다 느릴 수 있음** ⚠️ |

→ "Using index가 뜨니까 괜찮다"는 착각이 가장 흔한 실수. **type도 함께 봐야 한다.**
type이 `ref` 또는 `range`여야 진짜 인덱스 최적화.
