---
type: concept
tags: [java, servlet, concurrency]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# Servlet 생명주기 & 싱글톤

## 한 줄 정의

[[servlet-container]]가 Servlet 인스턴스를 **하나만 만들어 모든 요청이 공유**하도록
관리하는 방식. init → service → destroy의 생애를 가진다.

## 생명주기

```
최초 요청 → init()      ← 인스턴스 생성 (딱 1번)
          → service()   ← doGet/doPost 분기
이후 요청  → service()   ← 같은 인스턴스 재사용
서버 종료  → destroy()   ← 정리 작업
```

## 왜 싱글톤으로 관리하는가

매 요청마다 `new`로 인스턴스를 만들면, 트래픽이 몰릴 때 초당 수천 개가
생성·소멸을 반복한다 — 메모리와 GC에 큰 부담.
그래서 Tomcat은 **인스턴스 하나를 만들어 두고 모든 요청이 공유**한다. 이것이 싱글톤.

```
최초 요청 → new HelloServlet() → 인스턴스 보관
요청 1·2·3 ──▶ 같은 인스턴스 → doGet() 동시 실행
```

## 싱글톤의 함정: 동시성 문제

인스턴스가 공유되므로 **인스턴스 변수에 상태를 두면 위험**하다.

```java
public class BadServlet extends HttpServlet {
    private int count = 0;             // 인스턴스 변수 — 모든 요청이 공유 (위험!)
    protected void doGet(...) { count++; }  // 동시 실행 시 값이 꼬임
}
```

- **인스턴스 변수** → 힙에 하나 → 모든 스레드 공유 → 위험
- **지역 변수** → 각 스레드의 스택에 독립 생성 → 안전

→ **기본 원칙: Servlet 안에 상태를 인스턴스 변수로 갖지 마라.**
자세한 메커니즘은 [[concurrency-problem]] 참고.

## Spring으로 이어지는 지점

[[spring-bean]]도 기본이 싱글톤이다. 관리 주체만 다를 뿐(Tomcat ↔ Spring Container)
이유는 같다 — 매번 새로 만드는 비용 회피. 그래서 "상태를 인스턴스 변수로 갖지 마라"는
원칙이 Spring Bean에도 그대로 적용된다.

## 관련 페이지

- [[servlet]] / [[servlet-container]] — 관리되는 대상과 관리 주체
- [[concurrency-problem]] — 동시성 문제의 메커니즘
- [[spring-bean]] — 같은 싱글톤 원리
- 출처: [[servlet-jsp-dialogue]]
