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
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* --------------------------------------------------
   AYARLAR
-------------------------------------------------- */

const allCourses = [
  "html-mk",
  "html-tr",
  "javascript",
  "react",
];

// Firestore'daki ödev alt koleksiyonunun adı.
// Firestore'da: courses/react/homework/homework-001
const HOMEWORK_COLLECTION = "homework";

let currentUserData = null;

let loadedLessons = [];
let loadedHomeworks = [];

let currentFilter = "all";

let t = translations.mk;
let currentLang = "mk";

/* --------------------------------------------------
   HTML ELEMENTLERİ
-------------------------------------------------- */

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
  document.documentElement.lang = currentLang;
  document.title = t.pageTitle || "Kod Akademi";

  const logoText = document.querySelector(".logo span:last-child");

  if (logoText) {
    logoText.textContent = t.logo || "Kod Akademi";
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
      currentPageTitle.textContent = t.home || "";
    }
  }
}

function setTextForAll(selector, text) {
  document.querySelectorAll(selector).forEach((element) => {
    if (text) {
      element.textContent = text;
    }
  });
}

function setTextForOne(selector, text) {
  const element = document.querySelector(selector);

  if (element && text) {
    element.textContent = text;
  }
}

/* --------------------------------------------------
   AUTHENTICATION VE KULLANICI PROFİLİ
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
      alert(
        translations.mk.alertNoProfile ||
          "Kullanıcı profiliniz bulunamadı.",
      );

      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    currentUserData = userSnapshot.data();

    if (currentUserData.active !== true) {
      alert(
        translations.mk.alertInactive ||
          "Hesabınız aktif değil.",
      );

      await signOut(auth);
      window.location.href = "./login.html";
      return;
    }

    currentLang = detectLanguage(currentUserData);
    t = translations[currentLang] || translations.mk;

    applyLanguage();

    if (studentName) {
      studentName.textContent =
        currentUserData.fullName ||
        currentUserData.username ||
        user.email ||
        "";
    }

    if (currentUserData.role === "teacher") {
      currentFilter = "all";

      if (studentGroup) {
        studentGroup.textContent = t.teacher || "Teacher";
      }
    } else {
      currentFilter = currentUserData.group;

      if (studentGroup) {
        studentGroup.textContent =
          getCourseName(currentUserData.group);
      }
    }

    configureCourseButtons();
    addCourseFilterEvents();

    await loadAllowedContent();
  } catch (error) {
    console.error("İçerik yükleme hatası:", error);

    showLoadError(
      t.loadError ||
        "İçerikler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.",
    );
  }
});

/* --------------------------------------------------
   KURS ADLARI
-------------------------------------------------- */

function getCourseName(courseId) {
  const courseKeyMap = {
    "html-mk": "courseHtmlMk",
    "html-tr": "courseHtmlTr",
    javascript: "courseJs",
    react: "courseReact",
  };

  const translationKey = courseKeyMap[courseId];

  return t[translationKey] || courseId;
}

/* --------------------------------------------------
   FİLTRELER
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
    const canSeeThisCourse =
      button.dataset.course === currentUserData.group;

    button.style.display = canSeeThisCourse ? "flex" : "none";
  });

  filterButtons.forEach((button) => {
    const canSeeThisCourse =
      button.dataset.filter === currentUserData.group;

    button.style.display = canSeeThisCourse ? "inline-flex" : "none";
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
  const isStudent = currentUserData.role !== "teacher";

  if (isStudent && filter !== currentUserData.group) {
    return;
  }

  currentFilter = filter;

  updateActiveFilterButtons();
  renderFilteredLessons();
  renderFilteredHomeworks();
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

/* --------------------------------------------------
   FIRESTORE: DERSLER VE EV ÖDEVLERİ
-------------------------------------------------- */

async function loadAllowedContent() {
  showLoadingMessages();

  const allowedCourses =
    currentUserData.role === "teacher"
      ? allCourses
      : [currentUserData.group];

  loadedLessons = [];
  loadedHomeworks = [];

  const courseResults = await Promise.all(
    allowedCourses.map(async (courseId) => {
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
        HOMEWORK_COLLECTION,
      );

      const [lessonsResult, homeworksResult] =
        await Promise.allSettled([
          getDocs(lessonsReference),
          getDocs(homeworkReference),
        ]);

      if (lessonsResult.status === "rejected") {
        console.error(
          `Dersler yüklenemedi (${courseId}):`,
          lessonsResult.reason,
        );
      }

      if (homeworksResult.status === "rejected") {
        console.error(
          `Ödevler yüklenemedi (${courseId}/${HOMEWORK_COLLECTION}):`,
          homeworksResult.reason,
        );
      }

      return {
        courseId,
        lessonsSnapshot:
          lessonsResult.status === "fulfilled"
            ? lessonsResult.value
            : null,
        homeworksSnapshot:
          homeworksResult.status === "fulfilled"
            ? homeworksResult.value
            : null,
      };
    }),
  );

  courseResults.forEach((courseResult) => {
    const {
      courseId,
      lessonsSnapshot,
      homeworksSnapshot,
    } = courseResult;

    if (lessonsSnapshot) {
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
    }

    if (homeworksSnapshot) {
      console.log(
        `Kurs: ${courseId} | Bulunan ödev sayısı: ${homeworksSnapshot.size}`,
      );

      homeworksSnapshot.forEach((homeworkDocument) => {
        const homeworkData = homeworkDocument.data();

        console.log(
          `Ödev bulundu: ${homeworkDocument.id}`,
          homeworkData,
        );

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
  });

  // "order" alanı eksik olan içerikler de görünür.
  loadedLessons.sort(sortByOrder);
  loadedHomeworks.sort(sortByOrder);

  renderFilteredLessons();
  renderFilteredHomeworks();

  updateTotalLessons(loadedLessons.length);
  updateHomeworkStat(loadedHomeworks.length);
}

function sortByOrder(firstItem, secondItem) {
  const firstOrder = Number(firstItem.order ?? 999999);
  const secondOrder = Number(secondItem.order ?? 999999);

  return firstOrder - secondOrder;
}

function showLoadingMessages() {
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
}

function showLoadError(message) {
  const errorHtml = `
    <div class="empty-message">
      ${escapeHtml(message)}
    </div>
  `;

  if (lessonGrid) {
    lessonGrid.innerHTML = errorHtml;
  }

  if (homeworkList) {
    homeworkList.innerHTML = errorHtml;
  }
}

/* --------------------------------------------------
   DERS LİSTESİ
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

  if
