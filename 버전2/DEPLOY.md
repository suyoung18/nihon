# 니혼톡 배포 가이드

이 문서는 로컬 테스트 및 실제 배포 방법을 설명합니다.

## 1. 로컬 테스트 (Windows PowerShell)

### 1.1 Python 내장 서버로 실행 (권장)

현재 폴더(`버전2`)에서:

```powershell
python -m http.server 8000
```

또는 명시적 포트:
```powershell
python -m http.server --bind 127.0.0.1 8000
```

**브라우저에서 열기:**
- `http://localhost:8000/nihontalkEvent.html`

**서버 중지:** Ctrl+C

### 1.2 PowerShell 기본 서버 (Python 없을 때)

```powershell
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:8000/")
$listener.Start()
Write-Host "Server started at http://localhost:8000"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.PathAndQuery.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path) -or $path -eq '/') { $path = "nihontalkEvent.html" }
    $filePath = Join-Path (Get-Location) $path
    if (Test-Path $filePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $content.Length
        $context.Response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.Close()
}
```

## 2. 배포 전 체크리스트

### 보안 확인
- [ ] 브라우저 localStorage에 API 키가 남아있지 않음 (개발자 도구 → 애플리케이션 → 저장소 → localStorage 확인)
- [ ] 콘솔에 보안 경고 없음 (F12 → Console 탭)
- [ ] SRI 해시가 있는지 확인: `<script ... integrity="sha384-..."`

### 기능 테스트
- [ ] 잔소리 버블 클릭 → 결과 표시 (데모)
- [ ] 직접 잔소리 입력 후 변환 (AI 제안 표시)
- [ ] AI 운세 뽑기 (결과 표시)
- [ ] 버킷리스트 추가 및 삭제 (팁 생성)
- [ ] Footer의 'Copyright' 5번 클릭 → 관리자 모달 열림

## 3. Netlify 배포 (실제 환경)

### 3.1 사전 준비
1. Netlify 계정 가입: https://netlify.com
2. Git 리포지토리 준비 (또는 Drag & Drop)

### 3.2 배포 방법 A: Drag & Drop (가장 빠름)
1. Netlify 대시보드에서 `Deploy to Netlify` 섹션으로 이동
2. 폴더(`버전2`)를 드래그 앤 드롭

### 3.2 배포 방법 B: Git 연결
1. GitHub에 `nihontalk이벤트/버전2` 폴더 푸시
2. Netlify 대시보드 → "New site from Git"
3. 리포지토리 선택 및 배포 설정:
   - Build command: `(empty)`
   - Publish directory: `nihontalk이벤트/버전2` 또는 `.`

### 3.3 환경 변수 설정 (선택, 실제 API 사용 시)
1. Netlify 대시보드 → Site settings → Build & deploy → Environment
2. 변수 추가:
   ```
   KEY: GEMINI_KEY
   VALUE: (your-api-key)
   ```
   **주의:** 클라이언트 페이지에 키를 직접 노출하지 마세요. Netlify Functions로 프록시하세요.

### 3.4 Netlify Functions 사용 (선택, 실제 AI 연결)
`netlify/functions/` 폴더 예제를 참고하여 프록시 함수 구현:
```javascript
// netlify/functions/gemini-proxy.js
exports.handler = async (event) => {
  const key = process.env.GEMINI_KEY;
  const prompt = JSON.parse(event.body).prompt;
  // Gemini API 호출...
  return { statusCode: 200, body: JSON.stringify(result) };
};
```

클라이언트에서 호출:
```javascript
const res = await fetch('/.netlify/functions/gemini-proxy', {
  method: 'POST',
  body: JSON.stringify({ prompt })
});
```

## 4. 파일 구조

배포에 필요한 최소 파일:
```
버전2/
├── nihontalkEvent.html      (메인 페이지)
├── script.js                (기능 로직)
├── styles.css               (스타일)
├── netlify.toml             (선택, Netlify 설정)
└── netlify/functions/       (선택, 서버 함수)
```

## 5. 보안 및 성능 최적화

### SRI(Subresource Integrity) 확인
현재 포함된 CDN:
- Tailwind CSS: sha384-igm5BeiBt36UU4gqwWS7imYmelpTsZlQ45FZf+XBn9MuJbn4nQr7yx1yFydocC/K
- Chart.js: sha384-jb8JQMbMoBUzgWatfe6COACi2ljcDdZQ2OxczGA3bGNeWe+6DChMTBJemed7ZnvJ
- FontAwesome: sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0

### CSP(Content Security Policy) 추가 (선택)
Netlify에서 헤더 설정:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src https://fonts.gstatic.com
```

## 6. 배포 후 검증

1. 배포 URL에서 페이지 로드 확인
2. 개발자 도구 → Network 탭에서:
   - `nihontalkEvent.html` → 200
   - `script.js` → 200
   - `styles.css` → 200
   - CDN 리소스 (Tailwind, Chart.js, FontAwesome) → 200
3. Console에 에러 없음 확인
4. 기능 테스트 (위의 "기능 테스트" 섹션 참고)

## 7. 문제 해결

### 페이지가 로드되지 않음
- 브라우저 콘솔(F12)에서 에러 메시지 확인
- 네트워크 탭에서 파일 로드 상태 확인
- 강력 새로고침(Ctrl+Shift+R) 시도

### 스타일이 적용되지 않음
- Tailwind CDN이 로드되는지 확인
- `styles.css` 파일 로드 확인
- 브라우저 캐시 초기화

### 기능이 작동하지 않음
- 콘솔의 JavaScript 에러 확인
- `script.js` 로드 확인
- 버튼의 `onclick` 속성 확인

## 8. 추가 자료

- Netlify 문서: https://docs.netlify.com
- 보안 배포: https://owasp.org/www-community/attacks/csrf
- SRI 검증: https://www.srihash.org
