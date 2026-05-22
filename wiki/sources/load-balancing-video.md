---
type: source
tags: [system-design, load-balancing, scaling, high-availability, video]
updated: 2026-05-21
sources: ["raw/youtube/Load Balancing 로드 밸런싱이 뭔가요 쉽게 이해하는 로드 밸런서의 기초 개념과 역할 시스템 디자인.md"]
---

# Load Balancing — 로드 밸런서의 기초 개념과 역할 (코딩문)

> **원본**: [YouTube · 코딩문 채널, 2024-06-10, 약 11분](https://www.youtube.com/watch?v=CBVX_m593M0)
> **클리핑**: 2026-05-21
> 이전 영상 [[proxy-forward-reverse-video]]의 후속편.

## 맥락 (왜 저장했나)

영균의 메모 인용:
> *"최근 프로젝트에서 리버스 프록시와 로드 밸런싱 이야기가 나왔는데
> 이전부터 무슨 개념인지 궁금했던 차라 이번 기회에 확실히 알아두자 싶어서 저장했다.
> [[proxy-forward-reverse-video]] 이 영상과 긴밀하게 연결시키면 좋겠다."*

**부트캠프 팀 프로젝트** 중 다른 팀의 설명에서 마주친 용어가 도화선.
프록시 영상과 한 가지로 묶어 **"시스템 디자인 / 인프라"** 카테고리의 시작점으로 삼는다.

## 핵심 주장 (Key Claims)

1. **스케일링은 두 방향이 있다.**
   - **Vertical (수직)** — 하드웨어 자체를 키운다 (CPU·RAM·디스크 업그레이드).
     장점: 단순. 한계: **하드웨어 상한**·**여전히 단일 장애점**.
     → 본격 확장 전의 **임시방편**.
   - **Horizontal (수평)** — 서버를 여러 대로 늘린다. 이때 앞단에 **로드 밸런서가 필수**.
2. **로드 밸런서의 두 가지 존재 이유**: ① 성능(트래픽 분산) ② 고가용성(서버 하나가 죽어도 서비스 유지).
3. **분산 알고리즘 4종**:
   - **Round Robin** — 순차 분배. 서버 성능 차이는 무시.
   - **Weighted Round Robin** — 서버별 가중치. 더 좋은 서버에 더 많이.
   - **Least Connection** — 현재 연결 수가 가장 적은 서버로. 응답이 오래 걸리는 서버를 피함.
   - **IP Hash** — 같은 클라이언트 IP는 항상 같은 서버로. **세션 유지(스티키)** 가 필요할 때.
4. **로드 밸런서 자체가 단일 장애점(SPOF)** 이 된다. 이를 막으려고 LB도 다중화:
   - **Active-Active** — 둘 다 가동, 한쪽이 죽어도 다른 쪽이 처리.
   - **Active-Passive** — 한쪽만 가동, 죽으면 대기 중인 쪽을 활성화.

## 언급된 엔티티

- **사람/채널**: 코딩문 (YouTube)
- **개념**: Vertical/Horizontal Scaling, Round Robin, Weighted RR, Least Connection, IP Hash, SPOF, Active-Active/Passive
- **연결**: 직전 영상 [[proxy-forward-reverse-video]] — "리버스 프록시가 로드 밸런서로 쓰인다"는 한 줄을 출발점으로 깊이 파고듦.

## 다루는 개념 (위키 매핑)

- [[load-balancer]] — 정의·역할
- [[load-balancing-algorithm]] — RR·WRR·Least Connection·IP Hash
- [[horizontal-vs-vertical-scaling]] — 두 스케일링 방식의 트레이드오프
- [[high-availability]] — SPOF·Active-Active/Passive
- [[nginx]] — 실습 도구

## 자주 헷갈리는 포인트 (이 영상이 정리해준 것)

- "서버 늘리면 빨라진다" → **늘린 서버를 누가 골고루 쓰게 만드냐**가 본질. LB가 그 역할.
- IP Hash는 단순한 분산이 아니라 **"세션 어피니티(Sticky Session)"** 의 다른 이름.
- LB 다중화는 단순 백업이 아니라, **시스템 전체의 가용성 한계점**을 옮기는 일이다.

## 관련 페이지

- 이전 영상: [[proxy-forward-reverse-video]]
- 흐름: [[scaling-a-web-app]] — Tomcat 실습 → 수평 확장 → LB → 멀티 LB의 단계적 전개
