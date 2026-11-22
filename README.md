# PROJECT EDEN - OPERATION: CLEAN WATER

## 실행 방법
`index.html` 파일을 더블클릭하면 브라우저(크롬 추천)에서 바로 실행됩니다. 인터넷이 필요 없어요.

## 파일 구조
- `config.js` : **수정은 여기서!** 수치, 비용, 대사, 판정 문구, 캐릭터 이미지 경로
- `index.html` : 4개 화면의 뼈대 (글자 위치·버튼 문구)
- `style.css` : 색상(맨 위 `:root`), 글자 크기(`body`의 `font`), 애니메이션
- `script.js` : 게임 규칙 (보통은 건드리지 않아도 됩니다)
- `assets/` : 캐릭터 이미지 폴더

## 자주 하는 수정
- **수치 바꾸기**: `config.js`의 `dose`, `mix`, `uv`, `recoverCost`, `start`, `goal`
- **대사 바꾸기**: `config.js`의 `lines`
- **캐릭터 이미지 교체**: `assets/`에 `serin.png`, `mayra.png`를 넣으면 자동 적용. 다른 이름/확장자를 쓰려면 `config.js`의 `characters`에서 `img` 경로를 수정
- **글자 더 크게**: `style.css`의 `body{ font: 20px ...}`에서 숫자 변경
