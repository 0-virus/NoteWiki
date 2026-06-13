---
type: concept
tags: [database, mysql, ddl, lock, performance]
updated: 2026-06-13
sources:
  - raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 (DDL의 함정).md
---

# DDL 락과 메타데이터 락 (DDL Lock / Metadata Lock)

## 왜 알아야 하나

운영 DB에서 `ALTER TABLE` 한 줄이 서비스를 10분간 멈출 수 있다. "코드 수정"처럼 보이지만 실제로는 **인프라 배포**다.

## 메타데이터 락 (MDL, Metadata Lock)

MySQL이 테이블의 **구조 정보(메타데이터)** 를 보호하기 위해 자동으로 거는 락.

| 작업 종류 | MDL 종류 | 동시 접근 가능 여부 |
|---|---|---|
| SELECT / INSERT / UPDATE / DELETE | **Shared MDL** | 여럿이 동시에 가능 |
| ALTER TABLE / DROP TABLE / RENAME | **Exclusive MDL** | 혼자만 가능, Shared와 공존 불가 |

Shared MDL끼리는 공존 → 일반 쿼리들은 동시에 실행된다.
Exclusive MDL은 **모든 Shared MDL이 해제될 때까지** 기다려야 획득 가능.

## ALTER TABLE이 서비스를 멈추는 구조

### 케이스 A — 열린 트랜잭션 없음 (빠름)

```
ALTER TABLE 실행
  → Exclusive MDL 즉시 획득
  → DDL 작업 실행 (MySQL 8.0 Instant DDL이면 수 ms)
  → 완료 & 락 해제
```

뒤의 쿼리는 DDL이 실행되는 시간만큼만 기다린다.

### 케이스 B — 열린 트랜잭션이 있음 (위험)

```
트랜잭션 A (커밋/롤백 안 한 상태)
  └─ 해당 테이블에 Shared MDL 보유 중

ALTER TABLE 실행 시도
  └─ Exclusive MDL 필요 → Shared MDL이 남아있어서 획득 불가
  └─ WAITING 상태 진입 (무한 대기)

이 순간부터:
  SELECT D → ALTER TABLE 뒤에 줄 섬
  INSERT E → ALTER TABLE 뒤에 줄 섬
  SELECT F → ALTER TABLE 뒤에 줄 섬 ← 단순 읽기조차 막힘
```

**핵심**: ALTER TABLE이 WAITING이 되는 순간 그 뒤에 오는 **모든 쿼리가 대기열에 쌓인다.** 트랜잭션 A가 닫히지 않으면 대기열은 계속 늘어나고 서비스가 멈춘다.

→ 관련: [[transaction]] — 트랜잭션을 오래 열어두면 안 되는 이유 중 하나

## 해결책

### 1. MySQL 8.0 Instant DDL

일부 DDL 작업을 테이블 데이터 건드림 없이 **메타데이터만 변경**해 거의 즉시 완료.

```sql
-- 컬럼 추가 (Instant 가능)
ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL, ALGORITHM=INSTANT;
```

지원 작업: 컬럼 추가, 기본값 변경, 인덱스 삭제(일부) 등.
**미지원**: 컬럼 삭제, 컬럼 타입 변경, 컬럼 순서 변경.

### 2. pt-online-schema-change (pt-osc)

대용량 테이블에서 서비스 중단 없이 DDL하는 Percona 오픈소스 도구.

**원리 (4단계)**:

```
1. 새 테이블 생성        — 변경된 스키마로 _tablename_new 생성 (락 없음)
2. 트리거 설치           — 원본 테이블의 INSERT/UPDATE/DELETE를 새 테이블에 실시간 반영
3. 데이터 청크 복사      — SELECT LIMIT 단위로 조금씩 이동 (서비스 중단 없음)
4. RENAME (락 순간 발생) — RENAME TABLE original TO _old, _new TO original
5. 정리                  — 트리거 제거, 구 테이블 삭제
```

락은 **4번 RENAME 한 줄에만** 짧게 잡힌다.

**사용 예시**:

```bash
pt-online-schema-change \
  --alter "ADD COLUMN last_login_at DATETIME NULL" \
  --host=localhost --user=root --password=secret \
  D=mydb,t=users \
  --execute   # 없으면 dry-run (계획만 출력)
```

주요 옵션:

| 옵션 | 설명 |
|---|---|
| `--chunk-size=1000` | 한 번에 복사할 행 수 (부하 조절) |
| `--max-load` | 서버 부하 초과 시 복사 일시 중지 |
| `--critical-load` | 이 이상이면 즉시 중단 |
| `--no-drop-old-table` | 완료 후 구 테이블 자동 삭제 안 함 |

**pt-osc의 한계**:

| 상황 | 문제 |
|---|---|
| 쓰기 부하가 높은 테이블 | 트리거로 쓰기 2배 → 복제 지연(Replication Lag) 심화 |
| FK·기존 트리거가 있는 테이블 | `--alter-foreign-keys-method` 등 추가 설정 필요 |
| 양쪽 모두 불가 시 | 점검 시간(저트래픽 새벽)에 직접 ALTER |

## 운영 마인드셋

> "운영 DB에서 DDL은 코드 변경이 아니라 **배포**다. 트래픽 패턴, 실행 중인 트랜잭션, 복제 구조까지 고려해야 하는 인프라 작업이다."

실행 전 체크리스트:
- [ ] 해당 테이블에 장기 실행 트랜잭션이 없는지 확인 (`SHOW PROCESSLIST`)
- [ ] 트래픽이 낮은 시간대인지 확인
- [ ] 대용량 테이블이면 pt-osc 또는 Online DDL 사용
- [ ] 복제 구조가 있다면 Replication Lag 모니터링

→ [[database-index]] — 인덱스 DDL(`CREATE INDEX`, `DROP INDEX`)도 동일한 락 문제 적용
→ [[transaction]] — 트랜잭션을 오래 열어두면 DDL 차단 원인이 됨
