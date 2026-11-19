---
type: concept
tags: [infrastructure, cloud, cloud-computing]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# 클라우드 컴퓨팅

클라우드 컴퓨팅은 공유 컴퓨팅 자원을 네트워크를 통해 필요할 때 요청하고 빠르게 공급받거나 반납하는 서비스 모델이다. NIST는 주문형 셀프서비스, 폭넓은 네트워크 접근, 자원 풀링, 신속한 탄력성, 측정 가능한 서비스를 핵심 특성으로 제시한다. 사용량 측정은 조직 내부의 자원 관리에도 쓰인다. [NIST SP 800-145](https://csrc.nist.gov/pubs/sp/800/145/final)

[[data-center|데이터센터]]는 운영 시설이고, [[hyperconverged-infrastructure|HCI]]는 컴퓨팅과 스토리지를 통합 운영하는 기반이다. HCI 위에 포털·API, 권한과 할당량, VM 생성·반납 자동화, 사용량 측정을 갖추면 프라이빗 클라우드의 기반으로 활용할 수 있다. 외장 스토리지 기반 인프라에서도 동일한 제공 모델을 구현할 수 있다.

- **프라이빗 클라우드**는 한 조직 전용이다. 조직 내부와 외부 시설 모두에서 운영할 수 있다.
- **퍼블릭 클라우드**는 일반 사용자가 이용할 수 있도록 제공한다.
- **하이브리드 클라우드**는 구분되는 클라우드 환경을 연결해 데이터나 애플리케이션의 이동·연계를 지원한다.

배포 모델 정의는 [NIST SP 800-145](https://csrc.nist.gov/pubs/sp/800/145/final)를 따른다.

- [[infrastructure-scaling-flow]] — 물리 자원 증설과 사용자 요청 방식의 연결
- [[hci-infrastructure-note]] — 원본 요약
