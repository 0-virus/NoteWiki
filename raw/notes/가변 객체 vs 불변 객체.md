## 1. 핵심 개념 이해 🎯

### 1.1 참조형 vs 가변/불변

**참조형의 본질**

- 값을 직접 저장하지 않고 **주소로 접근**
- 변수 → 주소 → 실제 객체

**가변/불변**

- 객체 내부 상태 변경 가능 여부를 나타냄
- 참조형과는 **독립적인 개념** ✅

```
참조형의 본질: 어떻게 접근하느냐
┌─────────────────────────────────────┐
│  변수 → 주소 → 실제 객체            │
└─────────────────────────────────────┘

가변/불변: 객체 내용을 바꿀 수 있느냐
┌─────────────────────────────────────┐
│  가변: 객체 내부 상태 변경 가능      │
│  불변: 객체 내부 상태 변경 불가      │
└─────────────────────────────────────┘
```

### 1.2 불변 객체란?

**정의**

- 객체 생성 후 내부 상태 변경 불가 🔒
- 값을 바꾸려면: **새 객체 생성 + 참조 교체**

**대표 예시**

- `String`, `Integer`, `LocalDate`, `BigDecimal`

**값 변경 시 동작**

```java
String s = "hello";  // s → ["hello"] 0x001
s = "world";         // s → ["world"] 0x002 (새 객체, 기존 객체는 그대로)
```

### 1.3 가변 객체란?

**정의**

- 객체 내부 상태를 직접 수정 가능 🔧
- 같은 주소에서 내용만 변경

**대표 예시**

- `StringBuilder`, `ArrayList`, `HashMap`, 사용자 정의 클래스

**값 변경 시 동작**

```java
StringBuilder sb = new StringBuilder("hello");  // sb → ["hello"] 0x001
sb.append(" world");                           // sb → ["hello world"] 0x001 (같은 주소)
```

---

## 2. String Pool의 동작 원리 🏊‍♂️

### 2.1 String Pool이란?

**위치**: Heap 메모리의 String Pool 영역
**목적**: 같은 문자열 리터럴을 하나의 객체로 공유하여 메모리 절약

```
[ Heap 메모리 구조 ]
┌──────────────────────────────┐
│  일반 객체 영역               │
├──────────────────────────────┤
│  String Pool 영역            │
│  ┌─────────────┐             │
│  │ "hello"     │ ←─ 여러 변수가 │
│  │ "world"     │    공유      │
│  │ "java"      │             │
│  └─────────────┘             │
└──────────────────────────────┘
```

### 2.2 String Pool 탐색

**구조**: Hash Table 사용 💡
**시간 복잡도**: O(1) - 매우 빠름
**특징**: Pool 크기와 무관하게 일정한 탐색 속도

```
"hello" 입력
    ↓
hash("hello") → 3번 버킷
    ↓
3번 버킷 확인 → 있으면 기존 객체 반환
              → 없으면 새로 생성 후 추가
```

### 2.3 언제 Pool을 사용하나?

| 방법            | Pool 사용 여부 | 예시                                       |
| --------------- | -------------- | ------------------------------------------ |
| 문자열 리터럴   | ✅ 사용        | `String a = "hello";`                      |
| new 키워드      | ❌ 우회        | `String a = new String("hello");`          |
| intern() 메서드 | ✅ 강제 추가   | `String a = new String("hello").intern();` |

**코드 예시: Pool 공유**

```java
String a = "hello";
String b = "hello";
String c = "hello";

System.out.println(a == b);  // true (같은 주소)
System.out.println(b == c);  // true (같은 주소)
```

**메모리 상태**

```
[ Stack ]         [ Heap - String Pool ]
a ──────────────→ [ "hello" ] 0x001
b ──────────────↗
c ──────────────↗
```

**코드 예시: 새 객체 생성**

```java
String s1 = "hello";
s1 = "world";
```

**메모리 변화**

```
Before: s1 → [ "hello" ] 0x001

After:  s1 → [ "world" ] 0x002
             [ "hello" ] 0x001 (여전히 존재, GC 대상)
```

---

## 3. 불변 객체의 메모리 특성 (양면성) ⚖️

### 3.1 메모리 절약 시나리오 ✅

**상황**: 같은 값을 여러 변수가 사용할 때

```java
String name1 = "김철수";
String name2 = "김철수";
String name3 = "김철수";
// 세 변수 모두 Pool의 같은 객체 공유 → 메모리 효율적
```

**메모리 상태**

```
[ 가변 객체라면 ]
name1 → [ "김철수" ] 0x001
name2 → [ "김철수" ] 0x002  ← 각각 별도 객체
name3 → [ "김철수" ] 0x003

[ 불변 객체(String) ]
name1 ──┐
name2 ──├→ [ "김철수" ] 0x001  ← 하나의 객체 공유
name3 ──┘
```

### 3.2 메모리 낭비 시나리오 ❌

**상황**: 수정이 많을 때 중간 객체 대량 생성

```java
String result = "";
for (int i = 0; i < 5; i++) {
    result = result + i;  // 매번 새 String 객체 생성
}
```

**메모리 상태 (단계별)**

```
[ Heap 메모리 - 각 단계별 객체 생성 ]

1단계: result = "" + 0
[ ""     ] ← 곧 버려질 객체
[ "0"    ] ← result가 가리킴

2단계: result = "0" + 1
[ ""     ] ← GC 대상
[ "0"    ] ← 곧 버려질 객체
[ "01"   ] ← result가 가리킴

3단계: result = "01" + 2
[ ""     ] ← GC 대상
[ "0"    ] ← GC 대상
[ "01"   ] ← 곧 버려질 객체
[ "012"  ] ← result가 가리킴

... (계속)

최종: 중간 객체들이 모두 쓰레기가 됨 → GC 부담 ⚠️
```

### 3.3 실제 성능 문제

| 구분                  | 비용         | 설명                   |
| --------------------- | ------------ | ---------------------- |
| **Pool 탐색**         | 거의 없음 💚 | O(1) 해시 탐색         |
| **수정 시 객체 생성** | 높음 🔴      | 매번 새 객체 + GC 부담 |

**결론**: Pool 탐색은 걱정 없고, 진짜 문제는 **반복적인 수정**

---

## 4. 가변 vs 불변 객체 비교 📊

### 4.1 전체 비교표

| 구분                   | 가변 객체                    | 불변 객체                   |
| ---------------------- | ---------------------------- | --------------------------- |
| **예시**               | `StringBuilder`, `ArrayList` | `String`, `Integer`         |
| **값 변경 방식**       | 같은 주소에서 내부 수정      | 새 객체 생성 + 참조 교체    |
| **메모리 (읽기 중심)** | 각자 별도 저장 ❌            | Pool 공유로 절약 ✅         |
| **메모리 (수정 중심)** | 하나의 객체만 수정 ✅        | 중간 객체 대량 생성 ❌      |
| **스레드 안전성**      | 동기화 필요 ❌               | 자동으로 안전 ✅            |
| **사용 시기**          | 수정이 빈번할 때             | 값 공유 및 안전성 중요할 때 |

### 4.2 코드로 비교하기

### ❌ 불변 객체 (String) - 수정이 많을 때 비효율

```java
// Bad: 10,000번의 새 객체 생성
String result = "";
for (int i = 0; i < 10000; i++) {
    result = result + i;  // 매번 새 String 생성 → 메모리 폭발
}
// GC가 9,999개의 중간 객체를 치워야 함 ⚠️
```

### ✅ 가변 객체 (StringBuilder) - 수정이 많을 때 효율적

```java
// Good: 하나의 객체를 계속 수정
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);  // 같은 객체 내부만 수정 → 메모리 효율적
}
String result = sb.toString();  // 최종 결과만 String으로 변환
```

### 가변 객체 예시 (사용자 정의 클래스)

```java
class Ball {
    private double radius = 10.0;
    void shrinkRadius() { this.radius /= 2; }
    double getRadius() { return radius; }
}

Ball b = new Ball();       // b → [ radius: 10.0 ] 0x001
b.shrinkRadius();          // b → [ radius: 5.0  ] 0x001 (같은 주소, 내용만 변경)
```

---

## 5. 사용 패턴별 효율 비교 🎪

| 사용 패턴             | 불변 (String)         | 가변 (StringBuilder) | 추천              |
| --------------------- | --------------------- | -------------------- | ----------------- |
| **같은 값 여러 변수** | ✅ Pool 공유로 효율적 | ❌ 각각 별도 저장    | **String**        |
| **값을 자주 수정**    | ❌ 객체 대량 생성     | ✅ 하나 객체만 수정  | **StringBuilder** |
| **읽기만 함**         | ✅ 안전하고 효율적    | ⚖️ 큰 차이 없음      | **String**        |
| **멀티스레드**        | ✅ 자동 스레드 안전   | ❌ 동기화 필요       | **String**        |

---

## 6. Java의 설계 철학 🏗️

### 6.1 왜 불변 객체를 만들었나?

### 1. **String Pool 최적화** 📦

```java
String url1 = "<https://example.com>";
String url2 = "<https://example.com>";
// 같은 URL을 여러 곳에서 사용 → 하나의 객체로 공유
```

### 2. **멀티스레드 안전성** 🔒

```java
String config = "server.port=8080";
// Thread1, Thread2가 동시에 읽어도 안전
// 불변이라 값이 바뀔 걱정 없음 → 동기화 불필요
```

### 3. **hashCode 안정성** 🎯

```java
HashMap<String, Integer> map = new HashMap<>();
map.put("key1", 100);

// String이 가변이라면?
// "key1"이 바뀌면 hashCode도 바뀜 → map에서 못 찾는 버그
```

### 4. **보안** 🛡️

```java
String password = "secret123";
String filePath = "/secure/data.txt";
// 실행 중간에 값이 바뀌면 보안 취약점 → 불변으로 방지
```

### 6.2 왜 가변 버전도 제공하나?

**이유**: 트레이드오프 인정 ⚖️

- 상황에 맞는 **도구 선택** 가능
- **"기본은 불변, 수정 많으면 가변"** 철학

**대표적인 쌍**

```
String        ↔ StringBuilder    (문자열)
List          ↔ Collections.unmodifiableList()  (리스트)
BigInteger    ↔ MutableBigInteger (큰 정수)
```

---

## 7. 핵심 정리 📝

### ✅ 기억할 것

- **참조형 ≠ 가변** (독립적 개념)
- **String Pool 탐색**은 O(1)로 빠름 (걱정 안 해도 됨)
- **불변 객체**: 읽기 중심, 공유, 안전성에 효율적
- **가변 객체**: 수정 중심에 효율적
- **Java는 둘 다 제공** (String ↔ StringBuilder)

### 🎯 실전 팁

### 언제 String을 사용할까?

```java
// ✅ 이런 경우에는 String
String name = "홍길동";
String message = "안녕" + name + "님";  // 간단한 연결
String config = properties.getProperty("server.url");
```

### 언제 StringBuilder를 사용할까?

```java
// ✅ 이런 경우에는 StringBuilder
StringBuilder html = new StringBuilder();
for (User user : users) {
    html.append("<li>").append(user.getName()).append("</li>");  // 반복적인 연결
}

StringBuilder log = new StringBuilder();
log.append("[").append(timestamp).append("] ")
   .append(level).append(": ").append(message);  // 체이닝
```

### 💡 선택 가이드

```
문자열 연산 반복 < 10번     → String 사용
문자열 연산 반복 >= 10번    → StringBuilder 사용
객체 공유가 중요함          → 불변 객체 고려
성능 < 안전성              → 불변 객체 우선
멀티스레드 환경             → 불변 객체 권장
```

### ⚠️ 주의사항

```java
// ❌ 이런 실수 하지 말기
String result = "";
for (int i = 0; i < 1000; i++) {  // 1000번의 새 객체 생성
    result += "data" + i;
}

// ✅ 올바른 방법
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {  // 하나의 객체만 수정
    sb.append("data").append(i);
}
String result = sb.toString();
```

---

**🔥 한 줄 요약**: 불변 객체는 **"읽기 중심"**에, 가변 객체는 **"수정 중심"**에 효율적이다!

**참고: 객체별 특징**

| 저장 위치       | 재사용      | 가변 여부 |
| --------------- | ----------- | --------- |
| `""` 리터럴     | String Pool | ✅        |
| `new String()`  | 일반 Heap   | ❌        |
| `StringBuilder` | 일반 Heap   | ❌        |
