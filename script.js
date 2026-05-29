let sessionInterval = null;
let ramChartInstance = null;

// Khởi tạo các tính năng hệ thống khi ứng dụng sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra phiên đăng nhập cũ trong bộ nhớ trình duyệt
    const savedKey = localStorage.getItem("phantom_key");
    const savedExpire = localStorage.getItem("phantom_expire");
    const savedType = localStorage.getItem("phantom_type");

    if (savedKey && savedExpire && savedType) {
        const now = new Date().getTime();
        if (savedType === "vinhvien" || now < parseInt(savedExpire)) {
            launchApplicationMenu(savedType, parseInt(savedExpire));
        } else {
            localStorage.clear();
        }
    }
    
    // Tạo luồng giả lập log console và biểu đồ hiển thị RAM
    initSystemTelemetry();
});

// ==========================================
// 1. XỬ LÝ ĐĂNG NHẬP OFFLINE (KHÔNG QUA MẠNG)
// ==========================================

function validateKeyWithServer() {
    const btn = document.getElementById("btn-activate");
    const input = document.getElementById("key-input");
    const errorBox = document.getElementById("login-error");
    const keyValue = input.value.trim().toUpperCase();

    if (!keyValue) {
        showLoginError("Vui lòng điền mã Key bản quyền!");
        return;
    }

    // Đóng băng nút tạm thời tạo hiệu ứng xử lý thực tế
    btn.disabled = true;
    btn.innerText = "ĐANG KIỂM TRA MÃ...";
    errorBox.style.display = "none";

    setTimeout(() => {
        let durationType = "";
        let expireAt = 0;
        const now = new Date().getTime();

        // Tự động phân loại hạn dùng dựa trên tiền tố của mã Key bạn nhập
        if (keyValue.startsWith("KEY1_")) {
            durationType = "1";
            expireAt = now + (1 * 24 * 60 * 60 * 1000); // 1 Ngày
        } else if (keyValue.startsWith("KEY7_")) {
            durationType = "7";
            expireAt = now + (7 * 24 * 60 * 60 * 1000); // 7 Ngày
        } else if (keyValue.startsWith("KEY30_")) {
            durationType = "30";
            expireAt = now + (30 * 24 * 60 * 60 * 1000); // 30 Ngày
        } else if (keyValue.startsWith("KEYVV_")) {
            durationType = "vinhvien";
            expireAt = 0; // Vĩnh viễn
        } else {
            // Nếu nhập key bừa không đúng cấu trúc
            showLoginError("Mã Key bản quyền không hợp lệ hoặc sai cấu trúc!");
            btn.disabled = false;
            btn.innerText = "KÍCH HOẠT HỆ THỐNG";
            return;
        }

        // Lưu thông tin phiên làm việc cục bộ vào trình duyệt
        localStorage.setItem("phantom_key", keyValue);
        localStorage.setItem("phantom_expire", expireAt);
        localStorage.setItem("phantom_type", durationType);
        
        // Mở khóa vào thẳng Menu chính
        launchApplicationMenu(durationType, expireAt);
        
    }, 800); // Tạo độ trễ phản hồi mượt mà 0.8 giây
}

function showLoginError(msg) {
    const errorBox = document.getElementById("login-error");
    errorBox.innerText = msg;
    errorBox.style.display = "block";
    errorBox.style.color = "var(--red)";
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

        // Khởi chạy vòng lặp kiểm tra thời gian cục bộ (mỗi 2 giây)
        if (sessionInterval) clearInterval(sessionInterval);
        
        sessionInterval = setInterval(() => {
            const now = new Date().getTime();
            // Nếu đồng hồ máy tính vượt mốc hết hạn -> Tự động trục xuất
            if (now > expireAt) {
                clearInterval(sessionInterval);
                executeForcedExit("Mã Key sử dụng của bạn đã hết thời hạn bản quyền!");
            }
        }, 2000);
    }
    
    // Cập nhật biểu đồ hiển thị
    setTimeout(() => { if(ramChartInstance) ramChartInstance.update(); }, 200);
}

function executeForcedExit(reason) {
    if (sessionInterval) clearInterval(sessionInterval);
    localStorage.clear();
    alert(`[HỆ THỐNG]: ${reason}`);
    
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("login-screen").classList.add("active");
    
    const btn = document.getElementById("btn-activate");
    btn.disabled = false;
    btn.innerText = "KÍCH HOẠT HỆ THỐNG";
    document.getElementById("key-input").value = "";
}

// ==========================================
// 3. ĐIỀU HƯỚNG TAB
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
    const canvas = document.getElementById("ramChart");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const maxPoints = 15;
    const ramData = Array(maxPoints).fill(45);

    ramChartInstance = {
        update: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            for(let i = 1; i < 4; i++) {
                let y = (canvas.height / 4) * i;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

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

    setInterval(() => {
        if (document.getElementById("tab-live").classList.contains("active")) {
            let currentUsage = Math.floor(Math.random() * (72 - 40 + 1)) + 40;
            ramValueText.innerText = currentUsage + "%";
            ramChartInstance.addData(currentUsage);

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
