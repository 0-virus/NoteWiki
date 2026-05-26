---
type: concept
tags: [java, servlet, tomcat, web]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# Servlet Container (Tomcat)

## 한 줄 정의

[[servlet]]을 실행·관리하는 런타임. **HTTP의 복잡한 처리를 대신 해주는 중간 관리자.**
대표 구현이 **Tomcat**이다.

## 왜 필요한가

Java 코드는 혼자서 HTTP를 다룰 수 없다. 요청 하나가 들어오면 이런 일이 필요하다.

- TCP 연결 수락
- HTTP 텍스트를 파싱 → 메서드·URL·헤더·바디 분리
- 적절한 Servlet을 찾아 실행
- Servlet이 만든 응답을 HTTP 형식으로 변환·전송
- 연결 종료 / 유지

이걸 개발자가 매번 직접 짜면 비즈니스 로직 짤 시간이 없다.
**Tomcat이 이 전부를 대신**하고, 개발자는 `doGet` 안의 로직만 채운다. → 관심사의 분리.

## Tomcat이 하는 일 흐름

```
브라우저 ──HTTP 요청(텍스트)──▶ [Tomcat]
   1. TCP 연결 수락
   2. HTTP 파싱 → HttpServletRequest 객체 생성
   3. URL 보고 어떤 Servlet인지 찾음 (Servlet 매핑)
   4. Servlet 인스턴스 없으면 생성 (최초 1회)
   5. doGet / doPost 호출
   6. Servlet이 HttpServletResponse에 결과 작성
   7. Response를 HTTP 텍스트로 변환
브라우저 ◀──HTML 수신──
```

2번에서 만들어진 `HttpServletRequest`가 바로 `doGet(req, res)`의 `req`다.
Servlet을 관리하는 방식은 [[servlet-lifecycle]] 참고.

## Spring Boot의 내장 Tomcat

전통적 배포는 Tomcat을 따로 설치하고 `.war`를 `webapps`에 복사하는 방식이라 번거로웠다.
Spring Boot는 이를 뒤집어 **Tomcat을 앱 안에 내장**시켰다.

```
.jar 하나로 패키징 → java -jar app.jar 한 줄로 실행
```

`SpringApplication.run()`이 내장 Tomcat을 함께 띄우고 포트를 연다.
`localhost:8080` 접속이 가능한 이유가 이것. Spring의 `DispatcherServlet`도
결국 이 Tomcat 위에서 도는 하나의 Servlet이다.

## 영균의 학습 맥락

현재 **Tomcat으로 WAS 동작 원리를 실습 중** — 이 페이지가 그 실습의 "왜"에 해당한다.
Tomcat을 손으로 만져보면, Spring Boot가 "내장 Tomcat"으로 감춘 것이 무엇인지 체감된다.

## 관련 페이지

- [[servlet-spec]] — 컨테이너가 구현해야 하는 표준 명세서
- [[servlet]] — 컨테이너가 호출·실행하는 대상
- [[servlet-lifecycle]] — 컨테이너의 Servlet 관리 방식
- [[servlet-to-spring-mvc]] — 내장 Tomcat과 DispatcherServlet
- [[spring-boot]] — Tomcat을 `.jar` 안으로 내장하는 형태
- 인프라 확장 가지: [[reverse-proxy]] · [[load-balancer]] · [[scaling-a-web-app]] —
  단일 Tomcat을 외부에 직접 노출하지 않고 앞에 [[nginx]] 한 층 두는 다음 단계
- 출처: [[servlet-jsp-dialogue]]
