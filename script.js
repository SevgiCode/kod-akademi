const lessons = [
  {
    id: 1,
    course: "html-mk",
    courseName: "HTML и CSS - Македонски",
    date: "22 септември 2026",
    title: "Основи на HTML: Наслови, параграфи и линкови",
    shortDescription:
      "Ја учиме основната структура на HTML ознаките и скелетот на една веб-страница.",
    duration: "45 мин",
    explanation: `
            HTML е јазик за означување што ја создава структурата на содржината на една веб-страница.
            За наслови се користат h1-h6, за текст p и за линкови ознаката a.
            Секој HTML документ мора да започнува со декларацијата <!DOCTYPE html>.
        `,
    example: `<!DOCTYPE html>
<html>
<head>
  <title>Мојата прва страница</title>
</head>
<body>
  <h1>Здраво свету!</h1>
  <p>Ова е мојата прва веб-страница.</p>
  <a href="https://google.com">Оди на Google</a>
</body>
</html>`,
    practice: [
      "Создај наслов h1.",
      "Додај краток текст од два параграфи за себе.",
      "Создај линк до веб-страница што ја сакаш.",
    ],
    homework:
      "Создај едноставна HTML страница што те претставува. На страницата нека има наслов, параграф, слика и барем еден линк.",
  },
  {
    id: 2,
    course: "html-tr",
    courseName: "HTML и CSS - Турски",
    date: "22 септември 2026",
    title: "Вовед во CSS и употреба на бои",
    shortDescription:
      "Со CSS ги менуваме боите, позадините и фонтовите на HTML елементите.",
    duration: "50 мин",
    explanation: `
            CSS овозможува уредување на изгледот на страницата создадена со HTML.
            CSS правилата се состојат од три главни дела: селектор, својство и вредност.
            На пример, кодот p { color: red; } ги прави сите параграфи црвени.
        `,
    example: `body {
  background-color: #f4f4f4;
  font-family: Arial, sans-serif;
}

h1 {
  color: #6d4aff;
}

p {
  color: #444;
  font-size: 18px;
}`,
    practice: [
      "Промени ја бојата на позадината на страницата.",
      "Прикажи го насловот во друга боја.",
      "Постави големината на фонтот на параграфите на 18px.",
    ],
    homework:
      "Додај CSS на личната HTML страница што ја подготви на претходната лекција. Користи барем три различни бои и две различни големини на фонт.",
  },
  {
    id: 3,
    course: "javascript",
    courseName: "JavaScript",
    date: "23 септември 2026",
    title: "Променливи: let, const и типови на податоци",
    shortDescription:
      "Ги разгледуваме JavaScript променливите и типовите на податоци: текст, број и boolean.",
    duration: "60 мин",
    explanation: `
            Во JavaScript користиме променливи за чување на податоци.
            За информации чија вредност ќе се менува се користи let, а за оние што нема да се менуваат — const.
            Во JavaScript постојат различни типови на податоци како string, number, boolean, array и object.
        `,
    example: `const ime = "Ана";
let vozrast = 14;
let ucenik = true;

console.log(ime);
console.log(vozrast);
console.log(ucenik);`,
    practice: [
      "Зачувај го твоето име, возраст и омилена боја во променливи.",
      "Испечати ги овие променливи со console.log().",
      "Промени ја вредноста на променливата за возраст и повторно испечати ја.",
    ],
    homework:
      "Создај 'профил на ученик' со барем пет различни информации. Зачувај име, возраст, град, статус на ученик и омилен предмет во променливи.",
  },
  {
    id: 4,
    course: "react",
    courseName: "React",
    date: "23 септември 2026",
    title: "Вовед во React: Логика на компоненти",
    shortDescription:
      "Ја учиме структурата на компонентите што ја сочинуваат основата на React проектите.",
    duration: "65 мин",
    explanation: `
            Со React, корисничките интерфејси се делат на мали и повеќекратно употребливи делови.
            Овие делови се нарекуваат компоненти. Компонентата обично се пишува како JavaScript функција
            и враќа JSX код. Имињата на компонентите мора да започнуваат со голема буква.
        `,
    example: `function Welcome() {
  return (
    <section>
      <h1>Здраво React!</h1>
      <p>Мојата прва компонента е готова.</p>
    </section>
  );
}

export default Welcome;`,
    practice: [
      "Создај компонента со име Hello.",
      "Во компонентата прикажи го твоето име со ознаката h1.",
      "Под него додај краток параграф со објаснување.",
    ],
    homework:
      "Создај компонента Profile што те претставува. Во компонентата нека бидат твоето име, градот во кој живееш, едно хоби и насловот на профилот.",
  },
  {
    id: 5,
    course: "html-mk",
    courseName: "HTML и CSS - Македонски",
    date: "25 септември 2026",
    title: "Листи и слики",
    shortDescription:
      "Ги учиме подредените/неподредените листи и додавањето слики со ознаката img.",
    duration: "50 мин",
    explanation: `
            Во HTML, за неподредена листа се користи ul, за подредена листа ol и за елементите на листата li.
            За додавање слика се користи ознаката img. Кај сликите е важно да се додаде
            атрибутот alt поради пристапност.
        `,
    example: `<h2>Технологии што ги сакам</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<img src="slika.jpg" alt="Ученик што пишува код">`,
    practice: [
      "Напиши ги твоите три омилени јадења како неподредена листа.",
      "Напиши ги твоите дневни обврски како подредена листа.",
      "Додај на страницата слика со значаен alt текст.",
    ],
    homework:
      "Дизајнирај веб-страница што го опишува твоето соништано патување. Користи барем еден наслов, две слики, една листа и еден линк.",
  },
  {
    id: 6,
    course: "javascript",
    courseName: "JavaScript",
    date: "25 септември 2026",
    title: "Услови: if, else if и else",
    shortDescription:
      "Условните изрази што му овозможуваат на програмот да одлучува според различни ситуации.",
    duration: "60 мин",
    explanation: `
            Условните изрази ни овозможуваат да извршуваме различен код кога некој услов е точен или неточен.
            if го проверува првиот услов, else if додава алтернативен услов, а else се извршува
            кога сите услови се неточни.
        `,
    example: `let ocenka = 75;

if (ocenka >= 85) {
  console.log("Одличен");
} else if (ocenka >= 50) {
  console.log("Успешен");
} else {
  console.log("Треба повеќе да вежбаш.");
}`,
    practice: [
      "Според променливата за возраст испечати дете, младинец или возрасен.",
      "Провери дали некој број е позитивен, негативен или нула.",
      "Прикажи порака за успех според оценката.",
    ],
    homework:
      "Напиши едноставен систем за пресметување на оценки. За 0-49 прикажи 'Неуспешен', за 50-69 'Среден', за 70-84 'Добар', за 85-100 'Одличен'.",
  },
];

const practices = [
  {
    id: 1,
    title: "Дизајнирај лична карта",
    description:
      "Користејќи HTML и CSS, создај профилна карта со твоето име, фотографија и краток опис.",
    course: "HTML и CSS",
    level: "Лесно",
    icon: "◫",
  },
  {
    id: 2,
    title: "Калкулатор за возраст",
    description:
      "Напиши JavaScript код што ја зема годината на раѓање и ја прикажува приближната возраст на корисникот.",
    course: "JavaScript",
    level: "Средно",
    icon: "⌘",
  },
  {
    id: 3,
    title: "Компонента за производ",
    description:
      "Создај повеќекратно употреблива React компонента со име, цена и слика на производот.",
    course: "React",
    level: "Средно",
    icon: "⚛",
  },
];

const homeworks = [
  {
    id: 1,
    title: "Лична претставувачка веб-страница",
    details: "Група HTML и CSS - Турски",
    deadline: "Предавање: 30 септември",
    status: "Во тек",
  },
  {
    id: 2,
    title: "Апликација за пресметување оценки",
    details: "Група JavaScript",
    deadline: "Предавање: 1 октомври",
    status: "Во тек",
  },
  {
    id: 3,
    title: "Проект Profile Component",
    details: "Група React",
    deadline: "Предавање: 2 октомври",
    status: "Во тек",
  },
];

let currentFilter = "all";
let showAllLessons = false;

function getStorageData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStorageData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function isCompleted(type, id) {
  return getStorageData(type).includes(id);
}

function toggleCompleted(type, id) {
  const completedItems = getStorageData(type);

  if (completedItems.includes(id)) {
    const updatedItems = completedItems.filter((itemId) => itemId !== id);
    saveStorageData(type, updatedItems);
    return false;
  }

  completedItems.push(id);
  saveStorageData(type, completedItems);
  return true;
}

function getCourseBadgeClass(course) {
  const classes = {
    "html-mk": "badge-html-mk",
    "html-tr": "badge-html-tr",
    javascript: "badge-javascript",
    react: "badge-react",
  };

  return classes[course] || "";
}

function renderLessons() {
  const lessonGrid = document.getElementById("lessonGrid");

  let filteredLessons = lessons.filter((lesson) => {
    return currentFilter === "all" || lesson.course === currentFilter;
  });

  if (!showAllLessons && currentFilter === "all") {
    filteredLessons = filteredLessons.slice(0, 3);
  }

  if (filteredLessons.length === 0) {
    lessonGrid.innerHTML = `
            <div class="empty-message">
                Во оваа категорија на курсеви сè уште нема лекции.
            </div>
        `;
    return;
  }

  lessonGrid.innerHTML = filteredLessons
    .map((lesson) => {
      const completed = isCompleted("completedLessons", lesson.id);

      return `
            <article class="lesson-card">
                <div class="lesson-card-top ${lesson.course}"></div>

                <div class="lesson-card-body">
                    <div class="lesson-card-meta">
                        <span class="course-badge ${getCourseBadgeClass(lesson.course)}">
                            ${lesson.courseName}
                        </span>

                        <span class="lesson-date">${lesson.date}</span>
                    </div>

                    <h3>${lesson.title}</h3>

                    <p class="lesson-card-description">
                        ${lesson.shortDescription}
                    </p>

                    <div class="lesson-card-footer">
                        <span class="lesson-info">
                            ${completed ? "✓ Завршена" : "◷ " + lesson.duration}
                        </span>

                        <button class="open-lesson-btn" onclick="openLesson(${lesson.id})">
                            Отвори лекција →
                        </button>
                    </div>
                </div>
            </article>
        `;
    })
    .join("");
}

function renderPractices() {
  const practiceGrid = document.getElementById("practiceGrid");

  practiceGrid.innerHTML = practices
    .map((practice) => {
      const completed = isCompleted("completedPractices", practice.id);

      let levelClass = "easy";

      if (practice.level === "Средно") {
        levelClass = "medium";
      }

      if (practice.level === "Тешко") {
        levelClass = "hard";
      }

      return `
            <article class="practice-card">
                <div class="practice-card-header">
                    <div class="practice-icon">${practice.icon}</div>
                    <span class="level-badge ${levelClass}">${practice.level}</span>
                </div>

                <h3>${practice.title}</h3>
                <p>${practice.description}</p>

                <div class="practice-card-footer">
                    <span class="course-mini-tag">${practice.course}</span>

                    <button
                        class="complete-practice-btn ${completed ? "completed" : ""}"
                        onclick="completePractice(${practice.id})"
                    >
                        ${completed ? "✓ Завршена" : "Заврши"}
                    </button>
                </div>
            </article>
        `;
    })
    .join("");
}

function renderHomeworks() {
  const homeworkList = document.getElementById("homeworkList");

  homeworkList.innerHTML = homeworks
    .map((homework) => {
      const completed = isCompleted("completedHomeworks", homework.id);

      return `
            <article class="homework-item">
                <button
                    class="homework-check ${completed ? "done" : ""}"
                    onclick="completeHomework(${homework.id})"
                    aria-label="Означи задачата како завршена"
                >
                    ${completed ? "✓" : ""}
                </button>

                <div class="homework-info">
                    <h3>${homework.title}</h3>
                    <p>${homework.details}</p>
                </div>

                <div class="homework-right">
                    <span class="deadline">${homework.deadline}</span>

                    <span class="homework-status ${completed ? "done-status" : ""}">
                        ${completed ? "Завршена" : homework.status}
                    </span>
                </div>
            </article>
        `;
    })
    .join("");
}

function updateStats() {
  const completedLessons = getStorageData("completedLessons").length;
  const completedPractices = getStorageData("completedPractices").length;
  const completedHomeworks = getStorageData("completedHomeworks").length;
  const pendingHomework = homeworks.length - completedHomeworks;

  document.getElementById("totalLessonsStat").textContent = lessons.length;
  document.getElementById("completedLessonsStat").textContent =
    completedLessons;
  document.getElementById("practiceStat").textContent =
    `${completedPractices}/${practices.length}`;
  document.getElementById("homeworkStat").textContent = pendingHomework;
}

function openLesson(id) {
  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) return;

  const completed = isCompleted("completedLessons", lesson.id);
  const modal = document.getElementById("lessonModal");
  const modalContent = document.getElementById("modalContent");

  modalContent.innerHTML = `
        <div class="modal-header">
            <span class="course-badge ${getCourseBadgeClass(lesson.course)}">
                ${lesson.courseName}
            </span>

            <h2>${lesson.title}</h2>
        </div>

        <div class="modal-body">
            <section class="modal-section">
                <h3>📚 Објаснување на темата</h3>
                <p>${lesson.explanation.trim()}</p>
            </section>

            <section class="modal-section">
                <h3>💻 Пример код</h3>
                <pre class="code-example"><code>${escapeHtml(lesson.example)}</code></pre>
            </section>

            <section class="modal-section">
                <h3>🎯 Практични задачи на лекцијата</h3>
                <ul>
                    ${lesson.practice.map((item) => `<li>${item}</li>`).join("")}
                </ul>
            </section>

            <section class="modal-section">
                <h3>🏠 Домашна задача</h3>
                <div class="assignment-box">
                    <p>${lesson.homework}</p>
                </div>
            </section>

            <div class="modal-actions">
                <button
                    class="modal-complete-btn ${completed ? "done" : ""}"
                    onclick="completeLesson(${lesson.id})"
                >
                    ${completed ? "✓ Лекцијата е завршена" : "Ја завршив лекцијата"}
                </button>
            </div>
        </div>
    `;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("lessonModal").classList.remove("show");
  document.body.style.overflow = "";
}

function completeLesson(id) {
  const status = toggleCompleted("completedLessons", id);

  showToast(
    status
      ? "Одлично! Лекцијата е означена како завршена."
      : "Лекцијата е отстранета од листата на завршени.",
  );

  updateStats();
  renderLessons();
  openLesson(id);
}

function completePractice(id) {
  const status = toggleCompleted("completedPractices", id);

  showToast(
    status
      ? "Практичната задача е означена како завршена."
      : "Практичната задача е повторно активна.",
  );

  renderPractices();
  updateStats();
}

function completeHomework(id) {
  const status = toggleCompleted("completedHomeworks", id);

  showToast(
    status
      ? "Домашната задача е означена како завршена."
      : "Домашната задача е вратена во листата на задачи во тек.",
  );

  renderHomeworks();
  updateStats();
}

function escapeHtml(text) {
  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function setFilter(filter) {
  currentFilter = filter;
  showAllLessons = true;

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active-filter", button.dataset.filter === filter);
  });

  document.querySelectorAll(".course-nav-btn").forEach((button) => {
    button.classList.toggle("active-course", button.dataset.course === filter);
  });

  renderLessons();

  document.getElementById("lessons").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function initializeEventListeners() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  document.querySelectorAll(".course-nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.course);
    });
  });

  document.getElementById("viewAllLessonsBtn").addEventListener("click", () => {
    currentFilter = "all";
    showAllLessons = true;

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.classList.toggle("active-filter", button.dataset.filter === "all");
    });

    document.querySelectorAll(".course-nav-btn").forEach((button) => {
      button.classList.toggle("active-course", button.dataset.course === "all");
    });

    renderLessons();

    document.getElementById("lessons").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  document
    .getElementById("modalCloseBtn")
    .addEventListener("click", closeModal);

  document.getElementById("lessonModal").addEventListener("click", (event) => {
    if (event.target.id === "lessonModal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    document.getElementById("themeBtn").textContent = isDarkMode ? "☀" : "☾";

    localStorage.setItem("darkMode", isDarkMode);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      const pageName = link.textContent.trim();
      document.getElementById("currentPageTitle").textContent = pageName;
    });
  });

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const mobileOverlay = document.getElementById("mobileOverlay");

  function openMobileMenu() {
    sidebar.classList.add("open");
    mobileOverlay.classList.add("show");
  }

  function closeMobileMenu() {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("show");
  }

  mobileMenuBtn.addEventListener("click", openMobileMenu);
  closeMenuBtn.addEventListener("click", closeMobileMenu);
  mobileOverlay.addEventListener("click", closeMobileMenu);

  document.querySelectorAll(".nav-link, .course-nav-btn").forEach((item) => {
    item.addEventListener("click", closeMobileMenu);
  });
}

function loadTheme() {
  const darkMode = localStorage.getItem("darkMode") === "true";

  if (darkMode) {
    document.body.classList.add("dark-mode");
    document.getElementById("themeBtn").textContent = "☀";
  }
}

function init() {
  loadTheme();
  renderLessons();
  renderPractices();
  renderHomeworks();
  updateStats();
  initializeEventListeners();
}

init();
