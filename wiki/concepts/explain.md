---
type: concept
tags: [database, mysql, performance, index]
updated: 2026-06-13
sources:
  - raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md
---

# EXPLAIN — MySQL 쿼리 실행 계획

## 개념

쿼리 앞에 `EXPLAIN`을 붙이면 MySQL이 해당 쿼리를 **어떻게 실행할지 계획표**를 반환한다.
인덱스가 실제로 타는지, 어떤 방식으로 타는지 확인하는 진단 도구.

```sql
EXPLAIN SELECT * FROM users WHERE name LIKE '김%';
```

## 핵심 컬럼

### `type` — 접근 방식 (가장 중요)

| type | 의미 | 실질 속도 |
|---|---|---|
| `ALL` | 테이블 전체 풀 스캔 | 가장 느림 |
| **`index`** | **인덱스 전체**를 처음~끝 스캔 | 풀 스캔과 거의 같음 ⚠️ |
| `range` | 인덱스의 특정 **범위**만 스캔 (`BETWEEN`, `>`, `<`, `LIKE 'a%'`) | 빠름 ✅ |
| `ref` | 비유니크 인덱스로 특정 값 **참조** | 빠름 ✅ |
| `eq_ref` | PK/Unique 인덱스로 단 1건씩 참조 (JOIN) | 매우 빠름 ✅ |
| `const` | PK/Unique로 **정확히 1건** (`WHERE id = 1`) | 가장 빠름 ✅ |

**핵심**: type이 `ref` 또는 `range`일 때만 인덱스가 실질적인 효과를 낸다.

### `key`
실제로 사용된 인덱스 이름. `NULL`이면 인덱스를 전혀 쓰지 않은 것.

### `Extra` — 추가 실행 정보

| Extra | 의미 |
|---|---|
| `Using index` | [[covering-index]] 활용 — 테이블 접근 없이 인덱스만으로 결과 반환 |
| `Using where` | 인덱스로 가져온 후 WHERE 조건으로 추가 필터링 |
| `Using filesort` | 파일 정렬 발생 (ORDER BY 최적화 필요) |
| `Using temporary` | 임시 테이블 생성 (GROUP BY/DISTINCT 최적화 필요) |

## 흔한 오독 — type `index`의 함정

```
type: index  +  Extra: Using index  →  커버링 인덱스 (빠름) ✅
type: index  +  Extra: Using where  →  인덱스 풀 스캔 + 테이블 랜덤 I/O (느림, 풀 스캔보다 더 느릴 수 있음) ❌
```

"Using index가 뜨니까 괜찮겠지"라는 착각이 신입 개발자가 가장 많이 하는 실수.
**type도 반드시 함께 확인**해야 한다.

## 인덱스가 무력화되는 케이스 (→ ALL)

```sql
WHERE name LIKE '%철수%'            -- 앞 와일드카드: 시작점 없음
WHERE name = 123                    -- 묵시적 형변환: 컬럼값 매번 변환
WHERE DATE(created_at) = '2024-01-01'  -- 컬럼에 함수: 인덱스 원본값 무효
```

MySQL 8.0 이상 함수 기반 인덱스:

```sql
-- DATE() 케이스 해결 예시
CREATE INDEX idx_date ON orders ((DATE(created_at)));
```

앞뒤 양쪽 와일드카드(`%철수%`)는 여전히 해결 불가.

→ [[database-index]] — 인덱스 전반 개념과 B+tree 구조
