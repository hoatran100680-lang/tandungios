/* TAB SYSTEM */

const tabs =
document.querySelectorAll(".tab");

const panels =
document.querySelectorAll(".panel");

tabs.forEach(tab=>{

tab.addEventListener("click",()=>{

tabs.forEach(btn=>{
btn.classList.remove("active");
});

panels.forEach(panel=>{
panel.classList.remove("active");
});

tab.classList.add("active");

document
.getElementById(tab.dataset.tab)
.classList.add("active");

playSound();

});

});

/* SOUND */

function playSound(){

const audio = new Audio(
"https://www.soundjay.com/buttons/sounds/button-16.mp3"
);

audio.volume = .25;
audio.play();

}

/* SWITCH SOUND */

document.querySelectorAll("input")
.forEach(sw=>{

sw.addEventListener("change",()=>{

playSound();

const parent =
sw.closest(".toggle-card");

if(parent){

parent.classList.toggle(
"enabled",
sw.checked
);

}

});

});

/* RANGE VALUE */

document.querySelectorAll(".range")
.forEach((slider)=>{

const value =
slider.parentElement
.querySelector("b");

value.innerText =
slider.value + "%";

slider.oninput = function(){

value.innerText =
this.value + "%";

};

});

/* BOOST BUTTON */

const boostBtn =
document.getElementById("boostBtn");

const consoleBox =
document.getElementById("console");

boostBtn.addEventListener("click",()=>{

playSound();

const logs = [

"SYSTEM BOOST START...",
"CLEAR RAM SUCCESS...",
"GPU OPTIMIZED...",
"FPS BOOST ENABLED...",
"NETWORK STABLE...",
"SYSTEM READY..."

];

consoleBox.innerHTML = "";

let i = 0;

const inter = setInterval(()=>{

if(i >= logs.length){

clearInterval(inter);

return;

}

const p =
document.createElement("p");

p.innerText =
`[${new Date().toLocaleTimeString()}] ${logs[i]}`;

consoleBox.appendChild(p);

consoleBox.scrollTop =
consoleBox.scrollHeight;

i++;

},700);

});

/* LIVE MONITOR */

const cpu =
document.getElementById("cpuPercent");

const ram =
document.getElementById("ramPercent");

setInterval(()=>{

const ramValue =
Math.floor(Math.random()*40)+30;

const cpuValue =
Math.floor(Math.random()*50)+20;

ram.innerText =
ramValue + "%";

cpu.innerText =
cpuValue + "%";

},3000);

/* REALTIME CONSOLE */

const liveLogs = [

"Scanning system...",
"FPS stable 120...",
"GPU optimized...",
"Ping stable...",
"Realtime protection enabled...",
"Network secured...",
"RAM cleaned successfully..."

];

setInterval(()=>{

const p =
document.createElement("p");

const random =
liveLogs[
Math.floor(Math.random()*liveLogs.length)
];

p.innerText =
`[${new Date().toLocaleTimeString()}] ${random}`;

consoleBox.appendChild(p);

if(consoleBox.children.length > 12){

consoleBox.removeChild(
consoleBox.children[0]
);

}

consoleBox.scrollTop =
consoleBox.scrollHeight;

},2500);