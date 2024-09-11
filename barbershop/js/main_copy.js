// Helper-Funktionen

function setCookie(name, value, days, sameSite = "Lax") {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=${sameSite}`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function smoothScroll(target, duration) {
  const startPosition = window.pageYOffset;
  const targetPosition = target.getBoundingClientRect().top + startPosition;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function scrollAnimation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(scrollAnimation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(scrollAnimation);
}

// Event-Handler

function handleMenuButtonClick() {
  const isMenuVisible = nav.classList.contains("menu-visible");

  if (!isMenuVisible) {
    nav.classList.add("menu-visible");
    gsap.fromTo(
      nav,
      { y: -500, zIndex: -10 },
      { y: 0, duration: 0.75, ease: "power3.out" }
    );
    menuBtn.setAttribute("data-state", "opened");
    menuBtn.setAttribute("aria-expanded", "true");
  } else {
    gsap.to(nav, {
      y: -500,
      duration: 0.75,
      ease: "power3.in",
      onComplete: () => {
        nav.classList.remove("menu-visible");
        menuBtn.setAttribute("data-state", "closed");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

function handleNavLinkClick() {
  nav.classList.remove("menu-visible");
  menuBtn.setAttribute("data-state", "closed");
  menuBtn.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    header.style.transform = "translateY(-100vh)";
  }, 1500);
}

function handleScroll() {
  const currentScrollY = window.scrollY;

  if (currentScrollY > stickyPoint) {
    if (currentScrollY < lastScrollY) {
      header.classList.add("small");
      header.style.position = "fixed";
      header.style.transform = "translateY(0)";
    } else {
      header.style.transform = "translateY(-100vh)";
    }
  } else {
    header.classList.remove("small");
    header.style.position = "absolute";
    header.style.transform = "translateY(0)";
  }

  lastScrollY = currentScrollY;
}

function handleResize() {
  stickyPoint = calculateStickyPoint();
}

function startAutoScroll() {
  stopAutoScroll();
  autoScrollInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    slider.scrollTo({
      left: images[currentIndex].offsetLeft,
      behavior: "smooth"
    });
  }, 3000);
}

function stopAutoScroll() {
  clearInterval(autoScrollInterval);
}

function openFullscreen(index) {
  currentIndex = index;
  fullscreenImg.src = images[currentIndex].src;
  fullscreenDiv.style.display = "flex";
  stopAutoScroll();
}

function closeFullscreen() {
  fullscreenDiv.style.display = "none";
  startAutoScroll();
}

function changeImage(direction) {
  const newIndex = (currentIndex + direction + images.length) % images.length;
  const nextImage = images[newIndex];

  fullscreenImg.classList.add("fade-out");
  setTimeout(() => {
    fullscreenImg.src = nextImage.src;
    currentIndex = newIndex;
    fullscreenImg.classList.remove("fade-out");
  }, 200);
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX;
  const touchDiff = touchStartX - touchEndX;

  if (Math.abs(touchDiff) > 50) {
    if (touchDiff > 0) {
      currentIndex = (currentIndex + 1) % images.length;
    } else {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
    }
    slider.scrollTo({
      left: images[currentIndex].offsetLeft,
      behavior: "smooth"
    });

    stopAutoScroll();
    clearTimeout(autoScrollTimeout);
    autoScrollTimeout = setTimeout(startAutoScroll, 3000);
  }
}

function animateInfiniteSlider() {
  if (!isPausedInfinite) {
    currentOffset -= 0.5;
    sliderElement.style.transform = `translateX(${currentOffset}px)`;

    if (Math.abs(currentOffset) >= totalSliderWidth * 2) {
      currentOffset = 0;
      sliderElement.style.transform = `translateX(${currentOffset}px)`;
    }

    autoScrollAnimationId = requestAnimationFrame(animateInfiniteSlider);
  }
}

function startInfiniteSlider() {
  animateInfiniteSlider();
  setTimeout(() => {
    cancelAnimationFrame(autoScrollAnimationId);
    currentOffset = 0;
    sliderElement.style.transform = `translateX(${currentOffset}px)`;
    startInfiniteSlider();
  }, 30000);
}

function toggleCookieBanner() {
  if (cookieBanner.classList.contains("show-banner")) {
    cookieBanner.classList.remove("show-banner");
    cookieBanner.classList.add("hide-banner");
    setTimeout(() => {
      cookieBanner.style.display = "none";
    }, 500);
  } else {
    cookieBanner.style.display = "grid";
    setTimeout(() => {
      cookieBanner.classList.remove("hide-banner");
      cookieBanner.classList.add("show-banner");
    }, 10);
  }
}

function closeCookieBanner() {
  cookieBanner.classList.remove("show-banner");
  cookieBanner.classList.add("hide-banner");
  setTimeout(() => {
    cookieBanner.style.display = "none";
  }, 500);
}

function checkCookieConsent() {
  const cookieConsent = getCookie("cookieConsent");
  if (cookieConsent === "true") {
    cookieBanner.style.display = "none";
  } else {
    cookieBanner.style.display = "grid";
    setTimeout(() => {
      cookieBanner.classList.add("show-banner");
    }, 10);
  }
}

// Initialisierung

function initialize() {
  // Caching DOM-Elemente
  nav = document.querySelector("nav");
  menuBtn = document.querySelector("#menu-btn");
  header = document.querySelector("header");
  firstSection = document.querySelector("main > div");
  slider = document.querySelector(".slider");
  images = document.querySelectorAll(".slider img");
  fullscreenDiv = document.getElementById("fullscreen");
  fullscreenImg = document.getElementById("fullscreen-img");
  leftArrow = document.getElementById("left-arrow");
  rightArrow = document.getElementById("right-arrow");
  closeBtn = document.getElementById("close-btn");
  sliderElement = document.querySelector(".infinite-slider");
  sliderImages = sliderElement.querySelectorAll("img");
  cookieBanner = document.getElementById("cookie-banner");

  // Initialwerte
  currentIndex = 0;
  autoScrollInterval = null;
  autoScrollTimeout = null;
  touchStartX = 0;
  currentOffset = 0;
  totalSliderWidth = 0;
  isPausedInfinite = false;
  isPaused = false;

  // Event Listener
  menuBtn.addEventListener("click", handleMenuButtonClick);
  document.querySelectorAll("nav ul li a").forEach(link => link.addEventListener("click", handleNavLinkClick));
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll);
  slider.addEventListener("touchstart", handleTouchStart);
  slider.addEventListener("touchend", handleTouchEnd);
  leftArrow.addEventListener("click", () => changeImage(-1));
  rightArrow.addEventListener("click", () => changeImage(1));
  closeBtn.addEventListener("click", closeFullscreen);
  document.querySelector("#toggleCookies").addEventListener("click", toggleCookieBanner);
  document.querySelector("#closeCookies").addEventListener("click", closeCookieBanner);

  // Infinite Slider
  if (sliderElement && sliderImages.length > 0) {
    sliderImages.forEach(img => totalSliderWidth += img.offsetWidth);
    for (let i = 0; i < 3; i++) {
      sliderImages.forEach(img => sliderElement.appendChild(img.cloneNode(true)));
    }
    sliderElement.style.width = `${totalSliderWidth * 3}px`;
    sliderElement.style.willChange = "transform";
    sliderElement.style.transform = "translateZ(0)";
    startInfiniteSlider();
  }

  // Auto Scroll für Slider
  startAutoScroll();

  // Cookie Banner
  checkCookieConsent();

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      smoothScroll(target, 750);
    });
  });
}

// Initialisieren beim DOMContentLoaded
document.addEventListener("DOMContentLoaded", initialize);
