# Sung Hee Lim — academic website

따뜻한 크림·테라코타·세이지 색의 정적 학술 포트폴리오입니다. 본문은 국제 학술 독자를 고려해 영어로 작성했고 편집 화면은 한국어입니다. Lato 폰트는 Google Fonts에서 불러오며 연결되지 않을 경우 시스템 sans-serif로 표시됩니다.

## 내용 수정 · 사진 추가

1. 웹사이트 하단 **Edit this site** 또는 `editor.html`을 엽니다.
2. 소개, 연구, 논문, 학력, 경력, 발표, 수상 내역을 수정합니다. 프로필 화면에서 사진과 새 CV PDF를 올릴 수 있습니다.
3. **초안 저장**은 현재 브라우저에만 저장합니다. **초안 미리보기**로 확인합니다.
4. **웹사이트 ZIP 다운로드**를 누르면 수정본이 포함된 전체 파일을 받습니다. `content.js 다운로드`는 내용 파일만 받습니다.
5. 실제 배포 사이트를 바꾸려면 아래 방법으로 파일을 교체해야 합니다. 초안 저장만으로 방문자에게 보이는 사이트가 바뀌지는 않습니다.

현재 LinkedIn 프로필 주소는 제공되지 않아 비워 두었습니다. 편집 화면에 정확한 URL을 넣으면 클릭 가능한 링크가 표시됩니다. 사진은 실제 사진을 업로드하기 전까지 이니셜 일러스트로 표시됩니다.

## 현재 ChatGPT 사이트 업데이트

편집 화면에서 받은 `content.js`를 이 대화에 첨부하고 현재 사이트에 반영해 달라고 요청할 수 있습니다. 기존 사이트의 디자인이나 구조도 이 대화에서 변경할 수 있습니다. 이 편집 화면은 서버 배포 권한이 없으며 방문자는 원본을 변경할 수 없습니다.

## 무료 GitHub Pages 운영

별도 유료 템플릿, 빌드 도구, 서버 또는 플러그인이 필요 없습니다. GitHub Free 계정의 **공개 저장소**에서 GitHub Pages를 사용할 수 있습니다. 기본 `github.io` 주소를 사용하면 도메인을 구매할 필요가 없습니다. 개인 도메인은 선택 사항입니다.

1. GitHub 계정을 만들거나 로그인합니다.
2. 새 공개 저장소를 만듭니다. 예: `yourusername.github.io` (yourusername은 본인의 GitHub 사용자 이름).
3. 이 ZIP을 압축 해제한 뒤 **내부 파일 전체**를 저장소 최상위에 업로드합니다. `index.html`, `content.js`, `style.css`, `app.js`, `editor.html`, `editor.js`, `site-files.json`, `assets/` 등이 최상위에 있어야 합니다. ZIP 자체를 업로드하지 않습니다.
4. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**를 선택합니다.
5. 배포가 완료되면 GitHub에 표시된 주소로 접속합니다.
6. 다음 수정부터는 웹사이트의 편집 화면에서 `content.js`를 내려받고, GitHub 저장소의 기존 `content.js`를 바꾼 다음 **Commit changes**를 누릅니다. GitHub Pages가 업데이트를 배포합니다.

공식 안내: https://docs.github.com/en/pages/quickstart

## 파일 구성

- `index.html`: 홈페이지 구조
- `style.css`: 색, 여백, 글꼴과 반응형 레이아웃
- `content.js`: 모든 프로필·연구·논문·경력 데이터
- `app.js`: 상세 보기, 필터, 메뉴와 연락처 동작
- `content-policy.js`: 이전 브라우저 초안 정리 및 현재 사이트 데이터 적용
- `assets/kenya-south-korea.svg`: Kenya와 South Korea를 연결한 세계 지도
- `editor.html`, `editor.js`: 브라우저 편집 화면과 수정본 다운로드
- `assets/Sung-Hee-Lim-CV-website-v2.pdf`: 웹사이트용 CV 사본
- `site-files.json`: 전체 ZIP 다운로드에 포함할 파일 목록

`site-files.json`은 파일이 추가되거나 삭제되면 목록을 맞춰야 합니다. 내용만 수정할 때는 바꿀 필요가 없습니다.

## 자료와 연구 상태

웹사이트 설명은 2026년 11월 16일자 CV와 SoP의 연구 서술을 바탕으로 작성했습니다. SoP 원본과 개인 피드백·지원 학교별 문구는 사이트에 포함하지 않았습니다. 게재 논문, 발행된 보고서와 진행 중 석사논문을 구분했습니다. 제외 요청한 원고·보고서 및 관련 발표는 사이트 데이터 및 웹사이트용 CV에서 제외했습니다. 이후 연구 상태가 바뀌면 편집 화면에서 수정해 주세요.

확인된 외부 링크:

- 현재 연구실: https://weave.snu.ac.kr/
- Teacher imaginaries 논문: https://doi.org/10.1016/j.tate.2026.105435
- AIDT 정책 문서 논문: https://doi.org/10.52183/KSPE.2025.32.4.25

문의 메일은 방문자의 메일 앱을 여는 `mailto:` 링크입니다. 이메일을 직접 전송하거나 방문자 정보를 수집하는 서버는 없습니다.
