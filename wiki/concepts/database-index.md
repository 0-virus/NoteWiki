---
type: concept
tags: [database, index, btree, performance]
updated: 2026-06-13
sources:
  - raw/youtube/index가 뭔지 설명해보세요 (개발면접시간).md
  - raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md
---

# 데이터베이스 인덱스 (Database Index)

## 왜 필요한가

WHERE 조건으로 특정 행을 찾을 때 인덱스가 없으면 컴퓨터는 **모든 행을 하나씩 확인**한다 — 풀 테이블 스캔(Full Table Scan). 데이터가 1억 건이면 1억 번 확인. 느리다.

인덱스는 이 문제를 "정렬"로 해결한다.

## 인덱스란

**컬럼 값을 복사해서 미리 정렬해 둔 별도의 자료 구조.** 책 뒤의 색인(索引)과 같다.

- "김으로 시작하는 사람" → 정렬된 인덱스에서 '김' 구간으로 바로 이동 가능
- 핵심 전제: 찾고자 하는 **시작점**을 알 수 있어야 인덱스가 의미 있다

## 탐색 원리 — Binary Search

1~100 카드 게임에서 "50보다 큽니까? → 75보다 작습니까?" 식으로 절반씩 소거하면 최악 7번에 찾는다. 인덱스도 동일: 데이터가 정렬되어 있으면 **절반씩 제거**하면서 탐색 가능.

1억 건 → log₂(1억) ≒ 27번 비교로 찾음.

## 자료 구조: B-tree → B+tree

### Binary Search Tree (기본)
각 노드에 값 1개, 왼쪽은 작은 값, 오른쪽은 큰 값. 반씩 소거.

### B-tree
노드마다 값을 **여러 개** 담아 트리 높이를 낮춤 → 한 번에 1/3, 1/4씩 소거 가능.
실제 데이터를 각 노드에 보관.

### B+tree (MySQL InnoDB 기본)
- **상위 노드**: 탐색 가이드(키 값)만 보관
- **리프 노드(맨 아래)**: 실제 데이터 + **다음 리프 노드 포인터** 보관
- 리프 노드끼리 연결되어 있어 **범위 검색**이 매우 효율적

```
범위 검색 예: age BETWEEN 4 AND 8
B-tree  → 트리를 왔다갔다하며 개별 탐색 (비효율)
B+tree → 4를 찾고 → 화살표 타고 5→6→7→8 순서대로 이동 (효율)
```

## 인덱스 작동 방식

```
쿼리: WHERE age = 20

1. 인덱스(B+tree)에서 age=20 탐색 (log 횟수)
2. 리프 노드에서 원래 테이블의 행 주소(rowid) 획득
3. 행 주소로 테이블에서 실제 행 데이터 읽음 (랜덤 I/O ← 비싼 연산)
```

→ [[covering-index]]: 3번 테이블 접근을 생략할 수 있는 경우

## 클러스터드 인덱스 (Clustered Index)

Primary Key로 설정된 컬럼은 **자동으로 정렬·인덱싱**된다. 테이블 자체가 PK 기준으로 물리적으로 정렬된 구조. 별도 인덱스 불필요.
Secondary Index(일반 인덱스)의 리프 노드는 rowid 대신 **PK 값**을 저장한다.

## 인덱스의 단점

| 단점 | 이유 |
|---|---|
| **추가 용량** | 컬럼을 복사해 별도 구조로 보관 → 디스크 사용 증가 |
| **DML 성능 저하** | INSERT/UPDATE/DELETE 시 테이블 + 인덱스 모두 갱신 필요 |

→ 검색 빈도가 낮은 컬럼에 무분별하게 인덱스를 만들면 역효과.

## 인덱스가 무력화되는 함정

인덱스를 만들어도 다음 경우엔 풀 스캔이 발생한다:

| 케이스 | 예시 | 이유 |
|---|---|---|
| 앞쪽 와일드카드 | `LIKE '%철수%'` | 시작점을 알 수 없음 |
| 묵시적 형변환 | `WHERE name = 123` (VARCHAR 컬럼) | 컬럼값을 매번 변환해야 해서 정렬된 인덱스 사용 불가 |
| 컬럼에 함수 적용 | `WHERE DATE(created_at) = '2024-01-01'` | 원본값 기반 인덱스를 변환된 값으로 비교 불가 |

MySQL 8.0 이상: 함수 기반 인덱스로 세 번째 케이스 일부 해결 가능.

→ [[explain]] — EXPLAIN으로 인덱스가 실제로 타는지 확인하는 방법
→ [[covering-index]] — 테이블 접근 없이 인덱스만으로 결과 반환하는 최적화
→ [[n-plus-1-problem]] — ORM에서 인덱스와 연관된 다른 쿼리 비효율 패턴

## DDL — 인덱스 생성·삭제

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_name ON users(name);

-- 복합 인덱스 (컬럼 순서가 탐색 방향을 결정)
CREATE INDEX idx_name_age ON users(name, age);

-- 유니크 인덱스 (중복 불허 + 인덱스 효과)
CREATE UNIQUE INDEX idx_email ON users(email);

-- 함수 기반 인덱스 (MySQL 8.0+)
CREATE INDEX idx_date ON orders ((DATE(created_at)));

-- 테이블 생성 시 함께 정의
CREATE TABLE users (
    id    BIGINT PRIMARY KEY,       -- 클러스터드 인덱스 자동 생성
    name  VARCHAR(50),
    email VARCHAR(100) UNIQUE,      -- 유니크 인덱스 자동 생성
    INDEX idx_name (name)           -- 일반 인덱스 명시
);

-- 삭제 (수정 문법은 없음 → DROP 후 재생성)
DROP INDEX idx_name ON users;

-- 현재 인덱스 목록 확인
SHOW INDEX FROM users;
```

### 자동으로 인덱스가 생기는 경우

| 제약 | 자동 생성 인덱스 | 이유 |
|---|---|---|
| `PRIMARY KEY` | 클러스터드 인덱스 | 테이블 자체가 PK 기준으로 물리 정렬됨 |
| `UNIQUE` | 유니크 인덱스 | 중복 검사를 위해 빠른 탐색 필요 |
| `FOREIGN KEY` (InnoDB) | 일반 인덱스 | 참조 무결성 검사 시 FK 컬럼 탐색 필요 |
| 일반 컬럼 | ❌ 없음 | 명시적 `CREATE INDEX` 필요 |

## 인덱스 힌트 (Index Hint)

MySQL 옵티마이저가 잘못된 인덱스를 선택했을 때 강제로 교정하는 문법.

```sql
-- USE INDEX: 이 인덱스를 권장 (옵티마이저가 더 나은 게 있으면 무시 가능)
SELECT * FROM users USE INDEX (idx_name) WHERE name = '김철수';

-- FORCE INDEX: 강제 사용 (옵티마이저 무시)
SELECT * FROM users FORCE INDEX (idx_name) WHERE name = '김철수';

-- IGNORE INDEX: 이 인덱스는 제외
SELECT * FROM users IGNORE INDEX (idx_name) WHERE name = '김철수';
```

**사용 흐름**: EXPLAIN으로 잘못된 인덱스 탐지 → FORCE INDEX로 교정 → 근본 원인(인덱스 설계·통계 갱신) 별도 해결.

`FORCE INDEX`는 데이터 분포가 바뀌면 오히려 더 느려질 수 있으므로 임시 디버깅 용도로 쓴다.
