---
type: concept
tags: [jpa, hibernate, persistence, persistence-context, entity-lifecycle]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# 영속성 컨텍스트 (Persistence Context)

## 한 줄 정의

**엔티티를 보관·관리하는 "작업대"** — 코드와 DB 사이에 있는 1차 캐시 메모리 공간.
[[entity-manager]]가 이 작업대를 관리하며, 보통 **트랜잭션 하나 = 작업대 하나**로
생겼다 사라진다.

## 핵심 — [[jpa]]가 객체 중심일 수 있는 이유

`em.persist(e)`·`em.find(...)`를 호출하면 엔티티는 **DB로 바로 가지 않고 일단 이 작업대
위에 올라간다.** 그리고 트랜잭션이 커밋될 때 작업대 위의 변화를 한꺼번에 DB로 내보낸다.

이 "중간 작업대"가 있기에 JPA는 SQL이 아니라 **객체를 다루는** 경험을 준다 —
[[entity-manager]]가 단순한 SQL 실행기가 아닌 진짜 이유가 여기다.

## MyBatis와 비교하면 차이가 보인다

```java
// [[mybatis]] — UPDATE SQL을 "내가 직접 호출"해야 반영
user.setAge(30);
userMapper.updateUser(user);

// JPA — 작업대 위 객체는 그냥 바꾸면 커밋 때 알아서 UPDATE
User user = em.find(User.class, 1L);  // 작업대에 올림
user.setAge(30);                       // 필드만 변경 (update 호출 없음!)
```

`update`를 명시하지 않았는데 반영되는 것 — 이게 영속성 컨텍스트(아래 변경 감지)가 하는 일.
→ [[mybatis-to-jpa]]에서 "가장 사고방식이 바뀌는 칸은 수정"이라고 한 그 지점.

## 작업대가 해주는 5가지 (그리고 왜)

| 기능                        | 동작                                       | 왜 좋은가           |
| ------------------------- | ---------------------------------------- | --------------- |
| **1차 캐시**                 | 같은 PK `find` 두 번 → 두 번째는 DB 안 침          | DB 접근 비용 절감     |
| **동일성 보장**                | 같은 트랜잭션 내 같은 PK `find` → 같은 객체(`a == b`) | 객체 비교가 안전       |
| **변경 감지(dirty checking)** | 스냅샷과 비교해 바뀐 필드만 UPDATE                   | `update` 호출 불필요 |
| **쓰기 지연(write-behind)**   | `persist`를 모았다 커밋 때 INSERT 몰아 보냄         | 네트워크 왕복 절감      |
| **지연 로딩(lazy loading)**   | LAZY 연관을 실제 접근할 때 SELECT                 | 필요한 것만 조회       |

### 변경 감지(dirty checking) — 가장 중요

작업대는 엔티티를 올릴 때 **스냅샷**을 함께 찍어둔다. 커밋 시점에 현재 상태와
스냅샷을 비교해 **바뀐 필드만 골라 UPDATE를 생성**한다. 그래서 `setAge(30)`만 해도 반영된다.

> `merge`는 작업대 **밖에 있는(준영속)** 객체를 다시 올릴 때나 필요하다. 작업대 위 객체는
> 그냥 바꾸면 끝 — `merge` 호출은 오히려 불필요하거나 의도치 않은 덮어쓰기를 부를 수 있다.

### 지연 로딩과 N+1

LAZY 연관 객체를 건드릴 때 작업대가 그제서야 SELECT를 날린다. 목록 루프에서 이게 반복되면
[[n-plus-1-problem]]이 된다 — 영속성 컨텍스트의 편의가 함정으로 바뀌는 지점. → [[jpa-association]]

## 엔티티의 4가지 생명주기 (작업대 기준)

```
new User()      →  비영속(transient)  : 작업대 밖, 그냥 자바 객체
em.persist(u)   →  영속(managed)      : 작업대 위 — 변경 감지·1차 캐시 적용
em.detach(u)    →  준영속(detached)   : 작업대에서 내림 — 바꿔도 DB 반영 안 됨
em.remove(u)    →  삭제(removed)      : 삭제 예약 — 커밋 때 DELETE
```

- **영속(managed)** 상태에서만 변경 감지·1차 캐시가 작동한다.
- **준영속(detached)** 은 작업대를 벗어난 상태 — 화면에서 받은 DTO로 만든 엔티티가 여기 해당.
  다시 반영하려면 `merge`로 작업대에 재등록한다.

## merge의 로직 — 준영속을 다시 올리기

`merge`는 이름 그대로 "병합". **준영속 객체를 다시 작업대에 올리는** 메서드인데, 동작이
직관과 달라 함정이 많다.

```java
Item merged = em.merge(detachedItem);
```

1. `detachedItem`의 **ID를 꺼낸다.**
2. 그 ID로 **작업대(없으면 DB)에서 영속 엔티티를 찾는다.** (없으면 INSERT용으로 새로 생성)
3. 찾은/만든 **영속 엔티티에 `detachedItem`의 필드 값을 전부 복사한다.**
4. **그 영속 엔티티를 반환한다.**

### 함정 ① 인자는 영속이 되지 않는다

```java
Item merged = em.merge(detachedItem);
merged.setPrice(500);        // ✅ 반영됨 (영속)
detachedItem.setPrice(500);  // ❌ 반영 안 됨 (여전히 준영속)
```

→ **반환값을 받아 써야 한다.** `em.merge(x)`만 하고 `x`를 계속 쓰면 변경이 안 먹는 흔한 버그.

### 함정 ② 전체 덮어쓰기

merge는 **모든 필드를 통째로 복사**(3단계)한다. 준영속 객체의 일부 필드가 `null`이면
**그 null로 DB를 덮어쓴다.**

```java
Item dto = new Item();
dto.setId(1L); dto.setName("새 이름");  // price 안 채움 → null
em.merge(dto);                           // 💥 DB의 price가 null로 날아감
```

### 그래서 — 변경 감지가 더 안전

일상적인 수정은 `find`로 **영속 상태로 가져와 바꿀 필드만** 건드리는 변경 감지가 안전하다.
`merge`는 "작업대 밖(준영속) 객체를 어쩔 수 없이 다시 올려야 할 때"의 도구지, 기본 수정
수단이 아니다.

```java
Item item = em.find(Item.class, 1L);  // 영속
item.setName("새 이름");               // name만 UPDATE (변경 감지)
```

## flush — 작업대를 DB에 동기화하는 순간

`flush` = 작업대의 변경분(INSERT/UPDATE/DELETE)을 **DB로 내보내는 행위**. 보통 커밋 직전에
자동으로 일어난다.

> **flush ≠ 트랜잭션 종료.** flush는 SQL을 보낼 뿐 커밋이 아니다 — flush 후에도 롤백 가능.

그래서 [[transaction]]에서 "변경 감지는 커밋 시점에 동작한다"는 정확히는:

```
트랜잭션 커밋 → flush 발생 → 변경 감지로 UPDATE 생성 → DB 반영
```

영속성 컨텍스트의 수명이 트랜잭션과 묶여 있는 이유이기도 하다 — 작업대가 트랜잭션과 함께
생기고, 커밋/롤백으로 정리된다.

## 영균 학습 트리에서

- [[mybatis]] 실습에서 `UPDATE`를 직접 호출하던 습관이 JPA에서 사라지는 이유의 정체.
  "왜 merge 안 해도 바뀌지?"의 답.
- [[entity-manager]]가 상태를 갖는(가벼워서 매번 새로 만드는) 이유 = 이 작업대를 들고 있어서.
- 프로젝트 적용 시 가장 많이 부딪힐 개념 — LAZY 로딩 예외(`LazyInitializationException`)나
  변경이 의도와 다르게 반영되는 일이 전부 작업대의 수명·상태에서 온다.

## 관련 페이지

- [[entity-manager]] — 영속성 컨텍스트를 들고 관리하는 주체
- [[jpa]] — 객체 중심 영속성을 가능케 하는 핵심 메커니즘
- [[transaction]] — 작업대의 수명·flush·커밋이 묶이는 경계
- [[jpa-association]] · [[n-plus-1-problem]] — 지연 로딩이 부르는 함정
- [[mybatis]] · [[mybatis-to-jpa]] — "수정 방식"이 가장 크게 바뀌는 비교 지점
- 출처: [[jpa-lecture]]
