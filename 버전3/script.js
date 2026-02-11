/**
 * 니혼톡 설날 대피소 스크립트
 * 주요 기능:
 * 1. Admin/Security: 로컬 스토리지를 이용한 API Key 관리 및 데모 모드 지원
 * 2. Mock Engine: API Key가 없을 때 실제처럼 보이는 가짜 데이터 생성 (확장 버전)
 * 3. UI Interactions: 차트 렌더링, 오미쿠지, 버킷리스트 등
 */

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
        alert('API Key가 저장되었습니다. 이제 실제 AI가 작동합니다.');
    }
    closeAdminModal();
}

function clearApiKey() {
    localStorage.removeItem('gemini_api_key');
    alert('API Key가 삭제되었습니다. 데모 모드로 전환됩니다.');
    closeAdminModal();
}

function getApiKey() {
    return localStorage.getItem('gemini_api_key');
}

// --- 2. Mock Data Engine (Enhanced Fallback) ---
function mockGeminiResponse(prompt) {
    console.log("🔒 Using Secure Mock Data (Smart Mode)");
    
    // --- 2.1 Omikuji Mock (운세 데이터 확장: 12종) ---
    if (prompt.includes("Omikuji")) {
        const fortunes = [
            // 대길 시리즈
            { fortune: "대길 (大吉)", message: "2026년, 당신의 덕질 운이 폭발합니다! 원하는 굿즈를 모두 얻을 운세.", item: "한정판 피규어" },
            { fortune: "대길 (大吉)", message: "일본 여행 최저가 항공권을 발견하게 됩니다. 지금이 기회!", item: "여권 케이스" },
            { fortune: "대길 (大吉)", message: "JLPT 합격의 기운이 강하게 들어옵니다. 찍은 것도 맞을 운세!", item: "단어장" },
            
            // 중길 시리즈
            { fortune: "중길 (中吉)", message: "여행지에서 뜻밖의 맛집을 발견할 운세! 웨이팅도 없을 거예요.", item: "동전 파스" },
            { fortune: "중길 (中吉)", message: "새로운 인연이 찾아옵니다. 니혼톡 모임에 꼭 나가보세요.", item: "새 옷" },
            { fortune: "중길 (中吉)", message: "잃어버렸던 에어팟 한 짝을 찾거나 소소한 용돈이 생깁니다.", item: "500엔 동전" },
            
            // 소길 시리즈
            { fortune: "소길 (小吉)", message: "꾸준히 일본어를 공부하면 원어민 친구가 생길 거예요.", item: "편의점 푸딩" },
            { fortune: "소길 (小吉)", message: "가챠샵에서 중복 없이 원하는 게 나올 확률 60%!", item: "가챠 코인" },
            { fortune: "소길 (小吉)", message: "넷플릭스 인생 드라마를 만나게 되어 밤을 새우게 됩니다.", item: "블루라이트 차단 안경" },
            
            // 길 시리즈
            { fortune: "길 (吉)", message: "소소한 행복이 가득. 편의점 신상 간식 당첨 운!", item: "말차 라떼" },
            { fortune: "길 (吉)", message: "오늘 하루는 근심 걱정 없이 푹 쉴 수 있습니다.", item: "수면 안대" },
            { fortune: "길 (吉)", message: "오래된 친구에게서 반가운 연락이 올 거예요.", item: "스마트폰" }
        ];
        return JSON.stringify(fortunes[Math.floor(Math.random() * fortunes.length)]);
    }
    
    // --- 2.2 Bucket List Mock (스마트 키워드 인식: 15종 이상) ---
    if (prompt.includes("bucket list")) {
        // 프롬프트에서 '여행 팁'을 요청한 도시명을 추출 (단순 포함 여부 확인)
        const userPrompt = prompt.toLowerCase();
        
        // 지역별 맞춤 팁
        if (userPrompt.includes("도쿄") || userPrompt.includes("tokyo")) {
            const tokyoTips = [
                "시부야 스카이는 꼭 해질녘에 예약하세요. 야경이 정말 미쳤습니다! 🌇",
                "아사쿠사 센소지는 새벽 6시에 가면 사람 없이 인생샷 가능해요. 📸",
                "도쿄 지하철 패스(72시간)는 필수! 교통비를 절반으로 줄여줍니다. 🚇"
            ];
            return tokyoTips[Math.floor(Math.random() * tokyoTips.length)];
        }
        
        if (userPrompt.includes("오사카") || userPrompt.includes("osaka")) {
            const osakaTips = [
                "유니버셜 스튜디오 닌텐도 월드는 오픈런 필수! 확약권 꼭 챙기세요. 🍄",
                "도톤보리 글리코상 앞보다는 다리 밑 리버크루즈가 더 운치 있어요. 🚤",
                "오사카 주유패스로 무료입장 가능한 관광지만 다녀도 뽕 뽑습니다! 🎫"
            ];
            return osakaTips[Math.floor(Math.random() * osakaTips.length)];
        }
        
        if (userPrompt.includes("교토") || userPrompt.includes("kyoto")) {
            const kyotoTips = [
                "아라시야마 대나무 숲은 아침 8시 전에 가야 고요함을 느낄 수 있어요. 🎋",
                "기요미즈데라(청수사) 올라가는 길에 있는 산넨자카에서 넘어지면 안 돼요! (전설) 😉",
                "교토 버스 1일권보다는 이제 지하철+버스 패스를 추천합니다. 🚌"
            ];
            return kyotoTips[Math.floor(Math.random() * kyotoTips.length)];
        }
        
        if (userPrompt.includes("훗카이도") || userPrompt.includes("삿포로") || userPrompt.includes("sapporo")) {
            return "삿포로 맥주 박물관에서 갓 만든 생맥주 시음은 선택이 아니라 필수입니다! 🍺";
        }

        if (userPrompt.includes("후쿠오카") || userPrompt.includes("fukuoka")) {
            return "후쿠오카 함바그는 '키와미야'가 진리지만, 웨이팅 1시간은 각오하세요! 🥩";
        }

        // 일반 팁 (특정 도시가 없거나 못 찾았을 때)
        const generalTips = [
            "현지인만 아는 골목 맛집을 찾으려면 구글맵 평점 4.0 이상만 보세요! 🍜",
            "돈키호테 쇼핑은 아침 일찍 가야 계산 줄을 안 섭니다. 🛍️",
            "편의점 오뎅은 겨울 일본 여행의 낭만이자 최고의 야식입니다. 🍢",
            "일본 자판기 콘스프는 캔 밑바닥을 쳐서 알갱이까지 다 드세요! 🌽",
            "숙소 근처 목욕탕(센토)을 찾아보세요. 피로가 싹 풀립니다. ♨️",
            "택시비가 비싸니 막차 시간은 꼭 미리 확인하세요! 🚕"
        ];
        return generalTips[Math.floor(Math.random() * generalTips.length)];
    }
    
    // --- 2.3 Nagging Mock (화제 전환 답변 확장: 10종) ---
    const responses = [
        "잔소리는 한 귀로 흘리고, 우리 같이 맛있는 라멘이나 먹으러 가요! 🍜",
        "스트레스 받지 마세요! 니혼톡에 오면 즐거운 일만 가득해요. ✨",
        "그런 말은 잊어버리고, 이번 분기 신작 애니 얘기나 할까요? 🎬",
        "귀를 막고 싶을 땐, 좋아하는 J-POP을 크게 들어보세요! 🎵",
        "결혼 질문 공격엔 '제 최애랑 결혼했어요'라고 받아쳐보세요 (농담) 😉",
        "취업 잔소리가 들릴 땐 조용히 일본어 단어장을 꺼내봅니다... 📚",
        "용돈 안 주실 거면 잔소리 금지! 라고 마음속으로만 외쳐봐요. 🤫",
        "지금 당장 비행기 표 예매창을 켜세요. 도피가 답입니다! ✈️",
        "그 스트레스, 매운 카레 우동으로 날려버리는 건 어때요? 🍛",
        "니혼톡 멤버들이 당신의 든든한 아군이 되어드릴게요! 🛡️"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// --- 3. Core API Logic (Hybrid) ---
async function callGemini(prompt) {
    const apiKey = getApiKey(); // Check LocalStorage

    // If No Key, use Mock Data (Safe Default with Fake Delay)
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 800)); // 0.8s fake delay for realism
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
        
        if (!response.ok) throw new Error("API call failed");
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        alert("API 호출 실패! 키를 확인해주세요. (데모 데이터로 전환합니다)");
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
    
    if (container.querySelector('.text-center')) container.innerHTML = '';
    loader.classList.remove('hidden');
    input.disabled = true;

    const prompt = `Role: Friend. Task: Change this nagging "${nagText}" into a fun invitation to talk about Japan (Anime/Travel). Language: Korean.`;
    const apiResult = await callGemini(prompt);
    
    const card = createFunCard('fa-wand-magic-sparkles', 'purple', '✨ AI가 제안하는 화제 전환!', apiResult);
    container.prepend(card);

    loader.classList.add('hidden');
    input.value = '';
    input.disabled = false;
}

function createFunCard(icon, color, title, desc) {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded-xl border border-stone-100 shadow-sm animate-fade-in-up w-full';
    div.innerHTML = `<div class="flex items-start"><div class="bg-${color}-100 text-${color}-600 p-2 rounded-lg mr-3 mt-1 shrink-0"><i class="fa-solid ${icon}"></i></div><div><strong class="text-stone-800 block mb-1">${title}</strong><p class="text-stone-600 text-sm leading-snug">"${desc}"</p></div></div>`;
    return div;
}

// 4.2 Omikuji Interaction
async function drawAiOmikuji() {
    const resultDiv = document.getElementById('omikuji-result');
    const btn = document.getElementById('draw-btn');
    
    // Animation state
    resultDiv.innerHTML = '<span class="text-red-400 font-bold typing-loader">AI가 운세 읽는 중</span>';
    btn.disabled = true;
    
    const prompt = `Role: Omikuji. Task: Generate JSON fortune (fortune, message, item) for 2026. Language: Korean. JSON Format only.`;
    const apiResult = await callGemini(prompt);
    
    let data;
    try {
        const jsonStr = apiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(jsonStr);
    } catch (e) {
        // Fallback in case real API returns malformed JSON
        data = { fortune: "길 (吉)", message: "행운이 깃든 하루입니다.", item: "녹차" };
    }

    resultDiv.innerHTML = `<div class="animate-fade-in-up flex flex-col items-center"><div class="text-3xl font-bold text-red-600 mb-2">${data.fortune}</div><div class="text-sm text-stone-600 mb-3 px-2">"${data.message}"</div><div class="bg-stone-100 text-xs text-stone-500 px-3 py-1 rounded-full">🍀 행운템: ${data.item}</div></div>`;
    btn.innerHTML = '<span>🔄 다시 뽑기</span>';
    btn.disabled = false;
}

// 4.3 Bucket List Interaction
async function addBucketWithAI() {
    const input = document.getElementById('bucket-input');
    const list = document.getElementById('bucket-list');
    const place = input.value.trim();
    if (!place) return;

    if (list.querySelector('.text-center')) list.innerHTML = '';
    const li = document.createElement('li');
    const id = 'bucket-' + Date.now();
    li.className = "bg-stone-50 p-3 rounded-lg border border-stone-200 animate-fade-in-up";
    li.innerHTML = `<div class="flex justify-between items-center mb-1"><span class="text-stone-800 font-bold">✈️ ${place}</span><button onclick="this.parentElement.parentElement.remove()" class="text-stone-300 hover:text-red-500 text-xs"><i class="fa-solid fa-xmark"></i></button></div><div id="${id}" class="text-xs text-blue-500 flex items-center gap-2"><i class="fa-solid fa-sparkles"></i> <span class="typing-loader">AI 팁 생성 중</span></div>`;
    list.prepend(li);
    input.value = '';

    // Pass the place to the prompt so Mock Logic can use it
    const prompt = `Task: Give 1 short travel tip for "${place}". Language: Korean.`;
    const aiTip = await callGemini(prompt);
    const tipElement = document.getElementById(id);
    if (tipElement) {
        tipElement.className = "text-xs text-stone-500 bg-blue-50 p-2 rounded block mt-1";
        tipElement.innerHTML = `<strong class="text-blue-600">✨ AI Tip:</strong> ${aiTip}`;
    }
}

// 5. Chart Initialization
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('topicChart').getContext('2d');
    new Chart(ctx, { 
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
});