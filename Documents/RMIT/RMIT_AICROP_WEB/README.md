# 🌾 AI Crop Doctor - Web Application

Web demo application cho hệ thống chẩn đoán bệnh cây trồng bằng AI.

## 📋 Tính năng

### 1. **Dashboard** (Trang chủ)
- 💬 Chat đa phương thức với AI (text, image, audio)
- 📊 Thống kê tổng quan
- 🖼️ Upload hình ảnh (drag & drop)
- 🎤 Ghi âm giọng nói

### 2. **Epidemic Map** (Bản đồ Dịch tễ)
- 🗺️ Bản đồ tương tác với Leaflet.js
- 📍 Hiển thị cảnh báo dịch bệnh theo vị trí
- 🔍 Bộ lọc theo tỉnh/thành, loại bệnh, thời gian

### 3. **Diagnosis Result** (Kết quả Chẩn đoán)
- 🖼️ Split-view: Image bên trái, kết quả bên phải
- 📈 Độ tin cậy với progress bar
- 💊 Phác đồ điều trị chi tiết

### 4. **Expert Chat** (Tư vấn Chuyên gia)
- 👥 3-column layout
- 💬 Chat interface trực quan
- 📋 Case context panel

## 🚀 Quick Start

### 1. Khởi động Backend (Terminal 1)
\`\`\`bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP
bash start_server.sh
\`\`\`
Backend: http://localhost:5050

### 2. Khởi động Frontend (Terminal 2)
\`\`\`bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP_WEB
npm run dev
\`\`\`
Frontend: http://localhost:5173

## 🎨 Tech Stack
- React 18 + Vite
- Tailwind CSS
- Leaflet.js
- React Router v6
- Axios

## 📱 Pages
- \`/\` - Dashboard
- \`/map\` - Epidemic Map
- \`/result/:id\` - Diagnosis Result
- \`/expert/:diagnosisId\` - Expert Chat

---
RMIT University © 2026
