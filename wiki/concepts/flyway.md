---
type: concept
tags: [database, migration, flyway, spring-boot, sql]
updated: 2026-07-26
sources: ["raw/articles/Flyway 란 무엇일까.md"]
---

# Flyway

## 한 줄 정의

**DB 형상 관리를 위한 오픈소스 [[database-migration|데이터베이스 마이그레이션]] 툴.**
`resources/db/migration/` 안의 SQL 파일들을 **버전 순서대로 한 번씩만** 실행해 준다.

## 동작 방식 (3단계)

```
1. flyway_schema_history 테이블을 찾는다
     └─ 없으면 만든다  ← DB가 "나는 지금 몇 번 버전"인지 스스로 기록하는 장부

2. 마이그레이션 스크립트(SQL / Java)를 스캔한다
     └─ 장부에 없는 것만, 버전 숫자 순서대로 실행

3. 실행한 스크립트를 장부에 기록한다 (버전·설명·체크섬·실행시각·성공여부)
```

**왜 이 구조인가**: 상태를 코드가 아니라 **DB 자신이** 들고 있기 때문에,
같은 애플리케이션을 로컬·테스트·운영 어디에 띄워도 각 DB가 자기에게 필요한 만큼만 따라잡는다.
이미 적용된 스크립트를 다시 실행하지 않으므로 **몇 번을 재시작해도 안전**하다(멱등).

### 체크섬 — 이미 적용된 파일을 고치면 안 되는 이유

장부에는 각 스크립트의 **체크섬(내용 해시)** 이 함께 저장된다.
이미 적용된 `V1__init.sql`을 나중에 수정하면, 다음 실행 때 체크섬 불일치로 **Flyway가 부팅을 실패시킨다.**

이게 불편해 보이지만 의도된 안전장치다. 내 로컬 DB는 이미 옛 V1이 적용된 상태고,
새로 만든 팀원 DB는 수정된 V1이 적용된다 → **같은 버전 번호인데 스키마가 다른** 최악의 상태가 되기 때문.
**한 번 커밋한 마이그레이션 파일은 불변**으로 취급하고, 수정이 필요하면 새 버전을 추가한다.
(Git에서 이미 push한 커밋을 rebase하지 않는 것과 같은 규율.)

## 파일명 규칙

Flyway는 **파일명과 경로만으로** 무엇을 언제 실행할지 결정한다.

```
V2__add_phone_to_member.sql
│└┬┘└──────┬────────┘ └┬┘
│ │        │           └─ Suffix   : 확장자, 기본 .sql
│ │        └───────────── Description : 설명 (언더스코어 → 공백으로 표시됨)
│ └────────────────────── Separator : 언더스코어 2개(__) ★ 반드시 2개
└──────────────────────── Prefix + Version
```

- **기본 경로**: `src/main/resources/db/migration` (설정으로 변경 가능)
- **Prefix**: `V`(버전) / `U`(취소) / `R`(반복)
- **Version**: 숫자·점·언더바 조합 (`1`, `1.1`, `2026_07_26`)
- **Separator**: **언더스코어 2개(`__`)** — 가장 흔한 실수 지점

### 3가지 마이그레이션 타입

| Prefix | 타입 | 동작 |
| --- | --- | --- |
| `V` | **Versioned** | 최신 적용 버전보다 **큰** 버전만 실행. 한 번 실행되면 끝 |
| `U` | **Undo** | 되돌리기. **유료(Teams) 전용**이며 데이터 손실 위험이 있어 실무에서도 조심스럽게 씀 |
| `R` | **Repeatable** | 버전 없음. 모든 V가 끝난 뒤 description 순으로 실행. **체크섬이 바뀌면 다시 실행** |

**Versioned의 함정**: 현재 최신이 `V5`인데 뒤늦게 `V3`를 추가하면 **그 스크립트는 조용히 무시된다.**
브랜치를 나눠 작업하다 각자 `V6`을 만들면 충돌한다 → 팀에서는 버전에 타임스탬프(`V20260726120000__`)를 쓰기도 한다.

**Repeatable의 용도**: 뷰·저장 프로시저·시드 데이터처럼 "항상 최신 정의로 덮어써도 되는" 것.
`CREATE OR REPLACE VIEW ...`를 `R__member_view.sql`에 두면 파일을 고칠 때마다 반영된다.

**Undo가 유료인 함의**: 무료 Flyway에는 실질적 롤백이 없다.
그래서 실무 규율은 "되돌린다"가 아니라 **"되돌리는 새 마이그레이션(V6)을 앞으로 추가한다"** 가 된다.

## Spring Boot 적용

### 1. 의존성

```groovy
// build.gradle
implementation 'org.flywaydb:flyway-core'
implementation 'org.flywaydb:flyway-mysql'   // MySQL 8은 별도 모듈 필요
```

→ [[gradle]]

### 2. DataSource + 활성화

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/flyway?useSSL=false&allowPublicKeyRetrieval=true
    username: flywaytest
    password: flywaytest

  flyway:
    enabled: true
```

**Spring Boot는 DataSource 설정만으로 Flyway를 자동 연결한다** — [[spring-boot]]의 자동 설정(AutoConfiguration)이
클래스패스에서 `flyway-core`를 발견하면 `Flyway` 빈을 만들고, **앱 기동 시점, [[jpa]] EntityManagerFactory보다 먼저**
`migrate()`를 실행한다. 순서가 이래야 Hibernate가 검증할 테이블이 이미 존재한다.

> MySQL 8.0+ URL에 `useSSL=false&allowPublicKeyRetrieval=true`가 없으면 접속 에러가 난다.

### 3. 스크립트 작성

`src/main/resources/db/migration/V1__create_member_table.sql`:

```sql
CREATE TABLE member (
    studentId    BIGINT AUTO_INCREMENT,
    studentName  VARCHAR(10),
    studentEmail VARCHAR(50),
    PRIMARY KEY (studentId)
);
```

### 4. 실행

앱을 띄우면 `flyway_schema_history`와 `member` 테이블이 생성된다.
**별도 명령이 없다** — 애플리케이션 기동이 곧 마이그레이션 실행이다.

## 실습 환경 (Docker)

원본 아티클은 [[docker]] Compose로 MySQL을 띄워 실습한다.

```yaml
version: '3.6'
services:
  mysql:
    container_name: flyway-mysql
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=flyway
      - MYSQL_USER=flywaytest
      - MYSQL_PASSWORD=flywaytest
    ports:
      - 3306:3306
    command: ['mysqld', '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci']
```

컨테이너로 DB를 띄우면 **"버리고 다시 만들기"가 쉬워서** 마이그레이션 실습에 잘 맞는다.
스크립트가 깨지면 볼륨째 지우고 처음부터 다시 돌려보면 된다 → [[docker-container]]

## 주의할 점 (실무 감각)

- **ddl-auto와 같이 쓰지 말 것.** [[hibernate-ddl-auto|ddl-auto]]가 `update`면 Hibernate와 Flyway가 서로 다른 스키마를 만들려고 싸운다. Flyway를 도입하면 `ddl-auto: validate`(또는 `none`)로 내린다.
- **마이그레이션도 결국 DDL이다.** 대용량 운영 테이블에 `ALTER TABLE`을 실행하면 [[ddl-lock|메타데이터 락]]으로 서비스가 멈출 수 있다. Flyway는 *실행 순서*를 보장할 뿐 *무중단*을 보장하지 않는다.
- **`NOT NULL` 컬럼 추가**처럼 기존 데이터와 충돌하는 스크립트는 실패한다. 보통 ① nullable로 추가 → ② 데이터 채우기 → ③ NOT NULL 전환의 3단계로 나눈다.

## 관련 페이지

- [[database-migration]] — 상위 개념 (왜 이런 도구가 필요한가)
- [[hibernate-ddl-auto]] — Flyway 도입 시 반드시 함께 조정해야 하는 설정
- [[ddl-lock]] — 마이그레이션 스크립트가 운영에서 위험해지는 지점
- [[spring-boot]] — 자동 설정으로 Flyway를 기동 시 실행
- [[docker]] · [[docker-container]] — 실습 DB 구성
- [[gradle]] — 의존성 추가
- [[entity-to-production-schema]] — 전체 흐름 속 Flyway의 위치
- 출처: [[flyway-article]]
