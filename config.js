// ★ 게임 수치·대사·이미지 경로는 모두 이 파일에서 수정하세요.
const CONFIG = {
  start: { metal: 80, organic: 60, resource: 100 },      // 초기 수치
  goal:  { metal: 30, organic: 30, successResource: 20 }, // 목표 수치
  recoverCost: 10,                                         // 자석 회수 비용

  // 실험 1: 나노입자 투입량 (remove=제거 기여, cost=자원 소모, nanoCount=화면 입자 수)
  dose: {
    low:  { label: '적게', remove: 25, cost: 10, nanoCount: 8 },
    mid:  { label: '보통', remove: 45, cost: 20, nanoCount: 14 },
    high: { label: '많이', remove: 58, cost: 35, nanoCount: 20 }
  },
  // 실험 1: 혼합 시간 (bonus=제거량 보정, ms=애니메이션 길이)
  mix: {
    short: { label: '짧게', bonus: -12, cost: 5,  ms: 1500 },
    mid:   { label: '보통', bonus: 0,   cost: 10, ms: 3000 },
    long:  { label: '길게', bonus: 8,   cost: 20, ms: 4500 }
  },
  // 실험 2: 자외선 조사 시간 (organic=처리 후 유기오염도)
  uv: {
    short: { label: '짧게', organic: 45, cost: 10 },
    mid:   { label: '보통', organic: 25, cost: 25 },
    long:  { label: '길게', organic: 10, cost: 40 }
  },

  // 캐릭터 이미지 경로 (없으면 이름 첫 글자가 대신 표시됩니다)
  characters: {
    riwa:  { name: '리와',   img: 'assets/riwa.png' },
    riwa2: { name: '리와',   img: 'assets/riwa2.png' },
    serin: { name: '세린',   img: 'assets/serin.png' },
    mayra: { name: '마이라', img: 'assets/mayra.png' }
  },


  // 안내 대사 (한 번에 1~2문장, 클릭하면 다음/닫기). who: riwa / serin / mayra
  talk: {
    start:       [{ who: 'mayra', text: '지하수가 오염되어 마실 물이 부족해. 자원을 아끼며 계속 쓸 수 있는 정수 시스템이 필요해.' }, { who: 'riwa2', text: '정화 관련 분리공정 자료를 찾아냈어! 이걸 연구해보자.' }, { who: 'serin', text: '나도 도울게.' }],
    exp1:        [{ who: 'serin', text: '자성 나노입자 표면에 중금속 이온과 결합하는 킬레이트 작용기를 붙였어. 이 입자가 중금속을 붙잡으면 자석으로 한꺼번에 모을 수 있지.' }],
    mixed:       [{ who: 'serin',  text: '나노입자가 중금속을 포집했더라도 물속에 그대로 남겨둘 수는 없어. 이제 자석으로 회수해야 해.' }],
    exp2:        [{ who: 'serin', text: '이번에는 광촉매를 이용할 거야. TiO₂에 자외선을 쪼이면 전자와 정공이 생기고, 이들이 관여하는 반응으로 유기오염물질이 분해돼. 조사 시간이 길수록 잘 분해되지만 자원도 더 들어.' }],
    beforeFinal: [{ who: 'riwa2',  text: '이제 정화 성능과 남은 자원을 확인해 보자.' }]
  },

  // 실패 대사
  lines: {
    riwa:  '중금속이 충분히 제거되지 않았어. 투입량과 혼합 시간을 다시 검토해 보자.',
    serin: '유기오염물질이 충분히 분해되지 않았어. 조사 시간을 늘리면 개선할 수 있지만 자원 소모도 고려해야 해.',
    mayra: '아직 주민들에게 물을 공급하기 어려운 상태야. 정수 시스템을 다시 설계해야겠어.',
    success: { who: 'riwa2',  text: '해냈어! 이 정수 시스템이면 깨끗한 물을 공급할 수 있어!' },
    partial: { who: 'serin', text: '목표는 달성했지만 자원이 부족해. 운영을 이어가려면 비용을 줄일 방법을 찾아야 해.' }
  },
  recoverNote: '나노입자를 회수하지 않으면 입자가 물에 그대로 남아 새로운 오염원이 되고, 재사용도 할 수 없어요. 자석을 작동해 회수해야 다음 단계로 갈 수 있어요.',

  // 최종 판정 문구
  results: {
    success: { title: '성공',      text: '정수 시스템 개발 성공. 정화 목표를 달성하고 운영을 위한 자원도 확보했다.' },
    partial: { title: '부분 성공', text: '정화 목표는 달성했지만 운영 자원이 부족하다. 제3인류는 외부 지원이나 기술 개선을 검토해야 한다.' },
    fail:    { title: '실패',      text: '정수 시스템이 목표 성능을 달성하지 못했다. 실험 조건을 재검토해야 한다.' }
  }
};
