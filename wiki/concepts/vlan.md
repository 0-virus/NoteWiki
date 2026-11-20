---
type: concept
tags: [network, vlan, ethernet, trunk, subnet]
updated: 2026-11-20
sources:
  - "raw/notes/가상 랜 - 위키백과, 우리 모두의 백과사전.md"
  - "https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/14976-50.html"
  - "https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/vlan/vlan-configuration-guide/configure-vlan-trunks.html"
---

# VLAN — 같은 스위치 안에서 LAN을 나누는 기준

VLAN(Virtual LAN)은 물리 스위치와 케이블을 함께 쓰면서 **L2 브로드캐스트 도메인**을 논리적으로 나누는 방법이다. 브로드캐스트 도메인은 ARP 요청처럼 같은 LAN 전체로 보내는 프레임이 퍼지는 범위다. VLAN 10의 브로드캐스트는 일반적인 L2 전달로 VLAN 20에 넘어가지 않는다.

왜 필요한가? 장비 위치나 스위치 한 대를 기준으로만 망을 묶으면, 업무별로 나누기 위해 배선과 장비를 따로 마련해야 한다. VLAN은 포트·프레임의 소속을 설정해 논리적인 구역을 만든다. 여러 스위치에 걸친 같은 VLAN도 연결 구성이 맞으면 하나의 L2 영역으로 이어진다.

## Access 포트와 Trunk 포트

일반 PC의 단일 데이터 VLAN 연결을 기준으로 보면 다음과 같다. IP 전화기의 음성 VLAN 등은 별도 구성이다.

| 구분 | Access | Trunk |
| --- | --- | --- |
| 용도 | 단말을 한 VLAN에 연결 | 여러 VLAN을 한 링크로 운반 |
| 소속 구분 | 스위치가 포트에 지정된 VLAN으로 분류 | 보통 802.1Q 태그의 VLAN ID로 구분 |
| 단말/링크의 프레임 | 보통 태그 없음 | 보통 VLAN 태그가 있음 |
| 예 | PC → 스위치 | 스위치 → 스위치, 스위치 → 가상화 호스트 |

802.1Q 태그는 **이더넷 프레임**에 붙는다. HTTP 헤더나 IP 주소를 바꾸는 기능이 아니다 → [[network-encapsulation]]. 들어온 포트 설정과 태그로 VLAN을 식별하고, 해당 VLAN의 전달 범위 안에서 목적 MAC에 따라 프레임을 보낸다.

Trunk는 여러 VLAN을 운반해도 서로 합치지 않는다. VLAN 10 프레임은 건너편에서도 VLAN 10으로 처리된다. **Trunk를 만들었다고 VLAN 10과 20 사이의 IP 통신이 열리는 것은 아니다.** [Cisco 외부 라우터 구성](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/14976-50.html)

- **Allowed VLAN**: 해당 trunk에서 통과시킬 VLAN 목록이다. 필요한 VLAN이 빠지면 같은 VLAN의 단말도 스위치 사이에서 통신하지 못할 수 있다.
- **Native VLAN**: Cisco의 일반적인 802.1Q trunk 구성에서는 태그 없는 트래픽을 처리하는 VLAN이다. 양 끝의 설정을 맞춰야 한다. Native VLAN 태깅 여부 등은 장비와 설정을 확인하므로 “trunk의 모든 프레임에는 반드시 태그가 있다”고 외우지 않는다. [Cisco trunk 가이드](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/vlan/vlan-configuration-guide/configure-vlan-trunks.html)

## VLAN과 IP 서브넷은 다른 계층이다

| 구분 | VLAN | IP 서브넷 |
| --- | --- | --- |
| 계층 | L2, 이더넷 전달 범위 | L3, IP 주소의 네트워크 범위 |
| 예 | VLAN 10 | `192.0.2.0/24` |
| 결정하는 것 | 어느 포트·링크에 같은 LAN의 프레임을 전달할지 | 목적지로 직접 보낼지, 어느 다음 홉으로 보낼지 |

실무에서는 VLAN 하나와 서브넷 하나를 대응시키는 구성이 흔하다. 그래도 둘은 동일한 개념이 아니다. IP 대역만 다르게 설정해도 L2 브로드캐스트 범위가 저절로 나뉘지 않으며, 한 VLAN 안에 여러 서브넷을 두는 것도 가능하다. 반대로 분리된 VLAN에 같은 대역을 부여한다고 서로 직접 통신할 수 있는 것은 아니다. 단말이 로컬 목적지라고 판단해 보낸 ARP가 상대 VLAN에 도달하지 않기 때문이다 → [[ip-routing]].

서로 다른 VLAN 사이의 IP 통신에는 라우터·L3 스위치·라우팅 기능을 가진 방화벽 등이 필요하다. 경로가 생긴 뒤 무엇을 허용할지는 ACL·방화벽 정책으로 제어한다. VLAN 분리 자체가 암호화나 완전한 접근 제어를 제공하지 않는다. [Cisco VLAN 간 라우팅](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/41260-189.html)

## 가상화와 실무 구성으로 연결하기

[[network-virtualization]]에서는 VM의 가상 포트에도 VLAN을 지정할 수 있다. 물리 호스트의 uplink에서 여러 VLAN을 운반하려면 가상 스위치와 물리 스위치의 태깅·허용 VLAN 구성이 맞아야 한다. VLAN을 늘려도 물리 링크의 대역폭이 늘어나지는 않는다.

실제 주소와 MAC이 어떻게 이어지는지는 [[vlan-to-routing-flow]]에서 따라간다. 원본 주장과 보정 사항은 [[vlan-wikipedia-article]]에 구분했다.
