/*
 * Hero sky - a WebGL night sky: three parallax star layers that twinkle,
 * and a faint petrol/olive Milky Way band. Deep navy fading to warm
 * espresso, never pure black. Plain WebGL 1, no dependencies.
 * Pauses off-screen / in hidden tabs; still frame for reduced motion.
 */
(function () {
    "use strict";

    var canvas = document.getElementById("hero-gl");
    if (!canvas) return;

    var gl =
        canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) ||
        canvas.getContext("experimental-webgl");
    if (!gl) return; // CSS gradient fallback stays visible

    var VERT = [
        "attribute vec2 a_pos;",
        "void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }",
    ].join("\n");

    var FRAG = [
        "precision highp float;",
        "uniform vec2 u_res;",
        "uniform float u_time;",
        "uniform vec2 u_mouse;",
        "uniform float u_zoom;",

        "const vec3 SKY_TOP    = vec3(0.071, 0.082, 0.106);",
        "const vec3 SKY_BOTTOM = vec3(0.118, 0.098, 0.082);",
        "const vec3 PETROL     = vec3(0.208, 0.361, 0.400);",
        "const vec3 OLIVE      = vec3(0.373, 0.420, 0.298);",
        "const vec3 GOLD       = vec3(0.910, 0.827, 0.659);",

        "float hash(vec2 p) {",
        "  p = fract(p * vec2(123.34, 456.21));",
        "  p += dot(p, p + 45.32);",
        "  return fract(p.x * p.y);",
        "}",

        "float noise(vec2 p) {",
        "  vec2 i = floor(p);",
        "  vec2 f = fract(p);",
        "  vec2 u = f * f * (3.0 - 2.0 * f);",
        "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
        "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
        "}",

        "float fbm(vec2 p) {",
        "  float v = 0.0;",
        "  float a = 0.5;",
        "  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
        "  for (int i = 0; i < 4; i++) {",
        "    v += a * noise(p);",
        "    p = m * p;",
        "    a *= 0.5;",
        "  }",
        "  return v;",
        "}",

        // One layer of stars: at most one star per grid cell
        "vec3 stars(vec2 uv, float scale, float density, float radius) {",
        "  vec2 g = uv * scale;",
        "  vec2 id = floor(g);",
        "  vec2 f = fract(g) - 0.5;",
        "  float h = hash(id);",
        "  if (h < density) return vec3(0.0);",
        "  vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;",
        "  float d = length(f - o * 0.7);",
        "  float tw = 0.55 + 0.45 * sin(u_time * (0.6 + h * 2.5) + h * 40.0);",
        "  float core = smoothstep(radius, 0.0, d);",
        "  float glow = exp(-d * d * 60.0) * 0.25;",
        "  vec3 tint = mix(vec3(1.0, 0.92, 0.80), vec3(0.82, 0.90, 1.0), hash(id + 1.3));",
        "  float b = (h - density) / (1.0 - density);",
        "  return tint * (core + glow) * tw * (0.4 + 0.6 * b);",
        "}",

        "void main() {",
        "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
        // zooming into a planet flies slightly forward through the stars
        "  uv /= 1.0 + u_zoom * 0.18;",
        "  vec2 m = u_mouse - 0.5;",
        "  float t = u_time;",

        "  vec3 col = mix(SKY_BOTTOM, SKY_TOP, smoothstep(-0.6, 0.6, uv.y));",

        // Milky Way: a soft diagonal band of dust, kept faint and cool
        "  vec2 nuv = uv + m * 0.02;",
        "  float band = exp(-pow((nuv.y - nuv.x * 0.42 + 0.05) * 2.4, 2.0));",
        "  float n = fbm(nuv * 2.2 + vec2(t * 0.006, 0.0));",
        "  float dust = smoothstep(0.38, 0.9, n) * band;",
        "  col += PETROL * dust * 0.32;",
        "  col += OLIVE * smoothstep(0.5, 0.95, fbm(nuv * 4.0 - 3.0)) * band * 0.10;",
        "  col += GOLD * pow(n, 5.0) * band * 0.18;",

        // Three star layers; nearer layers drift more with the mouse
        "  col += stars(uv + m * 0.006, 90.0, 0.90, 0.10) * 0.55;",
        "  col += stars(uv + m * 0.016, 42.0, 0.94, 0.07) * 0.85;",
        "  col += stars(uv + m * 0.032, 18.0, 0.975, 0.045) * 1.2;",
        // denser, fainter stars inside the band
        "  col += stars(uv + m * 0.01 + 11.0, 140.0, 0.80, 0.12) * band * 0.45;",

        "  vec2 q = gl_FragCoord.xy / u_res;",
        "  col *= mix(0.82, 1.0, smoothstep(1.1, 0.25, length(q - vec2(0.6, 0.5))));",

        "  gl_FragColor = vec4(col, 1.0);",
        "}",
    ].join("\n");

    function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn("hero-gl:", gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn("hero-gl:", gl.getProgramInfoLog(prog));
        return;
    }
    gl.useProgram(prog);

    // One oversized triangle covers the viewport
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");
    var uZoom = gl.getUniformLocation(prog, "u_zoom");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    var visible = true;
    var running = false;
    var start = performance.now();
    var raf = 0;

    function resize() {
        // Full resolution (capped) so stars stay crisp points
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var w = Math.floor(canvas.clientWidth * dpr);
        var h = Math.floor(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }

    function draw(time) {
        resize();
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, time);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uZoom, window.heroZoom || 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
        if (!running) return;
        draw((now - start) / 1000);
        raf = requestAnimationFrame(frame);
    }

    function update() {
        var shouldRun = visible && !document.hidden && !reduceMotion.matches;
        if (shouldRun && !running) {
            running = true;
            raf = requestAnimationFrame(frame);
        } else if (!shouldRun && running) {
            running = false;
            cancelAnimationFrame(raf);
        }
        if (!running) draw(4.0); // still frame
    }

    window.addEventListener("pointermove", function (e) {
        mouse.tx = e.clientX / window.innerWidth;
        mouse.ty = 1 - e.clientY / window.innerHeight;
    });

    window.addEventListener("resize", function () {
        if (!running) draw(4.0);
    });

    document.addEventListener("visibilitychange", update);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", update);

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            update();
        }).observe(canvas);
    }

    canvas.addEventListener("webglcontextlost", function (e) {
        e.preventDefault();
        running = false;
        cancelAnimationFrame(raf);
        canvas.classList.remove("is-ready");
    });

    update();
    requestAnimationFrame(function () {
        canvas.classList.add("is-ready");
    });
})();
