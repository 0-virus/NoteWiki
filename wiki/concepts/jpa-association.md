---
type: concept
tags: [jpa, hibernate, association, relationship, fetch, cascade, database]
updated: 2026-06-02
sources: ["raw/lectures/JPA.md"]
---

# JPA 연관 관계 (Association)

## 한 줄 정의

**DB의 외래 키(FK) 관계를 Java 객체의 참조(필드)로 표현하는 것.**
JPA가 이 둘 사이의 변환을 자동으로 처리한다.

## 왜 필요한가 — 문제의 출발점

DB와 Java는 "관계 맺는 방식"이 다르다.

```
DB 세계:   comments 테이블의 post_id(FK) → posts 테이블에 JOIN
Java 세계: Comment 객체의 Post post 필드  → Post 객체를 직접 참조
```

[[mybatis]]나 [[jdbc]]에서는 개발자가 이 변환을 손으로 짰다(JOIN → 결과 행 → 객체에 꽂기).
JPA는 그 변환을 프레임워크가 맡아 — Java 코드에서 `comment.getPost()`처럼
**객체 참조로** 관련 데이터를 탐색하면, JPA가 뒤에서 필요한 SQL을 만든다.
→ [[jpa]]의 패러다임 불일치 해소.

---

## 1단계: 가장 기본 — `@ManyToOne` (단방향)

"댓글은 하나의 게시글에 속한다" — 실무에서 가장 자주 쓰는 패턴.

```java
@Entity
public class Comment {
    @Id @GeneratedValue
    private Long id;

    private String content;

    @ManyToOne                      // "많은 댓글이 → 하나의 게시글에 속한다"
    @JoinColumn(name = "post_id")   // DB의 FK 컬럼 이름 지정
    private Post post;              // Java 객체 참조
}
```

이것만으로 `comment.getPost()`로 연관 게시글 객체를 가져올 수 있다.
이 방향은 **단방향** — `Comment`에서 `Post`는 볼 수 있지만 그 반대는 아직 안 된다.

### 어노테이션 선택 기준

"**내 입장에서 상대가 몇 개인가**"로 고른다.

| 상황 | 어노테이션 |
| --- | --- |
| 댓글(나) → 게시글(상대): 상대가 **1개** | `@ManyToOne` |
| 게시글(나) → 댓글 목록(상대): 상대가 **여러 개** | `@OneToMany` |
| 유저 ↔ 프로필: 양쪽 다 **1개** | `@OneToOne` |
| 학생 ↔ 강의: 양쪽 다 **여러 개** | `@ManyToMany` (보통 중간 테이블로 풀어 씀) |

> **단방향은 `@ManyToOne`이 관례.** `@OneToMany` 단방향은 가능은 하지만
> JPA가 내부적으로 중간 조인 테이블을 만들거나 이상한 SQL을 뱉는 문제가 있어
> 실무에서 거의 안 쓴다. 반대 방향도 필요하면 단방향을 양방향으로 확장한다(2단계).

---

## 2단계: 양방향 — `@OneToMany` + `mappedBy`

"게시글에서 댓글 목록도 보고 싶다"면 `Post` 쪽에도 참조를 추가한다.

```java
@Entity
public class Post {
    @Id @GeneratedValue
    private Long id;

    @OneToMany(mappedBy = "post")           // "Comment의 post 필드가 주인이다"
    private List<Comment> comments = new ArrayList<>();
}
```

`mappedBy = "post"` — `Comment` 클래스의 `post` 필드가 이 관계의 **주인**이라는 뜻.
이 선언이 왜 필요한지는 바로 아래에서 설명한다.

---

## 3단계: 연관 관계의 주인(Owner) — 가장 헷갈리는 부분

### 왜 주인을 정해야 하나?

양방향으로 만들면 Java 코드엔 참조가 **2개**지만, DB엔 FK 컬럼이 **1개**(`post_id`)다.
JPA 입장에서 "어느 쪽 참조를 보고 `post_id`를 저장하지?"를 혼자 결정할 수 없다.
그래서 개발자가 한 쪽을 **주인**으로 지정한다.

> **규칙: FK 컬럼이 있는 테이블 쪽 클래스 = 주인**

```
comments 테이블에 post_id(FK)가 있다
    → Comment 클래스가 주인 (FK를 직접 관리)
    → Post 클래스는 mappedBy로 "난 주인 아님"을 선언 (읽기 전용)
```

```java
// 주인 (FK가 있는 쪽) — INSERT/UPDATE는 이쪽으로만
public class Comment {
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;            // ← 진짜 FK 관리자
}

// 주인 아님 (읽기 전용)
public class Post {
    @OneToMany(mappedBy = "post") // ← "저쪽 Comment.post 필드가 주인"
    private List<Comment> comments;
}
```

### 실수 포인트 — 이 버그가 가장 많이 난다

```java
// ❌ post_id가 DB에 null로 들어간다 — 주인이 아닌 쪽에만 설정했기 때문
post.getComments().add(comment);

// ✅ 주인(Comment)에 설정해야 DB에 저장된다
comment.setPost(post);

// + 객체 상태도 맞춰주는 게 관례 (양방향 동기화)
post.getComments().add(comment);
```

> ⚠️ **같은 트랜잭션 안에서는 멀쩡해 보이는 버그다.**
> 주인 아닌 쪽(`post.getComments()`)에만 추가하면 메모리 캐시엔 `comment`가 들어가
> 같은 트랜잭션 안에서 조회하면 정상처럼 보인다. 하지만 DB에는 `post_id = null`로
> INSERT되어 있다. 트랜잭션 끝나고 다시 조회해야 "어? 댓글이 없네?"를 알게 된다.
> 같은 트랜잭션 안에서만 통과되는 테스트가 초록불이어도 안심할 수 없는 이유.

### 편의 메서드 패턴

양방향 동기화(DB 저장 + 메모리 갱신)를 매번 두 줄씩 쓰면 빠뜨리기 쉽다.
엔티티 안에 메서드로 묶어두는 게 관례다.

```java
// Post 엔티티 안에
public void addComment(Comment comment) {
    this.comments.add(comment);  // 메모리 동기화 (비주인 쪽)
    comment.setPost(this);       // DB 저장용 (주인 쪽)
}
```

호출부는 `post.addComment(comment)` 한 줄로 끝난다.

---

## 4단계: 페치 전략 — 언제 DB에서 가져오나

`comment.getPost()`를 호출할 때 DB SELECT가 **언제** 일어나느냐의 설정.

```java
@ManyToOne(fetch = FetchType.LAZY)   // 실제로 getPost() 쓰는 순간에 SELECT
@ManyToOne(fetch = FetchType.EAGER)  // Comment 조회 시 Post도 항상 JOIN해서 함께 로딩
```

| 전략 | 동작 | JPA 기본값 |
| --- | --- | --- |
| `LAZY` | 실제로 접근할 때 SELECT | `@OneToMany` |
| `EAGER` | 엔티티 조회 시 연관도 즉시 JOIN | `@ManyToOne` |

실무 관례: **무조건 LAZY를 기본으로 설정**한다. EAGER를 남발하면 안 써도 될 데이터까지
매번 JOIN해서 가져오게 된다. 필요할 때만 fetch join 또는 `@EntityGraph`로 한 번에 꺼낸다.
→ [[n-plus-1-problem]] 참조.

### Fetch join vs EAGER — 결과는 같고 범위가 다르다

둘 다 연관 데이터를 JOIN해서 한 번에 가져온다. 차이는 **적용 범위**다.

| | 적용 범위 | 동작 |
| --- | --- | --- |
| `EAGER` | 설정 레벨 — 이 필드는 **항상, 모든 쿼리**에서 JOIN | `findAll()`도, `findById()`도 항상 |
| Fetch join | 쿼리 레벨 — **이 쿼리 한 번만** JOIN | 명시적으로 쓴 곳만 |

```java
// EAGER: 설정해두면 모든 조회에서 자동 JOIN → findAll() 시 N+1 위험
@OneToMany(fetch = FetchType.EAGER)
private List<Comment> comments;

// Fetch join: 필요한 쿼리에만 명시적으로
@Query("SELECT p FROM Post p JOIN FETCH p.comments WHERE p.id = :id")
Post findByIdWithComments(Long id);  // 이 쿼리만 JOIN
```

그래서 실무 패턴은 **LAZY 기본 + 필요한 서비스 메서드에서만 fetch join**이 된다.

### LAZY의 함정 — `LazyInitializationException`

LAZY 설정 시 `comment.getPost()`를 호출하는 순간 [[persistence-context]](작업대)가
SELECT를 날린다. 그런데 **트랜잭션이 끝나면 작업대가 닫힌다.**

```java
// 서비스 레이어 (트랜잭션 안 — 작업대가 열려 있음)
Comment comment = commentRepository.findById(1L).get();
return comment;  // 트랜잭션 종료, 작업대 닫힘

// 컨트롤러 (트랜잭션 밖 — 작업대 없음)
comment.getPost().getTitle();  // ← LazyInitializationException 터짐!
```

해결책: 트랜잭션 안에서 미리 초기화하거나(fetch join으로 한 번에 가져옴), DTO로 변환해서 내보낸다.

### LAZY인데 진짜 객체가 아닌 이유 — 프록시(Proxy)

LAZY로 설정하면 `comment.getPost()` 반환값은 **진짜 Post 객체가 아니라** [[hibernate]]가
만든 **가짜 껍데기(프록시)**다. 처음엔 ID만 들어 있고, 실제 필드에 접근하는 순간
SELECT가 발생해 속을 채운다("프록시 초기화").
"왜 이 객체가 이상하게 동작하지?" 싶을 때 대부분 여기서 온다.

**왜 null이나 "로딩 안 됨" 표시 대신 프록시인가?**

Java는 타입 시스템상 `Post post` 필드가 `null`이 아닌 이상 **항상 뭔가를 가리켜야** 한다.
`null`로 두면 `comment.getPost().getTitle()` 호출 시 `NullPointerException`이 터지고,
빈 객체로 두면 "댓글이 없음"과 "아직 안 불러옴"을 구분할 수 없다.

그래서 Hibernate는 **"일단 껍데기 객체를 줘서 null은 피하고, 실제 데이터는 건드릴 때 가져온다"**
는 프록시 전략을 택했다. 이를 **"투명한 영속성(transparent persistence)"** 이라고 한다 —
호출하는 코드는 객체가 로딩됐는지 신경 쓰지 않아도 된다는 이상. 현실에서는 이 투명성이
`LazyInitializationException`이라는 숨은 함정을 만든다.

[[prisma]]는 정반대 선택을 했다 — `include` 없이 조회하면 관련 필드가 아예 없다(TypeScript의
`undefined`). "없으면 없다고 명시"가 JPA 프록시보다 단순하지만, JavaScript/TypeScript의
타입 시스템이 그 표현을 허용하기 때문에 가능한 선택이다.

---

## 5단계: 영속성 전이 — Cascade

주인 엔티티에 한 작업을 연관 엔티티에도 자동으로 전파한다.

```java
@OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
private List<Comment> comments = new ArrayList<>();
```

이렇게 하면:
- `postRepository.save(post)` → `comments`도 전부 자동 INSERT
- `postRepository.delete(post)` → `comments`도 전부 자동 DELETE

댓글을 따로 `save()`하거나 `delete()`할 필요가 없다.

| `CascadeType` | 의미 |
| --- | --- |
| `ALL` | 아래 전부 |
| `PERSIST` | 저장 전파 |
| `MERGE` | 병합 전파 |
| `REMOVE` | 삭제 전파 |

---

## 한 눈에 보는 적용 흐름

```
1. @ManyToOne 단방향부터 시작한다 (가장 많이 씀)
   └─ FK 칼럼은 @JoinColumn으로 지정

2. 반대 방향도 필요하면 @OneToMany + mappedBy 추가
   └─ mappedBy 값 = 상대 클래스에서 나를 참조하는 필드명

3. 주인은 FK가 있는 쪽 — DB 저장은 항상 주인을 통해서만

4. fetch = LAZY 기본 설정 — 필요할 때 fetch join으로 꺼냄

5. 수명이 완전히 종속된 관계라면 cascade 추가
```

---

## 관련 페이지

- [[jpa]] — JPA가 연관 관계 매핑으로 해소하는 패러다임 불일치
- [[jpa-entity-mapping]] — 단일 엔티티/키 매핑 (관계 전 단계)
- [[n-plus-1-problem]] — LAZY 페치(프록시 초기화)가 부르는 대표 함정
- [[persistence-context]] — 프록시 초기화·LazyInitializationException이 작업대 수명에 묶이는 이유
- [[entity-manager]] — cascade가 커밋 시점에 동작하는 맥락
- [[mybatis]] — SQL로 관계를 직접 JOIN으로 푸는 비교 대상
- [[prisma]] — `include`로 연관 데이터를 명시적으로 가져오는 비교 대상 (프록시 없음)
- 출처: [[jpa-lecture]]
