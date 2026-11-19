---
type: concept
tags: [infrastructure, virtualization, live-migration, high-availability]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# VM 라이브 마이그레이션

라이브 마이그레이션은 실행 중인 [[virtual-machine|VM]]의 메모리와 실행 상태를 다른 호스트로 옮겨 점검이나 재배치 때 중단을 최소화하는 기술이다. 원본 호스트는 이동에 참여할 수 있어야 하고, 대상 호스트는 VM을 수용할 CPU·RAM과 호환되는 실행 환경을 갖춰야 한다. 네트워크와 디스크 접근 조건도 필요하다. [Microsoft Hyper-V 클러스터 네트워크 문서](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/failover-cluster-network-recommendations)

메모리를 먼저 복사하는 방식에서는 VM을 실행한 채 페이지를 대상에 보내고, 복사 중 바뀐 페이지를 다시 보낸다. 마지막 전환 때 잠깐 실행을 멈추고 남은 상태를 넘긴 뒤 대상에서 실행을 이어간다. 메모리 변경 속도와 전송 속도의 차이가 전환 시간에 영향을 줄 수 있다. 양쪽에서 같은 가상 디스크에 접근하면 실행 위치만 옮길 수 있고, 디스크까지 옮기는 방식은 제품별 지원 범위에 따른다. [Red Hat KVM 가상화 문서](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/pdf/configuring_and_managing_virtualization/configuring-and-managing-virtualization.pdf)

| 상황 | 일반적인 동작 | 서비스 영향 |
| --- | --- | --- |
| 계획 점검 또는 자원 재배치 | 라이브 마이그레이션으로 실행 상태를 이관 | 짧은 전환 정지가 발생할 수 있음 |
| 호스트의 갑작스러운 고장 | [[high-availability|VM HA]]가 다른 호스트에서 VM을 재시작 | OS와 앱이 다시 뜨는 동안 중단될 수 있고, RAM에만 있던 상태는 유실될 수 있음 |

- [[infrastructure-cluster]] — 이동·재시작에 필요한 호스트 여유 자원
- [[infrastructure-scaling-flow]] — 증설 후 재배치와 장애 복구를 비교하는 예시
- [[hci-infrastructure-note]] — 원본 요약
