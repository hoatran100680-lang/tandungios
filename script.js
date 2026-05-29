// Sử dụng đường dẫn localhost linh hoạt, ngăn hoàn toàn lỗi cors
const API_URL = window.location.protocol === "file:" ? "http://localhost:5000/api" : "/api";
let sessionCheckInterval = null;
let ramHistory = [30, 45, 40, 55, 50, 60, 45, 40, 55, 65, 50, 45, 55, 60, 62];

// Xử lý màn hình chào Intro LED rồi chuyển vào form đăng nhập
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const intro = document.getElementById("intro-screen");
        intro.style.opacity = "0";
        setTimeout(() => {
            intro.style.display = "none";
            const savedKey = localStorage.getItem("phantom_active_key");
            if (savedKey) {
                silentlyVerifyKey(savedKey);
            } else {
                document.getElementById("login-screen").classList.add("active");
            }
        }, 500);
    }, 2000); // Intro LED chạy trong 2 giây

    buildRamChart();
    launchLiveTelemetry();
});

// Gửi xác thực Key lên máy chủ Python
async function validateKeyWithServer() {
    const keyInputField = document.getElementById("key-input");
    const errorDisplay = document.getElementById("login-error");
    const keyValue = keyInputField.value.trim();

    errorDisplay.innerText = "Đang đồng bộ máy chủ...";
    errorDisplay.style.color = "var(--yellow)";

    if (!keyValue) {
        errorDisplay.innerText = "Vui lòng nhập mã Key!";
        errorDisplay.style.color = "var(--red)";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/verify-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: keyValue })
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
            localStorage.setItem("phantom_active_key", keyValue);
            localStorage.setItem("phantom_expire_time", data.expire_at);
            localStorage.setItem("phantom_duration_type", data.duration_type);
            
            errorDisplay.innerText = "";
            enterMainMenu(data.duration_type, data.expire_at);
        } else {
            errorDisplay.innerText = data.message || "Key không đúng hoặc quá hạn!";
            errorDisplay.style.color = "var(--red)";
        }
    } catch (err) {
        errorDisplay.innerText = "LỖI: Chưa khởi chạy file bot.py!";
        errorDisplay.style.color = "var(--red)";
    }
}

// Xác thực ngầm tự động đăng nhập khi mở lại app
async function silentlyVerifyKey(key) {
    try {
        const response = await fetch(`http://localhost:5000/api/verify-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: key })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            enterMainMenu(data.duration_type, data.expire_at);
        } else {
            handleForcedEjection("Phiên làm việc hết hạn! Key đã bị xóa tự động.");
        }
    } catch (err) {
        document.getElementById("login-screen").classList.add("active");
    }
}

function enterMainMenu(durationType, expireAt) {
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");

    const expiryLabel = document.getElementById("key-expiry");
    if (durationType === "vinhvien" || expireAt === 0) {
        expiryLabel.innerText = "VĨNH VIỄN";
    } else {
        expiryLabel.innerText = new Date(expireAt).toLocaleString();

        // Chu kỳ 3 giây đồng bộ hóa liên tục với bot.py để đá người dùng ra khi hết hạn
        if (sessionCheckInterval) clearInterval(sessionCheckInterval);
        sessionCheckInterval = setInterval(async () => {
            const currentKey = localStorage.getItem("phantom_active_key");
            try {
                const res = await fetch(`http://localhost:5000/api/verify-key`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: currentKey })
                });
                if (!res.ok) {
                    clearInterval(sessionCheckInterval);
                    handleForcedEjection("Key của bạn đã hết hạn, hệ thống tự động xóa và đăng xuất!");
                }
            } catch(e) {}
        }, 3000);
    }
}

// Xử lý đổi hiển thị Text cho phần thanh kéo Boost
function updateRangeVal(id, value) {
    document.getElementById(id).innerText = value;
}

// Vẽ cấu trúc cột biểu đồ RAM
function buildRamChart() {
    const wrapper = document.getElementById("ram-chart");
    wrapper.innerHTML = "";
    ramHistory.forEach(val => {
        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.height = `${val}%`;
        wrapper.appendChild(bar);
    });
}

// Cập nhật biểu đồ và bộ xử lý LIVE thời gian thực
function launchLiveTelemetry() {
    const ramContainer = document.getElementById("ram-usage");
    const logBox = document.getElementById("console-log");

    setInterval(() => {
        let simulatedRam = Math.floor(Math.random() * (75 - 40 + 1)) + 40;
        ramContainer.innerText = simulatedRam + "%";

        // Đồng bộ đẩy dữ liệu mới vào mảng biểu đồ
        ramHistory.push(simulatedRam);
        ramHistory.shift();
        buildRamChart();

        if (document.getElementById("tab-live").classList.contains("active")) {
            let logLine = document.createElement("div");
            logLine.className = "line";
            logLine.innerText = `[LOG][${new Date().toLocaleTimeString()}] Bộ nhớ RAM biến thiên: ${simulatedRam}%`;
            logBox.appendChild(logLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }, 2000);
}

function executeClearRam() {
    const logBox = document.getElementById("console-log");
    ramHistory = [15, 18, 16, 17, 15, 19, 18, 17, 16, 15, 18, 17, 16, 17, 18];
    buildRamChart();
    document.getElementById("ram-usage").innerText = "18%";
    
    let logLine = document.createElement("div");
    logLine.className = "line green";
    logLine.innerText = `[SUCCESS] Đã thực hiện giải phóng và dọn sạch RAM đệm thành công!`;
    logBox.appendChild(logLine);
    logBox.scrollTop = logBox.scrollHeight;
}

function tabNavigation(targetTabId, navElement) {
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.getElementById(targetTabId).classList.add("active");
    navElement.classList.add("active");
}

function applyCustomTheme(colorHex) {
    document.documentElement.style.setProperty('--primary-color', colorHex);
}

function handleForcedEjection(alertMessage) {
    alert(alertMessage);
    clearSessionAndExit();
}

function clearSessionAndExit() {
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    localStorage.clear();
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("login-screen").classList.add("active");
}
