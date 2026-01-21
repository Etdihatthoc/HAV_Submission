let ws = null;
let state = {
  token: "",
  role: "",
  logged: false,
  rooms: [],
  selected_room_id: null,
  selected_room_name: "",
  joined_room_id: null,
  exam: { exam_id: -1, questions: [] },
  practice: { practice_id: -1, questions: [] },
  exam_end_time: 0,
  practice_end_time: 0,
  exam_auto_submitted: false,
  practice_auto_submitted: false,
  last_results_teacher: "",
  last_results_student: "",
};

const statusEl = document.getElementById("status");
const roleEl = document.getElementById("role");
const roomsTbody = document.querySelector("#rooms-table tbody");
const lobbyTbody = document.querySelector("#lobby-table tbody");
const examContainer = document.getElementById("exam-questions");
const pracContainer = document.getElementById("prac-questions");
const resultsTeachEl = document.getElementById("results-teacher");
const resultsStuEl = document.getElementById("results-student");
const errorsEl = document.getElementById("errors");
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const noticeEl = document.getElementById("notice");
const examRoomInfo = document.getElementById("exam-room-info");
const toastContainer = document.getElementById("toast-container");
let roomsRefreshInterval = null;
let examTimerInterval = null;
let practiceTimerInterval = null;

function toast(msg, type = "info", timeout = 3000) {
  const div = document.createElement("div");
  div.className = `toast ${type}`;
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, timeout);
}

function setStatus(text, ok = false) {
  statusEl.textContent = text;
  statusEl.style.background = ok ? "#10b981" : "#b91c1c";
}

function connectWs() {
  const host = document.getElementById("host").value || "127.0.0.1";
  const port = document.getElementById("port").value || "8080";
  ws = new WebSocket(`ws://${host}:${port}/ws`);
  ws.onopen = () => setStatus("Connected", true);
  ws.onclose = () => setStatus("Disconnected");
  ws.onerror = () => setStatus("Error");
  ws.onmessage = (ev) => handleMessage(JSON.parse(ev.data));
}

function send(action, data) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    setStatus("WS not connected");
    return;
  }
  ws.send(
    JSON.stringify({
      message_type: "REQUEST",
      action,
      timestamp: Math.floor(Date.now() / 1000),
      session_id: state.token,
      data,
    })
  );
}

function handleMessage(m) {
  if (m.status === "ERROR") {
    const msg = `${m.error_code}: ${m.error_message}`;
    errorsEl.textContent = msg;
    toast(msg, "error");
    return;
  }
  errorsEl.textContent = "";

  if (m.action === "LOGIN") {
    state.token = m.session_id || m.data.session_id;
    state.role = m.data.role;
    state.logged = !!state.token;
    roleEl.textContent = state.role || "";
    noticeEl.textContent = state.logged
      ? `Logged in as ${state.role} (${state.token.slice(0, 8)}...)`
      : "Not logged in";
    enableNavForRole(state.role);
    if (state.role === "ADMIN") showPage("teacher-dashboard");
    else showPage("student-lobby");
    toast("Login successful", "success");
    startRoomsAutoRefresh();
  } else if (m.action === "LIST_ROOMS") {
    state.rooms = m.data.rooms || [];
    renderRooms();
    renderLobby();
  } else if (m.action === "JOIN_ROOM") {
    // join success
    state.joined_room_id = m.data.room_id;
    toast(`✅ Đã tham gia phòng #${m.data.room_id}`, "success");

    // Enable buttons sau khi join
    updateExamButtonStates();

    // Auto refresh để cập nhật participant count từ server
    send("LIST_ROOMS", {});
  } else if (m.action === "GET_EXAM_PAPER") {
    state.exam.exam_id = m.data.exam_id;
    state.exam_auto_submitted = false;
    state.exam_end_time = m.data.end_time || 0;
    state.exam.questions = (m.data.questions || []).map((q) => ({
      id: q.question_id,
      text: q.question_text,
      difficulty: q.difficulty,
      topic: q.topic,
      options: q.options,
      answer: "",
    }));
    renderExam();
    showPage("student-exam");
    startExamTimer();
    toast("Exam paper loaded", "info");
  } else if (m.action === "START_PRACTICE") {
    state.practice.practice_id = m.data.practice_id;
    state.practice_auto_submitted = false;
    state.practice_end_time = m.data.end_time || 0;
    state.practice.questions = (m.data.questions || []).map((q) => ({
      id: q.question_id,
      text: q.question_text,
      difficulty: q.difficulty,
      topic: q.topic,
      options: q.options,
      answer: "",
    }));
    renderPractice();
    showPage("student-practice");
    startPracticeTimer();
    toast("Practice started", "info");
  } else if (["SUBMIT_EXAM", "SUBMIT_PRACTICE", "GET_ROOM_RESULTS", "GET_USER_HISTORY"].includes(m.action)) {
    if (m.action === "GET_ROOM_RESULTS") {
      state.last_results_teacher = JSON.stringify(m.data, null, 2);
      resultsTeachEl.textContent = state.last_results_teacher;
      showPage("teacher-results");
    } else if (m.action === "GET_USER_HISTORY") {
      state.last_results_teacher = JSON.stringify(m.data, null, 2);
      state.last_results_student = JSON.stringify(m.data, null, 2);
      resultsTeachEl.textContent = state.last_results_teacher;
      resultsStuEl.textContent = state.last_results_student;
      if (state.role === "STUDENT") showPage("student-history");
      else showPage("teacher-results");
    } else {
      state.last_results_student = JSON.stringify(m.data, null, 2);
      resultsStuEl.textContent = state.last_results_student;
      showPage("student-history");
      send("GET_USER_HISTORY", {});
      toast("Submitted successfully", "success");
    }
  } else if (m.action === "CREATE_ROOM") {
    if (m.data && m.data.room_id) {
      state.rooms.push({
        room_id: m.data.room_id,
        room_code: m.data.room_code || "",
        room_name: document.getElementById("room-name").value || "New room",
        status: m.data.status || "WAITING",
        duration_seconds: m.data.duration_seconds || 0,
        participant_count: 0,
      });
      renderRooms();
      renderLobby();
      toast(`Room created #${m.data.room_id}`, "success");
    } else {
      send("LIST_ROOMS", {});
    }
  } else if (m.action === "START_EXAM") {
    const rid = m.data.room_id;
    state.rooms = state.rooms.map((r) =>
      r.room_id === rid ? { ...r, status: m.data.status || "IN_PROGRESS" } : r
    );
    renderRooms();
    renderLobby();
    toast(`Room #${rid} started`, "info");
  }
}

function renderRooms() {
  roomsTbody.innerHTML = "";
  state.rooms.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.room_id}</td><td>${r.room_name}</td><td>${r.room_code}</td><td>${r.status}</td><td>${r.participant_count ?? 0}</td>`;
    const actions = document.createElement("td");

    // CHỈ hiển thị Start button cho Teacher
    if (state.role === "ADMIN") {
      const btnStart = document.createElement("button");
      btnStart.textContent = "Start";
      btnStart.disabled = (r.status !== "WAITING");
      btnStart.onclick = () => {
        toast("Đang bắt đầu phòng thi...", "info");
        send("START_EXAM", { room_id: r.room_id });
      };
      actions.appendChild(btnStart);
    }

    tr.appendChild(actions);
    roomsTbody.appendChild(tr);
  });
}

function renderLobby() {
  lobbyTbody.innerHTML = "";
  // Hiển thị WAITING và IN_PROGRESS rooms
  state.rooms
    .filter((r) => r.status === "WAITING" || r.status === "IN_PROGRESS")
    .forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.room_id}</td><td>${r.room_name}</td><td>${r.status}</td><td>${r.participant_count ?? 0} người</td>`;
      const actions = document.createElement("td");
      const btnSelect = document.createElement("button");
      btnSelect.textContent = "Chọn";
      btnSelect.onclick = () => {
        state.selected_room_id = r.room_id;
        state.selected_room_name = r.room_name;
        updateExamRoomInfo();
        updateExamButtonStates(); // Update button states
        showPage("student-exam");
        toast(`Đã chọn phòng: ${r.room_name}`, "info");
      };
      actions.appendChild(btnSelect);
      tr.appendChild(actions);
      lobbyTbody.appendChild(tr);
    });
}

function renderExam() {
  examContainer.innerHTML = "";
  state.exam.questions.forEach((q) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="meta">#${q.id} · ${q.difficulty} · ${q.topic}</div><div>${q.text}</div>`;
    Object.entries(q.options).forEach(([key, val]) => {
      const lbl = document.createElement("label");
      lbl.style.flexDirection = "row";
      lbl.style.alignItems = "center";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q-${q.id}`;
      input.value = key;
      input.onchange = () => (q.answer = key);
      lbl.appendChild(input);
      const span = document.createElement("span");
      span.textContent = `${key}) ${val}`;
      span.style.marginLeft = "6px";
      lbl.appendChild(span);
      card.appendChild(lbl);
    });
    examContainer.appendChild(card);
  });
}

function renderPractice() {
  pracContainer.innerHTML = "";
  state.practice.questions.forEach((q) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="meta">#${q.id} · ${q.difficulty} · ${q.topic}</div><div>${q.text}</div>`;
    Object.entries(q.options).forEach(([key, val]) => {
      const lbl = document.createElement("label");
      lbl.style.flexDirection = "row";
      lbl.style.alignItems = "center";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `p-${q.id}`;
      input.value = key;
      input.onchange = () => (q.answer = key);
      lbl.appendChild(input);
      const span = document.createElement("span");
      span.textContent = `${key}) ${val}`;
      span.style.marginLeft = "6px";
      lbl.appendChild(span);
      card.appendChild(lbl);
    });
    pracContainer.appendChild(card);
  });
}

// Wire buttons
document.getElementById("btn-connect").onclick = connectWs;
document.getElementById("btn-login").onclick = () => {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  send("LOGIN", { username: u, password: p });
};
document.getElementById("btn-refresh").onclick = () => send("LIST_ROOMS", {});
document.getElementById("btn-create").onclick = () => {
  send("CREATE_ROOM", {
    room_name: document.getElementById("room-name").value,
    description: document.getElementById("room-desc").value,
    duration_minutes: parseInt(document.getElementById("room-dur").value || "30", 10),
    room_pass: document.getElementById("room-pass").value || "",
    question_settings: {
      total_questions: parseInt(document.getElementById("room-total").value || "10", 10),
      difficulty_distribution: {
        easy: parseInt(document.getElementById("room-easy").value || "4", 10),
        medium: parseInt(document.getElementById("room-med").value || "4", 10),
        hard: parseInt(document.getElementById("room-hard").value || "2", 10),
      },
    },
  });
};
// Refresh lobby (all rooms; filter applied in renderLobby)
document.getElementById("btn-refresh-lobby").onclick = () => send("LIST_ROOMS", {});
document.getElementById("btn-join-room").onclick = () => {
  if (!state.selected_room_id) {
    toast("Hãy chọn phòng thi từ lobby trước", "error");
    return;
  }
  const pass = document.getElementById("exam-pass").value || "";
  if (!pass) {
    toast("Vui lòng nhập mật khẩu phòng", "error");
    return;
  }
  toast("Đang tham gia phòng...", "info");
  send("JOIN_ROOM", { room_id: state.selected_room_id, room_pass: pass });
};
document.getElementById("btn-get-paper").onclick = () => {
  if (!state.selected_room_id) {
    toast("Hãy chọn phòng thi từ lobby trước", "error");
    return;
  }
  if (state.joined_room_id !== state.selected_room_id) {
    toast("⚠️ Bạn phải tham gia phòng trước!", "warning");
    return;
  }
  toast("Đang tải đề thi...", "info");
  send("GET_EXAM_PAPER", { room_id: state.selected_room_id });
};
document.getElementById("btn-submit-exam").onclick = () => {
  if (state.joined_room_id !== state.selected_room_id) {
    toast("⚠️ Bạn phải tham gia phòng trước!", "warning");
    return;
  }
  // Confirmation dialog
  if (!confirm("Bạn có chắc muốn nộp bài? Bạn sẽ không thể sửa đáp án sau khi nộp.")) {
    return;
  }
  const answers = state.exam.questions.map((q) => ({
    question_id: q.id,
    selected_option: q.answer || "A",
  }));
  toast("Đang nộp bài...", "info");
  send("SUBMIT_EXAM", { exam_id: state.exam.exam_id, final_answers: answers });
};
document.getElementById("btn-start-prac").onclick = () => {
  send("START_PRACTICE", {
    question_count: parseInt(document.getElementById("prac-count").value || "6", 10),
    duration_minutes: parseInt(document.getElementById("prac-dur").value || "10", 10),
    difficulty_filter: ["EASY", "MEDIUM"],
    topic_filter: ["Networking"],
  });
};
document.getElementById("btn-submit-prac").onclick = () => {
  const answers = state.practice.questions.map((q) => ({
    question_id: q.id,
    selected_option: q.answer || "A",
  }));
  send("SUBMIT_PRACTICE", { practice_id: state.practice.practice_id, final_answers: answers });
};
document.getElementById("btn-room-results").onclick = () => {
  const rid = parseInt(document.getElementById("res-room").value || "-1", 10);
  send("GET_ROOM_RESULTS", { room_id: rid });
};
document.getElementById("btn-history-teacher").onclick = () => send("GET_USER_HISTORY", {});
document.getElementById("btn-history-student").onclick = () => send("GET_USER_HISTORY", {});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const el = document.getElementById(pageId);
  if (el) el.classList.add("active");
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.page === pageId));
}
navButtons.forEach((btn) => {
  btn.onclick = () => showPage(btn.dataset.page);
});

function enableNavForRole(role) {
  navButtons.forEach((btn) => {
    const allowed = btn.dataset.role === role;
    btn.classList.toggle("disabled", !allowed);
    if (!allowed) btn.classList.remove("active");
  });
}

function updateExamRoomInfo() {
  if (state.selected_room_id) {
    examRoomInfo.textContent = `Room: ${state.selected_room_name} (#${state.selected_room_id})`;
  } else {
    examRoomInfo.textContent = "Room: (select from lobby)";
  }
}

function updateExamButtonStates() {
  const joined = (state.joined_room_id === state.selected_room_id);
  const btnJoin = document.getElementById("btn-join-room");
  const btnGetPaper = document.getElementById("btn-get-paper");
  const btnSubmit = document.getElementById("btn-submit-exam");

  // Join button luôn enabled nếu đã select room
  if (btnJoin) btnJoin.disabled = !state.selected_room_id;

  // Các buttons khác chỉ enable khi đã join
  if (btnGetPaper) btnGetPaper.disabled = !joined;
  if (btnSubmit) btnSubmit.disabled = !joined;
}

function startRoomsAutoRefresh() {
  if (roomsRefreshInterval) clearInterval(roomsRefreshInterval);
  roomsRefreshInterval = setInterval(() => send("LIST_ROOMS", {}), 5000);
}

function formatRemaining(endSec) {
  const now = Math.floor(Date.now() / 1000);
  const rem = Math.max(0, endSec - now);
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");
  return { text: `${mm}:${ss}`, rem };
}

function startExamTimer() {
  clearInterval(examTimerInterval);
  const el = document.getElementById("exam-timer");
  if (!state.exam_end_time || !el) return;
  examTimerInterval = setInterval(() => {
    const { text, rem } = formatRemaining(state.exam_end_time);
    el.textContent = `Timer: ${text}`;
    if (rem === 0) {
      toast("Exam time over - auto submitting", "error", 4000);
      autoSubmitExam();
      clearInterval(examTimerInterval);
    }
  }, 1000);
}

function startPracticeTimer() {
  clearInterval(practiceTimerInterval);
  const el = document.getElementById("prac-timer");
  if (!state.practice_end_time || !el) return;
  practiceTimerInterval = setInterval(() => {
    const { text, rem } = formatRemaining(state.practice_end_time);
    el.textContent = `Timer: ${text}`;
    if (rem === 0) {
      toast("Practice time over - auto submitting", "error", 4000);
      autoSubmitPractice();
      clearInterval(practiceTimerInterval);
    }
  }, 1000);
}

function autoSubmitExam() {
  if (state.exam_auto_submitted) return;
  if (state.joined_room_id !== state.selected_room_id || state.exam.exam_id <= 0) return;
  state.exam_auto_submitted = true;
  const answers = state.exam.questions.map((q) => ({
    question_id: q.id,
    selected_option: q.answer || "A",
  }));
  send("SUBMIT_EXAM", { exam_id: state.exam.exam_id, final_answers: answers });
}

function autoSubmitPractice() {
  if (state.practice_auto_submitted) return;
  if (state.practice.practice_id <= 0) return;
  state.practice_auto_submitted = true;
  const answers = state.practice.questions.map((q) => ({
    question_id: q.id,
    selected_option: q.answer || "A",
  }));
  send("SUBMIT_PRACTICE", { practice_id: state.practice.practice_id, final_answers: answers });
}

showPage("teacher-dashboard");
