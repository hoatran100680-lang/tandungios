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
// 2. KHỞI TẠO CHỨC NĂNG (MẶC ĐỊNH OFF TOÀN BỘ)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo 7 chức năng gạt cho tab FUNC (Mặc định trạng thái OFF)
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
});

// ==========================================
// 3. XỬ LÝ MONITOR CONSOLE & CHUYỂN TAB ĐỘNG
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

    // Chỉ chạy hiệu ứng cột RAM khi mở hẳn tab LIVE
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
// 4. BIỂU ĐỒ SÓNG RAM HUD (MƯỢT MÀ KHÔNG CẦN THƯ VIỆN)
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

    const localOfflineDatabase = {};
    const keyLower = userKeyInput.toLowerCase();

    // Thuật toán nhận diện đuôi thông minh khi chạy trực tiếp file HTML offline
    if (keyLower.endsWith("-vv") || userKeyInput === "TEST_VV") {
        localOfflineDatabase[userKeyInput] = "vv";
        processKeyValidation(localOfflineDatabase, userKeyInput);
        return;
    } else if (keyLower.endsWith("-30") || userKeyInput === "ADMIN123") {
        localOfflineDatabase[userKeyInput] = 30;
        processKeyValidation(localOfflineDatabase, userKeyInput);
        return;
    } else if (keyLower.endsWith("-7")) {
        localOfflineDatabase[userKeyInput] = 7;
        processKeyValidation(localOfflineDatabase, userKeyInput);
        return;
    } else if (keyLower.endsWith("-1") || userKeyInput === "PHANTOM-FREE") {
        localOfflineDatabase[userKeyInput] = 1;
        processKeyValidation(localOfflineDatabase, userKeyInput);
        return;
    }

    // Nếu không khớp cấu trúc Offline, chuyển qua đọc file keys.json đồng bộ từ Bot Python sinh ra
    fetch('keys.json', { cache: 'no-store' })
    .then(response => {
        if (!response.ok) throw new Error("CORS_BLOCK");
        return response.json();
    })
    .then(db => {
        processKeyValidation(db, userKeyInput);
    })
    .catch(() => {
        errorEl.innerText = "Mã Key sai cấu trúc hoặc bị trình duyệt khóa quyền truy cập!";
    });
}

function processKeyValidation(database, inputKey) {
    const errorEl = document.getElementById('auth-error');
    
    if (database[inputKey] !== undefined) {
        let keyLifetime = database[inputKey];
        
        // Mở khóa màn hình chính, ẩn màn hình Auth ngay lập tức
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        const displayEl = document.getElementById('key-display');
        const countdownEl = document.getElementById('key-countdown');
        const consoleOut = document.getElementById('console-output');

        if (keyLifetime === "vv") {
            if (displayEl) displayEl.innerText = "Vĩnh Viễn";
            if (countdownEl) countdownEl.innerText = "∞ VÔ HẠN";
            if (consoleOut) consoleOut.innerHTML = ">> Đăng nhập thành công! Loại gói: Vô Hạn (vv).";
        } else {
            let daysRemaining = parseInt(keyLifetime);
            let totalSeconds = daysRemaining * 24 * 60 * 60; // Quy đổi số ngày ra giây thực tế

            if (displayEl) displayEl.innerText = daysRemaining + " Ngày";
            if (consoleOut) consoleOut.innerHTML = `>> Đăng nhập thành công! Gói hạn: ${daysRemaining} Ngày.`;

            if (globalSessionLoop) clearInterval(globalSessionLoop);
            
            // Bộ đếm đếm ngược thời gian thực chính xác từng giây một
            globalSessionLoop = setInterval(() => {
                totalSeconds--;

                if (totalSeconds <= 0) {
                    clearInterval(globalSessionLoop);
                    if (countdownEl) countdownEl.innerText = "00h:00m:00s";
                    alert("⚠️ Thời hạn gói Key của bạn đã kết thúc! Hệ thống tự động đóng ứng dụng.");
                    location.reload(); // Đá văng tài khoản về màn hình khóa
                    return;
                }

                // Tách thời gian tổng sang Ngày, Giờ, Phút, Giây để đẩy lên HUD hiển thị
                let d = Math.floor(totalSeconds / (24 * 3600));
                let h = Math.floor((totalSeconds % (24 * 3600)) / 3600);
                let m = Math.floor((totalSeconds % 3600) / 60);
                let s = totalSeconds % 60;

                let hStr = h < 10 ? "0" + h : h;
                let mStr = m < 10 ? "0" + m : m;
                let sStr = s < 10 ? "0" + s : s;

                // Đồng bộ hiển thị lên thẻ hạn dùng
                if (displayEl) displayEl.innerText = (d > 0 ? d + " Ngày " : "") + hStr + " Giờ";
                if (countdownEl) countdownEl.innerText = `${mStr}m:${sStr}s`;
                
            }, 1000); // 1000ms = Cập nhật chuẩn xác sau mỗi giây thực
        }
    } else {
        errorEl.innerText = "Mã Key không hợp lệ hoặc đã hết hạn sử dụng!";
    }
}
