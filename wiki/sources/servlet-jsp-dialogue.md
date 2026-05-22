---
type: source
tags: [java, servlet, jsp, web, spring, clippings/claude]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# 소스: Servlet과 JSP의 차이 및 활용 (Claude 대화)

> 원본: `raw/dialogues/Servlet과 JSP의 차이 및 활용.md`
> Claude와의 18메시지 대화 · 2026-05-19 클리핑.

## 맥락 (왜 캡처했나)

**Spring 진입 전 기초를 확실히 다지려고** 캡처한 대화다.
영균은 현재 **Tomcat으로 WAS 동작 원리를 실습하는 단계**이며,
이 대화로 **Servlet/JSP가 Spring MVC로 어떻게 이어지는지 연결 흐름을 정리**하는 것이 목표다.

> 대화 전반에서 Claude가 반복하는 메시지: "Spring이 추상화로 감춰주지만,
> 내부 동작은 결국 이 구조 위에 있다. 기반을 알면 Spring 이해가 수월하다."
> → 이 소스는 영균의 학습 동선(Tomcat → Servlet → Spring MVC) 한가운데 있다.

## 핵심 주장 (Key Claims)

- **Servlet은 Java 클래스가 웹 요청을 처리하는 주체**, **JSP는 HTML에 Java를 삽입한 문서** —
  그리고 **JSP는 결국 Servlet으로 변환·컴파일된다** (JSP는 Servlet의 문법적 설탕).
- 현업은 둘을 분리해 쓴다: Servlet=Controller, JSP=View → **MVC 패턴**.
- **Forward**는 서버 내부 이동(요청 1번, request 유지), **Redirect**는 브라우저 재요청
  (요청 2번, request 초기화). POST 처리 후엔 중복 방지를 위해 **PRG 패턴**으로 Redirect한다.
- **Servlet Container(Tomcat)**가 TCP·HTTP 파싱·Servlet 매핑·생명주기를 대신 처리한다.
  개발자는 `doGet`에 비즈니스 로직만 채운다.
- Tomcat은 Servlet을 **싱글톤**으로 관리(인스턴스 1개 공유) → 인스턴스 변수에 상태를 두면
  **동시성 문제(Race Condition)**가 생긴다. 상태는 지역 변수로.
- **Spring Bean**도 같은 이유로 싱글톤이며, `@GetMapping`·`DispatcherServlet` 등
  Spring의 핵심 장치는 모두 Servlet 구조의 추상화다.
- Spring 진입에는 "능숙한 작성"이 아니라 **"동작 원리 이해" 수준**이면 충분하다.

## 엔티티 (Entities)

- 도구: Servlet, JSP, Tomcat, Spring MVC, Spring Boot, JSTL, Thymeleaf
- 개념 키워드: MVC, forward/redirect, PRG, IoC, Bean, Race Condition, 싱글톤

## 위키 반영

- [[servlet]] — 요청 처리의 주체인 Java 클래스
- [[jsp]] — HTML 안에 Java를 삽입한 문서, "JSP는 결국 Servlet"
- [[servlet-container]] — Tomcat이 왜 필요한가, 무엇을 대신해주는가 (영균 실습 단계)
- [[servlet-lifecycle]] — init/service/destroy와 싱글톤 관리
- [[mvc-pattern]] — Servlet(Controller) + JSP(View) 역할 분리
- [[forward-vs-redirect]] — 서버 이동 vs 브라우저 재요청
- [[prg-pattern]] — POST 후 Redirect로 중복 처리 방지
- [[concurrency-problem]] — 공유 자원 동시 접근 (Servlet ↔ DB 트랜잭션 공통)
- [[spring-bean]] — Spring이 관리하는 객체, IoC
- 흐름: [[servlet-to-spring-mvc]] — Servlet/JSP가 Spring MVC로 이어지는 진입 흐름
