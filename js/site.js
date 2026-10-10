(function () {
    "use strict";

    document.documentElement.classList.add("js");

    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelectorAll(".nav-links a");

    // Light / dark theme (initial value is set by the inline script in <head>)
    var root = document.documentElement;
    var themeBtn = document.querySelector(".theme-toggle");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    function labelTheme() {
        var dark = root.getAttribute("data-theme") === "dark";
        var th = root.lang === "th";
        themeBtn.setAttribute(
            "aria-label",
            dark
                ? th ? "เปลี่ยนเป็นโหมดสว่าง" : "Switch to light mode"
                : th ? "เปลี่ยนเป็นโหมดมืด" : "Switch to dark mode"
        );
    }

    function setTheme(theme, save) {
        root.setAttribute("data-theme", theme);
        if (save) {
            try {
                localStorage.setItem("theme", theme);
            } catch (e) {}
        }
        labelTheme();
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", function () {
            setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
        });
        // Re-label when the language toggle changes <html lang>
        new MutationObserver(labelTheme).observe(root, { attributes: true, attributeFilter: ["lang"] });
        labelTheme();
    }

    // Follow the OS setting until the visitor picks a theme themselves
    function onSystemChange(e) {
        var saved;
        try {
            saved = localStorage.getItem("theme");
        } catch (err) {}
        if (!saved) setTheme(e.matches ? "dark" : "light", false);
    }
    if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);

    // Footer year
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Nav background after leaving the hero
    function onScroll() {
        nav.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.6);
        drawTimeline();
    }

    // Mobile menu
    function setMenu(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        var th = document.documentElement.lang === "th";
        toggle.setAttribute(
            "aria-label",
            open ? (th ? "ปิดเมนู" : "Close menu") : th ? "เปิดเมนู" : "Open menu"
        );
        document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
        setMenu(!nav.classList.contains("is-open"));
    });

    links.forEach(function (a) {
        a.addEventListener("click", function () {
            setMenu(false);
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    // Gold timeline thread follows scroll progress
    var timeline = document.querySelector(".timeline");

    function drawTimeline() {
        if (!timeline) return;
        var rect = timeline.getBoundingClientRect();
        var mid = window.innerHeight * 0.6;
        var progress = (mid - rect.top) / rect.height;
        progress = Math.max(0, Math.min(1, progress));
        timeline.style.setProperty("--progress", progress.toFixed(3));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", drawTimeline);
    // Opening a #hash link jumps after this script runs, so re-check on load
    window.addEventListener("load", onScroll);
    onScroll();

    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll("[data-reveal]").forEach(function (el) {
            el.classList.add("is-visible");
        });
        return;
    }

    // Reveal on scroll, staggered within each section
    document.querySelectorAll(".section").forEach(function (section) {
        section.querySelectorAll("[data-reveal]").forEach(function (el, i) {
            el.style.setProperty("--d", Math.min(i * 0.08, 0.4) + "s");
        });
    });

    var revealer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealer.unobserve(entry.target);
                }
            });
        },
        { rootMargin: "0px 0px -10% 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
        revealer.observe(el);
    });

    // Highlight the nav link for the section in view
    var byId = {};
    links.forEach(function (a) {
        var id = a.getAttribute("href").slice(1);
        if (id) byId[id] = a;
    });

    var spy = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    a.classList.remove("is-active");
                });
                var link = byId[entry.target.id];
                if (link) link.classList.add("is-active");
            });
        },
        { rootMargin: "-45% 0px -50% 0px" }
    );

    document.querySelectorAll("main section[id]").forEach(function (s) {
        spy.observe(s);
    });
})();
