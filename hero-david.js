/* Little David: a textured 2.5D character, with local eye/facial deformation.
   The generated studio plate is composited once; no network service is needed. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const traveler = document.getElementById('davidTraveler');
  const stage = document.getElementById('davidStage');
  const canvas = document.getElementById('davidCanvas');
  const pet = document.getElementById('assistantFab');
  const panel = document.getElementById('assistantPanel');
  const copy = document.querySelector('.hero-copy-wrap');
  if (!hero || !traveler || !canvas || !pet) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const smooth = n => n * n * (3 - 2 * n);
  const mix = (a, b, n) => a + (b - a) * n;
  let frame = 0, ready = false, progress = 0;
  let draw = () => {};
  let targetX = 0, targetY = 0, gazeX = 0, gazeY = 0;
  let geometry = { x: 0, y: 0, width: 1024 };
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  function update() {
    frame = 0;
    if (!ready) return;
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    const mobile = w <= 760;
    const heroHeight = hero.offsetHeight;
    const raw = clamp(window.scrollY / (heroHeight * .88));
    progress = motion.matches ? (raw >= .62 ? 1 : 0) : smooth(raw);
    const petRect = pet.getBoundingClientRect();
    const petWidth = mobile ? 140 : 168;
    const petRight = petRect.width ? w - petRect.right : (mobile ? 12 : 18);
    const petBottom = petRect.height ? h - petRect.bottom : (mobile ? 10 : 12);
    const endX = w - petRight - (mobile ? 104 : 132) / 2 - petWidth * .5;
    const endY = h - petBottom - petWidth * 1.5;
    const startWidth = mobile ? Math.min(w * 2.10, (heroHeight - 245) * 2.02) : Math.min(w * 1.65, heroHeight * 2.8);
    const startX = (mobile ? w * .50 : w * .32) - startWidth * .50;
    const startY = mobile ? 275 - startWidth * .04 : heroHeight * .45 - startWidth * .285;
    const width = mix(startWidth, petWidth, progress);
    const arc = motion.matches ? 0 : Math.sin(progress * Math.PI) * Math.min(110, h * .14);
    geometry = { x: mix(startX, endX, progress), y: mix(startY, endY, progress) - arc, width };
    traveler.style.transform = `translate3d(${geometry.x}px,${geometry.y}px,0) scale(${width / 1024})`;
    traveler.style.setProperty('--landing', String(progress));
    traveler.style.setProperty('--shadow-scale', String(.6 + progress * .4));
    stage.classList.toggle('is-pet', progress > .02);
    copy.style.opacity = String(motion.matches ? 1 : clamp(1 - raw * 2.4));
    // Keep an open or keyboard-focused guide available when returning to the hero.
    const retainGuide = !panel.hidden || document.activeElement === pet;
    pet.hidden = progress < .98 && !retainGuide;
    pet.classList.toggle('guide-without-pet', !pet.hidden && progress < .98);
    if (motion.matches || !pointer.matches) targetX = targetY = gazeX = gazeY = 0;
    gazeX = mix(gazeX, targetX, .18);
    gazeY = mix(gazeY, targetY, .18);
    draw(gazeX, gazeY, progress);
    if (Math.abs(gazeX - targetX) + Math.abs(gazeY - targetY) > .002) schedule();
  }
  // Composite the studio plate once. Subsequent frames share the same GPU texture.
  function composite(image) {
    const plate = document.createElement('canvas');
    plate.width = 1024; plate.height = 1536;
    const context = plate.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, plate.width, plate.height);
    const pixels = context.getImageData(0, 0, plate.width, plate.height);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const excess = data[i + 1] - Math.max(data[i], data[i + 2]);
      const spill = Math.max(0, data[i + 1] - Math.max(data[i] * 1.2, data[i + 2] * .65));
      const alpha = (1 - smooth(clamp((excess - 15) / 95))) * (1 - smooth(clamp(spill / 60)));
      data[i + 3] = Math.round(alpha * 255);
      if (excess > 15) data[i + 1] = Math.min(data[i + 1], Math.max(data[i], data[i + 2]) + 15);
    }
    context.putImageData(pixels, 0, 0);
    return plate;
  }
  function makeRenderer(plate) {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
    if (!gl) return fallback(plate);
    const vertex = `attribute vec2 position; varying vec2 uv;
      void main(){uv=vec2((position.x+1.0)*.5,(1.0-position.y)*.5);gl_Position=vec4(position,0.,1.);}`;
    const fragment = `precision mediump float;
      varying vec2 uv; uniform sampler2D portrait; uniform vec2 gaze; uniform float journey;
      float zone(vec2 p, vec2 center, vec2 radius){vec2 d=(p-center)/radius;return exp(-dot(d,d)*2.0);}
      void main(){
        vec2 p=uv*vec2(1024.,1536.); vec2 shift=vec2(0.);
        // Real irises, bounded inside the original glasses and eye sockets.
        shift+=gaze*vec2(11.,6.)*zone(p,vec2(447.,300.),vec2(41.,24.));
        shift+=gaze*vec2(11.,6.)*zone(p,vec2(575.,279.),vec2(38.,23.));
        shift.y+=(-gaze.y*3.-gaze.x*2.)*zone(p,vec2(442.,247.),vec2(58.,19.));
        shift.y+=(-gaze.y*3.+gaze.x*2.)*zone(p,vec2(572.,227.),vec2(55.,18.));
        shift.y+=gaze.y*2.*zone(p,vec2(447.,283.),vec2(43.,12.));
        shift.y+=gaze.y*2.*zone(p,vec2(575.,264.),vec2(39.,12.));
        shift+=vec2(gaze.x*3.,-abs(gaze.x)*3.)*zone(p,vec2(585.,376.),vec2(36.,39.));
        shift+=vec2(gaze.x*3.,-abs(gaze.x)*2.)*zone(p,vec2(462.,401.),vec2(32.,35.));
        shift+=gaze*vec2(2.,1.)*zone(p,vec2(520.,343.),vec2(190.,160.));
        vec4 color=texture2D(portrait,(p-shift)/vec2(1024.,1536.));
        float edge=mix(.385,1.04,journey);
        color.a*=1.-smoothstep(edge-.045,edge,uv.y);
        gl_FragColor=vec4(color.rgb*color.a,color.a);
      }`;
    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source); gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Character shader unavailable');
      return result;
    }
    try {
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Character renderer unavailable');
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plate);
      const gaze = gl.getUniformLocation(program, 'gaze');
      const journey = gl.getUniformLocation(program, 'journey');
      gl.viewport(0, 0, canvas.width, canvas.height);
      canvas.dataset.renderer = 'webgl';
      return (x, y, p) => {
        gl.uniform2f(gaze, x, y); gl.uniform1f(journey, p);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
    } catch (_) { return fallback(plate); }
  }
  function fallback(plate) {
    // A fresh canvas is needed if the original already owns a WebGL context.
    const flat = document.createElement('canvas');
    flat.width = 1024; flat.height = 1536; flat.id = 'davidFlatCanvas';
    flat.dataset.renderer = '2d'; canvas.replaceWith(flat);
    const context = flat.getContext('2d');
    return (_x, _y, p) => {
      context.clearRect(0, 0, 1024, 1536); context.drawImage(plate, 0, 0);
      context.globalCompositeOperation = 'destination-in';
      const edge = mix(.385, 1.04, p) * 1536;
      const mask = context.createLinearGradient(0, edge - 70, 0, edge);
      mask.addColorStop(0, '#000'); mask.addColorStop(1, 'transparent');
      context.fillStyle = mask; context.fillRect(0, 0, 1024, 1536);
      context.globalCompositeOperation = 'source-over';
    };
  }
  window.addEventListener('pointermove', event => {
    if (!ready || motion.matches || !pointer.matches || event.pointerType === 'touch') return;
    const faceX = geometry.x + geometry.width * .50;
    const faceY = geometry.y + geometry.width * .283;
    targetX = clamp((event.clientX - faceX) / Math.max(150, geometry.width * .20), -1, 1);
    targetY = clamp((event.clientY - faceY) / Math.max(150, geometry.width * .20), -1, 1);
    schedule();
  }, { passive: true });
  function resetGaze() { targetX = targetY = 0; schedule(); }
  document.documentElement.addEventListener('pointerleave', resetGaze);
  window.addEventListener('blur', resetGaze);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', resetGaze); pointer.addEventListener('change', resetGaze);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  pet.addEventListener('blur', schedule); pet.addEventListener('click', schedule);
  document.getElementById('assistantClose')?.addEventListener('click', schedule);
  const image = new Image();
  image.onload = () => {
    try {
      const plate = composite(image); draw = makeRenderer(plate);
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault(); draw = fallback(plate); schedule();
      }, { once: true });
      ready = true; traveler.hidden = false; schedule();
    } catch (_) { showGuideFallback(); }
  };
  function showGuideFallback() { pet.hidden = false; pet.classList.add('guide-without-pet'); }
  image.onerror = showGuideFallback;
  image.src = 'assets/little-david-studio.png';
})();
