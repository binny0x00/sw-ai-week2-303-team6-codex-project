const canvas = document.getElementById("worldCanvas");
const ctx = canvas.getContext("2d");

const ERA_DEFS = [
  { name: "원시 시대", threshold: 0, yearGate: 0, summary: "채집과 사냥으로 생존을 이어갑니다.", lifeExpectancy: 23, birthRate: 0.018 },
  { name: "불의 시대", threshold: 22, yearGate: 12, summary: "공동 불씨가 밤의 활동을 가능하게 합니다.", lifeExpectancy: 27, birthRate: 0.019 },
  { name: "석기 시대", threshold: 44, yearGate: 28, summary: "돌도구와 작업장이 생산성을 끌어올립니다.", lifeExpectancy: 31, birthRate: 0.0205 },
  { name: "농경 시대", threshold: 74, yearGate: 55, summary: "밭, 곡물창고, 가축 우리가 정착을 만듭니다.", lifeExpectancy: 39, birthRate: 0.024 },
  { name: "고대 도시 시대", threshold: 110, yearGate: 90, summary: "시장과 부두, 다리가 문명의 흐름을 넓힙니다.", lifeExpectancy: 47, birthRate: 0.021 },
  { name: "중세 왕국 시대", threshold: 150, yearGate: 135, summary: "풍차, 성벽, 장인 문화가 도시를 다듬습니다.", lifeExpectancy: 56, birthRate: 0.0175 },
  { name: "산업 혁명 시대", threshold: 195, yearGate: 185, summary: "공장과 철도가 세상을 빠르게 연결합니다.", lifeExpectancy: 65, birthRate: 0.0145 },
  { name: "현대 시대", threshold: 245, yearGate: 260, summary: "전력, 병원, 학교, 도로와 네트워크가 완성됩니다.", lifeExpectancy: 73, birthRate: 0.0125 }
];

const ROLE_META = {
  forager: { label: "채집자", color: "#3f2d21" },
  hunter: { label: "사냥꾼", color: "#5b2d22" },
  fisher: { label: "어부", color: "#20506d" },
  lumberjack: { label: "나무꾼", color: "#5e4428" },
  farmer: { label: "농부", color: "#7a5b22" },
  herder: { label: "목동", color: "#704032" },
  builder: { label: "건축자", color: "#6f3c1f" },
  miner: { label: "광부", color: "#6c6c74" },
  artisan: { label: "장인", color: "#7b4b2c" },
  trader: { label: "상인", color: "#874f25" },
  scholar: { label: "학자", color: "#544983" },
  engineer: { label: "기술자", color: "#275a78" },
  medic: { label: "의료인", color: "#9a4040" },
  guard: { label: "수호자", color: "#514633" },
  driver: { label: "운송가", color: "#303843" },
  wanderer: { label: "탐색자", color: "#4a4a35" }
};

const TASK_VISUALS = {
  idle: { color: "#f1dcb7", accent: "rgba(241, 220, 183, 0.18)" },
  wander: { color: "#b9d3c0", accent: "rgba(185, 211, 192, 0.18)" },
  warm: { color: "#f7b15d", accent: "rgba(247, 177, 93, 0.2)" },
  eat: { color: "#efcf76", accent: "rgba(239, 207, 118, 0.2)" },
  heal: { color: "#e57a7a", accent: "rgba(229, 122, 122, 0.2)" },
  forage: { color: "#76c96d", accent: "rgba(118, 201, 109, 0.22)" },
  lumber: { color: "#b57a4d", accent: "rgba(181, 122, 77, 0.2)" },
  hunt: { color: "#ef9a6f", accent: "rgba(239, 154, 111, 0.22)" },
  fish: { color: "#88d0ff", accent: "rgba(136, 208, 255, 0.22)" },
  farm: { color: "#e3d56d", accent: "rgba(227, 213, 109, 0.22)" },
  herd: { color: "#f5dfc9", accent: "rgba(245, 223, 201, 0.2)" },
  build: { color: "#ffbf72", accent: "rgba(255, 191, 114, 0.2)" },
  mine: { color: "#b4b8ca", accent: "rgba(180, 184, 202, 0.22)" },
  craft: { color: "#f0b36e", accent: "rgba(240, 179, 110, 0.2)" },
  trade: { color: "#f1a77d", accent: "rgba(241, 167, 125, 0.2)" },
  study: { color: "#bba9ff", accent: "rgba(187, 169, 255, 0.2)" },
  power: { color: "#7fdfff", accent: "rgba(127, 223, 255, 0.24)" },
  guard: { color: "#d8c786", accent: "rgba(216, 199, 134, 0.2)" },
  drive: { color: "#8bb3d8", accent: "rgba(139, 179, 216, 0.2)" }
};

const ROLE_SCHEMES = [
  ["forager", "forager", "hunter", "fisher", "lumberjack", "wanderer"],
  ["forager", "hunter", "fisher", "lumberjack", "builder", "wanderer"],
  ["forager", "hunter", "fisher", "lumberjack", "builder", "miner", "artisan"],
  ["farmer", "farmer", "herder", "fisher", "builder", "lumberjack", "miner", "artisan", "hunter", "forager"],
  ["farmer", "herder", "fisher", "builder", "builder", "miner", "trader", "scholar", "hunter", "artisan"],
  ["farmer", "herder", "builder", "builder", "miner", "trader", "scholar", "artisan", "guard", "hunter", "fisher"],
  ["farmer", "builder", "miner", "artisan", "trader", "engineer", "engineer", "scholar", "medic", "guard", "fisher", "herder"],
  ["farmer", "engineer", "engineer", "trader", "medic", "medic", "scholar", "builder", "driver", "driver", "guard", "fisher", "herder"]
];

const disasterConfigs = {
  rain: { label: "비", duration: 14, color: "rgba(90, 129, 180, 0.22)" },
  snow: { label: "폭설", duration: 12, color: "rgba(240, 246, 255, 0.24)" },
  drought: { label: "가뭄", duration: 18, color: "rgba(194, 157, 95, 0.18)" },
  landslide: { label: "산사태", duration: 10, color: "rgba(120, 83, 57, 0.22)" },
  disease: { label: "질병", duration: 16, color: "rgba(167, 83, 67, 0.18)" }
};

const DINOSAUR_DEFS = {
  triceratops: {
    label: "트리케라톱스",
    diet: "herbivore",
    zone: { x: 748, y: 246, spread: 112, size: 26, speed: 0.017 },
    interactionRadius: 30,
    maxHealth: 180,
    counterRadius: 74,
    counterThreshold: 8.2,
    rewardFood: 8.5
  },
  tyrannosaurus: {
    label: "티라노사우루스",
    diet: "carnivore",
    zone: { x: 782, y: 220, spread: 136, size: 28, speed: 0.021 },
    interactionRadius: 34,
    maxHealth: 165,
    counterRadius: 78,
    counterThreshold: 6.9,
    rewardFood: 6.5
  }
};

const DINOSAUR_COUNTER_ROLE_POWER = {
  wanderer: 0.65,
  forager: 0.7,
  hunter: 2.8,
  fisher: 0.95,
  lumberjack: 1.35,
  farmer: 0.85,
  herder: 1.2,
  builder: 1.25,
  miner: 1.65,
  artisan: 0.8,
  trader: 0.7,
  scholar: 0.55,
  engineer: 1.1,
  medic: 0.75,
  guard: 3.35,
  driver: 0.95
};

const DINOSAUR_COUNTER_ANIMAL_POWER = {
  deer: 0.55,
  boar: 1.35,
  wolf: 1.8,
  sheep: 0.35,
  cattle: 1.7,
  horse: 1.5
};

function isDinosaurSpecies(species) {
  return Boolean(DINOSAUR_DEFS[species]);
}

const ui = {
  playPauseBtn: document.getElementById("playPauseBtn"),
  restartBtn: document.getElementById("restartBtn"),
  startBtn: document.getElementById("startBtn"),
  startOverlay: document.getElementById("startOverlay"),
  speedButtons: [...document.querySelectorAll(".speed")],
  disasterButtons: [...document.querySelectorAll(".disaster")],
  dinosaurToggleBtn: document.getElementById("dinosaurToggleBtn"),
  population: document.getElementById("statPopulation"),
  lifeExpectancy: document.getElementById("statLifeExpectancy"),
  food: document.getElementById("statFood"),
  energy: document.getElementById("statEnergy"),
  wildlife: document.getElementById("statWildlife"),
  vegetation: document.getElementById("statVegetation"),
  structures: document.getElementById("statStructures"),
  era: document.getElementById("statEra"),
  eventLog: document.getElementById("eventLog"),
  unlockList: document.getElementById("unlockList"),
  interactionList: document.getElementById("interactionList"),
  activeDisasters: document.getElementById("activeDisasters"),
  focusKicker: document.getElementById("focusKicker"),
  focusTitle: document.getElementById("focusTitle"),
  focusDescription: document.getElementById("focusDescription")
};

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomFrom(rng, min, max) {
  return lerp(min, max, rng());
}

function pickWeighted(list, index) {
  return list[index % list.length];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pathPoint(path, t) {
  if (path.length === 1) return { x: path[0].x, y: path[0].y };
  const segments = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const length = dist(path[i], path[i + 1]);
    segments.push(length);
    total += length;
  }
  let target = (t % 1) * total;
  for (let i = 0; i < segments.length; i += 1) {
    if (target <= segments[i]) {
      const ratio = segments[i] === 0 ? 0 : target / segments[i];
      return {
        x: lerp(path[i].x, path[i + 1].x, ratio),
        y: lerp(path[i].y, path[i + 1].y, ratio)
      };
    }
    target -= segments[i];
  }
  return { x: path[path.length - 1].x, y: path[path.length - 1].y };
}

class CivilizationSim {
  constructor() {
    this.baseSeed = 781233;
    this.reset();
  }

  reset() {
    this.rng = createRng(this.baseSeed);
    this.nextPersonId = 0;
    this.nextAnimalId = 0;
    this.nextPlantId = 0;
    this.nextStructureId = 0;
    this.nextSiteId = 0;
    this.nextVehicleId = 0;
    this.running = false;
    this.started = false;
    this.speed = 2;
    this.timeYears = 0;
    this.weatherPulse = 0;
    this.eraIndex = 0;
    this.roleRefreshCooldown = 0;
    this.logs = [];
    this.focusTarget = null;
    this.interactionBursts = [];
    this.dinosaurLogCooldown = 0;
    this.flags = {};
    this.activeDisasters = [];
    this.landslideScars = [];
    this.constructionSites = [];
    this.routes = {
      road: [{ x: 240, y: 410 }, { x: 390, y: 420 }, { x: 560, y: 430 }, { x: 740, y: 460 }, { x: 860, y: 470 }],
      rail: [{ x: 560, y: 442 }, { x: 690, y: 442 }, { x: 830, y: 442 }, { x: 915, y: 442 }],
      river: [{ x: 500, y: 70 }, { x: 530, y: 160 }, { x: 515, y: 280 }, { x: 545, y: 390 }, { x: 600, y: 550 }]
    };
    this.resources = { food: 58, wood: 26, stone: 8, metal: 0, energy: 8, knowledge: 6 };
    this.ecology = { vegetation: 82, wildlife: 76, pollution: 4 };
    this.people = this.createPopulation(24, { ageMin: 8, ageMax: 24 });
    this.plants = this.createPlants();
    this.animals = this.createAnimals();
    this.structures = [];
    this.vehicles = [];
    this.initializeSettlement();
    this.rebalanceRoles(true);
    this.log("작은 부족이 계곡과 강가를 오가며 살아갈 터전을 찾습니다.");
    this.log("사람, 동물, 식물이 같은 공간에서 서로의 리듬을 만들기 시작합니다.");
    this.syncHooks();
    this.updateUi();
  }

  createPopulation(count, options = {}) {
    const ageMin = options.ageMin ?? 14;
    const ageMax = options.ageMax ?? 30;
    const hungerMin = options.hungerMin ?? 18;
    const hungerMax = options.hungerMax ?? 34;
    const energyMin = options.energyMin ?? 70;
    const energyMax = options.energyMax ?? 92;
    const warmthMin = options.warmthMin ?? 65;
    const warmthMax = options.warmthMax ?? 88;
    const healthMin = options.healthMin ?? 74;
    const healthMax = options.healthMax ?? 96;
    const people = [];
    for (let i = 0; i < count; i += 1) {
      people.push({
        id: this.nextPersonId++,
        x: randomFrom(this.rng, 180, 310),
        y: randomFrom(this.rng, 320, 430),
        homeX: randomFrom(this.rng, 220, 290),
        homeY: randomFrom(this.rng, 340, 420),
        roleKey: "forager",
        taskKey: "idle",
        taskLabel: "주변을 둘러보는 중",
        target: null,
        taskTimer: 0,
        taskDuration: 1.6,
        hunger: randomFrom(this.rng, hungerMin, hungerMax),
        energy: randomFrom(this.rng, energyMin, energyMax),
        warmth: randomFrom(this.rng, warmthMin, warmthMax),
        health: randomFrom(this.rng, healthMin, healthMax),
        age: randomFrom(this.rng, ageMin, ageMax),
        longevityBias: randomFrom(this.rng, -4.5, 4.5),
        resilience: randomFrom(this.rng, 0.9, 1.12),
        lifeExpectancy: 0,
        speedFactor: randomFrom(this.rng, 0.88, 1.14),
        alive: true,
        pulse: this.rng()
      });
    }
    return people;
  }

  createPlants() {
    const plants = [];
    for (let i = 0; i < 22; i += 1) plants.push(this.makePlant("tree", randomFrom(this.rng, 80, 355), randomFrom(this.rng, 110, 520), 85));
    for (let i = 0; i < 14; i += 1) plants.push(this.makePlant("berry", randomFrom(this.rng, 70, 360), randomFrom(this.rng, 150, 500), 72));
    for (let i = 0; i < 8; i += 1) plants.push(this.makePlant("herb", randomFrom(this.rng, 400, 560), randomFrom(this.rng, 120, 500), 76));
    return plants;
  }

  createAnimals() {
    const animals = [];
    for (let i = 0; i < 7; i += 1) animals.push(this.makeAnimal("deer"));
    for (let i = 0; i < 4; i += 1) animals.push(this.makeAnimal("boar"));
    for (let i = 0; i < 3; i += 1) animals.push(this.makeAnimal("wolf"));
    for (let i = 0; i < 8; i += 1) animals.push(this.makeAnimal("bird"));
    for (let i = 0; i < 12; i += 1) animals.push(this.makeAnimal("fish"));
    return animals;
  }

  makePlant(type, x, y, growth) {
    return { id: this.nextPlantId++, type, x, y, growth, maxGrowth: type === "tree" ? 100 : type === "crop" ? 95 : 90, regenRate: type === "tree" ? 0.05 : type === "crop" ? 0.09 : 0.07 };
  }

  makeAnimal(species, domestic = false, home = null) {
    const zone = home || this.randomZoneForSpecies(species, domestic);
    const dinosaur = DINOSAUR_DEFS[species];
    return {
      id: this.nextAnimalId++,
      species,
      domestic,
      x: zone.x + randomFrom(this.rng, -zone.spread, zone.spread),
      y: zone.y + randomFrom(this.rng, -zone.spread, zone.spread),
      homeX: zone.x,
      homeY: zone.y,
      spread: zone.spread,
      size: zone.size,
      speed: zone.speed,
      t: this.rng(),
      escape: 0,
      isDinosaur: Boolean(dinosaur),
      diet: dinosaur?.diet || null,
      attackCooldown: 0,
      counterCooldown: 0,
      maxHealth: dinosaur?.maxHealth || null,
      health: dinosaur ? dinosaur.maxHealth : null
    };
  }

  randomZoneForSpecies(species, domestic = false) {
    if (DINOSAUR_DEFS[species]) return { ...DINOSAUR_DEFS[species].zone };
    if (domestic) {
      if (species === "horse") return { x: 205, y: 460, spread: 32, size: 8, speed: 0.024 };
      return { x: 175, y: 470, spread: 28, size: 8, speed: 0.02 };
    }
    if (species === "fish") return { x: 525, y: 300, spread: 170, size: 6, speed: 0.04 };
    if (species === "bird") return { x: 260, y: 180, spread: 230, size: 5, speed: 0.03 };
    if (species === "wolf") return { x: 760, y: 230, spread: 120, size: 9, speed: 0.028 };
    if (species === "boar") return { x: 250, y: 290, spread: 120, size: 10, speed: 0.024 };
    return { x: 230, y: 280, spread: 140, size: 10, speed: 0.022 };
  }

  initializeSettlement() {
    this.addStructure("campfire", 250, 375, { key: "campfire-core", size: 18 });
    this.addStructure("tent", 205, 410, { key: "tent-a", size: 22 });
    this.addStructure("tent", 300, 408, { key: "tent-b", size: 20 });
    this.addStructure("totem", 258, 338, { key: "totem", size: 14 });
  }

  syncHooks() {
    window.render_game_to_text = () => JSON.stringify(this.buildTextState());
    window.advanceTime = (ms) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      const dt = ms / 1000 / steps;
      for (let i = 0; i < steps; i += 1) this.update(dt, true);
      this.render();
    };
  }

  buildTextState() {
    return {
      coordinateSystem: "origin top-left, +x right, +y down",
      running: this.running,
      started: this.started,
      speed: this.speed,
      year: Number(this.timeYears.toFixed(1)),
      era: this.getEra().name,
      civilizationScore: Number(this.computeCivilizationScore().toFixed(1)),
      population: this.getAlivePeople().length,
      averageHealth: Number(this.getAverageHealth().toFixed(1)),
      averageLifeExpectancy: Number(this.getAverageLifeExpectancy().toFixed(1)),
      dinosaurs: {
        active: this.hasDinosaurs(),
        total: this.countDinosaurs(),
        herbivores: this.countDinosaurs("herbivore"),
        carnivores: this.countDinosaurs("carnivore"),
        units: this.animals
          .filter((animal) => isDinosaurSpecies(animal.species))
          .map((animal) => ({
            species: animal.species,
            health: Number((animal.health || 0).toFixed(1)),
            maxHealth: animal.maxHealth
          }))
      },
      resources: { ...this.resources },
      ecology: { ...this.ecology },
      activeDisasters: this.activeDisasters.map((item) => item.type),
      counts: { structures: this.structures.length, animals: this.animals.length, plants: this.plants.length, vehicles: this.vehicles.length, sites: this.constructionSites.length },
      animalsBySpecies: this.countBy(this.animals, "species"),
      plantsByType: this.countBy(this.plants, "type"),
      focus: this.getFocusPayload(),
      currentInteractions: this.getInteractionNotes().slice(0, 5),
      recentEvents: this.logs.slice(0, 6)
    };
  }

  start() {
    this.started = true;
    this.running = true;
    ui.startOverlay.classList.add("hidden");
    this.syncHooks();
  }

  setSpeed(speed) {
    this.speed = speed;
    this.updateUi();
  }

  toggleRunning() {
    this.running = !this.running;
  }

  getEra() {
    return ERA_DEFS[this.eraIndex];
  }

  getAlivePeople() {
    return this.people.filter((person) => person.alive);
  }

  getAverageHealth() {
    return average(this.getAlivePeople().map((person) => person.health));
  }

  countDinosaurs(diet = null) {
    return this.animals.filter((animal) => isDinosaurSpecies(animal.species) && (!diet || DINOSAUR_DEFS[animal.species].diet === diet)).length;
  }

  hasDinosaurs() {
    return this.countDinosaurs() > 0;
  }

  getShelterCapacity() {
    return this.countStructures("tent") * 5 + this.countStructures("hut") * 7 + this.countStructures("hall") * 16 + this.countStructures("apartment") * 18 + this.countStructures("hospital") * 8;
  }

  getPopulationCapacity() {
    return 18 + this.eraIndex * 4 + this.countStructures("tent") * 2 + this.countStructures("hut") * 5 + this.countStructures("granary") * 5 + this.countStructures("hall") * 12 + this.countStructures("apartment") * 18;
  }

  getDemographicContext(alive = this.getAlivePeople()) {
    const population = Math.max(alive.length, 1);
    const shelterCoverage = clamp(this.getShelterCapacity() / population, 0, 1.45);
    const foodPerPerson = this.resources.food / population;
    const foodSecurity = clamp(foodPerPerson / (this.flags.agriculture ? 10.5 : 9), 0, 1.15);
    const sanitationIndex = clamp(
      (this.flags.fireAge ? 0.18 : 0)
      + this.countStructures("granary") * 0.16
      + this.countStructures("windmill") * 0.08
      + this.countStructures("hall") * 0.14
      + this.countStructures("school") * 0.16
      + this.countStructures("hospital") * 0.22
      + this.countStructures("apartment") * 0.12
      + this.resources.knowledge * 0.002
      - this.ecology.pollution * 0.003
      - (this.hasDisaster("disease") ? 0.28 : 0),
      0,
      1.35
    );
    const medics = alive.filter((person) => person.roleKey === "medic").length;
    const medicalCoverage = clamp(
      (this.eraIndex >= 6 ? 0.16 : 0)
      + this.countStructures("hospital") * 0.42
      + this.countStructures("school") * 0.08
      + this.countStructures("library") * 0.05
      + medics * 0.04,
      0,
      1.65
    );
    const dinosaurPenalty = this.countDinosaurs("carnivore") * 2.7 + this.countDinosaurs("herbivore") * 1.4;
    const disasterPenalty = (this.hasDisaster("disease") ? 7 : 0) + (this.hasDisaster("snow") ? 2.5 : 0) + (this.hasDisaster("drought") ? 2 : 0) + (this.hasDisaster("landslide") ? 1.5 : 0) + dinosaurPenalty;
    const pollutionPenalty = this.ecology.pollution * 0.05;
    const crowding = clamp(population / Math.max(this.getPopulationCapacity(), 1), 0, 1.6);
    const crowdingPenalty = Math.max(0, crowding - 0.92) * 9;
    const baselineExpectancy = clamp(
      this.getEra().lifeExpectancy
      + (shelterCoverage - 0.5) * 5
      + (foodSecurity - 0.45) * 4
      + sanitationIndex * 3.5
      + medicalCoverage * 5.5
      - pollutionPenalty
      - disasterPenalty
      - crowdingPenalty,
      18,
      86
    );
    const averageHealth = this.getAverageHealth();
    const stability = clamp(averageHealth / 100 + sanitationIndex * 0.15, 0.3, 1.15);
    const birthRate = this.getEra().birthRate
      * clamp(foodSecurity, 0.4, 1.25)
      * clamp(shelterCoverage + 0.2, 0.3, 1.25)
      * clamp(1.18 - Math.max(0, crowding - 0.95) * 1.4, 0.15, 1.1)
      * stability
      * clamp(1 - dinosaurPenalty * 0.12, 0.08, 1)
      * (this.hasDisaster("disease") ? 0.55 : 1)
      * (this.hasDisaster("snow") ? 0.82 : 1);
    return {
      averageHealth,
      baselineExpectancy,
      birthRate,
      crowding,
      disasterPenalty,
      dinosaurPenalty,
      foodSecurity,
      medicalCoverage,
      pollutionPenalty,
      sanitationIndex,
      shelterCoverage
    };
  }

  estimatePersonLifeExpectancy(person, demographic = this.getDemographicContext()) {
    const healthYears = (person.health - 65) * 0.08;
    const warmthPenalty = Math.max(0, 46 - person.warmth) * 0.06;
    const hungerPenalty = Math.max(0, person.hunger - 58) * 0.08;
    return clamp(demographic.baselineExpectancy + person.longevityBias + healthYears - warmthPenalty - hungerPenalty, 18, 88);
  }

  getAverageLifeExpectancy() {
    const alive = this.getAlivePeople();
    if (!alive.length) return 0;
    const demographic = this.getDemographicContext(alive);
    return average(alive.map((person) => this.estimatePersonLifeExpectancy(person, demographic)));
  }

  recordDeath(person, cause = "hardship") {
    if (!person?.alive) return;
    person.alive = false;
    person.health = 0;
    person.target = null;
    person.taskTimer = 0;
    if (cause === "dinosaur") {
      this.maybeLogDinosaurIncident(`공룡 습격으로 ${Math.round(person.age)}세 주민 한 명이 쓰러졌습니다.`, 0.7);
      return;
    }
    if (cause === "age") {
      this.log(`${Math.round(person.age)}세 주민 한 명이 생을 마쳤습니다.`);
      return;
    }
    if (cause === "collapse") {
      this.log("흉년과 질병, 과밀이 겹치며 취약한 주민 한 명이 더 버티지 못했습니다.");
      return;
    }
    this.log("한 사람이 질병, 굶주림, 혹한, 재해를 이기지 못하고 쓰러졌습니다.");
  }

  maybeLogDinosaurIncident(message, cooldown = 1.1) {
    if (this.dinosaurLogCooldown > 0) return;
    this.dinosaurLogCooldown = cooldown;
    this.log(message);
  }

  countBy(list, key) {
    return list.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
  }

  countStructures(kind) {
    return this.structures.filter((structure) => structure.kind === kind).length;
  }

  countPlants(type) {
    return this.plants.filter((plant) => plant.type === type).length;
  }

  countAnimals(species, domestic = null) {
    return this.animals.filter((animal) => animal.species === species && (domestic === null || animal.domestic === domestic)).length;
  }

  countDomesticAnimals() {
    return this.animals.filter((animal) => animal.domestic).length;
  }

  countVehicles(type) {
    return this.vehicles.filter((vehicle) => vehicle.type === type).length;
  }

  getTaskVisual(taskKey) {
    return TASK_VISUALS[taskKey] || TASK_VISUALS.idle;
  }

  labelForPlant(type) {
    const labels = { tree: "나무", berry: "열매 덤불", herb: "약초", crop: "밭작물", orchard: "과수원 나무" };
    return labels[type] || type;
  }

  labelForAnimal(species) {
    const labels = { deer: "사슴", boar: "멧돼지", wolf: "늑대", bird: "새", fish: "물고기", sheep: "양", cattle: "소", horse: "말", triceratops: "트리케라톱스", tyrannosaurus: "티라노사우루스" };
    return labels[species] || species;
  }

  labelForVehicle(type) {
    const labels = { boat: "배", cart: "수레", train: "기차", car: "자동차" };
    return labels[type] || type;
  }

  describeEntityBrief(entity, typeHint = "") {
    if (!entity) return "알 수 없는 대상";
    const type = typeHint || (entity.kind ? "structure" : entity.species ? "animal" : entity.type ? "plant" : entity.roleKey ? "person" : entity.progress !== undefined ? "site" : entity.path ? "vehicle" : "entity");
    if (type === "person") {
      const meta = ROLE_META[entity.roleKey] || ROLE_META.wanderer;
      return `${meta.label} 한 명`;
    }
    if (type === "animal") return entity.domestic ? `${this.labelForAnimal(entity.species)} 가축` : `${this.labelForAnimal(entity.species)} 야생 개체`;
    if (type === "plant") return this.labelForPlant(entity.type);
    if (type === "structure") return this.labelForStructure(entity.kind);
    if (type === "site") return `${this.labelForStructure(entity.kind)} 공사 현장`;
    if (type === "vehicle") return this.labelForVehicle(entity.type);
    return "대상";
  }

  getEntityByRef(ref) {
    if (!ref) return null;
    const pools = {
      person: this.getAlivePeople(),
      animal: this.animals,
      plant: this.plants,
      structure: this.structures,
      site: this.constructionSites,
      vehicle: this.vehicles
    };
    return (pools[ref.type] || []).find((item) => item.id === ref.id) || null;
  }

  getPeopleTargeting(entity) {
    return this.getAlivePeople().filter((person) => person.target === entity);
  }

  getFocusPayload() {
    const focus = this.getFocusDisplay();
    return focus ? { kicker: focus.kicker, title: focus.title, description: focus.description } : null;
  }

  getFocusDisplay() {
    const fallback = {
      kicker: "관찰 가이드",
      title: "캔버스를 클릭해 인물, 동식물, 건물을 확인하세요",
      description: "선택한 대상의 역할, 상태, 주변 상호작용이 여기에 표시됩니다."
    };
    const entity = this.getEntityByRef(this.focusTarget);
    if (!entity) {
      if (this.focusTarget) this.focusTarget = null;
      return fallback;
    }
    if (this.focusTarget.type === "person") {
      const meta = ROLE_META[entity.roleKey] || ROLE_META.wanderer;
      const targetText = entity.target ? this.describeEntityBrief(entity.target) : "주변을 살피는 중";
      const lifeExpectancy = Math.round(entity.lifeExpectancy || this.estimatePersonLifeExpectancy(entity));
      return {
        kicker: `${meta.label} 관찰`,
        title: `${meta.label}이(가) ${entity.taskLabel}`,
        description: `나이 ${Math.round(entity.age)}세, 기대 수명 ${lifeExpectancy}세, 건강 ${Math.round(entity.health)}%, 에너지 ${Math.round(entity.energy)}%, 배고픔 ${Math.round(entity.hunger)}% 상태입니다. 현재 목표는 ${targetText}입니다.`
      };
    }
    if (this.focusTarget.type === "animal") {
      const watchers = this.getPeopleTargeting(entity).length;
      const dinosaur = DINOSAUR_DEFS[entity.species];
      if (dinosaur) {
        const pressure = this.getDinosaurCounterPressure(entity);
        return {
          kicker: dinosaur.diet === "carnivore" ? "육식 공룡" : "초식 공룡",
          title: `${this.labelForAnimal(entity.species)} 출현`,
          description: `체력 ${Math.round(entity.health || 0)} / ${entity.maxHealth}. 주변에 사람 ${pressure.people.length}명과 동물 ${pressure.animals.length}마리가 맞서고 있습니다. ${dinosaur.diet === "carnivore"
            ? "복원된 육식 공룡으로 사람과 육상 동물을 적극적으로 사냥하지만, 수가 모이면 역공을 받아 쓰러질 수 있습니다."
            : "복원된 초식 공룡으로 식생을 쓸어 먹고 가까운 생물을 짓밟지만, 여러 사람과 동물이 몰리면 버티지 못합니다."}`
        };
      }
      return {
        kicker: entity.domestic ? "가축 생태" : "야생 생태",
        title: `${this.labelForAnimal(entity.species)} ${entity.domestic ? "무리" : "개체"}`,
        description: watchers > 0
          ? `지금 ${watchers}명이 이 ${this.labelForAnimal(entity.species)}와 직접 상호작용하고 있습니다. ${entity.domestic ? "문명 안쪽에서 사람과 함께 생활합니다." : "야생 영역을 배회하며 사람과 마주칩니다."}`
          : entity.domestic
            ? "사람들이 돌보는 가축으로, 식량과 이동력을 함께 제공합니다."
            : "환경 변화에 따라 이동하며 사냥, 경계, 채집 동선을 바꾸게 만드는 야생 개체입니다."
      };
    }
    if (this.focusTarget.type === "plant") {
      const caretakers = this.getPeopleTargeting(entity).length;
      return {
        kicker: "식생 관찰",
        title: `${this.labelForPlant(entity.type)} 성장도 ${Math.round(entity.growth)}%`,
        description: caretakers > 0
          ? `현재 ${caretakers}명이 이 식물을 이용하거나 돌보고 있습니다. 식생의 성장 상태는 식량과 생태 지표를 바로 바꿉니다.`
          : `${entity.type === "crop" || entity.type === "orchard" ? "문명이 직접 관리하는 재배 식생입니다." : "야생 환경에서 자라며 채집과 벌목 자원이 됩니다."} 성장도가 올라갈수록 더 많은 자원을 제공합니다.`
      };
    }
    if (this.focusTarget.type === "structure") {
      const workers = this.getPeopleTargeting(entity).length;
      return {
        kicker: "건물 관찰",
        title: `${this.labelForStructure(entity.kind)}${entity.meta.damaged ? " · 손상됨" : ""}`,
        description: workers > 0
          ? `현재 ${workers}명이 이 건물과 관련된 일을 수행하고 있습니다. ${entity.meta.damaged ? "재해 여파로 기능이 일부 떨어져 있습니다." : "문명의 생활 방식과 시대 변화를 가장 직접적으로 보여주는 거점입니다."}`
          : entity.meta.damaged
            ? "재해 여파로 손상된 상태입니다. 주변 인력이 접근하면 문명 운영에 영향을 줍니다."
            : "사람들의 이동, 저장, 생산, 학습, 의료, 에너지 흐름이 이 건물을 중심으로 만들어집니다."
      };
    }
    if (this.focusTarget.type === "site") {
      return {
        kicker: "공사 진행",
        title: `${this.labelForStructure(entity.kind)} 공사 ${Math.round(entity.progress)}%`,
        description: "건축자가 모일수록 공사가 빨라지고, 완공되면 시대 변화가 화면에 즉시 반영됩니다."
      };
    }
    if (this.focusTarget.type === "vehicle") {
      return {
        kicker: "이동 수단",
        title: `${this.labelForVehicle(entity.type)} 운행 중`,
        description: `${entity.type === "boat" ? "수로" : entity.type === "train" ? "철도" : "도로"}를 따라 움직이며 도시의 교역과 연결성을 시각적으로 보여줍니다.`
      };
    }
    return fallback;
  }

  inspectAt(x, y) {
    const found = this.findInspectableEntity(x, y);
    this.focusTarget = found ? { type: found.type, id: found.entity.id } : null;
    this.updateUi();
  }

  findInspectableEntity(x, y) {
    const candidates = [];
    const pushCandidate = (type, entity, radius, bias) => {
      const distance = Math.hypot(entity.x - x, entity.y - y);
      if (distance <= radius) candidates.push({ type, entity, score: distance / radius + bias });
    };
    for (const person of this.getAlivePeople()) pushCandidate("person", person, 16, -0.22);
    for (const animal of this.animals) pushCandidate("animal", animal, animal.species === "bird" ? 14 : isDinosaurSpecies(animal.species) ? 28 : 18, -0.16);
    for (const plant of this.plants) pushCandidate("plant", plant, plant.type === "tree" || plant.type === "orchard" ? 18 : 14, -0.06);
    for (const site of this.constructionSites) pushCandidate("site", site, Math.max(site.width, site.height) * 0.55 + 8, -0.08);
    for (const structure of this.structures) pushCandidate("structure", structure, Math.max(structure.width || structure.size || 20, structure.height || structure.size || 20) * 0.55 + 8, 0.04);
    for (const vehicle of this.vehicles) {
      const point = pathPoint(vehicle.path, vehicle.progress);
      pushCandidate("vehicle", { ...vehicle, x: point.x, y: point.y }, 16, -0.12);
    }
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0] || null;
  }

  computeCivilizationScore() {
    return this.timeYears * 1.15 + this.resources.knowledge * 1.6 + this.structures.length * 2.5 + this.getAlivePeople().length * 0.7 + this.vehicles.length * 2.2 + this.resources.energy * 0.25 + this.countDomesticAnimals() * 1.5 - this.ecology.pollution * 0.5;
  }

  log(message) {
    this.logs.unshift(`${this.timeYears.toFixed(1)}년: ${message}`);
    this.logs = this.logs.slice(0, 12);
    this.updateUi();
  }

  addStructure(kind, x, y, extra = {}) {
    const key = extra.key || `${kind}-${Math.round(x)}-${Math.round(y)}`;
    if (this.structures.some((structure) => structure.key === key)) return;
    this.structures.push({ id: this.nextStructureId++, kind, x, y, size: extra.size || 20, width: extra.width || 60, height: extra.height || 32, key, lights: extra.lights || 0, meta: extra.meta || {} });
  }

  queueConstruction(kind, x, y, extra = {}) {
    const key = extra.key || `${kind}-${Math.round(x)}-${Math.round(y)}`;
    if (this.structures.some((structure) => structure.key === key)) return;
    if (this.constructionSites.some((site) => site.key === key)) return;
    this.constructionSites.push({ id: this.nextSiteId++, kind, x, y, size: extra.size || 22, width: extra.width || 70, height: extra.height || 32, progress: 0, key, meta: extra.meta || {} });
  }

  addVehicle(type, path, speed, key, initialProgress = 0) {
    if (this.vehicles.some((vehicle) => vehicle.key === key)) return;
    this.vehicles.push({ id: this.nextVehicleId++, key, type, path, speed, progress: initialProgress });
  }

  addPlantCluster(type, points, growth = 78) {
    for (const point of points) {
      if (!this.plants.some((plant) => plant.type === type && Math.hypot(plant.x - point.x, plant.y - point.y) < 14)) {
        this.plants.push(this.makePlant(type, point.x, point.y, growth));
      }
    }
  }

  update(dt, forced = false) {
    if (!this.started && !forced) return;
    if (!this.running && !forced) return;
    const scaledDt = dt * this.speed;
    const yearDelta = scaledDt * 0.42;
    this.timeYears += yearDelta;
    this.weatherPulse += scaledDt;
    this.dinosaurLogCooldown = Math.max(0, this.dinosaurLogCooldown - yearDelta);
    this.roleRefreshCooldown -= scaledDt;
    this.updateEra();
    this.ensureEraContent();
    this.updateDisasters(scaledDt);
    this.updateInteractionBursts(scaledDt);
    this.updatePlants(scaledDt);
    this.updateAnimals(scaledDt);
    this.updatePeople(scaledDt, yearDelta);
    this.updateVehicles(scaledDt);
    this.updateEconomy(scaledDt);
    this.updateDemographics(yearDelta);
    this.updateUi();
  }

  emitInteractionBurst(x, y, taskKey) {
    if (typeof x !== "number" || typeof y !== "number") return;
    const visual = this.getTaskVisual(taskKey);
    this.interactionBursts.push({
      x,
      y,
      taskKey,
      color: visual.color,
      accent: visual.accent,
      radius: 8,
      remaining: 1.1
    });
    this.interactionBursts = this.interactionBursts.slice(-40);
  }

  updateInteractionBursts(scaledDt) {
    this.interactionBursts = this.interactionBursts.filter((burst) => {
      burst.remaining -= scaledDt * 0.24;
      burst.radius += scaledDt * 1.4;
      return burst.remaining > 0;
    });
  }

  updateEra() {
    const score = this.computeCivilizationScore();
    while (this.eraIndex < ERA_DEFS.length - 1 && score >= ERA_DEFS[this.eraIndex + 1].threshold && this.timeYears >= ERA_DEFS[this.eraIndex + 1].yearGate) {
      this.eraIndex += 1;
      this.log(`${this.getEra().name}에 진입했습니다. ${this.getEra().summary}`);
      this.roleRefreshCooldown = 0;
      this.ensureEraContent(true);
    }
  }

  ensureEraContent() {
    if (this.eraIndex >= 1 && !this.flags.fireAge) {
      this.flags.fireAge = true;
      this.addStructure("campfire", 300, 375, { key: "campfire-east", size: 16 });
      this.queueConstruction("hut", 220, 418, { key: "hut-a" });
      this.queueConstruction("hut", 312, 418, { key: "hut-b" });
      this.log("공동 불씨가 생기며 밤에도 모여 이야기하고 고기를 말립니다.");
    }
    if (this.eraIndex >= 2 && !this.flags.stoneAge) {
      this.flags.stoneAge = true;
      this.queueConstruction("workshop", 365, 372, { key: "workshop" });
      this.queueConstruction("quarry", 748, 238, { key: "quarry", width: 86, height: 40 });
      this.log("돌도구와 작업장이 생기며 사냥과 채집이 훨씬 정교해집니다.");
    }
    if (this.eraIndex >= 3 && !this.flags.agriculture) {
      this.flags.agriculture = true;
      this.addPlantCluster("crop", [{ x: 320, y: 492 }, { x: 345, y: 492 }, { x: 370, y: 492 }, { x: 395, y: 492 }, { x: 320, y: 520 }, { x: 345, y: 520 }, { x: 370, y: 520 }, { x: 395, y: 520 }, { x: 430, y: 492 }, { x: 455, y: 492 }, { x: 430, y: 520 }, { x: 455, y: 520 }], 62);
      this.addPlantCluster("orchard", [{ x: 140, y: 420 }, { x: 175, y: 425 }, { x: 210, y: 422 }, { x: 150, y: 455 }, { x: 190, y: 456 }], 78);
      this.queueConstruction("granary", 438, 428, { key: "granary" });
      this.queueConstruction("pen", 170, 474, { key: "pen", width: 92, height: 50 });
      for (let i = 0; i < 6; i += 1) this.animals.push(this.makeAnimal("sheep", true));
      for (let i = 0; i < 4; i += 1) this.animals.push(this.makeAnimal("cattle", true));
      this.log("밭과 과수원, 양과 소가 들어오며 정착 농경 사회가 뿌리내립니다.");
    }
    if (this.eraIndex >= 4 && !this.flags.cityAge) {
      this.flags.cityAge = true;
      this.queueConstruction("market", 515, 390, { key: "market" });
      this.queueConstruction("bridge", 506, 416, { key: "bridge", width: 110, height: 16 });
      this.queueConstruction("dock", 872, 520, { key: "dock", width: 104, height: 18 });
      this.queueConstruction("library", 608, 360, { key: "library" });
      this.addVehicle("boat", this.routes.river, 0.0022, "boat-a", 0.08);
      this.addVehicle("boat", this.routes.river, 0.0018, "boat-b", 0.52);
      this.log("시장과 다리, 부두가 생기며 강과 바다가 문명을 서로 연결합니다.");
    }
    if (this.eraIndex >= 5 && !this.flags.kingdomAge) {
      this.flags.kingdomAge = true;
      this.queueConstruction("windmill", 370, 508, { key: "windmill" });
      this.queueConstruction("hall", 592, 322, { key: "hall" });
      this.queueConstruction("tower", 694, 292, { key: "tower" });
      this.queueConstruction("wall", 255, 332, { key: "wall-a", width: 132, height: 10 });
      this.queueConstruction("wall", 255, 455, { key: "wall-b", width: 132, height: 10 });
      for (let i = 0; i < 3; i += 1) this.animals.push(this.makeAnimal("horse", true));
      this.addVehicle("cart", this.routes.road, 0.0026, "cart-a", 0.2);
      this.log("풍차와 성벽, 장인 문화가 더 큰 왕국의 풍경을 만들기 시작합니다.");
    }
    if (this.eraIndex >= 6 && !this.flags.industryAge) {
      this.flags.industryAge = true;
      this.queueConstruction("factory", 742, 388, { key: "factory" });
      this.queueConstruction("station", 630, 446, { key: "station", width: 94, height: 24 });
      this.queueConstruction("warehouse", 826, 420, { key: "warehouse" });
      this.queueConstruction("powerplant", 888, 342, { key: "powerplant" });
      this.addVehicle("train", this.routes.rail, 0.0043, "train", 0.14);
      this.addVehicle("cart", this.routes.road, 0.003, "cart-b", 0.62);
      this.log("공장과 발전소, 철도가 들어서며 산업 혁명의 박동이 시작됩니다.");
    }
    if (this.eraIndex >= 7 && !this.flags.modernAge) {
      this.flags.modernAge = true;
      this.queueConstruction("apartment", 706, 302, { key: "apartment-a", width: 54, height: 84 });
      this.queueConstruction("apartment", 772, 296, { key: "apartment-b", width: 56, height: 92 });
      this.queueConstruction("hospital", 616, 300, { key: "hospital", width: 74, height: 50 });
      this.queueConstruction("school", 542, 328, { key: "school", width: 86, height: 42 });
      this.queueConstruction("solar", 872, 500, { key: "solar", width: 88, height: 28 });
      this.queueConstruction("telecom", 816, 254, { key: "telecom", width: 20, height: 110 });
      this.addPlantCluster("tree", [{ x: 602, y: 520 }, { x: 640, y: 515 }, { x: 683, y: 520 }, { x: 730, y: 515 }, { x: 778, y: 518 }], 88);
      this.addVehicle("car", this.routes.road, 0.0048, "car-a", 0.08);
      this.addVehicle("car", this.routes.road, 0.0052, "car-b", 0.38);
      this.addVehicle("car", this.routes.road, 0.0045, "car-c", 0.74);
      this.log("병원과 학교, 아파트, 태양광, 통신탑이 들어서며 현대 도시가 완성됩니다.");
    }
  }

  triggerDisaster(type) {
    const config = disasterConfigs[type];
    if (!config) return;
    this.activeDisasters.push({ type, remaining: config.duration });
    if (type === "landslide") this.spawnLandslideScar();
    this.log(`${config.label} 재해가 문명과 생태계에 압박을 주기 시작합니다.`);
  }

  resurrectDinosaurs() {
    const current = this.countDinosaurs();
    const remainingSlots = Math.max(0, 8 - current);
    if (remainingSlots === 0) {
      this.log("이미 공룡 무리가 들판을 가득 메우고 있습니다.");
      return;
    }
    const population = this.getAlivePeople().length;
    const wave = current === 0
      ? ["triceratops", "tyrannosaurus"]
      : (population >= 60 ? ["triceratops", "tyrannosaurus", "tyrannosaurus"] : ["triceratops", "tyrannosaurus"]);
    let spawned = 0;
    for (const species of wave) {
      if (spawned >= remainingSlots) break;
      this.animals.push(this.makeAnimal(species));
      spawned += 1;
    }
    this.ecology.vegetation = clamp(this.ecology.vegetation - 3.2 - spawned * 0.9, 10, 100);
    this.ecology.wildlife = clamp(this.ecology.wildlife - 4.6 - spawned * 1.3, 8, 100);
    this.log(current === 0
      ? "복원 실험이 성공하며 트리케라톱스와 티라노사우루스가 다시 대지를 걷기 시작합니다."
      : "추가 복원으로 공룡 무리가 더 늘어나며 사람과 동물에게 새로운 위협이 생깁니다.");
  }

  extinctDinosaurs() {
    const removed = this.countDinosaurs();
    if (!removed) {
      this.log("이미 공룡은 자취를 감춘 상태입니다.");
      return;
    }
    for (const animal of this.animals.filter((candidate) => isDinosaurSpecies(candidate.species))) this.clearTargetsForEntity(animal);
    this.animals = this.animals.filter((animal) => !isDinosaurSpecies(animal.species));
    this.log(`복원된 공룡 ${removed}마리가 다시 멸종하며 생태계가 안정을 되찾습니다.`);
  }

  spawnLandslideScar() {
    const scar = { x: randomFrom(this.rng, 690, 860), y: randomFrom(this.rng, 170, 360), radius: randomFrom(this.rng, 36, 64), remaining: 14 };
    this.landslideScars.push(scar);
    for (const structure of this.structures) {
      if (Math.hypot(structure.x - scar.x, structure.y - scar.y) < scar.radius + 20 && ["quarry", "tower", "factory", "powerplant"].includes(structure.kind)) {
        structure.meta.damaged = true;
      }
    }
    for (const animal of this.animals) {
      if (Math.hypot(animal.x - scar.x, animal.y - scar.y) < scar.radius + 20) animal.escape = 1.5;
    }
  }

  hasDisaster(type) {
    return this.activeDisasters.some((disaster) => disaster.type === type);
  }

  updateDisasters(scaledDt) {
    this.activeDisasters = this.activeDisasters.filter((disaster) => {
      disaster.remaining -= scaledDt * 0.05;
      return disaster.remaining > 0;
    });
    this.landslideScars = this.landslideScars.filter((scar) => {
      scar.remaining -= scaledDt * 0.07;
      return scar.remaining > 0;
    });
    if (this.hasDisaster("drought")) this.ecology.vegetation -= scaledDt * 0.14;
    if (this.hasDisaster("rain")) this.ecology.vegetation += scaledDt * 0.08;
    if (this.hasDisaster("snow")) this.resources.energy -= scaledDt * 0.02;
    if (this.hasDisaster("disease")) this.resources.food -= scaledDt * 0.015;
  }

  updatePlants(scaledDt) {
    const rain = this.hasDisaster("rain");
    const drought = this.hasDisaster("drought");
    const disease = this.hasDisaster("disease");
    for (const plant of this.plants) {
      let delta = scaledDt * plant.regenRate;
      if (rain) delta += scaledDt * 0.05;
      if (drought) delta -= scaledDt * 0.08;
      if (disease && plant.type === "crop") delta -= scaledDt * 0.06;
      if (plant.type === "tree") delta *= 0.7;
      if (plant.type === "crop") delta *= 1.35;
      plant.growth = clamp(plant.growth + delta, 8, plant.maxGrowth);
    }
  }

  updateAnimals(scaledDt) {
    const drought = this.hasDisaster("drought");
    const landslide = this.hasDisaster("landslide");
    const rain = this.hasDisaster("rain");
    for (const animal of [...this.animals]) {
      if (!this.animals.some((candidate) => candidate.id === animal.id)) continue;
      animal.escape = clamp(animal.escape - scaledDt * 0.05, 0, 3);
      if (isDinosaurSpecies(animal.species)) {
        this.updateDinosaur(animal, scaledDt, { drought, landslide });
        continue;
      }
      animal.t += scaledDt * animal.speed * (animal.escape > 0 ? 2.5 : 1);
      const phaseX = Math.cos(animal.t + animal.id * 0.31);
      const phaseY = Math.sin(animal.t * 0.7 + animal.id * 0.21);
      let targetX = animal.homeX + phaseX * animal.spread;
      let targetY = animal.homeY + phaseY * animal.spread * 0.6;
      if (animal.species === "fish") {
        targetX = clamp(targetX, 470, 605);
        targetY = clamp(targetY, 70, 550);
      }
      if (drought && !animal.domestic && animal.species !== "fish") targetX = lerp(targetX, 520, 0.4);
      if (landslide && animal.x > 620) {
        targetX = 560;
        targetY = animal.y;
      }
      if (rain && animal.species === "bird") targetY -= 8;
      animal.x += (targetX - animal.x) * 0.03;
      animal.y += (targetY - animal.y) * 0.03;
    }
    this.resolveDinosaurCounterattacks(scaledDt);
    if (this.countAnimals("deer") < 6 && this.ecology.vegetation > 48 && this.rng() < scaledDt * 0.004) this.animals.push(this.makeAnimal("deer"));
    if (this.countAnimals("bird") < 8 && this.rng() < scaledDt * 0.005) this.animals.push(this.makeAnimal("bird"));
    if (this.countAnimals("fish") < 10 && this.rng() < scaledDt * 0.006) this.animals.push(this.makeAnimal("fish"));
    if (this.flags.agriculture && this.countAnimals("sheep", true) < 6 && this.rng() < scaledDt * 0.003) this.animals.push(this.makeAnimal("sheep", true));
    if (this.flags.agriculture && this.countAnimals("cattle", true) < 4 && this.rng() < scaledDt * 0.002) this.animals.push(this.makeAnimal("cattle", true));
  }

  updateDinosaur(dinosaur, scaledDt, conditions) {
    const meta = DINOSAUR_DEFS[dinosaur.species];
    if (!meta) return;
    dinosaur.attackCooldown = Math.max(0, dinosaur.attackCooldown - scaledDt * 0.18);
    dinosaur.counterCooldown = Math.max(0, dinosaur.counterCooldown - scaledDt * 0.22);
    dinosaur.t += scaledDt * dinosaur.speed * (dinosaur.attackCooldown > 0 ? 1.35 : 1.18);
    const phaseX = Math.cos(dinosaur.t + dinosaur.id * 0.21);
    const phaseY = Math.sin(dinosaur.t * 0.75 + dinosaur.id * 0.17);
    let targetX = dinosaur.homeX + phaseX * dinosaur.spread;
    let targetY = dinosaur.homeY + phaseY * dinosaur.spread * 0.55;
    const personTarget = this.findNearestLivingPersonFrom(dinosaur, meta.diet === "carnivore" ? 999 : 70);
    const animalTarget = this.findNearestAnimalByPredicate(
      dinosaur,
      (animal) => animal.id !== dinosaur.id && !isDinosaurSpecies(animal.species) && !["fish", "bird"].includes(animal.species),
      meta.diet === "carnivore" ? 999 : 78
    );
    const plantTarget = meta.diet === "herbivore" ? this.findNearestPlant(dinosaur, ["tree", "berry", "herb", "crop", "orchard"]) : null;
    let strikeTarget = null;
    let strikeKind = "";
    if (meta.diet === "carnivore") {
      const prey = personTarget || animalTarget;
      if (prey) {
        targetX = prey.x;
        targetY = prey.y;
        strikeTarget = prey;
        strikeKind = prey.roleKey ? "person" : "animal";
      }
    } else {
      if (plantTarget) {
        targetX = plantTarget.x;
        targetY = plantTarget.y;
      }
      if (personTarget && dist(dinosaur, personTarget) < 72) {
        targetX = personTarget.x;
        targetY = personTarget.y;
        strikeTarget = personTarget;
        strikeKind = "person";
      } else if (animalTarget && dist(dinosaur, animalTarget) < 72) {
        targetX = animalTarget.x;
        targetY = animalTarget.y;
        strikeTarget = animalTarget;
        strikeKind = "animal";
      }
    }
    if (conditions.drought && meta.diet === "herbivore") targetX = lerp(targetX, 520, 0.16);
    if (conditions.landslide && dinosaur.x > 620) targetX = Math.min(targetX, 590);
    dinosaur.x += (targetX - dinosaur.x) * (meta.diet === "carnivore" ? 0.075 : 0.05);
    dinosaur.y += (targetY - dinosaur.y) * (meta.diet === "carnivore" ? 0.075 : 0.05);
    if (meta.diet === "herbivore" && plantTarget && dist(dinosaur, plantTarget) < 34) {
      plantTarget.growth = clamp(plantTarget.growth - scaledDt * (plantTarget.type === "tree" ? 1.8 : 3.4), 5, plantTarget.maxGrowth);
      this.ecology.vegetation = clamp(this.ecology.vegetation - scaledDt * 0.12, 10, 100);
    }
    if (strikeTarget && dinosaur.attackCooldown <= 0 && dist(dinosaur, strikeTarget) < meta.interactionRadius) {
      this.tryDinosaurStrike(dinosaur, strikeTarget, strikeKind);
    }
  }

  getDinosaurCounterPressure(dinosaur) {
    const meta = DINOSAUR_DEFS[dinosaur.species];
    if (!meta) return { people: [], animals: [], peopleStrength: 0, animalStrength: 0, totalAttackers: 0, totalStrength: 0 };
    const people = [];
    const animals = [];
    let peopleStrength = 0;
    let animalStrength = 0;
    const weaponBonus = 1 + this.eraIndex * 0.08 + (this.flags.cityAge ? 0.06 : 0) + (this.flags.industryAge ? 0.14 : 0) + (this.flags.modernAge ? 0.18 : 0);
    for (const person of this.getAlivePeople()) {
      const basePower = DINOSAUR_COUNTER_ROLE_POWER[person.roleKey] || 0.65;
      const reach = meta.counterRadius + (["hunter", "guard"].includes(person.roleKey) ? 18 : 0);
      if (basePower <= 0 || dist(person, dinosaur) > reach) continue;
      const condition = clamp((person.health * 0.5 + person.energy * 0.35 + person.warmth * 0.15) / 100, 0.4, 1.15);
      const taskBonus = person.target === dinosaur ? 1.35 : ["hunt", "guard"].includes(person.taskKey) ? 1.12 : 1;
      people.push(person);
      peopleStrength += basePower * weaponBonus * condition * taskBonus;
    }
    for (const animal of this.animals) {
      const basePower = DINOSAUR_COUNTER_ANIMAL_POWER[animal.species] || 0;
      if (animal.id === dinosaur.id || isDinosaurSpecies(animal.species) || ["fish", "bird"].includes(animal.species)) continue;
      if (basePower <= 0 || dist(animal, dinosaur) > meta.counterRadius - 6) continue;
      animals.push(animal);
      animalStrength += basePower * (animal.domestic ? 1.08 : 1);
    }
    return {
      people,
      animals,
      peopleStrength,
      animalStrength,
      totalAttackers: people.length + animals.length,
      totalStrength: peopleStrength + animalStrength
    };
  }

  getHumanDinosaurDamage(person, taskKey = person.taskKey) {
    const roleBonus = person.roleKey === "guard" ? 4.2 : person.roleKey === "hunter" ? 2.8 : 0.8;
    const taskBonus = taskKey === "guard" ? 13.5 : 11.5;
    const eraBonus = this.eraIndex * (taskKey === "guard" ? 1.55 : 1.35) + (this.flags.industryAge ? 3.2 : 0) + (this.flags.modernAge ? 4.6 : 0);
    const condition = clamp((person.health * 0.55 + person.energy * 0.35 + person.warmth * 0.1) / 100, 0.45, 1.18);
    return (taskBonus + roleBonus + eraBonus) * condition;
  }

  damageDinosaur(dinosaur, amount, options = {}) {
    if (!dinosaur || !isDinosaurSpecies(dinosaur.species) || !this.animals.some((candidate) => candidate.id === dinosaur.id)) return false;
    dinosaur.health = clamp(dinosaur.health - amount, 0, dinosaur.maxHealth || DINOSAUR_DEFS[dinosaur.species].maxHealth);
    dinosaur.attackCooldown = Math.max(dinosaur.attackCooldown, 0.45);
    dinosaur.counterCooldown = Math.max(dinosaur.counterCooldown, 0.4);
    if (options.emitBurst) this.emitInteractionBurst(dinosaur.x, dinosaur.y, options.burstTask || "guard");
    if (dinosaur.health <= 0) {
      this.killDinosaur(dinosaur, options.cause, options.attackers || 0);
      return true;
    }
    return false;
  }

  killDinosaur(dinosaur, cause = "human", attackers = 0) {
    const meta = DINOSAUR_DEFS[dinosaur.species];
    if (!meta) return;
    const label = this.labelForAnimal(dinosaur.species);
    this.removeAnimal(dinosaur);
    this.resources.food = clamp(this.resources.food + meta.rewardFood, 0, 600);
    this.resources.knowledge = clamp(this.resources.knowledge + 0.4 + this.eraIndex * 0.08, 0, 400);
    this.ecology.wildlife = clamp(this.ecology.wildlife + (meta.diet === "carnivore" ? 4.8 : 3.6), 8, 100);
    if (cause === "animal") {
      this.log(`${label} 한 마리가 야생과 가축 무리의 거센 반격 끝에 쓰러졌습니다.`);
      return;
    }
    if (cause === "swarm") {
      this.log(`${label} 한 마리가 사람과 동물 무리의 합동 반격 끝에 쓰러졌습니다.`);
      return;
    }
    this.log(`${label} 한 마리가 사냥꾼과 수호자들의 집중 공격에 쓰러졌습니다.`);
  }

  resolveDinosaurCounterattacks(scaledDt) {
    for (const dinosaur of [...this.animals.filter((animal) => isDinosaurSpecies(animal.species))]) {
      if (!this.animals.some((candidate) => candidate.id === dinosaur.id) || dinosaur.counterCooldown > 0) continue;
      const meta = DINOSAUR_DEFS[dinosaur.species];
      const pressure = this.getDinosaurCounterPressure(dinosaur);
      const crowdReady = pressure.people.length >= 3 || pressure.animals.length >= 4 || pressure.totalAttackers >= 5;
      if (!meta || !crowdReady || pressure.totalStrength < meta.counterThreshold) continue;
      const damage = (2.8 + Math.max(0, pressure.totalStrength - meta.counterThreshold) * 1.7) * clamp(0.78 + scaledDt * 0.16, 0.78, 1.35);
      dinosaur.counterCooldown = pressure.people.length >= pressure.animals.length ? 0.9 : 1.15;
      this.damageDinosaur(dinosaur, damage, {
        cause: pressure.people.length && pressure.animals.length ? "swarm" : pressure.people.length ? "human" : "animal",
        attackers: pressure.totalAttackers,
        emitBurst: true,
        burstTask: pressure.people.length >= pressure.animals.length ? "guard" : "herd"
      });
    }
  }

  tryDinosaurStrike(dinosaur, target, targetKind) {
    const meta = DINOSAUR_DEFS[dinosaur.species];
    if (!meta) return;
    dinosaur.attackCooldown = meta.diet === "carnivore" ? 1.2 : 1.55;
    if (targetKind === "person") {
      this.recordDeath(target, "dinosaur");
      return;
    }
    const targetLabel = this.labelForAnimal(target.species);
    this.removeAnimal(target);
    this.ecology.wildlife = clamp(this.ecology.wildlife - (target.domestic ? 2.2 : 1.4), 8, 100);
    this.maybeLogDinosaurIncident(meta.diet === "carnivore"
      ? `${this.labelForAnimal(dinosaur.species)}가 ${targetLabel} 한 마리를 사냥했습니다.`
      : `${this.labelForAnimal(dinosaur.species)}가 돌진해 ${targetLabel} 한 마리를 짓밟았습니다.`);
  }
  updatePeople(scaledDt, yearDelta) {
    const rain = this.hasDisaster("rain");
    const snow = this.hasDisaster("snow");
    const disease = this.hasDisaster("disease");
    const demographic = this.getDemographicContext();
    if (this.roleRefreshCooldown <= 0) {
      this.rebalanceRoles();
      this.roleRefreshCooldown = 18;
    }
    for (const person of this.getAlivePeople()) {
      const resilience = 2 - person.resilience;
      person.age += yearDelta;
      person.hunger = clamp(person.hunger + scaledDt * 0.018 * resilience, 0, 100);
      person.energy = clamp(person.energy - scaledDt * (snow ? 0.021 : 0.014) * resilience, 0, 100);
      person.warmth = clamp(person.warmth - scaledDt * (snow ? 0.03 : rain ? 0.018 : 0.008) * resilience, 0, 100);
      person.health = clamp(person.health - ((person.hunger > 78 ? scaledDt * 0.03 : 0) + (person.warmth < 34 ? scaledDt * 0.04 : 0) + (disease ? scaledDt * 0.007 : 0)) * resilience, 0, 100);
      person.lifeExpectancy = this.estimatePersonLifeExpectancy(person, demographic);
      const lateLifeYears = person.age - (person.lifeExpectancy - 5);
      if (lateLifeYears > 0) {
        person.health = clamp(person.health - yearDelta * (0.35 + lateLifeYears * 0.22) / person.resilience, 0, 100);
      }
      if (person.age > person.lifeExpectancy + 2 && this.rng() < yearDelta * (0.02 + (person.age - person.lifeExpectancy - 2) * 0.018) / person.resilience) {
        this.recordDeath(person, "age");
        continue;
      }
      if (!person.target || person.taskTimer === 0) this.assignTask(person);
      this.moveAndAct(person, scaledDt);
      if (person.health <= 0) {
        this.recordDeath(person, "hardship");
      }
    }
  }

  rebalanceRoles(initial = false) {
    const scheme = ROLE_SCHEMES[this.eraIndex];
    const alive = this.getAlivePeople();
    for (let i = 0; i < alive.length; i += 1) {
      const nextRole = pickWeighted(scheme, i + (initial ? 0 : this.eraIndex));
      if (alive[i].roleKey !== nextRole) {
        alive[i].roleKey = nextRole;
        alive[i].taskTimer = 0;
        alive[i].target = null;
      }
    }
  }

  assignTask(person) {
    const shelter = this.findNearestStructure(person, ["hut", "hall", "hospital", "apartment", "tent"]);
    const warmPlace = this.findNearestStructure(person, ["campfire", "windmill", "hall", "hospital", "apartment"]);
    if ((this.hasDisaster("snow") || this.hasDisaster("rain")) && person.warmth < 45 && warmPlace) {
      this.setTask(person, "warm", warmPlace, "불씨나 건물로 몸을 녹이는 중", 1.2);
      return;
    }
    if (person.health < 54 && (this.flags.modernAge || this.flags.industryAge)) {
      const hospital = this.findNearestStructure(person, ["hospital"]);
      if (hospital) {
        this.setTask(person, "heal", hospital, "의료 시설에서 회복하는 중", 1.4);
        return;
      }
    }
    if (person.hunger > 62 && this.resources.food > 2 && shelter) {
      this.setTask(person, "eat", shelter, "비축 식량을 먹는 중", 0.9);
      return;
    }
    switch (person.roleKey) {
      case "forager": {
        const plant = this.findNearestPlant(person, ["berry", "herb"]);
        if (plant) this.setTask(person, "forage", plant, "열매와 약초를 모으는 중", 1.5);
        break;
      }
      case "hunter": {
        const dinosaur = this.findNearestAnimalByPredicate(
          person,
          (animal) => isDinosaurSpecies(animal.species) && (animal.diet === "carnivore" || animal.health < animal.maxHealth * 0.8),
          this.flags.industryAge ? 250 : 195
        );
        if (dinosaur) {
          this.setTask(person, "hunt", dinosaur, `${this.labelForAnimal(dinosaur.species)}를 추적하는 중`, 1.6);
          break;
        }
        const animal = this.findNearestAnimal(person, ["deer", "boar", "wolf"], false);
        if (animal) this.setTask(person, "hunt", animal, `${animal.species === "wolf" ? "늑대" : animal.species === "boar" ? "멧돼지" : "사슴"}를 추적하는 중`, 1.8);
        break;
      }
      case "fisher": {
        const fish = this.findNearestAnimal(person, ["fish"], false);
        if (fish) this.setTask(person, "fish", fish, "강가에서 낚시하는 중", 1.6);
        break;
      }
      case "lumberjack": {
        const tree = this.findNearestPlant(person, ["tree"]);
        if (tree) this.setTask(person, "lumber", tree, "나무를 베어 재료를 모으는 중", 1.7);
        break;
      }
      case "farmer": {
        const crop = this.findNearestPlant(person, ["crop", "orchard"]);
        if (crop) this.setTask(person, "farm", crop, crop.type === "crop" ? "곡식을 돌보는 중" : "과수원을 살피는 중", 1.4);
        break;
      }
      case "herder": {
        const domestic = this.findNearestAnimal(person, ["sheep", "cattle", "horse"], true);
        if (domestic) this.setTask(person, "herd", domestic, "가축을 돌보는 중", 1.4);
        break;
      }
      case "builder": {
        const site = this.findNearestSite(person);
        if (site) this.setTask(person, "build", site, `${this.labelForStructure(site.kind)} 공사를 진행하는 중`, 0.9);
        break;
      }
      case "miner":
        this.setTask(person, "mine", { x: 760, y: 238 }, "광산과 절벽에서 자원을 캐는 중", 1.7);
        break;
      case "artisan": {
        const craftPlace = this.findNearestStructure(person, ["workshop", "market", "granary", "windmill"]);
        if (craftPlace) this.setTask(person, "craft", craftPlace, "공방과 저장시설을 돌보는 중", 1.4);
        break;
      }
      case "trader": {
        const tradePlace = this.findNearestStructure(person, ["market", "dock", "station"]);
        if (tradePlace) this.setTask(person, "trade", tradePlace, "사람과 물자를 연결하는 중", 1.2);
        break;
      }
      case "scholar": {
        const school = this.findNearestStructure(person, ["library", "school", "telecom", "hall"]);
        if (school) this.setTask(person, "study", school, "기술과 기록을 쌓는 중", 1.5);
        break;
      }
      case "engineer": {
        const infra = this.findNearestStructure(person, ["powerplant", "factory", "solar", "station", "telecom"]);
        if (infra) this.setTask(person, "power", infra, "설비와 에너지망을 유지하는 중", 1.3);
        break;
      }
      case "medic": {
        const patient = this.findNearestPatient(person);
        if (patient) {
          this.setTask(person, "heal", patient, "아픈 사람을 치료하는 중", 1.2);
          break;
        }
        const clinic = this.findNearestStructure(person, ["hospital"]);
        if (clinic) this.setTask(person, "heal", clinic, "의료 자원을 정비하는 중", 1.2);
        break;
      }
      case "guard": {
        const dinosaur = this.findNearestAnimalByPredicate(
          person,
          (animal) => isDinosaurSpecies(animal.species) && (animal.diet === "carnivore" || dist(person, animal) < 170),
          this.flags.modernAge ? 280 : 230
        );
        if (dinosaur) {
          this.setTask(person, "guard", dinosaur, `${this.labelForAnimal(dinosaur.species)}를 막아서는 중`, 1.1);
          break;
        }
        const wolf = this.findNearestAnimal(person, ["wolf"], false);
        if (wolf && this.flags.agriculture) {
          this.setTask(person, "guard", wolf, "가축과 도시를 위협하는 야생을 밀어내는 중", 1.2);
          break;
        }
        const guardPost = this.findNearestStructure(person, ["tower", "wall", "hall"]);
        if (guardPost) this.setTask(person, "guard", guardPost, "도시 외곽을 순찰하는 중", 1.2);
        break;
      }
      case "driver":
        this.setTask(person, "drive", this.routes.road[2], "도로와 차량 흐름을 관리하는 중", 1.0);
        break;
      default:
        break;
    }
    if (!person.target) {
      this.setTask(person, "wander", { x: randomFrom(this.rng, 120, 860), y: randomFrom(this.rng, 180, 520) }, "새로운 자리와 자원을 둘러보는 중", 1.0);
    }
  }

  setTask(person, taskKey, target, label, duration) {
    person.taskKey = taskKey;
    person.target = target;
    person.taskLabel = label;
    person.taskDuration = duration;
    person.taskTimer = 0;
  }

  moveAndAct(person, scaledDt) {
    if (!person.target) return;
    const moveSpeed = (15 + this.eraIndex * 1.5) * person.speedFactor * (this.hasDisaster("snow") ? 0.8 : 1);
    const target = person.target;
    const dx = target.x - person.x;
    const dy = target.y - person.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 8) {
      person.x += (dx / distance) * moveSpeed * scaledDt;
      person.y += (dy / distance) * moveSpeed * scaledDt;
      if (person.taskKey === "hunt" && target.species) target.escape = 1.4;
      return;
    }
    person.taskTimer += scaledDt;
    if (person.taskTimer >= person.taskDuration) {
      this.resolveTask(person);
      person.taskTimer = 0;
      person.target = null;
    }
  }

  resolveTask(person) {
    switch (person.taskKey) {
      case "eat":
        if (this.resources.food > 1) {
          this.resources.food -= 1.1;
          person.hunger = clamp(person.hunger - 48, 0, 100);
          person.health = clamp(person.health + 2, 0, 100);
          person.energy = clamp(person.energy + 4, 0, 100);
          if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "eat");
        }
        break;
      case "warm":
        person.warmth = clamp(person.warmth + 42, 0, 100);
        person.energy = clamp(person.energy + 8, 0, 100);
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "warm");
        break;
      case "heal":
        if (person.target && typeof person.target.health === "number") person.target.health = clamp(person.target.health + 12, 0, 100);
        person.health = clamp(person.health + 4, 0, 100);
        this.resources.knowledge += 0.2;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "heal");
        break;
      case "forage":
        if (person.target && typeof person.target.growth === "number") {
          person.target.growth = clamp(person.target.growth - 18, 5, person.target.maxGrowth);
          this.resources.food += 2.2;
          this.resources.knowledge += 0.08;
          this.ecology.vegetation -= 0.08;
          this.emitInteractionBurst(person.target.x, person.target.y, "forage");
        }
        break;
      case "lumber":
        if (person.target && typeof person.target.growth === "number") {
          person.target.growth = clamp(person.target.growth - 20, 8, person.target.maxGrowth);
          this.resources.wood += 2.5;
          this.ecology.vegetation -= 0.18;
          this.emitInteractionBurst(person.target.x, person.target.y, "lumber");
        }
        break;
      case "hunt":
        if (person.target && person.target.species) {
          this.emitInteractionBurst(person.target.x, person.target.y, "hunt");
          if (isDinosaurSpecies(person.target.species)) {
            const killed = this.damageDinosaur(person.target, this.getHumanDinosaurDamage(person, "hunt"), { cause: "human", attackers: 1 });
            this.resources.knowledge += killed ? 0.32 : 0.18;
            break;
          }
          this.resources.food += 3.4;
          this.resources.knowledge += 0.15;
          this.ecology.wildlife -= 0.25;
          this.resetAnimal(person.target);
        }
        break;
      case "fish":
        this.resources.food += 2.8;
        this.resources.knowledge += 0.12;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "fish");
        if (person.target && person.target.species === "fish") this.resetAnimal(person.target);
        break;
      case "farm":
        if (person.target && typeof person.target.growth === "number") {
          if (person.target.growth > 60) {
            this.resources.food += person.target.type === "crop" ? 4.4 : 3.2;
            person.target.growth = 18;
            if (this.rng() > 0.86) this.log(person.target.type === "crop" ? "곡식 수확이 이어지며 인구를 더 먹여 살릴 여력이 생깁니다." : "과수원에서 과일이 쏟아지며 저장 식량이 늘어납니다.");
          } else {
            person.target.growth = clamp(person.target.growth + 18, 0, person.target.maxGrowth);
            this.resources.food += 0.6;
          }
          this.resources.knowledge += 0.05;
          this.emitInteractionBurst(person.target.x, person.target.y, "farm");
        }
        break;
      case "herd":
        this.resources.food += 1.6;
        this.resources.knowledge += 0.08;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "herd");
        if (this.rng() > 0.9 && this.countDomesticAnimals() < 18) this.animals.push(this.makeAnimal(this.rng() > 0.45 ? "sheep" : "cattle", true));
        break;
      case "build":
        if (person.target && typeof person.target.progress === "number") {
          person.target.progress += 24 + this.eraIndex * 4;
          this.resources.knowledge += 0.08;
          this.emitInteractionBurst(person.target.x, person.target.y, "build");
          if (person.target.progress >= 100) this.finishConstruction(person.target);
        }
        break;
      case "mine":
        this.resources.stone += this.eraIndex >= 6 ? 1.1 : 2.4;
        this.resources.metal += this.eraIndex >= 6 ? 2.2 : 0.25;
        this.resources.knowledge += 0.08;
        this.emitInteractionBurst(760, 238, "mine");
        break;
      case "craft":
        this.resources.knowledge += 0.42;
        this.resources.energy += this.eraIndex >= 5 ? 0.35 : 0.12;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "craft");
        if (this.rng() > 0.92) this.log("장인과 저장시설 운영 덕분에 자원이 더 효율적으로 돌기 시작합니다.");
        break;
      case "trade":
        this.resources.food += 0.8;
        this.resources.metal += this.eraIndex >= 4 ? 0.35 : 0;
        this.resources.knowledge += 0.55;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "trade");
        break;
      case "study":
        this.resources.knowledge += 0.92;
        this.resources.energy -= this.eraIndex >= 7 ? 0.18 : 0;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "study");
        break;
      case "power":
        this.resources.energy += this.eraIndex >= 7 ? 2.4 : 1.6;
        this.resources.knowledge += 0.18;
        this.ecology.pollution += this.countStructures("solar") > 0 ? 0.01 : 0.08;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "power");
        break;
      case "guard":
        this.resources.knowledge += 0.1;
        if (person.target && isDinosaurSpecies(person.target.species)) {
          this.emitInteractionBurst(person.target.x, person.target.y, "guard");
          const killed = this.damageDinosaur(person.target, this.getHumanDinosaurDamage(person, "guard"), { cause: "human", attackers: 1 });
          if (!killed) this.resources.knowledge += 0.08;
          break;
        }
        if (person.target && person.target.species === "wolf") {
          this.emitInteractionBurst(person.target.x, person.target.y, "guard");
          this.resetAnimal(person.target);
          if (this.rng() > 0.85) this.log("수호자들이 늑대를 몰아내며 가축 우리를 지켰습니다.");
        }
        break;
      case "drive":
        this.resources.energy += 0.3;
        this.resources.knowledge += 0.24;
        if (person.target) this.emitInteractionBurst(person.target.x, person.target.y, "drive");
        break;
      default:
        this.resources.knowledge += 0.03;
        person.energy = clamp(person.energy + 1.2, 0, 100);
        break;
    }
  }
  finishConstruction(site) {
    this.addStructure(site.kind, site.x, site.y, { key: site.key, size: site.size, width: site.width, height: site.height, meta: site.meta });
    this.constructionSites = this.constructionSites.filter((candidate) => candidate.id !== site.id);
    if (["granary", "market", "dock", "windmill", "factory", "station", "powerplant", "hospital", "school", "telecom", "apartment"].includes(site.kind)) {
      this.log(`${this.labelForStructure(site.kind)} 완공되며 도시의 성격이 한 단계 바뀝니다.`);
    }
  }

  labelForStructure(kind) {
    const labels = { campfire: "공동 불씨", tent: "천막", totem: "토템", hut: "오두막", workshop: "작업장", quarry: "채석장", granary: "곡물창고", pen: "가축 우리", market: "시장", bridge: "다리", dock: "부두", library: "도서관", windmill: "풍차", hall: "중앙 전당", tower: "감시탑", wall: "성벽", factory: "공장", station: "기차역", warehouse: "창고", powerplant: "발전소", apartment: "아파트", hospital: "병원", school: "학교", solar: "태양광 발전기", telecom: "통신탑" };
    return labels[kind] || kind;
  }

  resetAnimal(animal) {
    if (animal.domestic) {
      animal.x = animal.homeX + randomFrom(this.rng, -animal.spread, animal.spread);
      animal.y = animal.homeY + randomFrom(this.rng, -animal.spread, animal.spread);
      return;
    }
    const zone = this.randomZoneForSpecies(animal.species, false);
    animal.x = zone.x + randomFrom(this.rng, -zone.spread, zone.spread);
    animal.y = zone.y + randomFrom(this.rng, -zone.spread, zone.spread);
    animal.homeX = zone.x;
    animal.homeY = zone.y;
    animal.spread = zone.spread;
  }

  clearTargetsForEntity(entity) {
    for (const person of this.getAlivePeople()) {
      if (person.target === entity) {
        person.target = null;
        person.taskTimer = 0;
      }
    }
  }

  removeAnimal(animal) {
    this.clearTargetsForEntity(animal);
    this.animals = this.animals.filter((candidate) => candidate.id !== animal.id);
  }

  findNearestStructure(person, kinds) {
    let best = null;
    let bestDistance = Infinity;
    for (const structure of this.structures) {
      if (!kinds.includes(structure.kind)) continue;
      const current = dist(person, structure);
      if (current < bestDistance) {
        bestDistance = current;
        best = structure;
      }
    }
    return best;
  }

  findNearestPlant(person, types) {
    let best = null;
    let bestDistance = Infinity;
    for (const plant of this.plants) {
      if (!types.includes(plant.type) || plant.growth < 18) continue;
      const current = dist(person, plant);
      if (current < bestDistance) {
        bestDistance = current;
        best = plant;
      }
    }
    return best;
  }

  findNearestAnimal(person, speciesList, domestic = null) {
    let best = null;
    let bestDistance = Infinity;
    for (const animal of this.animals) {
      if (!speciesList.includes(animal.species)) continue;
      if (domestic !== null && animal.domestic !== domestic) continue;
      const current = dist(person, animal);
      if (current < bestDistance) {
        bestDistance = current;
        best = animal;
      }
    }
    return best;
  }

  findNearestLivingPersonFrom(origin, maxDistance = Infinity) {
    let best = null;
    let bestDistance = maxDistance;
    for (const person of this.getAlivePeople()) {
      const current = dist(origin, person);
      if (current < bestDistance) {
        bestDistance = current;
        best = person;
      }
    }
    return best;
  }

  findNearestAnimalByPredicate(origin, predicate, maxDistance = Infinity) {
    let best = null;
    let bestDistance = maxDistance;
    for (const animal of this.animals) {
      if (!predicate(animal)) continue;
      const current = dist(origin, animal);
      if (current < bestDistance) {
        bestDistance = current;
        best = animal;
      }
    }
    return best;
  }

  findNearestSite(person) {
    let best = null;
    let bestDistance = Infinity;
    for (const site of this.constructionSites) {
      const current = dist(person, site);
      if (current < bestDistance) {
        bestDistance = current;
        best = site;
      }
    }
    return best;
  }

  findNearestPatient(person) {
    let best = null;
    let bestDistance = Infinity;
    for (const other of this.getAlivePeople()) {
      if (other.health > 62 || other.id === person.id) continue;
      const current = dist(person, other);
      if (current < bestDistance) {
        bestDistance = current;
        best = other;
      }
    }
    return best;
  }

  updateVehicles(scaledDt) {
    for (const vehicle of this.vehicles) {
      let modifier = 1;
      if (vehicle.type === "car" && this.hasDisaster("snow")) modifier = 0.75;
      if (vehicle.type === "boat" && this.hasDisaster("drought")) modifier = 0.7;
      vehicle.progress = (vehicle.progress + scaledDt * vehicle.speed * modifier) % 1;
    }
  }

  updateEconomy(scaledDt) {
    const alive = this.getAlivePeople();
    this.resources.food -= alive.length * scaledDt * 0.012;
    if (this.flags.fireAge) this.resources.wood -= this.countStructures("campfire") * scaledDt * 0.003;
    if (this.eraIndex >= 6) this.resources.energy -= scaledDt * (alive.length * 0.002 + this.countStructures("factory") * 0.01 + this.countStructures("apartment") * 0.008);
    this.resources.energy += this.countStructures("solar") * scaledDt * 0.03;
    this.resources.energy += this.countStructures("powerplant") * scaledDt * 0.04;
    this.resources.knowledge += this.eraIndex * scaledDt * 0.006;
    this.ecology.pollution -= scaledDt * (this.countStructures("solar") > 0 ? 0.035 : 0.015);
    this.ecology.pollution += this.countStructures("factory") * scaledDt * 0.018;
    this.ecology.pollution += this.countStructures("powerplant") * scaledDt * 0.02;
    const plantScore = average(this.plants.map((plant) => plant.growth)) + this.countPlants("crop") * 0.6 + this.countPlants("orchard") * 0.8;
    const wildlifeScore = this.animals.length * 3.3 + this.countAnimals("deer") * 2 + this.countAnimals("bird") * 1.2 + this.countDomesticAnimals() * 0.6 - this.countDinosaurs("carnivore") * 9 - this.countDinosaurs("herbivore") * 5;
    this.ecology.vegetation = clamp(plantScore - this.ecology.pollution * 0.7, 10, 100);
    this.ecology.wildlife = clamp(wildlifeScore - this.ecology.pollution * 0.45, 8, 100);
    this.resources.food = clamp(this.resources.food, 0, 600);
    this.resources.wood = clamp(this.resources.wood, 0, 500);
    this.resources.stone = clamp(this.resources.stone, 0, 500);
    this.resources.metal = clamp(this.resources.metal, 0, 400);
    this.resources.energy = clamp(this.resources.energy, 0, 500);
    this.resources.knowledge = clamp(this.resources.knowledge, 0, 400);
    this.ecology.pollution = clamp(this.ecology.pollution, 0, 100);
  }

  updateDemographics(yearDelta) {
    const alive = this.getAlivePeople();
    if (!alive.length) return;
    const demographic = this.getDemographicContext(alive);
    const capacityRoom = Math.max(0, this.getPopulationCapacity() - alive.length);
    const expectedNewAdults = Math.min(capacityRoom, alive.length * demographic.birthRate * yearDelta);
    let entrants = Math.floor(expectedNewAdults);
    if (this.rng() < expectedNewAdults - entrants) entrants += 1;
    if (entrants > 0) {
      const newcomers = this.createPopulation(entrants, {
        ageMin: 14,
        ageMax: 18,
        healthMin: 78,
        healthMax: 97,
        hungerMin: 12,
        hungerMax: 24,
        energyMin: 78,
        energyMax: 96,
        warmthMin: 72,
        warmthMax: 92
      });
      this.people.push(...newcomers);
      this.rebalanceRoles();
      this.log(`정착과 양육 여건이 나아지며 새 세대 ${entrants}명이 성인이 되어 공동체에 합류합니다.`);
    }
    const collapsePressure = Math.max(0, 0.34 - demographic.foodSecurity) + Math.max(0, demographic.crowding - 1) * 0.7 + demographic.disasterPenalty / 24 + demographic.dinosaurPenalty * 0.1;
    if (alive.length > 8 && collapsePressure > 0.18 && this.rng() < yearDelta * collapsePressure * 0.1) {
      const vulnerable = [...alive].sort((left, right) => (right.age - right.lifeExpectancy) - (left.age - left.lifeExpectancy) || left.health - right.health)[0];
      if (vulnerable) this.recordDeath(vulnerable, "collapse");
    }
  }

  getEraHighlights() {
    const era = this.getEra();
    const demographic = this.getDemographicContext();
    const items = [
      `${era.name}: ${era.summary}`,
      `평균 기대 수명 ${Math.round(this.getAverageLifeExpectancy())}세, 주거 안정 ${Math.round(demographic.shelterCoverage * 100)}%, 위생 ${Math.round(demographic.sanitationIndex * 100)}% 수준입니다.`,
      `지식 ${Math.round(this.resources.knowledge)}, 에너지 ${Math.round(this.resources.energy)}, 오염 ${Math.round(this.ecology.pollution)} 수준입니다.`
    ];
    if (this.hasDinosaurs()) items.push(`복원 공룡 ${this.countDinosaurs()}마리가 생태계를 뒤흔들며 평균 기대 수명과 개체수를 끌어내리고 있습니다.`);
    if (this.flags.agriculture) items.push(`농경지 ${this.countPlants("crop")}곳, 과수원 ${this.countPlants("orchard")}곳, 가축 ${this.countDomesticAnimals()}마리가 문명을 지탱합니다.`);
    if (this.flags.cityAge) items.push(`시장 ${this.countStructures("market")}곳, 부두 ${this.countStructures("dock")}곳, 배 ${this.countVehicles("boat")}척이 물자 흐름을 만듭니다.`);
    if (this.flags.industryAge) items.push(`공장 ${this.countStructures("factory")}곳, 철도 ${this.countVehicles("train")}량, 금속 ${Math.round(this.resources.metal)} 단위가 산업 구조를 키웁니다.`);
    if (this.flags.modernAge) items.push(`병원 ${this.countStructures("hospital")}곳, 학교 ${this.countStructures("school")}곳, 자동차 ${this.countVehicles("car")}대가 현대 도시의 리듬을 보여줍니다.`);
    return items.slice(0, 5);
  }

  getInteractionNotes() {
    const alive = this.getAlivePeople();
    const taskCounts = alive.reduce((acc, person) => {
      acc[person.taskKey] = (acc[person.taskKey] || 0) + 1;
      return acc;
    }, {});
    const items = [];
    if (this.hasDinosaurs()) items.push(`복원된 공룡 ${this.countDinosaurs()}마리가 평원을 배회하며 사람과 동물 수를 압박하고 있습니다.`);
    if (this.countDinosaurs("carnivore")) items.push(`육식 공룡 ${this.countDinosaurs("carnivore")}마리가 사람과 육상 동물을 직접 사냥하고 있습니다.`);
    if (this.countDinosaurs("herbivore")) items.push(`초식 공룡 ${this.countDinosaurs("herbivore")}마리가 식생을 뜯어먹고 가까운 생물을 짓밟고 있습니다.`);
    if (this.hasDinosaurs() && (taskCounts.hunt || taskCounts.guard)) items.push(`사냥꾼과 수호자 ${Math.max(0, (taskCounts.hunt || 0) + (taskCounts.guard || 0))}명이 공룡을 포위하며 집단 반격을 시도하고 있습니다.`);
    if (taskCounts.forage) items.push(`채집자 ${taskCounts.forage}명이 열매와 약초를 모으며 숲의 식물을 이용하고 있습니다.`);
    if (taskCounts.hunt) items.push(`사냥꾼 ${taskCounts.hunt}명이 사슴과 멧돼지를 추적하며 야생동물과 직접 맞닿아 있습니다.`);
    if (taskCounts.fish) items.push(`어부 ${taskCounts.fish}명이 강과 하구에서 물고기를 얻고 있습니다.`);
    if (taskCounts.farm) items.push(`농부 ${taskCounts.farm}명이 밭과 과수원을 돌보며 식생을 문명 자원으로 바꾸고 있습니다.`);
    if (taskCounts.herd) items.push(`목동 ${taskCounts.herd}명이 양, 소, 말과 함께 움직이며 가축 경제를 키웁니다.`);
    if (taskCounts.build) items.push(`건축자 ${taskCounts.build}명이 새 시대의 건물을 올리고 있습니다.`);
    if (taskCounts.power) items.push(`기술자 ${taskCounts.power}명이 공장, 발전소, 태양광 설비를 유지합니다.`);
    items.push(`숲과 들판에는 사슴 ${this.countAnimals("deer")}마리, 멧돼지 ${this.countAnimals("boar")}마리, 늑대 ${this.countAnimals("wolf")}마리가 보입니다.`);
    items.push(`강과 바다에는 물고기 ${this.countAnimals("fish")}마리, 하늘에는 새 ${this.countAnimals("bird")}마리가 움직입니다.`);
    return items.slice(0, 5);
  }

  updateUi() {
    const alive = this.getAlivePeople();
    const focus = this.getFocusDisplay();
    const dinosaursActive = this.hasDinosaurs();
    ui.playPauseBtn.textContent = this.running ? "일시정지" : "다시 재생";
    ui.speedButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.speed) === this.speed));
    if (ui.dinosaurToggleBtn) {
      ui.dinosaurToggleBtn.dataset.dinosaurAction = dinosaursActive ? "extinct" : "resurrect";
      ui.dinosaurToggleBtn.textContent = dinosaursActive ? "공룡 멸종" : "공룡 부활";
      ui.dinosaurToggleBtn.classList.toggle("ghost", dinosaursActive);
    }
    ui.population.textContent = String(alive.length);
    ui.lifeExpectancy.textContent = `${Math.round(this.getAverageLifeExpectancy())}세`;
    ui.food.textContent = String(Math.round(this.resources.food));
    ui.energy.textContent = String(Math.round(this.resources.energy));
    ui.wildlife.textContent = `${Math.round(this.ecology.wildlife)}%`;
    ui.vegetation.textContent = `${Math.round(this.ecology.vegetation)}%`;
    ui.structures.textContent = String(this.structures.length);
    ui.era.textContent = this.getEra().name;
    ui.unlockList.innerHTML = this.getEraHighlights().map((entry) => `<li>${entry}</li>`).join("");
    ui.interactionList.innerHTML = this.getInteractionNotes().map((entry) => `<li>${entry}</li>`).join("");
    ui.eventLog.innerHTML = this.logs.map((entry) => `<li>${entry}</li>`).join("");
    ui.focusKicker.textContent = focus.kicker;
    ui.focusTitle.textContent = focus.title;
    ui.focusDescription.textContent = focus.description;
    const alertTags = this.activeDisasters.map((disaster) => `<span class="tag ${disaster.type}">${disasterConfigs[disaster.type].label} ${disaster.remaining.toFixed(1)}년</span>`);
    if (this.hasDinosaurs()) alertTags.unshift(`<span class="tag dinosaur">공룡 출현 초식 ${this.countDinosaurs("herbivore")} / 육식 ${this.countDinosaurs("carnivore")}</span>`);
    if (alertTags.length === 0) ui.activeDisasters.innerHTML = `<span class="tag">평온함</span>`;
    else ui.activeDisasters.innerHTML = alertTags.join("");
  }

  getNightFactor() {
    const hour = (this.timeYears * 2.4) % 24;
    const distanceToNight = Math.min(Math.abs(hour - 22), Math.abs(hour - 2), Math.abs(hour - 24));
    return clamp(1 - distanceToNight / 6, 0, 1);
  }

  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.renderTerrain();
    this.renderPlants();
    this.renderConstructionSites();
    this.renderStructures();
    this.renderAnimals();
    this.renderVehicles();
    this.renderInteractionLinks();
    this.renderPeople();
    this.renderOverlay();
    this.renderInteractionBursts();
    this.renderFocusHighlight();
    this.renderHudOnCanvas();
  }

  renderTerrain() {
    const night = this.getNightFactor();
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, `rgba(${Math.round(177 - night * 80)}, ${Math.round(208 - night * 100)}, ${Math.round(190 - night * 80)}, 1)`);
    sky.addColorStop(1, `rgba(${Math.round(124 - night * 40)}, ${Math.round(162 - night * 55)}, ${Math.round(104 - night * 35)}, 1)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d4ddc2";
    ctx.fillRect(0, 0, canvas.width, 110);
    ctx.fillStyle = "#3f7746";
    ctx.beginPath();
    ctx.ellipse(190, 285, 230, 155, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6da8cf";
    ctx.beginPath();
    ctx.moveTo(455, -10);
    ctx.bezierCurveTo(430, 140, 565, 260, 528, 590);
    ctx.lineTo(612, 590);
    ctx.bezierCurveTo(640, 280, 510, 150, 548, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#527070";
    ctx.beginPath();
    ctx.moveTo(635, 78);
    ctx.lineTo(950, 52);
    ctx.lineTo(960, 400);
    ctx.lineTo(690, 452);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b7c8d2";
    ctx.beginPath();
    ctx.ellipse(785, 86, 200, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8a272";
    ctx.fillRect(0, 462, canvas.width, 118);
    ctx.fillStyle = "#77a8c7";
    ctx.beginPath();
    ctx.moveTo(760, 462);
    ctx.lineTo(960, 430);
    ctx.lineTo(960, 580);
    ctx.lineTo(760, 580);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 245, 225, 0.32)";
    ctx.font = "12px Georgia";
    ctx.fillText("숲 지대", 112, 166);
    ctx.fillText("강", 520, 154);
    ctx.fillText("절벽 지대", 742, 170);
    ctx.fillText("해안", 860, 506);
    ctx.fillStyle = "rgba(255, 238, 196, 0.12)";
    for (let i = 0; i < 12; i += 1) {
      ctx.beginPath();
      ctx.arc(60 + i * 80, 72 + Math.sin(this.weatherPulse * 0.12 + i) * 8, 2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.eraIndex >= 4) {
      ctx.strokeStyle = "rgba(157, 123, 84, 0.7)";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      this.routes.road.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    if (this.eraIndex >= 6) {
      ctx.strokeStyle = "rgba(67, 57, 61, 0.82)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      this.routes.rail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.strokeStyle = "rgba(210, 190, 150, 0.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i += 1) {
        const p = pathPoint(this.routes.rail, i / 14);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 7);
        ctx.lineTo(p.x, p.y + 7);
        ctx.stroke();
      }
    }
  }

  renderPlants() {
    for (const plant of this.plants) {
      ctx.fillStyle = "rgba(36, 27, 17, 0.08)";
      ctx.beginPath();
      ctx.ellipse(plant.x, plant.y + 10, plant.type === "tree" || plant.type === "orchard" ? 11 : 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      if (plant.type === "tree") {
        ctx.fillStyle = "#6d4f2d";
        ctx.fillRect(plant.x - 3, plant.y - 1, 6, 18 + plant.growth * 0.05);
        ctx.fillStyle = plant.growth > 60 ? "#4d7d45" : "#6a8349";
        ctx.beginPath();
        ctx.arc(plant.x, plant.y - 6, 12 + plant.growth * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(139, 184, 109, 0.35)";
        ctx.beginPath();
        ctx.arc(plant.x - 4, plant.y - 10, 6 + plant.growth * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }
      if (plant.type === "berry") {
        ctx.fillStyle = "#5f8743";
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, 10 + plant.growth * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8d3a4d";
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(plant.x - 6 + i * 4, plant.y - 3 + (i % 2) * 4, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (plant.type === "herb") {
        ctx.strokeStyle = "#84a85a";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(plant.x, plant.y + 8);
        ctx.lineTo(plant.x - 4, plant.y - 7);
        ctx.lineTo(plant.x + 5, plant.y - 10);
        ctx.lineTo(plant.x, plant.y + 2);
        ctx.lineTo(plant.x + 6, plant.y - 2);
        ctx.stroke();
      }
      if (plant.type === "crop") {
        ctx.strokeStyle = plant.growth > 55 ? "#d7c35c" : "#a7b753";
        ctx.lineWidth = 2;
        for (let i = -5; i <= 5; i += 5) {
          ctx.beginPath();
          ctx.moveTo(plant.x + i, plant.y + 8);
          ctx.lineTo(plant.x + i, plant.y - 8 - plant.growth * 0.06);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(237, 215, 111, 0.25)";
        ctx.fillRect(plant.x - 10, plant.y + 8, 20, 4);
      }
      if (plant.type === "orchard") {
        ctx.fillStyle = "#6d4f2d";
        ctx.fillRect(plant.x - 3, plant.y - 4, 6, 22);
        ctx.fillStyle = "#5b8b45";
        ctx.beginPath();
        ctx.arc(plant.x, plant.y - 10, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d68c4e";
        ctx.beginPath();
        ctx.arc(plant.x - 5, plant.y - 12, 2.8, 0, Math.PI * 2);
        ctx.arc(plant.x + 4, plant.y - 7, 2.8, 0, Math.PI * 2);
        ctx.arc(plant.x + 1, plant.y - 14, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderConstructionSites() {
    for (const site of this.constructionSites) {
      ctx.strokeStyle = "rgba(244, 222, 184, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(site.x - site.width / 2, site.y - site.height / 2, site.width, site.height);
      ctx.beginPath();
      ctx.moveTo(site.x - site.width / 2, site.y - site.height / 2);
      ctx.lineTo(site.x + site.width / 2, site.y + site.height / 2);
      ctx.moveTo(site.x + site.width / 2, site.y - site.height / 2);
      ctx.lineTo(site.x - site.width / 2, site.y + site.height / 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 201, 111, 0.55)";
      ctx.fillRect(site.x - site.width / 2, site.y + site.height / 2 + 4, (site.width * clamp(site.progress, 0, 100)) / 100, 5);
    }
  }

  renderStructures() {
    const night = this.getNightFactor();
    for (const s of this.structures) {
      const x = s.x;
      const y = s.y;
      ctx.fillStyle = "rgba(28, 19, 12, 0.12)";
      ctx.beginPath();
      ctx.ellipse(x, y + (s.kind === "telecom" ? 46 : 14), Math.max(10, (s.width || s.size || 20) * 0.28), s.kind === "telecom" ? 4 : 5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (s.kind === "campfire") {
        ctx.fillStyle = "rgba(255, 182, 79, 0.34)";
        ctx.beginPath();
        ctx.arc(x, y, 12 + Math.sin(this.weatherPulse * 5 + x) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffcb67";
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x + 8, y + 6);
        ctx.lineTo(x, y + 1);
        ctx.lineTo(x - 8, y + 6);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "tent") {
        ctx.fillStyle = "#835c3b";
        ctx.beginPath();
        ctx.moveTo(x, y - 16);
        ctx.lineTo(x + 18, y + 10);
        ctx.lineTo(x - 18, y + 10);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "totem") {
        ctx.fillStyle = "#704b2b";
        ctx.fillRect(x - 3, y - 20, 6, 24);
        ctx.fillStyle = "#c9ad78";
        ctx.fillRect(x - 7, y - 26, 14, 8);
      } else if (s.kind === "hut") {
        ctx.fillStyle = "#93653f";
        ctx.fillRect(x - 18, y - 10, 36, 20);
        ctx.fillStyle = "#704926";
        ctx.beginPath();
        ctx.moveTo(x - 22, y - 10);
        ctx.lineTo(x, y - 28);
        ctx.lineTo(x + 22, y - 10);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "workshop") {
        ctx.fillStyle = "#876240";
        ctx.fillRect(x - 24, y - 14, 48, 28);
        ctx.fillStyle = "#5d4228";
        ctx.fillRect(x - 28, y - 18, 56, 8);
      } else if (s.kind === "quarry") {
        ctx.fillStyle = "#8f8f95";
        ctx.fillRect(x - 38, y - 14, 76, 28);
        ctx.fillStyle = "#d6d7dc";
        for (let i = -26; i <= 26; i += 18) {
          ctx.beginPath();
          ctx.moveTo(x + i, y - 8);
          ctx.lineTo(x + i + 8, y);
          ctx.lineTo(x + i, y + 10);
          ctx.lineTo(x + i - 10, y + 2);
          ctx.closePath();
          ctx.fill();
        }
      } else if (s.kind === "granary") {
        ctx.fillStyle = "#b98c54";
        ctx.fillRect(x - 26, y - 16, 52, 32);
        ctx.fillStyle = "#7b532d";
        ctx.beginPath();
        ctx.moveTo(x - 30, y - 16);
        ctx.lineTo(x, y - 30);
        ctx.lineTo(x + 30, y - 16);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "pen") {
        ctx.strokeStyle = "#8f5c34";
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 40, y - 24, 80, 48);
      } else if (s.kind === "market") {
        ctx.fillStyle = "#6b4221";
        ctx.fillRect(x - 30, y - 12, 60, 24);
        ctx.fillStyle = "#c75d3c";
        ctx.beginPath();
        ctx.moveTo(x - 36, y - 12);
        ctx.lineTo(x, y - 30);
        ctx.lineTo(x + 36, y - 12);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "bridge") {
        ctx.fillStyle = "#8d6a45";
        ctx.fillRect(x - 55, y - 8, 110, 16);
      } else if (s.kind === "dock") {
        ctx.fillStyle = "#875b37";
        ctx.fillRect(x - 52, y - 8, 104, 16);
        ctx.fillRect(x + 20, y - 8, 10, 36);
      } else if (s.kind === "library") {
        ctx.fillStyle = "#c7b18b";
        ctx.fillRect(x - 26, y - 18, 52, 36);
        ctx.fillStyle = "#8f714e";
        ctx.fillRect(x - 30, y - 24, 60, 8);
      } else if (s.kind === "windmill") {
        ctx.fillStyle = "#e7dbc4";
        ctx.fillRect(x - 10, y - 34, 20, 42);
        ctx.strokeStyle = "#c9ad78";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 42);
        ctx.lineTo(x + 20, y - 54);
        ctx.moveTo(x, y - 42);
        ctx.lineTo(x - 20, y - 54);
        ctx.moveTo(x, y - 42);
        ctx.lineTo(x + 18, y - 30);
        ctx.moveTo(x, y - 42);
        ctx.lineTo(x - 18, y - 30);
        ctx.stroke();
      } else if (s.kind === "hall") {
        ctx.fillStyle = "#99959a";
        ctx.fillRect(x - 38, y - 20, 76, 40);
        ctx.fillStyle = "#676169";
        ctx.beginPath();
        ctx.moveTo(x - 42, y - 20);
        ctx.lineTo(x, y - 38);
        ctx.lineTo(x + 42, y - 20);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "tower") {
        ctx.fillStyle = "#7d797f";
        ctx.fillRect(x - 12, y - 44, 24, 54);
        ctx.fillRect(x - 18, y - 52, 36, 10);
      } else if (s.kind === "wall") {
        ctx.fillStyle = "#877b72";
        ctx.fillRect(x - s.width / 2, y - 6, s.width, 12);
      } else if (s.kind === "factory") {
        ctx.fillStyle = "#6b5753";
        ctx.fillRect(x - 42, y - 28, 84, 56);
        ctx.fillStyle = "#4d3d39";
        ctx.fillRect(x + 18, y - 52, 16, 30);
        ctx.fillRect(x - 12, y - 46, 14, 24);
      } else if (s.kind === "station") {
        ctx.fillStyle = "#8d6e55";
        ctx.fillRect(x - 45, y - 14, 90, 28);
        ctx.fillStyle = "#f1d7a8";
        ctx.fillRect(x - 38, y - 24, 76, 10);
      } else if (s.kind === "warehouse") {
        ctx.fillStyle = "#836349";
        ctx.fillRect(x - 36, y - 20, 72, 40);
        ctx.fillStyle = "#5d452f";
        ctx.fillRect(x - 10, y - 4, 20, 24);
      } else if (s.kind === "powerplant") {
        ctx.fillStyle = "#605962";
        ctx.fillRect(x - 38, y - 24, 76, 48);
        ctx.fillStyle = "#4f444e";
        ctx.fillRect(x + 22, y - 54, 12, 30);
      } else if (s.kind === "apartment") {
        ctx.fillStyle = "#9ba8b4";
        ctx.fillRect(x - 22, y - 56, 44, 76);
        ctx.fillStyle = "#7c8996";
        ctx.fillRect(x - 26, y - 64, 52, 10);
        if (night > 0.2) {
          ctx.fillStyle = `rgba(255, 222, 143, ${0.25 + night * 0.45})`;
          for (let row = 0; row < 4; row += 1) {
            for (let col = 0; col < 3; col += 1) ctx.fillRect(x - 14 + col * 12, y - 48 + row * 16, 7, 8);
          }
        }
      } else if (s.kind === "hospital") {
        ctx.fillStyle = "#d7ddd8";
        ctx.fillRect(x - 34, y - 24, 68, 48);
        ctx.fillStyle = "#c64e4e";
        ctx.fillRect(x - 6, y - 14, 12, 28);
        ctx.fillRect(x - 16, y - 4, 32, 8);
      } else if (s.kind === "school") {
        ctx.fillStyle = "#c2b28f";
        ctx.fillRect(x - 40, y - 20, 80, 40);
        ctx.fillStyle = "#7f5c39";
        ctx.beginPath();
        ctx.moveTo(x - 44, y - 20);
        ctx.lineTo(x, y - 36);
        ctx.lineTo(x + 44, y - 20);
        ctx.closePath();
        ctx.fill();
      } else if (s.kind === "solar") {
        ctx.fillStyle = "#4e6a87";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.2);
        ctx.fillRect(-36, -10, 72, 20);
        ctx.restore();
      } else if (s.kind === "telecom") {
        ctx.strokeStyle = "#d7d7df";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 42);
        ctx.lineTo(x, y - 52);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - 56, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (s.meta.damaged) {
        ctx.fillStyle = "rgba(175, 84, 67, 0.38)";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderAnimals() {
    for (const a of this.animals) {
      ctx.fillStyle = "rgba(38, 27, 18, 0.1)";
      ctx.beginPath();
      ctx.ellipse(a.x, a.y + 6, a.species === "bird" ? 4 : isDinosaurSpecies(a.species) ? 16 : 7, isDinosaurSpecies(a.species) ? 5 : 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (a.species === "deer") {
        ctx.fillStyle = "#7f5b3b";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 11, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(a.x + 6, a.y - 6, 5, 4);
      } else if (a.species === "boar") {
        ctx.fillStyle = "#574337";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(a.x + 7, a.y - 4, 5, 4);
      } else if (a.species === "wolf") {
        ctx.fillStyle = "#8a8e97";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 12, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(a.x + 7, a.y - 4, 5, 4);
      } else if (a.species === "bird") {
        ctx.strokeStyle = "#f3f7ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x - 6, a.y);
        ctx.lineTo(a.x, a.y - 4);
        ctx.lineTo(a.x + 6, a.y);
        ctx.stroke();
      } else if (a.species === "fish") {
        ctx.fillStyle = "#ebf5ff";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 8.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(a.x + 7, a.y);
        ctx.lineTo(a.x + 12, a.y - 4);
        ctx.lineTo(a.x + 12, a.y + 4);
        ctx.closePath();
        ctx.fill();
      } else if (a.species === "sheep") {
        ctx.fillStyle = "#f7f1e7";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7a6048";
        ctx.beginPath();
        ctx.arc(a.x + 6, a.y - 1, 3.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.species === "cattle") {
        ctx.fillStyle = "#8a5938";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 13, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(a.x + 7, a.y - 5, 6, 5);
      } else if (a.species === "horse") {
        ctx.fillStyle = "#4a3326";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(a.x + 8, a.y - 6, 6, 5);
      } else if (a.species === "triceratops") {
        ctx.fillStyle = "#758260";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 19, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x - 15, a.y - 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b8bf87";
        ctx.beginPath();
        ctx.arc(a.x - 20, a.y - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e7dfbf";
        ctx.beginPath();
        ctx.moveTo(a.x - 24, a.y - 5);
        ctx.lineTo(a.x - 33, a.y - 9);
        ctx.lineTo(a.x - 26, a.y - 1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(a.x - 17, a.y - 8);
        ctx.lineTo(a.x - 22, a.y - 18);
        ctx.lineTo(a.x - 14, a.y - 11);
        ctx.closePath();
        ctx.fill();
      } else if (a.species === "tyrannosaurus") {
        ctx.fillStyle = "#745642";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x + 16, a.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(a.x - 14, a.y - 2);
        ctx.lineTo(a.x - 34, a.y - 12);
        ctx.lineTo(a.x - 20, a.y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#463124";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.x - 4, a.y + 8);
        ctx.lineTo(a.x - 7, a.y + 18);
        ctx.moveTo(a.x + 6, a.y + 8);
        ctx.lineTo(a.x + 9, a.y + 20);
        ctx.stroke();
      }
      if (isDinosaurSpecies(a.species)) {
        const healthRatio = clamp((a.health || 0) / Math.max(a.maxHealth || 1, 1), 0, 1);
        ctx.fillStyle = "rgba(21, 16, 12, 0.72)";
        ctx.fillRect(a.x - 16, a.y - 28, 32, 4);
        ctx.fillStyle = a.diet === "carnivore"
          ? (healthRatio > 0.45 ? "#e58659" : "#f0c879")
          : (healthRatio > 0.45 ? "#b7d37f" : "#e8d48d");
        ctx.fillRect(a.x - 16, a.y - 28, 32 * healthRatio, 4);
        ctx.strokeStyle = a.diet === "carnivore" ? "rgba(224, 126, 85, 0.78)" : "rgba(186, 214, 129, 0.72)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (a.domestic) {
        ctx.strokeStyle = "rgba(255, 240, 205, 0.9)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.species === "bird" ? 7 : 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  renderVehicles() {
    for (const vehicle of this.vehicles) {
      const point = pathPoint(vehicle.path, vehicle.progress);
      if (vehicle.type === "boat") {
        ctx.fillStyle = "#7b4e32";
        ctx.beginPath();
        ctx.moveTo(point.x - 14, point.y + 3);
        ctx.lineTo(point.x + 14, point.y + 3);
        ctx.lineTo(point.x + 8, point.y + 10);
        ctx.lineTo(point.x - 8, point.y + 10);
        ctx.closePath();
        ctx.fill();
      } else if (vehicle.type === "cart") {
        ctx.fillStyle = "#8c6037";
        ctx.fillRect(point.x - 10, point.y - 6, 20, 12);
      } else if (vehicle.type === "train") {
        ctx.fillStyle = "#733b2b";
        ctx.fillRect(point.x - 18, point.y - 10, 36, 20);
        ctx.fillStyle = "#ebc668";
        ctx.fillRect(point.x - 8, point.y - 16, 12, 8);
      } else if (vehicle.type === "car") {
        ctx.fillStyle = "#5d748e";
        ctx.fillRect(point.x - 10, point.y - 6, 20, 12);
        ctx.fillStyle = "#d7eef7";
        ctx.fillRect(point.x - 4, point.y - 6, 8, 6);
      }
    }
  }

  renderInteractionLinks() {
    const activePeople = this.getAlivePeople()
      .filter((person) => person.target && typeof person.target.x === "number" && typeof person.target.y === "number" && !["idle", "wander"].includes(person.taskKey))
      .sort((a, b) => b.taskTimer - a.taskTimer)
      .slice(0, 16);
    ctx.save();
    for (const person of activePeople) {
      const visual = this.getTaskVisual(person.taskKey);
      const target = person.target;
      ctx.strokeStyle = visual.accent;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(person.x, person.y - 4);
      ctx.lineTo(target.x, target.y - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = visual.accent;
      ctx.beginPath();
      ctx.arc(person.x, person.y - 4, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = visual.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y - 2, 8 + Math.sin(this.weatherPulse * 4 + person.id) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderInteractionBursts() {
    ctx.save();
    for (const burst of this.interactionBursts) {
      const progress = 1 - burst.remaining / 1.1;
      ctx.globalAlpha = clamp(0.78 - progress * 0.6, 0.12, 0.78);
      ctx.fillStyle = burst.accent;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 5 + progress * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = burst.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius + progress * 9, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderFocusHighlight() {
    const entity = this.getEntityByRef(this.focusTarget);
    if (!entity) return;
    let x = entity.x;
    let y = entity.y;
    let label = "";
    let radius = 16;
    if (this.focusTarget.type === "person") {
      label = ROLE_META[entity.roleKey]?.label || "주민";
      radius = 15;
    } else if (this.focusTarget.type === "animal") {
      label = this.labelForAnimal(entity.species);
      radius = entity.species === "bird" ? 15 : 18;
    } else if (this.focusTarget.type === "plant") {
      label = this.labelForPlant(entity.type);
      radius = entity.type === "tree" || entity.type === "orchard" ? 18 : 14;
    } else if (this.focusTarget.type === "structure") {
      label = this.labelForStructure(entity.kind);
      radius = Math.max(entity.width || entity.size || 20, entity.height || entity.size || 20) * 0.52 + 10;
    } else if (this.focusTarget.type === "site") {
      label = `${this.labelForStructure(entity.kind)} 공사`;
      radius = Math.max(entity.width || 20, entity.height || 20) * 0.52 + 10;
    } else if (this.focusTarget.type === "vehicle") {
      const point = pathPoint(entity.path, entity.progress);
      x = point.x;
      y = point.y;
      label = this.labelForVehicle(entity.type);
      radius = 15;
    }
    ctx.save();
    ctx.strokeStyle = "#ffe0a1";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(x, y, radius + Math.sin(this.weatherPulse * 4 + x * 0.02) * 1.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(36, 26, 17, 0.82)";
    const width = Math.max(92, label.length * 15);
    ctx.fillRect(clamp(x - width / 2, 12, canvas.width - width - 12), clamp(y - radius - 34, 12, canvas.height - 38), width, 24);
    ctx.fillStyle = "#fff0d2";
    ctx.font = "12px Georgia";
    ctx.fillText(label, clamp(x - width / 2, 12, canvas.width - width - 12) + 10, clamp(y - radius - 34, 12, canvas.height - 38) + 16);
    ctx.restore();
  }

  renderPeople() {
    for (const person of this.getAlivePeople()) {
      const meta = ROLE_META[person.roleKey] || ROLE_META.wanderer;
      const visual = this.getTaskVisual(person.taskKey);
      ctx.fillStyle = "rgba(30, 20, 13, 0.16)";
      ctx.beginPath();
      ctx.ellipse(person.x, person.y + 8, 6, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = meta.color;
      ctx.beginPath();
      ctx.moveTo(person.x, person.y - 1);
      ctx.lineTo(person.x + 5, person.y + 10);
      ctx.lineTo(person.x - 5, person.y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f6dfbf";
      ctx.beginPath();
      ctx.arc(person.x, person.y - 4.5, 3.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = visual.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(person.x, person.y + 3);
      ctx.lineTo(person.x, person.y + 10);
      ctx.moveTo(person.x, person.y + 4);
      ctx.lineTo(person.x - 4, person.y + 7);
      ctx.moveTo(person.x, person.y + 4);
      ctx.lineTo(person.x + 4, person.y + 7);
      ctx.stroke();
      ctx.fillStyle = visual.color;
      ctx.beginPath();
      ctx.arc(person.x + 5.5, person.y - 7.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (person.health < 40) {
        ctx.fillStyle = "rgba(201, 95, 74, 0.85)";
        ctx.beginPath();
        ctx.arc(person.x - 6, person.y - 8, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderOverlay() {
    for (const disaster of this.activeDisasters) {
      ctx.fillStyle = disasterConfigs[disaster.type].color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (this.hasDisaster("rain")) {
      ctx.strokeStyle = "rgba(220, 235, 255, 0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 90; i += 1) {
        const x = (i * 47 + this.weatherPulse * 180) % (canvas.width + 30);
        const y = (i * 31 + this.weatherPulse * 160) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 18);
        ctx.stroke();
      }
    }
    if (this.hasDisaster("snow")) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      for (let i = 0; i < 80; i += 1) {
        const x = (i * 53 + this.weatherPulse * 60) % canvas.width;
        const y = (i * 37 + this.weatherPulse * 50) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (this.hasDisaster("drought")) {
      ctx.strokeStyle = "rgba(115, 88, 45, 0.3)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i += 1) {
        const x = 70 + i * 46;
        const y = 472 + (i % 3) * 18;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 12);
        ctx.lineTo(x + 28, y + 4);
        ctx.stroke();
      }
    }
    for (const scar of this.landslideScars) {
      ctx.fillStyle = "rgba(93, 60, 40, 0.32)";
      ctx.beginPath();
      ctx.arc(scar.x, scar.y, scar.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.ecology.pollution > 20) {
      ctx.fillStyle = `rgba(70, 70, 78, ${0.06 + this.ecology.pollution / 1000})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  renderHudOnCanvas() {
    ctx.fillStyle = "rgba(23, 17, 11, 0.45)";
    ctx.fillRect(14, 14, 300, 100);
    ctx.fillStyle = "#f5ead4";
    ctx.font = "13px Georgia";
    ctx.fillText(`${this.timeYears.toFixed(1)}년  |  ${this.getEra().name}  |  배속 ${this.speed}x`, 26, 38);
    ctx.fillText(`인구 ${this.getAlivePeople().length}  |  식량 ${Math.round(this.resources.food)}  |  에너지 ${Math.round(this.resources.energy)}`, 26, 60);
    ctx.fillText(`야생동물 ${Math.round(this.ecology.wildlife)}%  |  식생 ${Math.round(this.ecology.vegetation)}%  |  오염 ${Math.round(this.ecology.pollution)}%`, 26, 82);
    ctx.fillText(`건물 ${this.structures.length}  |  차량 ${this.vehicles.length}  |  지식 ${Math.round(this.resources.knowledge)}`, 26, 104);
  }
}

const sim = new CivilizationSim();

function frameLoop(now) {
  if (!frameLoop.lastTime) frameLoop.lastTime = now;
  const dt = Math.min((now - frameLoop.lastTime) / 1000, 0.05);
  frameLoop.lastTime = now;
  sim.update(dt);
  sim.render();
  requestAnimationFrame(frameLoop);
}

ui.startBtn.addEventListener("click", () => {
  sim.start();
});

ui.playPauseBtn.addEventListener("click", () => {
  if (!sim.started) sim.start();
  sim.toggleRunning();
});

ui.restartBtn.addEventListener("click", () => {
  sim.reset();
  sim.start();
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  sim.inspectAt(x, y);
});

for (const button of ui.speedButtons) {
  button.addEventListener("click", () => {
    const speed = Number(button.dataset.speed);
    sim.setSpeed(speed);
    ui.speedButtons.forEach((item) => item.classList.toggle("active", item === button));
  });
}

for (const button of ui.disasterButtons) {
  button.addEventListener("click", () => {
    if (!sim.started) sim.start();
    sim.triggerDisaster(button.dataset.disaster);
  });
}

if (ui.dinosaurToggleBtn) {
  ui.dinosaurToggleBtn.addEventListener("click", () => {
    if (!sim.started) sim.start();
    if (ui.dinosaurToggleBtn.dataset.dinosaurAction === "resurrect") sim.resurrectDinosaurs();
    else sim.extinctDinosaurs();
  });
}

window.addEventListener("keydown", async (event) => {
  if (event.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(() => {});
    else await document.exitFullscreen().catch(() => {});
  }
});

sim.updateUi();
sim.render();
requestAnimationFrame(frameLoop);
