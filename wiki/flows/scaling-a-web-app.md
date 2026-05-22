---
type: flow
tags: [system-design, scaling, load-balancing, high-availability]
updated: 2026-05-21
sources: [
  "raw/youtube/Proxy(프록시)란 Forward vs Reverse Proxy 차이점은 무엇일까 시스템 디자인.md",
  "raw/youtube/Load Balancing 로드 밸런싱이 뭔가요 쉽게 이해하는 로드 밸런서의 기초 개념과 역할 시스템 디자인.md"
]
---

# 웹 앱 스케일링 흐름 — 단일 Tomcat에서 멀티 LB까지

> **왜 이 흐름인가**: 부트캠프에서 영균이 보고 막혔던 "다른 팀의 인프라 그림"을
> [[servlet-container|단일 Tomcat]] 학습 단계에서 출발해 한 단계씩 도착점까지 잇는 이야기.
> 두 영상([[proxy-forward-reverse-video]]·[[load-balancing-video]])의 모든 개념을
> **순서**로 꿰면 이렇게 된다.

## 전체 그림

```
[단계 0] 단일 Tomcat
[단계 1] + 리버스 프록시 (Nginx)
[단계 2] + Vertical Scaling (임시방편)
[단계 3] → Horizontal Scaling + 로드 밸런서
[단계 4] + 세션 외부화 (stateless 화)
[단계 5] + LB 다중화 (Active-Active / Passive)
```

각 단계는 **앞 단계의 SPOF 또는 한계를 해소**하면서 새 SPOF·복잡도를 만든다.
HA 설계의 본질은 이 연쇄의 어느 지점에 멈출지 정하는 것.

---

## 단계 0 — 단일 [[servlet-container|Tomcat]]

```
[클라이언트] ──▶ [Tomcat :8080]
```

영균의 현재 학습 단계. **단순하지만 모든 부담을 Tomcat이 짊어진다**:
- 외부 80/443에 직접 노출 → 공격에 무방비
- HTTPS·정적 파일·로깅·세션 전부 Tomcat이 처리
- 죽으면 끝 (SPOF)

**문제**: 트래픽 늘면 느려지고, 한 번 죽으면 서비스 다운.

---

## 단계 1 — 앞에 [[reverse-proxy]] 한 대 ([[nginx]])

```
[클라이언트] ──▶ [Nginx :80] ──▶ [Tomcat :8080]
```

**확장과 무관하게도 유용한 한 단계.** 얻는 것:
- Tomcat IP·포트 외부 은닉
- HTTPS 종단을 Nginx로 이관
- 정적 파일은 Nginx가 직접 서빙 (Tomcat 부담↓)
- 1차 방어선 (레이트 리미트·헤더 필터 등)

설정 예시는 [[nginx]] 페이지의 "실습 예시 1".

**남는 문제**: 그래도 백엔드는 한 대 → 여전히 SPOF.

---

## 단계 2 — [[horizontal-vs-vertical-scaling|Vertical Scaling]] (임시방편)

```
[클라이언트] ──▶ [Nginx] ──▶ [Tomcat (CPU↑ RAM↑ DISK↑)]
```

쉬운 길: Tomcat이 도는 머신의 사양을 올린다.
- **장점**: 코드·인프라 그대로
- **한계**: 하드웨어 상한·비용 곡선·**여전히 SPOF**

영상의 말 그대로: *"Vertical은 Horizontal로 가기 전 임시방편."*

---

## 단계 3 — [[horizontal-vs-vertical-scaling|Horizontal Scaling]] + [[load-balancer]]

```
                       ┌──▶ [Tomcat :8080]
[클라이언트] ──▶ [Nginx] ──▶ [Tomcat :8081]
                       └──▶ [Tomcat :8082]
```

Tomcat을 여러 대 띄우고, Nginx의 `upstream` 블록으로 분산.
- 처리량↑ + **자연스럽게 [[high-availability]]** (한 대 죽어도 나머지가 받음)
- 분배 규칙은 [[load-balancing-algorithm]]에서 선택 (RR/WRR/Least Conn/IP Hash)

설정 예시는 [[nginx]] 페이지 "실습 예시 2".

**남는 문제**:
- 세션이 Tomcat 메모리에 있으면, 다음 요청이 다른 Tomcat으로 가면 세션 날아감
- **임시 처방**: `ip_hash`로 같은 클라는 같은 Tomcat에 고정 (Sticky Session)

---

## 단계 4 — 세션 외부화 (진정한 stateless)

```
                       ┌──▶ [Tomcat]
[클라이언트] ──▶ [Nginx] ──▶ [Tomcat]    ──▶ [Redis] (세션 공유)
                       └──▶ [Tomcat]
```

세션을 외부 저장소(Redis)로 빼면 모든 Tomcat이 같은 세션을 본다.
→ [[load-balancing-algorithm|Round Robin]]·[[load-balancing-algorithm|Least Connection]] 등
**Sticky 제약 없이** 어떤 알고리즘이든 자유롭게 쓸 수 있다.
이게 "stateless 서비스"의 실제 모습.

> ⚠️ 이 단계는 영상에서 직접 다루지 않음. [[horizontal-vs-vertical-scaling]]에서
> "stateless가 강조되는 이유"의 실제 답이라 흐름에 포함.

---

## 단계 5 — LB 다중화

```
                  [Nginx-A]                 ┌──▶ [Tomcat]
[클라이언트] ──▶ ┤  (Active)  ├──▶ ...  ──▶ [Tomcat]
                  [Nginx-B]                 └──▶ [Tomcat]
                  (Active/Passive)
```

단계 3에서 Nginx 자체가 새 SPOF가 됨 → 그 자체를 다중화.
- [[high-availability|Active-Active]] / [[high-availability|Active-Passive]]
- 보통 그 앞에 가상 IP(VIP) + Keepalived, 또는 클라우드 매니지드 LB(AWS NLB/ALB)

여기까지 오면 영상이 마지막에 그린 그림 그대로다.

---

## 단계별 SPOF 추적

| 단계 | 남은 SPOF                     | 다음 단계가 해결하는 것 |
| ---- | ----------------------------- | ----------------------- |
| 0    | Tomcat 자체                   | 리버스 프록시 + 다중화  |
| 1    | Tomcat 자체                   | 백엔드 다중화           |
| 2    | Tomcat 자체 (그저 더 큰 한 대)| 백엔드 다중화           |
| 3    | Nginx, 세션이 in-memory       | 세션 외부화             |
| 4    | Nginx                         | LB 다중화               |
| 5    | DB·Redis (영상 범위 밖)       | DB 복제·샤딩            |

DB·Redis는 이 흐름 페이지의 범위 밖이지만, **HA 설계는 결국 SPOF를 한 칸씩 미는 작업**임을
보여주는 표.

## 이 흐름이 사주는 것

- [[proxy-forward-reverse-video]]·[[load-balancing-video]]의 개념들이
  **순서대로** 등장 — 이론적 정의가 아니라 "왜 이 시점에 이걸 도입하는가"로 이해됨
- [[servlet-container|Tomcat 실습]] 단계에서 출발해 인프라 어휘까지 한 줄로 이어짐 →
  부트캠프 발표·면접에서 "이 시스템은 어떻게 확장할 거예요?" 질문에 단계로 답할 수 있음

## 관련 페이지

- 개념: [[proxy]] · [[forward-proxy]] · [[reverse-proxy]] · [[load-balancer]] ·
  [[load-balancing-algorithm]] · [[horizontal-vs-vertical-scaling]] · [[high-availability]]
- 도구: [[nginx]]
- 연결되는 학습 가지: [[servlet-container]]
- 출처: [[proxy-forward-reverse-video]] · [[load-balancing-video]]
