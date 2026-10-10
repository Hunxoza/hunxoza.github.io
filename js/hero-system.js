/*
 * Hero system - Roslyn's work drawn as a tiny solar system.
 *   1. Stardust spirals in and condenses into a glowing core     (0 -> 1)
 *   2. Orbits draw in one by one; a planet appears on each       (her areas of work)
 *   3. Gold data pulses travel planet -> core -> planet           (everything connects)
 * Interaction:
 *   - hover / focus a planet: it glows, the system slows down
 *   - click / tap a planet: the camera zooms in and a detail panel opens
 *     (desktop: replaces the intro text, mobile: bottom sheet)
 *   - prev / next / back buttons, Esc, arrow keys, swipe on mobile
 *   - click the core: the system breaks apart and rebuilds from scratch
 * Planets are real <button>s positioned over the canvas, so they work with
 * keyboard and screen readers. Pauses off-screen / in hidden tabs; reduced
 * motion shows still frames and instant zooms.
 */
(function () {
    "use strict";

    var hero = document.querySelector(".hero");
    var canvas = document.getElementById("hero-system");
    var layer = document.getElementById("hero-planets");
    var panel = document.getElementById("planet-panel");
    if (!hero || !canvas || !canvas.getContext || !layer || !panel) return;
    var ctx = canvas.getContext("2d");
    var root = document.documentElement;

    var RGB = {
        gold: "232, 211, 168",
        goldDeep: "184, 147, 90",
        bone: "244, 238, 228",
        teal: "111, 160, 160",
        olive: "150, 165, 120",
        copper: "214, 137, 90",
        mushroom: "190, 178, 165",
        night: "18, 21, 27",
    };

    // r = orbit radius (x R), speed in rad/s
    var PLANETS = [
        {
            r: 0.32,
            speed: 0.15,
            color: "olive",
            size: 7,
            href: "#experience",
            tags: ["Odoo", "Python", "PostgreSQL", "XML/QWeb"],
            en: {
                label: "Odoo ERP",
                title: "Odoo ERP",
                desc: "Custom Odoo modules, upgrades and integrations for multi-brand retail groups, F&B, leisure and certification businesses.",
                link: "See experience",
            },
            th: {
                label: "Odoo ERP",
                title: "Odoo ERP",
                desc: "พัฒนาโมดูล อัปเกรด และเชื่อมต่อระบบ Odoo ให้เครือธุรกิจค้าปลีกหลายแบรนด์ ร้านอาหารและเครื่องดื่ม ธุรกิจสันทนาการ และบริการตรวจรับรองมาตรฐาน",
                link: "ดูประสบการณ์",
            },
        },
        {
            r: 0.47,
            speed: 0.11,
            color: "gold",
            size: 5,
            ring: true,
            href: "#experience",
            tags: ["REST API", "Python", "Postman", "Cloudflare"],
            en: {
                label: "API",
                title: "API & Integration",
                desc: "Designing API architecture so ERP, apps and services talk to each other cleanly.",
                link: "See experience",
            },
            th: {
                label: "API",
                title: "API และการเชื่อมต่อระบบ",
                desc: "ออกแบบสถาปัตยกรรม API ให้ ERP แอป และระบบต่าง ๆ ทำงานร่วมกันได้อย่างราบรื่น",
                link: "ดูประสบการณ์",
            },
        },
        {
            r: 0.62,
            speed: 0.085,
            color: "copper",
            size: 6,
            moon: true,
            href: "#experience",
            tags: ["Product design", "System design", "Kotlin", "Supabase"],
            en: {
                label: "Product",
                title: "Product & Founder",
                desc: "Co-founding two consumer products from 0 to 1: leading product design for a pet‑friendly community, and building a sustainable-living app end to end.",
                link: "See experience",
            },
            th: {
                label: "โปรดักต์",
                title: "สร้างโปรดักต์ใหม่",
                desc: "ร่วมก่อตั้งและสร้างโปรดักต์ใหม่ 2 ตัวตั้งแต่ศูนย์ ดูแลการออกแบบโปรดักต์ของคอมมูนิตี้ pet‑friendly และทำแอปด้านการใช้ชีวิตอย่างยั่งยืนเองทุกส่วน",
                link: "ดูประสบการณ์",
            },
        },
        {
            r: 0.78,
            speed: 0.065,
            color: "teal",
            size: 5.5,
            href: "#skills",
            tags: ["Kotlin", "Jetpack Compose", "NextJS", "React", "Supabase"],
            en: {
                label: "Mobile & Web",
                title: "Mobile & Web",
                desc: "Android apps in Kotlin and Jetpack Compose, web apps in NextJS and React, backed by Supabase and PostgreSQL.",
                link: "See skills",
            },
            th: {
                label: "Mobile & Web",
                title: "Mobile และ Web",
                desc: "แอป Android ด้วย Kotlin และ Jetpack Compose เว็บแอปด้วย NextJS และ React โดยมี Supabase และ PostgreSQL เป็น backend",
                link: "ดูทักษะ",
            },
        },
        {
            r: 0.93,
            speed: 0.05,
            color: "mushroom",
            size: 5,
            href: "#projects",
            tags: ["Python", "SQL", "Pandas", "PowerBI"],
            en: {
                label: "Data & Research",
                title: "Data & Research",
                desc: "Data cleansing, analysis and dashboards, plus research on self-learning behavior published on IEEE.",
                link: "See the research",
            },
            th: {
                label: "ข้อมูลและวิจัย",
                title: "ข้อมูลและงานวิจัย",
                desc: "ทำ data cleansing วิเคราะห์ข้อมูล และทำ dashboard รวมถึงงานวิจัยเรื่องพฤติกรรมการเรียนรู้ด้วยตนเองที่ตีพิมพ์ใน IEEE",
                link: "ดูงานวิจัย",
            },
        },
    ];

    var UI = {
        en: {
            click: "Click a planet to explore",
            tap: "Tap a planet to explore",
            back: "Back to system",
            prev: "Previous",
            next: "Next",
            core: "Rebuild from scratch",
        },
        th: {
            click: "คลิกที่ดาวเพื่อดูรายละเอียด",
            tap: "แตะที่ดาวเพื่อดูรายละเอียด",
            back: "กลับไปดูภาพรวม",
            prev: "ก่อนหน้า",
            next: "ถัดไป",
            core: "สร้างใหม่ตั้งแต่ศูนย์",
        },
    };

    var TILT = 0.36; // ellipse squash: orbits seen at an angle
    var ROT = -0.18; // whole system tilted slightly
    var BUILD_DONE = 4.0; // seconds until the system is interactive

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var touchOnly = window.matchMedia("(hover: none)");

    var W = 0,
        H = 0,
        cx = 0,
        cy = 0,
        R = 0,
        compact = false;
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    var T = 0; // build clock, only advances while visible
    var last = 0;
    var running = false;
    var visible = true;
    var raf = 0;
    var dust = [];
    var pulses = [];
    var shooting = [];
    var nextPulse = BUILD_DONE;
    var nextShoot = 6;
    var hovered = -1;
    var zoomTarget = -1;
    var lastFocus = 0;
    var speedFactor = 1;
    var hintSeen = false;
    var cam = { fx: 0, fy: 0, ax: 0, ay: 0, s: 1 };
    var states = [];

    PLANETS.forEach(function (p, i) {
        p.a0 = -Math.PI / 2 + i * 2.5;
        p.age = 0;
    });

    function clamp01(v) {
        return v < 0 ? 0 : v > 1 ? 1 : v;
    }
    function ease(v) {
        v = clamp01(v);
        return 1 - Math.pow(1 - v, 3);
    }
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    function lang() {
        return root.lang === "th" ? "th" : "en";
    }
    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }

    /* ---------- Layout ---------- */

    function zoomScale() {
        return compact ? 2.4 : 3.2;
    }

    function anchor() {
        return compact ? { x: W * 0.5, y: H * 0.27 } : { x: W * 0.7, y: H * 0.5 };
    }

    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        compact = W < 760;
        if (compact) {
            cx = W * 0.5;
            cy = H * 0.86;
            R = W * 0.56;
        } else {
            cx = W * 0.74;
            cy = H * 0.52;
            R = Math.min(W * 0.22, H * 0.4);
        }
        if (zoomTarget < 0) {
            cam.fx = cam.ax = cx;
            cam.fy = cam.ay = cy;
            cam.s = 1;
        }
        seedDust();
    }

    function seedDust() {
        dust = [];
        var n = compact ? 120 : 220;
        for (var i = 0; i < n; i++) {
            dust.push({
                ang: Math.random() * Math.PI * 2,
                dist: R * (0.9 + Math.random() * 1.4),
                delay: Math.random() * 0.7,
                size: Math.random() * 1.3 + 0.4,
                spin: 1.5 + Math.random() * 1.5,
            });
        }
    }

    /* ---------- World -> screen ---------- */

    // Position on an orbit in world space (depth: +1 front, -1 back)
    function project(r, ang) {
        var x = Math.cos(ang) * r * R;
        var y = Math.sin(ang) * r * R * TILT;
        var c = Math.cos(ROT),
            s = Math.sin(ROT);
        return {
            x: cx + mouse.x + x * c - y * s,
            y: cy + mouse.y + x * s + y * c,
            depth: Math.sin(ang),
        };
    }

    function coreWorld() {
        return { x: cx + mouse.x, y: cy + mouse.y };
    }

    // Camera: world point (fx, fy) lands on screen point (ax, ay), scaled by s
    function toScreen(pt) {
        return { x: cam.ax + (pt.x - cam.fx) * cam.s, y: cam.ay + (pt.y - cam.fy) * cam.s };
    }

    function zoomAmount() {
        return clamp01((cam.s - 1) / (zoomScale() - 1));
    }

    function focusIndex() {
        return zoomTarget >= 0 ? zoomTarget : lastFocus;
    }

    function computeStates() {
        states = PLANETS.map(function (p, i) {
            var start = 1.3 + i * 0.3;
            var ang = p.a0 + p.speed * p.age;
            return {
                orbit: ease((T - start) / 1.0),
                appear: ease((T - start - 0.9) / 0.5),
                ang: ang,
                world: project(p.r, ang),
            };
        });
    }

    function updateCamera(dt) {
        var k = reduceMotion.matches ? 1 : 1 - Math.exp(-dt * 4.5);
        var c = coreWorld();
        var tx = c.x,
            ty = c.y,
            ax = c.x,
            ay = c.y,
            s = 1;
        if (zoomTarget >= 0) {
            var p = states[zoomTarget].world;
            var a = anchor();
            tx = p.x;
            ty = p.y;
            ax = a.x;
            ay = a.y;
            s = zoomScale();
        }
        cam.fx += (tx - cam.fx) * k;
        cam.fy += (ty - cam.fy) * k;
        cam.ax += (ax - cam.ax) * k;
        cam.ay += (ay - cam.ay) * k;
        cam.s += (s - cam.s) * k;
        states.forEach(function (st) {
            st.screen = toScreen(st.world);
        });
    }

    /* ---------- Drawing ---------- */

    function drawShootingStars(dt) {
        for (var i = shooting.length - 1; i >= 0; i--) {
            var s = shooting[i];
            s.t += dt;
            var k = s.t / s.life;
            if (k >= 1) {
                shooting.splice(i, 1);
                continue;
            }
            var hx = s.x + s.vx * s.t,
                hy = s.y + s.vy * s.t;
            var len = 110;
            var n = Math.hypot(s.vx, s.vy);
            var tx = hx - (s.vx / n) * len,
                ty = hy - (s.vy / n) * len;
            var a = Math.sin(Math.PI * k) * 0.8;
            var g = ctx.createLinearGradient(hx, hy, tx, ty);
            g.addColorStop(0, "rgba(" + RGB.gold + "," + a + ")");
            g.addColorStop(1, "rgba(" + RGB.gold + ",0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }
    }

    function drawDust() {
        var c = coreWorld();
        for (var i = 0; i < dust.length; i++) {
            var d = dust[i];
            var e = ease((T - d.delay) / 1.8);
            if (e >= 1) continue;
            var dist = d.dist * (1 - e);
            var ang = d.ang + e * d.spin;
            var p = toScreen({ x: c.x + Math.cos(ang) * dist, y: c.y + Math.sin(ang) * dist * 0.6 });
            var a = (1 - e) * 0.8 * clamp01(T * 3);
            ctx.fillStyle = "rgba(" + RGB.gold + "," + a.toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, d.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCore(z) {
        var a = ease((T - 0.9) / 1.0) * (1 - 0.6 * z);
        if (a <= 0) return;
        var c = toScreen(coreWorld());
        var breathe = 1 + Math.sin(T * 1.4) * 0.06;
        var glowR = R * 0.2 * breathe * Math.sqrt(cam.s);
        var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, glowR);
        g.addColorStop(0, "rgba(" + RGB.gold + "," + 0.55 * a + ")");
        g.addColorStop(0.25, "rgba(" + RGB.goldDeep + "," + 0.22 * a + ")");
        g.addColorStop(1, "rgba(" + RGB.goldDeep + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(" + RGB.bone + "," + a + ")";
        ctx.beginPath();
        ctx.arc(c.x, c.y, (compact ? 5 : 7) * breathe * Math.sqrt(cam.s), 0, Math.PI * 2);
        ctx.fill();
    }

    function drawOrbit(p, st, i, z) {
        if (st.orbit <= 0) return;
        var c = toScreen(coreWorld());
        var base = hovered === i && z < 0.05 ? 0.45 : 0.16 + 0.06 * st.appear;
        var a = i === focusIndex() ? lerp(base, 0.3, z) : base * (1 - 0.85 * z);
        if (a <= 0.005) return;
        ctx.strokeStyle = "rgba(" + RGB.gold + "," + a.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(
            c.x,
            c.y,
            p.r * R * cam.s,
            p.r * R * TILT * cam.s,
            ROT,
            p.a0,
            p.a0 + Math.PI * 2 * st.orbit
        );
        ctx.stroke();

        // bright "pen tip" while the orbit is being drawn
        if (st.orbit < 1) {
            var tip = toScreen(project(p.r, p.a0 + Math.PI * 2 * st.orbit));
            ctx.fillStyle = "rgba(" + RGB.gold + ",0.9)";
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Close-up detail: cloud bands, night side and atmosphere
    function drawSurface(p, pt, r, z, lit) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.clip();

        for (var k = 0; k < 5; k++) {
            var y = pt.y + r * (-0.8 + k * 0.4) + Math.sin(T * 0.25 + k * 1.7) * r * 0.05;
            ctx.strokeStyle = "rgba(" + RGB.bone + "," + (0.1 * z).toFixed(3) + ")";
            ctx.lineWidth = r * (0.06 + 0.05 * (k % 2));
            ctx.beginPath();
            ctx.ellipse(pt.x, y, r * 1.2, r * 0.14, 0.22, 0, Math.PI * 2);
            ctx.stroke();
        }

        var shade = ctx.createLinearGradient(
            pt.x + lit.x * r,
            pt.y + lit.y * r,
            pt.x - lit.x * r,
            pt.y - lit.y * r
        );
        shade.addColorStop(0, "rgba(" + RGB.night + ",0)");
        shade.addColorStop(0.55, "rgba(" + RGB.night + "," + (0.15 * z).toFixed(3) + ")");
        shade.addColorStop(1, "rgba(" + RGB.night + "," + (0.65 * z).toFixed(3) + ")");
        ctx.fillStyle = shade;
        ctx.fillRect(pt.x - r, pt.y - r, r * 2, r * 2);
        ctx.restore();

        ctx.strokeStyle = "rgba(" + RGB[p.color] + "," + (0.4 * z).toFixed(3) + ")";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 1.05, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawPlanet(p, st, i, z) {
        if (st.appear <= 0) return;
        var pt = st.screen;
        var front = (st.world.depth + 1) / 2; // 0 back .. 1 front
        var isFocus = i === focusIndex();
        var base = (0.8 + 0.3 * front) * (compact ? 0.9 : 1) * (0.4 + 0.6 * st.appear) * p.size * 1.3;
        var r = isFocus ? base * (1 + z * (compact ? 4 : 5.5)) : base * (1 + (cam.s - 1) * 0.35);
        var alpha = st.appear * (0.6 + 0.4 * front);
        alpha = isFocus ? lerp(alpha, 1, z) : alpha * (1 - 0.8 * z);
        if (alpha <= 0.01) return;
        var hot = hovered === i && z < 0.05;

        var glowR = r * (hot ? 5.5 : 4);
        var glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
        glow.addColorStop(0, "rgba(" + RGB[p.color] + "," + (hot ? 0.55 : 0.35) * alpha + ")");
        glow.addColorStop(1, "rgba(" + RGB[p.color] + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // lit from the core: highlight offset toward the centre
        var c = toScreen(coreWorld());
        var dx = c.x - pt.x,
            dy = c.y - pt.y,
            len = Math.hypot(dx, dy) || 1;
        var lit = { x: dx / len, y: dy / len };
        var body = ctx.createRadialGradient(
            pt.x + lit.x * r * 0.45,
            pt.y + lit.y * r * 0.45,
            r * 0.1,
            pt.x,
            pt.y,
            r
        );
        body.addColorStop(0, "rgba(" + RGB.bone + "," + alpha + ")");
        body.addColorStop(0.5, "rgba(" + RGB[p.color] + "," + alpha + ")");
        body.addColorStop(1, "rgba(" + RGB[p.color] + "," + alpha * 0.55 + ")");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (isFocus && z > 0.02) drawSurface(p, pt, r, z, lit);

        if (p.ring) {
            ctx.strokeStyle = "rgba(" + RGB.gold + "," + 0.7 * alpha + ")";
            ctx.lineWidth = 1 + z * (isFocus ? 1.5 : 0);
            ctx.beginPath();
            ctx.ellipse(pt.x, pt.y, r * 2.2, r * 0.7, -0.35, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Product has a small moon (the second product), visible up close
        if (p.moon && isFocus && z > 0.05) {
            var ma = T * 0.5;
            var mx = pt.x + Math.cos(ma) * r * 1.9;
            var my = pt.y + Math.sin(ma) * r * 0.55;
            if (Math.sin(ma) < 0 || Math.hypot(mx - pt.x, my - pt.y) > r) {
                ctx.fillStyle = "rgba(" + RGB.olive + "," + z.toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(mx, my, r * 0.16, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Quadratic curve through the core: planet -> core -> planet
    function spawnPulse() {
        var from = Math.floor(Math.random() * PLANETS.length);
        var to = (from + 1 + Math.floor(Math.random() * (PLANETS.length - 1))) % PLANETS.length;
        pulses.push({ from: from, to: to, born: T, life: 2.2 });
        nextPulse = T + 0.55 + Math.random() * 0.9;
    }

    function spawnShootingStar() {
        var angle = 2.55 + Math.random() * 0.35; // heading down-left
        var speed = (compact ? 520 : 820) + Math.random() * 300;
        shooting.push({
            x: W * (0.35 + Math.random() * 0.6),
            y: H * Math.random() * 0.35,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            t: 0,
            life: 0.9 + Math.random() * 0.4,
        });
        nextShoot = T + 7 + Math.random() * 8;
    }

    function drawPulses(z) {
        if (z >= 0.95) return;
        var c = coreWorld();
        for (var i = pulses.length - 1; i >= 0; i--) {
            var p = pulses[i];
            var k = (T - p.born) / p.life;
            if (k >= 1) {
                pulses.splice(i, 1);
                continue;
            }
            var a = states[p.from].world,
                b = states[p.to].world;
            var head = k * k * (3 - 2 * k);
            for (var j = 0; j < 16; j++) {
                var t = head - j * 0.012;
                if (t < 0) break;
                var u = 1 - t;
                var q = toScreen({
                    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
                    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
                });
                var fade = (1 - j / 16) * Math.sin(Math.PI * k) * (1 - z);
                ctx.fillStyle = "rgba(" + RGB.gold + "," + (0.85 * fade).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(q.x, q.y, j === 0 ? 2 : 1.3 * (1 - j / 16) + 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function draw(dt) {
        var z = zoomAmount();
        ctx.clearRect(0, 0, W, H);

        ctx.globalAlpha = 1;
        drawShootingStars(dt);

        ctx.globalAlpha = compact ? lerp(0.85, 1, z) : 1;
        drawDust();
        PLANETS.forEach(function (p, i) {
            drawOrbit(p, states[i], i, z);
        });

        // planets behind the core first, then core, then those in front
        var order = PLANETS.map(function (p, i) {
            return i;
        }).sort(function (a, b) {
            return states[a].world.depth - states[b].world.depth;
        });
        var f = focusIndex();
        order.forEach(function (i) {
            if (states[i].world.depth < 0 && i !== f) drawPlanet(PLANETS[i], states[i], i, z);
        });
        drawCore(z);
        drawPulses(z);
        order.forEach(function (i) {
            if (states[i].world.depth >= 0 && i !== f) drawPlanet(PLANETS[i], states[i], i, z);
        });
        // focused planet always on top so the close-up is never hidden
        drawPlanet(PLANETS[f], states[f], f, z);

        ctx.globalAlpha = 1;
        window.heroZoom = z; // read by hero-gl.js for a subtle fly-in through the stars
    }

    /* ---------- DOM layer: planet buttons, core button, hint ---------- */

    var buttons = PLANETS.map(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "planet-btn";
        b.innerHTML = '<span class="planet-label"></span>';
        b.style.setProperty("--d", (i * 0.35).toFixed(2) + "s");
        b.addEventListener("click", function (e) {
            e.stopPropagation();
            open(i);
        });
        b.addEventListener("pointerenter", function () {
            hovered = i;
            kick();
        });
        b.addEventListener("pointerleave", function () {
            if (hovered === i) hovered = -1;
            kick();
        });
        b.addEventListener("focus", function () {
            hovered = i;
            kick();
        });
        b.addEventListener("blur", function () {
            if (hovered === i) hovered = -1;
            kick();
        });
        layer.appendChild(b);
        return b;
    });

    var coreBtn = document.createElement("button");
    coreBtn.type = "button";
    coreBtn.className = "planet-btn core-btn";
    coreBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        rebuild();
    });
    layer.appendChild(coreBtn);

    var hint = document.createElement("p");
    hint.className = "hero-hint";
    hint.setAttribute("aria-hidden", "true");
    layer.appendChild(hint);

    function place(el, x, y, centered) {
        el.style.transform =
            "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)" + (centered ? " translateX(-50%)" : "");
    }

    function syncDom() {
        var z = zoomAmount();
        var idle = zoomTarget < 0 && z < 0.05;
        states.forEach(function (st, i) {
            var b = buttons[i];
            var on = idle && st.appear > 0.6;
            place(b, st.screen.x, st.screen.y);
            b.classList.toggle("is-on", on);
            b.classList.toggle("is-hot", hovered === i);
            b.classList.toggle("label-left", st.screen.x > W * (compact ? 0.62 : 0.86));
            b.tabIndex = on ? 0 : -1;
        });

        var c = toScreen(coreWorld());
        place(coreBtn, c.x, c.y);
        var coreOn = idle && T > BUILD_DONE;
        coreBtn.classList.toggle("is-on", coreOn);
        coreBtn.tabIndex = coreOn ? 0 : -1;

        if (compact) place(hint, W * 0.5, H - 22, true);
        else place(hint, c.x, c.y + R * TILT * 0.95 + 34, true);
        var hinting = idle && !hintSeen && T > BUILD_DONE + 0.4;
        hint.classList.toggle("is-on", hinting);
        layer.classList.toggle("is-hinting", hinting);
    }

    function relabel() {
        var L = lang();
        var ui = UI[L];
        buttons.forEach(function (b, i) {
            b.firstChild.textContent = PLANETS[i][L].label;
            b.setAttribute("aria-label", PLANETS[i][L].title);
        });
        coreBtn.setAttribute("aria-label", ui.core);
        coreBtn.setAttribute("data-tip", ui.core);
        hint.textContent = touchOnly.matches ? ui.tap : ui.click;
        panelEls.prev.setAttribute("aria-label", ui.prev);
        panelEls.next.setAttribute("aria-label", ui.next);
        panelEls.back.textContent = ui.back;
        if (zoomTarget >= 0) fillPanel(zoomTarget);
    }

    /* ---------- Detail panel ---------- */

    var panelEls = {
        count: panel.querySelector(".planet-count"),
        title: panel.querySelector(".planet-title"),
        desc: panel.querySelector(".planet-desc"),
        tags: panel.querySelector(".planet-tags"),
        link: panel.querySelector(".planet-link"),
        prev: panel.querySelector('[data-dir="-1"]'),
        next: panel.querySelector('[data-dir="1"]'),
        back: panel.querySelector(".planet-back"),
    };

    function fillPanel(i) {
        var p = PLANETS[i];
        var t = p[lang()];
        panelEls.count.textContent = pad(i + 1) + " / " + pad(PLANETS.length);
        panelEls.title.textContent = t.title;
        panelEls.desc.textContent = t.desc;
        panelEls.tags.innerHTML = "";
        p.tags.forEach(function (tag) {
            var li = document.createElement("li");
            li.textContent = tag;
            panelEls.tags.appendChild(li);
        });
        panelEls.link.textContent = t.link;
        panelEls.link.setAttribute("href", p.href);
    }

    function open(i) {
        if (T < BUILD_DONE) return;
        var wasOpen = zoomTarget >= 0;
        zoomTarget = i;
        lastFocus = i;
        hovered = -1;
        hintSeen = true;
        fillPanel(i);
        hero.classList.add("is-zoomed");
        panel.setAttribute("aria-hidden", "false");
        if (!wasOpen) {
            setTimeout(function () {
                panelEls.title.focus({ preventScroll: true });
            }, 60);
        }
        kick();
    }

    function close(restoreFocus) {
        if (zoomTarget < 0) return;
        var i = zoomTarget;
        zoomTarget = -1;
        hero.classList.remove("is-zoomed");
        panel.setAttribute("aria-hidden", "true");
        if (restoreFocus !== false && panel.contains(document.activeElement)) {
            buttons[i].focus({ preventScroll: true });
        }
        kick();
    }

    function step(dir) {
        var n = PLANETS.length;
        open((zoomTarget + dir + n) % n);
    }

    function rebuild() {
        close(false);
        hintSeen = true;
        hovered = -1;
        if (reduceMotion.matches) return;
        T = 0;
        seedDust();
        pulses = [];
        nextPulse = BUILD_DONE;
        PLANETS.forEach(function (p) {
            p.age = 0;
        });
        kick();
    }

    panelEls.prev.addEventListener("click", function () {
        step(-1);
    });
    panelEls.next.addEventListener("click", function () {
        step(1);
    });
    panelEls.back.addEventListener("click", function () {
        close();
    });
    panelEls.link.addEventListener("click", function () {
        close(false);
    });

    // Click empty space in the hero to zoom back out
    hero.addEventListener("click", function (e) {
        if (zoomTarget >= 0 && !panel.contains(e.target)) close();
    });

    document.addEventListener("keydown", function (e) {
        if (zoomTarget < 0) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
    });

    // Swipe the bottom sheet left / right on touch screens
    var touchX = null;
    panel.addEventListener(
        "touchstart",
        function (e) {
            touchX = e.touches[0].clientX;
        },
        { passive: true }
    );
    panel.addEventListener(
        "touchend",
        function (e) {
            if (touchX === null || zoomTarget < 0) return;
            var dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        },
        { passive: true }
    );

    /* ---------- Loop ---------- */

    function tick(dt) {
        var rm = reduceMotion.matches;
        if (!rm) T += dt;

        var target = zoomTarget >= 0 ? 0 : hovered >= 0 ? 0.2 : 1;
        speedFactor += (target - speedFactor) * (rm ? 1 : 1 - Math.exp(-dt * 4));
        PLANETS.forEach(function (p, i) {
            if (!rm && T > 2.2 + i * 0.3) p.age += dt * speedFactor;
        });

        var mtx = zoomTarget >= 0 ? 0 : mouse.tx,
            mty = zoomTarget >= 0 ? 0 : mouse.ty;
        mouse.x += (mtx - mouse.x) * 0.05;
        mouse.y += (mty - mouse.y) * 0.05;

        if (!rm && T > BUILD_DONE && zoomTarget < 0 && T >= nextPulse) spawnPulse();
        if (!rm && T > BUILD_DONE && T >= nextShoot) spawnShootingStar();

        computeStates();
        updateCamera(dt);
        draw(dt);
        syncDom();
    }

    function frame(now) {
        if (!running) return;
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        tick(dt);
        raf = requestAnimationFrame(frame);
    }

    // Render on demand when the loop is paused (reduced motion / off-screen)
    function kick() {
        if (!running) tick(0);
    }

    function update() {
        var shouldRun = visible && !document.hidden && !reduceMotion.matches;
        if (shouldRun && !running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(frame);
        } else if (!shouldRun && running) {
            running = false;
            cancelAnimationFrame(raf);
        }
        if (reduceMotion.matches) {
            T = Math.max(T, 8); // finished system, no pulses
            pulses = [];
            shooting = [];
            tick(0);
        }
    }

    window.addEventListener("pointermove", function (e) {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * -18;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * -12;
    });

    window.addEventListener("resize", function () {
        resize();
        kick();
    });

    document.addEventListener("visibilitychange", update);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", update);
    if (touchOnly.addEventListener) touchOnly.addEventListener("change", relabel);

    // The language toggle changes <html lang>; keep labels in sync
    new MutationObserver(relabel).observe(root, { attributes: true, attributeFilter: ["lang"] });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (!visible) close(false);
            update();
        }).observe(canvas);
    }

    panel.setAttribute("aria-hidden", "true");
    resize();
    relabel();
    computeStates();
    update();
})();
