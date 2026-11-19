---
type: concept
tags: [infrastructure, cluster, quorum, high-availability]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# 인프라 클러스터

클러스터는 여러 컴퓨터가 서비스를 제공하거나 자원을 공동 관리하도록 구성한 집합이다. 구성원 하나를 노드라 부르며, [[hyperconverged-infrastructure|HCI]]에서는 보통 물리 서버 한 대다. 가상화 클러스터는 여러 호스트를 관찰하며 [[virtual-machine|VM]]을 배치하고, 설정에 따라 장애 시 다른 호스트에서 VM을 재시작한다.

## 합계 용량과 배치 가능 용량

RAM 128GB 노드 세 대의 물리 메모리 합계는 384GB다. 일반적인 VM은 한 시점에 호스트 한 대에서 실행되므로 RAM 300GB VM을 배치하려면 그 VM을 수용할 수 있는 단일 호스트가 필요하다. 합계 여유가 충분해도 각 호스트에 여유가 잘게 흩어져 있으면 큰 VM을 배치하기 어렵다. 노드 한 대 장애를 가정할 때는 남은 호스트들의 합계와 개별 여유를 모두 본다.

## 장애 판단과 정족수

노드 간 통신이 끊기면 상대 노드가 멈췄는지, 연결만 끊겼는지 구별하기 어렵다. 정족수(quorum)는 주어진 투표 조건에 따라 어느 쪽이 클러스터 운영을 계속할지 결정한다. 양쪽이 각각 자신을 정상으로 판단해 같은 VM이나 저장 자원을 동시에 제어하는 분리 뇌(split-brain)를 막는 데 쓰인다. VM 재시작에는 정상 호스트의 여유 자원과 VM 구성·디스크 접근도 필요하다. [Microsoft 클러스터·스토리지 풀 정족수 문서](https://learn.microsoft.com/en-us/windows-server/storage/storage-spaces/understand-quorum)

- [[high-availability]] — VM 복구와 서비스 가용성의 관계
- [[software-defined-storage]] — 데이터를 여러 노드에 저장하는 정책
- [[infrastructure-scaling-flow]] — 증설과 장애 뒤의 용량 계산
- [[hci-infrastructure-note]] — 원본 요약
