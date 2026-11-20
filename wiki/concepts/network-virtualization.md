---
type: concept
tags: [infrastructure, network, virtualization, vlan, vxlan]
updated: 2026-11-20
sources: [raw/notes/HCI_인프라_학습_정리.md, "raw/notes/가상 랜 - 위키백과, 우리 모두의 백과사전.md"]
---

# 네트워크 가상화

네트워크 가상화는 물리 네트워크 위에 논리적인 연결과 분리를 만드는 기술이다. [[virtual-machine|VM]]의 가상 NIC(vNIC)가 호스트의 가상 스위치에 연결되고, 다른 호스트나 외부망으로 가는 트래픽은 보통 물리 NIC와 스위치를 거친다. 같은 호스트와 가상 스위치에 연결된 VM끼리는 구성에 따라 호스트 안에서 통신할 수 있다.

| 구성 | 역할 |
| --- | --- |
| [[vlan|VLAN]] | 같은 물리 이더넷에서 논리적인 L2 영역을 분리 |
| VXLAN | 이더넷 프레임을 캡슐화해 IP 망 위에 논리적인 L2 네트워크를 구성 |
| 가상 라우터·방화벽 | 논리 네트워크 사이의 경로와 접근 정책을 적용 |

VXLAN을 사용하면 [[network-encapsulation|캡슐화]]된 프레임을 아래의 IP 망에서 [[ip-routing|라우팅]]할 수 있다. SDN(Software-Defined Networking)은 네트워크 제어와 정책을 소프트웨어로 관리하는 접근이며, 가상 스위치와 오버레이는 그 환경에 쓰일 수 있는 구성 요소다. [IETF RFC 7348](https://datatracker.ietf.org/doc/html/rfc7348)

[[hyperconverged-infrastructure|HCI]]에서는 VM 서비스 요청, 노드 상태 확인, [[software-defined-storage|스토리지]] 복제·복구, [[live-migration|VM 이동]] 트래픽이 같은 물리 링크를 사용할 수 있다. VLAN으로 논리 분리를 하더라도 물리 링크 대역폭은 공유한다. 복제나 이동 트래픽이 많을 때는 대역폭 경쟁이 서비스 지연으로 이어질 수 있다. [Microsoft 클러스터 네트워크 문서](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/failover-cluster-network-recommendations)

- [[hci-infrastructure-note]] — 원본 요약

## VLAN에서 실무 구성으로

VM의 가상 포트에 지정한 VLAN이 다른 호스트까지 이어지려면, 가상 스위치의 uplink와 물리 스위치의 trunk가 해당 VLAN을 운반해야 한다. 논리 망을 설정하는 작업과 물리 링크에 그 망을 통과시키는 작업이 함께 맞아야 한다.

[[vlan-to-routing-flow]]에서 access 포트 → trunk → L3 게이트웨이의 역할을 따라간다. Trunk는 VLAN 소속을 유지해 운반하고, 서로 다른 VLAN 사이의 IP 통신은 라우팅과 접근 정책으로 결정한다. 추가 출처: [[vlan-wikipedia-article]].
