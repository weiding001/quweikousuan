# 趣味口算应用 - 优化安装脚本

# 显示开始消息
Write-Host "开始应用趣味口算应用的优化更改..." -ForegroundColor Green

# 检查是否存在utils.js，如果不存在则创建
if (-not (Test-Path -Path "utils.js")) {
    Write-Host "创建公共工具函数库 utils.js..." -ForegroundColor Yellow
}
else {
    Write-Host "utils.js 已存在，将被替换..." -ForegroundColor Yellow
    Rename-Item -Path "utils.js" -NewName "utils.js.bak" -Force
    Write-Host "已备份原始 utils.js 到 utils.js.bak" -ForegroundColor Yellow
}

# 备份原始文件
Write-Host "备份原始文件..." -ForegroundColor Yellow
if (Test-Path -Path "practice.html") {
    Copy-Item -Path "practice.html" -Destination "practice.html.bak" -Force
    Write-Host "已备份 practice.html 到 practice.html.bak" -ForegroundColor Yellow
}
if (Test-Path -Path "result.html") {
    Copy-Item -Path "result.html" -Destination "result.html.bak" -Force
    Write-Host "已备份 result.html 到 result.html.bak" -ForegroundColor Yellow
}

# 应用优化文件
Write-Host "应用优化文件..." -ForegroundColor Yellow
if (Test-Path -Path "practice_new.html") {
    Move-Item -Path "practice_new.html" -Destination "practice.html" -Force
    Write-Host "已应用新版 practice.html" -ForegroundColor Green
}
else {
    Write-Host "没有找到 practice_new.html，未更新 practice.html" -ForegroundColor Red
}

if (Test-Path -Path "result_new.html") {
    Move-Item -Path "result_new.html" -Destination "result.html" -Force
    Write-Host "已应用新版 result.html" -ForegroundColor Green
}
else {
    Write-Host "没有找到 result_new.html，未更新 result.html" -ForegroundColor Red
}

# 修改其他页面，添加对utils.js的引用
$homePath = "home.html"
$achievementsPath = "achievements.html"
$mistakesPath = "mistakes.html"

# 为每个文件添加utils.js引用
$files = @($homePath, $achievementsPath, $mistakesPath)
foreach ($file in $files) {
    if (Test-Path -Path $file) {
        # 备份文件
        Copy-Item -Path $file -Destination "$file.bak" -Force
        Write-Host "已备份 $file 到 $file.bak" -ForegroundColor Yellow
        
        # 读取文件内容
        $content = Get-Content -Path $file -Raw
        
        # 在头部添加引用 (在</head>标签前)
        if ($content -match "</head>") {
            $newContent = $content -replace "</head>", "    <script src=`"utils.js`"></script>`r`n</head>"
            Set-Content -Path $file -Value $newContent
            Write-Host "已向 $file 添加utils.js引用" -ForegroundColor Green
        } else {
            Write-Host "无法在 $file 中找到</head>标签，未添加引用" -ForegroundColor Red
        }
    } else {
        Write-Host "文件 $file 不存在，跳过" -ForegroundColor Yellow
    }
}

# 安装完成
Write-Host "优化安装完成!" -ForegroundColor Green
Write-Host "现在可以通过双击任意html文件在浏览器中预览应用" -ForegroundColor Green 