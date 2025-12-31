// --- Countdown Logic ---
const targetDate = new Date("Jan 30, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d < 10 ? '0'+d : d;
    document.getElementById("hours").innerText = h < 10 ? '0'+h : h;
    document.getElementById("minutes").innerText = m < 10 ? '0'+m : m;
    document.getElementById("seconds").innerText = s < 10 ? '0'+s : s;
}

setInterval(updateCountdown, 1000);

// --- GSAP Entrance ---
if (document.querySelector('.cs-container')) {
    const tl = gsap.timeline();
    
    tl.from(".cs-bg-img", { scale: 1.2, duration: 2, ease: "power2.out" })
      .from(".cs-logo", { y: -20, opacity: 0, duration: 0.8 }, "-=1.5")
      .from(".cs-title", { y: 50, opacity: 0, duration: 1, ease: "power4.out" }, "-=1")
      .from(".timer-box", { 
          scale: 0.8, 
          opacity: 0, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: "back.out(1.7)" 
      }, "-=0.5")
      .from(".cs-form", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4");
}