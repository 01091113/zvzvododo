(() => {
  "use strict";

  const world = window.SIM_WORLD;
  const state = {
    run: null,
    tab: "locations"
  };

  const els = {
    scenarioSelect: document.getElementById("scenarioSelect"),
    startLocationSelect: document.getElementById("startLocationSelect"),
    archetypeSelect: document.getElementById("archetypeSelect"),
    statInputs: document.getElementById("statInputs"),
    playerName: document.getElementById("playerName"),
    companionName: document.getElementById("companionName"),
    enableCompanion: document.getElementById("enableCompanion"),
    startBtn: document.getElementById("startBtn"),
    newRunBtn: document.getElementById("newRunBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    saveFileInput: document.getElementById("saveFileInput"),
    statusBox: document.getElementById("statusBox"),
    hpMeter: document.getElementById("hpMeter"),
    sanMeter: document.getElementById("sanMeter"),
    hungerMeter: document.getElementById("hungerMeter"),
    waterMeter: document.getElementById("waterMeter"),
    infectionMeter: document.getElementById("infectionMeter"),
    hpText: document.getElementById("hpText"),
    sanText: document.getElementById("sanText"),
    hungerText: document.getElementById("hungerText"),
    waterText: document.getElementById("waterText"),
    infectionText: document.getElementById("infectionText"),
    locationCard: document.getElementById("locationCard"),
    inventoryCard: document.getElementById("inventoryCard"),
    actionsCard: document.getElementById("actionsCard"),
    craftCard: document.getElementById("craftCard"),
    log: document.getElementById("log"),
    codexContent: document.getElementById("codexContent"),
    tabs: [...document.querySelectorAll(".tab")]
  };

  const statKeys = ["STR", "SPD", "SLY", "WIL", "KNO", "CRAFT", "SOC"];
  const statLabels = {
    STR: "체력/근력", SPD: "속도", SLY: "은밀", WIL: "의지", KNO: "지식", CRAFT: "제작", SOC: "사교"
  };

  function init() {
    fillScenarioOptions();
    fillArchetypes();
    renderStatInputs(world.archetypes[0].stats);
    bindEvents();
    refreshCodex();
    updateStartLocations();
  }

  function fillScenarioOptions() {
    els.scenarioSelect.innerHTML = world.scenarios.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  }

  function fillArchetypes() {
    els.archetypeSelect.innerHTML = world.archetypes.map(a => `<option value="${a.key}">${a.name}</option>`).join("");
  }

  function renderStatInputs(stats) {
    els.statInputs.innerHTML = statKeys.map(key => `
      <label>${statLabels[key]}
        <input type="number" min="1" max="5" step="1" data-stat="${key}" value="${stats[key] ?? 1}" />
      </label>
    `).join("");
  }

  function bindEvents() {
    els.scenarioSelect.addEventListener("change", updateStartLocations);
    els.archetypeSelect.addEventListener("change", () => {
      const archetype = world.archetypes.find(a => a.key === els.archetypeSelect.value);
      renderStatInputs(archetype.stats);
    });
    els.startBtn.addEventListener("click", startRun);
    els.newRunBtn.addEventListener("click", startRun);
    els.exportBtn.addEventListener("click", exportSave);
    els.importBtn.addEventListener("click", () => els.saveFileInput.click());
    els.saveFileInput.addEventListener("change", importSave);
    els.tabs.forEach(tab => tab.addEventListener("click", () => {
      state.tab = tab.dataset.tab;
      els.tabs.forEach(t => t.classList.toggle("active", t === tab));
      refreshCodex();
    }));
  }

  function updateStartLocations() {
    const scenario = getScenario();
    els.startLocationSelect.innerHTML = scenario.startLocations.map(id => {
      const loc = scenario.locations[id];
      return `<option value="${id}">${loc.name}</option>`;
    }).join("");
  }

  function getScenario() {
    return world.scenarios.find(s => s.id === els.scenarioSelect.value) || world.scenarios[0];
  }

  function collectStats() {
    const stats = {};
    [...els.statInputs.querySelectorAll("input[data-stat]")].forEach(input => {
      const value = Number(input.value);
      stats[input.dataset.stat] = Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : 1;
    });
    return stats;
  }

  function startRun() {
    const scenario = getScenario();
    state.run = {
      id: `run-${Date.now()}`,
      scenarioId: scenario.id,
      locationId: els.startLocationSelect.value,
      day: 1,
      turn: 1,
      actionCount: 0,
      player: {
        name: (els.playerName.value || "플레이어").trim(),
        companionName: (els.enableCompanion.checked ? (els.companionName.value || "동행자") : null),
        stats: collectStats(),
        hp: 10,
        san: 10,
        hunger: 10,
        water: 10,
        infection: 0,
        status: "정상"
      },
      inventory: [],
      flags: {},
      bonuses: {},
      log: []
    };
    log(`시뮬레이션 시작: ${scenario.name}`);
    log(`현재 위치: ${currentLocation().name}`);
    render();
  }

  function currentScenario() {
    if (!state.run) return getScenario();
    return world.scenarios.find(s => s.id === state.run.scenarioId);
  }

  function currentLocation() {
    const scenario = currentScenario();
    return scenario.locations[state.run.locationId];
  }

  function render() {
    renderStatus();
    renderLocation();
    renderInventory();
    renderActions();
    renderCrafts();
    renderLog();
    refreshCodex();
  }

  function renderStatus() {
    const run = state.run;
    if (!run) {
      els.statusBox.innerHTML = `<div class="small">시뮬레이션을 시작해.</div>`;
      return;
    }
    const p = run.player;
    els.statusBox.innerHTML = `
      <div><span class="tag">D${run.day}</span><span class="tag">턴 ${run.turn}</span><span class="tag">${p.name}</span>${p.companionName ? `<span class="tag ok">동행: ${p.companionName}</span>` : ``}</div>
      <div class="small">상태: ${p.status}</div>
    `;
    syncMeter(els.hpMeter, els.hpText, p.hp, 10);
    syncMeter(els.sanMeter, els.sanText, p.san, 10);
    syncMeter(els.hungerMeter, els.hungerText, p.hunger, 10);
    syncMeter(els.waterMeter, els.waterText, p.water, 10);
    syncMeter(els.infectionMeter, els.infectionText, p.infection, 5);
  }

  function syncMeter(meter, text, value, max) {
    meter.max = max;
    meter.value = Math.max(0, Math.min(max, value));
    text.textContent = `${Math.max(0, value)} / ${max}`;
  }

  function renderLocation() {
    if (!state.run) {
      els.locationCard.innerHTML = `<div class="small">시작 전</div>`;
      return;
    }
    const loc = currentLocation();
    els.locationCard.innerHTML = `
      <div><span class="tag">${loc.zone}</span><span class="tag ${loc.risk >= 4 ? 'danger' : ''}">위험도 ★${loc.risk}</span></div>
      <h3>${loc.name}</h3>
      <p>${loc.summary}</p>
      <div class="small">보이는 조사 포인트: ${loc.visibleInfo.join(", ")}</div>
    `;
  }

  function renderInventory() {
    if (!state.run) {
      els.inventoryCard.innerHTML = `<div class="small">아이템 없음</div>`;
      return;
    }
    const inventory = aggregateInventory(state.run.inventory);
    const items = Object.entries(inventory);
    els.inventoryCard.innerHTML = items.length ? `<ul>${items.map(([name, qty]) => `<li>${name} × ${qty}</li>`).join("")}</ul>` : `<div class="small">아이템 없음</div>`;
  }

  function renderActions() {
    if (!state.run) {
      els.actionsCard.innerHTML = `<div class="small">행동 없음</div>`;
      return;
    }
    const loc = currentLocation();
    els.actionsCard.innerHTML = "";
    loc.actions.forEach(action => {
      const btn = document.createElement("button");
      btn.className = "action-btn";
      btn.textContent = action.label;
      btn.addEventListener("click", () => executeAction(action));
      els.actionsCard.appendChild(btn);
    });
  }

  function renderCrafts() {
    if (!state.run) {
      els.craftCard.innerHTML = `<div class="small">제작 불가</div>`;
      return;
    }
    const available = world.recipes.filter(canCraftRecipe);
    els.craftCard.innerHTML = "";
    const treatBtn = document.createElement("button");
    treatBtn.className = "action-btn";
    treatBtn.textContent = "휴식";
    treatBtn.addEventListener("click", () => doRest());
    els.craftCard.appendChild(treatBtn);

    const eatBtn = document.createElement("button");
    eatBtn.className = "action-btn";
    eatBtn.textContent = "통조림 섭취";
    eatBtn.addEventListener("click", () => consumeItem("통조림", { hunger: 3, log: "통조림을 먹고 포만도를 회복했다." }));
    els.craftCard.appendChild(eatBtn);

    const waterBtn = document.createElement("button");
    waterBtn.className = "action-btn";
    waterBtn.textContent = "물 섭취";
    waterBtn.addEventListener("click", () => consumeItem("물", { water: 3, log: "물을 마셨다." }));
    els.craftCard.appendChild(waterBtn);

    available.forEach(recipe => {
      const btn = document.createElement("button");
      btn.className = "action-btn";
      btn.textContent = `제작: ${recipe.name}`;
      btn.addEventListener("click", () => craftRecipe(recipe));
      els.craftCard.appendChild(btn);
    });
    if (!available.length) {
      const div = document.createElement("div");
      div.className = "small";
      div.textContent = "현재 제작 가능한 레시피 없음";
      els.craftCard.appendChild(div);
    }
  }

  function executeAction(action) {
    if (!state.run) return;
    if (action.once && flag(action.id)) {
      log(`${action.label}: 이미 처리했다.`);
      render();
      return;
    }
    if (action.requires && !action.requires.every(hasItem)) {
      log(`${action.label}: 필요한 아이템이 부족하다. (${action.requires.join(", ")})`);
      render();
      return;
    }

    switch (action.kind) {
      case "loot":
        if (action.grants) addItems(action.grants);
        if (action.log) log(action.log);
        if (action.bonus) applyBonus(action.bonus);
        setFlag(action.id, true);
        progressTime();
        break;
      case "check":
        runCheck(action);
        break;
      case "rest":
        if (typeof action.hp === "number") state.run.player.hp = clamp(state.run.player.hp + action.hp, 0, 10);
        if (typeof action.san === "number") state.run.player.san = clamp(state.run.player.san + action.san, 0, 10);
        log(action.log || "휴식했다.");
        progressTime();
        break;
      case "event":
        triggerEvent(action.event, action);
        setFlag(action.id, true);
        progressTime();
        break;
      case "move":
        openMoveMenu();
        return;
      default:
        log("아직 구현되지 않은 행동이다.");
    }
    render();
  }

  function runCheck(action) {
    const statValue = getStat(action.stat);
    const roll = d6() + d6() + statValue;
    const passed = roll >= action.difficulty;
    log(`${action.label} 판정: 2D6 + ${action.stat}(${statValue}) = ${roll} / 목표 ${action.difficulty}`);
    const result = passed ? action.success : action.fail;
    if (result?.log) log(result.log);
    if (result?.grants) addItems(result.grants);
    if (typeof result?.hp === "number") state.run.player.hp = clamp(state.run.player.hp + result.hp, 0, 10);
    if (typeof result?.san === "number") state.run.player.san = clamp(state.run.player.san + result.san, 0, 10);
    if (result?.infectionCheck) triggerInfectionCheck();
    if (passed && action.bonus) applyBonus(action.bonus);
    if (passed && action.once) setFlag(action.id, true);
    progressTime();
  }

  function triggerEvent(eventKey, action) {
    if (eventKey === "schoolFreezer") {
      const powerOn = d6() >= 5;
      if (powerOn) {
        addItems(["냉동 육류"]);
        log("냉동고 전력이 살아 있었다. 신선한 냉동 육류를 확보했다.");
      } else {
        addItems(["부패한 냉동 육류"]);
        log("전력이 꺼져 있었다. 부패 판정이 진행된 육류를 챙겼다.");
      }
      return;
    }
    if (eventKey === "phoneAttempt") {
      const connected = d6() === 6;
      log(connected ? "순간적으로 잡음 섞인 외부 신호를 들었다." : "전화선은 죽어 있었다.");
      return;
    }
    log(action?.log || "이벤트가 발생했다.");
  }

  function openMoveMenu() {
    const scenario = currentScenario();
    const currentId = state.run.locationId;
    const options = scenario.travelMap[currentId] || [];
    els.actionsCard.innerHTML = "";
    options.forEach(id => {
      const loc = scenario.locations[id];
      const btn = document.createElement("button");
      btn.className = "action-btn";
      btn.textContent = `이동: ${loc.name}`;
      btn.addEventListener("click", () => {
        state.run.locationId = id;
        log(`${loc.name}(으)로 이동했다.`);
        progressTime();
        render();
      });
      els.actionsCard.appendChild(btn);
    });
    const cancel = document.createElement("button");
    cancel.className = "action-btn";
    cancel.textContent = "이동 취소";
    cancel.addEventListener("click", renderActions);
    els.actionsCard.appendChild(cancel);
  }

  function progressTime() {
    const p = state.run.player;
    state.run.actionCount += 1;
    state.run.turn += 1;
    p.hunger = clamp(p.hunger - 1, 0, 10);
    p.water = clamp(p.water - 1, 0, 10);
    if (state.run.actionCount % world.systems.time.dayAdvanceEvery === 0) {
      state.run.day += 1;
      log(`날짜 진행: D${state.run.day}`);
    }
    if (p.hunger === 0) {
      p.hp = clamp(p.hp - 1, 0, 10);
      log("포만도 고갈로 HP -1");
    }
    if (p.water === 0) {
      p.hp = clamp(p.hp - 1, 0, 10);
      log("수분 고갈로 HP -1");
    }
    if (p.infection >= 3) p.status = "증상 진행";
    if (p.infection >= 5) p.status = "전환 직전";
    if (p.hp <= 0) {
      p.status = "실신";
      log("HP 0. 생존 실패 상태다.");
    }
  }

  function doRest() {
    if (!state.run) return;
    state.run.player.hp = clamp(state.run.player.hp + 1, 0, 10);
    state.run.player.san = clamp(state.run.player.san + 1, 0, 10);
    log("잠시 숨을 고르며 상태를 정비했다.");
    progressTime();
    render();
  }

  function consumeItem(name, effect) {
    if (!removeItem(name, 1)) {
      log(`${name}이 없다.`);
      return;
    }
    if (effect.hunger) state.run.player.hunger = clamp(state.run.player.hunger + effect.hunger, 0, 10);
    if (effect.water) state.run.player.water = clamp(state.run.player.water + effect.water, 0, 10);
    if (effect.hp) state.run.player.hp = clamp(state.run.player.hp + effect.hp, 0, 10);
    if (effect.log) log(effect.log);
    render();
  }

  function canCraftRecipe(recipe) {
    const inv = aggregateInventory(state.run.inventory);
    const temp = { ...inv };
    for (const part of recipe.requires) {
      if (!temp[part]) return false;
      temp[part] -= 1;
    }
    return true;
  }

  function craftRecipe(recipe) {
    if (!canCraftRecipe(recipe)) {
      log(`제작 실패: ${recipe.name} 재료 부족`);
      return;
    }
    recipe.requires.forEach(item => removeItem(item, 1));
    addItems([recipe.name]);
    log(`${recipe.name} 제작 성공 — ${recipe.effect}`);
    progressTime();
    render();
  }

  function triggerInfectionCheck() {
    const stat = getStat("WIL");
    const roll = d6() + d6() + stat;
    const gain = roll >= 10 ? 1 : 2;
    state.run.player.infection = clamp(state.run.player.infection + gain, 0, 5);
    log(`감염 판정: 2D6 + WIL(${stat}) = ${roll} → 감염도 +${gain}`);
  }

  function applyBonus(bonus) {
    if (bonus.maxOnce && state.run.bonuses[bonus.stat]) return;
    state.run.player.stats[bonus.stat] = (state.run.player.stats[bonus.stat] || 0) + bonus.value;
    state.run.bonuses[bonus.stat] = true;
    log(`${bonus.stat} 능력치 +${bonus.value}`);
  }

  function addItems(items) {
    items.forEach(item => state.run.inventory.push(item));
  }

  function removeItem(name, qty) {
    let remaining = qty;
    const next = [];
    for (const item of state.run.inventory) {
      if (item === name && remaining > 0) {
        remaining -= 1;
      } else {
        next.push(item);
      }
    }
    if (remaining > 0) return false;
    state.run.inventory = next;
    return true;
  }

  function hasItem(name) {
    return state.run.inventory.includes(name);
  }

  function aggregateInventory(list) {
    return list.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  function flag(key) {
    return !!state.run.flags[key];
  }

  function setFlag(key, value) {
    state.run.flags[key] = value;
  }

  function getStat(key) {
    return state.run.player.stats[key] || 0;
  }

  function log(text) {
    if (!state.run) return;
    state.run.log.unshift({ time: new Date().toISOString(), text });
  }

  function renderLog() {
    if (!state.run) {
      els.log.innerHTML = `<div class="small">로그 없음</div>`;
      return;
    }
    els.log.innerHTML = state.run.log.map(entry => `<div class="log-entry">${escapeHtml(entry.text)}</div>`).join("");
  }

  function refreshCodex() {
    if (state.tab === "locations") {
      const blocks = world.scenarios.map(s => {
        const body = Object.values(s.locations).map(loc => `• ${loc.name} [${loc.zone}]\n  - 위험도: ★${loc.risk}\n  - ${loc.summary}\n  - 조사 포인트: ${loc.visibleInfo.join(", ")}`).join("\n\n");
        return `${s.name}\n${body}`;
      }).join("\n\n====================\n\n");
      els.codexContent.textContent = blocks;
      return;
    }
    if (state.tab === "systems") {
      els.codexContent.textContent = [
        `[버전] ${world.meta.version}`,
        `[판정식] ${world.systems.roll.formula}`,
        `[기본 목표치] 쉬움 ${world.systems.roll.defaultTargets.easy} / 보통 ${world.systems.roll.defaultTargets.normal} / 어려움 ${world.systems.roll.defaultTargets.hard}`,
        `[감염 단계] ${world.systems.infection.stages.join(" | ")}`,
        `[감염 대처] ${world.systems.infection.treatment.join(" / ")}`,
        `\n[추가 설계 메모]`,
        ...world.meta.addedNotes.map(line => `- ${line}`),
        `\n[전체 레시피]`,
        ...world.recipes.map(r => `- ${r.name}: ${r.requires.join(", ")} → ${r.effect}`)
      ].join("\n");
      return;
    }
    if (state.tab === "npcs") {
      els.codexContent.textContent = world.npcs.map(npc => `• ${npc.name} (${npc.from})\n  - 역할: ${npc.role}\n  - 메모: ${npc.note}`).join("\n\n");
      return;
    }
    if (state.tab === "sources") {
      els.codexContent.textContent = [
        "프로젝트에 포함된 원문 파일:",
        "- /sources/deadzone_source.txt",
        "- /sources/quarantine_zone_source.txt",
        "\n설명 파일:",
        "- /docs/README.txt",
        "- /docs/UPDATE_NOTES.txt",
        "- /docs/BUILD_AND_DEPLOY.txt"
      ].join("\n");
    }
  }

  function exportSave() {
    if (!state.run) return;
    const blob = new Blob([JSON.stringify(state.run, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sim-save-${state.run.scenarioId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importSave(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.run = JSON.parse(String(reader.result));
      render();
    };
    reader.readAsText(file, "utf-8");
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function d6() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  init();
})();
