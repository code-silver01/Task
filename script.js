// ========== helpers ==========
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// smooth scrolling for nav + scroll buttons
document.querySelectorAll('.nav-icon, .footer-link, .scroll-btn').forEach(el=>{
  el.addEventListener('click', (e)=>{
    const href = el.getAttribute('href') || el.dataset.target;
    if(!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if(target){
      const top = target.getBoundingClientRect().top + window.scrollY - 60; // account for nav
      window.scrollTo({top, behavior:'smooth'});
    }
  });
});

// --------- SEARCH (filters characters & gallery labels) ---------
const searchInput = $('#searchInput') || $('#searchInput') ; // fallback undefined safe
const input = $('#searchInput') || $('#searchInput'); // some pages may not have id; safe guard
// In this markup the search is nav-search input; we used id="searchInput" in index.html
const search = $('#searchInput') || document.querySelector('.nav-search input') || null;
if(search){
  search.addEventListener('input', ()=> {
    const q = search.value.trim().toLowerCase();
    // characters
    $$('.character-card').forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
    // gallery labels
    $$('.polaroid').forEach(p => {
      const label = (p.querySelector('.polaroid-label')?.textContent || '').toLowerCase();
      p.style.display = (!q || label.includes(q)) ? '' : 'none';
    });
  });
}

// ========== CHARACTER PREVIEW (on hover create a video preview) ==========
function createPreviewVideo(src){
  const wrap = document.createElement('div');
  wrap.className = 'card-preview';
  const vid = document.createElement('video');
  vid.src = src;
  vid.muted = true;
  vid.playsInline = true;
  vid.autoplay = true;
  vid.loop = true;
  vid.style.width = '100%';
  vid.style.height = '100%';
  vid.style.objectFit = 'cover';
  wrap.appendChild(vid);
  return {wrap, vid};
}

$$('.character-card').forEach(card => {
  let preview = null;
  card.addEventListener('mouseenter', () => {
    const src = card.dataset.video;
    if(!src) return;
    if(preview) return;
    const {wrap, vid} = createPreviewVideo(src);
    card.appendChild(wrap);
    preview = {wrap, vid};
    vid.play().catch(()=>{});
  });
  card.addEventListener('mouseleave', () => {
    if(preview){
      preview.vid.pause();
      preview.wrap.remove();
      preview = null;
    }
  });
  // clicking card opens full modal
  card.addEventListener('click', ()=> openVideo(card.dataset.video));
  // keyboard support
  card.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(card.dataset.video); }
  });
});

// ========== SPORTS ICONS (open modal) ==========
const modal = $('#videoModal');
const modalVideo = $('#modalVideo');
const closeBtn = $('#closeBtn');

function openVideo(src){
  if(!src) return;
  modalVideo.querySelector('source').src = src;
  modalVideo.load();
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
  modalVideo.play().catch(()=>{});
}
function closeModal(){
  modalVideo.pause();
  try{ modalVideo.currentTime = 0 }catch(e){}
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
  modalVideo.querySelector('source').src = '';
}

$$('.sport-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> openVideo(btn.dataset.video));
});
$$('.sport-btn').forEach(btn=>{
  btn.addEventListener('keydown', (e)=> { if(e.key==='Enter'||e.key===' ') openVideo(btn.dataset.video); });
});

if(closeBtn) closeBtn.addEventListener('click', closeModal);
if(modal) modal.addEventListener('click', e=> { if(e.target === modal) closeModal(); });

// ========== GALLERY polaroid click opens modal ==========
$$('.polaroid').forEach(p=>{
  p.addEventListener('click', ()=> openVideo(p.dataset.video));
  p.addEventListener('keydown', (e)=> { if(e.key==='Enter'||e.key===' ') openVideo(p.dataset.video); });
});

// ========== NAV ICON TOOLTIP keyboard focus (accessibility) ==========
$$('.nav-icon').forEach(a=>{
  a.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){ a.click(); }
  });
});

// ========== close modal with Escape ==========
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && modal.style.display === 'flex') closeModal();
});
const quizData = [
  {
    question: "Your favorite activity in college?",
    options: [
      { text: "Sports & Competition", character: "Derek" },
      { text: "Chilling with friends", character: "Anni" },
      { text: "Making people laugh", character: "Bevda" },
      { text: "Study & Discipline", character: "Mummy" },
      { text: "Witty sarcasm", character: "Acid" }
    ]
  },
  {
    question: "Pick a snack:",
    options: [
      { text: "Protein bar", character: "Derek" },
      { text: "Chai & biscuits", character: "Anni" },
      { text: "Beer & peanuts", character: "Bevda" },
      { text: "Salad & juice", character: "Mummy" },
      { text: "Chocolate & coffee", character: "Acid" }
    ]
  },
  {
    question: "Your approach to challenges?",
    options: [
      { text: "Go all in!", character: "Derek" },
      { text: "Stay calm & help others", character: "Anni" },
      { text: "Make jokes, keep morale high", character: "Bevda" },
      { text: "Plan everything", character: "Mummy" },
      { text: "Think smart & prank a bit", character: "Acid" }
    ]
  }
];

const characterImages = {
  "Derek": "images/derek.png",
  "Anni": "images/anni.png",
  "Bevda": "images/bevda.png",
  "Mummy": "images/mummy.png",
  "Acid": "images/acid.png"
};

let currentQ = 0;
let scores = { "Derek":0, "Anni":0, "Bevda":0, "Mummy":0, "Acid":0 };

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('quizResult');

function loadQuestion() {
  const q = quizData[currentQ];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.addEventListener('click', () => selectOption(opt.character));
    optionsEl.appendChild(btn);
  });
  nextBtn.style.display = 'none';
}

function selectOption(character) {
  scores[character]++;
  nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
  currentQ++;
  if(currentQ < quizData.length){
    loadQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  let maxScore = 0;
  let character = '';
  for (const [key, value] of Object.entries(scores)) {
    if(value > maxScore){
      maxScore = value;
      character = key;
    }
  }

  questionEl.style.display = 'none';
  optionsEl.style.display = 'none';
  nextBtn.style.display = 'none';
  resultEl.style.display = 'block';

  // Create a result card with image
  resultEl.innerHTML = `
    <div class="character-result-card">
      <img src="${characterImages[character]}" alt="${character}">
      <h3>You Are Most likely: ${character}!</h3>
    </div>
  `;
}
loadQuestion();