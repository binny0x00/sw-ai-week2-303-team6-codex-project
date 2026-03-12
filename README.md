# Civilization Sim Demo

An observation-first 2D civilization simulation that starts with a primitive tribe and lets fire, stone tools, fishing, cooperation, and shelters emerge over time.

## 프로젝트 설명

이 프로젝트는 작은 부족이 자연환경 속에서 살아남으며 문명을 만들어 가는 과정을 실시간으로 보여주는 2D 시뮬레이션입니다. 시작은 아주 단순합니다. 몇 명의 주민이 배고픔, 추위, 체력, 에너지를 관리하며 채집과 사냥으로 버티고, 시간이 지나면 불을 발견하고, 돌도구를 만들고, 농경과 정착을 시작하면서 사회가 점점 복잡해집니다. 이후에는 시장, 다리, 부두, 공장, 병원, 학교 같은 시설이 생기고, 시대가 원시 시대에서 현대 시대로 넘어가면서 인구 구조와 생활 방식도 함께 달라집니다.

이 프로젝트의 핵심은 단순히 건물을 누르면 성장하는 게임이 아니라, 주민들이 스스로 판단하고 움직인다는 점입니다. 주민은 상황에 따라 사냥꾼, 경비병, 농부, 어부, 의무병 같은 역할을 맡고, 기대 수명과 건강 상태, 재해, 식량 사정, 동물과 공룡의 위협에 따라 공동체 전체의 인구가 실제로 늘거나 줄어듭니다. 비, 눈, 가뭄, 질병, 산사태 같은 재해는 월 단위로 작동하고, 최근에는 다리를 실제 통로로 인식해서 강을 건너도록 이동 로직도 개선했습니다. 즉 이 프로젝트는 문명의 발전을 '건설'보다 '생태계와 인간 행동의 상호작용'으로 보여주는 시뮬레이션이라고 설명할 수 있습니다.

## 발표용 아키텍처 설명

- `index.html` + `styles.css`
  - 사용자 입력, HUD, 버튼, 캔버스 UI를 담당하는 프론트엔드 레이어입니다.
- `app.js`
  - 이 프로젝트의 핵심 엔진입니다. 세계 상태, 시대 발전, 주민 AI, 동물/공룡 행동, 재해 시스템, 렌더링, 테스트용 브라우저 훅까지 대부분의 로직이 이 파일에 모여 있습니다.
- `server.mjs`
  - 별도 프레임워크 없이 프로젝트를 바로 실행할 수 있게 해주는 정적 서버입니다.
- `verify.mjs`
  - Playwright 기반 스모크 테스트입니다. 실제 브라우저에서 앱을 열고 상태를 읽어 기능이 깨지지 않았는지 확인합니다.

"캔버스 기반 시뮬레이션 UI", "상태와 규칙을 관리하는 단일 시뮬레이션 엔진", "로컬 실행/검증 자동화 레이어"의 3단 구조입니다.

## Codex를 어떻게 활용했는가

이 프로젝트에서는 Codex를 단순 코드 생성기가 아니라 "로컬 코드베이스를 직접 읽고 수정하고 검증하는 협업형 개발 도구"로 활용했습니다. 예를 들어 인구와 기대 수명 시스템 조정, 공룡 행동 추가, 재해 로직 개편, 다리 이동 버그 수정처럼 요구사항이 생기면 먼저 관련 함수와 상태 구조를 분석하고, 그 다음 실제 파일을 수정하고, 마지막으로 `node --check app.js`, `npm run verify`, 로컬 실행, Vercel preview 배포까지 이어서 확인하는 방식으로 사용했습니다. 즉 "요구사항 해석 -> 코드 탐색 -> 구현 -> 검증 -> 배포"를 한 흐름으로 맡겼다는 점이 핵심입니다.

## 우리 협업 방식과 GitHub 흐름

이번 프로젝트는 기능 단위로 짧게 반복하는 방식으로 협업했습니다.

1. 사람이 기능이나 버그 수정 요구를 주면 Codex가 현재 코드와 상태를 먼저 분석합니다.
2. Codex가 로컬에서 구현하고, 필요하면 테스트와 실행 확인까지 마칩니다.
3. 작업이 정리되면 `codex/*` 브랜치를 만들고 커밋한 뒤 원격 브랜치로 푸시합니다.
4. 그 브랜치로 `main` 대상 PR을 만들고, 변경 요약과 테스트 결과를 남깁니다.
5. PR에서 self-review 코멘트를 남기고 merge 가능 상태와 충돌 여부를 확인합니다.
6. 문제가 없으면 squash merge로 `main`에 반영하고, 마지막으로 로컬 `main`도 fast-forward 해서 동기화합니다.

사람이 방향을 제시하고, Codex가 구현과 검증, PR 생성과 병합까지 자동화해 주는 협업 루프

## Run

```bash
npm install
npm start
```

Then open http://localhost:4173.

## Verify

```bash
npm run verify
```

This assumes the local server is already running on port 4173.

## Structure

- `index.html`: top controls, canvas, side panel, and start overlay
- `styles.css`: warm diorama-focused UI styling
- `app.js`: world generation, villager AI, disasters, rendering, and browser hooks
- `server.mjs`: zero-dependency static server
- `verify.mjs`: Playwright smoke test that captures screenshots and state JSON
- `progress.md`: implementation notes and follow-up ideas

## Core Systems

- Villagers manage hunger, health, warmth, and energy while choosing work automatically.
- The tribe unlocks new behaviors from accumulated world exposure instead of research buttons.
- Disasters affect movement, food regeneration, health, temperature, and map hazards.
- `window.render_game_to_text()` exposes simulation state for automation.
- `window.advanceTime(ms)` steps the sim deterministically for testing.

## Follow-Up Ideas

- Add births or migration to make population recover dynamically.
- Layer in season cycles and terrain-specific migration.
- Add a mini timeline or replay scrubber for key civilization milestones.
