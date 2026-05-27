---
type: concept
tags: [java, jdbc, database, web]
updated: 2026-05-19
sources: ["raw/dialogues/conversation.md"]
---

# JDBC (Java Database Connectivity)

## 한 줄 정의

**Java가 데이터베이스에 접근하는 표준 API.** 어떤 DB든 같은 코드 모양으로 다루게 해준다.

## 왜 "표준"이 핵심인가

JDBC의 본질은 **인터페이스와 구현의 분리**다. `Connection`, `PreparedStatement`,
`ResultSet`은 전부 Java가 정한 **인터페이스**(표준)고, 실제 동작하는 코드는 DB 회사가
만든 **Driver**(구현체)가 채운다.

```
com.mysql.cj.jdbc.Driver
│── com.mysql : MySQL 회사 패키지 (제조사)
│── cj        : Connector/J — MySQL의 Java 드라이버 이름
│── jdbc      : JDBC 표준 인터페이스의 구현
└── Driver    : JDBC Driver 클래스
```

| DB | JDBC Driver 클래스 |
| --- | --- |
| MySQL | `com.mysql.cj.jdbc.Driver` |
| Oracle | `oracle.jdbc.driver.OracleDriver` |
| MariaDB | `org.mariadb.jdbc.Driver` |
| PostgreSQL | `org.postgresql.Driver` |
| MS SQL Server | `com.microsoft.sqlserver.jdbc.SQLServerDriver` |

→ DB를 바꿔도 비즈니스 코드는 그대로다. **Driver와 접속 URL만 교체**하면 된다.
이것이 표준 API를 두는 이유다.

## 핵심 4객체

| 객체 | 역할 |
| --- | --- |
| `Driver` | DB별 JDBC 구현체. 어떤 DB에 어떻게 말 거는지 안다 |
| `Connection` | DB와의 연결 통로 |
| `PreparedStatement` | SQL을 담아 실행. `?` 자리표시자로 값을 안전하게 끼움 |
| `ResultSet` | SELECT 결과 집합. 커서를 한 행씩 옮기며 읽는다 |

### executeQuery vs executeUpdate

- **`executeQuery()`** — SELECT용. 결과를 `ResultSet`으로 반환.
- **`executeUpdate()`** — INSERT/UPDATE/DELETE용. **영향받은 행 수(int)**를 반환
  (보통 성공 시 1). 가져올 행이 없으므로 ResultSet이 아니다.

### ResultSet은 커서다 — `rs.next()`의 의미

`rs.next()`는 **커서를 다음 행으로 옮기고, 행이 있으면 `true`/없으면 `false`**를 반환한다.
이 반환값이 곧 루프의 종료 조건이다.

```java
while (rs.next()) {            // 행이 없으면 자동으로 멈춤
    list.add(new Student(...));
}
```

> ⚠️ 흔한 실수: `while(true)`로 돌면 행이 다 끝나도 멈추지 않고 없는 행을 읽으려다
> `SQLException`이 터진다. 단건 조회도 `if(rs.next())`로 감싸 없을 때를 처리해야 한다.

## 리소스 해제 — 닫는 순서가 중요하다

`Connection`·`PreparedStatement`·`ResultSet`은 모두 **명시적으로 `close()`**해야 한다.
안 닫으면 커넥션이 열린 채 쌓여 결국 고갈된다(커넥션 누수).

```java
public void close() {
    try {
        if (pstmt != null) pstmt.close();   // 연 순서의 역순으로 닫는다
        if (conn != null)  conn.close();
    } catch (SQLException e) {
        throw new RuntimeException(e);
    }
}
```

- **역순으로 닫는 이유**: 하위 자원(pstmt)은 상위 자원(conn)에 의존한다.
  conn을 먼저 닫으면 pstmt가 매달릴 대상이 사라진다.
- **`null` 체크 이유**: `open()`이 실패하면 conn·pstmt가 null인 채로 `close()`가
  호출될 수 있고, 그때 `null.close()`는 NPE다.

## 왜 알아둬야 하나 — 영균 맥락

영균은 이미 [[prisma]] 같은 [[orm]]을 써봤다. ORM은 **JDBC라는 저수준 위에 얹힌
추상화**다. `prisma.user.findMany()` 한 줄 뒤에서 일어나는 일이 바로 이 Connection →
PreparedStatement → ResultSet 흐름이다. JDBC를 직접 만져보면 ORM이 무엇을 감춰주는지가
선명해진다. Spring으로 가면 `DataSource`·`JdbcTemplate`이 이 반복 코드(연결·해제)를
대신 처리해준다 — "왜 그 도구가 필요한가"의 답이 여기 있다.

그리고 `DataSource`의 구체 클래스로 보통 들어가는 것이 [[hikaricp]] — JDBC의 가장 비싼
비용(Connection 생성)을 [[connection-pool]]로 재사용해 회피한다. 영균이 위에서 외운
"역순으로 close"가 풀 환경에선 **물리적 종료가 아니라 풀 반납**으로 의미가 바뀐다.
다만 **`close()` 호출 책임은 그대로** — 안 부르면 풀이 고갈된다 ([[connection-pool]]
"누수의 두 얼굴" 참조).

ORM이 한 번에 너무 많이 감춰서 부담스러우면 **중간 추상화 [[mybatis]]**(SQL Mapper)가
있다. SQL은 그대로 두고 매핑·자원 관리만 자동화하는 형태. 부트캠프 MyBatis 단원 실습이
바로 이 다리.

## 관련 페이지

- [[dao-pattern]] — JDBC 코드를 한 객체로 모으는 패턴
- [[connection-pool]] — JDBC Connection 생성 비용을 재사용으로 회피
- [[hikaricp]] — Spring Boot 기본 풀 구현체
- [[orm]] — JDBC를 추상화한 상위 계층 (자동 SQL)
- [[mybatis]] — JDBC와 ORM 사이의 중간 추상화 (SQL Mapper)
- [[prisma]] — ORM 구현체, JDBC와 같은 일을 추상화해 처리
- [[mvc-pattern]] — Controller가 DAO를 거쳐 JDBC로 DB에 접근
- 출처: [[servlet-jdbc-debugging]]
