window.SIM_WORLD = {
  meta: {
    name: "DEADZONE / QUARANTINE Unified Simulator",
    version: "1.0.0",
    engine: "Static GitHub Pages Build",
    addedNotes: [
      "원문에 없는 세부 룸 단위 이동은 추가하지 않고, 문서에 존재하는 조사 위치와 포인트만 행동 단위로 구성했다.",
      "두 문서의 시대/도시명이 다르므로 시뮬레이터에서는 '시나리오 층'으로 분리해 충돌 없이 사용하도록 설계했다.",
      "부족한 수치형 전투 규칙은 간단한 2D6 판정 시스템으로 보강했다."
    ]
  },
  systems: {
    time: {
      dayLimit: 18,
      turnLabel: "조사 턴",
      dayAdvanceEvery: 3
    },
    roll: {
      formula: "2D6 + 능력치 >= 목표치",
      defaultTargets: { easy: 7, normal: 9, hard: 11, severe: 13 }
    },
    infection: {
      source: "QUARANTINE ZONE",
      exposure: ["물림", "혈액 접촉", "깊은 상처"],
      latentHours: "6~24시간",
      stages: [
        "0 정상",
        "1~2 잠복기",
        "3 초기 증상",
        "4 전환 경고",
        "5 전환 카운트다운"
      ],
      treatment: [
        "항생제: 전환 지연",
        "지식 3 이상: 응급처치로 감염도 -1",
        "고급 약품: 감염도 최대 -2"
      ]
    }
  },
  archetypes: [
    { key: "athlete", name: "체육특기생", stats: { STR: 4, SPD: 4, SLY: 2, WIL: 3, KNO: 1, CRAFT: 1, SOC: 2 }, perks: ["도주 판정 +1", "근접 대응 +1"] },
    { key: "medic", name: "보건부장", stats: { STR: 1, SPD: 2, SLY: 2, WIL: 4, KNO: 5, CRAFT: 2, SOC: 2 }, perks: ["응급처치 특기", "의무실 계열 보정"] },
    { key: "delinquent", name: "비행청소년", stats: { STR: 3, SPD: 3, SLY: 5, WIL: 2, KNO: 1, CRAFT: 4, SOC: 1 }, perks: ["잠행 +1", "잠금 해제 보정"] },
    { key: "artist", name: "예술 특기자", stats: { STR: 2, SPD: 4, SLY: 4, WIL: 3, KNO: 2, CRAFT: 3, SOC: 2 }, perks: ["관찰 +1", "즉흥 제작 +1"] },
    { key: "topstudent", name: "전교 1등", stats: { STR: 1, SPD: 2, SLY: 2, WIL: 4, KNO: 5, CRAFT: 3, SOC: 1 }, perks: ["해독/분석 +1", "감염 대처 보정"] }
  ],
  recipes: [
    { name: "야전 봉합 키트", requires: ["붕대", "붕대", "소독약", "메스"], skill: "응급처치", effect: "중상 처치 HP +3" },
    { name: "희석 소독 분무기", requires: ["소독약", "물", "물", "분무 용기"], skill: null, effect: "감염 판정 -1, 3회" },
    { name: "즉효 진통 주사", requires: ["주사기", "진통제", "수액"], skill: "응급처치", effect: "중상 행동 페널티 1턴 면제" },
    { name: "장거리 무전기 개조", requires: ["무전기", "증폭기 모듈", "전선"], skill: "기계수리", effect: "교신 범위 2배" },
    { name: "태양광 소형 충전기", requires: ["태양광 패널 잔해", "전선", "USB 보드"], skill: "기계수리", effect: "배터리 상시 충전" },
    { name: "화염병", requires: ["가솔린", "유리병", "천 조각"], skill: null, effect: "범위 화염 / 군집 유인" },
    { name: "철파이프 격투 무기", requires: ["쇠파이프", "철사", "천"], skill: null, effect: "STR 판정 +1" },
    { name: "즉석 바리케이드 키트", requires: ["목재", "못", "전동공구"], skill: "기계수리", effect: "출입구 강화" },
    { name: "캠핑 스토브 요리", requires: ["캠핑 스토브", "식재료", "가스통"], skill: null, effect: "HP +2" },
    { name: "임시 혈청", requires: ["HV-7 원료", "항생제", "항생제", "수술 도구"], skill: "응급처치", effect: "감염 카운트다운 완전 정지" }
  ],
  npcs: [
    { name: "박진수", from: "DEADZONE", role: "전직 소방관", note: "서령초 방송실 활성화 시 등장 가능" },
    { name: "권도현", from: "QUARANTINE", role: "담임교사", note: "온건파 리더" },
    { name: "장민수", from: "QUARANTINE", role: "체육교사", note: "강경파 생존주의" },
    { name: "이서연", from: "QUARANTINE", role: "영어교사", note: "비상 통신 장비 존재 인지" },
    { name: "오점순", from: "QUARANTINE", role: "급식 조리사", note: "냉동고 비상 약품 은닉 가능" },
    { name: "최재원", from: "QUARANTINE", role: "외부 생존자", note: "정보기관 관련 배경" }
  ],
  scenarios: [
    {
      id: "deadzone",
      name: "DEADZONE — 서령구 생존 시뮬레이터",
      description: "조사 위치 데이터베이스 기반. D+180 기준 서령구 전역 탐사.",
      startLocations: ["seoryeong_school", "annex_clinic", "apartment_a"],
      locations: {
        annex_clinic: {
          name: "서령보건소 별관",
          zone: "A구역",
          risk: 1,
          summary: "시작 거점 의료시설. 1층 창고 자원, 2층 숙소 거점, 지하 창고는 잠금.",
          visibleInfo: ["1층 창고", "2층 숙소", "잠긴 지하 창고"],
          loot: [
            { name: "붕대", qty: 4 }, { name: "소독약", qty: 2 }, { name: "아스피린·진통제", qty: 1 },
            { name: "혈압계·청진기", qty: 1 }, { name: "응급 처치 매뉴얼", qty: 1 }
          ],
          actions: [
            { id: "loot_basic", label: "1층 창고 조사", kind: "loot", log: "약품과 응급 자재를 확보했다.", grants: ["붕대", "붕대", "소독약", "아스피린·진통제", "응급 처치 매뉴얼"], once: true },
            { id: "unlock_basement", label: "지하 창고 해제 시도", kind: "check", stat: "SLY", difficulty: 9, success: { log: "지하 창고를 열었다.", grants: ["항생제", "수액", "주사기", "메스"] }, fail: { log: "잠긴 공간 스트레스로 SAN -1", san: -1 } },
            { id: "rest_base", label: "거점 정비", kind: "rest", hp: 1, log: "거점을 정리하며 숨을 돌렸다." },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        seoryeong_school: {
          name: "서령초등학교",
          zone: "A구역",
          risk: 1,
          summary: "난민 흔적이 남은 식량 거점. 급식실·도서관·방송실·옥상이 핵심.",
          visibleInfo: ["1층 급식실", "냉동고", "2층 도서관", "방송실", "3층 옥상"],
          loot: [
            { name: "통조림", qty: 6 }, { name: "담요·침낭", qty: 3 }, { name: "구형 AM/FM 라디오", qty: 1 },
            { name: "지역 지도 단편", qty: 1 }, { name: "생존 매뉴얼", qty: 1 }, { name: "쌍안경", qty: 1 }
          ],
          actions: [
            { id: "school_cans", label: "급식실 조사", kind: "loot", log: "급식용 통조림과 생필품을 챙겼다.", grants: ["통조림", "통조림", "통조림", "통조림", "통조림", "통조림", "담요·침낭", "구형 AM/FM 라디오"], once: true },
            { id: "school_freezer", label: "냉동고 전력 확인", kind: "event", log: "전력 상태를 확인했다.", event: "schoolFreezer" },
            { id: "school_library", label: "2층 도서관 조사", kind: "loot", log: "지도와 생존 지침을 확보했다.", grants: ["지역 지도 단편", "생존 매뉴얼"], bonus: { stat: "SLY", value: 1, maxOnce: true }, once: true },
            { id: "school_broadcast", label: "방송실 장비 작동", kind: "check", stat: "SLY", difficulty: 8, success: { log: "방송 장비를 살려 인근 생존자 단서를 얻었다. 박진수 관련 단서 추가." }, fail: { log: "방송 장비는 반응하지 않았다." } },
            { id: "school_roof", label: "3층 옥상 접근", kind: "check", stat: "SPD", difficulty: 8, success: { log: "옥상에 올라 북부 전경을 확인했다.", grants: ["쌍안경", "서령구 북부 전경 정보"] }, fail: { log: "막힌 출입문을 넘지 못했다." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        apartment_a: {
          name: "서령 아파트 A동",
          zone: "A구역",
          risk: 2,
          summary: "층별 위험 차등. 관리실 금고와 304호 메모가 핵심.",
          visibleInfo: ["1F 로비·관리실", "2~3F 주거층", "4~5F 바리케이드 구간"],
          loot: [
            { name: "마스터키", qty: 1 }, { name: "CCTV 녹화 장치", qty: 1 }, { name: "생존자 메모", qty: 3 }, { name: "공구 박스", qty: 1 }
          ],
          actions: [
            { id: "apt_safe", label: "관리실 금고 개방", kind: "check", stat: "SLY", difficulty: 9, success: { log: "마스터키를 손에 넣었다.", grants: ["마스터키", "CCTV 녹화 장치"] }, fail: { log: "금고를 열지 못했다." } },
            { id: "apt_304", label: "304호 메모 해독", kind: "check", stat: "SLY", difficulty: 8, success: { log: "304호 메모를 읽고 관련 단서를 확보했다.", grants: ["생존자 메모", "생존자 메모", "생존자 메모"] }, fail: { log: "메모의 의미를 파악하지 못했다." } },
            { id: "apt_upper", label: "상층 접근", kind: "check", stat: "SPD", difficulty: 9, success: { log: "상층으로 올라가 정찰과 자재 확보에 성공했다.", grants: ["태양광 패널 잔해"] }, fail: { log: "바리케이드를 넘다 배회자를 자극했다.", hp: -1, infectionCheck: false } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        gs25: {
          name: "편의점 GS25 (약탈 후)",
          zone: "A구역",
          risk: 1,
          summary: "대부분 약탈됐지만 소형 잡화 수집 가능.",
          visibleInfo: ["매장", "잠금 창고", "천장 선반"],
          actions: [
            { id: "gs_basic", label: "매장 수색", kind: "loot", log: "작은 생존용 소모품을 챙겼다.", grants: ["라이터", "성냥", "테이프"] },
            { id: "gs_storage", label: "잠금 창고 개방", kind: "check", stat: "SLY", difficulty: 9, success: { log: "숨겨진 재고를 찾았다.", grants: ["에너지드링크", "배터리", "생수 박스"] }, fail: { log: "창고는 열리지 않았다." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        church: {
          name: "서령교회",
          zone: "A구역",
          risk: 1,
          summary: "피난 흔적과 정보 수집 거점.",
          visibleInfo: ["메모", "종탑"],
          actions: [
            { id: "church_memo", label: "메모 해독", kind: "check", stat: "SLY", difficulty: 9, success: { log: "NPC 단서와 세력 정보를 얻었다." }, fail: { log: "메모 해독 실패." } },
            { id: "church_tower", label: "종탑 오르기", kind: "check", stat: "SPD", difficulty: 8, success: { log: "북부 전망을 확보했다." }, fail: { log: "탑으로 오르지 못했다." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        park_garden: {
          name: "서령공원 · 텃밭 구역",
          zone: "A구역",
          risk: 1,
          summary: "식량 생산과 수원 보강.",
          visibleInfo: ["텃밭", "빗물 수집 지점"],
          actions: [
            { id: "rain_collect", label: "빗물 수집 장치 정비", kind: "check", stat: "SLY", difficulty: 8, success: { log: "빗물 수집 체계를 만들었다.", grants: ["물", "물"] }, fail: { log: "빗물 수집 정비 실패." } },
            { id: "herb_search", label: "약초 채집", kind: "loot", log: "야생 약초를 모았다.", grants: ["야생 약초", "야생 약초"] },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        mart: {
          name: "서령마트",
          zone: "B구역",
          risk: 2,
          summary: "배회자 다수. 2층 창고와 지하 전기실이 핵심.",
          visibleInfo: ["1층 식품관", "2층 창고", "지하 전기실"],
          actions: [
            { id: "mart_enter", label: "1층 잠입", kind: "check", stat: "SPD", difficulty: 8, success: { log: "마트 내부로 무사히 진입했다.", grants: ["농기구", "마트 카트"] }, fail: { log: "배회자에게 들켜 HP -1", hp: -1 } },
            { id: "mart_storage", label: "2층 창고 개방", kind: "check", stat: "SLY", difficulty: 11, success: { log: "대량 식량을 확보했다.", grants: ["통조림", "통조림", "통조림", "건조식량", "캠핑 스토브", "가스통"] }, fail: { log: "배회자 군집이 커졌다.", san: -1 } },
            { id: "mart_power", label: "지하 전기실 조사", kind: "check", stat: "CRAFT", difficulty: 9, success: { log: "소형 발전기 카트를 확보했다.", grants: ["소형 발전기 카트"] }, fail: { log: "전기실 접근 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        pharmacy: {
          name: "약국",
          zone: "B구역",
          risk: 1,
          summary: "전문 의약품 확보 지점.",
          visibleInfo: ["진열대", "잠금 캐비닛"],
          actions: [
            { id: "pharm_basic", label: "기본 약품 수거", kind: "loot", log: "해열제와 진통제를 확보했다.", grants: ["진통제", "해열제"] },
            { id: "pharm_locked", label: "잠금 캐비닛 해제", kind: "check", stat: "SLY", difficulty: 9, success: { log: "전문 의약품을 확보했다.", grants: ["항생제", "항생제", "항생제", "주사기", "수액", "수면제"] }, fail: { log: "캐비닛 해제 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        ward_office: {
          name: "서령구청",
          zone: "B구역",
          risk: 2,
          summary: "통신 핵심. 진입과 발전기 가동이 관건.",
          visibleInfo: ["1층 입구", "3층 지도", "안테나 설비"],
          actions: [
            { id: "office_enter", label: "구청 진입", kind: "check", stat: "STR", difficulty: 11, success: { log: "구청 내부로 진입했다." }, fail: { log: "진입 실패로 SAN -1", san: -1 } },
            { id: "office_antenna", label: "안테나 활성화", kind: "check", stat: "CRAFT", difficulty: 9, requires: ["연료"], success: { log: "안테나가 살아나 교신 가능 상태가 되었다." }, fail: { log: "안테나 가동 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        motel: {
          name: "모텔 서령장",
          zone: "B구역",
          risk: 2,
          summary: "배회자 존재. 은신 및 카드키 확보 가능.",
          visibleInfo: ["로비", "프런트 금고", "객실"],
          actions: [
            { id: "motel_card", label: "프런트 금고 조사", kind: "check", stat: "SLY", difficulty: 8, success: { log: "모텔 마스터 카드키를 확보했다.", grants: ["모텔 마스터 카드키"] }, fail: { log: "금고 해제 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        hardware: {
          name: "철물점·공구상",
          zone: "B구역",
          risk: 1,
          summary: "조합 핵심 재료 상점.",
          visibleInfo: ["매대", "창고"],
          actions: [
            { id: "hardware_basic", label: "기본 자재 확보", kind: "loot", log: "못과 철사, 쇠파이프를 챙겼다.", grants: ["못", "철사", "쇠파이프", "도끼"] },
            { id: "hardware_storage", label: "창고 조사", kind: "check", stat: "SLY", difficulty: 8, success: { log: "창고에서 강화 철판과 전선을 찾았다.", grants: ["강화 철판", "강화 철판", "전선", "절연 테이프"] }, fail: { log: "창고 조사 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        cathedral: {
          name: "서령성당",
          zone: "A′구역",
          risk: 1,
          summary: "SAN 회복 핵심 장소.",
          visibleInfo: ["본당", "집결 명단"],
          actions: [
            { id: "cathedral_rest", label: "성당에서 휴식", kind: "rest", san: 2, log: "마음을 추슬렀다. SAN +2" },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        hospital: {
          name: "하준종합병원",
          zone: "B′구역",
          risk: 4,
          summary: "고위험. 수술실과 헬기장이 핵심.",
          visibleInfo: ["1층 응급실", "2층 약품실", "3층 수술실", "8층 헬기장"],
          actions: [
            { id: "hospital_surgery", label: "3층 수술실 진입", kind: "check", stat: "SLY", difficulty: 11, success: { log: "수술 자원 확보 성공.", grants: ["수술 도구", "항생제", "항생제", "항생제", "항생제", "마취제"] }, fail: { log: "진입 실패. HP -2, SAN -1", hp: -2, san: -1, infectionCheck: true } },
            { id: "hospital_drugs", label: "2층 약품실 확보", kind: "check", stat: "SPD", difficulty: 9, success: { log: "혈액백, 수액, 감염 검사 키트를 찾았다.", grants: ["혈액백", "수액", "감염 검사 키트"] }, fail: { log: "약품실 접근 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        police: {
          name: "하준경찰서",
          zone: "B′구역",
          risk: 2,
          summary: "무기고 및 통신실 확보 지점.",
          visibleInfo: ["유치장", "3층 무기고", "통신실"],
          actions: [
            { id: "police_armory", label: "무기고 진입", kind: "check", stat: "STR", difficulty: 11, success: { log: "권총과 탄약, 방탄조끼를 확보했다.", grants: ["K5 권총", "9mm 탄약", "방탄조끼"] }, fail: { log: "무기고 문을 열지 못했다." } },
            { id: "police_radio", label: "경찰 무전 시스템 연결", kind: "check", stat: "CRAFT", difficulty: 9, success: { log: "의용군 채널과 연결했다." }, fail: { log: "무전 연결 실패." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        chem_warehouse: {
          name: "화학 창고군",
          zone: "C구역",
          risk: 4,
          summary: "HV-7 누출 추정 고위험 지역. 방호복 권장.",
          visibleInfo: ["1층 로커", "2층 연구실"],
          actions: [
            { id: "chem_suit", label: "방호복 회수", kind: "loot", log: "방호복을 회수했다.", grants: ["방호복", "방호복"] },
            { id: "chem_research", label: "연구실 조사", kind: "check", stat: "WIL", difficulty: 11, success: { log: "연구 일지와 혈청 원료를 확보했다.", grants: ["연구 일지", "HV-7 원료"] }, fail: { log: "누출 구역 스트레스로 SAN -1 및 감염 판정", san: -1, infectionCheck: true } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        rail_station: {
          name: "서령역",
          zone: "E구역",
          risk: 3,
          summary: "열차 탈출 루트 핵심.",
          visibleInfo: ["플랫폼", "수리 대상 열차"],
          actions: [
            { id: "rail_repair", label: "열차 수리 시도", kind: "check", stat: "CRAFT", difficulty: 11, requires: ["철도 부품", "연료"], success: { log: "열차 탈출 루트 준비 완료." }, fail: { log: "열차 수리에 실패했다." } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        },
        checkpoint: {
          name: "군 임시 검문소",
          zone: "F구역",
          risk: 3,
          summary: "군용 무기 및 험비 확보 가능.",
          visibleInfo: ["폐쇄 검문소", "군용 창고", "험비"],
          actions: [
            { id: "checkpoint_loot", label: "군 장비 확보", kind: "check", stat: "STR", difficulty: 11, success: { log: "군용 소총과 탄약, 장거리 무전기를 확보했다.", grants: ["K2 소총", "5.56mm 탄약", "장거리 군용 무전기", "험비"] }, fail: { log: "방호구를 입은 전환 군인에게 밀려 HP -2", hp: -2, infectionCheck: true } },
            { id: "move", label: "다른 위치로 이동", kind: "move" }
          ]
        }
      },
      travelMap: {
        annex_clinic: ["seoryeong_school", "apartment_a", "gs25"],
        seoryeong_school: ["annex_clinic", "apartment_a", "gs25", "church", "park_garden"],
        apartment_a: ["seoryeong_school", "annex_clinic", "mart"],
        gs25: ["seoryeong_school", "church", "mart"],
        church: ["seoryeong_school", "park_garden", "gs25"],
        park_garden: ["church", "seoryeong_school", "mart"],
        mart: ["gs25", "apartment_a", "pharmacy", "hardware", "ward_office", "motel"],
        pharmacy: ["mart", "ward_office", "hardware"],
        hardware: ["mart", "pharmacy", "motel"],
        ward_office: ["mart", "pharmacy", "motel", "cathedral"],
        motel: ["mart", "ward_office", "hardware", "cathedral"],
        cathedral: ["ward_office", "motel", "hospital", "police"],
        hospital: ["cathedral", "police", "chem_warehouse"],
        police: ["cathedral", "hospital", "rail_station"],
        chem_warehouse: ["hospital", "checkpoint"],
        rail_station: ["police", "checkpoint"],
        checkpoint: ["rail_station", "chem_warehouse"]
      }
    },
    {
      id: "quarantine",
      name: "QUARANTINE ZONE — 하성고 생존 시뮬레이터",
      description: "하성고 봉쇄 시나리오와 외부 탐색지 기반.",
      startLocations: ["haseong_high", "convenience_alley", "apartment_complex"],
      locations: {
        haseong_high: {
          name: "하성고등학교",
          zone: "학교",
          risk: 2,
          summary: "발발 시작점. 방송실과 지하 보일러실이 중요.",
          visibleInfo: ["본관", "체육관", "방송실", "지하 보일러실"],
          actions: [
            { id: "school_search", label: "교내 수색", kind: "loot", log: "교내 생존 자원을 모았다.", grants: ["배터리", "라이터", "가공식품"] },
            { id: "school_signal", label: "방송실 수신기 점검", kind: "check", stat: "CRAFT", difficulty: 9, success: { log: "외부 신호 단편을 수신했다." }, fail: { log: "장비가 불안정하다." } },
            { id: "school_boiler", label: "지하 보일러실 조사", kind: "check", stat: "SLY", difficulty: 9, success: { log: "비상 통신 장비를 발견했다.", grants: ["비상 통신 장비"] }, fail: { log: "지하 접근 실패." } },
            { id: "move", label: "외부 탐색지로 이동", kind: "move" }
          ]
        },
        convenience_alley: {
          name: "편의점 골목",
          zone: "외부 탐색 A",
          risk: 2,
          summary: "GS 편의점과 공중전화, 쓰레기통 군집이 있는 구역.",
          visibleInfo: ["편의점", "공중전화", "골목 쓰레기통"],
          actions: [
            { id: "alley_store", label: "편의점 수색", kind: "loot", log: "식량과 배터리를 챙겼다.", grants: ["가공식품", "음료", "배터리", "라이터"] },
            { id: "alley_phone", label: "공중전화 시도", kind: "event", log: "공중전화 수화기를 들어본다.", event: "phoneAttempt" },
            { id: "move", label: "다른 탐색지로 이동", kind: "move" }
          ]
        },
        apartment_complex: {
          name: "아파트 단지",
          zone: "외부 탐색 B",
          risk: 2,
          summary: "주공 101~103동. 생존자 및 연료 후보.",
          visibleInfo: ["옥상", "지하주차장", "관리사무소"],
          actions: [
            { id: "apt_manage", label: "관리사무소 조사", kind: "check", stat: "SLY", difficulty: 9, success: { log: "마스터 열쇠를 찾았다.", grants: ["마스터 열쇠"] }, fail: { log: "서랍은 비어 있거나 잠겨 있다." } },
            { id: "apt_parking", label: "지하주차장 탐색", kind: "check", stat: "SPD", difficulty: 9, success: { log: "연료 잔존 차량을 발견했다.", grants: ["연료"] }, fail: { log: "주차장 탐색 실패." } },
            { id: "move", label: "다른 탐색지로 이동", kind: "move" }
          ]
        },
        abandoned_hospital: {
          name: "폐병원",
          zone: "외부 탐색 C",
          risk: 5,
          summary: "최고 위험도. 항생제와 의료 장비의 보고.",
          visibleInfo: ["응급실", "너스 스테이션", "지하 약품고"],
          actions: [
            { id: "abh_er", label: "응급실 처치실 수색", kind: "check", stat: "WIL", difficulty: 11, success: { log: "항생제와 진통제를 확보했다.", grants: ["항생제", "진통제"] }, fail: { log: "기억형 감염자와 조우. HP -2 / 감염 판정", hp: -2, infectionCheck: true } },
            { id: "move", label: "다른 탐색지로 이동", kind: "move" }
          ]
        },
        old_blocks: {
          name: "골목 · 폐건물군",
          zone: "외부 탐색 D",
          risk: 3,
          summary: "시야가 나쁜 폐상가와 미로형 골목.",
          visibleInfo: ["폐상가", "창고", "옥상 사다리"],
          actions: [
            { id: "old_search", label: "폐상가 수색", kind: "loot", log: "공구와 철재, 캠핑용품을 찾았다.", grants: ["공구", "철재", "캠핑용품"] },
            { id: "move", label: "다른 탐색지로 이동", kind: "move" }
          ]
        }
      },
      travelMap: {
        haseong_high: ["convenience_alley", "apartment_complex", "abandoned_hospital", "old_blocks"],
        convenience_alley: ["haseong_high", "apartment_complex", "old_blocks"],
        apartment_complex: ["haseong_high", "convenience_alley", "abandoned_hospital"],
        abandoned_hospital: ["haseong_high", "apartment_complex", "old_blocks"],
        old_blocks: ["haseong_high", "convenience_alley", "abandoned_hospital"]
      }
    }
  ]
};
