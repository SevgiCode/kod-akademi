import { auth, db } from "./firebase-config.js";
import { translations } from "./translations.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const allCourses = ["html-mk", "html-tr", "javascript", "react"];

let currentUserData = null;
let loadedLessons = [];
let currentFilter = "all";
let t = translations.mk; // varsayılan dil: Makedonca
let currentLang = "mk";

const lessonGrid = document.getElementById("lessonGrid");
const studentName = document.getElementById("studentName");
const studentGroup = document.getElementById("studentGroup");
const logoutButton = document.getElementById("logoutButton");

// --- DİL SEÇİMİ ---
function detectLanguage(userData) {
  // html-tr grubundaki öğrenciler Türkçe görsün
  if (userData.group === "html-tr") {
    return "tr";
  }
  // Diğer herkes Makedonca
  return "mk";
}

// --- SAYFA METİNLERİNİ DİLE GÖRE DEĞİŞTİR ---
function applyLanguage() {
  // Sayfa başlığı
  document.title = t.pageTitle;

  // Sidebar logo
  document.querySelector(".logo span:last-child").textContent = t.logo;

  // Menü etiketleri
  document.querySelectorAll('[data-i18n="menuLabel"]').forEach((el) => {
    el.textContent = t.menuLabel;
  });
  document.querySelectorAll('[data-i18n="home"]').forEach((el) => {
    el.textContent = t.home;
  });
  document.querySelectorAll('[data-i18n="lessons"]').forEach((el) => {
    el.textContent = t.lessons;
  });
  document.querySelectorAll('[data-i18n="practice"]').forEach((el) => {
    el.textContent = t.practice;
  });
  document.querySelectorAll('[data-i18n="homework"]').forEach((el) => {
    el.textContent = t.homework;
  });
  document.querySelectorAll('[data-i18n="coursesLabel"]').forEach((el) => {
    el.textContent = t.coursesLabel;
  });
  document.querySelectorAll('[data-i18n="allCourses"]').forEach((el) => {
    el.textContent = t.allCourses;
  });
  document.querySelectorAll('[data-i18n="courseHtmlMk"]').forEach((el) => {
    el.textContent = t.courseHtmlMk;
  });
  document.querySelectorAll('[data-i18n="courseHtmlTr"]').forEach((el) => {
    el.textContent = t.courseHtmlTr;
  });

  // Hoş geldin
  document.querySelector('[data-i18n="welcomeEyebrow"]').textContent =
    t.welcomeEyebrow;
  document.querySelector('[data-i18n="welcomeTitle"]').textContent =
    t.welcomeTitle;
  document.querySelector('[data-i18n="welcomeText"]').textContent =
    t.welcomeText;

  // İstatistik başlıkları
  document.querySelector('[data-i18n="statTotal"]').textContent = t.statTotal;
  document.querySelector('[data-i18n="statCompleted"]').textContent =
    t.statCompleted;
  document.querySelector('[data-i18n="statPractice"]').textContent =
    t.statPractice;
  document.querySelector('[data-i18n="statHomework"]').textContent =
    t.statHomework;

  // Dersler bölümü
  document.querySelector('[data-i18n="lessonsEyebrow"]').textContent =
    t.lessonsEyebrow;
  document.querySelector('[data-i18n="lessonsTitle"]').textContent =
    t.lessonsTitle;
  document.querySelector('[data-i18n="viewAll"]').textContent = t.viewAll;
  document.querySelector('[data-i18n="filterAll"]').textContent = t.filterAll;
  document.querySelector('[data-i18n="filterHtmlMk"]').textContent =
    t.filterHtmlMk;
  document.querySelector('[data-i18n="filterHtmlTr"]').textContent =
    t.filterHtmlTr;

  // Pratik ve ödev başlıkları
  document.querySelector('[data-i18n="practiceEyebrow"]').textContent =
    t.practiceEyebrow;
  document.querySelector('[data-i18n="practiceTitle"]').textContent =
    t.practiceTitle;
  document.querySelector('[data-i18n="homeworkEyebrow"]').textContent =
    t.homeworkEyebrow;
  document.querySelector('[data-i18n="homeworkTitle"]').textContent =
    t.homeworkTitle;

  // Footer
  document.querySelector('[data-i18n="logout"]').textContent = t.logout;
  document.querySelector('[data-i18n="footerCopyright"]').textContent =
    t.footerCopyright;
  document.querySelector('[data-i18n="footerMotto"]').textContent =
    t.footerMotto;

  // Sayfa başlığı (breadcrumb)
  const currentPageTitle = document.getElementById("currentPageTitle");
  if (currentPageTitle) {
    const activeNav = document.querySelector(".nav-link.active");
    if (activeNav && activeNav.dataset.page === "dashboard") {
      currentPageTitle.textContent = t.home;
    }
  }
}

// --- FIREBASE AUTH ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const userReference = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userReference);

    if (!userSnapshot.exists()) {
      alert(translations.mk.alertNoProfile);
      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    currentUserData = userSnapshot.data();

    if (currentUserData.active !== true) {
      alert(translations.mk.alertInactive);
      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    // --- DİL SEÇİMİ ---
    currentLang = detectLanguage(currentUserData);
    t = translations[currentLang];
    applyLanguage();

    // Kullanıcı adı
    studentName.textContent = currentUserData.fullName || user.email;

    // Grup etiketi
    if (currentUserData.role === "teacher") {
      studentGroup.textContent = t.teacher;
      currentFilter = "all";
    } else {
      studentGroup.textContent = getCourseName(currentUserData.group);
      currentFilter = currentUserData.group;
    }

    configureCourseButtons();
    addCourseFilterEvents();
    await loadAllowedLessons();
  } catch (error) {
    console.error("Yükleme hatası:", error);
    lessonGrid.innerHTML = `
      <div class="empty-message">
        ${t.loadError}
      </div>
    `;
  }
});

// --- Kurs ismini geçerli dile göre döndür ---
function getCourseName(courseId) {
  const courseKeyMap = {
    "html-mk": "courseHtmlMk",
    "html-tr": "courseHtmlTr",
    javascript: "courseJs",
    react: "courseReact",
  };
  const key = courseKeyMap[courseId];
  return key ? t[key] : courseId;
}

function configureCourseButtons() {
  const courseButtons = document.querySelectorAll(".course-nav-btn");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (currentUserData.role === "teacher") {
    courseButtons.forEach((button) => {
      button.style.display = "flex";
    });
    filterButtons.forEach((button) => {
      button.style.display = "inline-flex";
    });
    updateActiveFilterButtons();
    return;
  }

  courseButtons.forEach((button) => {
    const canSeeCourse = button.dataset.course === currentUserData.group;
    button.style.display = canSeeCourse ? "flex" : "none";
  });

  filterButtons.forEach((button) => {
    const canSeeCourse = button.dataset.filter === currentUserData.group;
    button.style.display = canSeeCourse ? "inline-flex" : "none";
  });

  updateActiveFilterButtons();
}

function addCourseFilterEvents() {
  const courseButtons = document.querySelectorAll(".course-nav-btn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const viewAllButton = document.getElementById("viewAllLessonsBtn");

  courseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCourseFilter(button.dataset.course);
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCourseFilter(button.dataset.filter);
    });
  });

  if (viewAllButton) {
    viewAllButton.addEventListener("click", () => {
      setCourseFilter("all");
    });
  }
}

function setCourseFilter(filter) {
  if (currentUserData.role !== "teacher" && filter !== currentUserData.group) {
    return;
  }

  currentFilter = filter;
  updateActiveFilterButtons();
  renderFilteredLessons();

  document.getElementById("lessons").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function updateActiveFilterButtons() {
  document.querySelectorAll(".course-nav-btn").forEach((button) => {
    button.classList.toggle(
      "active-course",
      button.dataset.course === currentFilter,
    );
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle(
      "active-filter",
      button.dataset.filter === currentFilter,
    );
  });
}

async function loadAllowedLessons() {
  lessonGrid.innerHTML = `
    <div class="empty-message">
      ${t.loadingLessons}
    </div>
  `;

  const allowedCourses =
    currentUserData.role === "teacher" ? allCourses : [currentUserData.group];

  loadedLessons = [];

  for (const courseId of allowedCourses) {
    const lessonsReference = collection(db, "courses", courseId, "lessons");
    const lessonsQuery = query(lessonsReference, orderBy("order", "asc"));

    const lessonsSnapshot = await getDocs(lessonsQuery);

    lessonsSnapshot.forEach((lessonDocument) => {
      const data = lessonDocument.data();

      if (data.published === true) {
        loadedLessons.push({
          id: lessonDocument.id,
          course: courseId,
          courseName: getCourseName(courseId),
          ...data,
        });
      }
    });
  }

  renderFilteredLessons();
  updateTotalLessons(loadedLessons.length);
}

function renderFilteredLessons() {
  const filteredLessons =
    currentFilter === "all"
      ? loadedLessons
      : loadedLessons.filter((lesson) => lesson.course === currentFilter);

  renderLessons(filteredLessons);
}

function renderLessons(lessons) {
  if (!lessons.length) {
    lessonGrid.innerHTML = `
      <div class="empty-message">
        ${t.noLessonsInGroup}
      </div>
    `;
    return;
  }

  lessonGrid.innerHTML = lessons
    .map(
      (lesson) => `
        <article class="lesson-card">
          <div class="lesson-card-top ${lesson.course}"></div>
          <div class="lesson-card-body">
            <div class="lesson-card-meta">
              <span class="course-badge badge-${lesson.course}">
                ${escapeHtml(lesson.courseName)}
              </span>
              <span class="lesson-date">
                ${escapeHtml(lesson.date || "")}
              </span>
            </div>
            <h3>${escapeHtml(lesson.title)}</h3>
            <p class="lesson-card-description">
              ${escapeHtml(lesson.description || "")}
            </p>
            <div class="lesson-card-footer">
              <span class="lesson-info">
                ◷ ${escapeHtml(lesson.duration || "")}
              </span>
              <button
                class="open-lesson-btn"
                data-course-id="${lesson.course}"
                data-lesson-id="${lesson.id}"
              >
                ${t.openLesson} →
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  document.querySelectorAll(".open-lesson-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const lesson = loadedLessons.find(
        (item) =>
          item.course === button.dataset.courseId &&
          item.id === button.dataset.lessonId,
      );
      if (lesson) openLessonModal(lesson);
    });
  });
}
function renderFilteredHomeworks() {
  const filteredHomeworks =
    currentFilter === "all"
      ? loadedHomeworks
      : loadedHomeworks.filter((homework) => {
          return homework.course === currentFilter;
        });

  renderHomeworks(filteredHomeworks);
}

function renderHomeworks(homeworks) {
  if (!homeworkList) return;

  if (!homeworks.length) {
    homeworkList.innerHTML = `
      <div class="empty-message">
        ${t.noHomework}
      </div>
    `;
    return;
  }

  homeworkList.innerHTML = homeworks
    .map(
      (homework) => `
        <article class="homework-item">
          <button
            class="homework-check"
            type="button"
            aria-label="Ödevi tamamlandı olarak işaretle"
          ></button>

          <div class="homework-info">
            <h3>${escapeHtml(homework.title || "")}</h3>

            <p>
              ${escapeHtml(homework.courseName || "")}
              ·
              ${escapeHtml(homework.description || "")}
            </p>
          </div>

          <div class="homework-right">
            <span class="deadline">
              ${escapeHtml(homework.deadline || "")}
            </span>

            <span class="homework-status">
              ${t.homeworkPending || "Bekliyor"}
            </span>
          </div>
        </article>
      `,
    )
    .join("");
}
function openLessonModal(lesson) {
  const modal = document.getElementById("lessonModal");
  const modalContent = document.getElementById("modalContent");

  const practiceItems = Array.isArray(lesson.practice) ? lesson.practice : [];

  modalContent.innerHTML = `
    <div class="modal-header">
      <span class="course-badge badge-${lesson.course}">
        ${escapeHtml(lesson.courseName)}
      </span>
      <h2>${escapeHtml(lesson.title)}</h2>
    </div>
    <div class="modal-body">
      <section class="modal-section">
        <h3>${t.modalExplanation}</h3>
        <p>${formatText(lesson.explanation || t.noExplanation)}</p>
      </section>
      <section class="modal-section">
        <h3>${t.modalExample}</h3>
        <pre class="code-example"><code>${escapeHtml(
          lesson.example || t.noExample,
        )}</code></pre>
      </section>
      <section class="modal-section">
        <h3>${t.modalPractice}</h3>
        ${
          practiceItems.length
            ? `<ul>${practiceItems
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}</ul>`
            : `<p>${t.noPractice}</p>`
        }
      </section>
      <section class="modal-section">
        <h3>${t.modalHomework}</h3>
        <div class="assignment-box">
          <p>${formatText(lesson.homework || t.noHomework)}</p>
        </div>
      </section>
    </div>
  `;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function updateTotalLessons(count) {
  const el = document.getElementById("totalLessonsStat");
  if (el) el.textContent = count;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatText(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./login.html";
  } catch (error) {
    console.error("Çıkış hatası:", error);
    alert(t.alertLogoutError);
  }
});

const modal = document.getElementById("lessonModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

