document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const menuBtn = document.querySelector("#menu-btn");
  const header = document.querySelector("header");
  const firstSection = document.querySelector("main > div");
  let lastScrollY = window.scrollY;

  // Menu Button Click Event
  menuBtn.addEventListener("click", () => {
    const isMenuVisible = nav.classList.contains("menu-visible");

    if (!isMenuVisible) {
      // Menü öffnen
      nav.classList.add("menu-visible");
      gsap.fromTo(
        nav,
        {
          y: -500,
          zIndex: -10, // Sicherstellen, dass der z-index niedrig ist, um den Header nicht zu überdecken
        },
        {
          y: 0,
          duration: 0.75,
          ease: "power3.out",
        }
      );
      menuBtn.setAttribute("data-state", "opened");
      menuBtn.setAttribute("aria-expanded", "true");
    } else {
      // Menü schließen
      gsap.to(nav, {
        y: -500,
        duration: 0.75,
        ease: "power3.in",
        onComplete: () => {
          nav.classList.remove("menu-visible");
          menuBtn.setAttribute("data-state", "closed");
          menuBtn.setAttribute("aria-expanded", "false");
        },
      });
    }
  });

  // Nav ausblenden bei Klick auf Nav Links
  document.querySelectorAll("nav ul li a").forEach((link) => {
    link.addEventListener("click", () => {
      // Entferne die Menü-Sichtbarkeit
      nav.classList.remove("menu-visible");
      menuBtn.setAttribute("data-state", "closed");
      menuBtn.setAttribute("aria-expanded", "false");

      // Verzögere die Header-Transformation um 750ms
      setTimeout(() => {
        header.style.transform = "translateY(-100vh)";
      }, 1500);
    });
  });
  // Sticky Header
  const calculateStickyPoint = () => {
    return firstSection.getBoundingClientRect().bottom + window.scrollY;
  };

  let stickyPoint = calculateStickyPoint();

  window.addEventListener("resize", () => {
    stickyPoint = calculateStickyPoint();
  });

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > stickyPoint) {
      if (currentScrollY < lastScrollY) {
        // Nach oben scrollen
        header.classList.add("small");
        header.style.position = "fixed";
        header.style.transform = "translateY(0)";
      } else {
        // Nach unten scrollen
        header.style.transform = "translateY(-100vh)";
      }
    } else {
      // Am Anfang der Seite
      header.classList.remove("small");
      header.style.position = "absolute";
      header.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
  });

  // Bildergalerie
  const slider = document.querySelector(".slider");
  const images = document.querySelectorAll(".slider img");
  const fullscreenDiv = document.getElementById("fullscreen");
  const fullscreenImg = document.getElementById("fullscreen-img");
  const leftArrow = document.getElementById("left-arrow");
  const rightArrow = document.getElementById("right-arrow");
  const closeBtn = document.getElementById("close-btn");

  let currentIndex = 0;
  let autoScrollInterval;
  let autoScrollTimeout;
  let isPaused = false; // Variable, um den Pausenzustand zu verfolgen

  // Funktion zum Starten des automatischen Scrollens
  const startAutoScroll = () => {
    stopAutoScroll(); // Verhindert mehrfache Intervallstarts
    autoScrollInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      slider.scrollTo({
        left: images[currentIndex].offsetLeft,
        behavior: "smooth",
      });
    }, 3000); // 3 Sekunden pro Bild
  };

  // Funktion zum Stoppen des automatischen Scrollens
  const stopAutoScroll = () => {
    clearInterval(autoScrollInterval);
  };

  // Funktion zum Öffnen des Vollbildmodus
  const openFullscreen = (index) => {
    currentIndex = index;
    fullscreenImg.src = images[currentIndex].src;
    fullscreenDiv.style.display = "flex";
    stopAutoScroll();
  };

  // Funktion zum Schließen des Vollbildmodus
  const closeFullscreen = () => {
    fullscreenDiv.style.display = "none";
    startAutoScroll();
  };

  // Funktion zum Wechseln des Bildes im Vollbildmodus mit Animation
  const changeImage = (direction) => {
    const newIndex = (currentIndex + direction + images.length) % images.length;
    const nextImage = images[newIndex];

    // Füge eine CSS-Klasse hinzu, um eine Animation zu aktivieren
    fullscreenImg.classList.add("fade-out");
    setTimeout(() => {
      // Setze die neue Bildquelle nach der Animation
      fullscreenImg.src = nextImage.src;
      currentIndex = newIndex;
      fullscreenImg.classList.remove("fade-out");
    }, 200); // Passe die Zeit hier an die Dauer deiner Animation an
  };

  // Event Listener für Bilder in der Galerie
  images.forEach((img, index) => {
    img.addEventListener("click", () => openFullscreen(index));
  });

  // Event Listener für Buttons im Vollbildmodus
  leftArrow.addEventListener("click", () => changeImage(-1));
  rightArrow.addEventListener("click", () => changeImage(1));
  closeBtn.addEventListener("click", closeFullscreen);

  // Starte das automatische Scrollen
  startAutoScroll();

  // Wisch-Gesten für den Slider
  let touchStartX = 0;

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchDiff = touchStartX - touchEndX;

    if (Math.abs(touchDiff) > 50) {
      // Schwellwert für das Wischen
      if (touchDiff > 0) {
        // Wisch nach links
        currentIndex = (currentIndex + 1) % images.length;
      } else {
        // Wisch nach rechts
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      }
      slider.scrollTo({
        left: images[currentIndex].offsetLeft,
        behavior: "smooth",
      });

      // Stoppe die automatische Bildlaufanimation für 3 Sekunden
      stopAutoScroll();
      clearTimeout(autoScrollTimeout);
      autoScrollTimeout = setTimeout(startAutoScroll, 3000);
    }
  });

  // Infinite Slider Galerie
  const sliderElement = document.querySelector(".infinite-slider");
  const sliderImages = sliderElement.querySelectorAll("img");

  let totalSliderWidth = 0;
  let currentOffset = 0;
  let autoScrollAnimationId;
  let isPausedInfinite = false; // Variable für Infinite Slider Pausenzustand

  if (sliderElement && sliderImages.length > 0) {
    window.onload = () => {
      sliderImages.forEach((img) => {
        totalSliderWidth += img.offsetWidth;
      });

      for (let i = 0; i < 3; i++) {
        // 3 mal klonen für insgesamt 3 Sets
        sliderImages.forEach((img) => {
          const clonedImage = img.cloneNode(true);
          sliderElement.appendChild(clonedImage);
        });
      }

      sliderElement.style.width = `${totalSliderWidth * 3}px`; // 3 mal die Gesamtbreite

      // Setze will-change und transform zur Hardware-Beschleunigung
      sliderElement.style.willChange = "transform";
      sliderElement.style.transform = "translateZ(0)";

      const animateInfiniteSlider = () => {
        if (!isPausedInfinite) {
          currentOffset -= 0.5; // Reduziere die Geschwindigkeit
          sliderElement.style.transform = `translateX(${currentOffset}px)`;

          if (Math.abs(currentOffset) >= totalSliderWidth * 2) {
            currentOffset = 0;
            sliderElement.style.transform = `translateX(${currentOffset}px)`;
          }

          autoScrollAnimationId = requestAnimationFrame(animateInfiniteSlider);
        }
      };

      const startInfiniteSlider = () => {
        animateInfiniteSlider();
        // Stoppe die Animation nach 30 Sekunden und starte sie neu
        setTimeout(() => {
          cancelAnimationFrame(autoScrollAnimationId);
          currentOffset = 0; // Setze den Slider auf Anfang zurück
          sliderElement.style.transform = `translateX(${currentOffset}px)`;
          startInfiniteSlider(); // Starte die Animation erneut
        }, 30000); // 30 Sekunden
      };

      startInfiniteSlider();

      sliderElement.addEventListener("click", () => {
        if (isPausedInfinite) {
          isPausedInfinite = false;
          startInfiniteSlider();
        } else {
          isPausedInfinite = true;
          cancelAnimationFrame(autoScrollAnimationId);
        }
      });
    };
  }
  // Preise
  const listItems = document.querySelectorAll("#preise .grid li");
  const totalPriceContainer = document.querySelector("#total-price");

  let total = 0;
  let activeItemsCount = 0; // Zählt die Anzahl der aktiven Listenelemente

  listItems.forEach((item) => {
    item.addEventListener("click", () => {
      const priceSpan = item.querySelector(".price");
      const priceValue = parseFloat(
        priceSpan.textContent.replace("€", "").trim()
      );

      if (item.classList.contains("active")) {
        // Remove from total
        total -= priceValue;
        item.classList.remove("active");
        activeItemsCount--; // Dekrementieren der Anzahl aktiver Elemente
      } else {
        // Add to total
        total += priceValue;
        item.classList.add("active");
        activeItemsCount++; // Inkrementieren der Anzahl aktiver Elemente
      }

      // Update the total price display
      if (activeItemsCount >= 2) {
        totalPriceContainer.style.display = "block"; // Zeige den Container an
        totalPriceContainer.classList.remove("hide");
        totalPriceContainer.classList.add("show");
        totalPriceContainer.querySelector(
          "p"
        ).textContent = `Gesamtpreis: €${total.toFixed(2)}`;
      } else {
        totalPriceContainer.classList.remove("show");
        totalPriceContainer.classList.add("hide");

        // Verwende setTimeout, um sicherzustellen, dass die slideOut-Animation abgeschlossen ist, bevor display: none gesetzt wird
        setTimeout(() => {
          totalPriceContainer.style.display = "none";
        }, 500); // Wartezeit, die der Dauer der slideOut-Animation entspricht
      }
    });
  });

  // Testimonials

  const toggleButton = document.querySelector(".toggle-button");
  const hiddenTestimonials = document.querySelectorAll(".testimonial.hidden");
  const testimonialsSection = document.getElementById("testimonials");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      hiddenTestimonials.forEach((testimonial) => {
        testimonial.classList.toggle("hidden");
      });

      if (toggleButton.textContent === "Mehr anzeigen") {
        toggleButton.textContent = "Weniger anzeigen";
        toggleButton.style.bottom = "1rem";
        testimonialsSection.style.paddingBottom = "4rem";
      } else {
        toggleButton.textContent = "Mehr anzeigen";
        toggleButton.style.bottom = "6rem";
        testimonialsSection.style.paddingBottom = "0rem";
      }

      if (toggleButton.textContent === "Mehr anzeigen") {
        toggleButton.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
        setTimeout(() => {
          header.style.transform = "translateY(-100vh)";
        }, 750);
      }
    });
  }
  hiddenTestimonials.forEach((testimonial) => {
    testimonial.classList.add("hidden");
  });

  hiddenTestimonials.forEach((testimonial) => {
    testimonial.classList.add("hidden");
  });
  // Funktion zum Setzen von Cookies
  function setCookie(name, value, days, sameSite = "Lax") {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    let cookieString =
      name + "=" + (value || "") + expires + "; path=/; SameSite=" + sameSite;
    // Uncomment the line below if using HTTPS
    // cookieString += "; Secure";
    document.cookie = cookieString;
    console.log("Cookie gesetzt: " + document.cookie); // Debugging
  }

  // Funktion zum Abrufen von Cookies
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Funktion zum Akzeptieren der Cookies
  function acceptCookies() {
    setCookie("cookieConsent", "true", 30, "Lax"); // Cookie für 30 Tage setzen
    const cookieBanner = document.getElementById("cookie-banner");
    cookieBanner.classList.remove("show-banner");
    cookieBanner.classList.add("hide-banner");

    setTimeout(() => {
      cookieBanner.style.display = "none";
    }, 500); // Die Dauer sollte mit der CSS-Transition übereinstimmen
  }

  // Toggle-Funktion für den Cookie-Banner
  const toggleCookies = document.querySelector("#toggleCookies");
  const closeCookies = document.querySelector("#closeCookies");
  const cookieBanner = document.getElementById("cookie-banner");

  toggleCookies.addEventListener("click", (event) => {
    event.preventDefault(); // Verhindert das Standardverhalten des Ankers

    if (cookieBanner.classList.contains("show-banner")) {
      cookieBanner.classList.remove("show-banner");
      cookieBanner.classList.add("hide-banner");

      // Nach Ablauf der Animation, das Banner ausblenden
      setTimeout(() => {
        cookieBanner.style.display = "none";
      }, 500);
    } else {
      cookieBanner.style.display = "grid"; // Zuerst das Banner sichtbar machen
      setTimeout(() => {
        cookieBanner.classList.remove("hide-banner");
        cookieBanner.classList.add("show-banner");
      }, 10); // Kurze Verzögerung, um die Display-Änderung wirksam zu machen
    }
  });
  closeCookies.addEventListener("click", () => {
    cookieBanner.classList.remove("show-banner");
    cookieBanner.classList.add("hide-banner");
  });
  // Funktion zur Überprüfung des Cookies
  function checkCookieConsent() {
    const cookieConsent = getCookie("cookieConsent");

    if (cookieConsent === "true") {
      document.getElementById("cookie-banner").style.display = "none";
    } else {
      const cookieBanner = document.getElementById("cookie-banner");
      cookieBanner.style.display = "grid";
      setTimeout(() => {
        cookieBanner.classList.add("show-banner");
      }, 10); // Kurze Verzögerung, um die Display-Änderung wirksam zu machen
    }
  }

  // Bindet die acceptCookies Funktion an das window Objekt, damit sie im globalen Kontext verfügbar ist
  window.acceptCookies = acceptCookies;

  // Cookie-Überprüfung beim Laden der Seite
  checkCookieConsent();

  // Smoothe Sprungmarken
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 750; // Scroll-Dauer in Millisekunden
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
    });
  });
});
