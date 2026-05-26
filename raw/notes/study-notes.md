2026-05-26 MyBatis 실습을 하면서 claude code와 대화한 내용을 정리한 문서. 위키에 실습 관련 문서를 따로 모아두고 참고하고 싶음.

# Spring Boot + MyBatis 실습 정리

---

## 1. application.properties / UserRepository.xml 초기 오류 수정

### application.properties에서 발견된 문제

**문제 1 — 오타**

```properties
mybatix.mapper-locations=   # ❌ mybatix
mybatis.mapper-locations=classpath:mappers/*.xml   # ✅
```

**문제 2 — mapper 경로 값 누락**
값이 비어 있어 MyBatis가 XML을 찾지 못하는 상태였음. `classpath:mappers/*.xml` 추가 필요.

---

### UserRepository.xml에서 발견된 문제

- `namespace`가 다른 프로젝트(`sample1`)의 `PostRepository`를 가리키고 있었음
- `<select>` 태그가 열린 채 닫히지 않아 XML 자체가 invalid한 상태
- `selectAllPosts`, `selectPostById` 등 다른 프로젝트의 SQL이 중복·혼재

**수정 결과** — 현재 프로젝트 기준으로 전면 재작성:

```xml
<mapper namespace="org.example.usertest.repository.UserRepository">
    <select id="findAll" resultType="User"> ... </select>
    <select id="findById" parameterType="int" resultType="User"> ... </select>
    <insert id="insert" parameterType="User"> ... </insert>
    <update id="update" parameterType="User"> ... </update>
    <delete id="delete" parameterType="int"> ... </delete>
</mapper>
```

---

## 2. application.properties와 UserRepository.xml이 하는 일

### 전체 구조

```
[Controller] → [Service] → [Repository 인터페이스]
                                    ↕
                           [MyBatis가 연결해줌]
                                    ↕
                          [UserRepository.xml]  ← 실제 SQL
                                    ↕
                             [MySQL DB]
```

### application.properties — "설정 파일"

앱이 시작될 때 Spring이 읽어서 환경을 구성한다.

```properties
# MySQL 접속 정보
spring.datasource.driver-class-name: com.mysql.cj.jdbc.Driver
spring.datasource.url: jdbc:mysql://localhost:3306/jwbook?...
spring.datasource.username: root
spring.datasource.password: 1234

# SQL XML 파일 위치
mybatis.mapper-locations=classpath:mappers/*.xml

# DB 컬럼명 user_id ↔ Java 필드명 userId 자동 변환
mybatis.configuration.map-underscore-to-camel-case=true

# XML에서 전체 패키지명 대신 클래스명만 써도 되게 단축
mybatis.type-aliases-package=org.example.usertest.model
```

### UserRepository.xml — "SQL 파일"

Java에서 `userRepository.findAll()` 호출 시, MyBatis가 XML에서 `id="findAll"`인 쿼리를 찾아 실행한다.

```xml
<mapper namespace="org.example.usertest.repository.UserRepository">
```

- `namespace` = 어떤 Java 인터페이스와 연결할지 지정
- XML의 `id` = Java 인터페이스의 메서드명과 1:1 매칭

| XML `id`   | Java 메서드              | 동작          |
| ---------- | ------------------------ | ------------- |
| `findAll`  | `List<User> findAll()`   | 전체 조회     |
| `findById` | `User findById(int id)`  | id로 1건 조회 |
| `insert`   | `int insert(User user)`  | 추가          |
| `update`   | `void update(User user)` | 수정          |
| `delete`   | `void delete(int id)`    | 삭제          |

**핵심 요약**: `application.properties`는 "어디에 접속하고, SQL은 어디서 찾아라"는 연결 설정이고, `UserRepository.xml`은 실제 실행될 SQL 쿼리 모음. MyBatis가 이 둘을 보고 Java 메서드 호출을 DB 쿼리로 변환한다.

---

## 3. DTO를 래퍼로 감싸는 패턴 (ApiResponse)

### 배경

"DTO를 entity로 한 번 더 감싸야 한다"는 말은 **API 공통 응답 래퍼(Response Wrapper)** 패턴을 말하는 것. 이름은 보통 `ApiResponse` 또는 `CommonResponse`.

### 현재 구조 vs 래퍼 적용 후

**현재** — body에 데이터만 반환

```json
{ "id": 1, "userId": "hong", "username": "홍길동" }
```

**래퍼 적용 후** — 공통 메타 정보 포함

```json
{
  "success": true,
  "message": "조회 성공",
  "data": { "id": 1, "userId": "hong", "username": "홍길동" }
}
```

### 언제 필요한가

- 클라이언트가 항상 같은 형태의 응답을 기대할 때
- 에러와 성공을 일관된 구조로 처리하고 싶을 때
- 페이지네이션 정보(`totalCount`, `page` 등)를 함께 내려줄 때

### 결론

실습 수준(MyBatis + Spring 연동 학습)에서는 필수가 아님. 실무나 팀 프로젝트 단계에서 도입하는 것이 자연스러운 흐름.

---

## 4. 없는 id 조회 시 500 → 404로 바꾸기

### 원인 분석

```java
// UserService.java
public UserResponseDto getUserById(int id) {
    return UserResponseDto.of(repository.findById(id));  // 문제 지점
}
```

흐름:

```
findById(999) → DB에 없음 → MyBatis가 null 반환
                                    ↓
               UserResponseDto.of(null) → null.getId() → NullPointerException
                                    ↓
                              Spring → 500
```

### 직접 수정 시도 — 문제점 두 가지

```java
public UserResponseDto getUserById(int id) {
    User user = repository.findById(id);
    if (user == null) throw new RuntimeException();       // ① 여전히 500
    return UserResponseDto.of(repository.findById(id));  // ② DB를 두 번 조회
}
```

**문제 1**: `RuntimeException`은 Spring이 500으로 처리함. 404를 내려면 `ResponseStatusException` 사용 필요.

**문제 2**: `user` 변수에 이미 담아뒀는데 마지막 줄에서 DB를 한 번 더 조회하는 낭비.

### 올바른 수정

```java
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

public UserResponseDto getUserById(int id) {
    User user = repository.findById(id);
    if (user == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    return UserResponseDto.of(user);  // 이미 조회한 user 재사용
}
```

---

## 5. resultType="User" 단축 표기

### 배경

XML에서 `resultType`을 전체 패키지명 없이 클래스명만 쓸 수 있는 이유:

```properties
mybatis.type-aliases-package=org.example.usertest.model
```

이 설정이 "해당 패키지의 클래스는 클래스명만으로 참조할 수 있게 해줘"라는 의미.

```xml
<!-- 아래 둘은 완전히 동일 -->
resultType="org.example.usertest.model.User"
resultType="User"
```

---

## 6. User 모델 필드 추가 후 테스트 실패

### 에러 메시지

```
Constructor auto-mapping of 'public org.example.usertest.model.User(int,String,String,String,int,String)'
failed. The constructor takes '6' arguments, but there are only '4' columns in the result set.
```

### 원인

`User.java`에 `age`, `dept` 필드가 추가되어 생성자가 6개 인자를 요구하는데, SQL은 여전히 4개 컬럼만 조회하고 있었음.

```java
// User.java — 6개 필드
private int id;
private String userId;
private String username;
private String email;
private int age;      // 추가됨
private String dept;  // 추가됨
```

```xml
<!-- 수정 전 — 4개만 조회 -->
<sql id="userColumns">id, userId, username, email</sql>

<!-- 수정 후 — 6개 조회 -->
<sql id="userColumns">id, userId, username, email, age, dept</sql>
```

### `<sql>` 태그의 장점

`<sql id="userColumns">`로 컬럼 목록을 한 곳에 정의하면, `findAll` / `findAllByDept` / `findAllByDeptDynamic` 등 모든 쿼리가 `<include refid="userColumns" />`로 참조하므로 한 줄 수정으로 전체 반영 가능.

단, `@Select` 어노테이션처럼 XML 밖에 직접 쓴 쿼리는 이 혜택을 받지 못해 별도로 수정해야 함.

---

## 7. 개발자가 반드시 처리해야 할 HTTP 상태 코드

### 판단 기준

> "클라이언트가 이 에러를 받았을 때, 뭘 해야 할지 알 수 있나?"

클라이언트가 다르게 반응해야 하는 상황이면 구분해서 던져줄 이유가 있다.

### 우선순위 높은 상태 코드

| 상태 코드            | 상황                        | 예시                          |
| -------------------- | --------------------------- | ----------------------------- |
| **404** Not Found    | 없는 리소스 조회            | 없는 id로 `GET /users/999`    |
| **400** Bad Request  | 클라이언트가 잘못된 값 전송 | 필수 필드 누락, 타입 불일치   |
| **401** Unauthorized | 인증 안 된 요청             | 로그인 안 한 상태로 접근      |
| **403** Forbidden    | 인증은 됐는데 권한 없음     | 남의 계정 정보 수정 시도      |
| **409** Conflict     | 중복 데이터 충돌            | 이미 존재하는 `userId`로 가입 |

### 현재 프로젝트 기준 우선순위

1. **404** — 없는 id 조회/수정/삭제
2. **409** — 중복 userId로 가입
3. **400** — 잘못된 입력값
4. 401/403은 인증/권한 기능이 없으므로 나중에 추가

---

## 8. @PathVariable required=false가 동작하지 않는 이유

### 문제 상황

```java
@GetMapping("/users/dept/{dept}")
public List<UserResponseDto> getAllUsersByDept(
    @PathVariable(required = false) String dept
) { ... }
```

`/users/dept`로 요청하면 `required` 설정과 무관하게 에러 발생.

### 원인

URL 경로 자체가 `/users/dept/{dept}`로 고정되어 있으므로, `{dept}` 없이 `/users/dept`만 요청하면 Spring이 이 핸들러를 **매칭조차 하지 못함**. `required=false`는 매칭 이후의 처리 옵션이라 매칭 전 단계에서는 무의미.

### 해결 방법

**방법 1 — `@RequestParam`으로 변경** (권장, REST 설계에 적합)

```java
// GET /users/dept?dept=HR  → dept 있음
// GET /users/dept           → dept 없음 (null)
@GetMapping("/users/dept")
public List<UserResponseDto> getAllUsersByDept(
    @RequestParam(required = false) String dept
) {
    return service.getAllUsersByDept(dept);
}
```

**방법 2 — 엔드포인트 두 개 동시 매핑**

```java
@GetMapping({"/users/dept", "/users/dept/{dept}"})
public List<UserResponseDto> getAllUsersByDept(
    @PathVariable(required = false) String dept
) {
    return service.getAllUsersByDept(dept);
}
```

경로를 두 개 매핑하면 `{dept}` 없어도 매칭되어 `required=false`가 실제로 동작함.
