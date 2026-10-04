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
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
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

// Firestore koleksiyon adı:
// courses/react/homework/homework-001
const HOMEWORK_COLLECTION = "homework";

let currentUserData = null;
let currentFirebaseUser = null;

let loadedLessons = [];
let loadedHomeworks = [];
let completedProgress = [];

let currentFilter = "all";

let currentLang = "mk";
let t = translations.mk;

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
  return userData.group === "html-tr" ? "tr" : "mk";
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
  if (!text) return;

  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = text;
  });
}

function setTextForOne(selector, text) {
  const element = document.querySelector(selector);

  if (element && text) {
    element.textContent = text;
  }
}

/* --------------------------------------------------
   AUTH
-------------------------------------------------- */

onAuthStateChanged(auth, async (user) => {
  currentFirebaseUser = user;

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

    await loadStudentProgress();
    await loadAllowedContent();
  } catch (error) {
    console.error("Yükleme hatası:", error);

    showLoadError(
      t.loadError ||
        "İçerikler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.",
    );
  }
});

/* --------------------------------------------------
   KURS ADLARI VE FİLTRELER
-------------------------------------------------- */

function getCourseName(courseId) {
  const courseKeyMap = {
    "html-mk": "courseHtmlMk",
    "html-tr": "courseHtmlTr",
    javascript: "courseJs",
    react: "courseReact",
  };

  return t[courseKeyMap[courseId]] || courseId;
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
    button.style.display =
      button.dataset.course === currentUserData.group
        ? "flex"
        : "none";
  });

  filterButtons.forEach((button) => {
    button.style.display =
      button.dataset.filter === currentUserData.group
        ? "inline-flex"
        : "none";
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
   ÖĞRENCİ İLERLEMESİ
-------------------------------------------------- */

async function loadStudentProgress() {
  completedProgress = [];

  if (
    !currentFirebaseUser ||
    currentUserData.role === "teacher"
  ) {
    updateCompletedLessonsStat();
    return;
  }

  const progressReference = collection(db, "studentProgress");

  const progressQuery = query(
    progressReference,
    where("userId", "==", currentFirebaseUser.uid),
  );

  const progressSnapshot = await getDocs(progressQuery);

  progressSnapshot.forEach((progressDocument) => {
    const progressData = progressDocument.data();

    if (progressData.completed === true) {
      completedProgress.push({
        id: progressDocument.id,
        ...progressData,
      });
    }
  });

  updateCompletedLessonsStat();
}

function isLessonCompleted(courseId, lessonId) {
  return completedProgress.some((progress) => {
    return (
      progress.courseId === courseId &&
      progress.lessonId === lessonId &&
      progress.completed === true
    );
  });
}

async function toggleLessonCompletion(lesson) {
  if (
    !currentFirebaseUser ||
    currentUserData.role === "teacher"
  ) {
    return;
  }

  const progress = completedProgress.find((item) => {
    return (
      item.courseId === lesson.course &&
      item.lessonId === lesson.id
    );
  });

  try {
    if (progress) {
      await deleteDoc(
        doc(db, "studentProgress", progress.id),
      );

      completedProgress = completedProgress.filter((item) => {
        return item.id !== progress.id;
      });
    } else {
      const progressReference = await addDoc(
        collection(db, "studentProgress"),
        {
          userId: currentFirebaseUser.uid,
          courseId: lesson.course,
          lessonId: lesson.id,
          completed: true,
          completedAt: serverTimestamp(),
        },
      );

      completedProgress.push({
        id: progressReference.id,
        userId: currentFirebaseUser.uid,
        courseId: lesson.course,
        lessonId: lesson.id,
        completed: true,
      });
    }

    updateCompletedLessonsStat();
    renderFilteredLessons();
    openLessonModal(lesson);
  } catch (error) {
    console.error("Ders tamamlama hatası:", error);

    alert(
      t.completeLessonError ||
        "Ders durumu güncellenirken hata oluştu.",
    );
  }
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
      homeworksSnapshot.forEach((homeworkDocument) => {
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
  });

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

  if (!lessons.length) {
    lessonGrid.innerHTML = `
      <div class="empty-message">
        ${escapeHtml(
          t.noLessonsInGroup ||
            "Bu kurs için henüz yayınlanmış ders yok.",
        )}
      </div>
    `;
    return;
  }

  lessonGrid.innerHTML = lessons
    .map((lesson) => {
      const completed =
        currentUserData.role !== "teacher" &&
        isLessonCompleted(lesson.course, lesson.id);

      const lessonInfo = completed
        ? `✓ ${escapeHtml(t.lessonCompleted || "Tamamlandı")}`
        : `◷ ${escapeHtml(lesson.duration || "")}`;

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
              <span class="lesson-info ${completed ? "lesson-completed" : ""}">
                ${lessonInfo}
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
   EV ÖDEVLERİ
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
            "Bu kurs için henüz yayınlanmış ev ödevi yok.",
        )}
      </div>
    `;
    return;
  }

  homeworkList.innerHTML = homeworks
    .map((homework) => {
      const deadlineText = homework.deadline
        ? `${t.deadlineLabel || "Teslim"}: ${homework.deadline}`
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
   DERS MODALI
-------------------------------------------------- */

function openLessonModal(lesson) {
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) {
    return;
  }

  const practiceItems = Array.isArray(lesson.practice)
    ? lesson.practice
    : [];

  const completed =
    currentUserData.role !== "teacher" &&
    isLessonCompleted(lesson.course, lesson.id);

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
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join("")}
              </ul>
            `
            : `
              <p>
                ${escapeHtml(
                  t.noPractice ||
                    "Bu ders için henüz pratik görev eklenmedi.",
                )}
              </p>
            `
        }
      </section>

      <section class="modal-section">
        <h3>${escapeHtml(t.modalHomework || "🏠 Ev Ödevi")}</h3>

        <div class="assignment-box">
          <p>
            ${formatText(
              lesson.homework ||
                t.noHomework ||
                "Bu derse ait ev ödevi bulunmuyor.",
            )}
          </p>
        </div>
      </section>

      ${
        currentUserData.role !== "teacher"
          ? `
            <div class="modal-actions">
              <button
                type="button"
                class="modal-complete-btn ${completed ? "done" : ""}"
                id="completeLessonBtn"
              >
                ${
                  completed
                    ? `✓ ${escapeHtml(
                        t.lessonCompleted || "Tamamlandı",
                      )}`
                    : escapeHtml(
                        t.completeLesson || "Dersi tamamladım",
                      )
                }
              </button>
            </div>
          `
          : ""
      }
    </div>
  `;

  const completeLessonButton =
    document.getElementById("completeLessonBtn");

  if (completeLessonButton) {
    completeLessonButton.addEventListener("click", async () => {
      await toggleLessonCompletion(lesson);
    });
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

/* --------------------------------------------------
   İSTATİSTİKLER VE MESAJLAR
-------------------------------------------------- */

function updateTotalLessons(count) {
  const totalLessonsStat =
    document.getElementById("totalLessonsStat");

  if (totalLessonsStat) {
    totalLessonsStat.textContent = count;
  }
}

function updateCompletedLessonsStat() {
  const completedLessonsStat =
    document.getElementById("completedLessonsStat");

  if (completedLessonsStat) {
    completedLessonsStat.textContent =
      currentUserData?.role === "teacher"
        ? "—"
        : completedProgress.length;
  }
}

function updateHomeworkStat(count) {
  const homeworkStat = document.getElementById("homeworkStat");

  if (homeworkStat) {
    homeworkStat.textContent = count;
  }
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
        ${escapeHtml(
          t.loadingHomework || "Ev ödevleri yükleniyor...",
        )}
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
   YARDIMCI FONKSİYONLAR
-------------------------------------------------- */

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

/* --------------------------------------------------
   ÇIKIŞ VE MODAL KAPATMA
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

function closeModal() {
  if (!modal) return;

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
  }
});
