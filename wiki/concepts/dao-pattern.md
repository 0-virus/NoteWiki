---
type: concept
tags: [java, jdbc, database, architecture, pattern]
updated: 2026-05-19
sources: ["raw/dialogues/conversation.md"]
---

# DAO 패턴 (Data Access Object)

## 한 줄 정의

**데이터 접근 코드(SQL·[[jdbc]] 호출)를 전담하는 객체로 분리하는 패턴.**

## 왜 분리하는가

SQL과 JDBC 호출이 Controller나 비즈니스 로직 곳곳에 흩어지면, DB 구조가 바뀔 때
어디를 고쳐야 하는지 추적이 안 된다. DAO는 **데이터 접근이라는 한 가지 관심사를
한곳에 모은다**.

→ 상위 계층([[mvc-pattern]]의 Controller)은 `studentDAO.findAll()`처럼 **"무엇을
가져올지"의 의도만** 알면 되고, "어떤 SQL로 어떻게"는 DAO 안에 숨는다. 이것이 관심사
분리(separation of concerns)다.

## 메서드 형태 — 반환 타입이 의미를 말한다

| 메서드 | 반환 | 이유 |
| --- | --- | --- |
| `findAll()` | `List<Student>` | 결과가 여러 건이므로 리스트 |
| `findById(id)` | `Student` (또는 null) | 단건. 없으면 `null` |
| `create(Student)` | `void` 또는 `int` | INSERT. int면 영향받은 행 수 |

```java
// 여러 건: ResultSet을 돌며 객체로 만들어 리스트에 쌓는다
public List<Student> findAll() {
    List<Student> list = new ArrayList<>();
    while (rs.next()) {
        list.add(new Student(...));
    }
    return list;
}

// 단건: 있을 때만 읽고, 없으면 null
public Student findById(int id) {
    if (rs.next()) return new Student(...);
    return null;
}
```

`create`는 INSERT이므로 [[jdbc]]의 `executeUpdate()`를 쓴다 (`find`류의
`executeQuery()`와 구분).

## 흔한 함정 — 타입 캐스팅

```java
// ✗ SimpleDateFormat.parse()는 java.util.Date를 만든다.
//   강제 캐스팅하면 런타임에 ClassCastException.
pstmt.setDate(4, (java.sql.Date) birth);

// ✓ java.util.Date → java.sql.Date 변환
pstmt.setDate(4, new java.sql.Date(birth.getTime()));
```

`java.util.Date`와 `java.sql.Date`는 상속 관계지만 별개 타입이다. 캐스팅이 아니라
**변환**해야 한다.

## 위치 — Controller와 DB 사이

```
[Controller]  요청 처리 · 흐름 제어   ← MVC의 C
     │ studentDAO.findAll()
     ▼
[DAO]         SQL · JDBC 전담        ← 이 페이지
     │ Connection / PreparedStatement
     ▼
[Database]
```

[[mvc-pattern]]에서 "Controller가 DB 접근"이라 했던 그 DB 접근을, 실제로는 DAO에
위임한다.

## Spring으로 이어지는 지점 — 영균 맥락

Spring의 **`@Repository`**가 바로 이 DAO다. 더 나아가 **Spring Data JPA**는 DAO를
인터페이스 선언만으로 메서드를 자동 구현해준다 (`findAll()`을 직접 짤 필요가 없다).
지금 DAO를 손으로 짜며 겪는 반복(연결·ResultSet 순회·해제)이 **Spring이 무엇을 없애주는가**의
체험이다. → [[servlet-to-spring-mvc]]

[[mybatis]]는 그 자동화의 **SQL Mapper 버전** — 인터페이스 + XML(또는 `@Select`)
선언만으로 구현체를 동적 프록시로 만들어준다. 부트캠프 MyBatis 단원이 이 단계.

## 관련 페이지

- [[jdbc]] — DAO 내부가 실제로 쓰는 DB 접근 API
- [[mybatis]] — DAO 인터페이스에 구현을 자동 끼워주는 SQL Mapper
- [[mvc-pattern]] — DAO는 Controller 아래 데이터 접근 계층
- [[orm]] — DAO의 반복 코드를 더 크게 추상화한 접근
- 출처: [[servlet-jdbc-debugging]]
