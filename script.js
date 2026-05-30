// Biến toàn cục quản lý phiên đăng nhập và luồng animation
let globalSessionLoop = null;
let hudInterval = null;

// ==========================================
// 1. HỆ THỐNG PHÁT ÂM THANH TƯƠNG TÁC
// ==========================================
function triggerSound(elementId) {
    const soundEl = document.getElementById(elementId);
    if (soundEl) {
        soundEl.currentTime = 0;
        soundEl.play().catch(() => {});
    }
}

// ==========================================
// 2. KHỞI TẠO TỰ ĐỘNG - FIX LỖI PHẢI NHẬP LẠI KEY
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo 7 chức năng gạt cho tab FUNC (Mặc định OFF)
    const funcNames = ['Aimbot Fix', 'Silent Target', 'Wallhack ESP', 'Radar Engine', 'Auto Trigger', 'No Recoil Mod', 'Anti-Cheat Safety'];
    const funcContainer = document.getElementById('func-container');
    if (funcContainer) {
        funcContainer.innerHTML = ''; 
        funcNames.forEach(name => {
            funcContainer.innerHTML += `
                <div class="ctrl-row">
                    <span>${name}</span>
                    <input type="checkbox" class="toggle-switch" onchange="triggerSound('snd-toggle'); appendConsoleLog('Đã thay đổi: ' + '${name}')">
                </div>`;
        });
    }

    // Khởi tạo 7 chức năng kéo cho tab BOOST (Mặc định mức 0%)
    const boostNames = ['Speed Velocity', 'FOV Coverage', 'Recoil Suppress', 'Accuracy Ratio', 'FPS Overclock', 'RAM Purge', 'Ping Optimizer'];
    const boostContainer = document.getElementById('boost-container');
    if (boostContainer) {
        boostContainer.innerHTML = ''; 
        boostNames.forEach((name, i) => {
            boostContainer.innerHTML += `
                <div class="ctrl-row">
                    <div class="slider-container">
                        <div class="slider-meta">
                            <span>${name}</span>
                            <span class="val" id="b-val-${i}">0%</span>
                        </div>
                        <input type="range" class="input-slider" min="0" max="100" value="0" 
                            oninput="document.getElementById('b-val-${i}').innerText = this.value + '%';"
                            onchange="triggerSound('snd-slide'); appendConsoleLog('Cấu hình ${name}: ' + this.value + '%')">
                    </div>
                </div>`;
        });
    }

    // KIỂM TRA LẠI PHIÊN ĐĂNG NHẬP CŨ (NẾU CÓ THÌ VÀO THẲNG APP)
    const savedKey = localStorage.getItem("phantom_activated_key");
    if (savedKey) {
        autoValidateSavedKey(savedKey);
    }
});

// ==========================================
// 3. XỬ LÝ CONSOLE & CHUYỂN TAB ĐỘNG
// ==========================================
function appendConsoleLog(text) {
    const consoleLogs = document.getElementById('console-output');
    if (consoleLogs) {
        consoleLogs.innerHTML += `<br>> ${text}`;
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }
}

function switchTab(targetTabId) {
    triggerSound('snd-click');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
    
    const targetPanel = document.getElementById(targetTabId);
    if (targetPanel) targetPanel.classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (targetTabId === 'tab-live') {
        startHudAnimation();
    } else {
        if (hudInterval) clearInterval(hudInterval);
    }
}

function changeTheme(themeClassName) {
    triggerSound('snd-click');
    document.body.className = themeClassName;
    appendConsoleLog('Đã đổi màu giao diện hệ thống.');
}

function clearConsole() {
    triggerSound('snd-click');
    document.getElementById('console-output').innerHTML = ">> Bộ nhớ đệm Terminal đã được dọn dẹp sạch sẽ.";
}

// ==========================================
// 4. BIỂU ĐỒ SÓNG RAM HUD TỰ ĐỘNG
// ==========================================
function startHudAnimation() {
    if (hudInterval) clearInterval(hudInterval);
    const barsContainer = document.getElementById('hud-bars-container');
    const ramPercentage = document.getElementById('ram-percentage');
    if (!barsContainer) return;

    hudInterval = setInterval(() => {
        const bars = barsContainer.querySelectorAll('.bar');
        let currentTotal = 0;
        bars.forEach(bar => {
            const newHeight = Math.floor(Math.random() * (75 - 30) + 30);
            bar.style.height = newHeight + '%';
            currentTotal += newHeight;
        });
        if (ramPercentage) {
            ramPercentage.innerText = Math.floor(currentTotal / bars.length) + '%';
        }
    }, 800);
}

// ==========================================
// 5. CƠ CHẾ XÁC THỰC KEY CHỐNG TRÌNH DUYỆT CHẶN (BYPASS CORS)
// ==========================================
function checkKey() {
    const userKeyInput = document.getElementById('key-input').value.trim();
    const errorEl = document.getElementById('auth-error');
    triggerSound('snd-click');

    if (!userKeyInput) {
        errorEl.innerText = "Vui lòng nhập mã Key của bạn!";
        return;
    }

    executeKeyValidation(userKeyInput, false);
}

// Hàm bổ sung: Tự động chạy quét ngầm kiểm tra key cũ khi vừa bật app
function autoValidateSavedKey(key) {
    executeKeyValidation(key, true);
}

// Lõi xử lý kiểm tra key (Tích hợp cả chế độ Online file và Offline Bypass)
function executeKeyValidation(inputKey, isAutoLogin) {
    const errorEl = document.getElementById('auth-error');
    const localOfflineDatabase = {};
    const keyLower = inputKey.toLowerCase();

    // 1. Quét bộ lọc Offline Bypass trước để tối ưu tốc độ phản hồi nút bấm
    if (keyLower.endsWith("-vv") || inputKey === "TEST_VV") {
        localOfflineDatabase[inputKey] = "vv";
        processKeyValidation(localOfflineDatabase, inputKey);
    } else if (keyLower.endsWith("-30") || inputKey === "ADMIN123") {
        localOfflineDatabase[inputKey] = 30;
        processKeyValidation(localOfflineDatabase, inputKey);
    } else if (keyLower.endsWith("-7")) {
        localOfflineDatabase[inputKey] = 7;
        processKeyValidation(localOfflineDatabase, inputKey);
    } else if (keyLower.endsWith("-1") || inputKey === "PHANTOM-FREE") {
        localOfflineDatabase[inputKey] = 1;
        processKeyValidation(localOfflineDatabase, inputKey);
    } else {
        // 2. Nếu không thuộc định dạng bypass, tiến hành đọc đồng bộ từ file keys.json của bot
        fetch('keys.json', { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error("CORS_BLOCK");
            return response.json();
        })
        .then(db => {
            if (db[inputKey] !== undefined) {
                processKeyValidation(db, inputKey);
            } else {
                if (isAutoLogin) localStorage.removeItem("phantom_activated_key"); // Xóa key lưu nếu bot đã xóa nó
                if (errorEl) errorEl.innerText = "Mã Key đã hết hạn hoặc không tồn tại trên bot!";
            }
        })
        .catch(() => {
            if (!isAutoLogin && errorEl) {
                errorEl.innerText = "Mã Key sai cấu trúc hoặc trình duyệt chặn file keys.json!";
            }
        });
    }
}

function processKeyValidation(database, inputKey) {
    if (database[inputKey] === undefined) return;
    
    // Ghi nhớ mã Key vào bộ nhớ trình duyệt -> Thoát ra vào lại không cần nhập lại
    localStorage.setItem("phantom_activated_key", inputKey);
    
    // Mở khóa màn hình ứng dụng ngay lập tức
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    let keyLifetime = database[inputKey];
    const displayEl = document.getElementById('key-display');
    const countdownEl = document.getElementById('key-countdown');
    const consoleOut = document.getElementById('console-output');

    if (keyLifetime === "vv") {
        if (displayEl) displayEl.innerText = "Vĩnh Viễn";
        if (countdownEl) countdownEl.innerText = "∞ VÔ HẠN";
        if (consoleOut) consoleOut.innerHTML = ">> Đồng bộ thành công! Phiên đăng nhập: Vĩnh Viễn.";
    } else {
        let daysRemaining = parseInt(keyLifetime);
        let totalSeconds = daysRemaining * 24 * 60 * 60; // Quy đổi ra giây thời gian thực

        if (displayEl) displayEl.innerText = daysRemaining + " Ngày";
        if (consoleOut) consoleOut.innerHTML = `>> Đồng bộ thành công! Phiên đăng nhập: ${daysRemaining} Ngày.`;

        if (globalSessionLoop) clearInterval(globalSessionLoop);
        
        // Vòng lặp đếm ngược thời gian thực
        globalSessionLoop = setInterval(() => {
            totalSeconds--;

            if (totalSeconds <= 0) {
                clearInterval(globalSessionLoop);
                localStorage.removeItem("phantom_activated_key"); // XÓA PHIÊN KHI HẾT HẠN
                if (countdownEl) countdownEl.innerText = "00m:00s";
                alert("⚠️ Thời hạn gói Key của bạn đã kết thúc! Hệ thống tự động đóng ứng dụng.");
                location.reload(); // Đá văng người dùng ra ngoài
                return;
            }

            let d = Math.floor(totalSeconds / (24 * 3600));
            let h = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            let m = Math.floor((totalSeconds % 3600) / 60);
            let s = totalSeconds % 60;

            let hStr = h < 10 ? "0" + h : h;
            let mStr = m < 10 ? "0" + m : m;
            let sStr = s < 10 ? "0" + s : s;

            if (displayEl) displayEl.innerText = (d > 0 ? d + " Ngày " : "") + hStr + " Giờ";
            if (countdownEl) countdownEl.innerText = `${mStr}m:${sStr}s`;
            
        }, 1000); // 1 giây cập nhật thời hạn 1 lần
    }
}
