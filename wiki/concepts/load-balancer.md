---
type: concept
tags: [system-design, load-balancing, scaling, high-availability]
updated: 2026-05-21
sources: ["raw/youtube/Load Balancing 로드 밸런싱이 뭔가요 쉽게 이해하는 로드 밸런서의 기초 개념과 역할 시스템 디자인.md"]
---

# Load Balancer (로드 밸런서)

## 한 줄 정의

**여러 서버 앞단에 서서 들어오는 요청을 골고루 나눠주는 장치.**
[[reverse-proxy]]의 한 형태이지만, 분산 그 자체가 본업이라는 점에서 별도 개념으로 다룬다.

## 왜 필요한가 — 두 가지 존재 이유

### 1. 성능 (Performance)

서버 한 대의 [[horizontal-vs-vertical-scaling|수직 확장]]은 하드웨어 상한에 부딪힌다.
**서버를 여러 대로 늘리는 [[horizontal-vs-vertical-scaling|수평 확장]]** 이 답인데,
그러려면 트래픽을 누가 나눠줘야 한다 — 그 역할이 로드 밸런서다.

### 2. 고가용성 (High Availability)

서버 한 대만 있으면 그 한 대가 죽는 순간 서비스 전체가 죽는다 ([[high-availability]]의 SPOF).
LB가 뒤에 여러 대를 두고 있으면, 한 대가 죽어도 다른 대들로 트래픽을 우회시킬 수 있다.
→ "Heath Check"로 죽은 서버를 분배 대상에서 자동 제외.

이 둘은 분리된 효용이 아니라 **같이 따라온다**. "서버를 여러 대 둔다"는 결정이
성능과 가용성을 동시에 사준다.

## 흐름

```
       [클라이언트들의 요청]
                │
                ▼
        ┌──────────────┐
        │ Load Balancer│   ← 외부에 보이는 단일 진입점
        └──────────────┘
          │   │   │
          ▼   ▼   ▼
       [서버1] [서버2] [서버3]   ← 실제로 요청을 처리
```

클라이언트는 단일 서버와 통신한다고 느끼지만, 실제로는 매번 다른 백엔드가 답한다.

## "어떻게 나눌까" — [[load-balancing-algorithm]]

분배 방식이 곧 LB의 성격을 결정한다. 별도 페이지에서 4가지를 정리:
**Round Robin · Weighted Round Robin · Least Connection · IP Hash.**

## LB도 죽는다 — 다중화

LB를 두는 순간 LB 자신이 새로운 [[high-availability|단일 장애점(SPOF)]] 이 된다.
이를 해결하기 위한 두 패턴:

- **Active-Active** — LB 두 대 모두 가동. 한쪽이 죽어도 즉시 다른 쪽이 받음.
- **Active-Passive** — 한쪽만 가동, 다른 쪽은 대기. 장애 시 페일오버.

영상에서도 *"LB가 죽으면 서비스가 죽는다 → 그래서 LB도 다중화한다"* 가 핵심 마무리였다.

## L4 vs L7 (영상에는 없지만 알아둘 가지)

> ℹ️ 참고: 이 구분은 영상에서 다루지 않았다. 실무에서 자주 등장하는 가지로 추가.

| 구분  | 기준                       | 예시                            |
| ----- | -------------------------- | ------------------------------- |
| L4 LB | TCP/UDP, IP·포트만 본다    | AWS NLB, HAProxy(TCP 모드)      |
| L7 LB | HTTP 헤더·URL·쿠키까지 본다 | [[nginx]], AWS ALB, HAProxy(HTTP) |

L7은 "이 URL은 A 서버군으로, 이 헤더가 있으면 B 서버군으로" 같은 정교한 라우팅이 가능.
영상의 모든 알고리즘은 보통 L7 LB에서 다뤄진다.

## 영균의 학습 맥락

[[servlet-container]]의 Tomcat을 여러 대 띄우는 순간 LB가 필요하다.
실습 차원에서는 [[nginx]]에 `upstream` 블록을 정의해 Tomcat 두 대 앞에 두는 것이
가장 흔한 시작점 — [[nginx]] 페이지의 LB 설정 예시 참고.

[[reverse-proxy]]와의 관계: 모든 LB는 일반적으로 reverse proxy의 한 종류이지만,
**"분산"** 이 본업이라는 점이 다르다. Nginx는 한 가지 도구로 둘 다 한다.

## 관련 페이지

- [[load-balancing-algorithm]] — 4가지 분배 방식
- [[horizontal-vs-vertical-scaling]] — LB가 필요한 이유의 출발점
- [[high-availability]] — LB가 답하려는 두 번째 효용 + LB 자체 다중화
- [[reverse-proxy]] · [[nginx]]
- [[scaling-a-web-app]] — 영균의 Tomcat 실습이 어디로 확장되는가
- 출처: [[load-balancing-video]]
