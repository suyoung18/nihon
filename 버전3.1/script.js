/**
 * 니혼톡 설날 대피소 스크립트 (애니메이션 스페셜 세션 적용)
 * 1. Admin/Security: 로컬 스토리지를 이용한 API Key 관리 및 데모 모드 지원
 * 2. Mock Engine: 애니메이션 명대사 운세 및 취향 저격 애니 추천 기능 적용
 * 3. UI Interactions: 애니메이션 테마 컬러(블루/퍼플) 및 아이콘 변경
 */

// --- 0. Utility Functions (Security) ---
// XSS 방지를 위한 HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- 1. Admin / Security Logic ---
let clickCount = 0;
let clickTimer;

function handleSecretClick() {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000); // Reset after 2 seconds

    if (clickCount === 5) {
        document.getElementById('admin-modal').classList.remove('hidden');
        document.getElementById('api-key-input').value = localStorage.getItem('gemini_api_key') || '';
        clickCount = 0;
    }
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        alert('API Key가 안전하게 로컬에 저장되었습니다.\n(주의: 공용 컴퓨터에서는 사용 후 반드시 삭제하세요.)');
    }
    closeAdminModal();
}

function clearApiKey() {
    localStorage.removeItem('gemini_api_key');
    alert('API Key가 삭제되었습니다. 안전한 데모 모드로 전환됩니다.');
    closeAdminModal();
}

function getApiKey() {
    return localStorage.getItem('gemini_api_key');
}

// --- 2. Mock Data Engine (Anime Special Fallback) ---
function mockGeminiResponse(prompt) {
    console.log("🔒 Using Secure Mock Data (Anime Special Mode)");
    
    // --- 2.1 Anime Omikuji Mock (애니 명대사 기반) ---
    if (prompt.includes("Omikuji") || prompt.includes("운세")) {
        const fortunes = [
            { fortune: "대길 (大吉)", message: "네가 죽는 건 나보다 한참 뒤의 일이야. (장송의 프리렌) - 오래오래 행복할 운세!", item: "마도서" },
            { fortune: "대길 (大吉)", message: "영역 전개! (주술회전) - 올해 당신의 재능이 완벽하게 꽃피는 해가 될 것입니다.", item: "검은 안대" },
            { fortune: "중길 (中吉)", message: "내가 누구라고 생각하는 거냐! (그렌라간) - 기합으로 모든 것을 이겨낼 수 있습니다.", item: "나선력" },
            { fortune: "중길 (中吉)", message: "봇치 타임... (봇치 더 록!) - 혼자만의 시간이 큰 성장을 가져다 줄 거예요.", item: "기타 피크" },
            { fortune: "소길 (小吉)", message: "거짓말은 특별한 사랑이다. (최애의 아이) - 예상치 못한 곳에서 좋은 인연을 만납니다.", item: "별 모양 펜라이트" },
            { fortune: "길 (吉)", message: "배구는 위를 보는 스포츠다! (하이큐) - 고개를 들고 긍정적으로 나아가세요.", item: "배구공 키링" }
        ];
        return JSON.stringify(fortunes[Math.floor(Math.random() * fortunes.length)]);
    }
    
    // --- 2.2 Anime Recommendation Mock (애니 추천 기반) ---
    if (prompt.includes("anime") || prompt.includes("추천") || prompt.includes("애니") || prompt.includes("taste")) {
        const userPrompt = prompt.toLowerCase();
        
        if (userPrompt.includes("판타지") || userPrompt.includes("액션") || userPrompt.includes("웅장")) {
            return "강력한 액션과 탄탄한 세계관! '장송의 프리렌'이나 '주술회전 2기'를 강력 추천합니다. ⚔️";
        }
        if (userPrompt.includes("힐링") || userPrompt.includes("일상") || userPrompt.includes("잔잔")) {
            return "마음이 편안해지는 '약사의 혼잣말'이나 '유루캠△'을 보며 힐링하는 건 어떨까요? 🍵";
        }
        if (userPrompt.includes("음악") || userPrompt.includes("밴드") || userPrompt.includes("코미디")) {
            return "방구석 아싸의 록스타 성장기! '봇치 더 록!'을 보시면 빵 터지실 거예요. 🎸";
        }
        if (userPrompt.includes("아이돌") || userPrompt.includes("드라마") || userPrompt.includes("반전")) {
            return "충격적인 전개와 화려한 연출! '최애의 아이'를 아직 안 보셨다면 당장 시작하세요. 🌟";
        }
        
        const generalTips = [
            "요즘 대세는 역시 '장송의 프리렌'이죠! 모험의 끝에서 시작되는 잔잔한 여운을 느껴보세요. 🧝‍♀️",
            "'약사의 혼잣말' 추천드려요! 독특한 미스터리 추리와 매력적인 캐릭터가 일품입니다. 🧪",
            "'나 혼자만 레벨업' 같은 통쾌한 사이다 먼치킨물은 어떠신가요? 🗡️"
        ];
        return generalTips[Math.floor(Math.random() * generalTips.length)];
    }
    
    // --- 2.3 Nagging Mock (화제 전환 답변) ---
    const responses = [
        "잔소리는 한 귀로 흘리고, 우리 같이 맛있는 라멘이나 먹으러 가요! 🍜",
        "스트레스 받지 마세요! 니혼톡에 오면 즐거운 일만 가득해요. ✨",
        "그런 말은 잊어버리고, 이번 분기 신작 애니 얘기나 할까요? 🎬",
        "귀를 막고 싶을 땐, 좋아하는 J-POP을 크게 들어보세요! 🎵",
        "결혼 질문 공격엔 '제 최애랑 결혼했어요'라고 받아쳐보세요 (농담) 😉",
        "취업 잔소리가 들릴 땐 조용히 일본어 단어장을 꺼내봅니다... 📚",
        "용돈 안 주실 거면 잔소리 금지! 라고 마음속으로만 외쳐봐요. 🤫",
        "지금 당장 비행기 표 예매창을 켜세요. 도피가 답입니다! ✈️"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// --- 3. Core API Logic (Hybrid) ---
async function callGemini(prompt) {
    const apiKey = getApiKey(); // Check LocalStorage

    // If No Key, use Mock Data
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 800)); // 자연스러운 딜레이
        return mockGeminiResponse(prompt);
    }
    
    // If Key exists, call Real API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            console.warn("API call failed (Quota exceeded or Invalid Key). Falling back to Mock.");
            return mockGeminiResponse(prompt);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return mockGeminiResponse(prompt); // Fallback to mock on error
    }
}

// --- 4. UI Interaction Logic ---

// 4.1 Nagging Blocker Interactions
function transformBubble(element, type) {
    const container = document.getElementById('fun-talk-area');
    if (container.querySelector('.text-center')) container.innerHTML = '';

    let content = '';
    if (type === 'travel') content = createFunCard('fa-ticket', 'red', '설날 지나고 오사카 어때요?', '저 유니버셜 스튜디오 익스프레스 티켓 꿀팁 알아요!');
    else if (type === 'anime') content = createFunCard('fa-film', 'blue', '이번 분기 신작 보셨어요?', '와, 작화 미쳤죠! 저랑 취향 완전 똑같으시네요 ㅋㅋ');

    container.appendChild(content);
    element.style.opacity = '0';
    setTimeout(() => element.style.display = 'none', 300);
}

async function transformCustomNagging() {
    const input = document.getElementById('custom-nagging-input');
    const nagText = input.value.trim();
    if (!nagText) return;

    const loader = document.getElementById('nagging-loader');
    const container = document.getElementById('fun-talk-area');
    const btn = input.nextElementSibling;
    
    if (container.querySelector('.text-center')) container.innerHTML = '';
    
    loader.classList.remove('hidden');
    input.disabled = true;
    if (btn) btn.disabled = true; 

    const prompt = `Role: Friend. Task: Change this nagging "${nagText}" into a fun invitation to talk about Japan (Anime/Travel). Language: Korean.`;
    const apiResult = await callGemini(prompt);
    
    const card = createFunCard('fa-wand-magic-sparkles', 'purple', '✨ AI가 제안하는 화제 전환!', apiResult);
    container.prepend(card);

    loader.classList.add('hidden');
    input.value = '';
    input.disabled = false;
    if (btn) btn.disabled = false;
}

function createFunCard(icon, color, title, desc) {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded-xl border border-stone-100 shadow-sm animate-fade-in-up w-full';
    div.innerHTML = `
        <div class="flex items-start">
            <div class="bg-${color}-100 text-${color}-600 p-2 rounded-lg mr-3 mt-1 shrink-0">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div>
                <strong class="text-stone-800 block mb-1">${title}</strong>
                <p class="text-stone-600 text-sm leading-snug">${desc}</p>
            </div>
        </div>`;
    return div;
}

// 4.2 Anime Omikuji Interaction
async function drawAiOmikuji() {
    const resultDiv = document.getElementById('omikuji-result');
    const btn = document.getElementById('draw-btn');
    
    // Animation state
    resultDiv.innerHTML = '<span class="text-blue-400 font-bold typing-loader">AI가 애니 명대사 찾는 중</span>';
    btn.disabled = true;
    
    // 프롬프트를 명확하게 하여 마크다운이나 잡담 없이 JSON만 출력하도록 강화
    const prompt = `Role: Anime Expert. Task: Generate JSON anime fortune (fortune, message, item) for 2026 using famous modern anime quotes (like Frieren, Jujutsu Kaisen, Oshi no Ko). Language: Korean. Output ONLY valid JSON, starting with { and ending with }. No markdown, no explanations.`;
    const apiResult = await callGemini(prompt);
    
    let data;
    try {
        // AI가 앞뒤에 잡담을 붙였을 경우를 대비하여 중괄호 { } 안의 내용만 정규식으로 추출
        const jsonMatch = apiResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("API 응답에서 JSON 형식을 찾을 수 없습니다.");
        }
    } catch (e) {
        console.error("JSON 파싱 에러:", e, "\nAPI 응답:", apiResult);
        // 파싱에 실패하더라도 계속 같은 '길'만 나오지 않도록 랜덤 예비(Fallback) 데이터 3종 제공
        const fallbackFortunes = [
            { fortune: "대길 (大吉)", message: "최애의 은총이 가득한 하루! 가챠 성공률 200%.", item: "최애 포토카드" },
            { fortune: "길 (吉)", message: "덕질하기 참 좋은 날입니다. 맛있는 간식과 함께 정주행하세요.", item: "애니메이션 굿즈" },
            { fortune: "중길 (中吉)", message: "새로운 띵작 애니를 발견하게 될 운세입니다.", item: "편의점 간식" }
        ];
        data = fallbackFortunes[Math.floor(Math.random() * fallbackFortunes.length)];
    }

    resultDiv.innerHTML = `
        <div class="animate-fade-in-up flex flex-col items-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">${data.fortune}</div>
            <div class="text-sm text-stone-600 mb-3 px-2">"${data.message}"</div>
            <div class="bg-stone-100 text-xs text-stone-500 px-3 py-1 rounded-full">🍀 행운템: ${data.item}</div>
        </div>`;
    
    btn.innerHTML = '<span>✨ 애니 명대사 운세 뽑기</span>';
    btn.disabled = false;
}

// 4.3 Anime Recommendation Match Interaction
async function addBucketWithAI() {
    const input = document.getElementById('bucket-input');
    const list = document.getElementById('bucket-list');
    const btn = document.getElementById('bucket-btn');
    
    const rawPlace = input.value.trim();
    if (!rawPlace) return;
    const safePlace = escapeHtml(rawPlace); 

    if (list.querySelector('.text-center')) list.innerHTML = '';
    
    const li = document.createElement('li');
    const id = 'bucket-' + Date.now();
    li.className = "bg-stone-50 p-3 rounded-lg border border-stone-200 animate-fade-in-up";
    
    li.innerHTML = `
        <div class="flex justify-between items-center mb-1">
            <span class="text-stone-800 font-bold">📺 ${safePlace}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-stone-300 hover:text-red-500 text-xs">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div id="${id}" class="text-xs text-purple-500 flex items-center gap-2">
            <i class="fa-solid fa-sparkles"></i> <span class="typing-loader">AI 추천 생성 중</span>
        </div>`;
    
    list.prepend(li);
    input.value = '';
    btn.disabled = true;

    // 애니메이션 추천을 요청하도록 프롬프트 변경
    const prompt = `Task: Give 1 short, trendy anime recommendation based on this user's taste: "${rawPlace}" (anime). Language: Korean.`;
    const aiTip = await callGemini(prompt);
    
    const tipElement = document.getElementById(id);
    if (tipElement) {
        tipElement.className = "text-xs text-stone-500 bg-purple-50 p-2 rounded block mt-1";
        tipElement.innerHTML = `<strong class="text-purple-600">✨ AI 추천:</strong> ${aiTip}`;
    }
    btn.disabled = false;
}

// 5. Chart Initialization
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('topicChart');
    if (ctx && window.Chart) {
        new Chart(ctx.getContext('2d'), { 
            type: 'doughnut', 
            data: { 
                labels: ['여행 정보 (35%)', '애니/덕질 (30%)', '일본어 회화 (20%)', '쇼핑/가챠 (15%)'], 
                datasets: [{ 
                    data: [35, 30, 20, 15], 
                    backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#78716c'], 
                    borderWidth: 0 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            padding: 20, 
                            usePointStyle: true, 
                            font: { family: "'Noto Sans KR', sans-serif" } 
                        } 
                    } 
                }, 
                cutout: '70%' 
            } 
        });
    }
});