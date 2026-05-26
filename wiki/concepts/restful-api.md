---
type: concept
tags: [web, http, rest, api]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# RESTful API

## 한 줄 정의

**HTTP의 본래 의미(메서드·URI·상태 코드)에 충실하게 설계한 웹 API.**
"무엇(리소스)"은 URI에, "어떻게(동작)"는 HTTP 메서드에 담는다.

## REST의 핵심 규칙

### 1. URI는 **명사**여야 한다

리소스(자원)는 명사다. URI에 동사를 넣지 않는다.

```
✅  GET   /api/users         ← "사용자들이라는 리소스를 조회"
✅  GET   /api/users/42      ← "42번 사용자 리소스를 조회"

❌  GET   /api/getUsers      ← 동사 들어감
❌  POST  /api/createUser    ← 동사 들어감
❌  GET   /api?type=users    ← URI가 명사로 끝나지 않음
```

동사(=동작)는 **HTTP 메서드**가 표현한다. URI는 "**무엇**"만 가리키면 된다.

### 2. HTTP 메서드로 동작을 구분

| 메서드   | 의미 (관습)             | 멱등성 | 예시                          |
| -------- | ----------------------- | ------ | ----------------------------- |
| `GET`    | 조회                    | O      | `GET /api/posts/1`            |
| `POST`   | 생성                    | X      | `POST /api/posts`             |
| `PUT`    | **전체 교체** 또는 생성 | O      | `PUT /api/posts/1`            |
| `PATCH`  | **부분 수정**           | X (보통) | `PATCH /api/posts/1`        |
| `DELETE` | 삭제                    | O      | `DELETE /api/posts/1`         |

> 멱등성: 같은 요청을 여러 번 보내도 결과가 같음. 네트워크 재시도 안전성과 직결.

### 3. HTTP 상태 코드로 결과를 알린다

| 코드          | 의미                                 |
| ------------- | ------------------------------------ |
| `200 OK`      | 성공 (GET·PUT·DELETE)                |
| `201 Created` | 생성 성공 (POST)                     |
| `204 No Content` | 성공했고 응답 본문 없음           |
| `400 Bad Request` | 클라이언트 입력 오류             |
| `404 Not Found` | 리소스 없음                        |
| `406 Not Acceptable` | 클라이언트가 원한 형식을 못 줌 → [[content-negotiation]] |
| `500 Internal Server Error` | 서버 오류             |

→ Spring에서 적극적으로 던지는 법, 401/403 구분 등 자세한 내용은 [[http-status-codes]].

## 강의 실습 — 미니 SNS API 명세

| 기능              | 메서드 | URI                  |
| ----------------- | ------ | -------------------- |
| 전체 글 조회      | GET    | `/api/posts`         |
| 글 등록           | POST   | `/api/posts`         |
| 상세 조회         | GET    | `/api/posts/{id}`    |
| 글 수정 (본문)    | PATCH  | `/api/posts/{id}`    |
| 좋아요 +1         | PUT    | `/api/posts/{id}`    |
| 글 삭제           | DELETE | `/api/posts/{id}`    |

같은 `/api/posts/{id}` URI를 GET·PATCH·PUT·DELETE 4가지 메서드로 재사용 → URI는 "무엇"만, 동작은 메서드가 결정.

## Spring에서의 매핑

```java
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @GetMapping                       // GET /api/posts
    public List<Post> all() { ... }

    @GetMapping("/{id}")              // GET /api/posts/{id}
    public Post detail(@PathVariable Long id) { ... }

    @PostMapping                      // POST /api/posts
    public Post create(@RequestBody PostCreateRequestDto dto) { ... }

    @PatchMapping("/{id}")            // PATCH /api/posts/{id}
    public Post update(...) { ... }

    @DeleteMapping("/{id}")           // DELETE /api/posts/{id}
    public void delete(@PathVariable Long id) { ... }
}
```

`@RestController`는 `@Controller + @ResponseBody`. 반환값이 View가 아니라 **JSON으로 바로 직렬화**되는 API 전용 컨트롤러.

## 추상화 단계로 본 REST와 Servlet/JSP

| Servlet/JSP 시대          | REST API 시대                     |
| ------------------------- | --------------------------------- |
| 페이지(HTML) 단위 응답    | 리소스(JSON/XML) 단위 응답        |
| `forward`로 JSP에 데이터  | DTO를 직렬화해 본문에 직접        |
| URL = 페이지 이름         | URL = 리소스 식별자               |
| `@Controller` + View      | `@RestController`                 |

[[servlet-to-spring-mvc]]의 다리에서 한 발 더 들어간 지점이 REST API다.

## REST의 "그 이상" — 6원칙

엄밀한 REST(Roy Fielding 박사)는 6가지 제약을 제시하지만, 실무에선 보통 위 1·2·3 정도를 RESTful이라 부른다. HATEOAS·균일 인터페이스·캐시 가능성은 학습 단계에선 생략.

## 관련 페이지

- [[http-status-codes]] — 응답 상태 코드 적극 활용·Spring에서 던지는 법
- [[api-response-wrapper]] — REST 응답 본문을 공통 구조로 감싸는 패턴
- [[content-negotiation]] — 응답 형식(JSON/XML)을 클라이언트가 고르는 메커니즘
- [[http-method-override]] — 제한 환경에서 메서드를 우회하는 방법
- [[etag]] — REST 응답에 캐싱·동시성 제어를 더하는 헤더
- [[swagger-oas]] — REST API 문서화 표준
- [[dto-vs-entity]] — REST 응답에서 노출하는 형태
- 출처: [[spring-framework-1-note]]
