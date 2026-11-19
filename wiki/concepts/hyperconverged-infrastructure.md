---
type: concept
tags: [infrastructure, hci, ci, scaling]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# 하이퍼컨버지드 인프라 (HCI)

HCI는 물리 노드의 CPU·RAM과 로컬 디스크를 소프트웨어로 통합해 운영하는 인프라 아키텍처다. 보통 같은 [[infrastructure-cluster|클러스터]]에서 하이퍼바이저는 [[virtual-machine|VM]]을 실행하고, 분산 [[software-defined-storage|SDS]]는 여러 노드의 디스크를 논리 풀로 제공한다. VM 실행 호스트와 데이터 사본이 놓인 노드는 각기 다른 정책으로 결정된다. 노드 간 통신과 복제는 물리 네트워크를 이용한다. [Nutanix의 HCI 아키텍처 개요](https://www.nutanix.com/hyperconverged-infrastructure)

## 3-Tier·CI·HCI 비교

여기서 3-Tier는 컴퓨팅 서버, 스토리지 네트워크, 외장 스토리지로 구성된 인프라를 가리킨다. 애플리케이션의 웹·애플리케이션·DB 계층은 애플리케이션 책임을 나누는 용어다. CI(Converged Infrastructure)는 컴퓨팅·네트워크·스토리지 조합을 미리 검증해 패키지나 참조 아키텍처로 제공하는 방식이다. [Cisco의 CI 개요](https://www.cisco.com/site/us/en/learn/topics/computing/what-is-converged-infrastructure.html)

| 판단 기준 | 3-Tier | CI | HCI |
| --- | --- | --- | --- |
| 컴퓨팅과 저장 장치 | 서버와 외장 스토리지를 스토리지 망으로 연결 | 서버·네트워크·외장 스토리지를 검증된 조합으로 구성 | 여러 노드의 컴퓨팅과 로컬 디스크를 통합 운영 |
| CPU·RAM만 부족 | 컴퓨팅 서버 증설 | 검증 범위 내 컴퓨팅 증설 | 지원되는 컴퓨팅 전용 노드나 서버 증설 방식 확인 |
| 저장 공간만 부족 | 별도 스토리지 증설 | 검증 범위 내 스토리지 증설 | 디스크 추가, 스토리지 전용 노드 또는 일반 노드 등 제품별 지원 범위 확인 |
| 여러 자원이 함께 부족 | 계층마다 필요한 양을 산정해 확장 | 검증된 구성 단위에서 확장 | 컴퓨팅과 스토리지를 함께 제공하는 노드 추가가 수요에 맞을 수 있음 |
| 운영에서 보는 비용 | 계층별 통합·관리 부담 | 검증 범위와 공급업체 의존성 | 라이선스, 불필요하게 따라오는 자원, 장애 후 복구 여유 |

SAN은 서버에 블록 스토리지 접근을 제공하는 용도의 네트워크다. NAS는 NFS·SMB 등으로 파일을 제공하는 저장 시스템이다. 3-Tier에서 서버와 외장 저장소 사이의 연결 방식을 읽을 때 이 구분이 도움이 된다.

증설 단위와 자원 수요의 비율이 맞으면 필요한 용량을 효율적으로 늘릴 수 있다. CPU와 RAM이 여유로운데 저장 공간만 모자라면, 컴퓨팅도 포함된 일반 노드의 구매 비용과 스토리지 전용 증설의 지원 여부가 선택을 바꾼다. 한 노드가 빠질 때는 VM 재배치 여유와 데이터 사본 재구축 여유를 별도로 계산한다. [[infrastructure-scaling-flow]]에 계산 예시가 있다.

- [[data-center]] — HCI가 운영되는 물리 시설
- [[cloud-computing]] — 통합 인프라 위에서 자원을 제공하는 모델
- [[hci-infrastructure-note]] — 원본 요약
