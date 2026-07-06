---
source_type: "article"
title: "🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏"
url: "https://inpa.tistory.com/entry/WEB-%F0%9F%93%9A-CORS-%F0%9F%92%AF-%EC%A0%95%EB%A6%AC-%ED%95%B4%EA%B2%B0-%EB%B0%A9%EB%B2%95-%F0%9F%91%8F"
author:
  - "인파_"
site: "tistory.com"
published: 2022-11-28
clipped: 2026-07-03
description: "악명 높은 CORS 에러 메세지 웹 개발을 하다보면 반드시 마주치는 멍멍 같은 에러가 바로 CORS 이다. 웹 개발의 신입 신고식이라고 할 정도로, CORS는 누구나 한 번 정도는 겪게 된다고 해도 과언이 아니다. 프론트엔드 개발자 입장에선 요청 코드를 이상하게 적은것도 아니고, 백엔드 개발자 입장에선 서버 코드나 세팅이 이상한것도 아니다. 모든게 멀쩡한데 왜 요청한 자료에 대한 응답을 시뻘건 에러줄로 확답하는게 문제이다. 🤬 이러한 현상이 일어나는 이유는, 웹 브라우저는 HTTP 요청에 대해서 어떤 요청을 하느냐에 따라 각기 다른 특징을 가지고 있기 때문이다. 요청 방식에 따라 다른 CORS 발생 여부 1. , , 2. XMLHttpRequest, Fetch API 스크립트 → 기본적으로 Same-Or.."
tags:
  - "clippings/article"
---
> “ 잘되면 프로그래머 탓, 못되면 시스템 탓. ”
> 
> ##### \- 개발자 속담(Programmer’s Proverbs)

![cors-에러-정리](https://blog.kakaocdn.net/dna/6p7bn/btrqLUBlJJT/AAAAAAAAAAAAAAAAAAAAAGwl-IDHSfpgeGEOEkPNUt4Q95Tjz8Eoi4suO6YzkhTk/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=WjM3ODKz8yGO9ABErD%2BD82L0LHA%3D)

cors-에러-정리

## 악명 높은 CORS 에러 메세지

웹 개발을 하다보면 반드시 마주치는 멍멍 같은 에러가 바로 CORS 이다. 웹 개발의 신입 신고식이라고 할 정도로, CORS는 누구나 한 번 정도는 겪게 된다고 해도 과언이 아니다.

![cors-에러-정리](https://blog.kakaocdn.net/dna/OsbIC/btrZlYpLyoy/AAAAAAAAAAAAAAAAAAAAAIoEVhcjdvxqgOe9litGyHsbT2x45suYmVTT2ZWLtsGE/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=FC5yD1HoNQYUfyE0LsQFyfRUqTk%3D)

cors-에러-정리

프론트엔드 개발자 입장에선 요청 코드를 이상하게 적은것도 아니고, 백엔드 개발자 입장에선 서버 코드나 세팅이 이상한것도 아니다. 모든게 멀쩡한데 왜 요청한 자료에 대한 응답을 시뻘건 에러줄로 확답하는게 문제이다. 🤬

![cors-에러-정리](https://blog.kakaocdn.net/dna/bfhqR2/btr5nGCLvgh/AAAAAAAAAAAAAAAAAAAAABwoFqYc-7UIQsDoTcUCwAnUktAZbbMA5IoMiUpfgcoy/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=eb1r3gduydHv73aPQ1pCdGSwDdQ%3D)

cors-에러-정리

이러한 현상이 일어나는 이유는, 웹 브라우저는 HTTP 요청에 대해서 어떤 요청을 하느냐에 따라 **각기 다른 특징** 을 가지고 있기 때문이다.

---

### 요청 방식에 따라 다른 CORS 발생 여부

#### 1\. \<img>, \<video>, \<script>, \<link> 태그 등

→ 기본적으로 Cross-Origin 정책을 지원함

- ~~\<link>~~ 태그의 href 에서 다른 사이트의.css 리소스에 접근하는 것이 가능
- ~~\<img>~~ 태그의 src 에서 다른 사이트의.png,.jpg 등의 리소스에 접근하는 것이 가능
- ~~\<script>~~ 태그의 src 에서 다른 사이트의.js 리소스에 접근하는 것이 가능 (~~type="module"~~ 속성은 제외)

html

```
<link rel="stylesheet" href="…" />
<script src="…"></script>
<img src="…" />
```

#### 2\. XMLHttpRequest, Fetch API 스크립트

→ 기본적으로 Same-Origin 정책을 따름

- 다른 도메인의 소스에 대해 자바스크립트 ajax 요청 API 호출시
- 웹 폰트 CSS 파일 내 @font-face에서 다른 도메인의 폰트 사용 시

자바스크립트에서의 요청은 기본적으로 **서로 다른 도메인에 대한 요청을 보안상 제한** 한다. 브라우저는 기본으로 하나의 서버 연결만 허용되도록 설정되어 있기 때문이다. (주로 자신의 서버)

처음 보는 용어가 나온다. Same Origin 정책과 Cross Origin 정책이란 대체 무슨 정책(Policy)을 말하는 것일까? 이러한 정책들이 뭐길래 웹 브라우저가 외부 리소스를 가려서 받는 것일까?

바로 이 Same Origin / Cross Origin 정책의 정보 부족으로 인해 나도모르게 정책을 위반하는 행동을 하게 되어 CORS 에러가 나타나는 것이다.

요청 방식에 따라 다른 CORS 발생 여부를 좀 더 이해하기 쉽게 아래 html 코드를 직접 작성하고 테스트 해보자. 똑같은 서버 도메인으로 부터 check.svg 이미지를 가져오는데, 각각 ~~\<img>~~ 태그의 src 속성으로 가져오는 방식과 자바스크립트에서 ajax 요청으로 가져오는 방식이다.

html

```
<body>
    <img src="https://third-party-test.glitch.me/check.svg" alt="이미지">

    <script>
        fetch('https://third-party-test.glitch.me/check.svg')
            .then(response => response.blob())
            .then(imgBlob => {
                const imageObjectURL = URL.createObjectURL(imgBlob); // 응답 받은 이미지를 blob 객체로 변환
                const img = document.createElement('img'); // 이미지 태그를 생성하고
                img.src = imageObjectURL; // 이미지 경로를 설정한뒤
                document.body.append(img); // html에 추가
            })
    </script>
</body>
```

페이지 결과를 보면 이미지가 하나만 나타나는 걸 볼 수 있을 것이다.

![cors-에러-정리](https://blog.kakaocdn.net/dna/dh4u45/btrZmDeREuj/AAAAAAAAAAAAAAAAAAAAAIxdg_3RU8OS_b46ZE4vs2ZBHkLjcdcYwyEkc9vk-sK0/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=hvODeNhw2ItclVpXhvH8bhN8Q1s%3D)

cors-에러-정리

브라우저 개발자 도구의 Network 창을 보면 check.svg 이미지에 대해서 두번 요청은 했지만 자바스크립트 fetch Type으로 요청한 것이 Status가 CORS error 임을 볼수가 있다.

![cors-에러-정리](https://blog.kakaocdn.net/dna/bIQ43f/btrZlYXDbUh/AAAAAAAAAAAAAAAAAAAAAGoskm1OV2zoEvrApXex6WTL1tjuFaFCael-sBlKYQbQ/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=wQZSVC2dwbjFYIV%2B5LnfF4PKVL4%3D)

cors-에러-정리

웹 개발을 하다보면 다른 도메인 서버에 있는 자원을 정말 자주 가져다 쓰거나 혹은 제공해 줄 텐데 이러한 기반 지식이 없다면 나중에 큰 걸림돌이 되게 된다. 지금부터 이 짜증나는 CORS를 두번 다시 마주치지 않도록 완벽하게 정복하러 가보자 ❗

---

## CORS 에러 한방 이해하기

CORS는 함축 단어로써 이를 풀면 Cross-Origin Resource Sharing 이라는 단어로 이루어 져 있다. 이 문장을 직역하면 "교차 출처 리소스 공유 정책"이라고 해석할 수 있는데, 여기서 **교차 출처** 라고 하는 것은 **(엇갈린) 다른 출처** 를 의미하는 것으로 보면 된다.

![cors-에러-정리](https://blog.kakaocdn.net/dna/deIesB/btrRMEdLoHJ/AAAAAAAAAAAAAAAAAAAAAOps5v2LKqoDBPbwDyrN9hGbWw1c_GCvxVf5KxFrnxiq/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=rwUv10g32WQmxNO2PCjKEXhboQ4%3D)

cors-에러-정리

CORS가 무얼 뜻하는지 알았으니, 한번 우리를 괴롭히는 악명 높은 CORS 에러 메세지를 차근차근 해석해보자.

에러 메세지가 불친절한 것은 아니지만, 아무래도 배경지식이 부족하다보니 어떻게 해결해야 할지 감이 안잡힌다.

우선 CORS의 다른 출처 리소스 공유 정책(Cross Origin Resource Sharing)이 어떠한 정책인지에 대해서 알아볼 필요성이 있을 것 같다. 그 전에 아까부터 출처, 출처 거리는데 이 출처(Origin)이 무엇인지 간단하게 살펴보자.

---

### 출처(Origin) 란?

우리가 어떤 사이트를 접속할때 인터넷 주소창에 우리는 URL이라는 문자열을 통해 접근하게 된다.

이처럼 URL은 https://domain.com:3000/user?query=name&page=1 과 같이 하나의 문자열 같지만, 사실은 다음과 같이 여러개의 **구성 요소** 로 이루어져 있다.

![cors-origin](https://blog.kakaocdn.net/dna/BfWV7/btrqOhokpA3/AAAAAAAAAAAAAAAAAAAAAL-C-8KPzKk94CecLFiWFng4E-tWZLc1O88r4BR16VQL/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=VkKDh3o7LGXwCHTuip112zSn6ws%3D)

cors-origin

- Protocol(Scheme): http, https
- Host: 사이트 도메인
- Port: 포트 번호
- Path: 사이트 내부 경로
- Query string: 요청의 key와 value값
- Fragment: 해시 태크

몇몇 독자분들 중에 이미 각 URL의 속성들에 대해 다 알고있는 수준이 높은 분들도 있고, 아직은 상세히 잘 모르는 분들도 계실거라 추측한다.

CORS를 이해하는데 있어 저것들을 모두 알아야 되는 것은 아니고, 딱 3가지만 기억하면 된다.

- Origin: Protocol + Host + Port

즉, **출처(Origin) 라는 것은 Protolcol 과 Host 그리고 Port 까지 모두 합친 URL** 을 의미한다고 보면 된다. 간단하게 자바스크립트로도 현재 사이트의 Origin을 알아낼 수도 있다.

javascript

```
console.log(location.origin); // "https://www.naver.com" (포트 번호 80번은 생략됨)
```

---

### 동일 출처 정책 (Same-Origin Policy)

출처(Origin)에 대해서 알아봤으니 이제 본격적으로 Same Origin 정책과 Cross Origin 정책에 대해 알아보자.

먼저 SOP(Same Origin Policy) 정책은 단어 그대로 **동일한 출처에 대한 정책** 을 말한다. 그리고 이 SOP 정책은 '동일한 출처에서만 리소스를 공유할 수 있다.'라는 법률을 가지고 있다.

즉, 동일 출처(Same-Origin) 서버에 있는 리소스는 자유로이 가져올수 있지만, 다른 출처(Cross-Origin) 서버에 있는 이미지나 유튜브 영상 같은 리소스는 상호작용이 불가능하다는 말이다.

![cors-sop](https://blog.kakaocdn.net/dna/baYRwc/btrRMbXB9oq/AAAAAAAAAAAAAAAAAAAAAE11xcRAPYSxcWNOQwp3gsm1fdseKq1TR7_2-V-OLRGI/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=SEFVMCIZOXWtHcMq4TcML7tUZec%3D)

#### 📜 동일 출처 정책이 필요한 이유

그렇다면 동일 출처가 아닌 경우 접근을 차단하는 이유는 뭘까?

사실 출처가 다른 두 어플리케이션이 자유로이 소통할 수 있는 환경은 꽤 위험한 환경이다. 만일 제약이 없다면, 해커가 CSRF(Cross-Site Request Forgery)나 XSS(Cross-Site Scripting) 등의 방법을 이용해서 우리가 만든 어플리케이션에서 해커가 심어놓은 코드가 실행하여 개인 정보를 가로챌 수 있다.

다음은 SOP 정책이 없는 상황에서 악의적인 홈페이지에 접속하는 상황을 가정 한 것이다.

![SOP(Same-Origin Policy)](https://blog.kakaocdn.net/dna/7Q6Sp/btrRLLdIgNN/AAAAAAAAAAAAAAAAAAAAAH-OqQQBuVK_P_TMJILXMKJdDIvGZ2_9wZl-5yrPBbBu/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=0z2z5OFPevUGXJrzqgVfuEZnKxA%3D)

SOP(Same-Origin Policy)

1. 사용자가 악성 사이트에 접속한다.
2. 이때 해커가 몰래 심어놓은 악의적인 자바스크립트가 실행되어, 사용자가 모르는 사이에 어느 포털 사이트에 요청을 보낸다.
3. 그럼 포털 사이트에서 해당 브라우저의 쿠키를 이용하여 로그인을 하거나 등 상호작용에 따른 개인 정보를 응답 값을 받은뒤, 사이트에서 해커 서버(hacker.example.com)로 재차 보낸다.
4. 이외에도 사용자가 접속중인 내부망의 아이피와 포트를 가져오거나, 해커가 사용자 브라우저를 프록시처럼 악용할 수도 있다.

따라서 이러한 악의적인 경우를 방지하기 위해, SOP 정책으로 동일하지 않는 다른 출처의 스크립트가 실행되지 않도록 브라우저에서 사전에 방지하는 것이다.

#### 🏷️ 같은 출처와 다른 출처 구분 기준

SOP 정책의 중요도와 필요성에 대해 알았으니, 두개의 출처의 다름 유무를 판단하는 기준이 무엇인지 알아보자.

출처(Origin)의 동일함은 두 URL의 구성 요소 중 **Protocol(Scheme), Host, Port 이 3가지만 동일** 하다면 동일 출처로 판단한다.

![cors-sop](https://blog.kakaocdn.net/dna/qli4x/btrRK2fHyHZ/AAAAAAAAAAAAAAAAAAAAAHtfWuN3Q45LncNxQMipwjtBZhKikk4XyneU_JS9AW25/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=rG0HdxofzYNFMwxDihXUZCvjmiY%3D)

기준이 되는 출처

다음은 https://www.domain.com:3000 출처에 대한 여러 URL에 따른 동일 출처 비교 표 이다.

| **URL** | **동일 출처?** | **이유** |
| --- | --- | --- |
| https://www.domain.com:3000/about | O | 프로토콜, 호스트, 포트 번호 동일 |
| https://www.domain.com:3000/about?username=inpa | O | 프로토콜, 호스트, 포트 번호 동일 |
| http://www.domain.com:3000 | X | 프로토콜 다름 (http ≠ https) |
| https://www.another.co.kr:3000 | X | 호스트 다름 |
| https://www.domain.com:8888 | X | 포트 번호 다름 |
| https://www.domain.com | X | 포트 번호 다름 (443 ≠ 3000) |

정리하자면 같은 프로토콜, 호스트, 포트를 사용한다면, 그 뒤의 다른 요소는 다르더라도 같은 출처로 인정된다.

반대로 프로토콜, 호스트, 포트 중 하나라도 자신의 출처와 다를경우 브라우저는 정책상 차단하게 된다.

> [!info] Info
> 웹의 흑역사인 Internet Explorer 브라우저는 웃기게도 출처 비교시 Port 부분은 무시한다. 이는 곧 보안 취약으로 이어지며 왜 그렇게 욕을 얻어먹는지 에 대한 이유중에 하나이기도 하다.
> 
> ![cors-sop](https://blog.kakaocdn.net/dna/FRvQ2/btrRMcIV7w9/AAAAAAAAAAAAAAAAAAAAAIC-ZsY1cBtA3JRO9y4BkEqY7cYFVaG97OtUJLM_pAzm/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=G1%2Fj1UaLPaEtdJdhL2shl1xgicg%3D)
> 
> 잘가라 IE (하지만 좀비가 되어 살아있는건 비밀)

#### 🌐 출처 비교와 차단은 브라우저가 한다

새내기 웹개발자들이 착각하는 부분이 위의 출처 구분을 서버가 하는 것으로 오해하는 것이다. 아무래도 서버에 요청을 했는데 무언가 에러가 뜨면 서버가 문제라고 생각이 들수 밖에 없기 때문이다. 그러나 출처를 비교하는 로직은 서버에 구현된 스펙이 아닌 **브라우저에 구현된 스펙** 이다.

![cors-sop](https://blog.kakaocdn.net/dna/bqkk57/btrRKJUJ5j5/AAAAAAAAAAAAAAAAAAAAAPFPDLRuAn2mZ6zXqUb2gDrwkcIaHgQe_zpz41R8_c3a/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=5XlGMrq44XnYGrJLjERP2hQM7qI%3D)

서버는 잘못이 없다. 브라우저가 난리쳐서 시뻘건 에러가 뜨는 것이다.

사실 서버는 리소스 요청에 의한 응답은 말끔히 해주었다. 잘못이 없는 것이다. 하지만 브라우저가 이 응답을 분석해서 동일 출처가 아니면, 시뻘건 에러를 내뿜는 것이다. (사실 서버가 헤더 정보를 덜 줘서 그런것이다. 이는 뒤에서 다룬다)

그래서 브라우저에는 에러가 뜨지만, 정작 서버 쪽에는 정상적으로 응답을 했다고 하기 때문에 난항은 겪는 것이다. 즉, 응답 데이터는 멀쩡하지만 브라우저 단에서 받을수 없도록 차단을 한 것이다.

> [!info] Info
> 그래서 CORS 에러를 해결하는 방안 중 하나로 크롬 브라우저 설정에 SOP 정책을 비활성화 하는 방법이 있긴 한데 권장하지는 않는다.

> [!warning] Tip
> 브라우저가 정책으로 차단을 한다는 말은, 브라우저를 통하지 않고 서버 간에 통신을 할때는 정책이 적용되지 않는다는 말과 같다.  
> 즉, 클라이언트 단 코드에서 API 요청을 하는게 아니라, 서버 단 코드에서 다른 출처의 서버로 API 요청을 하면 CORS 에러로부터 자유로워 진다. 그래서 이를 이용한 프록시(Proxy) 서버라는 것이 있다. (후술)

#### 🤔 그럼 죄다 차단하면 인터넷이 되는가?

하지만 인터넷은 여러 사람들에게 오픈된 환경이고, 이런 환경에서 웹페이지에서 다른 출처에 있는 리소스를 가져와 사용하는 일은 매우 흔한 일이라 무턱대고 막을 수는 없는 일이다.

![cors-sop](https://blog.kakaocdn.net/dna/o2q4y/btrR2HoliOj/AAAAAAAAAAAAAAAAAAAAAKPc95BW-nrHQt4koBmIuPO0Cf7IBUyHwNYVhx7ITJCF/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=CJFmvzJ5ziMdRZL5zh4hoFgyEbM%3D)

그래서 몇 가지 **예외 조항** 을 두고 다른 출처의 리소스 요청이라도 이 조항에 해당할 경우에는 허용하기로 했는데, 그 중 하나가 바로 CORS 정책을 지킨 리소스 요청이다.

---

### 교차 출처 리소스 공유 (Cross-Origin Resource Sharing)

이처럼 교차 출처 리소스 공유(Cross-Origin Resource Sharing, CORS)는 단어 그대로 **다른 출처의 리소스 공유에 대한 허용/비허용 정책** 이다.

아무리 보안이 중요하지만, 개발을 하다 보면 기능상 어쩔 수 없이 다른 출처 간의 상호작용을 해야 하는 케이스도 있으며, 또한 실무적으로 다른 회사의 서버 API를 이용해야 하는 상황도 존재한다. 따라서 이와 같은 예외 사항을 두기 위해 CORS 정책을 허용하는 리소스에 한해 다른 출처라도 받아들인다는 것이다.

#### 💬 우리가 욕했던 CORS는 사실 해결책이었다

결국 웹개발자를 괴롭히던 시뻘건 에러 메세지는 사실 브라우저의 SOP 정책에 따라 다른 출처의 리소스를 차단하면서 발생된 에러이며, CORS는 다른 출처의 리소스를 얻기위한 해결 방안 이었던 것이다. 요약하자면 **SOP 정책을 위반해도 CORS 정책에 따르면 다른 출처의 리소스라도 허용** 한다는 뜻이다.

그럼 어떻게 CORS 정책을 따르게 하여 SOP 정책을 회피할 수 있을까? 이를 알기 위해선 브라우저의 CORS 동작 과정을 살펴 보아야 한다.

#### 🔍 브라우저의 CORS 기본 동작 살펴보기

**1\. 클라이언트에서 HTTP요청의 헤더에 Origin을 담아 전달**

1. 기본적으로 웹은 HTTP 프로토콜을 이용하여 서버에 요청을 보내게 되는데,
2. 이때 브라우저는 요청 헤더에 Origin 이라는 필드에 출처를 함께 담아 보내게 된다.
![cors-http](https://blog.kakaocdn.net/dna/RZSfq/btrRNVTYjMR/AAAAAAAAAAAAAAAAAAAAAARPkxW3RhBftciBtlQOowjhXUgdQB6IaDX1hrrR-O3b/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=BdKWpEOYpEMMpBvvJR225MsMjh0%3D)

**2\. 서버는 응답헤더에 Access-Control-Allow-Origin을 담아 클라이언트로 전달한다.**

1. 이후 서버가 이 요청에 대한 응답을 할 때 응답 헤더에 ~~Access-Control-Allow-Origin~~ 이라는 필드를 추가하고 값으로 '이 리소스를 접근하는 것이 허용된 출처 url'을 내려보낸다.
![cors-http](https://blog.kakaocdn.net/dna/VVbfP/btrRPCsPQIM/AAAAAAAAAAAAAAAAAAAAABLZBQy1fKAzsYtUUMevG_gNiDSKKbYmkYyCHGldeZI4/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=uFN07wefDbyrSZS1lWhCvI%2Bu6YE%3D)

**3\. 클라이언트에서 Origin과 서버가 보내준 Access-Control-Allow-Origin을 비교한다.**

1. 이후 응답을 받은 브라우저는 자신이 보냈던 요청의 Origin과 서버가 보내준 응답의 Access-Control-Allow-Origin을 비교해본 후 차단할지 말지를 결정한다.
2. 만약 유효하지 않다면 그 응답을 사용하지 않고 버린다. (CORS 에러!!)
3. 위의 경우에는 둘다 http://localhost:3000이기 때문에 유효하니 다른 출처의 리소스를 문제없이 가져오게 된다.

#### 💬 결국 CORS 해결책은 서버의 허용이 필요

위의 브라우저의 CORS 동작 과정을 살펴보니, 길고 길었던 여정의 결론은 서버에서 ~~Access-Control-Allow-Origin~~ 헤더에 허용할 출처를 기재해서 클라이언트에 응답하면 되는 것이었다. 즉, 백엔드 개발자가 고쳐야될 부분인 것이다.

> [!info] Info
> 그렇다면 클라이언트에서 미리 자바스크립트로 origin 헤더값을 위조하면 되지 않을까 싶지만, 브라우저에서 이를 감지하여 차단하기 때문에 결론은 불가능하다.
> 
> ![cors-http](https://blog.kakaocdn.net/dna/d4jie0/btrRN5wgbq0/AAAAAAAAAAAAAAAAAAAAAGLA1t7-8WtbVYEGZ0wef-buaYNxMdMT-7ysQu7NgoM2/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=vhzMF%2BcTVb9dqRBemkKQLc6dppw%3D)

---

## CORS 작동 방식 3가지 시나리오

바로 위에서 살펴본 CORS 동작 흐름은 이해하기 쉽게 하기 위해 기본적인 작동 흐름을 보여준 것이고, 실제로는 CORS가 동작하는 방식은 한 가지가 아니라 **세 가지의 시나리오** 에 따라 변경되기 때문에, CORS를 정복하기 위해선 이들을 모두 알 필요가 있다. (공부가 끝이없다 ☹️)

다만 이 부분은 당장 CORS를 해결하는데 있어 필수 지식은 아니지만, 만일 독자분이 단순 요청을 떠나 쿠키나 토큰과 같은 인증 데이터를 다른 출처의 서버에 요청을 해야한다면 이 섹션의 지식은 필수이다. 또한 우리가 인터넷을 배울때 TCP / UDP의 내부 통신 과정을 배웠듯이, 브라우저의 세부적인 CORS 통신 동작 과정을 살펴봐야 나중에 최적화 작업을 할 수 있기 때문에 학습이 권장되는 바이다.

---

### 예비 요청 (Preflight Request)

사실 브라우저는 요청을 보낼때 한번에 바로 보내지않고, 먼저 **예비 요청** 을 보내 서버와 잘 통신되는지 확인한 후 **본 요청** 을 보낸다.

즉, 예비 요청의 역할은 본 요청을 보내기 전에 브라우저 스스로 안전한 요청인지 미리 확인하는 것이다.

이때 브라우저가 예비요청을 보내는 것을 **Preflight** 라고 부르며, 이 예비요청의 HTTP 메소드를 GET이나 POST가 아닌 OPTIONS라는 요청이 사용된다는 것이 특징이다.

예를들어 자바스크립트로 다음 api 요청을 보낸다고 가정해보자.

![Preflight-Request](https://blog.kakaocdn.net/dna/cY7mtS/btrRVLDcQM6/AAAAAAAAAAAAAAAAAAAAAN7U-6vwWf0yOPbCE6x6FWgegc8nZwxNExwsFFbJf0rr/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=RvZKojdOOZGVqDW2GRFCc%2F5W5c0%3D)

Preflight-Request

1. 자바스크립트의 ~~fetch()~~ 메서드를 통해 리소스를 받아오려고 한다.
2. 브라우저는 서버로 HTTP OPTIONS 메소드로 예비 요청(Preflight)을 먼저 보낸다.
	1. Origin 헤더에 자신의 출처를 넣는다.
		2. Access-Control-Request-Method 헤더에 실제 요청에 사용할 메소드를 설정한다.
		3. Access-Control-Request-Headers 헤더에 실제 요청에 사용할 헤더들을 설정한다.
3. 서버는 이 예비 요청에 대한 응답으로 어떤 것을 허용하고 어떤것을 금지하고 있는지에 대한 헤더 정보를 담아서 브라우저로 보내준다.
	1. Access-Control-Allow-Origin 헤더에 허용되는 Origin들의 목록을 설정한다.
		2. Access-Control-Allow-Methods 헤더에 허용되는 메소드들의 목록을 설정한다.
		3. Access-Control-Allow-Headers 헤더에 허용되는 헤더들의 목록을 설정한다.
		4. Access-Control-Max-Age 헤더에 해당 예비 요청이 브라우저에 캐시 될 수 있는 시간을 초 단위로 설정한다.
4. 이후 브라우저는 보낸 요청과 서버가 응답해준 정책을 비교하여, 해당 요청이 안전한지 확인하고 본 요청을 보내게 된다.
5. 서버가 본 요청에 대한 응답을 하면 최종적으로 이 응답 데이터를 자바스립트로 넘겨준다.

#### ✔️ 개발자 도구에서 예비 요청 확인하기

위의 플로우는 브라우저의 개발자 도구의 네트워크 탭을 통해 간단히 재현이 가능하다.

실제로 자바스크립트 코드로 api 요청을 보내면, 크롬 개발자 도구에서 클라이언트와 서버가 **본 요청(xhr)** 을 보내기 전에 **예비 요청(preflight)** 통신을 하고 있는 것을 볼수 있다.

javascript

```
await fetch("http://localhost:4000/users/location-registration", {"method":"DELETE"})
```
![cors-preflight](https://blog.kakaocdn.net/dna/byIF8x/btrqMQkFH3n/AAAAAAAAAAAAAAAAAAAAADytBpOgP9-7rP0VzTI-jj_WN6P6-rp3Mh93Od5Y9q5C/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=l4QxCJjMdT5ZsBXPmu0M6VD5ca8%3D)

cors-preflight

![cors-preflight](https://blog.kakaocdn.net/dna/b1MqDz/btrRNnxf5Yo/AAAAAAAAAAAAAAAAAAAAALL2H7KbAMKzQNXaRhDmvEZc4MP10-UCnuaQffhmunek/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=G2InlTQWSlt6pAfQjavjfN8h%2BeE%3D)

cors-preflight

위의 사진상에는 요청 헤더의 Origin과 응답 헤더의 Access-Control-Allow-Origin 의 URL값이 서로 같아 다른 출처라도 CORS(다른 출처 리소스 공유)가 허용되서 정상 응답을 받게 된다.

만일 이 둘이 다르게되면 브라우저는 이 요청이 CORS 정책을 위반했다고 판단하고 악명 높은 에러를 내뱉게 되는 것이다.

#### ⏰ 예비 요청의 문제점과 캐싱

요청을 보내기 전에 OPTIONS 메서드로 예비 요청을 보내 보안을 강화하는 목적의 취지는 좋다. 그러나 결국은 실제 요청에 걸리는 시간이 늘어나게 되어 어플리케이션 성능에 영향을 미치는 크나큰 단점이 있다.

특히 수행하는 API 호출 수가 많으면 많을 수록 예비 요청으로 인해 서버 요청을 배로 보내게 되니 비용 적인 측면에서 폐가 될 수 있다. 따라서 [브라우저 캐시(Cache)Visit Website](https://inpa.tistory.com/entry/HTTP-%F0%9F%8C%90-%EC%9B%B9-%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80%EC%9D%98-%EC%BA%90%EC%8B%9C-%EC%A0%84%EB%9E%B5-Cache-Headers-%EB%8B%A4%EB%A3%A8%EA%B8%B0) 를 이용해 ~~Access-Control-Max-Age~~ 헤더에 캐시될 시간을 명시해 주면, 이 Preflight 요청을 캐싱 시켜 최적화를 시켜줄 수 있다.

![preflight-cache](https://blog.kakaocdn.net/dna/edoq87/btrZuCz1o65/AAAAAAAAAAAAAAAAAAAAANd735ciCS1FRi4M9k7GXM1_fSGsI-xTySXeoISC410u/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=FZQSdmIq74amBlZVGnd36ylQIZ0%3D)

preflight-cache

> [!warning] Tip
> 예비 요청 캐싱 기간에 대해서는, 파이어폭스 브라우저는 86400초(24시간) 까지 가능하지만 크로미엄 기반 브라우저는 7200초(2시간)이 최대이다.

예비 요청 캐시는 다른 캐싱 매커니즘과 유사하게 작동한다.

![preflight-cache](https://blog.kakaocdn.net/dna/DHO4J/btrZz5HMUXp/AAAAAAAAAAAAAAAAAAAAAKEU-DY3W4G8F2eCcEcTNZ8zqRQ5LwZo4qQBwW2fSkym/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=LGK10SrH529X3eyBn5Cpkvo6r5A%3D)

preflight-cache

1. 브라우저는 예비(Preflight) 요청을 할 때마다, 먼저 Preflight 캐시를 확인하여 해당 요청에 대한 응답이 있는지 확인한다.
2. 만일 응답이 캐싱 되어 있지 않다면, 서버에 예비 요청을 보내 인증 절차를 밟는다.
3. 만일 서버로 부터 Access-Control-Max-Age 응답 헤더를 받는다면 그 기간 동안 브라우저 캐시에 결과를 저장한다.
4. 다시 요청을 보내고 만일 응답이 캐싱 되어 있다면, 예비 요청을 서버로 보내지 않고 대신 캐시된 응답을 사용한다.

---

### 단순 요청 (Simple Request)

단순 요청은 말그대로 **예비 요청(Prefilght)을 생략하고** **바로 서버에 직행으로 본 요청** 을 보낸 후, 서버가 이에 대한 응답의 헤더에 Access-Control-Allow-Origin 헤더를 보내주면 브라우저가 CORS정책 위반 여부를 검사하는 방식이다.

![simple-Request](https://blog.kakaocdn.net/dna/pnJSG/btrRW9XSo9s/AAAAAAAAAAAAAAAAAAAAALcyxIqAgv7lelnA1Q5REzm-5WfW2NwyXRyOO2D9j6dI/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=lT2ndiB7hxDEfKOdlYK6o27%2FgwE%3D)

simple-Request

다만, 심플한 만큼 특정 조건을 만족하는 경우에만 예비 요청을 생략할 수 있다.

대표적으로 아래 **3가지 경우를 만족** 할때 만 가능하다.

1. 요청의 메소드는 GET, HEAD, POST 중 하나여야 한다.
2. ~~Accept~~, ~~Accept-Language~~, ~~Content-Language~~, ~~Content-Type~~, ~~DPR~~, ~~Downlink~~, ~~Save-Data~~, ~~Viewport-Width~~, ~~Width~~ 헤더일 경우 에만 적용된다.
3. Content-Type 헤더가 ~~application/x-www-form-urlencoded~~, ~~multipart/form-data~~, ~~text/plain~~ 중 하나여야한다. 아닐 경우 예비 요청으로 동작된다.

이처럼 다소 **까다로운 조건** 들이 많기 때문에, 위 조건을 모두 만족되어 단순 요청이 일어나는 상황은 드물다고 보면 된다.

왜냐하면 대부분 HTTP API 요청은 ~~text/xml~~ 이나 ~~application/json~~ 으로 통신하기 때문에 3번째 Content-Type이 위반되기 때문이다.

**따라서 대부분의 API 요청은 그냥 예비 요청(preflight)으로 이루어진다 라고 이해하면 된다.**

---

### 인증된 요청 (Credentialed Request)

인증된 요청은 클라이언트에서 서버에게 **자격 인증 정보(Credential)** 를 실어 요청할때 사용되는 요청이다.

여기서 말하는 **자격 인증 정보** 란 세션 ID가 저장되어있는 쿠키(Cookie) 혹은 Authorization 헤더에 설정하는 토큰 값 등을 일컫는다.

즉, 클라이언트에서 일반적인 JSON 데이터 외에도 쿠키 같은 인증 정보를 포함해서 다른 출처의 서버로 전달할때 CORS의 세가지 요청중 하나인 인증된 요청으로 동작된다는 말이며, 이는 기존의 단순 요청이나 예비 요청과는 살짝 다른 인증 형태로 통신하게 된다.

#### 1\. 클라이언트에서 인증 정보를 보내도록 설정하기

기본적으로 브라우저가 제공하는 요청 API 들은 별도의 옵션 없이 브라우저의 쿠키와 같은 인증과 관련된 데이터를 함부로 요청 데이터에 담지 않도록 되어있다.

이때 요청에 인증과 관련된 정보를 담을 수 있게 해주는 옵션이 바로 ~~credentials~~ 옵션이다. 이 옵션에는 3가지의 값을 사용할 수 있으며, 각 값들이 가지는 의미는 아래와 같다.

| **옵션 값** | **설명** |
| --- | --- |
| same-origin(기본값) | 같은 출처 간 요청에만 인증 정보를 담을 수 있다. |
| include | 모든 요청에 인증 정보를 담을 수 있다. |
| omit | 모든 요청에 인증 정보를 담지 않는다. |

만일 이러한 별도의 설정을 해주지 않으면 쿠키 등의 인증 정보는 절대로 자동으로 서버에게 전송되지 않는다.

서버에 인증된 요청을 보내는 방법으로는 fetch 메서드를 사용하거나 axios, jQuery 라이브리리 등 다양하다. 어떤 메서드를 사용하느냐에 따라 약간 ~~credentials~~ 옵션을 지정하는 문법이 다르니 이들을 모두 소개해 본다.

javascript

```
// fetch 메서드
fetch("https://example.com:1234/users/login", {
    method: "POST",
    credentials: "include", // 클라이언트와 서버가 통신할때 쿠키와 같은 인증 정보 값을 공유하겠다는 설정
    body: JSON.stringify({
        userId: 1,
    }),
})
```

javascript

```
// axios 라이브러리
axios.post('https://example.com:1234/users/login', { 
    profile: { username: username, password: password } 
}, { 
    withCredentials: true // 클라이언트와 서버가 통신할때 쿠키와 같은 인증 정보 값을 공유하겠다는 설정
})
```

javascript

```
// jQuery 라이브러리
$.ajax({
    url: "https://example.com:1234/users/login",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    dataType: "json",        
    xhrFields: { 
        withCredentials: true // 클라이언트와 서버가 통신할때 쿠키와 같은 인증 정보 값을 공유하겠다는 설정
    },
    success: function (retval, textStatus) {
        console.log( JSON.stringify(retval));
    }
});
```

#### 2\. 서버에서 인증된 요청에 대한 헤더 설정하기

서버도 마찬가지로 이러한 인증된 요청에 대해 **일반적인 CORS 요청과는 다르게 대응** 해줘야 한다.

1. 응답 헤더의 ~~Access-Control-Allow-Credentials~~ 항목을 true로 설정해야 한다.
2. 응답 헤더의 ~~Access-Control-Allow-Origin~~ 의 값에 와일드카드 문자("\*")는 사용할 수 없다.
3. 응답 헤더의 ~~Access-Control-Allow-Methods~~ 의 값에 와일드카드 문자("\*")는 사용할 수 없다.
4. 응답 헤더의 ~~Access-Control-Allow-Headers~~ 의 값에 와일드카드 문자("\*")는 사용할 수 없다.

즉, 응답의 Access-Control-Allow-Origin 헤더가 와일드카드(\*)가 아닌 분명한 Origin으로 설정되어야 하고, Access-Control-Allow-Credentials 헤더는 true로 설정되어야 한다는 뜻이다. 그렇지 않으면 브라우저의 CORS 정책에 의해 응답이 거부된다. (인증 정보는 민감한 정보이기 때문에 출처를 정확하게 설정해주어야 한다)

만일 이를 어길경우 아래와 같은 또다른 종류의 CORS 에러 메세지를 접하게 될 것이다.

![cors-Credentialed-Request](https://blog.kakaocdn.net/dna/cNsHXe/btrRVtJ1HkV/AAAAAAAAAAAAAAAAAAAAAJ-cHS9q-vACEYztx1cpoEXu8fvNDclbyJqZ0AT1Dr38/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=nT3OrOzfxe29lpSRLzanXtSwepA%3D)

cors-Credentialed-Request

![cors-Credentialed-Request](https://blog.kakaocdn.net/dna/6gF6Z/btrRShDImUF/AAAAAAAAAAAAAAAAAAAAAFQimbhKxUza5D6yzHHu6XW7eFoaxqHeVAfoxRLi2Q0f/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=6Y2Scb2ezbP4lJbrcD3pMhuFOzc%3D)

cors-Credentialed-Request

위의 과정을 그림으로 나타내면 다음과 같다.

![cors-Credentialed-Request](https://blog.kakaocdn.net/dna/Z0QvZ/btrRR81ew57/AAAAAAAAAAAAAAAAAAAAACKCgDuOcKAah-WWP-MNUnf1j_J0EehvbC3xn2cXRcy9/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=GHcDwkxD9gCRiE31hMQ7We%2FKwgs%3D)

cors-Credentialed-Request

참고로 인증된 요청 역시 역시 예비 요청 처럼 preflight가 먼저 일어난다. 위의 그림에서는 단순 GET 요청이기 때문에 예비 요청은 생략 되었다.

---

### CORS 3가지 시나리오 작동 체험 사이트

위의 3가지 CORS 시나리오를 코드로 미리 체험할 수 있는 좋은 사이트가 있어서 소개해 본다.

서버에서의 설정 형태와 클라이언트에서의 요청 형태에 따라 CORS 에러가 나기도 하고 통과되기 하는 예제를 볼 수 있다.

> [![postcard-title](https://tistory3.daumcdn.net/tistory/4939852/skin/images/thumb.webp)](https://chuckchoiboi.github.io/cors-tutorial/)
> 
> [CORS Tutorial](https://chuckchoiboi.github.io/cors-tutorial/)
> 
> chuckchoiboi.github.io
> 
> CORS Tutorial

![cors-에러-정리](https://blog.kakaocdn.net/dna/nTcBY/btrRR8F2fQS/AAAAAAAAAAAAAAAAAAAAAPVX7O9vS3BSBuP56ZLuX-BOfAHSOPUvnOK7sNCZIDN-/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=lxukp9%2FI%2FSX84qkxykI%2BcFy0lss%3D)

cors-에러-정리

![cors-에러-정리](https://blog.kakaocdn.net/dna/cEVdnb/btrRQjhjQvL/AAAAAAAAAAAAAAAAAAAAAFw_UNE_OY_rn5e1btBI3UxBCoJlcR9k2feBim6En3mn/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=yjFzD8Sz1EipT5oQzfp0MvnhxR8%3D)

cors-에러-정리

![cors-에러-정리](https://blog.kakaocdn.net/dna/bE6Vl6/btrRRA3815T/AAAAAAAAAAAAAAAAAAAAABY5CKlkoB2ijCK8Zl3t-nGst67kMVRfLoYvejbw7_P6/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=SoNfcL1ufrbSKtuGYrSBTnvV8go%3D)

cors-에러-정리

---

## CORS를 해결하는 방법 총정리 🙌

### 1\. Chrome 확장 프로그램 이용

Chrome에서는 CORS 문제를 해결하기 위한 확장 프로그램을 제공해준다.

아래 링크에서 'Allow CORS: Access-Control-Allow-Origin' 크롬 확장 프로그램을을 설치 해준다.

> [![postcard-title](https://blog.kakaocdn.net/dna/blLeek/hyM6F1w19t/AAAAAAAAAAAAAAAAAAAAABozs9pPp0-o7BCvGKKqpvV8dziOhNlCg0IxSWkFPGaP/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=erEo1%2BBviwT7kbnQ3DsSw4UE6cY%3D)](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
> 
> [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
> 
> chrome.google.com
> 
> Easily add (Access-Control-Allow-Origin: \*) rule to the response header.

그러면 브라우저 오른쪽 상단에서 확장 프로그램을 활성화 시킬 수 있다. 해당 프로그램을 활성화 시키게 되면, **로컬(localhost) 환경에서 API를 테스트 시, CORS 문제를 해결** 할 수 있다.

서버 테스트 환경에서 고민하지 않고 빠르게 CORS를 해결하는데 좋은 선택지일 것이다.

![cors-에러-정리](https://blog.kakaocdn.net/dna/pYTv2/btrqMDToviG/AAAAAAAAAAAAAAAAAAAAAKKcXVPrj1kiJq_0OQvmqJvK8Y8Gp3Ds_2rcO-noyOjS/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=NMOc%2BnW5CrGAvqCo%2BQi1KbUkQVU%3D)

cors-에러-정리

---

### 2\. 프록시 사이트 이용하기

프록시(Proxy)란 클라이언트와 서버 사이의 중계 대리점이라고 보면 된다.

즉, 프론트에서 직접 서버에 리소스를 요청을 했더니 서버에서 따로 설정을 안해줘서 CORS 에러가 뜬다면, **모든 출처를 허용한 서버 대리점** 을 통해 요청을 하면 되는 것이다.

![cors-proxy](https://blog.kakaocdn.net/dna/38gu2/btrRS6vg4G2/AAAAAAAAAAAAAAAAAAAAAF73SFV4JNOg3sN3Luh0ctb4U0D0GgWujqgXZgfHhwC0/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=d9mrTOQY4PP4%2FS1y48RBX%2BORlGs%3D)

cors-proxy

다만 현재 무료 프록시 서버 대여 서비스들은 모두 악용 사례 때문에 api 요청 횟수 제한을 두어 실전에서는 사용하기 무리이다. 따라서 테스트용이나 맛보기용으로 사용하되, 실전에서는 직접 프록시 서버를 구축하여 사용하여야 한다.

#### heroku 프록시 서버

1. [http://cors-anywhere.herokuapp.com/corsdemoVisit Website](http://cors-anywhere.herokuapp.com/corsdemo)
2. 위의 사이트로 가서 버튼을 누르고 데모 서버를 활성화 시킨다.
3. 다만 시간 제한이 있기 때문에 일시적인 해결 방편 이다.
![cors-proxy](https://blog.kakaocdn.net/dna/MtNzS/btrRRuVIjr4/AAAAAAAAAAAAAAAAAAAAAJ7xEQvF3Cty9dA9EoRpEkFZtVA66B5Pmq83JtZaUd-M/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=qY%2FVmVrqzNoDk5Ta6uZubFW8WQg%3D)

cors-proxy

javascript

```
const url = 'https://google.com' // 이 부분을 이용하는 서버 URL로 변경

fetch(\`https://cors-anywhere.herokuapp.com/${url}\`)
    .then((response) => response.text())
    .then((data) => console.log(data));
```

#### cors proxy app 프록시 서버

1. [raravelVisit Website](https://github.com/raravel/cors-proxy) 님이 만드신 서비스
2. axios 라이브러리 설치가 필요하다.

html

```
<script src='https://cdnjs.cloudflare.com/ajax/libs/axios/1.1.3/axios.min.js'></script>
<script>
    axios({
        url: 'https://cors-proxy.org/api/',
        method: 'get',
        headers: {
            'cors-proxy-url' : 'https://google.com/' // 이 부분을 이용하는 서버 URL로 변경
        },
    }).then((res) => {
        console.log(res.data);
    })
</script>
```

#### cors.sh 프록시 서버

1. [https://cors.sh/Visit Website](https://cors.sh/)
2. 실전에서 이용하려면 유료 결제가 필요하듯 하다. (free도 가능)

javascript

```
const url = 'https://google.com' // 이 부분을 이용하는 서버 URL로 변경

fetch(\`https://proxy.cors.sh/${url}\`)
    .then((response) => response.text())
    .then((data) => console.log(data));
```

---

### 3\. 서버에서 Access-Control-Allow-Origin 헤더 세팅하기

직접 서버에서 HTTP 헤더 설정을 통해 출처를 허용하게 설정하는 가장 정석적인 해결책이다.

서버의 종류도 노드 서버, 스프링 서버, 아파치 서버 등 여러가지가 있으니, 이에 대한 각각 해결책을 나열해본다.

각 서버의 문법에 맞게 위의 HTTP 헤더를 추가해 주면 된다.

참고로 CORS에 연관된 HTTP 헤더 값으로는 다음 종류가 있다. (이들을 모두 설정할 필요는 없다)

http

```
# 헤더에 작성된 출처만 브라우저가 리소스를 접근할 수 있도록 허용함.
# * 이면 모든 곳에 공개되어 있음을 의미한다. 
Access-Control-Allow-Origin : https://naver.com

# 리소스 접근을 허용하는 HTTP 메서드를 지정해 주는 헤더
Access-Control-Request-Methods : GET, POST, PUT, DELETE

# 요청을 허용하는 해더.
Access-Control-Allow-Headers : Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization

# 클라이언트에서 preflight 의 요청 결과를 저장할 기간을 지정
# 60초 동안 preflight 요청을 캐시하는 설정으로, 첫 요청 이후 60초 동안은 OPTIONS 메소드를 사용하는 예비 요청을 보내지 않는다.
Access-Control-Max-Age : 60

# 클라이언트 요청이 쿠키를 통해서 자격 증명을 해야 하는 경우에 true. 
# 자바스크립트 요청에서 credentials가 include일 때 요청에 대한 응답을 할 수 있는지를 나타낸다.
Access-Control-Allow-Credentials : true

# 기본적으로 브라우저에게 노출이 되지 않지만, 브라우저 측에서 접근할 수 있게 허용해주는 헤더를 지정
Access-Control-Expose-Headers : Content-Length
```

#### Node.js 세팅

서버에 response 헤더(Header) 값으로 Access-Control 설정을 해준다.

javascript

```
var http = require('http');

const PORT = process.env.PORT || 3000;

var httpServer = http.createServer(function (request, response) {
    // Setting up Headers
    response.setHeader('Access-Control-Allow-origin', '*'); // 모든 출처(orogin)을 허용
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // 모든 HTTP 메서드 허용
    response.setHeader('Access-Control-Allow-Credentials', 'true'); // 클라이언트와 서버 간에 쿠키 주고받기 허용

    // ...

    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('ok');
});

httpServer.listen(PORT, () => {
    console.log('Server is running at port 3000...');
});
```

이때 ~~Access-Control-Allow-origin~~ 헤더 값으로 ~~\*~~ 을 사용하면 모든 Origin에서 오는 요청을 허용한다는 의미이므로 당장은 편할 수 있겠지만, 바꿔서 생각하면 정체도 모르는 이상한 출처에서 오는 요청까지 모두 허용하기 때문에 보안은 더 허술해진다. 그러니 가급적이면 귀찮더라도 다음과 같이 출처를 직접 명시해주도록 하자.

javascript

```
response.setHeader('Access-Control-Allow-origin', 'https://inpa.tistory.com');
```

#### Express.js 세팅

shell

```
> npm i cors
```

javascript

```
const express = require('express')
const cors = require("cors"); // cors 설정을 편안하게 하는 패키지
const app = express();

// ...

app.use(cors({
    origin: "https://naver.com", // 접근 권한을 부여하는 도메인
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200, // 응답 상태 200으로 설정
}));

// ...
```

> [![postcard-title](https://blog.kakaocdn.net/dna/zZJwv/hyNQXUt0yv/AAAAAAAAAAAAAAAAAAAAAHYBHjNRGw41_CHcuDPyhc7g07LNxEnsFeQq4t3IC7tG/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=%2BKTP6QjypQ30aYhHByHzJWfo1uQ%3D)](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-CORS-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-cors-%EB%AA%A8%EB%93%88)
> 
> [\[NODE\] 📚 CORS 설정하기 (cors 모듈)](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-CORS-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-cors-%EB%AA%A8%EB%93%88)
> 
> inpa.tistory.com
> 
> CORS 란? \[WEB\] 📚 CORS 💯 정리 & 해결 방법 👏 CORS(Cross Origin Resource Sharing) CORS 정책은 우리가 가져오는 리소스들이 안전한지 검사하는 관문이다. 웹개발을 하는 사람들은 이 CORS 정책위반으로 인해

#### JSP / Servlet 세팅

java

```
import javax.servlet.*;

public class CORSInterceptor implements Filter {

    private static final String[] allowedOrigins = {
            "http://localhost:3000", "http://localhost:5500", "http://localhost:5501",
            "http://127.0.0.1:3000", "http://127.0.0.1:5500", "http://127.0.0.1:5501"
    };

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;

        String requestOrigin = request.getHeader("Origin");
        if(isAllowedOrigin(requestOrigin)) {
            // Authorize the origin, all headers, and all methods
            ((HttpServletResponse) servletResponse).addHeader("Access-Control-Allow-Origin", requestOrigin);
            ((HttpServletResponse) servletResponse).addHeader("Access-Control-Allow-Headers", "*");
            ((HttpServletResponse) servletResponse).addHeader("Access-Control-Allow-Methods",
                    "GET, OPTIONS, HEAD, PUT, POST, DELETE");

            HttpServletResponse resp = (HttpServletResponse) servletResponse;

            // CORS handshake (pre-flight request)
            if (request.getMethod().equals("OPTIONS")) {
                resp.setStatus(HttpServletResponse.SC_ACCEPTED);
                return;
            }
        }
        // pass the request along the filter chain
        filterChain.doFilter(request, servletResponse);
    }

    private boolean isAllowedOrigin(String origin){
        for (String allowedOrigin : allowedOrigins) {
            if(origin.equals(allowedOrigin)) return true;
        }
        return false;
    }
}
```

#### Spring 세팅

java

```
// 스프링 서버 전역적으로 CORS 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:8080", "http://localhost:8081") // 허용할 출처
            .allowedMethods("GET", "POST") // 허용할 HTTP method
            .allowCredentials(true) // 쿠키 인증 요청 허용
            .maxAge(3000) // 원하는 시간만큼 pre-flight 리퀘스트를 캐싱
    }
}
```

java

```
// 특정 컨트롤러에만 CORS 적용하고 싶을때.
@Controller
@CrossOrigin(origins = "*", methods = RequestMethod.GET) 
public class customController {

    // 특정 메소드에만 CORS 적용 가능
    @GetMapping("/url")  
    @CrossOrigin(origins = "*", methods = RequestMethod.GET) 
    @ResponseBody
    public List<Object> findAll(){
        return service.getAll();
    }
}
```

#### Apache 세팅

httpd.conf에서 ~~\<IfModule mod\_headers.c>~~ 태그 안에 헤더 설정을 넣어준다. 또는 VirualHost 부분에 넣어도 된다.

xml

```
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
```

#### Tomcat

톰캣 폴더 경로의 conf/web.xml 혹은 webapps 내의 프로젝트 폴더 내 WEB-INF/web.xml 파일에 아래 헤더 설정을 추가

xml

```
<filter>
    <filter-name>CorsFilter</filter-name>
    <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
    <init-param>
        <param-name>cors.allowed.origins</param-name>
        <param-value>*</param-value>
    </init-param>
    <init-param>
        <param-name>cors.allowed.methods</param-name>
        <param-value>GET,POST,HEAD,OPTIONS,PUT,DELETE</param-value>
    </init-param>
    <init-param>
        <param-name>cors.allowed.headers</param-name>
        <param-value>Content-Type,X-Requested-With,accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers</param-value>
    </init-param>
    <init-param>
        <param-name>cors.exposed.headers</param-name>
        <param-value>Access-Control-Allow-Origin,Access-Control-Allow-Credentials</param-value>
    </init-param>
    <init-param>
        <!-- 쿠키 통신을 안하는데 이걸 true로 하면 4XX 서버 에러가 뜬다 -->
        <param-name>cors.support.credentials</param-name>
        <param-value>false</param-value> 
    </init-param>
    <init-param>
        <param-name>cors.preflight.maxage</param-name>
        <param-value>10</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CorsFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

#### Nginx

nginx.conf 파일 안에 ~~location /~~ 부분에 add\_header 값으로 헤더 설정을 추가

json

```
location / {
    root html;
    add_header 'Access-Control-Allow-Origin' '*';
    index  index.html index.htm;
}
```

#### AWS (S3 호스팅)

1. S3 콘솔 메뉴에 들어가 버킷을 선택한다.
2. 권한(Permissions) 탭을 선택한다.
3. 교차 출처 리소스 공유 창에서 \[편집\] 선택한다.
4. 텍스트 상자에 아래 JSON CORS 규칙을 입력한다.
![s3-cors](https://blog.kakaocdn.net/dna/cyXIRR/btrZzawiBkH/AAAAAAAAAAAAAAAAAAAAAA4cmKb53FSxWSh4ZSD5MxqRj3m1ZRguxn8R657OpGoV/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=TIhk3TsFma9WoCvgfeGb4lSiEZw%3D)

json

```
[
  {
    "AllowedHeaders": [
      "Authorization"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://www.example.com"
    ],
    "ExposeHeaders": [
      "Access-Control-Allow-Origin"
    ]
  }
]
```

---

## 추가적으로 알아야 하는 CORS 사례

압도적인 포스팅량을 이겨내고 여기까지 스크롤하여 학습한 독자분들께 존경의 박수를 보낸다. 하지만 겨우겨우 CORS 정책에 대해 공부하고 해결법을 적용 시켰더니 또 공부할게 있다고 하니 멘탈이 흔들린다. 다만 이 부분은 실무에 자주 발생하는 상황은 아니기 때문에 지금 당장 학습할 필요성은 적으며 조금 심화적인 내용이라 난이도도 있어, 시간있을때 나중에 학습하길 권장한다.

![추가적으로 알아야 하는 CORS 사례](https://blog.kakaocdn.net/dna/dcXgLS/btrR2r0sbZm/AAAAAAAAAAAAAAAAAAAAADq2LKXXRMbIa1Mq36_V96gFjPdybtENTAP0uyTXxouf/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=C%2FqKkhISitZppcC9%2BzpwDoTpXmM%3D)

추가적으로 알아야 하는 CORS 사례

### CORS의 보안 취약점 가이드

가만 생각해보면, 원래는 SOP 정책으로 막혔어야할 외부 리소스들이 CORS 정책으로 억지로 뚫어줬으니 공격에 그대로 노출되는건 당연한 수순일지 모른다. 예를들어 CORS 정책에 대해 서버에서 너무 유연하게 리소스 허용 설정을 하게 될 경우, 해당 웹어플리케이션의 흐름을 악용하여 타인의 개인 정보를 해킹할 위험성이 있게 된다.

대표적인 예로 허용할 도메인들을 설정하기 귀찮다고 와일드 카드(\*)로 퉁치는걸 들 수 있다. 즉, 서버 개발자가 CORS 정책을 잘못 구성할 경우 심각한 보안 위협이 될 수 있다는 말이다. 이에 대한 보안 문제점 예방 가이드에 대해 다음 포스팅으로 나눠본다.

> [![postcard-title](https://blog.kakaocdn.net/dna/bUG5Z5/hyQH4YyDSn/AAAAAAAAAAAAAAAAAAAAACGFr6KGvuP-Iy-5-uljlFICJtJEtW_TS0l4LbQT5P7P/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=9FsbDEaO9qThb3hfiMdUjHNQ05s%3D)](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-CORS-%EB%B3%B4%EC%95%88-%EC%B7%A8%EC%95%BD%EC%A0%90-%EC%98%88%EB%B0%A9-%EA%B0%80%EC%9D%B4%EB%93%9C)
> 
> [\[WEB\] 🌐 CORS 보안 취약점 예방 가이드](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-CORS-%EB%B3%B4%EC%95%88-%EC%B7%A8%EC%95%BD%EC%A0%90-%EC%98%88%EB%B0%A9-%EA%B0%80%EC%9D%B4%EB%93%9C)
> 
> inpa.tistory.com
> 
> CORS의 보안 문제점 다른 출처(Origin)의 서버의 리소스를 제약없이 가져와 사용할 경우 XSS(Cross-Site Scripting)나 CSRF(Cross-Site Request Fogery)와 같은 스크립팅 공격을 당할 위험성이 있다. 그래서 탄생한

---

### Chorme PNA CORS 문제

만일 위에서 본 일반적인 CORS 에러 메세지가 아닌 아래와 같은 또다른 CORS 에러 메세지가 나왔다면, 별도의 사설망 접근(private network access)에 대한 지식이 필요하다.

![Chorme PNA CORS](https://blog.kakaocdn.net/dna/5e9ro/btr3QwIj22e/AAAAAAAAAAAAAAAAAAAAAI1nOeQlnopPqQvxQ8VIh0wlXblqfwM2Z6oKVIzxfwvK/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=0hH7k5UhPnq5gEzAiFLemLaxPgM%3D)

Chorme PNA CORS

"The request client is not a secure context and the resource is in more-private adress space local"

간단히 말하자면 **공인 네트워크의 웹사이트에서 사설 네트워크의 리소스를 호출** 할때 사설망 접근 관련 CORS 에러가 뜨게 되는데, 자세한 내용은 아래 포스팅을 참고하길 바란다.

> [![postcard-title](https://blog.kakaocdn.net/dna/WxCAK/hyR100iHuQ/AAAAAAAAAAAAAAAAAAAAAAchAjQ-BprcRJwnvVcryZOH9Lmylke50NIpLZ4qAz4V/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=p4lqWji8U3iCxfTBdQ65KMJLzPg%3D)](https://inpa.tistory.com/entry/%F0%9F%8C%90-%ED%81%AC%EB%A1%AC-%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80-PNA-%EA%B6%8C%ED%95%9C%EA%B3%BC-CORS-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0)
> 
> [🌐 크롬 브라우저 PNA 권한과 CORS 해결하기](https://inpa.tistory.com/entry/%F0%9F%8C%90-%ED%81%AC%EB%A1%AC-%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80-PNA-%EA%B6%8C%ED%95%9C%EA%B3%BC-CORS-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0)
> 
> inpa.tistory.com
> 
> Chrome PNA (Private Network Access) 사설망 접근(private network access) 이란, 비인증된 공인(public) 웹사이트에서, 사이트를 방문한 사용자의 와 같은 사설 네트워크망(localhost(127.0.0.1) or 192.168.0.\* 아이피) 엔드

---

### 브라우저 Cache에 의한 CORS 문제

브라우저는 기본적으로 이미지와 같은 고용량 리소스에 대해서 한번 요청해서 응답받으면 자동으로 cache하여 저장해놓는다. 그러면 나중에 똑같은 리소스를 재요청해도 캐시 저장소에서 끌어다 쓰면 네트워크 통신없이 빠르게 가져올 수 있어 성능 상 굉장한 이점을 얻기 때문이다.

그러나 캐시에 대해서 기본적인 지식이 있는 독자분들이라면 이 캐시 기능 때문에 최신 리소스 불일치 현상 및 여러가지 자잘한 문제점이 존재한다는 단점은 알고 있을 것이다. 즉, CORS 역시 이러한 캐시 문제 때문에 뜬금없이 발생될수도 있다.

> [![postcard-title](https://blog.kakaocdn.net/dna/m5S7P/hyR19WQOpV/AAAAAAAAAAAAAAAAAAAAAPALEYTAj-x_wyxboPhGWWstLjsIepTsPtMjcM14TJUY/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=prSgSVXQ7QT6rtiMVAewH4%2FWmFc%3D)](https://inpa.tistory.com/entry/%F0%9F%8C%90-CORS-%EC%BA%90%EC%8B%9C-%EC%97%90%EB%9F%AC)
> 
> [🌐 리소스 캐시로 인한 CORS 에러 현상 고찰](https://inpa.tistory.com/entry/%F0%9F%8C%90-CORS-%EC%BA%90%EC%8B%9C-%EC%97%90%EB%9F%AC)
> 
> inpa.tistory.com
> 
> 브라우저 캐시로 인한 CORS 문제 CORS(Cross-Origin Resource Sharing)는 서로 다른 출처(Origin)의 리소스를 공유하고 싶을때 사용하는 정책을 말한다. 기본적으로 브라우저는 SOP(Same Origin Policy) 정책을 따르

---

[저작자표시 (새창열림)](https://creativecommons.org/licenses/by/4.0/deed.ko)

인용한 부분에 있어 만일 누락된 출처가 있다면 반드시 알려주시면 감사하겠습니다

이 글이 좋으셨다면 **구독 & 좋아요**

여러분의 구독과 좋아요는  
저자에게 큰 힘이 됩니다.

![subscribe](https://tistory1.daumcdn.net/tistory/4939852/skin/images/sub.png)

이전 포스트

[🌐 아주 쉽게 이해하는 Stateful / Stateless 차이](https://inpa.tistory.com/entry/WEB-%F0%9F%93%9A-Stateful-Stateless-%EC%A0%95%EB%A6%AC)

다음 포스트

[🌐 CORS 보안 취약점 예방 가이드](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-CORS-%EB%B3%B4%EC%95%88-%EC%B7%A8%EC%95%BD%EC%A0%90-%EC%98%88%EB%B0%A9-%EA%B0%80%EC%9D%B4%EB%93%9C)

---

![comment](https://tistory1.daumcdn.net/tistory/4939852/skin/images/comment.webp)

[Inpa Dev 👨💻](https://inpa.tistory.com/) [**IT 분야 크리에이터**](https://notice.tistory.com/2648) [성장 욕구가 가파른 초보 개발자로서 공부한 내용을 쉽게 풀어쓴 기술 개발자 블로그를 운영하고 있습니다.](https://inpa.tistory.com/)

---

## 💭 내 메모
<!-- 클리핑 후 직접 작성 — 왜 저장했나 · 핵심 takeaway · 궁금한 점. 인제스트 시 이 메모를 우선 반영한다. -->
