---
source_type: "article"
title: "🌐 웹 브라우저의 Cache 전략 & 헤더 다루기"
url: "https://inpa.tistory.com/entry/HTTP-%F0%9F%8C%90-%EC%9B%B9-%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80%EC%9D%98-%EC%BA%90%EC%8B%9C-%EC%A0%84%EB%9E%B5-Cache-Headers-%EB%8B%A4%EB%A3%A8%EA%B8%B0"
author:
  - "인파_"
site: "tistory.com"
published: 2022-12-27
clipped: 2026-07-03
description: "웹브라우저의 캐시(Cache) 원리 컴퓨터 운영체제에서의 캐시(Cache)는 주기억장치에서 자주 사용하는 프로그램과 데이터를 하드디스크로부터 가져오는데 시간이 많이 걸리니 캐시 저장소에 임시로 적재해두고 빠르게 접근하기 위한 기술이다. 캐시는 비단 컴퓨터 OS에만 국한된 기술이 아니다. 임시 저장소에 적재해놓고 빠르게 엑세스함으로써 처리 성능을 높인다는 개념 자체는 어디에든 적용이 가능하다. 이는 인터넷(Internet)에서도 적용된다. 웹브라우저는 서버와 HTTP 프로토콜을 통해 리소스를 서버에게 요청을 하여 가져오고 이를 사용자에게 리소스를 화면으로 보여주거나 제공한다. 이러한 통신 과정을 거치면서 클라이언트는 네트워크를 거치는 시간이 소비되며, 서버는 요청을 처리하는데 시간이 소비된다. 만약 클라이.."
tags:
  - "clippings/article"
---
> “ 스파게티 코드 소스가 주석 안달린 소스 나무란다. ”
> 
> ##### \- 개발자 속담(Programmer’s Proverbs)

![http-cache-header](https://blog.kakaocdn.net/dna/b1zKIP/btrTRBzZ9Rl/AAAAAAAAAAAAAAAAAAAAABhvHotvhjGEAgTxnnisiB_kxS5zmjal6qkAYeZjjq7d/img.webp?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=AJEYmyzzJ6gSdfaA4yZobqsWNpU%3D)

http-cache-header

## 웹브라우저의 캐시(Cache) 원리

컴퓨터 운영체제에서의 캐시(Cache)는 주기억장치에서 자주 사용하는 프로그램과 데이터를 하드디스크로부터 가져오는데 시간이 많이 걸리니 캐시 저장소에 임시로 적재해두고 빠르게 접근하기 위한 기술이다.

![http-cache-header](https://blog.kakaocdn.net/dna/byS3Hc/btrTRZgkBU0/AAAAAAAAAAAAAAAAAAAAADxm3PyyK1qqwTKzO1ey-555DmzhmSt8fVg-G6k20SJL/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=xYoViPrRN8E369Hei6kx1et7rzc%3D)

http-cache-header

캐시는 비단 컴퓨터 OS에만 국한된 기술이 아니다. 임시 저장소에 적재해놓고 빠르게 엑세스함으로써 처리 성능을 높인다는 개념 자체는 어디에든 적용이 가능하다. 이는 인터넷(Internet)에서도 적용된다.

웹브라우저는 서버와 HTTP 프로토콜을 통해 리소스를 서버에게 요청을 하여 가져오고 이를 사용자에게 리소스를 화면으로 보여주거나 제공한다. 이러한 통신 과정을 거치면서 클라이언트는 네트워크를 거치는 시간이 소비되며, 서버는 요청을 처리하는데 시간이 소비된다.

만약 클라이언트가 이전에 받은 데이터와 똑같은 데이터를 서버에 재요청을 할때 똑같은 통신 과정을 거치게 된다면 이 과정은 낭비라고 할 수 있다. 따라서 이러한 낭비를 줄이기 위한 해결책으로 캐시의 개념을 웹브라우저에 그대로 적용한, HTTP에서 제공하는 헤더(Headers)인 ~~Cache-Control~~ 이다.

![http-cache-header](https://blog.kakaocdn.net/dna/bPIQZT/btrTSLPttwL/AAAAAAAAAAAAAAAAAAAAAEjHlaPHCLfg4fA7gnk0ioO5t31PSAhfaGrI-W1_wyJ9/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=d9LB9Nx1z%2FGbnXTVmju%2FuSmiarA%3D)

http-cache-header

브라우저는 이 ~~Cache-Control~~ 헤더를 적절하게 사용함으로써, 상황에 따라 서버의 부하를 줄일수있으며 클라이언트는 네트워크 통신 기간이나 트래픽 량을 줄일 수 있게 되었다. 하지만 캐시(Cache)는 다루기 까다로운 녀석이다. 잘못 캐싱하게 되면 불일치한 리소스를 받게 되거나 서비스 의도와는 다른 동작을 할 수 있게 된다. 따라서 캐시를 다루는 기술을 웹개발자라면 반드시 숙지해야 할 기술일 것이다.

---

## HTTP 캐시 제어

### 캐시 제어 헤더 종류

#### Cache-Control 헤더

![Cache-Control](https://blog.kakaocdn.net/dna/cXu2BY/btrT0R14oeq/AAAAAAAAAAAAAAAAAAAAAE6k8iDlhp9GRcuzNCh71tIVC-dZKIXk8xISpg2AyOAW/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=xTBQSQ3qe74vBapcWyXS0%2FzlJI0%3D)

Cache-Control

![Cache-Control](https://blog.kakaocdn.net/dna/qKwRp/btrTSMAPZuD/AAAAAAAAAAAAAAAAAAAAAFQZMm7T-yxsFuzMXMIuQT1j9PLuZ9YnWpBQVONZ6JLa/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=6hl6ANtc7geNgcdlaRFqfbFQVKs%3D)

Cache-Control

- 캐시의 유효 시간(생명 주기)을 명시하는 응답(Resonse) 헤더
- 헤더 값 파라미터 종류  
	- ~~**max-age**~~: 캐시 유효 시간, 초 단위
		- ~~**no-cache**~~: 데이터는 캐시해도 되지만, **항상 Origin Server 에 검증** 후 사용
		- ~~**no-store**~~: 데이터에 민감한 정보가 포함되어 있어 **저장 불가** 혹은 최대한 **빨리 삭제**
		- ~~**public**~~: public 캐시(프록시 캐시 서버)에 저장 가능
		- ~~**private**~~: public 캐시에 저장 불가
		- ~~**s-maxage**~~: 프록시 캐시 서버에 적용되는 max-age
		- ~~**Age**~~: Origin Server 의 응답이 프록시 캐시 서버에 머문 시간(sec)
		- ~~**must-revalidate**~~: 캐시 만료후 최초 조회시 Origin Server 에 검증
- 콤마로 여러 파라미터를 열거 가능

| **Cache-Control 값 예시** | **설명** |
| --- | --- |
| ~~max-age=86400~~ | 응답은 최대 1일(60초 x 60분 x 24시간) 동안 브라우저 및 중간 캐시가 캐싱할 수 있다. |
| ~~private, max-age=600~~ | 응답은 최대 10분(60초 x 10분) 동안 (중간 캐시가 아닌) 브라우저가 캐싱할 수 있다. |
| ~~public, max-age=31536000~~ | 응답은 1년 동안 모든 캐시가 저장할 수 있다. |

#### Pragma 헤더

![Pragma](https://blog.kakaocdn.net/dna/mBAp4/btrT1HdYcuG/AAAAAAAAAAAAAAAAAAAAALQ_6hWaQhvi8l2AqA_e7JECyFtQKW03tjrMkW__tVZR/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=IwJUgWRalXnDAMfnHDzNxWkLTIM%3D)

- HTTP/1.0 하위 호환을 위해 사용하는 캐시 제어 헤더
- Cache-Control 과 동일한 역할을 수행하지만 권장되지 않는다.

#### Expires 헤더

![Expires](https://blog.kakaocdn.net/dna/bbA5yG/btrT0Ss7co2/AAAAAAAAAAAAAAAAAAAAAPeb_qmidAXWmezP1-SUk6vywwqPejcUKEevVsTDUCIb/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=39TW5bChJXNE6e4svaEIe7P6wLE%3D)

- 캐시의 만료일을 명시하는 헤더로, 정확한 날짜를 지정하여야 한다.  
	Cache-Control 헤더에도 max-age로 유효 시간을 명시하는 것이 더 추천되기 때문에, 현재는 사용이 권장 되지 않고 하위 호환을 위해 사용된다.
- 만일 max-age와 동시에 사용되면 Expires는 무시된다.

---

### 웹브라우저의 캐시 기본 동작

#### 캐시가 없을 경우 ❌

만일 캐시가 없을 경우 똑같은 이미지를 요청한다면, 서버에서는 동일한 이미지를 매번 1.1M 용량의 데이터로 응답해야 한다. 용량이 작은 리소스일 경우 큰 문제가 되지는 않겠지만 용량이 크면 클 수록 통신 비용이 커지게 되고 로딩속도가 느려지게 된다.

![http-cache-header](https://blog.kakaocdn.net/dna/bi8VUs/btrTQ01cvWi/AAAAAAAAAAAAAAAAAAAAAFOTWm_aO9V9Yz2MfTrRYEMKIFJnbqFhk7GiIAXGh2Fj/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=sf4akkKqCru5LLncmyHjvhHXd%2Fg%3D)

http-cache-header

1. 클라이언트에서 star.jpg 이미지를 요청한다.
2. 서버에서는 해당 이미지가 있으면 응답을 줘야하는데, 이미지의 HTTP 헤더+바디를 합쳐 대략 1.1M정도 용량의 데이터를 응답한다.
3. 클라이언트에서는 해당 이미지를 응답 받아 사용한다.
4. 클라이언트에서는 star.jpg 이미지를 다시 한 번 요청한다.
5. 서버에서는 동일한 이미지를 다시 1.1M정도 용량의 데이터를 응답해준다.
6. 클라이언트에서는 해당 이미지를 응답 받아 사용한다.
7. 동일한 이미지를 요청하는데 네트워크를 통해 같은 데이터를 또 다운받아야 한다.

#### 캐시를 이용한 요청 ⭕

그러면 웹브라우저에 캐시를 적용하면 얼마나 이점이 있는지 알아보자.

**1\. 클라이언트에서 star.jpg 이미지를 요청한다.**

**2\. 서버에서는 해당 이미지를 응답해준다. 이때 HTTP 메세지에 ~~cache-control~~ 헤더를 넣어주어 캐시가 유효한 시간을 설정한다. (그림에서는 60초로 설정해 60초 동안은 해당 캐시가 유효하다는 의미다)**

![http-cache-header](https://blog.kakaocdn.net/dna/cxki9T/btrTT60aFJR/AAAAAAAAAAAAAAAAAAAAALj-QozLIlgdxiP7qiBb8CRTHACNN1n84lRgZG1Qy6eJ/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=IvDkS%2BSKh5uqmQkUFP%2BCH1CFubM%3D)

http-cache-header

**3\. 서버로부터 응답을 받게되면, 클라이언트에서는 ~~cache-control~~ 헤더를 이해하고 웹브라우저 캐시에 응답 결과를 60초 동안 저장하게 된다.**

![http-cache-header](https://blog.kakaocdn.net/dna/EfVTB/btrTWM1fseF/AAAAAAAAAAAAAAAAAAAAAPXgGoW5MK6GsBpDUiJ5lJM6D7bnHo44AsmhO3wRp1Ai/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=5txOoKM0OafkpyhT0jwY3lLqlIM%3D)

http-cache-header

**4\. 클라이언트가 star.jpg 이미지를 재차 요청한다. 이때 서버에게 가는 것이 아닌 우선 캐시 저장소를 조회하게 된다.**

![http-cache-header](https://blog.kakaocdn.net/dna/bRnSS1/btrTWMfOcCx/AAAAAAAAAAAAAAAAAAAAANy3GRxT8e2ab5E9w8hbaf5cot8Ub-_HivA9uWb3H1Wt/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=%2FbcDyO%2FS%2BPoOE7miiCAl%2FEflkvg%3D)

http-cache-header

**5\. 만일 캐시 되어있고 60초 이내에 요청한 상태라면, 캐시에서 자료를 가져오게 된다.**

![http-cache-header](https://blog.kakaocdn.net/dna/ElUMX/btrT0TlbI50/AAAAAAAAAAAAAAAAAAAAANLLJnQPuJcdInFgsyEnglXeKP5J3yyWRENSydFwwaUD/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=Ch0UL%2FioML6fwsyQdD5nX1JpIBo%3D)

http-cache-header

그림으로 보듯이 **캐시** 를 사용하게 되면, 한 번 응답받았던 데이터는 브라우저의 캐시 저장소에 남아 일정 시간 내에 계속해서 참조할 수 있기 때문에, 서버로부터 불필요한 네트워크 다운로드를 효과적으로 줄일 수 있다. 사용자는 빠른 서비스 경험을 이용할수 있게 되면, 서버는 네트워크 사용량을 줄여 비용을 아낄수 있게 된다.

![http-cache-header](https://blog.kakaocdn.net/dna/cYbjr2/btrT0StiS7q/AAAAAAAAAAAAAAAAAAAAADEzH5CTNrI7UdcLJStfXERFfqT3tTrObxfK41WSk63l/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=0xY9DiIlKYKddoS9FsgX8DJdZCs%3D)

http-cache-header

![http-cache-header](https://blog.kakaocdn.net/dna/TKPi1/btrTR0NnKzq/AAAAAAAAAAAAAAAAAAAAAPbr0_iIVsQjfR__mdvirXofUAYvkuuZPL3cP32gj15B/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=FyrqbS1CpxJdEXh1QWqh7W7jdsU%3D)

http-cache-header

#### 캐시 유효 시간이 지날 경우 🚩

그런데 만일 60초 가 지나 캐시 유효 기간이 만료된 후에 클라이언트가 그 자료를 요청할 경우 어떻게 될까?

**6\. **클라이언트가 star.jpg 이미지를 재차 요청한다. 그런데 캐시**** **60초 유효시간이 초과되어 버려 더이상 가져올수 없게 되었다.**

![http-cache-header](https://blog.kakaocdn.net/dna/IIMVx/btrT0R1Y1TN/AAAAAAAAAAAAAAAAAAAAAGNUEMnHNtIMD6t_2Y0y69NzZKq_6kQ4Ex7p0BDBt66J/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=8FTY9RTEavdiM7oXU%2F1xl3Vwazk%3D)

http-cache-header

**7\. 그러면 클라이언트는 **다시 서버에게 처음과 같이 요청하게 된다. (다시 네트워크 다운로드가 발생)****

![http-cache-header](https://blog.kakaocdn.net/dna/dihYlu/btrTTqxIrdE/AAAAAAAAAAAAAAAAAAAAAB_Or2F-sYOOh3mWMKMZwpQidfILi1x6QIb1hQJkNC7c/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=eEoWtfUszQbq1Vk2WL4Vfjv5UB0%3D)

http-cache-header

****8.** 서버는 똑같이 ~~cache-control~~ 헤더를 응답하게 되고, 브라우저는 다시 자료를 캐시에 저장하게 된다.**

![http-cache-header](https://blog.kakaocdn.net/dna/cyl3db/btrTRFWvqWA/AAAAAAAAAAAAAAAAAAAAALy2W7wP5hfYtR9s2kw7yb5Hkrqp1llWm6RnTNoMLp9u/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=qCWiiiVbAZ%2F0fRAEUekwrry7p40%3D)

http-cache-header

이처럼 6번 상황을 보듯이 캐시 유효기간이 지날경우 처음과 같이 쌩 요청을 보내야한다.

그러면 캐시 유효 기간을 길게 늘리면 되지 않냐 싶은데 이는 좋지 않은 방법이다. 왜냐하면 오랜 기간 변경되지 않아도 되는 데이터가 있는 반면, 짧은 변경 주기를 가지는 데이터도 있기 때문이다. 즉, 만료기간이 긴 경우 캐시 데이터가 오래된 데이터일 가능성이 높아지게 된다.

따라서 비록 캐시 유효 시간이 지났더라도 오랜 기간 변경되지 않아도 되는 데이터일 경우 처음부터 요청을 하는 건 낭비를 초래하는 요청이 된다는 소리이다. 그래서 더욱 더 효율적인 캐시 전략을 위해 웹 브라우저에는 별도의 **캐시 검증 로직** 을 수행하게 된다.

> [!warning] Tip
> 사실 ‘캐시를 얼마나 오래 유지해야 하는가?‘의 문제는 답이 없다. 굳이 말하자면 데이터의 성격과 상황에 따라 알맞게 설정해야 한다.

---

## HTTP 캐시 검증 & 조건부 요청

### 캐시 검증 헤더 종류

서버가 클라이언트에게 응답(Response) 할때 HTTP 메세지 헤더에 넣는 캐시 관련 헤더 정보들이다.

#### Last-Modified 헤더

![Last-Modified](https://blog.kakaocdn.net/dna/cl5imo/btrTWMAbhHq/AAAAAAAAAAAAAAAAAAAAAAwsbqUFrG3yKqvEksEDYjXH2E0-gcEPUUr3xwa__nOM/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=o6Z7He4DxeVhBmaNI1Wj3W69MGg%3D)

Last-Modified

- 데이터의 최종 수정 시각을 명시한다. (윈도우 파일을 보면 최종 수정 시각 같은 개념이다)
- ~~If-Modified-Since~~ 요청(Request) 헤더와 함께 사용된다
- 클라이언트가 캐시 유효 기간이 초과된 데이터를 서버에 요청하는 경우, 이를 기준으로 데이터가 수정되었는지 검증한다. 예를들어 서버의 데이터 최종 수정 시각이 Last-Modified 보다 이후라면, 데이터가 수정된 것으로 간주하고, 서버의 데이터 최종 수정 시각이 Last-Modified 와 같다면 데이터가 수정되지 않은 것으로 간주한다.
- ex) last-modified: Tue, 15 Mar 2022 06:48:06 GMT...

#### ETag 헤더

![ETag](https://blog.kakaocdn.net/dna/Msom1/btrTTqq5onf/AAAAAAAAAAAAAAAAAAAAAPqieMCSn7wvETb6tOPdDZbq11dohjvmZ3W9CzPdYEpj/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=iwhsfoN0HBEiuTVGqiE6J4tsSfo%3D)

- 특정 버전의 리소스를 식별하는 고유 식별자 (데이터의 버전 이름 혹은 해시값)
- 서버는 파일이 변경될 때마다 새 ETag 값을 생성하고 이전 ETag 값을 유지한다.
- ~~If-None-Match~~ 요청(Request) 헤더와 함께 사용된다
- ~~Last-Modified~~ 헤더의 한계를 극복하기 위한 리소스 검증 헤더
- ex) ETag: "a2jiodwjekjl3", ETag: "v1.0"...

---

### 조건부 요청 헤더 종류

클라이언트가 서버에 요청(Request) 할때 HTTP 메세지 헤더에 넣는 캐시 관련 헤더 정보들이다.

#### If-Modified-Since 헤더

![If-Modified-Since](https://blog.kakaocdn.net/dna/Wv0ZC/btrT0SmmWR0/AAAAAAAAAAAAAAAAAAAAAOX2eghaYERtwb46QtgS6u6qSN28P7Dxyxf5A-TM4o_T/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=IgxEW0N%2B%2BpbHFFdi4l5KX9Fw90Y%3D)

If-Modified-Since

- 클라이언트의 요청(Request) 시 사용되며, 캐시 데이터의 ~~Last-Modified~~ 값이 들어간다.
- 서버의 데이터 최종 수정 시각과 캐시 데이터의 최종 수정 시각을 비교하여 데이터 수정 여부를 확인하기 위해 사용한다.
	- 캐시에 있는 리소스 수정 시각과 서버에 있는 리소스 수정 시작이 **같으면**, 304 Not Modified 응답 → 캐시 재사용
		- 캐시에 있는 리소스 수정 시각과 서버에 있는 리소스 수정 시작이 **다르면**, 200 OK 응답 → 새로 데이터 전송 (네트워크 다운로드)

#### If-None-Match 헤더

![If-None-Match](https://blog.kakaocdn.net/dna/tIIFD/btrTRpfqmF6/AAAAAAAAAAAAAAAAAAAAAN9kLWyQVXtOws54geKFrN8Ys4AAq-O6P2GjvIbmlL9f/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=ZrRdwm98fgDIvfblZeotkk86kUk%3D)

If-None-Match

- 클라이언트의 요청(Request) 시 사용되며, 캐시 데이터의 ~~ETag~~ 값이 들어간다.
- 서버의 데이터 ~~ETag~~ 와 캐시 데이터의 ~~ETag~~ 를 비교하여 데이터 수정 여부를 확인하기 위해 사용한다.
	- 캐시에 있는 ~~ETag~~ 와 서버에 있는 ~~ETag~~ 가 **같으면**, 304 Not Modified 응답 → 캐시 재사용
		- 캐시에 있는 ~~ETag~~ 와 서버에 있는 ~~ETag~~ 가 **다르면**, 200 OK 응답 → 새로 데이터 전송 (네트워크 다운로드)

#### If-Unmodified-Since / If-Match 헤더

![If-Unmodified-Since](https://blog.kakaocdn.net/dna/rWC02/btrTT7ZbBaY/AAAAAAAAAAAAAAAAAAAAAHU2yOvbFJl2SvpFPWcdRN3_9kCNDlLFUkEhIYoAAoyB/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=pm5RLZdEbS73SyV6OUESuyPUp%2F4%3D)

If-Unmodified-Since

![If-Match](https://blog.kakaocdn.net/dna/l0MtO/btrTTpTgshm/AAAAAAAAAAAAAAAAAAAAADXU_nSnxjiWXmQ0hyU8YgBB-a3oSjbEmXy8bXB_eHG7/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=RU0Kxj23X%2Bxkm883znvQC6FFfqg%3D)

- 각각 ~~~~If-None-Match~~~~ 와 ~~If-Modified-Since~~ 반대 역할 수행을 한다도 보면 된다.
- 이 헤더들은 412 Precondition failed 상태 코드를 반환하는데 사용된다.

---

### 웹브라우저의 조건부 요청 & 검증 동작

캐시 만료후에도 서버에서 해당 리소스를 수정하거나 업데이트하지 않은 경우라면, 서버에서 동일한 데이터를 요청해서 응답받는 것은 여러모로 비용낭비가 되게 된다. 이럴때는 발상의 전환으로 적재해 둔 캐시를 재사용 할 수 있으면 좋은데, 이러한 전략을 이용하기 위해선 어떻게 클라이언트의 데이터와 서버의 데이터가 동일하다는 것을 알 수있는지에 대해 알아야 한다. 그래서 HTTP에서는 추가적인 검증 헤더를 이용하여 처리한다.

#### 문서 수정 시간 방식 (Last-Modified & if-modified-since)

가장 심플한 방법은 리소스 수정 시각을 이용해서 리소스 변경 사항을 확인하는 것이다.

예를들어 캐시에 저장된 리소스의 수정 시각과 서버에 저장된 리소스의 수정 시각이 같으면 변경 사항이 없기 때문에 캐시에 있는 것을 재활용하면 되고, 수정 시각이 다르면 최신 리소스를 갱신해야 하기 때문에 새로 서버에서 보내주는 것이다.

![Last-Modified](https://blog.kakaocdn.net/dna/LVHl5/btrTR8qMdyd/AAAAAAAAAAAAAAAAAAAAAKost2sJmS6y74gxDkLeb6KcHWHBLpUCuQY-eBSJHkmv/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=9QQkUhpqdR1286U4dwQRYUV7lxA%3D)

Last-Modified

**1\. 클라이언트에서 star.jpg 이미지를 요청한다.**

**2\. 서버는 ~~cache-control~~ 헤더를 이용하여 캐시 유효 기간을 60초로 설정하고 추가적으로 ~~Last-Modified~~ 헤더를 통해 리소스의 마지막으로 수정된 시간 정보를 넣어 응답해온다.**

![if-modified-since](https://blog.kakaocdn.net/dna/dQ921C/btrTR9QDG7K/AAAAAAAAAAAAAAAAAAAAAPFWfC7dC_DvAxtQaAsRS6XgzviMUW5EtOtJwEKUzZX3/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=%2FAcHqPNNh03bNgL43MIfHoNKr28%3D)

if-modified-since

**3\. 클라이언트는 응답 결과를 캐시에 저장할 때 데이터 최종 수정일도 저장한다.**

![if-modified-since](https://blog.kakaocdn.net/dna/p7Nyo/btrTZzNYEsh/AAAAAAAAAAAAAAAAAAAAALHFMWzWP6GDV3rn5yOIosRm9B8RchW6bfb4QOQuybXh/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=INapWbmnAIn4dYi8lGD9wAiIADs%3D)

if-modified-since

**4\. 100초가 지난후 캐시 유효 시간 ****초과된 상태에서,**** 클라이언트에서 star.jpg 이미지를 재차 요청한다.**

![if-modified-since](https://blog.kakaocdn.net/dna/cnScC8/btrTRZ1O38R/AAAAAAAAAAAAAAAAAAAAABZH5a9nmtOystmer4hQ_S2yJexAIH0l-GcP-nJatOxV/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=nAs1qg9Nxm2BQ4LgLI2KV0xOCNM%3D)

if-modified-since

**5\. 이때 캐시에 최종 수정일 정보(Last-Modified)가 있다면, 클라이언트는 요청 메세지에 ~~if-modified-since~~ 헤더에 해당 날짜를 담아서 서버에 보낸다.**

![if-modified-since](https://blog.kakaocdn.net/dna/wd1KF/btrTT6lA5OM/AAAAAAAAAAAAAAAAAAAAAIV76hoGDnp20uIBbROHN2wLjdPftub4invPhC-Mx_Ws/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=j3FMjOsc%2BBP%2FSECIeDbpikRN7qM%3D)

if-modified-since

**6\. 서버에서 만일 클라이언트가 요청한 헤더의 자료 최종 수정일과 서버에 있는 자료의 수정일을 비교해서 데이터가 수정이 안되었을 경우, [304 Not ModifiedVisit Website](https://inpa.tistory.com/entry/HTTP-%F0%9F%8C%90-3XX-Redirection-%EC%83%81%ED%83%9C-%EC%BD%94%EB%93%9C-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0) 상태 코드로 응답하게 된다. (이때 리소스는 담지 않는다. 그래서 전송 데이터가 없기 때문에 0.1M 만 전송된다)**

![if-modified-since](https://blog.kakaocdn.net/dna/cpM0pV/btrTToNucIo/AAAAAAAAAAAAAAAAAAAAAInErPCvX1VBBysuN2WmMHzhISa-We7IKDdvCakgt1jc/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=N7gNTYtVBYxmlBOdXu1NnRI3QdU%3D)

if-modified-since

**7\. 304 응답을 받은 클라이언트는 리소스 수정이 없어 최신 상태임을 인지하게 되고, 안전하게 캐시에서 다시 리소스를 가져오고 다시 캐시 유효 기간을 갱신해준다.**

![Last-Modified](https://blog.kakaocdn.net/dna/W9FQv/btrTRoAPRNh/AAAAAAAAAAAAAAAAAAAAAMPqxDOOmw-2okC1r7T8dcMi7Fae9TDgNowUb-2XIDBC/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=VVEZ7LGrqJFGOw0JpyVdNuvQ5rE%3D)

Last-Modified

정리하자면, 본래라면 1.1M 응답 데이터를 받아오게 되어있지만, 조건부 요청을 통해 비록 캐시 유효 기간이 지났더라도 리소스가 변경이 없다면 캐시에서 재활용해도 된다는 취지로, 서버는 그냥 헤더 메세지만 응답하게 되니 1메가바이트를 절약하게 된 것이다. 결과적으로 네트워크 다운로드가 발생되지만 0.1M만 받게 되니 사용자는 빠르게 서비스를 이용할수 있게 된다.

실제 개발자 도구에서 네트워크 응답을 보면 더 확연히 이해가 될것이다.

Cache-Control 헤더의 max-age 값을 5초로 지정하고 계속 동일한 요청을 할경우, 초가 지나면 캐시 유효 기간이 만료되어 다시 서버에 요청을 하게 되지만 원본 용량(994KB) 보다 훨씬 더 적은 192B를 받는걸 볼 수 있다. 즉, 이미지는 받지않고 HTTP 메세지만 받고 캐시 저장소에서 다시 가져오는 동작을 5초마다 행하고 있는 것이다.

![Last-Modified](https://blog.kakaocdn.net/dna/YuTU1/btrT4qYLEYf/AAAAAAAAAAAAAAAAAAAAADOzxA_-dmktbPezfvOhA8YRTMXDa_VX-GwrMkVXqFXN/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=1zsKyJFQaqXvEHkO1RUB1LSF3Rc%3D)

Last-Modified

#### Last-Modified & if-modified-since 방식의 한계점

하지만 단순히 리소스의 수정 시각으로 캐시 이용 전략을 세우는데는 다음과 같은 한계가 존재한다.

1. 1초 미만(0.x초)단위로 캐시 조정이 불가능하다.
2. 날짜 기반의 로직을 사용하여 한계가 있다. 예를 들어 test.txt 파일의 내용을 A → B로 수정했지만, 다시 B → A로 롤백한 경우 내용은 캐시에 있는 것과 같지만 날짜 변경이 되서 다시 받아야 한다.
3. 서버에서 별도의 캐시 로직을 관리하고 싶은 경우 한계가 있다 (스페이스나 주석처럼 크게 영향이 없는 변경에서 캐시를 유지하고 싶은 경우)

---

#### Etag 비교 방식 (Etag & If-None-Match)

따라서 서버에서 완전히 캐시를 컨트롤 하고 싶다면 ~~ETag~~ 를 사용하여 임의의 해시값을 활용해 컨텐츠를 좀더 면밀하게 관리가 가능하다. 만일 데이터가 변경되면 ~~ETag~~ 가 변경되기 때문에, 단순히 ~~ETag~~ 가 같으면 데이터가 수정되지 않은 것이고, ~~ETag~~ 가 다르면 데이터가 수정된 것으로 간주하게 된다.

![Etag](https://blog.kakaocdn.net/dna/Lg1GV/btrTReSJy6I/AAAAAAAAAAAAAAAAAAAAAOJImyR8vFg2Gm94Enh858wzEbxL3quO8YQOoDcqExeO/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=FHJVeDMoJwVD5aJApoqqFFgvWgo%3D)

**1\. 클라이언트에서 star.jpg 이미지를 요청한다.**

**2\. 서버에서 헤더에 ETag 를 작성해서 이미지와 함께 응답해준다.**

![Etag](https://blog.kakaocdn.net/dna/nBHh7/btrTWNeTekn/AAAAAAAAAAAAAAAAAAAAACKuTPpvmNjXLAdMoBy3TUka9F7Mi3FnX_1Y3d6XJTHn/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=cN0%2Bei%2FACp7whPeuEav5LpWO0gk%3D)

**3\. 클라이언트는 ETag 값을 캐시에 저장한다.**

![Etag](https://blog.kakaocdn.net/dna/cG1cFg/btrTToz2KlU/AAAAAAAAAAAAAAAAAAAAAOABq8bsnkp_U_nSNGq-740pbgkfk1F0_XGG4tVdGtRL/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=G5FwViCNccmCDm5XCQ2HTkWNy1g%3D)

**4\. **100초가 지난후 캐시 유효 시간 초과된 상태에서, 클라이언트에서 star.jpg 이미지를 재차 요청한다.****

![etag-cache-miss](https://blog.kakaocdn.net/dna/c65T7Y/btrTYDwfQUQ/AAAAAAAAAAAAAAAAAAAAAM_Db8C7M1BaWmQzXeGhcmfuoRQfy9CIn0php3GVTxEV/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=FxpD%2Bh88znHghe%2BofdRsGTltoi8%3D)

etag-cache-miss

**5\. 이때 캐시에 Etag 값이 들어있다면, 클라이언트는 요청 메세지에 ~~if-None-Match~~ 헤더에 해당값을 담아서 서버에 보낸다.**

![Etag-cache](https://blog.kakaocdn.net/dna/m1oJx/btrTRo1UzyP/AAAAAAAAAAAAAAAAAAAAALsQQaWGUdmUMO0hjGMbBen4-O6Pdizxesf9lR7FsHyD/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=KduhFLHrQjHvVkpyKNkm%2BlqeufM%3D)

Etag-cache

**6\. 서버에서 데이터가 변경되지 않았을 경우 ETag는 동일하다. 그래서 If-None-Match 로직은 실패가 되어 304 Not Modified를 응답한다. (이때 역시 리소스는 담겨있지 않는다 → 0.1M 전송)**

![Etag-cache](https://blog.kakaocdn.net/dna/sA1ct/btrTZAlUQjm/AAAAAAAAAAAAAAAAAAAAAKbiCMr8BwlUIb7vc4u_w47whl9QxOof0VUj6M7eIAhf/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=0gNP0Wz42AsA0Yfb7HDYanqmQTA%3D)

Etag-cache

**7\. **304 응답을 받은 클라이언트는 리소스 수정이 없어 최신 상태임을 인지하게 되고, 안전하게 캐시에서 다시 리소스를 가져오고 다시 캐시 유효 기간을 갱신해준다.****

![Etag-cache](https://blog.kakaocdn.net/dna/cK0Yf5/btrTT75X8Cg/AAAAAAAAAAAAAAAAAAAAAOpc1SXCx0foBp85j_3qm1eG7rAl57iIBXR7VCvBqTDw/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=wY%2FYSuibCqQ3RJHClrjgGttS3yI%3D)

Etag-cache

정리하자면, ETag만 서버에 보내 동일하면 유지하고 다르면 다시 받는다. 즉, 캐시 제어 로직을 파일 수정 시각 비교가 아닌 서버에서 관리하는 것이다. 예를들어 서버는 베타 오픈 기간 3일간 파일이 변경되어도 ETag를 동일하게 유지 애플리케이션 배포 주기에 맞춰서 ETag를 모두 갱신하는 식으로 자체 관리함으로써, 그래서 클라이언트는 단순하게 이 값을 서버에 제공만 하면 되고, 별도로 캐시 매커니즘을 알 필요가 없게 된다.

---

## 프록시(Proxy) 캐시

프록시는 클라이언트와 본서버를 중계하는 중간에 위치한 서버 대리자로서, 클라이언트의 요청을 대신 받고 본서버에 전해주는 역할을 한다. 이 프록시를 **캐시 서버** 로서 이용할수 있는데, 예를들어 한국에 있는 클라이언트에서 이미지가 필요한상황인데, 해당 이미지의 원서버가 미국에 있다고 가정해보자. 한국 서버에서 미국 서버까지 직접 접근하여 이미지를 가져오는데 0.5초가량 걸린다고하면, 한국에 위치한 컴퓨터들은 모두 0.5초 가량을 기다려야 해당 이미지를 받을 수 있게 된다.

![Proxy-cache](https://blog.kakaocdn.net/dna/bTjRcX/btrTR8dcH93/AAAAAAAAAAAAAAAAAAAAAERKOSR8bPaUutZUoqDNfZZdNHVXQg5K8BMKhWu9rEmh/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=qkEctj8fiCQU474UWrG8s9zV9b8%3D)

Proxy-cache

그래서 이를 해결하기 위해 프록시 캐시를 도입하여 사용한다고 보면 된다.

한국에 프록시 캐시 서버를 따로 두고, 최초의 요청에만 미국 서버까지 가서 이미지 리소스를 받아오고 프록시 캐시 서버에 저장한다. 그러면 한국의 클라이언트는 리소스를 가져올때 프록시 캐시 서버로 부터 자료를 가져오면 된다. 특히 여러 사람들이 찾는 자료일수록 이미 캐시에 등록되어있기에 효과적으로 빠른 속도로 자료를 가져올 수 있다. 우리가 유튜브에서 고용량의 영상도 빨리 볼 수 있는 이유도 이에 해당한다.

![Proxy-cache](https://blog.kakaocdn.net/dna/cYw3ow/btrTYCYrkOF/AAAAAAAAAAAAAAAAAAAAAHfiFolJc_zmYHCOG8r7ZkP0qNXT5nRMXaUFgWYjiL26/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=%2F2JmlKfgCa4iTRpcsChLom7rL3M%3D)

Proxy-cache

즉, 같은 국내에 있기에 원서버에 접근하는것보다 훨씬 빠른 속도에 자료를 가져올 수 있다는 것이다.

참고로 클라이언트에서 사용되고 저장되는 캐시를 **private 캐시** 라 하고 프록시 캐시 서버의 캐시를 **public 캐시** 라 한다.

웹브라우저 캐시와 프록시 서버 캐시가 분리되어 운용되는 만큼, 위에서 배운 ~~Cache-Control~~ HTTP 헤더도 **프록시 전용 캐시 설정** 을 해야 한다.

![Proxy-cache](https://blog.kakaocdn.net/dna/dU1nU2/btrTRDdDKbI/AAAAAAAAAAAAAAAAAAAAAEgCFZvdSQ9XIrb4FlV5vDzy8PaCFqzz-fSCVrttzMiy/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=QPFRjFB7PiWIDwnZCgD%2BwbuVDIA%3D)

Proxy-cache

---

### 프록시 캐시 헤더

![프록시 캐시 헤더](https://blog.kakaocdn.net/dna/dRl4EX/btrTRpmo1k9/AAAAAAAAAAAAAAAAAAAAABD9lEeRSFTKLfgo7DZeG2xkm6ZqF60Fw5c6fdowDQju/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=jOVTKz1fDJU5dvKqVLGFRlAvWoE%3D)

CDN에서는 1년동안 캐시되지만 브라우저에서는 매번 재검증 요청을 보내도록 설정

- ~~Cache-Control: private~~ → 응답이 해당 사용자만을 위한 것으로 private 캐시에 저장해야 한다 (default)
- ~~Cache-Control: public~~ → 응답이 public 캐시에 저장되어도 된다.
- ~~Cache-Control: s-maxage~~ → 프록시 캐시에만 적용되는 max-age
- ~~Age: 60~~ (HTTP 헤더) → 오리진 서버에서 응답 프록시 캐시 내에 머문 시간(초)

---

## HTTP 캐시 무효화

**캐시 무효화(Cache Busting)** 는 말그대로 웹브라우저의 캐시를 완전 제거해버리는 것을 말한다.

이러한 기술이 필요한 이유는, 웹 브라우저들이 GET 요청을 받을 경우 별도의 캐시 헤더 없이도 자기 마음대로 최적화한답시고 임의로 캐싱을 해버리기 때문이다. 또한 무턱대고 리소스의 캐시 유효 기간을 길게 설정하여서 리소스의 업데이트가 필요할 경우 캐시 저장소의 복사본을 갱신해주어야 하는데, 기본적으로 브라우저는 캐시 유효 기간이 끝나야 캐시 유효성 검증을 서버에게 요청하기 때문에 어찌할 방도가 없다. 이러한 문제를 해결하기 위하여 캐시 무효화 전략을 사용한다고 보면 된다.

![Cache-Control 흐름도](https://blog.kakaocdn.net/dna/OCIc3/btrTSwSOeqR/AAAAAAAAAAAAAAAAAAAAAE1vbaKasd5UoM0VrgzsB9IcSYyv4e9JY8UmHw9LC18E/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=YO%2Fec8wAWZ9jZEVjYC8ODYe2Rl0%3D)

Cache-Control 흐름도

---

### 캐시 무효화 헤더

만약 캐시를 사용해선 안되는 페이지가 존재한다면, 다음과 같이 ~~Cache-Control~~ 헤더에 파라미터들을 Setup 하여야 한다.

![캐시 무효화](https://blog.kakaocdn.net/dna/cuaOIb/btrT3qb9GYH/AAAAAAAAAAAAAAAAAAAAAEyxpT72UoIV3i5Ung6I-oS_Cur76srgVkhIn6_Ng7Lk/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=9K%2FjdmmZL2EId3WIb2GL0MVOWwo%3D)

- ~~Cache-Control: no-cache~~
	- 데이터는 캐시해도 되지만 항상 원 서버에 검증하고 사용해야 한다. (~~max-age=0~~ 과 동일한 뜻)
		- 즉, 서버로부터 304 응답을 받아야 캐시에서 가져온다는 말이다. 비록 네트워크 트래픽이 발생하지만 헤더 메세지만 응답 받기 때문에 네트워크 다운로드량은 적다.
		- no cache 라는 이름때문에 캐시를 사용안한다고 생각할 수 있는데, 이 단어의 의미는 본래 캐시 유효 기간이 남아있으면 무조건 캐시 저장소를 조회하지만 그리하지말고 무조건 서버에 검증 받으라는 말이다.
- ~~Cache-Control: no-store~~
	- 데이터에 민감한 정보가 있기에 저장하면 안된다는 의미
		- 메모리에서 사용하고 최대한 빨리 삭제한다.
- ~~Cache-Control: must-revalidate~~
	- 캐시 만료후 최초 조회시 원 서버에 검증해야 할때 설정
		- 원 서버에 접근 실패시 반드시 504(Gateway Timeout) 오류가 발생해야 하도록 한다.
		- 만일 캐시 유효 시간 내에 있다면 캐시를 사용한다.
- ~~Pragma: no-cache~~
	- HTTP 1.0 하위 호환용

> [!warning] Tip
> 간혹 몇몇 웹페이지에서는 캐시 무효화 우회 로직으로 Cache-Control 헤더에 max-age=0 으로 설정해놓는다. 캐시 유효 시간을 0으로 설정해 놓으면, 매번 리소스를 요청할 때마다 서버에 재검증 요청을 보내게 된다.  
> 하지만 몇몇 일부 모바일 브라우저의 경우 네트워크 요청을 아끼고 사용자에게 빠른 웹 경험을 제공하기 위해 웹 브라우저를 껐다 켜기 전까지 리소스가 만료되지 않도록 하는 경우가 존재한다. 따라서 max-age=0 보다는 좀더 명확한 no-store 파라미터 사용을 권하는 바다.

---

### no-cache vs must-revalidate 비교

캐시 무효화 헤더를 설정할때 보통 no-cache 와 must-revalidate 를 같이 설정하는 편이다.

must-revalidate 가 사용되는 이유는 no-cache 에 의해 원 서버(Origin Server) 에 검증 요청을 보내는 도중 원 서버 와 프록시 캐시 서버(Proxy Cache Server) 의 연결이 끊어져 검증이 불가능할 경우, 504 Gateway Timeout 오류를 발생시키기 위해서이다. 왜냐하면 몇몇 프록시 캐시 서버에서는 원 서버에 접근이 불가능해질 경우에 **검증을 거치지 않고 이전의 캐시 데이터를 반환하기 때문** 이다.

예를들어 통장 잔고와 같은 중요 데이터의 경우, Origin Server 와의 연결이 불가능하다고 해서 변경 전의 데이터를 반환하면 큰일나므로, must-revalidate 를 활용해 일부로 5XX 오류를 발생시키는 전략을 세운다고 보면 된다.

#### no-cache 기본 동작

![no-cache](https://blog.kakaocdn.net/dna/YoXOi/btrTZzHuxjw/AAAAAAAAAAAAAAAAAAAAADuSKEaLB-lKQySua_KA2u1K_1l4l1Qt5gRKX0TJ_nsS/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=YLQzr%2FmyLSFDtk6kRhk%2B%2Bk4c5cA%3D)

1. 클라이언트는 E-Tag와 no-cache 설정을 하고 서버에게 요청한다.
2. 중간에 프록시 캐시 서버가 받게 되고, no-cache 설정이 되어있기 때문에 다시 원 서버에 요청한다
3. 원 서버에서 E-Tag로 검증하고
4. 프록시에게 304 응답을 준다
5. 프록시는 다시 클라이언트에게 그대로 응답한다.
6. 클라이언트는 캐시를 재사용한다.

#### 원 서버에 문제가 생길 경우 no-cache 동작

![no-cache](https://blog.kakaocdn.net/dna/QMAmj/btrTRZ1ZOKx/AAAAAAAAAAAAAAAAAAAAABLjtw5zwfMsUkUAybV5mjgb_SU4tVx37m9bPwLSYMCy/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=Vg7P%2BNMYlosTO8pyHo9Zh2baijI%3D)

1. 클라이언트는 E-Tag와 no-cache 설정을 하고 서버에게 요청한다.
2. 중간에 프록시 캐시 서버에서 다시 원 서버에 요청하는데, 어떠한 이유로 네트워크가 단절되어 접근이 안된다.
3. 그러면 no-cache에서는 응답으로 오류가 아닌 오래된 데이터라도 보여주자라는 개념으로 200 OK으로 응답을 한다.
4. 원 서버의 처리 상태도 모른채 클라이언트는 오래된 데이터를 소비자에게 보여주게 되고, 서비스에 차질이 생기게 된다.

#### must-revalidate 동작

따라서 위와 같은 문제점 때문에 must-revalidate 를 명시하여 Proxy Cache Server 가 자체적으로 캐시 데이터를 반환하는 케이스를 사전에 차단하여야 한다.

![must-revalidate](https://blog.kakaocdn.net/dna/cq35Vs/btrTVTzGv4y/AAAAAAAAAAAAAAAAAAAAAAdPdcXbSsD05GvgT2rkQJ2yPfQrJK1aDY933Wt02_it/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=VlAya23A6oACeZnfTGywlTm%2BG44%3D)

must-revalidate

1. 클라이언트는 E-Tag와 must-revalidate 설정을 하고 서버에게 요청한다.
2. 중간에 프록시 캐시 서버에서 다시 원 서버에 요청하는데, 어떠한 이유로 네트워크가 단절되어 접근이 안된다.
3. 그러면 must-revalidate에서는 일단 무조건 504 Gateway Timeout 오류를 응답한다.
4. 클라이언트는 원 서버에 문제가 있음을 감지하고 별도의 재수정 로직을 거치게 한다.

> [!warning] Tip
> 다만, must-revalidate는 캐시 유효성 기간이 남아있으면 우선적으로 캐시 저장소를 조회하게 되어있다. 따라서 원 서버 네트워크 문제 해결과 항상 원 서버에 캐시 검증을 함께 사용하고 싶은 경우 no-cache와 함께 설정해주면 된다.
> 
> ![no-cache-must-revalidate](https://blog.kakaocdn.net/dna/cdaPDP/btrTRHHb0VT/AAAAAAAAAAAAAAAAAAAAAF6wnFjpko4pwej9vxaPcPuojpOh_EsjI4CkMv0xpmYb/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1785509999&allow_ip=&allow_referer=&signature=e8myE82%2FvIt9Q3N6GCQAmPbd2KE%3D)
> 
> no-cache-must-revalidate

---

[저작자표시 비영리 변경금지 (새창열림)](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.ko)

인용한 부분에 있어 만일 누락된 출처가 있다면 반드시 알려주시면 감사하겠습니다

이 글이 좋으셨다면 **구독 & 좋아요**

여러분의 구독과 좋아요는  
저자에게 큰 힘이 됩니다.

![subscribe](https://tistory1.daumcdn.net/tistory/4939852/skin/images/sub.png)

이전 포스트

[🌐 HTTP 콘텐츠 협상(Content Negotiation) 이해하기](https://inpa.tistory.com/entry/HTTP-%F0%9F%8C%90-%EC%BD%98%ED%85%90%EC%B8%A0-%ED%98%91%EC%83%81Content-Negotiation-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0)

---

![comment](https://tistory1.daumcdn.net/tistory/4939852/skin/images/comment.webp)

[Inpa Dev 👨💻](https://inpa.tistory.com/) [**IT 분야 크리에이터**](https://notice.tistory.com/2648) [성장 욕구가 가파른 초보 개발자로서 공부한 내용을 쉽게 풀어쓴 기술 개발자 블로그를 운영하고 있습니다.](https://inpa.tistory.com/)

---

## 💭 내 메모
<!-- 클리핑 후 직접 작성 — 왜 저장했나 · 핵심 takeaway · 궁금한 점. 인제스트 시 이 메모를 우선 반영한다. -->
