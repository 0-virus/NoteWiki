---
type: concept
tags: [web, http, spring, rest]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Content Negotiation (콘텐츠 협상)

## 한 줄 정의

**클라이언트가 "이런 형식으로 받고 싶다"고 신호하면, 서버가 그에 맞는 형식을 골라 응답하는 HTTP의 약속.**
같은 리소스를 JSON·XML·HTML 등 여러 형식으로 제공할 수 있게 한다.

## 두 헤더

| 헤더             | 방향 | 의미                              |
| ---------------- | ---- | --------------------------------- |
| `Accept`         | 요청 | "이 형식들 중 하나로 줘"          |
| `Content-Type`   | 요청·응답 | "내가 보내는/받는 본문 형식은 이것" |

```http
GET /api/users/1 HTTP/1.1
Accept: application/json     ← "JSON으로 줘"

POST /api/users HTTP/1.1
Content-Type: application/xml   ← "본문은 XML이야"
Accept: application/json        ← "응답은 JSON으로 줘"
```

서버가 클라이언트가 원한 형식을 줄 수 없으면 → **`406 Not Acceptable`**.

## 왜 이런 게 필요한가

- **다양한 클라이언트** — 모바일은 JSON, 레거시 시스템은 XML, 브라우저는 HTML.
- **API 확장성** — 새 형식(YAML·Protobuf 등)을 추가해도 기존 클라이언트 영향 없음.
- **단일 엔드포인트 재사용** — 같은 URI(`/api/users/1`)가 클라이언트 선택에 따라 다른 형식으로 응답.

## Spring Boot에서 — 거의 자동

Spring MVC는 Content Negotiation을 **기본 자동 처리**한다. 핵심 부품은 `HttpMessageConverter`.

```
요청 도착 → DispatcherServlet → @RequestBody DTO ← MessageConverter가 역직렬화
응답 객체 → MessageConverter가 직렬화 → 본문 출력
```

기본으로 들어있는 컨버터:
- `MappingJackson2HttpMessageConverter` ← JSON (Jackson)
- `StringHttpMessageConverter` ← 단순 텍스트
- `Jackson2XmlHttpMessageConverter` ← XML (의존성 추가 필요)

### JSON 응답 (기본값)

`@RestController`의 메서드가 객체를 반환하면 — `Accept: application/json`이 기본 적용되어 JSON으로 응답.

### XML 응답을 추가하려면

1. **의존성 추가** (`pom.xml`):
   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.dataformat</groupId>
       <artifactId>jackson-dataformat-xml</artifactId>
   </dependency>
   ```

2. **모델 클래스에 `@JacksonXmlRootElement`** (선택, 루트 태그 이름 지정용).

3. **컨트롤러에서 produces 지정** (필요 시):
   ```java
   @GetMapping(produces = MediaType.APPLICATION_XML_VALUE)
   public List<Member> getAllMembers() { ... }
   ```

위 셋이 갖춰지면 — 클라이언트가 `Accept: application/xml`을 보내면 XML, `application/json`이면 JSON으로 응답한다 (같은 메서드, 같은 코드).

## 실수 모음

- **`Accept` 헤더를 안 보냄** → 서버 기본값(보통 JSON)으로 응답 → "내가 XML 원했는데 왜 JSON이 와?" 디버깅 함정.
- **`produces`를 너무 좁게 지정** → 다른 Accept 요청이 `406`으로 거부됨. 보통은 `produces`를 비워두고 자동 선택에 맡기는 게 유연.
- **`Content-Type`과 `Accept`를 혼동** — Content-Type은 "내가 **보내는** 본문 형식", Accept는 "내가 **받고 싶은** 형식".

## 영균 학습 트리에서

- [[servlet]] 시절에는 `response.setContentType("application/json")`을 손으로 하고 `PrintWriter`로 JSON 문자열을 직접 만들었다.
- Spring에선 컨버터가 자동으로 한다 — DTO 객체를 그냥 `return`하면 알아서 직렬화.
- 그 자동화의 이름이 **Content Negotiation + HttpMessageConverter**.

## 관련 페이지

- [[restful-api]] — Content Negotiation이 빛나는 무대
- [[dto-vs-entity]] — 직렬화 대상이 되는 객체
- [[etag]]·[[http-method-override]] — 같이 묶이는 HTTP 부가 기능들
- 출처: [[spring-framework-1-note]]
