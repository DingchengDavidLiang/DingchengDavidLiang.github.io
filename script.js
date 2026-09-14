const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion && finePointer) {
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', (event) => {
    if (glow) {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }
  }, { passive: true });

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
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const assistantFab = document.getElementById('assistantFab');
const assistantPanel = document.getElementById('assistantPanel');
const assistantClose = document.getElementById('assistantClose');
const assistantMessages = document.getElementById('assistantMessages');
const assistantQuick = document.getElementById('assistantQuick');
const assistantForm = document.getElementById('assistantForm');
const assistantInput = document.getElementById('assistantInput');
const assistantAvatar = document.getElementById('assistantAvatar');
const pupils = Array.from(document.querySelectorAll('.pupil'));

const answers = {
  who: "David is a creative problem solver with a civil-engineering background and hands-on experience across estimating, automation, community projects, and practical AI ideas. He likes understanding how something works, finding where it can work better, and turning that into something useful.",
  leonardo: "Leonardo is David’s ongoing experiment in AI-assisted construction estimating. The idea is to capture repeatable rules, calculations, QA checks, and builder-specific knowledge so estimating becomes easier to learn, more consistent, and eventually more intelligent.",
  openmind: "OpenMind is David’s community and creative project. It explores how music, events, partnerships, branding, and atmosphere can help people find connection and actually want to come back.",
  experience: "David’s experience includes construction estimating, civil-engineering and design work, field and project coordination, solar outreach, workflow automation, and community-led projects. The common thread is practical problem solving in real-world settings.",
  next: "He wants to work on more meaningful problems with room to build, learn, and improve things — especially where engineering thinking, creativity, technology, and people overlap.",
  approach: "David usually starts by getting close to the real problem, questions what creates friction, builds something practical enough to test, then keeps refining it based on what actually happens.",
  music: "Music is part of David’s creative side rather than a separate identity. It shows up most clearly in OpenMind and in the way he thinks about community, experience, rhythm, and making things feel human.",
  default: "I can help with David’s projects, experience, problem-solving approach, and what he wants to build next. Try asking about Leonardo, OpenMind, his background, or how he approaches problems."
};

function openAssistant() {
  if (!assistantPanel || !assistantFab) return;
  assistantPanel.hidden = false;
  assistantFab.setAttribute('aria-expanded', 'true');
  setTimeout(() => assistantInput?.focus(), 80);
}

function closeAssistant() {
  if (!assistantPanel || !assistantFab) return;
  assistantPanel.hidden = true;
  assistantFab.setAttribute('aria-expanded', 'false');
}

function addMessage(text, sender = 'assistant') {
  if (!assistantMessages) return;
  const node = document.createElement('div');
  node.className = `message ${sender}`;
  node.textContent = text;
  assistantMessages.appendChild(node);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function getAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('leonardo')) return answers.leonardo;
  if (q.includes('openmind')) return answers.openmind;
  if (q.includes('experience') || q.includes('background') || q.includes('resume') || q.includes('worked')) return answers.experience;
  if (q.includes('next') || q.includes('future') || q.includes('looking for')) return answers.next;
  if (q.includes('approach') || q.includes('problem') || q.includes('think') || q.includes('solve')) return answers.approach;
  if (q.includes('music')) return answers.music;
  if (q.includes('who') || q.includes('david')) return answers.who;
  return answers.default;
}

if (assistantFab) {
  assistantFab.addEventListener('click', () => {
    if (!assistantPanel) return;
    if (assistantPanel.hidden) openAssistant();
    else closeAssistant();
  });
}

if (assistantClose) {
  assistantClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closeAssistant();
  });
}

if (assistantQuick) {
  assistantQuick.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-question]');
    if (!button) return;
    const question = button.dataset.question;
    openAssistant();
    addMessage(question, 'user');
    window.setTimeout(() => addMessage(getAnswer(question), 'assistant'), 180);
  });
}

if (assistantForm) {
  assistantForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = assistantInput?.value.trim();
    if (!question) return;
    openAssistant();
    addMessage(question, 'user');
    assistantInput.value = '';
    window.setTimeout(() => addMessage(getAnswer(question), 'assistant'), 220);
  });
}

if (!reduceMotion && finePointer && assistantAvatar && pupils.length) {
  window.addEventListener('pointermove', (event) => {
    const rect = assistantAvatar.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (event.clientX - cx) / Math.max(rect.width, 1);
    const dy = (event.clientY - cy) / Math.max(rect.height, 1);
    const maxX = 3.2;
    const maxY = 2.6;
    const tx = Math.max(-maxX, Math.min(maxX, dx * maxX));
    const ty = Math.max(-maxY, Math.min(maxY, dy * maxY));
    pupils.forEach((pupil) => {
      pupil.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  }, { passive: true });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && assistantPanel && !assistantPanel.hidden) closeAssistant();
});
