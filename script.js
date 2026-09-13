document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion && finePointer) {
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  const orb = document.getElementById('orbShell');
  const core = document.getElementById('orbCore');

  if (orb && core) {
    window.addEventListener('pointermove', (event) => {
      const rect = orb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth * 0.45)));
      const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight * 0.45)));

      orb.style.transform = `rotateX(${-ny * 7}deg) rotateY(${nx * 9}deg)`;
      core.style.transform = `translate(calc(-50% + ${nx * 28}px), calc(-50% + ${ny * 22}px))`;
    }, { passive: true });
  }

  document.querySelectorAll('.tilt-card').forEach((card) => {
    const light = card.querySelector('.card-light');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;

      card.style.transform = `rotateX(${-py * 6}deg) rotateY(${px * 7}deg) translateY(-2px)`;
      if (light) {
        light.style.left = `${x}px`;
        light.style.top = `${y}px`;
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const skillDescriptions = {
  Systems: 'Connecting engineering judgment, repeatable rules, data, and tools into one working system.',
  Estimating: 'Quantity takeoffs, drawing interpretation, scope review, pricing logic, and bid support.',
  Engineering: 'Civil and construction foundations supported by CAD, modeling, coordination, and technical analysis tools.',
  Automation: 'Excel, AI-assisted workflows, Python, QA logic, and reusable procedures that reduce repetitive work.',
  Visualization: 'Technical drawings, floor plans, 3D modeling, and visual communication that make complex ideas easier to understand.'
};

const constellation = document.getElementById('constellation');
const skillReadout = document.getElementById('skillReadout');
const nodes = document.querySelectorAll('.skill-node');

if (constellation) {
  constellation.addEventListener('pointermove', (event) => {
    const rect = constellation.getBoundingClientRect();
    constellation.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    constellation.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

nodes.forEach((node) => {
  const activate = () => {
    nodes.forEach((item) => item.classList.remove('active'));
    node.classList.add('active');
    if (skillReadout) skillReadout.textContent = skillDescriptions[node.dataset.skill] || node.dataset.skill;
  };

  node.addEventListener('pointerenter', activate);
  node.addEventListener('focus', activate);
});
