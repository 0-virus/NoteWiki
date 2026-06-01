---
source_type: "claude-conversation"
title: "Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너"
url: ""
clipped: 2026-05-28
description: "Spring 강의 복습 중 Daker-server 프로젝트를 다시 보며 도메인 폴더 구조, @Transactional·readOnly, 바닐라 JPA와의 대응, 트랜잭션 전파, 프록시 vs 컨테이너를 정리한 대화."
status: "raw"
tags:
  - "clippings/claude"
---
> [!info] 원본 대화
> Claude Code 세션 — 공유 URL 없음

## 🗂 컨텍스트
<!-- AI 인제스트 시 이 섹션을 우선 읽는다. 대화의 배경·목적을 한 줄로 요약. -->
Spring 강의를 듣고 Daker-server 프로젝트를 다시 점검하던 중, 도메인 폴더 구조(admin·xp에 entity/repository가 없는 이유)와 DB-first/객체-first, `@Transactional`·`readOnly`의 의미, 바닐라 JPA(EntityManager/EntityTransaction)와의 대응, 트랜잭션 전파, 그리고 "프록시 vs 컨테이너"의 개념 차이를 차례로 정리한 대화.

## 💬 대화 본문

**You**

현재 스프링 강의를 듣고 이 프로젝트 폴더를 다시 보는 참이야. 질문 몇 개 할게.
1. domain/을 보면 admin이랑 xp 도메인은 entity/랑 repository/가 없는데 왜 그런 거야?
2. db를 먼저 짜는지, 아니면 객체 먼저 구성하는지

---

**Claude**

**1. 폴더 컨벤션부터.** 이 프로젝트는 JPA 엔티티를 `entity/`가 아니라 **`domain/` 패키지**에 둔다 (예: `hackathon/domain/Hackathon.java`). 곳곳의 `entity/.gitkeep`은 처음 폴더 구조 잡을 때 만든 빈 자리표시자다.

- **xp 도메인**: 사실은 엔티티(`xp/domain/UserXpHistory.java`, `@Entity` → `user_xp_history` 테이블)와 레포지토리(`UserXpHistoryRepository`)가 **있다**. `entity/`라는 이름의 폴더가 없을 뿐. 폴더 이름 때문에 헷갈린 것.
- **admin 도메인**: 진짜로 없다. `AdminService`는 다른 도메인의 레포지토리(`HackathonRepository`·`UserRepository`·`TeamRepository`·`SubmissionRepository`·`JudgeEvaluationRepository`·`XpService`)를 주입받아 **모으고 가공하는 오케스트레이션(집계) 계층**이다. 자기 소유 테이블(`admin`)이 없어서 엔티티·레포지토리가 필요 없다. 관리자 권한은 `User`의 `Role`로 구분한다.

→ 정리: 테이블을 소유하는 도메인만 `domain/`(엔티티)+`repository/`를 갖고, 남의 데이터를 합치기만 하는 도메인은 안 가진다.

**2. 이 프로젝트는 객체 우선(Entity-first)이다.** 근거는 `application-prod.yml`의 `jpa.hibernate.ddl-auto: update` — 엔티티 클래스를 진실의 원천으로 삼고 거기 맞춰 테이블을 자동 생성/변경하라는 뜻. `resources/`에 `schema.sql`이나 마이그레이션 파일이 없다.

> 참고: `ddl-auto: update`는 학습·개발엔 편하지만 운영에선 위험(컬럼 삭제·타입 변경을 안전하게 못 함). 실무에선 엔티티로 설계하되 Flyway/Liquibase로 스키마를 버전 관리한다.

---

**You**

그럼 지금 프로젝트에 보이는 entity/ 폴더들은 다 사실상 필요 없는 것들인 거야?

---

**Claude**

맞아. 6개 `entity/` 폴더(auth·hackathon·ranking·stats·submission·team) 전부 `.gitkeep` 하나만 있고 자바 파일은 0개다. 실제 엔티티는 전부 `domain/`에 있다. `.gitkeep`은 git이 빈 폴더를 추적 못 해서 폴더 구조만 남기려고 넣는 더미 파일이라, 기능적 의미는 없다.

- 컴파일·런타임에 영향 없음. 지워도 빌드 안 깨진다.
- 남은 스캐폴딩 흔적이라 정리 차원에서 삭제해도 되고, 폴더 골격 통일을 원하면 둬도 된다 — 취향/팀 컨벤션 문제.

참고로 같은 패턴이 `domain/` 쪽에도 있다 — `auth/domain/.gitkeep`, `ranking/domain/.gitkeep`, `stats/domain/.gitkeep`도 빈 폴더. ranking·stats는 admin처럼 자기 테이블 없이 집계만 하는 도메인이라 엔티티가 없다.

---

**You**

@Transactional 어노테이션의 의미를 알려줄래? readonly도 무슨 뜻인지

---

**Claude**

**트랜잭션** = DB 작업의 "하나의 묶음(작업 단위)". 핵심은 All or Nothing — 묶음이 전부 성공하면 commit, 중간에 하나라도 실패하면 전부 rollback.

**`@Transactional`** = "이 메서드 실행 전체를 하나의 트랜잭션으로 감싸라". 흐름: 메서드 시작 → 트랜잭션 시작 / 정상 종료 → commit / 예외 발생 → rollback. Spring은 이걸 **AOP(프록시)**로 구현한다.

또 하나 중요한 효과 — **변경 감지(Dirty Checking)**. 트랜잭션 안에서 엔티티 필드를 바꾸면 JPA가 끝날 때 변경을 감지해 UPDATE를 날린다. 그래서 `update` 메서드들이 `save()`를 명시적으로 안 부르고 필드만 바꾸는 경우가 많다.

**`readOnly = true`** = "이 트랜잭션은 읽기 전용, 데이터를 바꾸지 않는다". 두 이점:
1. **성능 최적화** — JPA가 변경 감지를 위한 **스냅샷을 안 만든다**. 조회 엔티티가 많을수록 메모리·속도 이득.
2. **안전장치/의도 표현** — 실수로 수정해도 flush가 안 일어나 반영 안 됨.

이 프로젝트도 패턴이 일관적: 조회 메서드(`getDashboard`·`getHackathons`)는 `@Transactional(readOnly = true)`, 변경 메서드(`createHackathon`·`updateHackathon`·`deleteHackathon`)는 그냥 `@Transactional`.

---

**You**

내가 spring 없이 바닐라 jpa로 persistence 실습할 때, entitymanager 생성해서 entitytransaction으로 감싼 뒤 begin하고, try-catch로 묶어서 예외 생기면 rollback하는 로직을 구현했는데, @Transactional이 같은 역할을 하는 어노테이션인 거야?

---

**Claude**

정확해 — 핵심 역할은 같다. 네가 손으로 짠 보일러플레이트를 Spring이 AOP 프록시로 자동화한 게 `@Transactional`이다. 용어로는 네가 한 건 **프로그래밍 방식(programmatic)**, `@Transactional`은 **선언적(declarative)** 트랜잭션 관리.

```java
// 네가 직접 짠 코드
EntityManager em = emf.createEntityManager();
EntityTransaction tx = em.getTransaction();
try {
    tx.begin();          // ← @Transactional 진입 시
    // ... 비즈니스 로직 ...
    tx.commit();         // ← 메서드 정상 종료 시
} catch (Exception e) {
    tx.rollback();       // ← 예외 발생 시
    throw e;
} finally {
    em.close();          // ← 메서드 종료 시
}
```

```java
// Spring
@Transactional
public void doSomething() {
    // ... 비즈니스 로직만 ...   ← begin/commit/rollback/close 전부 프록시가 대신함
}
```

개념은 같아도 **동작 디테일 3가지 차이**:

1. **롤백 조건이 다르다 (제일 중요한 함정).** 네 try-catch는 `catch(Exception)`라 모든 예외에 롤백했다. 하지만 Spring `@Transactional`의 기본 정책은 **`RuntimeException`(unchecked)과 `Error`에서만 롤백**한다. **checked 예외는 기본적으로 롤백 안 함** → 그냥 commit 된다. checked에도 롤백하려면 `@Transactional(rollbackFor = Exception.class)`.
2. **EntityManager를 직접 안 만든다.** 생성·종료·스레드 바인딩·커넥션 반납을 컨테이너가 관리한다. 주입받는 EM은 "현재 트랜잭션에 묶인 진짜 EM"으로 연결해주는 프록시다.
3. **메서드끼리 호출하면 트랜잭션이 합쳐진다 (propagation).** 기본값 `REQUIRED`에서는 안쪽 `@Transactional`이 새 트랜잭션을 열지 않고 바깥에 참여한다.

> 함정: AOP 프록시 기반이라 같은 클래스 안에서 `this.다른메서드()`로 직접 호출하면 프록시를 안 거쳐서 `@Transactional`이 안 먹는다.

---

**You**

2번 — EntityManager를 직접 만들지 않는다는 건 개발자 입장이고 실제로는 시스템이 내부적으로 만든다는 것으로 이해했는데 맞아? 컨테이너가 관리한다 이런 내용이 연결이 잘 안 돼서 도식화해서 설명 좀 해줄래?

---

**Claude**

맞아. 두 단계로 나눠 봐야 한다.

**(A) 앱 시작 시 — 딱 1번**
```
application.yml  (datasource, jpa 설정)
       │  Spring Boot 자동 설정
       ▼
EntityManagerFactory (EMF)     ← 싱글톤 빈, 앱 살아있는 내내 1개
   (= 바닐라의 Persistence.createEntityManagerFactory 결과물)
```
EMF는 "EM을 찍어내는 공장". 무거워서 앱당 1개만 만들어 재사용한다.

**(B) `@Transactional` 메서드가 실행될 때 — 호출마다**
```
  Controller
     │ 호출
     ▼
 ┌─[프록시]────────────────────────────────┐
 │   ① "트랜잭션 시작해줘" 요청              │
 │        ▼                                 │
 │   TransactionManager (JpaTransactionManager)
 │     ② EMF.createEntityManager()  → 진짜 EM 생성
 │     ③ em.getTransaction().begin()
 │     ④ 이 EM을 "현재 스레드"에 묶어둠 ─────┼──▶ TransactionSynchronizationManager
 │        ▼                                 │      (ThreadLocal 저장소)
 │   ===== Service 메서드 본문 실행 =====     │
 │        ▼                                 │
 │   메서드 종료                             │
 │     ⑤ 정상 → commit / 예외 → rollback     │
 │     ⑥ em.close() + 스레드 바인딩 해제      │
 └──────────────────────────────────────────┘
```

즉 ① begin ⑤ commit/rollback ⑥ close — 네가 try-catch-finally로 짠 생명주기를 프록시+TransactionManager가 호출마다 자동으로 돌린다. 이게 "컨테이너가 관리한다"의 실체.

핵심: 주입받아 쓰는 EntityManager는 **공유 프록시**다. 필드는 하나지만 동작할 땐 "지금 이 스레드에 묶인 진짜 EM"을 찾아 연결한다. 그래서 여러 요청(스레드)이 동시에 들어와도 안 섞인다. (이 프로젝트는 EM을 직접 주입받지도 않고 `JpaRepository`를 쓰는데, 그게 이 기계장치 한 단계 위에 얹혀 있다.)

---

**You**

3번 — 한 트랜잭션이 다른 트랜잭션을 호출하면 호출한 트랜잭션에 새 트랜잭션이 들어가버린다는 건데, 그럼 새 트랜잭션 부분에서 예외가 발생하면 원래의 트랜잭션까지 다 롤백되는 거야?

---

**Claude**

전제부터 정정. 기본 전파(`REQUIRED`)에서는 **새 트랜잭션이 생기지 않는다.** 안쪽 메서드는 바깥 트랜잭션에 *합류*할 뿐이라 물리적으로 트랜잭션이 **1개**다.

```
@Transactional outer() {
    작업 A;        // 변경 1
    inner();       // ← 새 트랜잭션 X. 같은 트랜잭션 T에서 실행
    작업 C;        // 변경 3
}
@Transactional inner() {
    작업 B;        // 변경 2
    throw ...;     // 💥 예외!
}
```

트랜잭션이 1개뿐이니 답은 "그래, 바깥까지 전부 롤백된다". B 예외가 전파되면 T 전체 rollback → A·B 다 취소(C는 실행도 안 됨).

**진짜 함정:** 바깥에서 try-catch로 잡아도 못 살린다. 안쪽 `@Transactional` 예외가 프록시 경계를 넘는 순간 트랜잭션에 **rollback-only** 도장이 찍힌다. 바깥은 같은 트랜잭션을 공유하므로, 예외를 삼켜도 commit 시점에 Spring이 `UnexpectedRollbackException`을 던지며 강제 롤백한다.

**"새 트랜잭션이 들어가는" 경우** = `@Transactional(propagation = Propagation.REQUIRES_NEW)`. 이러면 바깥을 잠시 멈추고 별도 트랜잭션을 연다. inner가 터져도 바깥은 영향 없음(바깥이 잡아주면), 반대도 마찬가지.

| 전파 | 트랜잭션 개수 | inner 예외 시 |
|---|---|---|
| `REQUIRED`(기본) | 1개(합류) | 바깥까지 전부 롤백 |
| `REQUIRES_NEW` | 2개(분리) | inner만 롤백(바깥이 잡으면) |

---

**You**

프록시라고 네가 말한 게 컨테이너랑 같은 거야? 개념 헷갈려.

---

**Claude**

다른 거다. "만든 쪽"과 "만들어진 것"의 관계.

- **컨테이너** = 앱 전체의 빈을 총괄 관리하는 본부. 앱당 1개.
- **프록시** = 그 본부가 특정 빈 하나에 씌워준 대리인(래퍼). `@Transactional` 붙은 빈마다 1개씩.

즉 **컨테이너가 프록시를 만든다.** 프록시는 컨테이너의 산출물이지 같은 존재가 아니다.

| | 컨테이너(ApplicationContext) | 프록시 |
|---|---|---|
| 정체 | 빈 전체 관리자 | 빈 하나를 감싼 래퍼 |
| 개수 | 앱당 1개 | (트랜잭션 등 붙은) 빈마다 1개 |
| 역할 | 빈 생성·보관·주입(DI)·생명주기 | 메서드 호출 가로채 부가기능(트랜잭션) 추가 |
| 관계 | 프록시를 만드는 쪽 | 컨테이너가 만든 결과물 |

```
컨테이너(ApplicationContext)
   │ AdminService 빈 만들려는데 @Transactional이 붙어있네?
   │ → 진짜 AdminService를 프록시로 감싸서 등록
   ▼
컨테이너 안 보관:  [ 프록시  →  진짜 AdminService ]

   AdminController가 "AdminService 주세요" 하면
   → 컨테이너는 진짜가 아니라 "프록시"를 주입해줌
```

등장인물 3명: **컨테이너**(전체 보스) → **프록시**(문지기, 메서드 가로채 트랜잭션 끼움) → **TransactionManager**(일꾼, 실제 begin/commit/rollback 실행, 이것도 컨테이너가 관리하는 빈).

---

**You**

그럼 컨트롤러가 서비스를 호출하면 컨테이너가 대신 프록시를 부르고, 이 프록시가 해당 서비스를 트랜잭션으로 감싸서 실제로 실행하는 구조인 거야?

---

**Claude**

거의 맞다. 한 군데만 정정 — "컨테이너가 (호출할 때) 대신 프록시를 부른다"는 틀렸다. 컨테이너가 일하는 시점과 프록시가 일하는 시점이 다르다.

- **① 앱 시작 시(1번):** 컨테이너가 컨트롤러에 진짜 대신 **프록시를 주입**해둔다. (컨트롤러는 이게 프록시인 줄 모름)
- **② 런타임(매번):** 컨트롤러가 들고 있는 게 이미 프록시라서, `service.method()` 호출이 곧 프록시 호출이다. **컨테이너는 이 순간 개입하지 않는다.** 프록시가 begin → 진짜 서비스 실행 → commit/rollback.

나머지("프록시가 서비스를 트랜잭션으로 감싸 실행한다")는 정확하다.

비유: 본부(컨테이너)가 채용·배치할 때 직원 자리에 비서(프록시)를 앉혀놨다. 그 뒤 일을 시킬 땐 본부를 거치지 않고 비서한테 바로 말하고, 비서가 앞뒤로 트랜잭션을 처리한 뒤 진짜 직원에게 일을 넘긴다. → 그래서 서비스 내부에서 `this.다른메서드()`로 부르면 비서(프록시)를 안 거쳐 트랜잭션이 안 걸린다(자기호출 함정).

---

## 💭 내 메모
<!-- 왜 저장했나 · 핵심 takeaway · 후속 액션 · 궁금한 점. -->
- Spring 강의 복습 중 Daker-server 프로젝트를 재점검하다 나온 대화.
- 후속(인제스트 지시): **자주 쓰는 Spring 어노테이션을 따로 모아 인덱스·연결 구조**로 만들 것. 그리고 **JPA 개념 페이지를 이 대화의 도식으로 더 직관적으로 보강**할 것.
- 핵심 takeaway: ①`@Transactional`은 바닐라 EntityManager/EntityTransaction try-catch의 선언적 버전 ②기본 롤백은 unchecked만 ③`readOnly`는 변경감지 스냅샷 생략 ④`REQUIRED`는 트랜잭션 1개로 합침(rollback-only 함정) ⑤프록시 ≠ 컨테이너(컨테이너가 프록시를 만들어 주입).

## 🔗 관련 노트
<!-- 연결되는 프로젝트·TIL·문서 링크 -->
