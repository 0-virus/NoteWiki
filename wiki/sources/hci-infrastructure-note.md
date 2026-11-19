---
type: source
tags: [infrastructure, hci, virtualization, cloud, scaling]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# IDC부터 HCI와 클라우드까지

원본은 `raw/notes/HCI_인프라_학습_정리.md`다. 시설, 하드웨어 구성, 자원 가상화, 서비스 제공 방식이 어떻게 연결되는지를 설명하는 학습 노트다. 영균은 이번 인제스트에서 **3-Tier·CI·HCI 비교와 CPU·RAM·스토리지 확장**을 우선해서 남기기로 했다.

## 핵심 주장

1. [[data-center|IDC]]는 전력·냉각·회선을 갖춘 운영 시설이다. 그 안에서 컴퓨팅 서버·스토리지 망·외장 스토리지를 분리해 운영하는 3-Tier, 검증된 구성 조합인 CI, 컴퓨팅과 로컬 디스크를 통합 운영하는 [[hyperconverged-infrastructure|HCI]]를 선택하거나 병행할 수 있다.
2. [[virtual-machine|하이퍼바이저]]는 VM의 vCPU에 물리 CPU 실행 시간을 배정한다. [[infrastructure-cluster|클러스터]]의 RAM 합계는 전체 배치 자원이며, 단일 VM은 실행 호스트의 수용 능력에 좌우된다.
3. [[software-defined-storage|분산 SDS]]는 디스크를 논리적으로 제공하고 사본의 배치와 복구를 관리한다. 원시 6TB에서 사본 두 개를 유지하면 이론상 약 3TB이며, 실제로는 시스템 사용량과 재구축 여유 등을 고려한다. [[network-virtualization|가상 네트워크]]로 트래픽을 분리해도 물리 링크의 대역폭은 공유할 수 있다.
4. 계획된 점검에서는 [[live-migration|라이브 마이그레이션]]으로 실행 상태를 옮길 수 있다. 갑작스러운 호스트 장애 뒤 일반적인 [[high-availability|VM HA]]는 정상 호스트에서 VM을 재시작한다. 두 경우 모두 목적지 자원과 디스크 접근 조건을 본다.
5. [[cloud-computing|클라우드]]는 사용자가 자원을 요청하고 반납하는 제공 모델이다. HCI 자원에 셀프서비스·자동화·사용량 측정 등을 더해 프라이빗 클라우드의 기반으로 활용할 수 있다.

## 다시 꺼내 볼 때

- 어떤 구조에서 스토리지나 컴퓨팅만 늘리기 쉬운지 비교하려면 [[hyperconverged-infrastructure]].
- 두 자원이 함께 늘거나 노드 한 대가 빠질 때의 용량을 계산하려면 [[infrastructure-scaling-flow]].
