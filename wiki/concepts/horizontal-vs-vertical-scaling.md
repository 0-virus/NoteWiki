---
type: concept
tags: [system-design, scaling, performance]
updated: 2026-05-21
sources: ["raw/youtube/Load Balancing 로드 밸런싱이 뭔가요 쉽게 이해하는 로드 밸런서의 기초 개념과 역할 시스템 디자인.md"]
---

# Horizontal vs Vertical Scaling

## 한 줄 정의

트래픽이 늘었을 때 시스템을 키우는 **두 방향**:
**Vertical(수직, "한 대를 더 좋게")** vs **Horizontal(수평, "여러 대로 늘리기")**.

## 왜 이 구분이 중요한가

"서버가 느려요" 라는 문제에 대한 답이 **정반대 결정**으로 갈리기 때문이다.
한쪽은 같은 박스의 사양을 키우고, 다른 쪽은 박스를 더 많이 둔다.
이 선택이 그 뒤의 모든 설계를 결정한다 ([[load-balancer]] 필요 여부, 세션 처리 방식, 배포 절차 …).

## 비교

```
[Vertical Scaling]                  [Horizontal Scaling]
                                    
   ┌──────┐                          ┌────┐ ┌────┐ ┌────┐
   │ CPU↑ │                          │서버│ │서버│ │서버│
   │ RAM↑ │                          └────┘ └────┘ └────┘
   │ DISK↑│                            ▲      ▲      ▲
   └──────┘                            └──────┴──────┘
   서버 1대                                 │
   (스펙 업그레이드)                  [Load Balancer]
                                            ▲
                                            │
                                       클라이언트
```

| 항목         | Vertical (수직)             | Horizontal (수평)              |
| ------------ | --------------------------- | ------------------------------ |
| 방법         | 한 서버의 CPU/RAM/디스크 업 | 같은 서버를 여러 대 추가       |
| 상한         | **하드웨어 물리 상한 있음** | 거의 무한 (이론상)             |
| 비용 곡선    | 처음엔 싸다가 급격히 비쌈   | 선형에 가까움                  |
| 단일 장애점  | **남는다** — 한 대 죽으면 끝 | 해결됨 — 한 대 죽어도 다른 대  |
| 복잡도       | 낮음 (구조 그대로)          | 높음 (LB·세션·데이터 동기화)   |
| 필요한 인프라 | 없음                        | **[[load-balancer]] 필수**     |
| 코드 변경    | 거의 없음                   | 상태 관리 재설계 필요할 수도   |

## Vertical Scaling — 임시방편

**장점**: 가장 간단. 코드도 인프라도 거의 그대로.

**한계**:
- **하드웨어 상한이 존재**한다. CPU 코어 수·메모리 대역폭·디스크 IOPS 모두 끝이 있다.
- 끝에 다가갈수록 **단가가 기하급수**로 오른다 (고성능 EC2 인스턴스 가격 곡선이 대표).
- **단일 장애점이 그대로 남는다**. 한 대가 죽으면 서비스 전체 다운.

영상의 말: *"Vertical은 Horizontal로 가기 전 임시방편이다."*

## Horizontal Scaling — 본격 확장

**장점**:
- 상한이 사실상 없음 (서버 더 추가하면 됨)
- **자연스럽게 [[high-availability|고가용성]]** 을 얻는다 — 한 대가 죽어도 나머지가 받아준다

**대가**:
- 앞에 **[[load-balancer]]** 가 반드시 필요
- **상태(state) 처리가 까다로워진다**:
  - 세션을 서버 메모리에 두면 → 다음 요청이 다른 서버로 가면 세션 사라짐
  - 해결: 외부 세션 스토어 (Redis), 또는 [[load-balancing-algorithm|IP Hash]]
- 배포·로그 수집·모니터링이 모두 "여러 대"를 전제로 재설계됨

## "Stateless가 왜 강조되는가"

위 표의 마지막 항목이 이유. 수평 확장의 전제 조건이 **stateless 서비스**다.
서버에 상태가 없으면 (= 같은 요청은 어느 서버로 가든 같은 답) 그냥 늘리기만 하면 된다.
[[servlet]] 학습에서 만나는 [[concurrency-problem]]·세션 관리가 결국 이 문제다.

## 영균의 학습 맥락

지금 [[servlet-container|Tomcat]]을 단독으로 띄우는 단계는 **vertical only** 구간이다.
다음 단계는:
1. **앞에 [[reverse-proxy]]** 한 대 두기 (확장과 무관하게 유용)
2. **Tomcat 두 대 + [[nginx]] LB**로 horizontal 첫 발 (세션은 in-memory로 두고 IP Hash로 우회)
3. **세션을 Redis로 분리**해서 진정한 stateless로

이 단계적 전개를 한 페이지로 본 게 [[scaling-a-web-app]]이다.

## 관련 페이지

- [[load-balancer]] — 수평 확장의 필수 동반자
- [[high-availability]] — 수평 확장이 자연스럽게 사주는 효용
- [[scaling-a-web-app]] — 단일 Tomcat에서 출발하는 확장 흐름
- 출처: [[load-balancing-video]]
