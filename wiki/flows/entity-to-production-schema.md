---
type: flow
tags: [jpa, hibernate, flyway, migration, deployment, database]
updated: 2026-07-26
sources: ["raw/articles/Flyway 란 무엇일까.md"]
---

# 흐름: 엔티티 변경 → 운영 DB 스키마

> "엔티티에 필드 하나 추가"가 **운영 DB에 안전하게 도착**하기까지의 전체 경로.
> 로컬에서는 재시작 한 번이면 끝나는 일이, 운영에서는 왜 이렇게 길어지는지가 이 흐름의 주제다.

## 전체 그림

```
[1] 엔티티 수정            Member에 phone 필드 추가
      │                    ([[jpa-entity-mapping]])
      ▼
[2] 로컬 반영              ddl-auto: update → 재시작하면 컬럼 생김
      │                    ([[hibernate-ddl-auto]])
      ▼
 ─────────── 여기까지가 "혼자 개발" 구간. 아래부터가 진짜 ───────────
      ▼
[3] 마이그레이션 스크립트 작성
      │   V2__add_phone_to_member.sql  ← 사람이 쓰고 Git에 커밋, 리뷰 대상
      │   ([[flyway]])
      ▼
[4] 로컬 재검증            ddl-auto: validate 로 내리고 Flyway로만 반영
      │                    → 엔티티 ↔ 스크립트 불일치를 여기서 잡는다
      ▼
[5] 배포 → 앱 기동         Flyway가 flyway_schema_history 조회
      │                    → 미적용 V2 발견 → 실행 → 장부 기록
      ▼
[6] ALTER TABLE 실행       ★ 여기가 위험 구간
      │                    ([[ddl-lock]] — 메타데이터 락)
      ▼
[7] Hibernate validate     엔티티 ↔ 테이블 일치 확인, 어긋나면 기동 실패
      ▼
    서비스 시작
```

## 단계별 "왜"

### [1]~[2] 로컬 — 속도가 전부

도메인을 설계하는 중에는 스키마가 하루에도 몇 번씩 바뀐다.
이 구간에서 마이그레이션 스크립트를 쓰는 건 낭비다. [[hibernate-ddl-auto|ddl-auto]]가 정답.

### [3] 스크립트 작성 — 여기서 성격이 바뀐다

**자동 → 수동으로 바뀌는 지점.** 왜 굳이 손으로 쓰나?

- **리뷰 가능해진다** — DDL이 Git diff에 뜬다. 팀원이 "이 컬럼 NOT NULL이면 기존 행은?"이라고 물을 수 있다.
- **이력이 생긴다** — 컬럼의 출생 기록이 커밋으로 남는다.
- **환경이 수렴한다** — 로컬·테스트·운영이 같은 스크립트를 같은 순서로 통과한다.

→ [[database-migration]]

### [4] validate로 내리기 — 두 주체가 싸우지 않게

Flyway를 도입한 뒤에도 `ddl-auto: update`를 남겨두면 **Hibernate와 Flyway가 각자 스키마를 만들려 든다.**
`validate`로 내리면 Hibernate는 "감시자" 역할만 한다.

### [5] 기동 시 자동 실행 — 순서가 중요하다

[[spring-boot]]는 **Flyway → EntityManagerFactory** 순으로 초기화한다.
마이그레이션이 먼저 끝나야 Hibernate가 검증할 테이블이 존재하기 때문.

### [6] ALTER TABLE — 여기서 서비스가 멈출 수 있다

Flyway는 *언제 무엇을* 실행할지는 보장하지만, **그 SQL이 얼마나 오래 락을 잡는지는 모른다.**
운영 테이블이 크면:

- 열려 있는 트랜잭션이 하나라도 있으면 `ALTER`가 WAITING → **뒤의 모든 쿼리가 줄 선다**
- 해법: MySQL 8 `ALGORITHM=INSTANT`, `pt-online-schema-change`, 저트래픽 시간대 배포

→ [[ddl-lock]] (구조와 해결책 상세)

### [7] validate — 마지막 안전망

엔티티엔 있는데 테이블엔 없는 컬럼이 있으면 **앱이 아예 안 뜬다.**
"조용히 잘못된 상태로 서비스되는 것"보다 "요란하게 실패하는 것"이 낫다는 원칙(fail fast).

## 위험한 변경의 3단계 분할

`NOT NULL` 컬럼 추가처럼 기존 데이터와 충돌하는 변경은 한 번에 못 한다.

```
V2__add_phone_nullable.sql     ALTER TABLE member ADD COLUMN phone VARCHAR(20) NULL;
V3__backfill_phone.sql         UPDATE member SET phone = '000-0000-0000' WHERE phone IS NULL;
V4__phone_not_null.sql         ALTER TABLE member MODIFY phone VARCHAR(20) NOT NULL;
```

각 단계 사이에 **구버전 앱과 신버전 앱이 공존해도 깨지지 않는다**는 것이 포인트다.
(무중단 배포 중에는 두 버전이 같은 DB를 동시에 본다.)

## 관련 페이지

- [[jpa-entity-mapping]] — [1] 변경의 출발점
- [[hibernate-ddl-auto]] — [2][4][7] 로컬 자동화와 운영 검증
- [[flyway]] · [[database-migration]] — [3][5] 마이그레이션
- [[ddl-lock]] — [6] 실행 시 위험
- [[spring-boot]] — 기동 순서를 결정하는 자동 설정
- [[transaction]] — 열린 트랜잭션이 DDL을 막는 원인
- 출처: [[flyway-article]]
