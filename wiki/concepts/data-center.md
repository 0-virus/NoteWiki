---
type: concept
tags: [infrastructure, data-center, idc]
updated: 2026-11-19
sources: [raw/notes/HCI_인프라_학습_정리.md]
---

# 데이터센터와 IDC

데이터센터는 서버·스토리지·네트워크 장비를 안정적으로 운영하는 시설이다. 국내에서 IDC(Internet Data Center)는 인터넷 서비스와 기업 시스템을 수용하는 데이터센터를 가리킬 때 흔히 쓰인다. 랙은 장비를 수용하고, UPS와 발전기는 전력 장애에 대비하며, 냉각·통신 회선·물리 보안은 장비 운영의 기반을 제공한다. 기업이 외부 시설의 공간·전력·회선을 이용해 자체 장비를 운영하는 형태를 코로케이션이라고 한다. [IBM 데이터센터 개요](https://www.ibm.com/think/topics/data-centers)

하나의 시설에 외장 스토리지 중심의 3-Tier와 [[hyperconverged-infrastructure|HCI]]를 함께 둘 수 있다. 시설은 장비를 어디서 운영할지, 인프라 아키텍처는 장비를 어떻게 연결하고 확장할지, [[cloud-computing|클라우드]]는 사용자에게 자원을 어떻게 제공할지에 답한다.

- [[infrastructure-scaling-flow]] — 같은 시설에서도 달라지는 자원 확장 방식
- [[hci-infrastructure-note]] — 원본 요약
