/**
 * 간결한 mock-first 스크립트 (안전)
 */

// 안전한 텍스트 이스케이프
function escapeHtml(text) {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 런타임에서 잔존 키 제거(최선의 시도)
try {
  if (typeof localStorage !== 'undefined') {
    ['gemini_api_key', 'GEMINI_KEY', 'gemini_key'].forEach(k => localStorage.removeItem(k));
  }
  if (typeof sessionStorage !== 'undefined') {
    ['gemini_api_key', 'GEMINI_KEY', 'gemini_key'].forEach(k => sessionStorage.removeItem(k));
  }
} catch (e) { /* 무시 */ }

// 관리자 UI (클라이언트에 키 저장하지 않음)
function handleSecretClick() {
  window.__secretClicks = (window.__secretClicks || 0) + 1;
  setTimeout(() => { window.__secretClicks = 0; }, 2000);
  if (window.__secretClicks === 5) document.getElementById('admin-modal')?.classList.remove('hidden');
}
function closeAdminModal(){ document.getElementById('admin-modal')?.classList.add('hidden'); }
function saveApiKey(){ alert('클라이언트에 키 저장은 불가합니다. 서버 환경변수를 사용하세요.'); closeAdminModal(); }
function clearApiKey(){ alert('클라이언트 저장 키 없음 — 데모 모드 유지'); closeAdminModal(); }
function getApiKey(){ return null; }

// Mock 응답
function mockGeminiResponse(prompt) {
  const p = String(prompt || '').toLowerCase();
  if (p.includes('운세') || p.includes('omikuji')) {
    const picks = [
      { fortune: '대길', message: '새로운 인연이 시작됩니다.', item: '한정판' },
      { fortune: '중길', message: '작은 기회가 올 것입니다.', item: '동전' },
      { fortune: '소길', message: '차분히 준비하면 성과가 따릅니다.', item: '준비물' }
    ];
    return picks[Math.floor(Math.random() * picks.length)];
  }
  if (p.includes('도쿄') || p.includes('tokyo') || p.includes('오사카') || p.includes('osaka')) {
    const tips = ['골목 카페 추천', '교통패스 확인', '아침 방문 권장'];
    return { title: '여행 팁', text: tips[Math.floor(Math.random() * tips.length)] };
  }
  const fun = ['잔소리를 유머로 바꿔보세요.', '같이 라멘 먹으러 가요!', '애니 얘기하면 OK'];
  return { title: '니혼톡 제안', text: fun[Math.floor(Math.random() * fun.length)] };
}

async function callGemini(prompt) {
  const key = getApiKey();
  if (!key) { await new Promise(r => setTimeout(r, 300 + Math.random() * 400)); return mockGeminiResponse(prompt); }
  return mockGeminiResponse(prompt);
}

function createFunCard(icon, color, title, desc) {
  const div = document.createElement('div');
  div.className = 'fun-card p-3 mb-2 bg-white rounded shadow';
  const t = document.createElement('div'); t.className = 'font-bold mb-1'; t.textContent = title;
  const b = document.createElement('div'); b.className = 'text-sm'; b.textContent = desc;
  div.appendChild(t); div.appendChild(b);
  return div;
}

function transformBubble(el, type) {
  const container = document.getElementById('fun-talk-area');
  const hint = container.querySelector('.text-center'); if (hint) hint.remove();
  let card;
  if (type === 'travel') card = createFunCard('', 'red', '설날 지나고 오사카 어때요?', '유니버셜 꿀팁 공유');
  else card = createFunCard('', 'blue', '이번 분기 신작?', '작화가 대박이에요');
  container.appendChild(card);
  el.style.opacity = '0'; setTimeout(() => el.style.display = 'none', 300);
}

async function transformCustomNagging() {
  const input = document.getElementById('custom-nagging-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  const loader = document.getElementById('nagging-loader'); const container = document.getElementById('fun-talk-area');
  const btn = input.nextElementSibling;
  const hint = container.querySelector('.text-center'); if (hint) hint.remove();
  if (loader) loader.classList.remove('hidden'); input.disabled = true; if (btn) btn.disabled = true;
  const prompt = `Change this nagging: "${text}" to a fun Japan topic (Korean)`;
  const res = await callGemini(prompt);
  const textOut = (typeof res === 'string') ? res : (res.text || res.title || '');
  const card = createFunCard('', 'purple', 'AI 제안', textOut);
  container.prepend(card);
  if (loader) loader.classList.add('hidden'); input.value = ''; input.disabled = false; if (btn) btn.disabled = false;
}

async function drawAiOmikuji() {
  const resultDiv = document.getElementById('omikuji-result'); const btn = document.getElementById('draw-btn');
  if (resultDiv) { while (resultDiv.firstChild) resultDiv.removeChild(resultDiv.firstChild); const sp = document.createElement('div'); sp.textContent = 'AI가 운세 읽는 중'; resultDiv.appendChild(sp); }
  if (btn) btn.disabled = true;
  const apiResult = await callGemini('운세');
  const data = (typeof apiResult === 'object') ? apiResult : { fortune: '길', message: String(apiResult), item: '' };
  if (resultDiv) { while (resultDiv.firstChild) resultDiv.removeChild(resultDiv.firstChild); const fw = document.createElement('div'); const f = document.createElement('div'); f.className = 'text-2xl font-bold'; f.textContent = data.fortune || ''; const m = document.createElement('div'); m.className = 'text-sm'; m.textContent = data.message || ''; const it = document.createElement('div'); it.className = 'text-xs'; it.textContent = '🍀 행운템: ' + (data.item || ''); fw.appendChild(f); fw.appendChild(m); fw.appendChild(it); resultDiv.appendChild(fw); }
  if (btn) { btn.textContent = '🔄 다시 뽑기'; btn.disabled = false; }
}

async function addBucketWithAI() {
  const input = document.getElementById('bucket-input'); const list = document.getElementById('bucket-list'); const btn = document.getElementById('bucket-btn');
  if (!input || !list) return; const raw = input.value.trim(); if (!raw) return; const safe = escapeHtml(raw);
  const hint = list.querySelector('.text-center'); if (hint) hint.remove();
  const li = document.createElement('li'); li.className = 'p-2 border-b'; const top = document.createElement('div'); top.className = 'flex justify-between items-center mb-1'; const span = document.createElement('span'); span.className = 'font-bold'; span.textContent = '✈️ ' + safe; const del = document.createElement('button'); del.type = 'button'; del.className = 'text-xs'; del.addEventListener('click', () => li.remove()); del.textContent = '삭제'; top.appendChild(span); top.appendChild(del); const tipWrap = document.createElement('div'); tipWrap.className = 'text-xs text-stone-500'; tipWrap.textContent = 'AI 팁 생성 중'; li.appendChild(top); li.appendChild(tipWrap); list.prepend(li); input.value = ''; if (btn) btn.disabled = true; const prompt = `Give 1 short travel tip for "${raw}"`; const aiTip = await callGemini(prompt); tipWrap.textContent = (typeof aiTip === 'string' ? aiTip : (aiTip.text || aiTip.title || '아이디어 없음')); if (btn) btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const canvas = document.getElementById('topicChart');
    if (canvas && window.Chart) {
      new Chart(canvas.getContext('2d'), { type: 'doughnut', data: { labels: ['여행', '애니', '회화', '쇼핑'], datasets: [{ data: [35, 30, 20, 15], backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#78716c'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%' } });
    }
  } catch (e) { console.warn('Chart init skipped', e); }
});
