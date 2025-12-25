// Cognito details
const COGNITO_DOMAIN = "https://us-east-1lvbgk4soo.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "2sh2js8s06d4ctib5sr9kojnci";
const REDIRECT_URI = "https://datxvk5bgfvjg.cloudfront.net/";

// API Gateway (STAGE ONLY — CASE SENSITIVE)
const API_BASE_URL = "https://5b2js8rvp7.execute-api.us-east-1.amazonaws.com/dev";

/*************************
 * AUTH FUNCTIONS
 *************************/

function getTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("id_token"); // ✅ FIX
}

function saveToken(token) {
  localStorage.setItem("id_token", token);
}

function getToken() {
  return localStorage.getItem("id_token");
}

function login() {
  const loginUrl =
    `${COGNITO_DOMAIN}/login?` +
    `client_id=${CLIENT_ID}` +
    `&response_type=token` +
    `&scope=openid+email` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  window.location.href = loginUrl;
}

function logout() {
  localStorage.removeItem("id_token");

  const logoutUrl =
    `${COGNITO_DOMAIN}/logout?` +
    `client_id=${CLIENT_ID}` +
    `&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;

  window.location.href = logoutUrl;
}

/*************************
 * API CALLS
 *************************/

async function addTask() {
  const token = getToken();
  if (!token) {
    alert("Please login first");
    return;
  }

  const taskName = document.getElementById("taskInput").value;
  if (!taskName) {
    alert("Enter a task");
    return;
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token   // ✅ raw ID token
    },
    body: JSON.stringify({
      task_name: taskName      // ✅ FIX
    })
  });

  if (!response.ok) {
    const err = await response.text();
    alert("Failed to add task: " + err);
    return;
  }

  alert("Task added");
  getTasks();
}

async function getTasks() {
  const token = getToken();
  if (!token) {
    alert("Please login first");
    return;
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      "Authorization": token
    }
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("API error:", err);
    alert("Failed to fetch tasks");
    return;
  }

  const tasks = await response.json();
  displayTasks(tasks);
}

/*************************
 * UI FUNCTIONS
 *************************/

function displayTasks(tasks) {
  if (!Array.isArray(tasks)) {
    console.error("Expected array, got:", tasks);
    return;
  }

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.task_name;
    list.appendChild(li);
  });
}

/*************************
 * INIT
 *************************/

window.onload = () => {
  const token = getTokenFromUrl();

  if (token) {
    saveToken(token);
    window.location.hash = "";
    getTasks();
  }
};

