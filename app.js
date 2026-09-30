import { auth, db } from "./firebase-config.js";
import { translations } from "./translations.js";

import {
onAuthStateChanged,
signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"

import {
doc,
getDoc,
collection,
getDocs,
query,
orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"

const allCourses = [
"html-mk",
"html-tr",
"javascript",
"react",
];

let currentUserData = null;

let loadedLessons = [];
let loadedHomeworks = [];

let currentFilter = "all";

let t = translations.mk;
let currentLang = "mk";

const lessonGrid = document.getElementById("lessonGrid");
const homeworkList = document.getElementById("homeworkList");

const studentName = document.getElementById("studentName");
const studentGroup = document.getElementById("studentGroup");
const logoutButton = document.getElementById("logoutButton");

const modal = document.getElementById("lessonModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

/* --------------------------------------------------
DİL SEÇİMİ
-------------------------------------------------- */

function detectLanguage(userData) {
if (userData.group === "html-tr") {
return "tr";
}

  return "mk";
}

function applyLanguage() {
document.title = t.pageTitle;

  const logoText = document.querySelector(".logo span:last-child");

  if (logoText) {
logoText.textContent = t.logo;
}

  setTextForAll('[data-i18n="menuLabel"]', t.menuLabel);
setTextForAll('[data-i18n="home"]', t.home);
setTextForAll('[data-i18n="lessons"]', t.lessons);
setTextForAll('[data-i18n="practice"]', t.practice);
setTextForAll('[data-i18n="homework"]', t.homework);
setTextForAll('[data-i18n="coursesLabel"]', t.coursesLabel);
setTextForAll('[data-i18n="allCourses"]', t.allCourses);

  setTextForAll('[data-i18n="courseHtmlMk"]', t.courseHtmlMk);
setTextForAll('[data-i18n="courseHtmlTr"]', t.courseHtmlTr);
setTextForAll('[data-i18n="courseJs"]', t.courseJs);
setTextForAll('[data-i18n="courseReact"]', t.courseReact);

  setTextForOne('[data-i18n="welcomeEyebrow"]', t.welcomeEyebrow);
setTextForOne('[data-i18n="welcomeTitle"]', t.welcomeTitle);
setTextForOne('[data-i18n="welcomeText"]', t.welcomeText);

  setTextForOne('[data-i18n="statTotal"]', t.statTotal);
setTextForOne('[data-i18n="statCompleted"]', t.statCompleted);
setTextForOne('[data-i18n="statPractice"]', t.statPractice);
setTextForOne('[data-i18n="statHomework"]', t.statHomework);

  setTextForOne('[data-i18n="lessonsEyebrow"]', t.lessonsEyebrow);
setTextForOne('[data-i18n="lessonsTitle"]', t.lessonsTitle);
setTextForOne('[data-i18n="viewAll"]', t.viewAll);

  setTextForOne('[data-i18n="filterAll"]', t.filterAll);
setTextForOne('[data-i18n="filterHtmlMk"]', t.filterHtmlMk);
setTextForOne('[data-i18n="filterHtmlTr"]', t.filterHtmlTr);
setTextForOne('[data-i18n="filterJs"]', t.filterJs);
setTextForOne('[data-i18n="filterReact"]', t.filterReact);

  setTextForOne('[data-i18n="practiceEyebrow"]', t.practiceEyebrow);
setTextForOne('[data-i18n="practiceTitle"]', t.practiceTitle);

  setTextForOne('[data-i18n="homeworkEyebrow"]', t.homeworkEyebrow);
setTextForOne('[data-i18n="homeworkTitle"]', t.homeworkTitle);

  setTextForOne('[data-i18n="logout"]', t.logout);
setTextForOne('[data-i18n="footerCopyright"]', t.footerCopyright);
setTextForOne('[data-i18n="footerMotto"]', t.footerMotto);

  const currentPageTitle = document.getElementById("currentPageTitle");

  if (currentPageTitle) {
const activeNav = document.querySelector(".nav-link.active");

    if (activeNav?.dataset.page === "dashboard") {
currentPageTitle.textContent = t.home;
}
} }

function setTextForAll(selector, text) {
document.querySelectorAll(selector).forEach((element) => {
element.textContent = text || "";
});
}

function setTextForOne(selector, text) {
const element = document.querySelector(selector);

  if (element) {
element.textContent = text || "";
} }

/* --------------------------------------------------
AUTHENTICATION VE KULLANICI YÜKLEME
-------------------------------------------------- */

onAuthStateChanged(auth, async (user) => {
if (!user) {
window.location.href = "./login.html";
return;
}

  try {
const userReference = doc(db, "users", user.uid);
const userSnapshot = await getDoc(userReference);

    if (!userSnapshot.exists()) {
alert(translations.mk.alertNoProfile || "Kullanıcı profili bulunamadı.");

      await signOut(auth);
window.location.href = "./login.html";
return;
}

    currentUserData = userSnapshot.data();

    if (currentUserData.active !== true) {
alert(translations.mk.alertInactive || "Hesabınız aktif değil.");

      await signOut(auth);
window.location.href = "./login.html";
return;
}

    currentLang = detectLanguage(currentUserData);
t = translations[currentLang] || translations.mk;

    applyLanguage();

    if (studentName) {
studentName.textContent = currentUserData.fullName || user.email;
}

    if (currentUserData.role === "teacher") {
if (studentGroup) {
studentGroup.textContent = t.teacher || "Teacher";
}

      currentFilter = "all";
} else {
if (studentGroup) {
studentGroup.textContent = getCourseName(currentUserData.group);
}

      currentFilter = currentUserData.group;
}

    configureCourseButtons();
addCourseFilterEvents();

    await loadAllowedContent();
} catch (error) {
console.error("Yükleme hatası:", error);

    if (lessonGrid) {
lessonGrid.innerHTML = `
<div class="empty-message">
${escapeHtml(t.loadError || "İçerikler yüklenirken hata oluştu.")}
</div>
`;
}

    if (homeworkList) {
homeworkList.innerHTML = `
<div class="empty-message">
${escapeHtml(t.loadError || "İçerikler yüklenirken hata oluştu.")}
</div>
`;
}
} });

/* --------------------------------------------------
KURS İSİMLERİ
-------------------------------------------------- */

function getCourseName(courseId) {
const courseKeyMap = {
"html-mk": "courseHtmlMk",
"html-tr": "courseHtmlTr",
javascript: "courseJs",
react: "courseReact",
};

  const translationKey = courseKeyMap[courseId];

  if (translationKey && t[translationKey]) {
return t[translationKey];
}

  return courseId;
}

/* --------------------------------------------------
KURS FİLTRELERİ
-------------------------------------------------- */

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
const isAllowedCourse =
button.dataset.course === currentUserData.group;

    button.style.display = isAllowedCourse ? "flex" : "none";
});

  filterButtons.forEach((button) => {
const isAllowedCourse =
button.dataset.filter === currentUserData.group;

    button.style.display = isAllowedCourse ? "inline-flex" : "none";
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
} }

function setCourseFilter(filter) {
if (
currentUserData.role !== "teacher" &&
filter !== currentUserData.group
) {
return;
}

  currentFilter = filter;

  updateActiveFilterButtons();
renderFilteredLessons();
renderFilteredHomeworks();

  const lessonsSection = document.getElementById("lessons");

  if (lessonsSection) {
lessonsSection.scrollIntoView({
behavior: "smooth",
block: "start",
});
} }

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

/* --------------------------------------------------
FIRESTORE'DAN DERSLER VE ÖDEVLERİ YÜKLE
-------------------------------------------------- */

async function loadAllowedContent() {
if (lessonGrid) {
lessonGrid.innerHTML = `
<div class="empty-message">
${escapeHtml(t.loadingLessons || "Dersler yükleniyor...")}
</div>
`;
}

  if (homeworkList) {
homeworkList.innerHTML = `
<div class="empty-message">
${escapeHtml(t.loadingHomework || "Ev ödevleri yükleniyor...")}
</div>
`;
}

  const allowedCourses =
currentUserData.role === "teacher"
? allCourses
: [currentUserData.group];

  loadedLessons = [];
loadedHomeworks = [];

  for (const courseId of allowedCourses) {
const lessonsReference = collection(
db,
"courses",
courseId,
"lessons",
);

    const homeworkReference = collection(
db,
"courses",
courseId,
"homework",
);

    const lessonsQuery = query(
lessonsReference,
orderBy("order", "asc"),
);

    const homeworkQuery = query(
homeworkReference,
orderBy("order", "asc"),
);

    const [lessonsSnapshot, homeworkSnapshot] = await Promise.all([
getDocs(lessonsQuery),
getDocs(homeworkQuery),
]);

    lessonsSnapshot.forEach((lessonDocument) => {
const lessonData = lessonDocument.data();

      if (lessonData.published === true) {
loadedLessons.push({
id: lessonDocument.id,
course: courseId,
courseName: getCourseName(courseId),
...lessonData,
});
}
});

    homeworkSnapshot.forEach((homeworkDocument) => {
const homeworkData = homeworkDocument.data();

      if (homeworkData.published === true) {
loadedHomeworks.push({
id: homeworkDocument.id,
course: courseId,
courseName: getCourseName(courseId),
...homeworkData,
});
}
});
}

  renderFilteredLessons();
renderFilteredHomeworks();

  updateTotalLessons(loadedLessons.length);
updateHomeworkStat(loadedHomeworks.length);
}

/* --------------------------------------------------
DERSLERİ GÖSTER
-------------------------------------------------- */

function renderFilteredLessons() {
const filteredLessons =
currentFilter === "all"
? loadedLessons
: loadedLessons.filter((lesson) => {
return lesson.course === currentFilter;
});

  renderLessons(filteredLessons);
}

function renderLessons(lessons) {
if (!lessonGrid) {
return;
}

  if (!lessons.length) {
lessonGrid.innerHTML = `
<div class="empty-message">
${escapeHtml(t.noLessonsInGroup || "Bu kurs için henüz ders yok.")}
</div>
`;
return;
}

  lessonGrid.innerHTML = lessons
.map((lesson) => {
return `
<article class="lesson-card">
<div class="lesson-card-top ${escapeHtml(lesson.course)}"></div>

          <div class="lesson-card-body">
<div class="lesson-card-meta">
<span class="course-badge badge-${escapeHtml(lesson.course)}">
${escapeHtml(lesson.courseName)}
</span>

              <span class="lesson-date">
${escapeHtml(lesson.date || "")}
</span>
</div>

            <h3>${escapeHtml(lesson.title || "")}</h3>

            <p class="lesson-card-description">
${escapeHtml(lesson.description || "")}
</p>

            <div class="lesson-card-footer">
<span class="lesson-info">
◷ ${escapeHtml(lesson.duration || "")}
</span>

              <button
class="open-lesson-btn"
type="button"
data-course-id="${escapeHtml(lesson.course)}"
data-lesson-id="${escapeHtml(lesson.id)}"
>
${escapeHtml(t.openLesson || "Dersi aç")} →
</button>
</div>
</div>
</article>
`;
})
.join("");

  document.querySelectorAll(".open-lesson-btn").forEach((button) => {
button.addEventListener("click", () => {
const lesson = loadedLessons.find((item) => {
return (
item.course === button.dataset.courseId &&
item.id === button.dataset.lessonId
);
});

      if (lesson) {
openLessonModal(lesson);
}
});
});
}

/* --------------------------------------------------
EV ÖDEVLERİNİ GÖSTER
-------------------------------------------------- */

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
if (!homeworkList) {
return;
}

  if (!homeworks.length) {
homeworkList.innerHTML = `
<div class="empty-message">
${escapeHtml(
t.noHomeworkList ||
t.noHomework ||
"Bu kurs için henüz ev ödevi eklenmedi.",
)}
</div>
`;
return;
}

  homeworkList.innerHTML = homeworks
.map((homework) => {
const deadlineText = homework.deadline
? ${t.deadlineLabel || "Teslim"}: ${homework.deadline}
: t.noDeadline || "Teslim tarihi belirtilmedi";

      return `
<article class="homework-item">
<div class="homework-icon" aria-hidden="true">✦</div>

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
${escapeHtml(deadlineText)}
</span>

            <span class="homework-status">
${escapeHtml(t.homeworkPending || "Bekliyor")}
</span>
</div>
</article>
`;
})
.join("");
}

/* --------------------------------------------------
DERS DETAY MODALI
-------------------------------------------------- */

function openLessonModal(lesson) {
const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) {
return;
}

  const practiceItems = Array.isArray(lesson.practice)
? lesson.practice
: [];

  modalContent.innerHTML = `
<div class="modal-header">
<span class="course-badge badge-${escapeHtml(lesson.course)}">
${escapeHtml(lesson.courseName)}
</span>

      <h2>${escapeHtml(lesson.title || "")}</h2>
</div>

    <div class="modal-body">
<section class="modal-section">
<h3>${escapeHtml(t.modalExplanation || "📚 Konu Anlatımı")}</h3>

        <p>
${formatText(
lesson.explanation ||
t.noExplanation ||
"Bu dersin açıklaması henüz eklenmedi.",
)}
</p>
</section>

      <section class="modal-section">
<h3>${escapeHtml(t.modalExample || "💻 Kod Örneği")}</h3>

        <pre class="code-example"><code>${escapeHtml(
lesson.example ||
t.noExample ||
"// Kod örneği henüz eklenmedi.",
)}</code></pre>
</section>

      <section class="modal-section">
<h3>${escapeHtml(t.modalPractice || "🎯 Pratik Görevler")}</h3>

        ${
practiceItems.length
? `
<ul>
${practiceItems
.map((item) => <li>${escapeHtml(item)}</li>)
.join("")}
</ul>
` : `
<p>
${escapeHtml(
t.noPractice ||
"Bu ders için henüz pratik görev eklenmedi.",
)}
</p>
` }
</section>

      <section class="modal-section">
<h3>${escapeHtml(t.modalHomework || "🏠 Ev Ödevi")}</h3>

        <div class="assignment-box">
<p>
${formatText(
lesson.homework ||
t.noHomework ||
"Bu derse ait bir ev ödevi bulunmuyor.",
)}
</p>
</div>
</section>
</div>
`;

  modal.classList.add("show");
document.body.style.overflow = "hidden";
}

/* --------------------------------------------------
İSTATİSTİKLER
-------------------------------------------------- */

function updateTotalLessons(count) {
const totalLessonsStat = document.getElementById("totalLessonsStat");

  if (totalLessonsStat) {
totalLessonsStat.textContent = count;
} }

function updateHomeworkStat(count) {
const homeworkStat = document.getElementById("homeworkStat");

  if (homeworkStat) {
homeworkStat.textContent = count;
} }

/* --------------------------------------------------
YARDIMCI FONKSİYONLAR
-------------------------------------------------- */

function escapeHtml(value) {
return String(value ?? "")
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
}

function formatText(value) {
return escapeHtml(value).replaceAll("\n", "
");
}

/* --------------------------------------------------
ÇIKIŞ
-------------------------------------------------- */

if (logoutButton) {
logoutButton.addEventListener("click", async () => {
try {
await signOut(auth);
window.location.href = "./login.html";
} catch (error) {
console.error("Çıkış hatası:", error);

      alert(
t.alertLogoutError ||
"Çıkış yapılırken bir hata oluştu.",
);
}
});
}

/* --------------------------------------------------
MODAL KAPATMA
-------------------------------------------------- */

function closeModal() {
if (!modal) {
return;
}

  modal.classList.remove("show");
document.body.style.overflow = "";
}

if (modalCloseBtn) {
modalCloseBtn.addEventListener("click", closeModal);
}

if (modal) {
modal.addEventListener("click", (event) => {
if (event.target === modal) {
closeModal();
}
});
}

document.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeModal();
} });
