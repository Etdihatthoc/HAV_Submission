# 🚀 Hướng dẫn Demo AI Crop Doctor Web

## ✅ Đã hoàn thành

### 1. Setup Project ✓
- ✅ Vite + React 18
- ✅ Tailwind CSS configured
- ✅ React Router DOM
- ✅ Axios for API calls
- ✅ Leaflet.js for maps
- ✅ Lucide React icons

### 2. Layout Components ✓
- ✅ Sidebar với navigation
- ✅ Header với user info
- ✅ Main layout wrapper

### 3. Pages ✓
- ✅ **Dashboard**: Chat multimodal với AI, stats cards
- ✅ **Epidemic Map**: Bản đồ với filters và alerts
- ✅ **Diagnosis Result**: Split-view kết quả chẩn đoán
- ✅ **Expert Chat**: 3-column chat với chuyên gia

### 4. Services ✓
- ✅ chatService.js
- ✅ diagnosisService.js
- ✅ epidemicService.js
- ✅ expertService.js

### 5. Backend Updates ✓
- ✅ Port đổi từ 8000 → 5050 trong config.py

## 🎯 Cách chạy Demo

### Terminal 1: Backend
```bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP
bash start_server.sh
```
✅ Backend chạy tại: http://localhost:5050

### Terminal 2: Frontend
```bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP_WEB
npm run dev
```
✅ Web app tại: http://localhost:5173

## 📱 Test Flow

### Test 1: Chat với AI
1. Mở http://localhost:5173
2. Nhập tin nhắn hoặc upload ảnh
3. Click Send
4. Xem AI response

### Test 2: Xem Epidemic Map
1. Click "Epidemic Map" trên sidebar
2. Chọn filters
3. Xem markers trên map

### Test 3: Xem kết quả chẩn đoán
1. Từ Dashboard, sau khi chat với ảnh
2. Navigate đến /result/1 (nếu có data)

### Test 4: Chat với Expert
1. Navigate đến /expert
2. Chọn chuyên gia
3. Gửi tin nhắn

## 📂 Structure

```
RMIT_AICROP_WEB/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx          ← Chat multimodal
│   │   ├── EpidemicMap.jsx        ← Bản đồ dịch tễ
│   │   ├── DiagnosisResult.jsx    ← Kết quả chi tiết
│   │   └── ExpertChat.jsx         ← Chat chuyên gia
│   ├── components/Layout/
│   ├── services/                   ← API calls
│   └── config/api.js              ← API_BASE_URL: port 5050
```

## 🎨 Design Highlights

- ✅ Gradient sidebar (primary-700 → primary-900)
- ✅ Card-based UI với shadow-lg
- ✅ Smooth animations
- ✅ Responsive (tailwind grid)
- ✅ Chat bubbles với animation
- ✅ Color-coded severity levels
- ✅ Interactive map với Leaflet

## ⚠️ Important Notes

### 1. Background Image
Nếu có file background.png, copy vào:
```bash
cp /path/to/background.png /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP_WEB/public/assets/
```

### 2. API Port
Backend PHẢI chạy port 5050 (đã update trong config.py)

### 3. CORS
Backend đã enable CORS cho tất cả origins (allow_origins=["*"])

### 4. Mock Data
- Expert list dùng mock data (3 chuyên gia)
- Chat simulation với setTimeout

## 🔧 Troubleshooting

### Vấn đề: "Cannot read package.json"
```bash
# Đảm bảo cd vào đúng thư mục
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP_WEB
npm run dev
```

### Vấn đề: Map không hiển thị
```bash
# Reinstall leaflet
npm install leaflet react-leaflet
```

### Vấn đề: API errors
```bash
# Kiểm tra backend đang chạy
curl http://localhost:5050/docs
```

## 🎯 Next Steps (Optional)

1. **Add real-time stats**: Fetch từ API và update Dashboard stats
2. **Implement audio recorder**: Sử dụng MediaRecorder API
3. **Add history page**: Hiển thị danh sách chẩn đoán
4. **Heatmap layer**: Sử dụng leaflet.heat plugin
5. **WebSocket**: Real-time expert chat
6. **Polish animations**: Thêm loading states, transitions

## 📸 Screenshots

### Dashboard
- Hero section với background
- Chat box multimodal
- 3 stats cards

### Epidemic Map
- Filter panel bên trái
- Interactive map với markers
- Alert list

### Diagnosis Result
- Image preview bên trái
- Disease info, confidence, treatment bên phải
- Action buttons (Save, Consult Expert)

### Expert Chat
- Expert list (left)
- Chat window (middle)
- Case context (right)

---

✅ **Implementation Complete!**

Web app đã sẵn sàng để demo. Chỉ cần start backend và frontend là có thể test ngay!

🌾 **Happy Coding!**
