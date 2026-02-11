#!/usr/bin/env powershell
# 로컬 테스트 서버 시작 스크립트
# 사용법: .\start-server.ps1

param(
    [int]$Port = 8000,
    [string]$Bind = "127.0.0.1"
)

Write-Host "니혼톡 로컬 테스트 서버 시작..." -ForegroundColor Green
Write-Host "포트: $Port" -ForegroundColor Cyan
Write-Host ""

# Python 서버 시도
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Python http.server로 실행 중..." -ForegroundColor Yellow
    python -m http.server --bind $Bind $Port
} else {
    Write-Host "Python을 찾을 수 없습니다. Node.js 확인 중..." -ForegroundColor Yellow
    
    # Node.js 서버 대안
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "npx http-server로 실행 중..." -ForegroundColor Yellow
        npx http-server -p $Port
    } else {
        Write-Host "Python 또는 Node.js를 설치하세요." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "서버를 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Cyan
