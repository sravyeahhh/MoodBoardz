let currentEmoji = "😎";
let moodChart = null;

document.addEventListener("DOMContentLoaded", () => {
  window.switchTab = function (tab) {
    document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
    document.getElementById("signup-form").classList.toggle("hidden", tab !== "signup");

    document.querySelectorAll(".tab-buttons button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.tab-buttons button[onclick="switchTab('${tab}')"]`).classList.add("active");
  };

  window.login = function () {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value.trim();
    if (!email || !pass) return alert("we can’t vibe unless you type something 👀");

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        showMoodPage();
        showWeeklyReport();
      })
      .catch((err) => {
        alert("Login error: " + err.message);
      });
  };

  window.signup = function () {
    const email = document.getElementById("signup-email").value.trim();
    const pass = document.getElementById("signup-password").value.trim();
    if (!email || !pass) return alert("bruh... fill in the info 😭");

    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => {
        showMoodPage();
        showWeeklyReport();
      })
      .catch((err) => {
        alert("Signup fail: " + err.message);
      });
  };

  window.loginAnonymously = function () {
    auth.signInAnonymously().then(() => {
      showMoodPage();
      showWeeklyReport();
    });
  };

  window.logout = () => {
    auth.signOut().then(() => location.reload());
  };

  window.selectEmoji = (btn, emoji) => {
    currentEmoji = emoji;
    document.querySelectorAll(".emoji-button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  };

  document.querySelectorAll(".color-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("color").value = btn.dataset.color;
      document.querySelectorAll(".color-swatch").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  window.saveMood = () => {
    const uid = auth.currentUser?.uid;
    const note = document.getElementById("note").value.trim();
    const color = document.getElementById("color").value;
    const date = new Date().toISOString().slice(0, 10);

    if (!uid) return alert("Not logged in?");
    if (!note) return showCatPopup("sis, you gotta type SOMETHING 😭");

    const mood = { uid, date, emoji: currentEmoji, color, note };
    db.ref("moods").push(mood).then(() => {
      showCatPopup("mood saved. mood = slay 💅");
      clearMoodForm();
      showWeeklyReport();
    });
  };

  function showMoodPage() {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("mood-container").classList.remove("hidden");
  }

  function clearMoodForm() {
    document.getElementById("note").value = "";
    document.querySelectorAll(".emoji-button").forEach(b => b.classList.remove("selected"));
    document.querySelector(".emoji-button").classList.add("selected");
    document.querySelectorAll(".color-swatch").forEach(b => b.classList.remove("selected"));
    document.querySelector(".color-swatch").classList.add("selected");
    document.getElementById("color").value = document.querySelector(".color-swatch").dataset.color;
  }

  function showCatPopup(message) {
    const popup = document.getElementById("cat-popup");
    popup.querySelector("p").textContent = message;
    popup.classList.remove("hidden");
    setTimeout(() => popup.classList.add("hidden"), 2500);
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      showMoodPage();
      showWeeklyReport();
    }
  });

  window.showWeeklyReport = () => {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const moodsRef = db.ref("moods");
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const emojiMap = {};
    moodsRef.once("value", (snapshot) => {
      snapshot.forEach((child) => {
        const mood = child.val();
        if (mood.uid === uid) {
          const moodDate = new Date(mood.date);
          if (moodDate >= weekAgo && moodDate <= today) {
            emojiMap[mood.emoji] = (emojiMap[mood.emoji] || 0) + 1;
          }
        }
      });

      if (moodChart) moodChart.destroy();
      const ctx = document.getElementById("moodChart").getContext("2d");
      moodChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(emojiMap),
          datasets: [{
            label: "Mood Count",
            data: Object.values(emojiMap),
            backgroundColor: "#ff88dc",
            borderRadius: 10
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const topEmoji = Object.entries(emojiMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      const total = Object.values(emojiMap).reduce((a, b) => a + b, 0);
      const sass = {
        "😎": "main character energy 😎",
        "💀": "um. you okay? 💀",
        "🥲": "crying in comic sans 🥲",
        "🫶": "you're actually healing 🫶"
      };
      document.getElementById("mood-commentary").textContent = total
        ? `${sass[topEmoji] || "chaotic vibes"} — ${total} moods logged.`
        : "no vibes detected. log something pls 😭";

      document.getElementById("weekly-report").classList.remove("hidden");
    });
  };
});
