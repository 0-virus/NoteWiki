# Wiki Index

> 위키 전체 카탈로그. **Query 시 가장 먼저 읽는 파일.** Ingest/Query마다 AI가 갱신한다.
> 형식: `- [[page-name]] — 한 줄 요약`

_Last updated: 2026-06-22 (merged: Docker 입문 노트 + Virtuber Spring 프로젝트 인제스트)_

---

## 개념 (Concepts) — `concepts/`

### AI / LLM / 지식 검색
- [[rag]] — Retrieval-Augmented Generation, 답변 전에 외부 문서 검색해 컨텍스트 주입
- [[embedding]] — 텍스트 의미를 벡터로, 의미 유사도 검색의 핵심 부품
- [[vector-database]] — 임베딩 대량 저장·근사 최근접 검색용 DB (Pinecone·Chroma·pgvector)
- [[llm-wiki-pattern]] — RAG의 대안, AI가 컴파일·유지하는 위키 (이 저장소가 따르는 패턴)

### 도구 / 지식관리
- [[markdown]] — 위키의 토대가 되는 경량 마크업 언어
- [[obsidian]] — 로컬 기반 마크다운 노트 앱, Vault
- [[pi]] — Claude Code 위에 씌워진 코딩 에이전트 하네스, 리소스 3계층(프롬프트 템플릿·스킬·익스텐션)
- [[wikilink]] — `[[연결]]`로 노트를 잇는 핵심 기능
- [[graph-view]] — 노트 연결망을 시각화
- [[obsidian-tags]] — 태그·중첩 태그로 가로지르는 검색
- [[obsidian-properties]] — frontmatter 메타데이터
- [[web-clipper]] — 웹 페이지를 Vault로 수집하는 확장

### CSS / 프론트엔드
- [[css-selector]] — DOM 요소를 가리키는 주소 문법, JS·크롤러·클리퍼가 공통 차용
- [[css-specificity]] — CSS 우선순위: 중요도 → 명시도 → 작성 순서
- [[css-modules]] — `.module.css`로 클래스명을 격리해 전역 충돌 방지

### JavaScript
- [[es-modules]] — import/export, named vs default, 동적 import
- [[javascript-async]] — 동기 vs 비동기, JS 싱글 스레드와 블로킹
- [[callback]] — 가장 오래된 비동기 방식, 콜백 지옥
- [[promise]] — 비동기 결과를 담는 객체, 3상태와 정적 메서드
- [[async-await]] — Promise를 동기 코드처럼 쓰는 문법 설탕

### Node.js / npm
- [[node-modules]] — 프로젝트별 의존성 격리 폴더
- [[npm-dependency-files]] — package.json / package-lock.json / .package-lock.json

### 데이터베이스
- [[database-index]] — 인덱스의 개념, B-tree/B+tree 구조, 클러스터드 인덱스, DDL 문법, 인덱스 힌트
- [[covering-index]] — 쿼리에 필요한 컬럼이 모두 인덱스 안에 있어 테이블 접근 생략하는 최적화
- [[explain]] — MySQL EXPLAIN으로 쿼리 실행 계획 확인 (type·key·Extra 컬럼 해석)
- [[ddl-lock]] — ALTER TABLE의 메타데이터 락 구조, 서비스 멈춤 원인, pt-osc·Instant DDL 해결책
- [[orm]] — 객체-관계 매핑, 장점과 한계
- [[prisma]] — JS/TS 전용 ORM, 스키마와 클라이언트
- [[mybatis]] — Java SQL Mapper, ORM이 아닌 중간 추상화 (namespace ↔ 인터페이스 매핑)
- [[n-plus-1-problem]] — ORM에서 흔한 쿼리 비효율과 해결
- [[connection-pool]] — DB Connection을 미리 만들어 두고 빌려주고 반납받는 자원 캐시
- [[hikaricp]] — Spring Boot 기본 Connection Pool 구현체, "빛"이라는 이름답게 빠름
- [[jpa]] — 자바 진영 ORM 표준 명세, 패러다임 불일치를 푸는 객체 중심 영속성
- [[hibernate]] — JPA의 사실상 표준 구현체 (명세 vs 구현)
- [[spring-data-jpa]] — JpaRepository 인터페이스 선언만으로 CRUD·페이징 자동 구현
- [[entity-manager]] — 엔티티 생명주기 관리자 + EntityManagerFactory, 영속성 컨텍스트
- [[persistence-context]] — 엔티티를 보관하는 "작업대", 변경 감지·1차 캐시·생명주기·flush
- [[jpa-entity-mapping]] — `@Entity`·`@Id`·`@Column`·키 생성 전략·복합 키 매핑·래퍼 클래스
- [[jpa-association]] — `@OneToMany`/`@ManyToOne`, 연관 관계 주인·페치·영속성 전이
- [[jpa-auditing]] — @EnableJpaAuditing, @MappedSuperclass, BaseEntity 패턴, 자동 타임스탬프
- [[jpql]] — 엔티티 대상 객체 지향 쿼리, Criteria·QueryDSL·Native SQL 보완
- [[querydsl]] — 타입 세이프 쿼리 빌더, QType + JPAQueryFactory + BooleanBuilder로 동적 쿼리
- [[optimistic-pessimistic-lock]] — 낙관적(@Version) vs 비관적(@Lock) 락, 데드락 해결 4가지, ETag 연결

### Java / 언어 기초
- [[jvm-memory]] — Method Area / Heap / Stack 3대 메모리 영역
- [[static-keyword]] — 객체와 무관하게 클래스에 속하는 멤버
- [[equals-hashcode]] — 동등 비교와 해시, 함께 오버라이딩해야 하는 이유
- [[mutable-immutable]] — 가변 vs 불변 객체, 불변의 이점과 비용
- [[string-pool]] — 같은 문자열 리터럴을 공유하는 Heap 영역
- [[java-buffer]] — 버퍼 원리, Scanner의 nextLine 함정
- [[short-circuit]] — `&&`·`||`의 단축 평가, Java/JS 차이
- [[generics]] — 타입을 파라미터처럼 받는 기능
- [[functional-interface]] — 추상 메서드 1개짜리 인터페이스, 람다의 타겟 타입
- [[lambda]] — 함수형 인터페이스 구현을 짧게 쓰는 문법
- [[anonymous-class]] — 즉석 구현체, 람다의 전신
- [[java-record]] — JDK 16+ 불변 데이터 클래스를 한 줄로 정의

### 보안 / 인증
- [[cookie]] — HTTP 쿠키, 무상태 HTTP의 첫 번째 해법, HttpOnly/Secure 옵션
- [[session-auth]] — 세션 기반 Stateful 인증, IP 바인딩과 확장성 한계
- [[jwt]] — JSON Web Token, 서명 기반 Stateless 인증, 구조와 신뢰성 근거
- [[refresh-token]] — Access Token 재발급 + Rotation으로 탈취 감지
- [[jwt-claims]] - JWT Payload key-value set such as sub/email/role/iat/exp
- [[security-context]] - Spring Security context that holds Authentication for the current request
- [[serialization]] — 객체 → 전송 가능한 문자열, 직렬화/역직렬화 개념
- [[spring-security]] — SecurityFilterChain, HttpSecurity, CSRF·STATELESS 설정, BCryptPasswordEncoder
- [[once-per-request-filter]] - Spring Web filter base class that runs once per request; useful for JWT filters
- [[bean-validation]] — @Valid, @NotBlank vs @NotNull, Jakarta Bean Validation 어노테이션 정리

### 시스템 디자인 / 인프라
- [[proxy]] — 네트워크 통신의 중간자, Forward와 Reverse는 위치만 다른 한 쌍
- [[forward-proxy]] — 클라이언트 측 프록시, 사내망 게이트웨이·콘텐츠 필터링
- [[reverse-proxy]] — 서버 측 프록시, IP 은닉·캐싱·로드 밸런싱 게이트
- [[load-balancer]] — 여러 서버 앞단에서 요청을 분산하는 장치, 성능 + 고가용성
- [[load-balancing-algorithm]] — Round Robin / Weighted RR / Least Connection / IP Hash
- [[horizontal-vs-vertical-scaling]] — 한 대를 키우기 vs 여러 대로 늘리기
- [[high-availability]] — SPOF를 없애는 다중화, Active-Active / Active-Passive
- [[nginx]] — 리버스 프록시·LB 대표 구현, 실습 가능한 설정 예시 수록

### 컨테이너 / 배포 (Docker)
- [[docker]] — Docker 전체 메타 페이지: 정의·내부 구성(dockerd·containerd·runc)·클라이언트-호스트-레지스트리 구조
- [[container-virtualization]] — 호스트/하이퍼바이저/컨테이너 가상화 3종 비교, 네임스페이스
- [[docker-image]] — 이미지 = 실행 가능한 스냅샷 패키지, 레이어 구조, pull/ls 명령어
- [[docker-container]] — 이미지의 실행 인스턴스, 생명주기, run/ls 명령어

### Java / 웹 (Servlet·Spring)
- [[servlet-spec]] — "Java로 웹 처리하려면 이렇게 하라"는 Jakarta EE 표준 명세 (구현체 = Tomcat 등)
- [[servlet]] — 웹 요청을 처리하는 주체가 되는 Java 클래스
- [[jsp]] — HTML에 Java를 삽입한 문서, "JSP는 결국 Servlet"
- [[jstl-el]] — JSP의 `${...}`·`<c:forEach>`, 스크립틀릿을 대체하는 표현 도구
- [[servlet-container]] — Tomcat: HTTP 처리를 대신하는 런타임
- [[servlet-lifecycle]] — init/service/destroy와 싱글톤 관리
- [[mvc-pattern]] — Servlet(Controller) + JSP(View) 역할 분리
- [[dispatcher-servlet]] — Spring MVC의 Front Controller, 4부품(HandlerMapping/Adapter/ViewResolver/Converter)에 위임
- [[filter]] — [[servlet-spec|서블릿 스펙]]의 가로채기, 정문 경비원 (인코딩·XSS·CORS)
- [[interceptor]] — 스프링 MVC의 가로채기, 컨트롤러 문 앞 비서 (인증·권한)
- [[dao-pattern]] — 데이터 접근을 전담 객체로 분리하는 패턴
- [[jdbc]] — Java의 표준 DB 접근 API, Driver/Connection/ResultSet
- [[forward-vs-redirect]] — 서버 내부 이동 vs 브라우저 재요청
- [[prg-pattern]] — POST 후 Redirect로 중복 처리 방지
- [[concurrency-problem]] — 공유 자원 동시 접근 (Servlet ↔ DB 트랜잭션)

### Spring / 코어
- [[spring-framework]] — Spring 전체 메타 페이지, 학습 트리 진입점
- [[lombok]] — @RequiredArgsConstructor vs @AllArgsConstructor, DI용 생성자 자동 생성
- [[spring-annotations]] — 자주 쓰는 Spring 어노테이션을 한곳에서 찾는 참조 인덱스 허브
- [[aop]] — 횟단 관심사(로깅·트랜잭션·보안)를 핵심 로직에서 분리하는 패러다임, Proxy 기반
- [[transaction]] — DB 작업의 원자적 단위, ACID와 Spring `@Transactional` 동작 원리
- [[transaction-propagation]] — `REQUIRED` vs `REQUIRES_NEW`, rollback-only와 `UnexpectedRollbackException`
- [[spring-boot]] — 자동 설정·내장 WAS·jar 배포로 Spring을 쉽게 쓰는 도구
- [[dependency-injection]] — 의존 객체를 외부에서 주입받는 패턴
- [[inversion-of-control]] — 제어의 역전, 객체 생성·결합을 컨테이너로 넘김
- [[spring-bean]] — Spring IoC Container가 관리하는 객체
- [[solid-principles]] — SRP/OCP/LSP/ISP/DIP, Spring이 자동화하는 5원칙
- [[pojo]] — 어떤 상속·구현도 없는 평범한 Java 객체
- [[maven]] — XML 기반 Java 빌드 도구, `pom.xml`
- [[gradle]] — Groovy 기반 Java 빌드 도구, `build.gradle`

### Spring / 웹·아키텍처
- [[three-tier-architecture]] — Web/Service/Repository 계층, MVC와 다른 축
- [[dto-vs-entity]] — 운반체와 도메인 본체의 분리
- [[domain]] — "이 소프트웨어가 다루는 현실 영역" + 네트워크 도메인 분기
- [[api-response-wrapper]] — `{success, message, data}` 공통 응답 래퍼, DTO 위 메타 한 겹

### 웹 / HTTP·REST
- [[restful-api]] — URI=명사, 동사=HTTP 메서드의 API 설계
- [[http-status-codes]] — 2xx/4xx/5xx 적극 활용·Spring `ResponseStatusException` 던지기
- [[content-negotiation]] — Accept·Content-Type, JSON/XML 자동 선택
- [[http-method-override]] — `X-HTTP-Method-Override`, Filter로만 가능한 이유
- [[etag]] — 리소스 버전 도장, `If-None-Match`·304로 캐싱·동시성 제어
- [[swagger-oas]] — OpenAPI Spec과 Swagger UI, API 자동 문서화

## 흐름 (Flows) — `flows/`

- [[js-async-evolution]] — Callback → Promise → async/await 발전 흐름
- [[npm-install-flow]] — package.json → lock → node_modules 설치·동기화
- [[prisma-workflow]] — 설치 → init → schema → migrate → CRUD
- [[servlet-to-spring-mvc]] — Servlet/JSP가 Spring MVC로 이어지는 진입 흐름
- [[anonymous-class-to-lambda]] — 제네릭 → 함수형 인터페이스 → 익명 클래스 → 람다
- [[scaling-a-web-app]] — 단일 Tomcat → 리버스 프록시 → LB → 멀티 LB까지 단계적 확장
- [[manual-di-to-spring-ioc]] — 직접 `new` → DI → 인터페이스 → IoC 컨테이너 4단계 진화
- [[filter-vs-interceptor]] — 두 가로채기 기술의 위치·책임·선택 기준 비교
- [[spring-mvc-request-flow]] — 한 요청의 풀 파이프라인 (Filter → DispatcherServlet → Interceptor → Controller → Service → DAO → DB)
- [[rag-vs-llm-wiki]] — AI에게 외부 지식을 주는 두 패턴의 트레이드오프 비교
- [[mybatis-to-jpa]] — SQL Mapper에서 ORM으로의 전환·공존 흐름 (1:1 대응표 + 절차)
- [[cookie-session-jwt]] — 쿠키 → 세션 → JWT 인증 발전 흐름, Spring 구현 위치까지
- [[spring-security-register-flow]] — SecurityConfig → Controller(@Valid) → Service(BCrypt) → Repository 회원가입 전체 파이프라인
- [[spring-security-jwt-auth-flow]] - login verification, Access Token issue, JWT filter, SecurityContext, AuthorizationFilter flow

## 소스 (Sources) — `sources/`

- [[css-cascade-priority]] — `raw/notes/CSS 참조 우선순위.md` (해커톤 CSS 우선순위 정리)
- [[js-import-export]] — `raw/notes/JavaScript - Import와 export.md`
- [[nodejs-dependency-management]] — `raw/notes/Node.js - node_modules와 의존성 관리.md`
- [[prisma-orm]] — `raw/notes/Prisma 필기.md` (블로그 프로젝트 백엔드 학습)
- [[js-async]] — `raw/notes/비동기의 모든 것.md`
- [[obsidian-basics-video]] — `raw/youtube/옵시디언 쌩 기초는 탄탄하게…` (옵시디언 입문 강의)
- [[servlet-jsp-dialogue]] — `raw/dialogues/Servlet과 JSP의 차이 및 활용.md` (Spring 진입 전 기초)
- [[servlet-jdbc-debugging]] — `raw/dialogues/conversation.md` (jwbook 실습 디버깅 17건)
- [[jvm-memory-note]] — `raw/notes/JVM의 메모리 할당.md`
- [[static-note]] — `raw/notes/static의 개념과 활용.md`
- [[equals-hashcode-note]] — `raw/notes/hashCode와 equals.md`
- [[mutable-immutable-note]] — `raw/notes/가변 객체 vs 불변 객체.md`
- [[java-buffer-note]] — `raw/notes/Java의 버퍼.md`
- [[short-circuit-note]] — `raw/notes/Java의 쇼트 서킷.md`
- [[functional-interface-table]] — `raw/notes/Functional Interface.md`
- [[generics-lambda-note]] — `raw/notes/제네릭, 람다, 함수형 인터페이스, 익명 클래스.md`
- [[proxy-forward-reverse-video]] — `raw/youtube/Proxy(프록시)란 Forward vs Reverse Proxy…` (코딩문)
- [[load-balancing-video]] — `raw/youtube/Load Balancing 로드 밸런싱이 뭔가요…` (코딩문)
- [[spring-framework-1-note]] — `raw/notes/Spring Framework.md` (부트캠프 강의자료 §1~§3)
- [[mybatis-practice-debugging]] — `raw/notes/study-notes.md` (MyBatis 실습 Claude 대화 정리, 8건 디버깅 일지)
- [[pi-dialogue]] — `raw/dialogues/2026-05-27 pi 하네스 이해와 설정 — 슬래시 커맨드·스킬·익스텐션 구조.md`
- [[jpa-lecture]] — `raw/lectures/JPA.md` (부트캠프 "MyBatis to JPA" 강의 노트)
- [[spring-transaction-proxy-dialogue]] — `raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md` (강의 복습 중 프로젝트 재점검)
- [[querydsl-reference-guide]] — `raw/articles/Querydsl Reference Guide.md` (공식 레퍼런스 v5.0.0, QType·JPAQueryFactory·BooleanBuilder·Projections)
- [[authentication-note]] — `raw/notes/인증.md` (사이드 프로젝트 JWT 구현 전 Cookie/Session/JWT 원리 정리)
- [[zeroverse-spring-practice]] — `raw/notes/zeroverse_note_2026-06-09.md` (ZeroVerse 블로그 Spring 실습, JPA 엔티티·Security·Validation)
- [[spring-component-di-security-dialogue]] — `raw/dialogues/2026-06-10 Spring @Component · Bean · DI · Security Filter Chain 개념 문답.md`
- [[zeroverse-spring-security-jwt-dialogue]] - raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md
- [[index-what-is-it]] — `raw/youtube/index가 뭔지 설명해보세요...` (코딩애플, B-tree·B+tree·클러스터드 인덱스)
- [[index-trap]] — `raw/youtube/(280) 인덱스 걸었는데 왜 3초나 걸리죠!...` (인덱스 함정 3가지·EXPLAIN·커버링)
- [[ddl-trap]] — `raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다...` (MDL·ALTER TABLE WAITING·pt-osc)
- [[virtuber-spring-work-2026-06-21]] — `raw/dialogues/2026-06-21 Spring 프로젝트 작업 내용과 알게 된 사실.md` (Virtuber JWT 인증·Refresh Token·계좌 조회·N+1 fetch join)
- [[docker-note]] — `raw/notes/docker.md` (Docker 입문 독학 노트 — 컨테이너 가상화·구성 요소·이미지·컨테이너)

---

### 통계

- 개념 페이지: 116
- 흐름 페이지: 14
- 소스 페이지: 32
- 통합한 원본 수: 32
