---
type: source
tags: [spring, transaction, jpa, proxy, aop, clippings/claude]
updated: 2026-05-28
sources: ["raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md"]
---

# 소스: Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너 (Claude 대화)

> 원본: `raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md`
> Claude Code 세션 · 2026-05-28 · 8턴.

## 맥락 (왜 캡처했나)

**Spring 강의를 듣고 Daker-server 프로젝트를 다시 점검하던 중** 떠오른 질문들을 정리한 대화다.
도메인 폴더 구조에서 출발해 `@Transactional`의 정체로 이어졌고, 영균이 이미 손에 익은
**바닐라 JPA(EntityManager/EntityTransaction)** 경험에 새 개념을 얹는 방식으로 진행됐다.

> 인제스트 지시(영균의 후속 메모): ① **자주 쓰는 Spring 어노테이션을 따로 모아 인덱스·연결
> 구조**로 만들 것 → [[spring-annotations]] 신설. ② **JPA 개념 페이지를 이 대화의 도식으로 더
> 직관적으로 보강**할 것 → [[transaction]]·[[entity-manager]]·[[aop]] 도식 보강.

## 핵심 주장 (Key Claims)

- **오케스트레이션(집계) 도메인은 엔티티·레포지토리를 안 가진다.** 자기 소유 테이블이 없고
  남의 [[spring-data-jpa|레포지토리]]를 주입받아 합치기만 하기 때문 (Daker의 `admin`·`ranking`·`stats`).
  → [[domain]]·[[three-tier-architecture]]의 "테이블 소유 여부"가 폴더 구조를 가른다.
- **객체 우선(Entity-first) 설계.** `ddl-auto: update`는 [[jpa-entity-mapping|@Entity]]를 진실의
  원천으로 삼아 스키마를 자동 생성한다. (운영에선 Flyway/Liquibase 권장 — DB-first/object-first 선택축.)
- **`@Transactional` = 바닐라 try-catch의 선언적 버전.** [[transaction]]에서 손으로 짜던
  `begin/commit/rollback/close`를 [[aop|AOP 프록시]]가 자동으로 돌린다 (programmatic → declarative).
- **기본 롤백은 unchecked 예외(RuntimeException)와 Error에서만.** checked 예외는 기본적으로
  롤백하지 않는다 → `rollbackFor` 필요. 바닐라 `catch(Exception)`과 가장 다른 지점.
- **`readOnly = true`의 "왜" = [[persistence-context|변경 감지]] 스냅샷 생략.** 단순 힌트가 아니라
  실제 메모리·속도 최적화 + 의도 표현.
- **컨테이너가 EntityManager를 관리한다 = EMF는 앱당 1개, EM은 호출마다 생성·begin·스레드
  바인딩·commit·close.** 주입받는 EM은 스레드에 묶인 진짜 EM을 찾아주는 **공유 프록시**. → [[entity-manager]]
- **`REQUIRED`(기본 전파)는 새 트랜잭션을 안 만들고 1개로 합친다.** 안쪽 예외 → 바깥까지 전부
  롤백. try-catch로 잡아도 **rollback-only** 표시 때문에 `UnexpectedRollbackException`으로 강제
  롤백. 분리하려면 `REQUIRES_NEW`. → [[transaction-propagation]]
- **프록시 ≠ 컨테이너.** 컨테이너(앱당 1개 본부)가 프록시(빈마다 1개 대리인)를 **만들어 주입**한다.
  호출 시점엔 컨테이너가 개입하지 않는다 — 컨트롤러는 시작 시 받은 프록시를 곧바로 부른다.
- **자기호출(self-invocation) 함정.** 같은 클래스 안에서 `this.메서드()`로 부르면 프록시를 안
  거쳐 `@Transactional`·AOP가 안 먹는다.

## 엔티티 (Entities)

- 도구/기술: Spring, JPA, Hibernate, EntityManager, AOP Proxy, JpaTransactionManager
- 프로젝트: Daker-server (도메인 폴더 구조 예시)
- 개념 키워드: `@Transactional`, readOnly, propagation(REQUIRED/REQUIRES_NEW), rollback-only,
  dirty checking, ddl-auto, ApplicationContext, 프록시, 자기호출

## 위키 반영

- [[spring-annotations]] — (신설) 자주 쓰는 Spring 어노테이션 인덱스·연결 허브 ← 영균 요청 ①
- [[transaction-propagation]] — (신설) `REQUIRED` vs `REQUIRES_NEW`, rollback-only, `UnexpectedRollbackException`
- [[transaction]] — (보강) programmatic↔declarative 매핑, readOnly의 "왜", 기본 롤백 규칙, 자기호출 ← 영균 요청 ②
- [[entity-manager]] — (보강) 컨테이너가 EM을 관리하는 2단계 도식, 공유 EM 프록시 ← 영균 요청 ②
- [[aop]] — (보강) 컨테이너 vs 프록시 구분(주입 시점 vs 호출 시점), 자기호출 함정 ← 영균 요청 ②
- 관련: [[domain]] · [[three-tier-architecture]] · [[spring-data-jpa]] · [[persistence-context]] · [[jpa-entity-mapping]] · [[spring-bean]]