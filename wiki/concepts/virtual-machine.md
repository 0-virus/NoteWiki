---
type: concept
tags: [infrastructure, virtualization, hypervisor, vm]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# 가상머신 (VM)

VM은 가상 CPU·메모리·디스크·네트워크 장치를 제공받아 자체 게스트 OS를 실행하는 논리적인 컴퓨터다. 하이퍼바이저는 호스트의 물리 자원을 VM에 배분하고 격리한다. 물리 하드웨어 위에서 동작하는 Type 1과 호스트 OS 위에서 동작하는 Type 2로 구분할 수 있다. [[container-virtualization|컨테이너]]는 같은 호스트 커널을 공유하므로 격리 경계가 다르다. [Microsoft Hyper-V 개요](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview)

## vCPU가 실행되는 방식

게스트 OS는 vCPU를 프로세서로 보고 스레드를 배치한다. 하이퍼바이저는 그 vCPU의 실행을 호스트의 논리 프로세서에 스케줄링한다. 따라서 8 vCPU는 게스트에 보이는 프로세서 수이며, 물리 코어 독점 여부는 별도 배치·할당 정책에 달려 있다. SMT로 한 코어가 여러 논리 프로세서를 제공할 수 있으며, 이들은 코어의 실행 자원을 공유한다. [Microsoft Hyper-V 스케줄러 문서](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-scheduler-types)

가상 자원 할당 합계를 물리 자원보다 크게 잡는 것을 오버커밋이라 한다. 여러 VM이 동시에 바빠지면 CPU 실행 대기가 늘고, 실제로 쓰는 메모리가 호스트의 여유 RAM에 비해 커지면 메모리 회수·스와핑 또는 실행 실패가 생길 수 있다. 128GB 호스트에서 VM에 배정할 수 있는 메모리를 계산할 때 하이퍼바이저와 관리·스토리지 서비스도 고려한다.

[[spring-boot|Spring Boot]]를 VM에서 실행하면 JAR는 디스크에 저장되고, JVM과 [[jvm-memory|힙의 객체]]는 실행 중 게스트 메모리를 사용한다. CPU는 코드를 실행한다. 응답 지연은 CPU 대기, 메모리 압박, 저장장치 I/O, 네트워크 등 여러 곳에서 생길 수 있다.

- [[infrastructure-cluster]] — 여러 호스트에서 VM을 배치할 때 보는 제약
- [[live-migration]] — 실행 중인 VM의 호스트 이동
- [[hci-infrastructure-note]] — 원본 요약
