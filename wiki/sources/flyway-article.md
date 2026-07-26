---
type: source
tags: [database, migration, flyway, spring-boot, article]
updated: 2026-07-26
sources: ["raw/articles/Flyway 란 무엇일까.md"]
---

# 소스: [DB] Flyway 란 무엇일까?

- **원본**: `raw/articles/Flyway 란 무엇일까.md`
- **유형**: 아티클 (블로그) — 코냥이, tistory, 2024
- **URL**: https://co-meow.tistory.com/entry/DB-Flyway-란-무엇일까
- **클리핑**: 2026-07-26

## 맥락 (왜 저장했나)

**개인 Spring 프로젝트에 적용하려고.**
지금 프로젝트는 `ddl-auto`로 스키마가 자동 관리되는데, **배포하는 순간 이 방식은 쓸 수 없다.**
"프로젝트로 완전한 웹 서비스를 배포한다"는 목표를 잡은 이상, 운영 DB의 스키마를 어떻게 바꿀 것인가는
반드시 통과해야 하는 관문이다. Flyway는 그 표준 답이고, 이 아티클은 개념 + Spring Boot 적용까지
한 번에 훑어주는 진입 자료다.

기존 위키와의 연결 의도도 컸다 — 이미 정리해둔 [[ddl-lock]](ALTER TABLE이 서비스를 멈추는 구조)과
[[jpa]]/[[hibernate]] 계열 페이지 사이에 **"그래서 운영에서는 스키마를 어떻게 바꾸나"** 라는 빈칸이 있었다.
Flyway가 정확히 그 자리를 메운다.

## 핵심 주장 (Key Claims)

1. **DB도 형상 관리 대상이다** — 소스 코드의 이력을 Git으로 관리하듯, DB 이력을 Flyway로 관리한다.
2. **형상 관리의 이점은 두 가지** — ① 스키마 변경 이력이 남아 장애 원인 추적 가능 ② 코드로 변경해 사람 실수 감소 + 배포 자동화.
3. **환경이 여러 개라서 필요하다** — 로컬/테스트/운영 DB가 각자 다른 스키마로 갈라진다.
4. **개발은 `ddl-auto`로 되지만 운영은 불가** — 운영에서는 `ALTER TABLE`을 직접 써야 하는데, 실수하기 쉽고 형상 관리가 안 된다.
5. **동작은 3단계** — `flyway_schema_history` 테이블 확인/생성 → 미적용 스크립트를 버전 순 실행 → 장부 업데이트.
6. **파일명과 경로가 곧 설정** — `V2__add_phone.sql` 형식. Separator는 **언더스코어 2개**가 필수.
7. **3가지 마이그레이션 타입** — Versioned(V, 최신보다 큰 버전만 실행) / Undo(U, **유료** + 위험) / Repeatable(R, 체크섬 변경 시 재실행).
8. **Spring Boot는 DataSource 설정만으로 Flyway를 자동 연결** — `spring.flyway.enabled: true`면 기동 시 자동 실행.
9. **최신 버전보다 작은 번호를 추가하면 조용히 무시된다** — 항상 최신보다 큰 버전으로.

## 언급된 엔티티

- 도구: Flyway, Spring Boot, Docker(docker-compose), MySQL 8.0, Gradle
- 설정/파일: `flyway_schema_history`(구 `schema_version`), `/resources/db/migration`, `application.yml`, `build.gradle`, `docker-compose.yml`
- 의존성: `org.flywaydb:flyway-mysql`
- 참고 출처: 달록의 Flyway 적용기(hudi.blog), wildeveloperetrain

## 다루는 개념 → 위키 매핑

| 원본 내용 | 위키 페이지 |
| --- | --- |
| DB 형상 관리·마이그레이션의 필요성 | [[database-migration]] (신규) |
| Flyway 동작·파일명 규칙·3타입·Spring 적용 | [[flyway]] (신규) |
| `ddl-auto`로는 운영이 안 되는 이유 | [[hibernate-ddl-auto]] (신규) |
| 엔티티 변경 → 운영 스키마 전체 경로 | [[entity-to-production-schema]] (신규 flow) |
| 마이그레이션이 실행하는 ALTER TABLE의 위험 | [[ddl-lock]] (연결) |
| 실습 환경 구성 | [[docker]] · [[docker-container]] (연결) |

## 원본에 없어서 보강한 것

아티클은 "어떻게 쓰나"에 집중해서, 실제로 도입할 때 부딪히는 지점이 빠져 있다. 위키에는 다음을 추가했다.

- **체크섬 규율** — 이미 적용된 마이그레이션 파일을 수정하면 안 되는 이유 (Git rebase 금지와 같은 논리)
- **`ddl-auto: validate`와의 조합** — Flyway 도입 시 `update`를 그대로 두면 두 주체가 스키마를 두고 싸운다
- **위험한 변경의 3단계 분할** — `NOT NULL` 컬럼 추가를 nullable → backfill → NOT NULL로 나누는 패턴
- **기동 순서** — Flyway가 EntityManagerFactory보다 먼저 실행되어야 하는 이유

## 관련 페이지

- [[database-migration]] · [[flyway]] · [[hibernate-ddl-auto]] · [[entity-to-production-schema]] — 이 소스가 낳은 페이지
- [[ddl-lock]] — 이 소스와 맞물리는 기존 페이지 (마이그레이션의 실행 위험)
- [[jpa-lecture]] — `ddl-auto`를 처음 다룬 소스
- [[coverage-standard]] — 같은 날 인제스트한 쌍 (둘 다 "배포 가능한 코드로 가는 관문")
