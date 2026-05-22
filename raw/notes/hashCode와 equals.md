## 1️⃣ `equals()` — 동등 비교 메서드

### 기본 동작

| 비교 대상          | 기본 동작                                |
| ------------------ | ---------------------------------------- |
| 기본형(int, char…) | `==` 으로 값 직접 비교                   |
| 참조형(Object)     | **주소값** 비교 (기본 `equals()`도 동일) |

```java
CopyPerson p1 = new Person("홍길동");
Person p2 = new Person("홍길동");

p1 == p2         // false (서로 다른 주소)
p1.equals(p2)    // false (기본 equals도 주소 비교)
```

> ⚠️ **중요!** `Object.equals()`는 기본적으로 `==` 과 동일하게 **주소 비교**를 한다.

---

### `equals()` 오버라이딩

**목적:** 주소가 아닌 **필드 값 기준**으로 동등 비교를 하고 싶을 때

```java
Copy@Override
public boolean equals(Object o) {
    if (this == o) return true;                    // ① 같은 객체면 바로 true
    if (!(o instanceof Person)) return false;      // ② 타입 불일치면 false
    Person person = (Person) o;                    // ③ 다운캐스팅
    return Objects.equals(this.name, person.name); // ④ 필드값 비교
}
```

> 💡 `String.equals()`도 내부적으로 이렇게 오버라이딩 되어 있어서 **문자열 값 비교**가 가능한 것!

---

## 2️⃣ `hashCode()` — 객체의 지문

### 기본 동작

- 객체의 **주소값을 기반**으로 해싱해서 고유한 정수값 반환
- 다른 두 객체는 → 기본적으로 **다른 해시코드** 반환
- 내부 구현은 **native 메서드** (OS 레벨 C언어 구현, 내부 코드 볼 수 없음)

```java
CopyPerson p1 = new Person("홍길동");
Person p2 = new Person("홍길동");

p1.hashCode() // 622488023
p2.hashCode() // 1933863327  → 서로 다름!
```

---

## 3️⃣ 왜 `equals`와 `hashCode`는 **함께** 오버라이딩해야 하나?

### 핵심 규칙 (Java 스펙)

> **`equals()` 결과가 `true`인 두 객체의 `hashCode()`는 반드시 같아야 한다.**

---

### Hash 기반 컬렉션의 동등 비교 순서

```
객체 추가 시 중복 체크 흐름
        │
        ▼
┌─────────────────────────┐
│  hashCode() 비교         │
│  → 다르면? 바로 다른 객체 │
│  → 같으면? 다음 단계로   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  equals() 비교           │
│  → true? 중복 → 저장 X  │
│  → false? 다른 객체      │
└─────────────────────────┘
```

> `HashSet`, `HashMap`, `HashTable` 전부 이 순서로 동작!

---

### `equals`만 오버라이딩 했을 때의 문제

```java
CopyPerson p1 = new Person("홍길동");
Person p2 = new Person("홍길동");

p1.equals(p2) // true  ← equals는 같다고 함
p1.hashCode() // 460141958
p2.hashCode() // 1163157884  ← 해시코드는 다름!

Set<Person> set = new HashSet<>();
set.add(p1);
set.add(p2);
set.size(); // 2 ← 중복 제거 안 됨! 버그 발생 💥
```

> HashSet은 `hashCode`부터 비교 → 해시코드가 다르면 `equals` 호출조차 안 하고 **"다른 객체"** 로 판단!

---

### `equals` + `hashCode` 동시 오버라이딩 (올바른 방법 ✅)

```java
Copy@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Person p = (Person) o;
    return Objects.equals(name, p.name);
}

@Override
public int hashCode() {
    return Objects.hash(name); // name 필드 기반으로 해시 생성
}
```

```java
Copyp1.hashCode() // 54150093
p2.hashCode() // 54150093  ← 이제 같음!

set.size();   // 1 ← 정상적으로 중복 제거 ✅
```

---

## 4️⃣ 비교표 한눈에 정리

| 상황             | `==`    | 기본 `equals()` | 오버라이딩 `equals()`   |
| ---------------- | ------- | --------------- | ----------------------- |
| 기본형 값 비교   | ✅ 가능 | ❌              | -                       |
| 객체 주소 비교   | ✅ 가능 | ✅ 동일         | ❌ (필드 비교로 변경됨) |
| 객체 필드값 비교 | ❌      | ❌              | ✅ 가능                 |
