# 배포 점검 스크립트 - 보안 및 파일 무결성 확인

```bash
#!/bin/bash
# 또는 PowerShell로 실행
```

## 체크리스트

### 1. 필수 파일 확인
```powershell
$requiredFiles = @(
    "nihontalkEvent.html",
    "script.js",
    "styles.css"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file 존재" -ForegroundColor Green
    } else {
        Write-Host "✗ $file 없음" -ForegroundColor Red
    }
}
```

### 2. HTML 보안 검사
- [ ] `<script>` 태그에 `integrity` 속성 포함
- [ ] `<script>` 태그에 `crossorigin="anonymous"` 포함
- [ ] 하드코딩된 API 키 없음 (`AIAPK*`, `sk-*` 등)
- [ ] 주석에도 민감 정보 없음

### 3. JavaScript 보안 검사
- [ ] `localStorage.setItem('*api*')` 사용 안 함
- [ ] `eval()` 사용 안 함
- [ ] `innerHTML` 대신 `textContent`/`createElement` 사용
- [ ] 모든 외부 fetch는 HTTPS 사용

### 4. 로컬 테스트 체크리스트
```powershell
# 파일 크기 확인
Get-ChildItem -Filter "*.html", "*.js", "*.css" | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB, 2)}}

# 콘텐츠 무결성 확인 (sha256)
function Get-FileSHA256($Path) {
    (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

Write-Host "파일 무결성 해시:" -ForegroundColor Cyan
Get-FileSHA256 "nihontalkEvent.html"
Get-FileSHA256 "script.js"
Get-FileSHA256 "styles.css"
```

### 5. 네트워크 요청 점검
로컬 서버에서 실행 후 브라우저 개발자 도구(F12) → Network 탭:
- [ ] `nihontalkEvent.html` 상태: 200
- [ ] `script.js` 상태: 200
- [ ] `styles.css` 상태: 200
- [ ] CDN 파일들 상태: 200 (또는 304 캐시)

### 6. Console 에러 점검
개발자 도구(F12) → Console 탭에서:
- [ ] JavaScript 에러 없음
- [ ] 보안 경고 없음 (SRI 실패 등)
- [ ] CORS 에러 없음

### 7. localStorage 확인
콘솔에서:
```javascript
// 저장된 데이터 확인
console.log(localStorage);

// 특정 키 삭제 (테스트)
localStorage.removeItem('gemini_api_key');
localStorage.removeItem('GEMINI_KEY');
```

## 배포 전 최종 확인

```powershell
Write-Host "배포 전 체크리스트:" -ForegroundColor Yellow
$checks = @(
    "필수 파일 3개 존재",
    "HTML에 SRI 해시 포함",
    "JavaScript 에러 없음",
    "localStorage API 키 저장 코드 없음",
    "외부 CDN HTTPS 사용",
    "로컬 테스트 정상 작동"
)

foreach ($check in $checks) {
    Write-Host "[ ] $check"
}
```

## 배포 후 검증

1. **배포된 URL 접근**
   ```
   https://your-site.netlify.app/nihontalkEvent.html
   ```

2. **개발자 도구 검증**
   - F12 열기
   - Network 탭: 모든 리소스 200 상태 확인
   - Console 탭: 에러 없음 확인

3. **기능 테스트**
   - 잔소리 버블 클릭
   - 직접 입력 후 변환
   - 운세 뽑기
   - 버킷리스트 추가/삭제

4. **보안 검증**
   - 개발자 도구 → Application → localStorage 확인 (gemini_api_key 없어야 함)
   - 페이지 소스 보기에서 하드코딩 키 확인 안 함
