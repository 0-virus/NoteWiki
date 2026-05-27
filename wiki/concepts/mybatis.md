---
type: concept
tags: [java, spring, mybatis, persistence, sql, database]
updated: 2026-05-26
sources: ["raw/notes/study-notes.md"]
---

# MyBatis

## 한 줄 정의

**Java 메서드 호출을 XML/어노테이션에 적힌 SQL로 연결해주는 SQL Mapper 프레임워크.**
[[jdbc]]의 반복 코드(Connection 열기·PreparedStatement·ResultSet 매핑·자원 해제)를
대신 처리해주지만, **SQL 자체는 개발자가 그대로 짠다**.

## ⚠️ MyBatis는 [[orm]]이 아니다 — 가장 큰 오해

자주 같이 묶이지만 **카테고리가 다르다.**

| | MyBatis (SQL Mapper) | JPA / Hibernate / [[prisma]] (ORM) |
| --- | --- | --- |
| SQL 작성 | **개발자가 직접** | 프레임워크가 자동 생성 |
| 객체 ↔ 테이블 매핑 | 결과 행만 객체로 매핑 | 객체 모델 = 테이블 모델 |
| 관계(FK) 처리 | 직접 JOIN 작성 | 객체 그래프 탐색으로 자동 |
| 학습 곡선 | 낮음 (SQL 알면 끝) | 높음 (영속성 컨텍스트·LazyLoading 등) |
| 복잡한 쿼리 | 강함 — 그냥 SQL 쓰면 됨 | 약함 — JPQL의 한계 |
| [[n-plus-1-problem]] | 발생할 수 있지만 SQL을 보면 보임 | 추상화 뒤에 숨어서 무서움 |

> 한국 SI 업계는 MyBatis가 압도적이다(복잡한 레거시 쿼리·튜닝 문화). 글로벌·신규 프로젝트는
> JPA가 우세. **둘은 우열이 아니라 SQL 통제권을 누가 갖느냐의 선택**이다.

## namespace ↔ Java 인터페이스 매핑 — 핵심 메커니즘

MyBatis의 본체는 이 한 줄이다:

```xml
<mapper namespace="org.example.usertest.repository.UserRepository">
    <select id="findAll" resultType="User"> ... </select>
</mapper>
```

- `namespace` = **어떤 Java 인터페이스에 연결할지** 지정
- `id` = **그 인터페이스의 메서드명**과 1:1 매칭

Java 측은 인터페이스 선언만 있고 **구현체가 없다**.

```java
public interface UserRepository {
    List<User> findAll();
    User findById(int id);
}
```

`userRepository.findAll()`을 호출하면 MyBatis가:
1. `UserRepository` 인터페이스의 정규명을 찾는다
2. 같은 namespace를 가진 XML을 찾는다
3. `id="findAll"`인 SQL을 실행한다
4. 결과 ResultSet을 `resultType="User"` 객체로 매핑한다

→ **자바 인터페이스에 동적 프록시 구현체를 끼워주는 방식**. [[dao-pattern]]의 자동화.

## 주요 설정 (application.properties)

```properties
# DB 접속 정보 (Spring DataSource — 내부적으로 [[hikaricp]]가 자동 등록됨)
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/jwbook
spring.datasource.username=root
spring.datasource.password=1234

# SQL XML 파일 위치
mybatis.mapper-locations=classpath:mappers/*.xml

# DB 컬럼 user_id ↔ Java 필드 userId 자동 변환
mybatis.configuration.map-underscore-to-camel-case=true

# resultType에 클래스명만 써도 되게 단축
mybatis.type-aliases-package=org.example.usertest.model
```

| 설정 | 없으면 일어나는 일 |
| --- | --- |
| `mapper-locations` 누락/오타 | XML을 못 찾아 "Invalid bound statement" 에러 |
| `map-underscore-to-camel-case` 없음 | `user_id`가 Java `userId`에 안 들어와 `null` |
| `type-aliases-package` 없음 | XML의 모든 `resultType`에 전체 패키지명 적어야 함 |

> ⚠️ 가장 흔한 오타: `mybatix.mapper-locations` (X 자리에 ts 아닌 x).
> Spring Boot가 unknown property를 경고만 하고 넘어가므로 발견이 어렵다.

## `<sql>` / `<include>` — 재사용 가능한 SQL 조각

```xml
<sql id="userColumns">id, userId, username, email, age, dept</sql>

<select id="findAll" resultType="User">
    SELECT <include refid="userColumns" /> FROM users
</select>

<select id="findById" parameterType="int" resultType="User">
    SELECT <include refid="userColumns" /> FROM users WHERE id = #{id}
</select>
```

User 모델에 필드 추가 → `<sql>` 한 줄만 고치면 **이 컬럼을 참조하는 모든 쿼리가 동시 갱신**.
단, `@Select` 어노테이션으로 클래스에 직접 박은 SQL은 이 혜택을 못 받는다.

## `#{}` vs `${}` — 보안의 갈림길

| 표기 | 동작 | 안전성 |
| --- | --- | --- |
| `#{id}` | PreparedStatement의 `?` 자리로 바인딩 | ✅ SQL Injection 안전 |
| `${id}` | SQL 문자열에 그대로 치환 | ❌ Injection 위험, 동적 테이블명에만 |

> 신입이 가장 많이 내는 보안 사고가 `${}`로 사용자 입력을 받는 것. **변수는 무조건 `#{}`**.

## 3-tier에서의 위치

```
[Controller] → [Service] → [Repository 인터페이스]      ← Spring Bean
                                  ↕
                         [MyBatis가 연결해줌]            ← XML ↔ 인터페이스
                                  ↕
                          [UserRepository.xml]          ← 실제 SQL
                                  ↕
                             [MySQL DB]
```

[[three-tier-architecture]]의 Repository Layer가 MyBatis로 채워진 모습. 
Spring의 `@Repository`가 인터페이스에 붙고, MyBatis가 구현체를 동적으로 제공한다.

## 어노테이션 방식 — `@Mapper`·`@Select`

```java
@Mapper
public interface UserRepository {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(int id);
}
```

- **장점**: XML 파일 없이 간단한 쿼리 처리.
- **단점**: SQL이 길어지면 가독성 폭락, `<sql>` 재사용·동적 쿼리(`<if>`·`<foreach>`) 불가.
- **실무 관습**: 단순 쿼리는 어노테이션, 복잡한 쿼리는 XML.

## 영균 학습 트리에서

- 부트캠프 MyBatis 단원 실습 중 (2026-05-26). 곧 본 프로젝트 백엔드의 영속성으로 채택.
- [[jdbc]]를 손으로 짜본 다음 단계 — JDBC의 반복 코드(연결·해제·매핑)가 어디로 사라졌는지를
  이 페이지로 추적할 수 있다.
- JPA로 한 번 더 올라가기 전의 중간 추상화 — **SQL 통제권은 그대로 두고 매핑만 자동화**한
  형태가 SQL Mapper. 다음 가지가 [[jpa]]([[orm]] 진영). 전환의 1:1 대응은 [[mybatis-to-jpa]]에 정리.
  → SQL 작성까지 프레임워크에 넘기면 JPA, 인터페이스 선언만 남기면 [[spring-data-jpa]].
  단 MyBatis는 버려지지 않는다 — JPA의 [[jpql]] 한계를 메우는 복잡 쿼리 안전판으로 공존(CQRS).

## 관련 페이지

- [[jdbc]] — MyBatis가 내부에서 호출하는 저수준 API
- [[connection-pool]] · [[hikaricp]] — `spring.datasource.*` 설정 뒤에서 MyBatis가 받아 쓰는 Connection 풀
- [[dao-pattern]] — MyBatis Mapper가 자동화한 패턴
- [[orm]] — MyBatis와 다른 카테고리, 비교 대상
- [[three-tier-architecture]] — Repository Layer를 채우는 도구
- [[spring-bean]] — `@Mapper`로 등록된 인터페이스가 Bean이 되는 방식
- [[n-plus-1-problem]] — MyBatis에서도 동일하게 발생 (SQL이 보여서 잡기는 쉬움)
- [[jpa]] — 다음 단계(ORM). SQL 작성까지 자동화
- [[mybatis-to-jpa]] — 두 기술의 전환·공존 흐름
- 출처: [[mybatis-practice-debugging]]
