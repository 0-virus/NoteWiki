---
type: source
tags: [network, vlan, trunk, routing, wikipedia]
updated: 2026-11-20
sources:
  - "raw/notes/가상 랜 - 위키백과, 우리 모두의 백과사전.md"
---

# 가상 랜 — 위키백과 클리핑

- 원본: `raw/notes/가상 랜 - 위키백과, 우리 모두의 백과사전.md`
- 원문 URL: [위키백과 가상 랜](https://ko.wikipedia.org/wiki/%EA%B0%80%EC%83%81_%EB%9E%9C)
- 수집일: 2026-11-20
- 사용자 맥락: **실무 네트워크 구성을 이해하려고 VLAN·트렁크·라우팅을 알고 싶다.**
- 원본의 `source_type`은 `claude-conversation`이지만 본문은 위키백과 문서 클리핑이다. 대화로 간주하지 않았고 원본 메타데이터는 수정하지 않았다.

## 핵심 내용과 연결

1. [[vlan]]은 물리 장비를 공유하면서 L2 브로드캐스트 도메인을 분리한다. 물리적 위치보다 논리적 소속에 맞춰 호스트를 묶을 수 있다.
2. 802.1Q 태그를 사용한 trunk는 여러 VLAN을 한 링크로 운반한다. 공유 링크를 사용하므로 논리 분리가 대역폭 추가를 뜻하지 않는다 → [[network-virtualization]].
3. VLAN은 L2, 서브넷은 L3의 구분이다. 둘을 대응시키는 설계가 흔하지만 같은 개념은 아니다 → [[ip-routing]].
4. VLAN 사이의 IP 통신에는 L3 전달이 필요하다. 사용자가 구성도를 읽을 수 있도록 access → trunk → 게이트웨이 → 목적지 순서의 [[vlan-to-routing-flow]]를 추가했다.

원본은 역사, IEEE 802.1Q와 과거의 ISL·VLT, Cisco VTP, 정적 포트 할당과 VMPS 기반 동적 할당도 다룬다. 이번에는 실무 구성 해석에 필요한 핵심을 추출했다. 역사적 수치와 구형 기술의 현재 지원 여부는 검증하지 않았고, VTP·VMPS·STP 심화는 독립 페이지로 확장하지 않았다.

## 원문 보정과 근거

| 원문에서 주의할 표현 | 위키에 반영한 설명 |
| --- | --- |
| 분리 후 패킷이 “라우터들 사이에서만” 이동 | 같은 VLAN의 L2 통신은 가능하다. 서로 다른 VLAN 사이의 IP 전달에는 라우팅 기능이 필요하며 L3 스위치도 담당할 수 있다. |
| VLAN 간 브리지 처리 문장의 불명확한 인과 | 일반적인 L2 스위칭은 서로 다른 VLAN을 합치지 않는다. L3 라우팅으로 연결해도 브로드캐스트 도메인은 분리된다. |
| DHCP를 쓸 수 없으면 DNS 서버를 사용할 수 있다는 서술 | DNS는 이름 해석, DHCP는 주소·네트워크 설정 제공이다. DNS가 DHCP를 대체하지 않는다. |
| VLAN trunk에 링크 집성과 QoS가 “요구된다” | 공유 대역폭을 고려해야 하지만 두 기능이 VLAN 구성의 필수 전제는 아니다. 필요 여부는 용량·트래픽·설계 목표에 달린다. |
| 정적 VLAN에서 장치가 VLAN을 “추측” | 일반적인 access 포트에서는 스위치가 포트 설정으로 수신 프레임의 VLAN을 분류한다. |

보정 근거: [Cisco 외부 라우터·trunk 구성](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/14976-50.html), [Cisco L3 스위치 라우팅](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/41260-189.html), [Cisco DHCP](https://www.cisco.com/c/en/us/support/docs/ip/dynamic-address-allocation-resolution/27470-100.html), [DNS RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html).

개념 페이지의 access/native/allowed VLAN 설명과 흐름 페이지의 주소 예시·점검 순서는 공식 문서 및 기존 위키를 바탕으로 보완한 설명이다. 실제 사내 장비 구성이나 통신 성공을 확인한 기록은 아니다.
