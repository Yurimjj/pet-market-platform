# 🐶 Pet Market Platform

반려동물 용품 중고거래와 사용자 간 소통을 위한 웹 서비스입니다.
단순 거래 기능을 넘어 커뮤니케이션을 제공하는 플랫폼을 목표로 개발했습니다.

---

## 🚀 프로젝트 개요

* 개발 기간: 2025.06 ~ 2025.09
* 참여 인원: [4명]
* 형태: 국비 교육 팀 프로젝트
* 담당 역할:
*   JWT 기반 인증 및 인가 로직 구현
*   게시판 및 댓글 CRUD API 개발
*   WebSocket 기반 실시간 채팅 기능 구현
*   일부 프론트엔드 UI 및 기능 개발
*   팀 일정 관리 및 코드 리뷰 참여 (부팀장)

---

## 🛠 기술 스택

### Backend

* Java, Spring Boot
* Spring Security, JWT 인증
* JPA (Hibernate)
* WebSocket (SockJS)

### Frontend

* React
* DaisyUI

### Database

* MySQL
* DBeaver

---

## ✨ 주요 기능

### 🔐 JWT 기반 로그인

* JWT 토큰 생성 및 검증 직접 구현
* Stateless 인증 구조 적용
* Security Filter를 통한 인증 처리

---

### 💬 실시간 채팅

* SockJS 기반 WebSocket 채팅 구현
* 채팅방 생성 및 메시지 송수신
* 사용자별 채팅방 삭제 (soft delete) 기능 구현

---

### 📝 게시판 / 댓글

* 게시글 및 댓글 CRUD API 구현
* 사진 업로드 및 이미지 썸네일 처리

---

## 🧠 기술적 고민 및 해결

### 1. 채팅방 중복 생성 문제

* 사용자 ID를 정렬하여 하나의 채팅방만 생성되도록 설계

---

### 2. 사용자별 채팅 삭제 기능

* 실제 삭제가 아닌 `clearedAt` 기반 soft delete 방식 적용
* 사용자별 독립적인 채팅 기록 관리

---

### 3. JWT 인증 처리 구조

* 토큰 검증 후 SecurityContext에 사용자 정보 저장
* 필터에서 인증/비인증 경로 분리 처리

---

### 4. JWT 인증 처리 시 필터 충돌 문제 해결

* permitAll 경로에서도 JWT 필터가 동작하여 401 오류 발생
* shouldNotFilter를 활용해 인증 제외 경로 분리 처리

---

## 🔐 환경 변수

* OAuth 및 API 키는 보안상 포함되어 있지 않습니다.

---

## 🙋‍♂️ 담당 역할 상세

* JWT 기반 인증 로직 구현 (토큰 생성/검증)
* 게시판 및 댓글 CRUD API 개발
* WebSocket 기반 채팅 기능 구현

※ 일부 Security 설정 및 API 구조는 팀원과 협업하여 개발했습니다.

---
