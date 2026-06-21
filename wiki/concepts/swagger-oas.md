---
type: concept
tags: [web, api, rest, tooling]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Swagger & OAS (OpenAPI Specification)

## 한 줄 정의

**REST API의 명세를 표준 형식으로 적고, 그것을 자동으로 문서·테스트 UI로 보여주는 도구.**
"OAS는 표준(스펙)이고, Swagger는 그 표준을 다루는 도구 세트."

## 둘의 관계

```
OAS (OpenAPI Specification)
  └── API 명세를 적는 표준 (YAML 또는 JSON 형식)

Swagger
  ├── Swagger UI       ← OAS 파일을 읽어 웹 페이지로 보여줌
  ├── Swagger Editor   ← OAS 파일 작성 도구
  └── Swagger Codegen  ← OAS로부터 클라이언트 SDK 자동 생성
```

원래 둘 다 "Swagger"로 불렸으나, 2016년 SmartBear가 명세 부분을 Linux Foundation에 기증하며 이름이 **OpenAPI Specification(OAS)**으로 분리됐다. 도구는 **Swagger**라는 이름을 유지.

## 왜 필요한가 — 기존 방식의 고통

부트캠프 팀 프로젝트에서 자주 만나는 상황:

```
백엔드 개발자가 노션에 "URL: /api/posts, METHOD: POST, BODY: {...}"를 적어
프론트엔드 개발자에게 카톡으로 전달
   ↓
다음 날 API가 바뀜
   ↓
노션 업데이트를 깜빡함
   ↓
프론트가 옛 명세대로 호출 → 깨짐 → 책임 공방
```

문제점:
- 문서와 코드가 따로 논다 (코드 바뀌어도 문서는 안 바뀜).
- 매번 Postman/cURL로 직접 테스트해 보여줘야 한다.
- 명세 형식이 사람마다 달라서 의사소통 비용이 크다.

## OAS의 이점

1. **표준화된 명세** — JSON/YAML 형식이 정해져 있어 누가 쓰든 동일하게 읽힌다.
2. **자동 문서화** — 코드에 어노테이션을 달아두면 빌드 시점에 명세가 생성된다.
3. **자동 테스트 UI** — Swagger UI가 명세를 읽어 "Try it out" 버튼이 달린 페이지를 자동 생성. Postman 없이 브라우저에서 API를 즉시 호출.
4. **클라이언트 코드 자동 생성** — 동일한 명세로 TypeScript·Kotlin·Python 클라이언트 SDK를 뽑을 수 있다.

## Spring Boot에서 적용

가장 흔한 방법: **`springdoc-openapi`** 의존성 추가.

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.x</version>
</dependency>
```

추가하고 앱을 실행하면 바로:

```
http://localhost:8080/swagger-ui/index.html
```

이 페이지에서 모든 `@RestController`의 엔드포인트가 자동으로 나열되고, 각 엔드포인트를 펼쳐 "Try it out"으로 호출 테스트까지 가능.

> 버전에 따라 URL이 `/swagger-ui.html`(구버전) 또는 `/swagger-ui/index.html`(신버전)일 수 있다. 부트 3.X + springdoc 2.X는 후자.

## 설정 두 가지 방법

| 방법              | 어떻게                                                 | 언제                  |
| ----------------- | ------------------------------------------------------ | --------------------- |
| **소스 코드 + 어노테이션** | `@Operation`·`@Schema`·`@Parameter` 등으로 명세화 | 코드와 문서를 함께 진화시키고 싶을 때 (가장 흔함) |
| **YAML 파일**     | 별도 OAS 명세 파일을 작성·관리                         | "문서 우선 설계"(API-first)를 할 때 |

부트캠프 초반엔 어노테이션 방식이 빠른 진입점.

## 어노테이션 예시

```java
@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "게시글 API")
public class PostController {

    @Operation(summary = "게시글 상세 조회", description = "ID로 게시글을 가져온다")
    @GetMapping("/{id}")
    public PostDetailResponseDto detail(@PathVariable Long id) { ... }
}
```

`@Tag`·`@Operation`만 있어도 Swagger UI가 깔끔하게 보여준다. 더 정확한 명세를 위해 `@Schema`(DTO 필드)·`@ApiResponse`(응답 코드)를 추가.

## Spring Security와 함께 쓸 때

### Swagger 경로 허용

Spring Security를 쓰면 Swagger 관련 경로도 보안 필터를 통과하므로, `SecurityConfig`에 명시적으로 허용해야 한다.

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/swagger-ui.html"
    ).permitAll()
    .anyRequest().authenticated()
)
```

### JWT Bearer Auth 버튼 추가

Swagger UI에 "Authorize" 버튼을 띄워 JWT를 직접 입력하고 인증된 요청을 테스트하려면 `OpenAPI` 빈에 `SecurityScheme`을 등록한다.

```java
@Bean
public OpenAPI openAPI() {
    return new OpenAPI()
        .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
        .components(new Components()
            .addSecuritySchemes("BearerAuth", new SecurityScheme()
                .name("BearerAuth")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
            )
        );
}
```

- Swagger UI의 "Authorize" 버튼에는 **Access Token만** 입력한다 (Refresh Token은 해당 없음)
- bearer auth로 설정하면 보통 토큰 문자열만 넣으면 되고, UI가 직접 요구하면 `Bearer {token}` 형식으로 입력

### JWT 필터에서 Swagger 제외 (선택)

`OncePerRequestFilter`의 `shouldNotFilter()`로 Swagger 경로를 JWT 필터 자체에서 제외할 수도 있다.

```java
@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs");
}
```

→ `permitAll()`과 `shouldNotFilter()`는 역할이 다름: `permitAll()`은 인가(권한 검사) 우회, `shouldNotFilter()`는 해당 필터 실행 자체를 건너뜀.

## 함정

- **패키지 스캔 범위가 좁으면 엔드포인트가 안 보임** — `@SpringBootApplication`이 있는 패키지보다 위에 컨트롤러를 두면 자동 스캔이 안 잡힌다.
- **운영 환경 노출 위험** — Swagger UI는 모든 API를 노출하므로, 운영 환경에선 인증을 걸거나 프로파일로 끈다 (`springdoc.swagger-ui.enabled=false`).
- **빈 화면** — JWT 필터에서 `filterChain.doFilter` 누락 시 Swagger 정적 리소스가 응답되지 않아 빈 화면 표시. → [[once-per-request-filter]]

## 영균 학습 트리에서

- [[restful-api]]를 표준 형식으로 문서화 → 팀 프로젝트의 의사소통 비용 절감.
- Postman 대용으로 빠른 수동 테스트가 가능 → 개발 사이클 단축.
- "코드에서 자동 생성되는 문서"는 영균이 만들고 싶은 **AI 색인 도구**의 한 사례 — 사람이 손으로 동기화하지 않는 자기 갱신 자산.

## 관련 페이지

- [[restful-api]] — Swagger가 문서화하는 대상
- [[content-negotiation]]·[[http-method-override]]·[[etag]] — 같은 HTTP 부가 기능 묶음
- 출처: [[spring-framework-1-note]]
