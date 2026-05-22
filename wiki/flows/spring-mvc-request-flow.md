---
type: flow
tags: [spring, mvc, web, request-flow]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# 흐름: Spring MVC 요청 풀 파이프라인

> 한 요청이 브라우저를 떠나 다시 브라우저로 돌아오기까지 — Spring MVC가 어떤 부품을 거치는지 한 곳에 모은 흐름.
> 부품별 본문은 각 페이지로 분기.

## 한 그림

```
[브라우저]
   │ POST /posts  {title, body}
   ▼
[ Tomcat / 서블릿 컨테이너 ]              ← 스프링 영역 밖
   │ TCP 수락 · HTTP 파싱
   ▼
[ 🛡️ Filter Chain ]                      ← [[filter]]
   │ 인코딩 · CORS · XSS · MethodOverride
   ▼
[ 🎯 DispatcherServlet ]                  ← [[dispatcher-servlet]] (Front Controller)
   │
   │ ① HandlerMapping        : URL → Handler 결정
   │ ② HandlerAdapter        : 호출 방식 결정
   │
   ├──▶ Interceptor.preHandle  ← [[interceptor]] (인증·권한)
   │
   ▼
[ @Controller ]                           ← Web Layer
   │ DTO 바인딩 → 흐름 조립
   ▼
[ @Service ]                              ← Business Layer
   │ DTO → Entity 변환 · 도메인 규칙 적용
   │ @Transactional 경계
   ▼
[ @Repository / DAO ]                     ← Data Layer
   │ SQL / JPQL 실행
   ▼
[ Database ]
   │ 결과
   ▲
   │ Entity 반환
   ▲
   │ Entity → DTO 변환 (Service 또는 Controller에서)
   ▲
[ @ResponseBody면 ─▶ HttpMessageConverter (Jackson) → JSON ]
[ 일반 View면     ─▶ ③ ViewResolver → JSP/Thymeleaf 렌더 ]
   │
   ├──▶ Interceptor.postHandle · afterCompletion
   │
   ▲
[ Filter 역순 ]   (응답 압축 · 로깅)
   ▲
[브라우저]
```

## 7개 정거장 — 각자의 책임

| 정거장 | 영역 | 책임 | 본문 |
| --- | --- | --- | --- |
| **Filter** | 서블릿 (스프링 밖) | HTTP 자체 가공 (인코딩·CORS·메서드 오버라이드) | [[filter]] |
| **DispatcherServlet** | 스프링 진입점 | 모든 요청을 받아 4부품에 위임 | [[dispatcher-servlet]] |
| **Interceptor** | 스프링 MVC | 컨트롤러 호출 전/후 가로채기 (인증·권한·로깅) | [[interceptor]] |
| **@Controller** | Web Layer | HTTP 입출력 조립, 흐름 제어 | [[mvc-pattern]] |
| **@Service** | Business Layer | 비즈니스 로직, 트랜잭션, Entity 활용 | [[three-tier-architecture]] |
| **@Repository / DAO** | Data Layer | SQL 실행, 결과를 Entity로 매핑 | [[dao-pattern]] |
| **View / Converter** | 응답 변환 | 객체 → HTML 또는 객체 → JSON | [[content-negotiation]] |

## 한 요청을 따라가기 — "POST /posts" 시나리오

영균의 미니 SNS 글 작성 요청을 끝까지 따라가본다.

| # | 정거장 | 일어나는 일 |
| --- | --- | --- |
| ① | Tomcat | TCP 수락, HTTP 파싱, `HttpServletRequest` 생성 |
| ② | Filter | `CharacterEncodingFilter`가 UTF-8 강제, CORS Origin 검사 |
| ③ | DispatcherServlet | HandlerMapping이 "POST /posts → `PostController.create()`" 결정 |
| ④ | Interceptor.preHandle | 로그인 세션 검사 — 없으면 401, 있으면 통과 |
| ⑤ | HandlerAdapter | Jackson이 요청 본문 JSON → `PostCreateRequestDto`로 역직렬화 |
| ⑥ | @Controller | `postService.create(dto, loginUser)` 호출 |
| ⑦ | @Service | DTO → Entity(`new Post(...)`) 변환, 도메인 규칙 적용, `repository.save(post)` 호출 (`@Transactional` 경계) |
| ⑧ | @Repository | INSERT SQL 실행 (JPA면 `persist`, JdbcTemplate면 `update`) |
| ⑨ | @Service | 저장된 Entity → `PostResponseDto` 변환 (민감 필드 차단) |
| ⑩ | HttpMessageConverter | `@ResponseBody`라 ViewResolver 건너뜀 → Jackson이 DTO → JSON |
| ⑪ | Interceptor | `postHandle` → `afterCompletion` (감사 로그, 성능 측정) |
| ⑫ | Filter 역순 | gzip 압축, 응답 로깅 → 브라우저 |

## 데이터 객체의 이동 — DTO와 Entity가 어디서 등장하나

이 흐름의 핵심 통찰: **DTO는 양 끝(요청·응답)에서만 등장하고, 중심은 Entity가 차지한다.**

```
[Client]  ── DTO ──▶  [@Controller]  ── DTO ──▶  [@Service]
                                                    │
                                                    │ DTO → Entity 변환
                                                    ▼
[Client]  ◀── DTO ──  [@Service]  ◀── Entity ──  [@Repository]  ◀── DB
            ▲                          ▲
            │                          │
       응답용 DTO로                 ResultSet에서
       다시 변환                    Entity로 채움
```

- **DTO**: 경계의 계약 ([[dto-vs-entity]]) — 유스케이스마다 다른 모양
- **Entity**: 도메인 본체 ([[domain]]) — 시스템 내부에서만 살아남
- **DAO**: 객체가 아니라 **행동** — Entity ↔ DB 매핑을 수행

## 왜 이렇게 많은 정거장을 두었나

각 정거장은 **서로 다른 분리축**의 산물이다.

| 분리축 | 부품 | 분리 이유 |
| --- | --- | --- |
| 가로채기 위치 | Filter / Interceptor | 다룰 정보의 깊이가 다름 |
| 표현 분리 (MVC) | Controller / Model / View | 화면 변경과 로직 변경 격리 |
| 시스템 계층 (3-tier) | Web / Service / Data | 각 계층 책임 좁히기 |
| 객체 책임 | DTO / Entity (/ DAO) | 도메인 변경이 클라이언트로 새지 않게 |

→ 이 네 축이 **같은 한 줄을 따라 동시에 적용**되는 것이 Spring MVC의 본질.

## 영균 학습 맥락

- **언제 이 페이지를 펴나** — 디버깅 중 "지금 요청이 어디쯤 있을까?"를 묻는 순간.
  Spring은 부품이 많아 길을 잃기 쉽다. 이 한 그림이 좌표가 된다.
- **자연스러운 다음 단계** — [[dispatcher-servlet]] 내부 4부품 깊게 보기 →
  [[filter-vs-interceptor]] 비교 → 본격 핸들러/매핑 어노테이션 학습.

## 관련 페이지

- 부품: [[filter]] · [[dispatcher-servlet]] · [[interceptor]] · [[mvc-pattern]] · [[dao-pattern]]
- 배경: [[three-tier-architecture]] · [[dto-vs-entity]] · [[domain]]
- 다리: [[servlet-to-spring-mvc]] · [[filter-vs-interceptor]]
- 토대: [[servlet]] · [[servlet-container]]
- 출처: [[spring-framework-1-note]]
