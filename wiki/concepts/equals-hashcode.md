---
type: concept
tags: [java, equals, hashcode, collection]
updated: 2026-05-19
sources: ["raw/notes/hashCode와 equals.md"]
---

# equals와 hashCode

## 한 줄 정의

`equals()`는 두 객체가 **같은가**를 판정하고, `hashCode()`는 객체의 **지문(정수)** 을
만든다. 둘은 반드시 **함께** 오버라이딩해야 한다.

## 기본 동작 — 둘 다 "주소" 기준

| 비교 대상            | 기본 동작                              |
| -------------------- | -------------------------------------- |
| 기본형(int, char…)   | `==` 으로 값 직접 비교                 |
| 참조형(Object)       | **주소값** 비교 (기본 `equals()`도 동일) |

```java
Person p1 = new Person("홍길동");
Person p2 = new Person("홍길동");

p1 == p2          // false — 서로 다른 주소
p1.equals(p2)     // false — Object.equals()도 기본은 == (주소 비교)
p1.hashCode()     // 622488023
p2.hashCode()     // 1933863327  → 주소 기반이라 다름
```

`Object.hashCode()`는 주소 기반 해싱을 하는 **native 메서드**(OS 레벨 C 구현).

## 왜 오버라이딩하는가

기본 동작은 "주소가 같아야 같다"이다. 하지만 보통은 **필드 값이 같으면 같은 객체로
취급**하고 싶다 (이름이 같은 `Person` 둘을 같다고 보고 싶다). `String.equals()`가
문자열 값 비교를 해주는 것도 String이 내부적으로 이렇게 오버라이딩돼 있어서다.

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;                       // ① 같은 객체면 즉시 true
    if (o == null || getClass() != o.getClass())      // ② 타입 불일치면 false
        return false;
    Person p = (Person) o;
    return Objects.equals(name, p.name);              // ③ 필드값 비교
}

@Override
public int hashCode() {
    return Objects.hash(name);                        // equals와 같은 필드로 해시 생성
}
```

## 왜 반드시 "함께" 오버라이딩하는가 (핵심)

**Java 스펙의 규약:** `equals()`가 `true`인 두 객체의 `hashCode()`는 반드시 같아야 한다.

Hash 기반 컬렉션(`HashSet`, `HashMap`, `HashTable`)의 중복 판정 순서가 이렇기 때문이다:

```
객체 추가 시
   │
   ▼  hashCode() 비교 ── 다르면? → 바로 "다른 객체" (equals 호출조차 안 함)
   │                  ── 같으면? → 다음 단계
   ▼  equals() 비교  ── true? → 중복, 저장 X
                      ── false? → 다른 객체
```

`equals()`만 오버라이딩하면, 값이 같은 두 객체라도 hashCode가 제각각이라 다른
버킷으로 가버린다. 그러면 `equals()`를 호출조차 하지 않고 "다른 객체"로 판정 →
`HashSet`에 중복이 그대로 쌓이는 **버그**가 난다.

```java
// equals만 오버라이딩한 경우
set.add(p1); set.add(p2);   // p1.equals(p2)==true 인데도
set.size();                  // 2  ← 중복 제거 실패 💥
```

## 실무 연결

이 규약 위반은 컴파일 에러도, 예외도 아니고 **조용한 논리 버그**라 디버깅이 어렵다.
실무에서 DTO·엔티티를 컬렉션 키로 쓸 때 거의 항상 둘을 같이 오버라이딩한다.
[[mutable-immutable]]의 "불변 객체와 hashCode 안정성"도 같은 맥락 — 키가 변하면
hashCode가 변해 못 찾는다.

## 관련 페이지

- [[mutable-immutable]] — 불변이어야 hashCode가 안정적, HashMap 키 안전
- [[jvm-memory]] — 참조형의 "주소"가 사는 곳
- [[java-record]] — equals/hashCode를 자동 생성하는 도구
- [[etag]] — 응답 캐시 키를 hashCode로 만드는 실무 활용
- 출처: [[equals-hashcode-note]]
