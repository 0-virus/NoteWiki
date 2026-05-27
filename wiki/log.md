# Wiki Log

> 시간순 작업 기록. **Append-only** — 기존 항목은 수정하지 않는다.
> 형식: `## [YYYY-MM-DD] <ingest|query|lint> | <제목>`
> 최근 활동 확인: `grep "^## \[" log.md | tail -5`

---

## [2026-05-18] init | 위키 초기화

LLM Wiki 패턴으로 NoteWiki 세컨드 브레인 세팅 완료.
- 폴더 구조 생성: `raw/`(articles, lectures, practice, notes, assets), `wiki/`(concepts, flows, sources), `Output/`
- 루트 `CLAUDE.md`에 위키 운영 규칙(3계층, 3대 작업) 추가
- 각 폴더에 하위 `CLAUDE.md` 생성
- `wiki/index.md`, `wiki/log.md` 초기화
- 다음 단계: `raw/`에 첫 원본을 넣고 ingest.

## [2026-05-18] setup | Web Clipper 템플릿 5종 추가

Obsidian Web Clipper 템플릿을 소스 유형별로 생성, `raw/` 클리핑 폴더 확장.
- 템플릿: `clipper-article/youtube/podcast/book/research.json` (저장소 루트)
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

