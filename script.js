// Cấu hình cổng kết nối API đồng bộ tuyệt đối với bot.py
const API_URL = "http://localhost:5000/api";
let sessionInterval = null;
let ramChartInstance = null;

// Khởi tạo các tính năng hệ thống khi ứng dụng sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra bộ nhớ tạm xem có phiên đăng nhập cũ chưa hết hạn không
    const savedKey = localStorage.getItem("phantom_key");
    if (savedKey) {
        autoVerifySavedKey(savedKey);
    }
    
    // Tạo sẵn luồng giả lập log console và biểu đồ hiển thị RAM
    initSystemTelemetry();
});

// ==========================================
// 1. XỬ LÝ ĐĂNG NHẬP & ĐỒNG BỘ KEY XÁC THỰC
// ==========================================

async function validateKeyWithServer() {
    const btn = document.getElementById("btn-activate");
    const input = document.getElementById("key-input");
    const errorBox = document.getElementById("login-error");
    const keyValue = input.value.trim();

    if (!keyValue) {
        showLoginError("Vui lòng điền mã Key bản quyền!");
        return;
    }

    // Hiển thị trạng thái đang xử lý để chống kẹt đơ nút bấm
    btn.disabled = true;
    btn.innerText = "ĐANG XÁC THỰC...";
    errorBox.style.display = "none";

    try {
        const response = await fetch(`${API_URL}/verify-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: keyValue })
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
            // Lưu thông tin phiên làm việc cục bộ
            localStorage.setItem("phantom_key", keyValue);
            localStorage.setItem("phantom_expire", data.expire_at);
            localStorage.setItem("phantom_type", data.duration_type);
            
            // Vào thẳng menu chính
            launchApplicationMenu(data.duration_type, data.expire_at);
        } else {
            showLoginError(data.message || "Mã Key không hợp lệ!");
            btn.disabled = false;
            btn.innerText = "KÍCH HOẠT HỆ THỐNG";
        }
    } catch (err) {
        showLoginError("Lỗi: Hãy chắc chắn bạn đã khởi chạy file bot.py!");
        btn.disabled = false;
        btn.innerText = "KÍCH HOẠT HỆ THỐNG";
    }
}

async function autoVerifySavedKey(key) {
    try {
        const response = await fetch(`${API_URL}/verify-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: key })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            launchApplicationMenu(data.duration_type, data.expire_at);
        } else {
            executeForcedExit("Phiên đăng nhập cũ đã hết hạn!");
        }
    } catch (err) {
        // Không kết nối được server thì yêu cầu đăng nhập lại
        localStorage.clear();
    }
}

function showLoginError(msg) {
    const errorBox = document.getElementById("login-error");
    errorBox.innerText = msg;
    errorBox.style.display = "block";
}

// ==========================================
// 2. QUẢN LÝ PHIÊN LÀM VIỆC & AUTO VĂNG APP
// ==========================================

function launchApplicationMenu(type, expireAt) {
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");

    const expiryDisplay = document.getElementById("key-expiry");
    
    if (type === "vinhvien" || expireAt === 0) {
        expiryDisplay.innerText = "VĨNH VIỄN";
    } else {
        const date = new Date(expireAt);
        expiryDisplay.innerText = date.toLocaleString('vi-VN');

        // Khởi chạy vòng lặp kiểm tra liên tục (mỗi 3 giây)
        if (sessionInterval) clearInterval(sessionInterval);
        
        sessionInterval = setInterval(async () => {
            const currentKey = localStorage.getItem("phantom_key");
            const now = new Date().getTime();

            // Tình huống 1: Thời gian máy tính vượt mốc hết hạn của Key
            if (now > expireAt) {
                clearInterval(sessionInterval);
                executeForcedExit("Mã Key của bạn đã hết hạn sử dụng!");
                return;
            }

            // Tình huống 2: Kiểm tra ngầm xem Bot backend đã xóa Key này chưa
            try {
                const res = await fetch(`${API_URL}/verify-key`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: currentKey })
                });
                if (!res.ok) {
                    clearInterval(sessionInterval);
                    executeForcedExit("Key đã bị xóa tự động khỏi máy chủ hệ thống!");
                }
            } catch (e) {
                // Mất kết nối server tạm thời không văng để tránh lag mạng cục bộ
            }
        }, 3000);
    }
    
    // Tự động vẽ lại biểu đồ RAM ngay khi vào menu
    setTimeout(() => { if(ramChartInstance) ramChartInstance.update(); }, 200);
}

function executeForcedExit(reason) {
    if (sessionInterval) clearInterval(sessionInterval);
    localStorage.clear();
    alert(`[HỆ THỐNG]: ${reason}`);
    
    // Đẩy ngược lại màn hình khóa login ban đầu
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("login-screen").classList.add("active");
    
    const btn = document.getElementById("btn-activate");
    btn.disabled = false;
    btn.innerText = "KÍCH HOẠT HỆ THỐNG";
    document.getElementById("key-input").value = "";
}

// ==========================================
// 3. ĐIỀU HƯỚNG TAB & HIỆU ỨNG LED
// ==========================================

function switchTabMenu(tabId, element) {
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    element.classList.add("active");
}

function updateThemeBaseColor(hexColor) {
    document.documentElement.style.setProperty('--primary-color', hexColor);
    document.documentElement.style.setProperty('--led-glow', `0 0 15px ${hexColor}`);
}

// ==========================================
// 4. THEO DÕI LIVE TELEMETRY & BIỂU ĐỒ RAM
// ==========================================

function initSystemTelemetry() {
    const consoleBox = document.getElementById("console-log");
    const ramValueText = document.getElementById("ram-usage-text");
    
    // Thiết lập biểu đồ RAM đồ họa Canvas mượt mà
    const canvas = document.getElementById("ramChart");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const maxPoints = 15;
    const ramData = Array(maxPoints).fill(45);

    // Hàm vẽ biểu đồ thủ công để triệt tiêu lỗi không load được thư viện ngoài
    ramChartInstance = {
        update: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Vẽ lưới nền mờ
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            for(let i = 1; i < 4; i++) {
                let y = (canvas.height / 4) * i;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Vẽ đường đồ thị biểu diễn RAM tiêu thụ
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || "#a855f7";
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < ramData.length; i++) {
                let x = (canvas.width / (maxPoints - 1)) * i;
                let y = canvas.height - (ramData[i] * canvas.height / 100);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        },
        addData: function(value) {
            ramData.shift();
            ramData.push(value);
            this.update();
        }
    };

    // Vòng lặp liên tục tạo tài nguyên biến thiên RAM
    setInterval(() => {
        if (document.getElementById("tab-live").classList.contains("active")) {
            let currentUsage = Math.floor(Math.random() * (72 - 40 + 1)) + 40;
            ramValueText.innerText = currentUsage + "%";
            ramChartInstance.addData(currentUsage);

            // Đẩy dòng text trạng thái vào console chạy chữ
            let logLine = document.createElement("div");
            logLine.className = "line";
            logLine.innerText = `[RAM_MONITOR] Khối bộ nhớ phân mảnh ổn định. Đang dùng: ${currentUsage}%`;
            consoleBox.appendChild(logLine);
            consoleBox.scrollTop = consoleBox.scrollHeight;
        }
    }, 2000);
}

function runRamClearProcess() {
    const consoleBox = document.getElementById("console-log");
    const ramValueText = document.getElementById("ram-usage-text");
    
    ramValueText.innerText = "15%";
    if(ramChartInstance) {
        ramChartInstance.addData(15);
        ramChartInstance.addData(15);
    }

    let logLine = document.createElement("div");
    logLine.className = "line green";
    logLine.innerText = `[HỆ THỐNG]: ĐÃ GỠ BỎ TIẾN TRÌNH RÁC NỀN. GIẢI PHÓNG RAM THÀNH CÔNG VỀ MỨC 15%!`;
    consoleBox.appendChild(logLine);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function handleManualLogout() {
    executeForcedExit("Người dùng đã đăng xuất chủ động khỏi ứng dụng.");
}
