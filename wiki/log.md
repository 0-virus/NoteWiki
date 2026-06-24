# Wiki Log

> 시간순 작업 기록. **Append-only** — 기존 항목은 수정하지 않는다.
> 형식: `## [YYYY-MM-DD] <ingest|query|lint> | <제목>`
> 최근 활동 확인: `grep "^## \[" log.md | tail -5`

## [2026-05-18] init | 위키 초기화

LLM Wiki 패턴으로 NoteWiki 세컨드 브레인 세팅 완료.

- 폴더 구조 생성: `raw/`(articles, lectures, practice, notes, assets), `wiki/`(concepts, flows, sources), `Output/`
- 루트 `CLAUDE.md`에 위키 운영 규칙(3계층, 3대 작업) 추가
- 각 폴더에 하위 `CLAUDE.md` 생성
- `wiki/index.md`, `wiki/log.md` 초기화
- 다음 단계: `raw/`에 첫 원본을 넣고 ingest.

## [2026-05-18] setup | Web Clipper 템플릿 5종 추가

Obsidian Web Clipper 템플릿을 소스 유형별로 생성, `raw/` 클리핑 폴더 확장.

- 템플릿 위치: `etc/clipper-template/` (clipper-article.json, clipper-youtube.json, clipper-podcast.json, clipper-book.json, clipper-research.json)
- 폴더 추가: `raw/youtube`, `raw/podcasts`, `raw/books`, `raw/research`
- 클리핑 원본 frontmatter 스키마 확정 (`source_type` 등) → `raw/CLAUDE.md`에 문서화
- 본문에 `## 💭 내 메모` 섹션 포함 — 인제스트 시 우선 반영.

## [2026-05-18] ingest | raw/notes 5건 일괄 인제스트

`raw/notes/`의 미처리 필기 5건(노션 이전분)을 위키에 반영. 대화 없이 일괄 처리.

- 원본: CSS 참조 우선순위 / JavaScript Import·export / Node.js node_modules / Prisma 필기 / 비동기의 모든 것
- 생성: 소스 페이지 5, 개념 페이지 12, 흐름 페이지 3 (총 20 페이지)
- 개념: css-specificity, css-modules, es-modules, node-modules, npm-dependency-files,
  orm, prisma, n-plus-1-problem, javascript-async, callback, promise, async-await
- 흐름: js-async-evolution, npm-install-flow, prisma-workflow
- 교차 링크: 동적 `import()` ↔ promise, css-modules ↔ es-modules, orm ↔ prisma ↔ n+1 등
- `index.md` 갱신 완료.

## [2026-05-18] ingest | 옵시디언 기초 강의 (YouTube)

`raw/youtube/옵시디언 쌩 기초는 탄탄하게…` (브레인 트리니티, 약 2시간 20분) 인제스트.

- 인터뷰: ①옵시디언 입문 위해 캡처 ②NoteWiki 폴더를 옵시디언으로 관리하려고 ③그래프 뷰·웹 클리퍼 활용 목표
- 생성: 소스 페이지 1, 개념 페이지 6 (obsidian, wikilink, graph-view, obsidian-tags, obsidian-properties, web-clipper)
- 도구 자체에 대한 메타 지식 — 각 페이지를 NoteWiki 운영(Vault·속성·클리퍼 템플릿)과 연결.
- `index.md`에 "도구/지식관리" 카테고리 신설, 통계 갱신 (개념 18 / 소스 6).

## [2026-05-19] lint | 위키 건강 점검

위키 27개 페이지 + index + log 점검.

- 깨진 링크 0 · 고아 페이지 0 · index 불일치 0 · 모순 0 — 링크 구조 양호.
- 누락 개념 발견: **markdown** — obsidian·obsidian-properties·obsidian-basics-video에서
  반복 언급되나 독립 페이지 없음 → `concepts/markdown.md` 신설.
- 누락 상호참조 보강: es-modules → css-modules (역방향 링크 추가, graphify가 surfaced).
- markdown 백링크 추가: obsidian, obsidian-properties, obsidian-basics-video.
- `index.md` 갱신 (개념 18→19, 카테고리명 정리).

## [2026-05-19] ingest | Servlet과 JSP의 차이 및 활용 (Claude 대화)

`raw/dialogues/Servlet과 JSP의 차이 및 활용.md` (18메시지) 인제스트.

- 인터뷰: ①Spring 진입 전 기초 다지기 ②현재 Tomcat 실습 중 ③Spring 연결 흐름 정리가 목표.
- 생성: 소스 페이지 1, 개념 페이지 9, 흐름 페이지 1 (총 11 페이지)
- 개념: servlet, jsp, servlet-container, servlet-lifecycle, mvc-pattern,
  forward-vs-redirect, prg-pattern, concurrency-problem, spring-bean
- 흐름: servlet-to-spring-mvc — 영균의 목표(Spring 연결 흐름 정리)에 직접 대응,
  Servlet/JSP 장치 → Spring MVC 추상화 대응표 수록.
- 핵심 교차 연결: servlet-lifecycle(싱글톤) ↔ concurrency-problem ↔ spring-bean,
  concurrency-problem이 Servlet 동시성 ↔ DB 트랜잭션 격리 수준을 한 페이지에서 연결.
- `index.md`에 "Java / 웹 (Servlet·Spring)" 카테고리 신설, 통계 갱신 (개념 19→28, 흐름 3→4, 소스 6→7).

## [2026-05-19] query | servlet과 jsp가 뭔데?

[[servlet]]·[[jsp]]·[[mvc-pattern]] 기반 답변. Servlet=Java 안에 HTML, JSP=HTML 안에 Java,
핵심 원리는 "JSP는 결국 Servlet"과 MVC 역할 분리. 기존 페이지 요약 수준이라 환류 없음.

## [2026-05-19] ingest | Servlet+JDBC 실습 디버깅 (Claude 대화)

`raw/dialogues/conversation.md` — `jwbook` 부트캠프 프로젝트(ch05·ch06) 디버깅 17건 인제스트.

- 인터뷰: ①Servlet+JDBC 흐름 복습 ②Spring 진입 직전 ③개념 페이지 보강이 목표.
- 생성: 소스 페이지 1, 개념 페이지 3 (총 4 페이지)
- 신규 개념: jdbc, dao-pattern, jstl-el — [[servlet-jsp-dialogue]]가 잡은 개념의
  실습 단계 확장 가지.
- 갱신: jsp(EL/JSTL 가지 추가), mvc-pattern(Controller 아래 DAO 계층 추가),
  servlet-to-spring-mvc(추상화 대응표에 DAO·JDBC 2행 추가).
- 소스 페이지에 "자주 한 실수" 체크리스트 11항 수록 — 영균의 복습 목표에 직접 대응
  (NPE·EL 미동작·커넥션 누수·forward 누락·ClassCastException·contextPath 404 등).
- `index.md`: 개념 28→31, 소스 7→8, 통합 원본 7→8.

## [2026-05-19] query | 오늘 저장된 내용으로 마크다운 필기 만들기

오늘 인제스트한 페이지([[jdbc]]·[[dao-pattern]]·[[jstl-el]]·[[mvc-pattern]]·[[jsp]]·
[[servlet-jdbc-debugging]])를 종합해 결과물 작성.

- 산출물: `Output/2026-05-19-servlet-jdbc-요청처리-흐름.md`
- Controller→DAO→JSP 한 요청의 전체 흐름 + 계층별 원리 + 자주 한 실수 체크리스트 +
  Spring 대응표로 재구성. 위키 페이지 재구성이라 별도 환류 없음.

## [2026-05-19] ingest | Java 기초 필기 8건 일괄

`raw/notes/`의 미처리 Java 기초 필기 8건(노션 이전분)을 위키에 반영.

- 원본: JVM의 메모리 할당 / static의 개념과 활용 / hashCode와 equals /
  가변 객체 vs 불변 객체 / Java의 버퍼 / Java의 쇼트 서킷 / Functional Interface /
  제네릭·람다·함수형 인터페이스·익명 클래스
- 인터뷰(8건 묶음): ①목적 = 실무 대비 자산 ②WAS 학습의 부속이 아닌
  "독립된 Java 기본기"로 다룬다 → Servlet/WAS로의 강제 링크는 지양, Java 언어
  자체의 가지로 구성. (jvm-memory에만 servlet-lifecycle 싱글톤 연결을 "실무 연결"로 1건 명시.)
- 생성: 소스 페이지 8, 개념 페이지 11, 흐름 페이지 1 (총 20 페이지)
- 개념: jvm-memory, static-keyword, equals-hashcode, mutable-immutable, string-pool,
  java-buffer, short-circuit, generics, functional-interface, lambda, anonymous-class
- 흐름: anonymous-class-to-lambda — 제네릭→함수형 인터페이스→익명 클래스→람다를
  하나의 이야기로 연결.
- 핵심 교차 연결: jvm-memory ↔ static-keyword(같은 예제·this) ↔ mutable-immutable(GC),
  mutable-immutable ↔ string-pool ↔ equals-hashcode(불변·hashCode 안정성 3각),
  generics ↔ functional-interface ↔ lambda ↔ anonymous-class를 흐름 페이지로 묶음.
- `index.md`에 "Java / 언어 기초" 카테고리 신설, 통계 갱신 (개념 31→42, 흐름 4→5,
  소스 8→16, 통합 원본 8→16).

## [2026-05-19] lint | 위키 건강 점검 (2차)

직전 ingest 4건 누적 후 전 63 페이지(개념 42 / 흐름 5 / 소스 16) + index + log 점검.

- 깨진 링크 0 · 고아 페이지 0 · index 통계 불일치 0 · source 경로 매칭 16/16.
- 모순 0 — `⚠️` 4건은 모두 구현 함정 경고(jdbc·jstl-el·jvm-memory·mvc-pattern)이며
  페이지 간 상충 서술 아님.
- 낡은 내용 0 — 전 페이지 `updated` 5/18 또는 5/19, 오늘 기준 stale 없음.
- 인바운드 1개 페이지(java-buffer, short-circuit)는 직전 ingest의 명시 방침
  ("Java 기초를 Servlet/WAS로 강제 연결하지 말 것")에 따른 의도된 상태로 유지.
- 수정 없음. 다음 탐구 후보: Spring 진입 가지(DispatcherServlet·ViewResolver·
  @Repository·JdbcTemplate), Java 표준 라이브러리(Optional·Stream API·Collection·GC),
  웹 일반(HTTP 메서드·세션/쿠키), ORM 다른 진영(JPA/Hibernate).

## [2026-05-19] query | CSS selector — Web Clipper 정밀 추출용

AI 채팅(ChatGPT·Gemini 등)의 클리핑 품질을 높이기 위해 selector 문법을 물음.
대화 기반 환류 — 위키에 selector 자체 페이지가 빠져 있던 자리를 채움.

- 신설: [[css-selector]] — DOM 주소 문법, 안정성 우선순위(`[data-*]` > 의미 태그 >
  손쓴 클래스 > 위치), DevTools로 selector 찾는 법, Web Clipper `{{selectorHtml:...}}` 활용.
- 백링크 보강:
  - [[css-specificity]] — "선택자가 얼마나 구체적인지" 문구를 [[css-selector]]로 링크.
  - [[css-modules]] — 해시된 클래스가 외부 추출을 깨뜨리는 부수효과 단락 추가.
  - [[web-clipper]] — "정밀 추출" 절 신설, `{{selectorHtml:[data-message-author-role]}}` 예시 수록.
- `index.md`: CSS/프론트엔드 카테고리에 [[css-selector]] 추가, 개념 42→43.

## [2026-05-21] ingest | Proxy + Load Balancing 영상 2건 (코딩문)

`raw/youtube/Proxy(프록시)란…` + `raw/youtube/Load Balancing…` (코딩문, 시리즈 2편) 인제스트.

- 인터뷰: ①부트캠프 팀 프로젝트 중 다른 팀 설명에서 만난 용어 ②독립된 "시스템 디자인"
  카테고리로 ③개념 + 실습 가능한 Nginx 설정 예시까지.
- 생성: 소스 페이지 2, 개념 페이지 8, 흐름 페이지 1 (총 11 페이지)
- 개념: proxy, forward-proxy, reverse-proxy, load-balancer, load-balancing-algorithm,
  horizontal-vs-vertical-scaling, high-availability, nginx
- 흐름: [[scaling-a-web-app]] — 단일 [[servlet-container|Tomcat]] → 리버스 프록시 →
  Vertical → Horizontal+LB → 세션 외부화 → LB 다중화. 단계별 SPOF 추적표로 마무리.
- 핵심 교차 연결:
  - [[proxy]] ↔ [[forward-proxy]] ↔ [[reverse-proxy]] — "위치만 다른 한 쌍" 비교표
  - [[load-balancer]] ↔ [[load-balancing-algorithm]] — `upstream` 키워드와 4알고리즘 1:1 매핑
  - [[horizontal-vs-vertical-scaling]] ↔ [[high-availability]] — 수평 확장이 HA를 부수적으로 사줌
  - [[nginx]]에 실습 예시 3종(리버스 프록시 / LB / 정적·동적 분리) + 자주 한 실수 체크리스트
- 학습 트리 연결: [[servlet-container]]에 인프라 확장 가지 백링크 추가
  (강제 연결 X — 영균 본인이 "독립된 시스템 디자인 카테고리"로 가닥 잡음).
- `index.md`: "시스템 디자인 / 인프라" 카테고리 신설, 통계 갱신
  (개념 43→51, 흐름 5→6, 소스 16→18, 통합 원본 16→18).

## [2026-05-21] ingest | Spring Framework-1 부트캠프 강의자료

`raw/notes/Spring Framework.md` (부트캠프 풀스택 양성과정, 강의 PDF 추출, §1~§3) 인제스트.

- 추출 아티팩트: PDF 페이지 단위로 49회 반복 → 1회분(라인 1~640)만 읽으면 전체 내용. 글머리표(`-`/`*`) 차이만 있는 같은 본문.
- 인터뷰: ①Spring 입문 정리 ②곧 시작할 Spring 프로젝트 직전 준비 ③핵심 개념을 페이지로 쪼개기 + REST/HTTP 부가기능 별도 정리 + 실습 코드 흐름은 가볍게.
- 방침: 영균이 선택 — **[[servlet-to-spring-mvc]] 흐름은 손대지 않음**. 그 다리 건너편(Spring 본진)에 잎(개념 페이지)을 매단다.
- 생성: 소스 페이지 1, 개념 페이지 16, 흐름 페이지 1 (총 18 페이지)
- 개념(Spring 코어 9): spring-framework, spring-boot, dependency-injection,
  inversion-of-control, solid-principles, pojo, maven, gradle, + spring-bean 갱신
- 개념(Spring 웹·아키텍처 2): three-tier-architecture, dto-vs-entity
- 개념(Java 언어 1): java-record (JDK 16+ 불변 데이터 클래스)
- 개념(웹/HTTP·REST 5): restful-api, content-negotiation, http-method-override,
  etag, swagger-oas
- 흐름: [[manual-di-to-spring-ioc]] — 직접 `new`(1단계) → setter/생성자 주입(2단계) →
  인터페이스 도입(3단계) → 외부 설정으로 조립(4단계 = IoC 컨테이너). 강의 §2의
  4단계 진화 스토리를 그대로 흐름화 — 영균의 원리 우선 학습과 맞춤.
- 갱신: [[spring-bean]](IoC Container 동작 + 싱글톤 함정 확장), [[mvc-pattern]]
  (3-tier와 다른 축임을 명시), [[mutable-immutable]]·[[equals-hashcode]]·
  [[servlet-container]]에 신규 페이지 백링크 추가.
- 핵심 교차 연결:
  - DI/IoC/Bean/Container 4축이 [[manual-di-to-spring-ioc]] 흐름으로 묶임
  - [[solid-principles]] ↔ [[dependency-injection]](DIP) ↔ [[inversion-of-control]](OCP)
  - [[mvc-pattern]] ↔ [[three-tier-architecture]] — "다른 축" 명시로 영균 혼동 차단
  - [[java-record]] ↔ [[mutable-immutable]] ↔ [[dto-vs-entity]] — 불변·DTO 3각
  - [[etag]] ↔ [[equals-hashcode]] — hashCode 활용의 실무 사례
  - [[spring-boot]] ↔ [[servlet-container]] — 내장 Tomcat 연결, [[scaling-a-web-app]]과 자연스럽게 이어짐
- 카테고리 신설: "Spring / 코어", "Spring / 웹·아키텍처", "웹 / HTTP·REST".
- `index.md`: 통계 갱신 (개념 51→67, 흐름 6→7, 소스 18→19, 통합 원본 18→19).

## [2026-05-21] query | 발표자료 — 필터와 인터셉터의 차이 (Output + 위키 환류)

부트캠프 발표 시리즈("CSR/SSR, HTTP, 쿠키/세션, CORS, REST, 3-tier, ORM, MVC, Spring DI/IoC/AOP, Spring AI, MyBatis"의 다음 주제)로 **Filter vs Interceptor** 슬라이드를 작성. ppt처럼 키보드(← →)로 넘기는 단일 HTML, 밝은 톤 + Twemoji 일러스트 아이콘, 아파트 단지 비유로 일관성 유지.

- 산출물: `Output/2026-05-21-filter-vs-interceptor-발표.html` (15 슬라이드, 화살표/스페이스/F전체화면)
- 위키 환류 (Query 규칙: 가치 있는 답변은 새 페이지로):
  - 새 페이지: [[filter]] · [[interceptor]] · [[filter-vs-interceptor]]
  - 기존 페이지 [[http-method-override]]의 "필터여야 하는 이유" 서술을 [[filter]] / [[interceptor]] 본문으로 분리해 정착
- 핵심 인사이트(슬라이드 11·12):
  - "같은 일을 두 명이 하는 게 아니라 **다른 깊이로 다른 일**을 한다."
  - 예외 처리의 결정적 차이 — Filter는 톰캣 기본 에러 페이지로, Interceptor는 `@ControllerAdvice`로.
- `index.md` 갱신: 개념 67→69, 흐름 7→8.

## [2026-05-21] query | DTO vs Entity — 두 객체의 진짜 분리 축

영균 직관 확인 질문: "DTO는 엔티티(행위)를 위해 어떤 필드가 필요한지 결정하는 거고, 엔티티는 비즈니스 로직 본체인가?"

- 엔티티 쪽 직관 ✅ — 상태 + 식별자 + **행위**, 도메인 본체 (`Order.cancel()` 같은 규칙 실행).
- DTO 쪽 직관은 **비틀어줘야 함** — DTO는 "엔티티를 돕기 위해서"가 아니라 "엔티티로부터 클라이언트를 격리하기 위해서" 존재. 필드 결정 기준은 **엔티티가 아니라 유스케이스(요청/응답 시나리오)**.
- DTO와 엔티티는 위아래로 마주 보는 페어가 아니라 **다른 축**:
  - 엔티티 = 도메인 축 (행위·규칙)
  - DTO = 경계 축 (한 시나리오의 데이터 모양)
- 근거: [[dto-vs-entity]], [[three-tier-architecture]] (변환은 Service Layer).
- 환류 여부: 기존 [[dto-vs-entity]] 페이지 재진술이 주여서 새 페이지 생성은 보류. "필드 결정 기준 = 유스케이스" 한 줄을 본문에 추가할지 영균 의사 확인 중.

## [2026-05-21] query | "도메인"이란 무엇인가 — [[domain]] 페이지 신설

영균 후속 질문: "네가 말하는 '도메인'이 정확히 뭐야?"

- "도메인"이 비즈니스 도메인(엔티티 맥락)과 네트워크 도메인(프록시 맥락) 두 의미로 위키에 반복 등장하지만 독립 페이지가 없었음 → lint 기준 "언급은 되지만 페이지 없는 중요 개념"에 해당.
- 환류 산출물:
  - 새 페이지 [[domain]] — 분기 페이지 (비즈니스 도메인 + 네트워크 도메인 한 곳에서 정리, 같은 어원에서 갈라진 점도 명시)
  - [[dto-vs-entity]] 본문 두 곳 갱신:
    1. 도입부 "비즈니스 도메인" → "비즈니스 [[domain]]"으로 백링크 연결
    2. "왜 둘을 분리하는가" 끝에 "필드 결정의 기준은 엔티티가 아니라 유스케이스다" 강조 박스 추가
  - [[three-tier-architecture]]의 Domain Model 설명에 [[domain]] 백링크 추가
- 핵심 인사이트:
  - **"도메인" = 코드가 아니라 현실에 먼저 존재**. 프로그래머는 그걸 코드로 옮길 뿐.
  - "비즈니스 로직"(코드 관점) vs "도메인"(문제 관점) — 단어 선택이 사고방식을 바꾼다(DDD의 출발점).
  - 도메인 ⊃ 도메인 모델 ⊃ 엔티티 의 포함 관계로 영균 학습 트리에 못박음.
- `index.md` 갱신: 개념 69→70, "Spring / 웹·아키텍처" 카테고리에 [[domain]] 추가.

## [2026-05-21] query | Spring MVC 도식 — Dispatcher·MVC·DTO/DAO/DO/Entity (Output + 위키 환류)

영균 요청: "DispatcherServlet 동작, Spring MVC 구조, DTO/DAO/DO/Entity 관계를 도식화한 HTML 한 장 + 환류 가치 있는 건 위키에."

- 산출물: `Output/2026-05-21-spring-mvc-도식.html` — 단일 스크롤 도식 문서 (5개 도식 + 부록 헷갈리는 짝 표). 발표용 슬라이드가 아닌 참고용 한 페이지. 색상 코딩: Filter(오렌지) · Dispatcher(청록) · Interceptor(보라) · Controller(핑크) · Service(머스타드) · Repo(그린) · DB(슬레이트) · View(브라운).
- 환류 (4건):
  - **새 페이지 [[dispatcher-servlet]]** — [[filter]]에 `(TODO)`로 마킹되어 있던 빈 자리. Front Controller 패턴, 4단계 위임(HandlerMapping·HandlerAdapter·ViewResolver·HttpMessageConverter), "스프링 없는 세상과의 대비" 표.
  - **새 flow [[spring-mvc-request-flow]]** — 한 요청의 풀 파이프라인 (Filter → Dispatcher → Interceptor → Controller → Service → DAO → DB → 응답 변환 → 역순 복귀)을 한 곳에 모음. "POST /posts" 12단계 walkthrough 포함. 디버깅 중 "지금 요청이 어디쯤?"의 좌표 역할.
  - **[[domain]] 보강** — "DO · Entity · VO — 도메인 모델 안의 세 카테고리" 섹션 추가. DO ⊃ Entity ∪ VO 위계 명시. 한국 실무 함정(팀마다 DO 정의가 다름) 경고.
  - **[[dto-vs-entity]] 보강** — "DTO · DAO · Entity · DO — 4종 한 표로" 섹션 추가. 핵심 통찰: **DAO만 "행동", 나머지 셋은 "객체"**. 한 요청에서 네 객체가 만나는 자리 ASCII 도식.
- 백링크 갱신: [[filter]] (TODO 해소), [[interceptor]], [[mvc-pattern]], [[servlet-to-spring-mvc]]에 [[dispatcher-servlet]] / [[spring-mvc-request-flow]] 링크 추가.
- `index.md`: 개념 70→71 ([[dispatcher-servlet]] 추가), 흐름 8→9 ([[spring-mvc-request-flow]] 추가).

## [2026-05-26] query | 서블릿 스펙이라는 게 무슨 뜻이야?

영균 질문: 위키 곳곳([[filter]] 등)에 "서블릿 스펙"이라는 표현이 정의 없이 등장하던 자리를 채움. lint 기준 "언급은 되지만 페이지 없는 중요 개념"에 해당.

- 환류 (1건 신설 + 5개 페이지 백링크 보강):
  - **새 페이지 [[servlet-spec]]** — Jakarta EE의 표준 명세서. 콘센트 규격서 비유로 "인터페이스만 정의, 구현은 컨테이너가" 설명. 정의하는 주요 인터페이스 표, "서블릿 스펙 기술 vs 스프링 기술" 대조표, `javax → jakarta` 패키지 이동(Spring Boot 3.x/Tomcat 10+ 분기) 함정 메모.
  - 백링크 보강(5건): [[filter]] 3곳·[[interceptor]] 1곳·[[filter-vs-interceptor]] 3곳에 박혀 있던 "서블릿 스펙" 문자열을 모두 [[servlet-spec]]으로 연결. [[servlet]]·[[servlet-container]] "관련 페이지"에도 추가.
- 핵심 인사이트:
  - 스펙 = "인터페이스 + 동작 규약"만 정의. Tomcat·Jetty·Undertow는 같은 스펙의 다른 구현체.
  - **[[dispatcher-servlet]] 자체도 `HttpServlet`을 상속한 한 개의 서블릿** — Spring MVC 전체가 결국 서블릿 스펙 위에 올린 한 겹의 추상화임이 드러나는 지점.
  - [[filter]]가 Spring 없이도 Tomcat만으로 동작하는 반면 [[interceptor]]는 [[dispatcher-servlet]] 안에서만 사는 것이, "스펙 기술 vs 스프링 기술"의 위치 차이로 자연스럽게 설명됨.
- `index.md` 갱신: "Java / 웹 (Servlet·Spring)" 카테고리 맨 앞에 [[servlet-spec]] 추가, 개념 71→72.

## [2026-05-26] ingest | MyBatis 실습 정리 (Claude Code 대화)

`raw/notes/study-notes.md` 인제스트 — 부트캠프 MyBatis 단원 실습(`usertest` 프로젝트) 중 Claude Code와의 대화에서 정리한 8가지 막힘 지점.

- 인터뷰: ①정착 형태 = "개념 + 디버깅 일지 둘 다" ②신설 개념 = mybatis(메타) + api-response-wrapper + http-status-codes (pathvariable-vs-requestparam은 의도적으로 제외 — 소스 페이지 #8 체크리스트로만 남김) ③맥락 = 부트캠프 MyBatis 단원 실습 중.
- 생성: 소스 페이지 1, 개념 페이지 3 (총 4 페이지)
  - 소스: [[mybatis-practice-debugging]] — [[servlet-jdbc-debugging]] 형식의 디버깅 일지 8건. "JDBC에서 사라진 자리에 MyBatis가 새로 가져온 함정"의 기록.
  - 개념: [[mybatis]] — SQL Mapper 메타. **ORM이 아닌 이유**(카테고리 차이) 강조. namespace↔Java 인터페이스 매핑, `<sql>`/`<include>` 재사용, `#{}` vs `${}` 보안, 주요 설정(mapper-locations·map-underscore-to-camel-case·type-aliases-package), `@Mapper` 어노테이션 방식.
  - 개념: [[api-response-wrapper]] — `{success, message, data}` 공통 응답 래퍼. [[dto-vs-entity]] 위 메타 한 겹. 실습 단계 과잉/실무 도입의 트레이드오프. **헤더(HTTP status) vs 본문(wrapper) 분업** 강조 — 래퍼 도입했다고 모두 200으로 통일하는 함정 경고.
  - 개념: [[http-status-codes]] — "클라이언트가 다르게 반응해야 하면 구분"의 판단 기준. ResponseStatusException·`@ResponseStatus`·`@ControllerAdvice` 3가지 던지는 법. **Filter 예외는 `@ControllerAdvice`에 안 잡힘** 함정을 [[filter-vs-interceptor]]와 교차 연결.
- 백링크 보강(6건):
  - [[orm]] — "ORM vs SQL Mapper 카테고리 다름" 표 추가, MyBatis와의 명시적 구분
  - [[jdbc]] — 영균 맥락에 "JDBC → MyBatis → ORM" 다리 추가
  - [[dao-pattern]] — MyBatis Mapper가 DAO 인터페이스에 동적 프록시 구현체 끼우는 방식 명시
  - [[three-tier-architecture]] — Repository Layer 구현 도구로 jdbc/mybatis/orm 3단계 명시
  - [[restful-api]] — [[http-status-codes]] 본문 깊이 위임 + 관련 페이지에 [[api-response-wrapper]] 추가
  - [[dto-vs-entity]] — 관련 페이지에 [[api-response-wrapper]] 추가 (위 메타 한 겹)
- 핵심 인사이트:
  - **MyBatis ≠ ORM** — SQL Mapper다. SQL 통제권은 개발자에게 남는다. JPA와 우열이 아닌 선택.
  - JDBC의 반복 코드(연결·해제·ResultSet)는 사라졌지만 **새로운 함정**(XML namespace·`@PathVariable` 매칭 시점·`RuntimeException`은 500)이 그 자리를 채운다. 추상화는 항상 트레이드오프.
  - 응답의 의미는 **헤더(status code)**, 응답의 데이터는 **본문(DTO/Wrapper)**. 두 축은 분업이지 대체가 아니다.
- 의도된 미생성: `pathvariable-vs-requestparam` — 영균 선택으로 보류. 소스 페이지 체크리스트 #8에 패턴만 기록.
- `index.md` 갱신: 데이터베이스/Spring 웹·아키텍처/웹 HTTP·REST 3개 카테고리에 각각 신규 페이지 1건씩 추가. 개념 72→75, 소스 19→20, 통합 원본 19→20.

## [2026-05-26] query | RAG의 작동 원리와 활용 — NoteWiki 패턴과의 비교

영균의 질문 "RAG가 뭔지 대충은 알겠는데 정확한 작동 원리와 실제 활용을 알고 싶다"에 답하며, 가치 있는 답변(특히 NoteWiki가 따르는 [[llm-wiki-pattern]]과의 비교)을 위키로 환류.

- 신규 개념 페이지 4건:
  - [[rag]] — 3단계(Indexing → Retrieval → Generation), 실무 패턴(Hybrid Search·Re-ranking·Citation), 스택(LangChain·Pinecone·pgvector 등)
  - [[embedding]] — 분포 가설 기반 벡터화, 코사인 유사도, "같은 모델로 쿼리하라" 함정
  - [[vector-database]] — HNSW·IVF 인덱스, ANN, 메타데이터 필터링, 제품별 선택 기준
  - [[llm-wiki-pattern]] — Karpathy 제안, 3대 작업(Ingest·Query·Lint), RAG 한계의 대안으로 등장
- 신규 흐름 페이지 1건:
  - [[rag-vs-llm-wiki]] — 두 패턴의 트레이드오프, 자료 규모·연결성·누적성 축으로 선택 기준 정리, 하이브리드 가능성
- 핵심 takeaway:
  - RAG는 **chunk 검색**, LLM Wiki는 **컴파일된 위키** — 우열이 아니라 자료 성격에 따른 선택.
  - NoteWiki의 비전("AI 색인 도구")은 **chunk가 아니라 연결**이 가치 → Wiki 패턴이 옳은 선택.
  - 자료가 커지면 하이브리드 가능: 위키 + raw/에 대한 RAG 보완.
  - 이 저장소의 CLAUDE.md가 명시한 "RAG처럼 매번 원본을 재검색하는 대신…"의 배경 이론을 명시적 페이지로 기록.
- `index.md` 갱신: 새 카테고리 "AI / LLM / 지식 검색" 신설, 흐름에 비교 페이지 추가. 개념 75→79, 흐름 9→10.

## [2026-05-27] query | HikariCP가 뭐고 영균 학습 트리와 어떻게 연결되나

## [2026-05-27] ingest | pi 하네스 이해와 설정 대화

`raw/dialogues/2026-05-27 pi 하네스 이해와 설정 — 슬래시 커맨드·스킬·익스텐션 구조.md` 인제스트.
신설: [[pi]](개념), [[pi-dialogue]](소스). 주요 개념: pi 리소스 3계층(프롬프트 템플릿 vs 스킬 vs 익스텐션), `.claude/commands/` 연동 설정.

## [2026-05-27] query | 네트워크 Proxy vs AOP Proxy — 이름은 같은데 같은 것인가?

[[proxy]] 페이지(Forward/Reverse)와 [[aop]](객체 수준 Proxy)의 관계 정리.
쿨: 두 객다 "중간에 낌 대리자" 아이디어는 공유, 적용 층만 다름 (네트워크 vs JVM).
[[proxy]].md에 구분 테이블 환류.

## [2026-05-27] lint | 위키 전체 건강 점검 + 수정

점검 범위: concepts 81 → 83, flows 10, sources 20 (신규 2페이지 추가)

점검 결과:

- ✅ 깨진 링크: 0
- ✅ 고아 페이지: 0
- ⚠️ 약연결(2개 링크): java-buffer, short-circuit → 상호참조 보강 완료
- 🔴 독립 페이지 없는 중요 개념 → aop/transaction 신설, jpa는 미완료(다음 가지)
- ⚠️ javax→jakarta stale: servlet.md, servlet-container.md 업데이트 완료

수정 내역:

- 신설: [[aop]], [[transaction]]
- 링크 보강: java-buffer(servlet·jdbc·string-pool), short-circuit(functional-interface·lambda), functional-interface(short-circuit), jvm-memory(java-buffer)
- spring-framework.md AOP 예정 플래그 → [[aop]] 링크
- servlet.md, servlet-container.md jakarta 주의 삽입
- index.md 통계 81 → 83

영균 질문: "hikai cp가 뭐야? 내가 배우는 부분과 어떻게 연결되어 있는지 모르겠네." → 후속 두 차례로 핵심 통찰이 도출되어 위키 환류.

- 대화 흐름 (3턴):
  1. 1차 답변: HikariCP = JDBC Connection Pool 구현체, Spring Boot 기본 DataSource. 영균 학습 트리에서 JDBC → MyBatis → Spring Boot 자동 설정 사슬의 한 매듭.
  2. 영균 후속 ①: "커넥션 누수란 뭐고, 풀을 써도 close 안 하면 똑같이 누수 아닌가?" → **"close 호출 책임은 그대로다, 다만 의미가 종료→반납으로 바뀔 뿐"** 정정. 영균의 직관 자체는 옳았음.
  3. 영균 후속 ②: "JDBC 관리가 어려우니 CP가 대신해준다는 거야?" → **"CP의 본질은 재사용이지 관리 대행이 아니다"** 정정. close 호출은 try-with-resources/JdbcTemplate/`@Transactional`이 한다 (별개 계층).
- 환류 (2건 신설 + 3개 페이지 백링크 보강):
  - **새 페이지 [[connection-pool]]** — 일반 개념. Connection 생성 비용(TCP+TLS+인증+세션 초기화)으로 풀의 필요성 설명, 핵심 설정 5종(maxPoolSize·minIdle·connectionTimeout·idleTimeout·maxLifetime), **"누수의 두 얼굴" 비교표** (JDBC: max_connections 151 vs Pool: maximumPoolSize 10 — 풀이 오히려 더 빨리 터짐), **CP의 책임 vs CP가 안 하는 일** 표 (재사용/한도/검증/누수감지 ⊂ CP, close 호출 ⊄ CP).
  - **새 페이지 [[hikaricp]]** — 구현체 디테일. 이름 유래(光), 다른 풀 대비 빠른 이유(FastList·ConcurrentBag·bytecode 최적화), Spring Boot 자동 등록 흐름 4단계, `application.properties`의 `spring.datasource.hikari.*` 튜닝 옵션, `leakDetectionThreshold` 디버깅 기능 강조.
  - 백링크 보강(3건):
    - [[jdbc]] — "Spring으로 가면 DataSource·JdbcTemplate이…" 문단에 [[hikaricp]]·[[connection-pool]] 연결 + "역순으로 close가 풀 환경에선 반납으로 의미가 바뀌지만 호출 책임은 그대로" 한 문단 추가.
    - [[spring-boot]] — 자동 설정 섹션에 "starter-jdbc/mybatis-starter가 HikariCP를 transitive로 끌어옴 → HikariDataSource Bean 자동 등록" 박스 추가. 영균이 본 `HikariPool-1 - Starting...` 로그 의미 짚음.
    - [[mybatis]] — `spring.datasource.*` 설정 주석에 "내부적으로 HikariCP가 자동 등록됨" 명시. 관련 페이지에 [[connection-pool]]·[[hikaricp]] 추가.
- 핵심 인사이트:
  - **두 책임의 분리** — CP의 책임(재사용) vs 자원 관리 추상화의 책임(close 호출). 영균이 [[mybatis]] 실습에서 close 코드를 안 본 것은 풀 덕이 아니라 MyBatis SqlSession + `@Transactional` 덕.
  - **누수의 두 얼굴** — JDBC 직접 환경의 누수(DB 한도 151)와 풀 환경의 누수(풀 한도 10)는 같은 close 미호출이 다른 자원에서 터지는 것. 풀을 써도 누수는 안 사라진다.
  - 영균은 [[mybatis-practice-debugging]] 시점부터 이미 HikariCP를 **사용자**로 써왔다. 이 페이지들은 그것을 **인식**으로 끌어올리는 단계.
- `index.md` 갱신: "데이터베이스" 카테고리에 [[connection-pool]]·[[hikaricp]] 추가, 개념 79→81, 마지막 갱신 메타 갱신.

## [2026-05-27] ingest | JPA 강의 노트 (MyBatis to JPA)

원본: `raw/lectures/JPA.md` (부트캠프 NHN Forward 계열 "MyBatis to JPA" 강의). 인터뷰 모드.

- 맥락 인터뷰:
  - 저장 동기 → **프로젝트 적용 준비** (곧 Spring 프로젝트에 JPA 실제 사용)
  - 현재 위치 → **MyBatis 다음 단계** (MyBatis 실습 끝내고 JPA로 전환 중)
  - 원하는 결과물 → **MyBatis→JPA 비교 흐름 + 개념 트리 확장**
- 신설 (개념 7 + 흐름 1 + 소스 1):
  - **[[jpa]]** — 자바 ORM 표준 명세. 채택 4동기(생산성·유지보수·벤더독립·객체중심) + 핵심 "왜"=패러다임 불일치(상속·참조·그래프탐색) + 단점/보완(JPQL 한계·MyBatis 혼용·CQRS).
  - **[[hibernate]]** — JPA의 de facto 구현체. 명세 vs 구현 분리의 가치(벤더 독립, JDBC와 동일 구조). Spring Boot 기본 구현체.
  - **[[spring-data-jpa]]** — JpaRepository 상속 인터페이스만으로 자동 구현. Spring Data 우산, 계층 구조(Crud→PagingAndSorting→Jpa), 메서드 이름 쿼리, Pageable.
  - **[[entity-manager]]** — EntityManager/Factory의 비용 차이로 분리 이유 설명, persist/find/merge/remove, **영속성 컨텍스트·변경 감지**(⚠️ 원본엔 용어 없어 표준 동작으로 보강 플래그), Spring 빈 설정(MyBatis SqlSessionFactory와 1:1 대응).
  - **[[jpa-entity-mapping]]** — `@Entity`·`@Table`·`@Id`·`@Column`·`@Temporal`·`@Transient`, 키 생성 전략 4종(IDENTITY/SEQUENCE/TABLE/AUTO)과 벤더 독립, 복합 키(`@EmbeddedId`/`@Embeddable`)와 equals/hashCode·Serializable 필요성.
  - **[[jpa-association]]** — FK↔참조 방향성 불일치, 다중성 4종, **연관 관계 주인(=FK 있는 쪽)·mappedBy**, 페치 전략(LAZY/EAGER → N+1 진원지), 영속성 전이(Cascade).
  - **[[jpql]]** — 엔티티 대상 객체 지향 쿼리(FROM 엔티티클래스), 복잡 쿼리 4카드(메서드명→JPQL→Criteria→QueryDSL→Native), JPA 한계 보완과 MyBatis 공존.
  - **[[mybatis-to-jpa]]** (흐름) — 추상화 사다리(손JDBC→MyBatis→JPA→Spring Data JPA), **1:1 대응표**(SQL작성·매핑·관계·작업단위·빈·트랜잭션·UPDATE방식), 전환 6절차, "전부 갈아엎기 아님"(CQRS 공존), 새로 짊어지는 부담(영속성컨텍스트·주인·N+1).
  - **[[jpa-lecture]]** (소스) — 맥락·핵심 주장·개념·엔티티 정리.
- 갱신 (6): [[orm]](자바 ORM=JPA/Hibernate 섹션), [[mybatis]](다음 단계 JPA·공존), [[n-plus-1-problem]](JPA LAZY 페치 진원지·fetch join), [[transaction]](JpaTransactionManager·변경 감지 커밋 시점), [[dao-pattern]](spring-data-jpa 링크화), [[spring-framework]](학습 트리에 영속성 사다리 추가).
- 핵심 교차 연결: MyBatis↔JPA를 "SQL 통제권 이동"으로 일관되게 연결. [[jdbc]]→[[mybatis]]→[[jpa]]→[[spring-data-jpa]] 추상화 사다리가 [[dao-pattern]]·[[spring-framework]]·[[mybatis-to-jpa]]에서 반복 등장. N+1·트랜잭션 변경 감지가 "통제권을 넘긴 대가"로 묶임.
- index.md: 개념 84→91, 흐름 10→11, 소스 21→22, 통합 원본 21→22.

## [2026-05-27] query | 영속성 컨텍스트란? (JPA 변경 감지의 정체)

영균 질문: "영속성 컨텍스트가 뭔지 알아야 이해가 될 것 같은데." → 직전 JPA ingest에서 [[entity-manager]]에 ⚠️ 플래그로 남겨둔 보강 항목이 정확히 이 개념이라, 답변 후 위키에 환류.

- 답변 핵심: 영속성 컨텍스트 = 엔티티를 보관·관리하는 "작업대"(1차 캐시). 트랜잭션 하나 = 작업대 하나. `persist`/`find`한 엔티티는 DB로 바로 안 가고 작업대에 올라갔다가 커밋 때 반영.
  - MyBatis(`update` SQL 직접 호출) vs JPA(객체 필드만 바꿔도 반영)의 차이가 곧 이 개념.
  - 5대 기능: 1차 캐시 / 동일성 보장 / **변경 감지(dirty checking, 스냅샷 비교)** / 쓰기 지연 / 지연 로딩.
  - 생명주기 4단계: 비영속(transient)→영속(managed)→준영속(detached)→삭제(removed). merge는 준영속을 작업대에 재등록할 때.
  - flush ≠ 커밋: flush는 SQL 전송, 커밋 직전 자동 발생. "커밋 시점 변경 감지"의 정확한 순서 = 커밋→flush→dirty checking→UPDATE.
- 환류 (1건 신설 + 4개 페이지 보강):
  - **새 페이지 [[persistence-context]]** — 작업대 비유, MyBatis 대비표, 5대 기능표, 변경 감지 상세(스냅샷·merge 불필요), 지연 로딩→N+1 연결, 생명주기 4단계, flush vs 커밋, 영균 맥락(LazyInitializationException 등).
  - 보강(4건):
    - [[entity-manager]] — ⚠️ 보강 플래그 **해소**. "왜" 섹션을 [[persistence-context]] 링크로 압축, "EntityManager가 가벼운 이유 = 이 작업대를 들고 있어서" 연결.
    - [[jpa]] — 구성 요소에 [[persistence-context]] 추가, 단점표 "영속성 컨텍스트" 링크화.
    - [[transaction]] — "변경 감지 커밋 시점" 설명을 커밋→flush 순서로 정밀화, [[persistence-context]] 링크.
- index.md: 개념 91→92, "데이터베이스" 카테고리에 [[persistence-context]] 추가, 마지막 갱신 메타 갱신.

## [2026-05-27] query | LAZY 연관 객체(프록시)와 merge 로직

영균 질문: "lazy 연관 객체는 뭐야? 그리고 merge가 어떤 로직인지도." → 직전 query에서 예고한 "준영속·merge" 줄기의 후속. 답변 후 기존 페이지에 가지로 환류(새 페이지 대신 보강).

- 답변 핵심:
  - **LAZY 연관 객체 = 프록시(가짜 대역)**. `getOrder()`는 id만 든 빈 껍데기를 반환하고, 진짜 필드 접근 순간 SELECT로 초기화. 왜=안 쓸 연관을 미리 JOIN하면 낭비. 함정 ①`LazyInitializationException`(트랜잭션 종료 후 작업대 닫힌 뒤 프록시 접근 시 예외) ②[[n-plus-1-problem]].
  - **merge 4단계**: ①인자 ID 추출 ②영속 엔티티 조회(없으면 생성) ③필드 전부 복사 ④영속 엔티티 반환. 함정 ①인자는 여전히 준영속 → 반환값을 써야 함 ②전체 덮어쓰기(null도 복사) → 부분 수정 위험. 결론: 일상 수정은 find+변경 감지가 안전, merge는 준영속 재등록 전용.
- 환류 (기존 2개 페이지 보강):
  - [[jpa-association]] — 페치 전략 섹션에 "**LAZY 연관 객체의 정체 = 프록시**" 추가(초기화 메커니즘·왜·⚠️LazyInitializationException). 관련 페이지에 [[persistence-context]] 추가.
  - [[persistence-context]] — 생명주기 섹션 뒤에 "**merge의 로직**" 섹션 추가(4단계·함정 2개·변경 감지 권장).
- 핵심 인사이트: 프록시 초기화 가능 구간 = [[transaction]] 경계 = 작업대([[persistence-context]]) 수명. LazyInitializationException·merge 반환값 함정 모두 "작업대 밖이냐 안이냐(영속/준영속)"로 환원된다.
- index.md: 신설 없음(stats 불변), 마지막 갱신 메타만 갱신.

## [2026-05-28] ingest | Spring @Transactional·프록시 대화 (도메인 구조 → 트랜잭션 → 컨테이너)

`raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md` 인제스트.
Daker-server 프로젝트를 강의 복습 중 재점검하며 나온 8턴 대화. 대화 저장 모드(dialogue).

- 영균의 인제스트 지시(2건): ① **자주 쓰는 Spring 어노테이션을 따로 모아 인덱스·연결 구조**로
  만들 것 ② **JPA 개념 페이지를 대화의 도식으로 더 직관적으로 보강**할 것.
- 생성 (개념 2 + 소스 1):
  - **[[spring-annotations]]** (개념/인덱스) — 영균 요청 ①. 7개 그룹(빈 등록·DI·웹 매핑·응답/예외·
    트랜잭션/AOP·JPA 매핑·설정)으로 어노테이션을 표로 정리, 각 행이 "깊이('왜')" 페이지로 링크.
    "어노테이션은 표시일 뿐, 읽는 쪽(컨테이너/Hibernate)이 일한다"는 큰 그림 도식 포함.
  - **[[transaction-propagation]]** (개념) — `REQUIRED`는 새 트랜잭션을 안 만들고 1개로 합침 →
    안쪽 예외가 바깥까지 롤백. **rollback-only + `UnexpectedRollbackException`** 함정 도식,
    `REQUIRES_NEW` 분리, 전파 옵션 6종 표. 대화의 핵심 신규 지식.
  - **[[spring-transaction-proxy-dialogue]]** (소스) — 8턴 대화 요약, 핵심 주장 9건.
- 보강 (영균 요청 ② — 대화 도식 이식, 3개 개념):
  - [[transaction]] — "바닐라 JPA와의 대응"(EntityManager/EntityTransaction try-catch ↔
    `@Transactional` 매핑) 섹션, programmatic vs declarative 용어, **readOnly의 "왜"**(변경 감지
    스냅샷 생략, 기존 "최적화 힌트"를 정밀화), **기본 롤백 규칙 = unchecked만** 함정, 자기호출 경고,
    전파 절에서 [[transaction-propagation]] 위임.
  - [[entity-manager]] — **"컨테이너가 EntityManager를 관리한다" 2단계 도식**(앱 시작 시 EMF 1개 →
    호출마다 EM 생성·begin·스레드 바인딩·commit·close), 공유 EM 프록시(ThreadLocal)로 동시 요청 격리.
  - [[aop]] — **"컨테이너 vs 프록시" 구분 절**(만든 쪽 vs 만들어진 것, 주입 시점 vs 호출 시점 2단계
    도식, 비서 비유), **자기호출(self-invocation) 함정** 명시. 영균이 직접 헷갈려한 지점이라 정면 대응.
- 백링크: [[spring-framework]] 허브에 [[spring-annotations]](참조 색인)·[[transaction-propagation]] 추가.
- 핵심 인사이트:
  - `@Transactional` = 바닐라 try-catch의 **선언적 버전**. 단 기본 롤백은 unchecked만(바닐라 `catch(Exception)`과 다름).
  - **프록시 ≠ 컨테이너** — 컨테이너(앱당 1개)가 프록시(빈마다 1개)를 만들어 주입. 호출 시점엔 컨테이너 빠짐.
  - `REQUIRED`는 트랜잭션을 합치므로 안쪽 실패를 try-catch로 못 살린다(rollback-only).
  - 영균의 바닐라 JPA 경험을 지렛대로 삼아 "프록시가 대신 짜주는 코드"로 프레이밍한 것이 통한 ingest.
- index.md: 개념 92→94, 소스 22→23, 통합 원본 22→23, "Spring / 코어" 카테고리에 2개 추가.

## [2026-06-01] query | JPA 연관 관계 초심자 설명 + 위키 개선

- **질문**: JPA 연관 관계를 end-to-end로 설명해달라. 현재 위키가 초심자에게 너무 어렵다.
- **변경 페이지**: [[jpa-association]] — 전면 재작성.
- **개선 방향**:
  - 게시글(Post)-댓글(Comment) 예제로 통일해 처음부터 끝까지 일관된 스토리로 전개.
  - 5단계 빌드업: @ManyToOne 단방향 → 양방향 → 주인 → LAZY/EAGER → Cascade.
  - 주인(owner) 개념: "FK 있는 쪽이 주인" 규칙 + 흔한 버그(주인 아닌 쪽에만 설정) 명시.
  - `LazyInitializationException`을 코드 예시로 트랜잭션 경계와 연결해 설명.
  - 프록시 설명을 "가짜 껍데기" 수준으로 단순화 (초기화 메커니즘은 링크로).
  - 마지막에 "한 눈에 보는 흐름" 체크리스트 추가.

## [2026-06-02] ingest | Querydsl Reference Guide (공식 레퍼런스 v5.0.0)

- 원본: raw/articles/Querydsl Reference Guide.md
- 신설: wiki/concepts/querydsl.md (개념 + 사용법 통합), wiki/sources/querydsl-reference-guide.md
- 갱신: wiki/concepts/jpql.md (querydsl 링크 추가), wiki/index.md

## [2026-06-02] lint | 지시 파일·링크 정리

- `raw/CLAUDE.md`의 클리퍼 템플릿 위치를 실제 디렉터리 `etc/clipper-template/`에 맞게 수정.
- `CLAUDE.md`·`wiki/CLAUDE.md`에서 `링크형 태그` 표현을 `위키링크`와 frontmatter `tags`로 분리.
- 새 위키링크는 대상 페이지 존재를 확인하고, 보류 개념은 일반 텍스트/TODO로 남기도록 규칙 추가.
- 명백한 오류·오타·낡은 설명은 수정 가능하되 `wiki/log.md`에 기록하도록 규칙 보강.
- `Output/CLAUDE.md`에 원본 분석이 필요하면 먼저 `wiki/`에 ingest한 뒤 결과물을 만들도록 명시.
- 깨진 링크 후보 점검 결과: `jpa-vs-prisma-fetch`는 별도 페이지 없이 `jpa-association.md`에만 남은 비교 메모였으므로, 기존 [[prisma]] 설명으로 흡수하고 링크 제거.
- log 대조: Querydsl ingest 산출물(`raw/articles/Querydsl Reference Guide.md`, [[querydsl]], [[querydsl-reference-guide]], [[jpql]] 보강, `index.md`) 존재 확인. 2026-06-01 [[jpa-association]] 전면 재작성도 실제 반영 확인.

## [2026-06-05] query | 부트캠프 최종 프로젝트 주제 피드백

- 질문: NoteWiki 기반 개인 위키 플랫폼과 사용자 간 위키 관계망 아이디어가 최종 프로젝트로 적절한지 검토.
- 근거 페이지: [[llm-wiki-pattern]], [[rag-vs-llm-wiki]], [[rag]], [[wikilink]], [[graph-view]].
- 답변 방향: MVP는 "인터뷰 기반 개인 위키 생성·운영"에 집중하고, 사용자 간 연결은 공개 페이지 인용·추천 수준으로 제한하는 것을 제안.

## [2026-05-26] query | jpa 어떻게 쓰더라? 까먹었어

영균의 가벼운 복기 질문. 위키에 [[jpa]] 다발이 충분히 정리되어 있어 **사용 5단계 순서**(의존성/Entity/연관관계/Repository/Service)와 흔한 함정 4가지로 재구성해 답변. 새 페이지 환류는 보류 — [[mybatis-to-jpa]] + [[spring-data-jpa]] + [[jpa-entity-mapping]]에 이미 같은 내용이 들어 있고, 사용자가 까먹었을 때 꺼내 보기 좋은 진입점도 거기로 충분.

- 핵심 짚어준 함정 4가지:
  - **변경 감지** — `@Transactional` 안 setter → 커밋 시 자동 UPDATE. MyBatis에서 가장 사고방식이 달라지는 지점.
  - **연관관계 주인** — `mappedBy` 없는 쪽이 주인. 거울에만 set하면 DB에 안 들어간다.
  - **N+1** — LAZY + 반복문 함정. [[n-plus-1-problem]]으로 연결.
  - **JPQL 한계** — 억지 이전 X, [[mybatis]]와 CQRS 공존이 실무 패턴.
- 환류: 새 페이지 없음. 본 답변은 기존 페이지의 재구성.
- 부수 발견(lint 트리거 후보): `index.md` 비동기. JPA 페이지 다발([[jpa]]·[[jpa-entity-mapping]]·[[jpa-association]]·[[jpql]]·[[querydsl]]·[[entity-manager]]·[[persistence-context]]·[[hibernate]]·[[spring-data-jpa]]·[[transaction]]·[[transaction-propagation]]·[[spring-annotations]]·[[hikaricp]] + [[mybatis-to-jpa]] + [[jpa-lecture]]·[[spring-transaction-proxy-dialogue]]·[[querydsl-reference-guide]])가 RAG ingest 시점 이후 추가되었으나 카테고리에 미반영. 다음 lint 또는 별도 갱신 작업으로 처리 예정.

## [2026-06-07] ingest | 인증 방식 필기 (Cookie · Session · JWT · Refresh Token)

- 원본: `raw/notes/인증.md`
- 저장 이유: 사이드 프로젝트 보안 파트(JWT) 구현 전, 직접 쓸 기술의 원리를 정확히 파악
- 신설 개념 페이지 (5개): [[cookie]], [[session-auth]], [[jwt]], [[refresh-token]], [[serialization]]
- 신설 흐름 페이지 (1개): [[cookie-session-jwt]]
- 신설 소스 페이지 (1개): [[authentication-note]]
- 대화에서 원본 보완된 내용:
  - 세션 IP 바인딩의 원리와 3가지 한계 (NAT/모바일/기업 내부망)
  - Stateless의 정확한 의미 (서버 메모리에 상태를 저장하지 않음)
  - 직렬화(Serialization)의 의미 (객체 → 전송 가능한 문자열, Base64URL 인코딩)
  - Refresh Token Rotation (재사용 감지로 탈취 탐지 → 전체 무효화)
- 교차 연결: [[filter]], [[interceptor]], [[dispatcher-servlet]] (Spring JWT 구현 위치 맥락)

## [2026-06-08] output | 주식 모의투자 요구사항/기술스택/API 명세서 작성

- 기준 자료: `C:\Users\PC\Desktop\REQUIREMENTS.md`, 사용자 대화 맥락
- 산출물: `Output/2026-06-08-주식모의투자-요구사항-기술스택-API명세.md`
- 내용: 2~3주 MVP 기준 상세 기능 요구사항, 비기능 요구사항, 도메인 모델, 기술 스택, API 명세, 구현 우선순위 정리
- 검증: 산출물 파일 존재 확인, 신규 위키링크 없음 확인

## [2026-06-09] ingest | ZeroVerse Spring 실습 노트 (JPA Auditing · Spring Security · Bean Validation)

- 원본: `raw/notes/zeroverse_note_2026-06-09.md`
- 프로젝트: ZeroVerse 개인 블로그 플랫폼 (`C:\Users\PC\Desktop\zeroverse-server`)
- 저장 이유: AI를 조언 용도로 활용하며 학습, 다른 프로젝트에서 재참조할 패턴 기록
- 현재 진행 상태: 회원가입/로그인 요청-응답 완성, JWT 토큰 미연동

### 신설 개념 페이지 (3개)

- [[jpa-auditing]] — @EnableJpaAuditing, @MappedSuperclass, BaseEntity 패턴, @CreatedDate/@LastModifiedDate
- [[spring-security]] — SecurityFilterChain, HttpSecurity, CSRF 비활성화 이유, STATELESS, BCryptPasswordEncoder
- [[bean-validation]] — @Valid 트리거 원리, @NotBlank vs @NotNull 차이, 자주 쓰는 검증 어노테이션

### 신설 흐름 페이지 (1개)

- [[spring-security-register-flow]] — SecurityConfig → Controller(@Valid) → Service(BCrypt) → Repository 회원가입 전 파이프라인, ZeroVerse 코드 위치 포함

### 신설 소스 페이지 (1개)

- [[zeroverse-spring-practice]] — ZeroVerse 프로젝트 컨텍스트 및 기술 스택

### 갱신 페이지 (2개)

- [[jpa-entity-mapping]] — 래퍼 클래스 vs 기본형 섹션 추가 (`Integer`/`Long` 써야 하는 null 이유)
- [[spring-annotations]] — §7 보안·검증 섹션(@EnableWebSecurity/@Valid/@NotBlank 등), §8 JPA Auditing 섹션 신설

### 교차 연결

- [[spring-security]] ↔ [[jwt]] ↔ [[refresh-token]] ↔ [[filter]] — Spring Security Filter Chain에서 JWT 연동 위치
- [[jpa-auditing]] ↔ [[jpa-entity-mapping]] — BaseEntity 패턴과 기본 매핑 연결
- [[bean-validation]] ↔ [[dto-vs-entity]] ↔ [[three-tier-architecture]] — DTO 검증 계층 연결
- [[spring-security-register-flow]] — 위 모든 개념을 하나의 실습 흐름으로 통합

## [2026-06-10] ingest | Spring @Component · Bean · DI · Security Filter Chain 개념 문답

- 원본: `raw/dialogues/2026-06-10 Spring @Component · Bean · DI · Security Filter Chain 개념 문답.md`
- 소스 요약: [[spring-component-di-security-dialogue]]
- 신규 개념 페이지: [[lombok]] — @RequiredArgsConstructor vs @AllArgsConstructor, DI 생성자 자동 생성, 세 생성자 어노테이션 비교표
- 갱신: [[spring-annotations]] — DI 섹션에 `@RequiredArgsConstructor` 설명·[[lombok]] 참조 추가
- 핵심 takeaway:
  - `@Component`·`@Service`·`@Repository`·`@Controller`는 역할 명시 파생. Bean = IoC가 관리하는 싱글톤.
  - 생성자 하나일 때 `@Autowired` 생략 가능 (Spring 4.3+). `@RequiredArgsConstructor`가 실무 표준 패턴.
  - `addFilterBefore(내 필터, 기준필터.class)` — JWT 필터는 `UsernamePasswordAuthenticationFilter` 앞 위치.
  - `SessionCreationPolicy.STATELESS` 미설정 시 Spring Security가 세션을 만들어버림 → JWT 의미 없어짐.
- index.md 갱신: 개념 1개([[lombok]]), 소스 1개 추가, 통합 원본 26→27.

## [2026-06-10] ingest | ZeroVerse Spring Security JWT 로그인 인증 실습

- 원본: `raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md`
- 소스 요약: [[zeroverse-spring-security-jwt-dialogue]]
- 신규 개념 페이지: [[jwt-claims]], [[security-context]], [[once-per-request-filter]]
- 신규 흐름 페이지: [[spring-security-jwt-auth-flow]]
- 기존 맥락 연결: [[spring-security]], [[jwt]], [[filter]], [[bean-validation]], [[lombok]], [[refresh-token]]
- 핵심 takeaway:
  - 로그인 성공 여부만 응답하면 로그인 유지는 되지 않는다. Access Token 발급과 이후 요청의 Bearer 토큰 검증이 필요하다.
  - `JwtTokenProvider`는 토큰 생성/검증/Claims 추출 도구이고, Claims는 JWT Payload 안의 정보 묶음이다.
  - `JwtAuthenticationFilter`는 로그인 필터가 아니라, 이미 발급된 JWT로 현재 요청의 인증 정보를 [[security-context]]에 복원하는 필터다.
  - `doFilterInternal()`은 현재 필터의 작업을 정의하고, `filterChain.doFilter()`는 다음 필터 또는 Controller로 요청을 넘긴다.
  - Spring Security 내장 필터들은 모두 같은 메서드 구조가 아니며, 역할에 따라 `doFilter`, `doFilterInternal`, `attemptAuthentication` 등을 가진다.
- index.md 갱신: 보안/인증 개념 2개([[jwt-claims]]·[[security-context]]), Spring/Servlet 개념 1개([[once-per-request-filter]]), 흐름 1개, 소스 1개, 통합 원본 27→28.

## [2026-06-10] lint | 위키 건강 점검 (3차)

점검 범위: concepts 107, flows 14, sources 28 + index + log.

점검 결과:

- ✅ 깨진 링크: 0 — 새로 추가된 [[jwt-claims]]·[[security-context]]·[[once-per-request-filter]]·[[spring-security-jwt-auth-flow]]·[[lombok]]·[[spring-component-di-security-dialogue]]·[[zeroverse-spring-security-jwt-dialogue]] 모두 실제 파일 존재 확인.
- ✅ 고아 페이지: 0 — 107개 개념·14개 흐름·28개 소스 전부 index에 등록.
- ✅ 모순: 0
- 🔴 발견 및 수정 (4건):
  1. **index.md 통계 오류** — `통합한 원본 수: 27` → 28 수정. (소스 페이지 28개와 불일치)
  2. **log.md 누락 항목** — `spring-component-di-security-dialogue` + `[[lombok]]` 신설 인제스트(2026-06-10 1차) 로그 없음 → 항목 추가.
  3. **spring-annotations.md updated 날짜** — `2026-05-28` → `2026-06-10` 수정. (오늘 [[lombok]] 링크 추가됨)
  4. **spring-security.md 낡은 섹션** — "JWT 필터 추가 (다음 단계 — 미완료)" → JWT 구현이 완료된 현재 상태로 갱신.

## [2026-06-13] query | 인덱스의 함정 영상 — EXPLAIN·커버링 인덱스 용어 설명

- 원본: `raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md`
- 영상 내용 요약 및 EXPLAIN type 해석, 커버링 인덱스 개념 답변.
- 환류 대상으로 확인 → 2026-06-13 ingest 로 이어짐.

## [2026-06-13] ingest | DB 인덱스 — 코딩애플 입문 + 인덱스의 함정 쇼츠

- 원본 2개:
  - `raw/youtube/index가 뭔지 설명해보세요 (개발면접시간).md` (코딩애플)
  - `raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠! (인덱스의 함정).md`
- 소스 요약: [[index-what-is-it]], [[index-trap]]
- 신규 개념 페이지: [[database-index]], [[explain]], [[covering-index]]
- 핵심 takeaway:
  - 인덱스 = 컬럼을 복사·정렬한 B+tree 구조. 탐색은 Binary Search 원리.
  - B+tree는 리프 노드끼리 연결되어 있어 범위 검색(RANGE)에 유리.
  - 인덱스가 있어도 무력화되는 3가지 함정: 앞쪽 와일드카드, 묵시적 형변환, 컬럼에 함수 적용.
  - EXPLAIN type `index` ≠ 최적화. 커버링 인덱스가 아니면 풀 스캔보다 느릴 수 있음.
  - 진짜 인덱스 효과: type이 `ref` 또는 `range`일 때만.
- index.md 갱신: 개념 3개([[database-index]]·[[explain]]·[[covering-index]]), 소스 2개, 통합 원본 28→30.

## [2026-06-13] query | 인덱스 DDL 문법·자동 생성 여부·인덱스 힌트

- 질문 3건: 인덱스 생성/삭제 문법, CREATE TABLE 자동 인덱스, 쿼리 시 인덱스 힌트 지정
- 위키 근거: [[database-index]] (클러스터드 인덱스·PK 자동 정렬)
- 위키 외 보완: DDL 문법(CREATE INDEX·DROP INDEX), 인덱스 힌트(USE/FORCE/IGNORE INDEX)
- 환류 완료: [[database-index]]에 DDL 문법·인덱스 힌트 섹션 추가.

## [2026-06-13] query | DDL의 함정 — 메타데이터 락·pt-osc 원리 (내 메모 3문)

- 원본: `raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 (DDL의 함정).md`
- 내 메모 기반 3문답: ALTER TABLE 락 대기 메커니즘 / MDL·배타적 락·트리거·복제 지연 용어 / pt-osc 4단계 원리
- 위키 근거: [[transaction]] (Shared·Exclusive 락 개념 연결)
- 위키 외 보완: 메타데이터 락(MDL), ALTER TABLE WAITING 구조, pt-online-schema-change, 복제 지연
- 환류 제안: [[ddl-lock]] 페이지 신규 생성 (사용자 확인 대기)

## [2026-06-24] query | 낙관적 락 vs 비관적 락

- 질문: "낙관적 락, 비관적 락이 무엇인가?"
- 위키 근거: [[concurrency-problem]] (DB 레벨 락 언급), [[etag]] (HTTP Optimistic Locking 언급)
- 전용 페이지 없음 — 위키 + 일반 지식 혼합 답변
- 핵심 요약:
  - 비관적 락: SELECT FOR UPDATE, @Lock(PESSIMISTIC_WRITE) → 충돌을 미리 막음, 처리량↓, 충돌 잦을 때 유리
  - 낙관적 락: @Version 컬럼 → 충돌을 감지 후 OptimisticLockException, 재시도 필요, 읽기 위주일 때 유리
  - ETag + If-Match: HTTP 레벨 낙관적 락 (클라이언트-서버 사이)
- 환류 제안: [[optimistic-pessimistic-lock]] 신규 페이지 (사용자 확인 대기)

## [2026-06-13] ingest | DDL의 함정 — ALTER TABLE 메타데이터 락·pt-osc

- 원본: `raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 (DDL의 함정).md`
- 대화 보완 모드: 내 메모 3문답 + 팔로업 3문답을 `## 💬 대화 본문`으로 원본에 추가
- 소스 요약: [[ddl-trap]]
- 신규 개념 페이지: [[ddl-lock]]
- 핵심 takeaway:
  - ALTER TABLE이 직접 막는 게 아니라, WAITING 상태에 진입하는 순간 뒤의 모든 쿼리가 대기열에 쌓이는 구조.
  - 열린 트랜잭션(Shared MDL 보유)이 없으면 DDL은 빠르게 끝난다. 문제는 닫히지 않은 트랜잭션.
  - pt-osc: 트리거로 실시간 동기화하면서 청크 복사 → RENAME만 락. 쓰기 2배 단점.
  - MySQL 8.0 Instant DDL: 컬럼 추가 등 일부만 즉시 처리. 컬럼 삭제·타입 변경은 불가.
  - 운영 DDL = 인프라 배포. 트래픽·열린 트랜잭션·복제 구조 사전 점검 필수.
- index.md 갱신: 개념 1개([[ddl-lock]]), 소스 1개([[ddl-trap]]), 통합 원본 30→31.
- 환류 완료: [[database-index]]에 "DDL 문법" 섹션(CREATE/DROP·자동 생성 표)·"인덱스 힌트" 섹션(USE/FORCE/IGNORE INDEX) 추가.

## [2026-06-15] ingest | Docker 입문 독학 노트

- 원본: `raw/notes/docker.md`
- 맥락: ZeroVerse 프로젝트 Docker 배포 준비, 독학 시작. 나중에 Kubernetes도 학습 예정.
- 소스 요약: [[docker-note]]
- 신규 개념 페이지 4개:
  - [[docker]] — 정의·내부 계층(dockerd→containerd→runc), 클라이언트-호스트-레지스트리 구조
  - [[container-virtualization]] — 가상화 3종 비교, 네임스페이스 원리
  - [[docker-image]] — 이미지 개념·레이어 구조·명령어
  - [[docker-container]] — 컨테이너 개념·생명주기·명령어
- 핵심 takeaway:
  - 컨테이너가 VM보다 가벼운 이유: OS 커널을 공유하기 때문. 격리는 리눅스 네임스페이스로.
  - dockerd가 모든 걸 하지 않음: containerd(생명주기)·runc(실제 fork)·shim(중간 버퍼)으로 책임 분리.
  - Image ≠ Container: 이미지는 불변 스냅샷, 컨테이너는 그것의 실행 인스턴스(클래스 vs 객체).
- index.md 갱신: 개념 4개 추가, 소스 1개 추가. 총 115개념/14흐름/32소스.
- TODO: Kubernetes 노트 인제스트 예정.

## [2026-06-21] query | JPA LAZY vs EAGER 페치 전략 차이 설명

- 질문: LAZY와 EAGER 페치 전략의 차이, 언제 어떤 것을 써야 하는지
- 위키 근거: [[jpa-association]] (FetchType.LAZY vs EAGER), [[n-plus-1-problem]] (LAZY가 기본인 이유)
- 위키 외 보완: 즉시 로딩(EAGER)은 JPQL에서 N+1을 유발. `@ManyToOne` 기본값이 EAGER인 점 주의.
- 환류 완료: [[n-plus-1-problem]] Virtuber Holding.stock 실사례 섹션에 LAZY + fetch join 해결 반영.

## [2026-06-21] ingest | Virtuber Spring 프로젝트 — JWT 인증·Refresh Token·계좌 조회 API·N+1 fetch join

- 원본: `raw/dialogues/2026-06-21 Spring 프로젝트 작업 내용과 알게 된 사실.md`
- 맥락: Virtuber 모의투자 백엔드 프로젝트 3 PR(JWT 인증, Refresh Token, 계좌 조회 API) 작업 기록 및 트러블슈팅 정리
- 소스 페이지 신규: [[virtuber-spring-work-2026-06-21]]
- 갱신된 개념 페이지:
  - [[n-plus-1-problem]] — Virtuber Holding.stock LAZY + fetch join 실사례 추가
  - [[refresh-token]] — DB 저장·@Transactional·로그아웃 구현 세부·principal 추출 추가
  - [[jpql]] — @Query fetch join 문법·@Param 사용 예시 추가
  - [[spring-data-jpa]] — @Query vs 파생 메서드 구분·언더바 중첩 속성·No property 오류 추가
  - [[once-per-request-filter]] — filterChain.doFilter 누락 함정(Swagger 빈 화면 사례) 추가
  - [[swagger-oas]] — Spring Security 경로 허용·Bearer auth SecurityScheme·shouldNotFilter 활용 추가
  - [[spring-security]] — AuthenticationEntryPoint/AccessDeniedHandler 섹션 추가
