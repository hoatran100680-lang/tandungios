document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // KHỞI TẠO ĐỐI TƯỢNG HỆ THỐNG ÂM THANH (AUDIO)
    // ==========================================
    const switchSound = new Audio("https://mixkit.co");
    switchSound.volume = 0.5;

    const sliderSound = new Audio("https://mixkit.co");
    sliderSound.volume = 0.3;

    // --- 1. SỰ KIỆN CLICK CHUYỂN TAB ---
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            switchSound.currentTime = 0;
            switchSound.play().catch(() => {});

            navItems.forEach(nav => nav.classList.remove("active"));
            tabPanels.forEach(panel => panel.classList.remove("active"));

            item.classList.add("active");
            const targetTabId = item.getAttribute("data-tab");
            const currentPanel = document.getElementById(targetTabId);
            
            if (currentPanel) {
                currentPanel.classList.add("active");
            }
        });
    });

    // --- 2. CÔNG TẮC BẬT/TẮT: PHÁT ÂM THANH KHI GẠT ---
    const switches = document.querySelectorAll(".switch input");
    switches.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            switchSound.currentTime = 0;
            switchSound.play().catch(() => {});
        });
    });

    // --- 3. THANH TRƯỢT KÉO: PHÁT ÂM THANH KHI KÉO VÀ CẬP NHẬT GIÁ TRỊ ---
    const rangeInputs = document.querySelectorAll(".range-input");
    rangeInputs.forEach(input => {
        input.addEventListener("input", () => {
            const targetId = input.getAttribute("data-target");
            const suffix = input.getAttribute("data-suffix");
            const textIndicator = document.getElementById(targetId);
            if (textIndicator) {
                textIndicator.innerText = input.value + suffix;
            }

            // Phát âm thanh tick nhẹ liên tục khi dịch chuyển giá trị slider
            sliderSound.currentTime = 0;
            sliderSound.play().catch(() => {});
        });
    });

    // --- 4. ĐỒ HỌA SÓNG SVG REALTIME & LOG CODE (LIVE) ---
    const ramText = document.getElementById("ram-text");
    const ramPath = document.getElementById("ramPath");
    const logBox = document.getElementById("log-box");

    setInterval(() => {
        if (ramText && ramPath) {
            let randomRam = Math.floor(Math.random() * (73 - 41 + 1)) + 41;
            ramText.innerText = randomRam + "%";

            let p1 = Math.floor(Math.random() * (45 - 25)) + 25;
            let p2 = Math.floor(Math.random() * (55 - 35)) + 35;
            let p3 = Math.floor(Math.random() * (40 - 20)) + 20;
            let p4 = Math.floor(Math.random() * (55 - 40)) + 40;
            ramPath.setAttribute("d", `M 0,${p1} Q 25,${p2} 50,${p1} T 100,${p3} T 150,${p4} T 200,${p3}`);

            if (Math.random() > 0.4 && logBox) {
                let time = new Date().toLocaleTimeString();
                let randomHex = Math.floor(Math.random()*16777215).toString(16).toUpperCase();
                logBox.innerHTML += `<br>[${time}] Run process code memory at: 0x${randomHex}`;
                logBox.scrollTop = logBox.scrollHeight;
            }
        }
    }, 1500);

    // --- 5. CHỨC NĂNG DỌN RAM ---
    const btnCleanRam = document.getElementById("btn-clean-ram");
    if (btnCleanRam) {
        btnCleanRam.addEventListener("click", () => {
            if (ramText && ramPath && logBox) {
                ramText.innerText = "14%";
                ramPath.setAttribute("d", "M 0,55 Q 25,54 50,55 T 100,53 T 150,55 T 200,54");
                let time = new Date().toLocaleTimeString();
                logBox.innerHTML += `<br><span style="color:#a855f7; font-weight: bold;">[${time}] [CLEANER] Đã giải phóng 1.85 GB RAM thừa thành công.</span>`;
                logBox.scrollTop = logBox.scrollHeight;
                alert("Đã tối ưu hóa bộ nhớ RAM!");
            }
        });
    }
});
