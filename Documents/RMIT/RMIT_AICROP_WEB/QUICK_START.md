# Quick Start Guide - Pricing System

## 🚀 Bước 1: Chạy Migration (Backend)

```bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP

# Chạy migration để thêm credits system vào database
python scripts/migrate_add_credits.py
```

**Expected Output:**
```
Starting credit system migration...
==================================================
Migrating database: ./database/crop_doctor.db
Adding new columns to users table...
✓ Added 'credits' column
✓ Added 'total_credits_spent' column
✓ Added 'membership_tier' column
Adding new columns to diagnoses table...
✓ Added 'case_id' column
✓ Added 'credits_charged' column
Adding new columns to chat_history table...
✓ Added 'case_id' column
✓ Added 'credits_charged' column
Creating new tables...
✓ Created new tables (diagnosis_cases, credit_transactions)
Initializing credits for existing users...
✓ Initialized credits for X existing users
✓ Created X initial transaction records

==================================================
Migration completed successfully!
==================================================
```

---

## 🚀 Bước 2: Start Backend Server

```bash
# Nếu server chưa chạy
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP
python -m uvicorn app.main:app --host 0.0.0.0 --port 5050 --reload
```

**Check**: Mở browser và truy cập http://localhost:5050/docs
- Bạn sẽ thấy 2 sections mới: **Credits** và **Cases**

---

## 🚀 Bước 3: Start Frontend

```bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP_WEB

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

**Check**: Mở browser và truy cập http://localhost:5173 (hoặc port Vite chỉ định)

---

## ✅ Bước 4: Test Các Features

### Test 1: Signup & Initial Credits

1. **Signup** account mới tại `/signup`
   - Phone: `0123456789`
   - Password: `123456`
   - Full Name: `Test User`

2. **Login** và kiểm tra:
   - ✅ Ở header phải thấy **"30 xu"** (màu xanh)
   - ✅ Click vào credits → Navigate to `/transactions`
   - ✅ Phải thấy 1 transaction: **"Khởi tạo tài khoản - Nhận 30 xu miễn phí"** (+30 xu)

---

### Test 2: Daily Logging (FREE) - KHÔNG tính phí

**API Test** (Sử dụng Postman hoặc Thunder Client):

```http
POST http://localhost:5050/api/v1/chat
Content-Type: multipart/form-data

message: "Hôm nay tôi bón phân cho lúa"
user_id: 1
case_type: daily_logging
image: <upload 5 ảnh>
```

**Expected**:
- ✅ Response OK
- ✅ Credits vẫn là **30 xu** (không thay đổi)
- ✅ Response body có:
  ```json
  {
    "case_type": "daily_logging",
    "credits_charged": 0,
    "credits_remaining": 10
  }
  ```

---

### Test 3: Inquiry - 4 ảnh FREE, ảnh 5+ = 1 xu

**Test 3.1: Gửi 4 ảnh đầu (FREE)**

```http
POST http://localhost:5050/api/v1/chat
Content-Type: multipart/form-data

message: "Lá lúa bị vàng"
user_id: 1
case_type: inquiry
image: <upload ảnh 1>
```

Lặp lại 4 lần (4 ảnh)

**Expected**:
- ✅ Credits vẫn **30 xu**
- ✅ `images_count` tăng từ 1 → 4
- ✅ `credits_charged: 0`

**Test 3.2: Gửi ảnh thứ 5 (CHARGE 1 xu)**

```http
POST http://localhost:5050/api/v1/chat
Content-Type: multipart/form-data

message: "Thêm ảnh nữa"
user_id: 1
case_type: inquiry
image: <upload ảnh 5>
```

**Expected**:
- ✅ Credits giảm xuống **9 xu**
- ✅ Response: `credits_charged: 1, credits_remaining: 9`
- ✅ Transaction history có record mới: **"-1 xu - Chụp ảnh thứ 5 - Inquiry"**

---

### Test 4: Deep Analysis - Charge 3 xu NGAY lần đầu

**Test 4.1: Gửi ảnh đầu tiên**

```http
POST http://localhost:5050/api/v1/chat
Content-Type: multipart/form-data

message: "Phân tích sâu bệnh lúa"
user_id: 1
case_type: deep_analysis
image: <upload ảnh 1>
```

**Expected**:
- ✅ Credits giảm xuống **6 xu** (9 - 3 = 6)
- ✅ Response: `credits_charged: 3, credits_remaining: 6`
- ✅ Transaction: **"-3 xu - Phân tích sâu - Deep Analysis"**

**Test 4.2: Gửi thêm ảnh (KHÔNG charge nữa)**

Gửi thêm 5-10 ảnh nữa với cùng case_id

**Expected**:
- ✅ Credits vẫn **6 xu** (không đổi)
- ✅ `credits_charged: 0` (không charge thêm)

---

### Test 5: Insufficient Credits - Lỗi 402

**Setup**: Tiêu credits đến còn 2 xu

```http
# Tạo Deep Analysis (cần 3 xu, nhưng chỉ còn 2 xu)
POST http://localhost:5050/api/v1/chat

user_id: 1
case_type: deep_analysis
image: <file>
```

**Expected**:
- ❌ Response: **402 Payment Required**
- ❌ Error: `"Insufficient credits. Required: 3 xu, Available: 2 xu"`

---

### Test 6: Transaction History UI

1. Click vào **Credits display** ở header (hoặc navigate to `/transactions`)
2. **Expected**:
   - ✅ Summary cards:
     - Số dư hiện tại: 6 xu
     - Tổng đã tiêu: 4 xu
     - Số giao dịch: 3
   - ✅ Transaction list hiển thị:
     - +30 xu | Khởi tạo tài khoản
     - -1 xu | Chụp ảnh thứ 5 - Inquiry
     - -3 xu | Phân tích sâu - Deep Analysis
   - ✅ Pagination works (nếu có > 20 transactions)

---

## 🔍 Debug / Troubleshooting

### Backend Debug

**Check Migration Success:**
```bash
cd /Users/dinhnguyenson/Documents/RMIT/RMIT_AICROP
python -c "from app.database.models import User, CreditTransaction, DiagnosisCase; print('✅ Models imported successfully')"
```

**Check Database:**
```bash
sqlite3 database/crop_doctor.db
.tables
# Should see: credit_transactions, diagnosis_cases
.schema users
# Should see: credits, total_credits_spent, membership_tier columns
.quit
```

**Check API Docs:**
- Visit: http://localhost:5050/docs
- Look for **Credits** and **Cases** sections

### Frontend Debug

**Check CreditsContext:**
```javascript
// In browser console
localStorage.getItem('auth_token')  // Should have token
```

**Check Credits Display:**
- Login → Should see credits in header
- If not, check browser console for errors

**Check API Calls:**
- Open DevTools → Network tab
- Login → Should see `/api/v1/auth/login` with `credits: 10` in response

---

## 📊 Database Structure

### Tables Created

```sql
-- Credit Transactions
credit_transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,  -- Positive = earn, Negative = spend
  transaction_type TEXT NOT NULL,
  description TEXT,
  case_id INTEGER,
  diagnosis_id INTEGER,
  created_at TIMESTAMP
)

-- Diagnosis Cases
diagnosis_cases (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_id TEXT,
  case_type TEXT NOT NULL,  -- 'daily_logging', 'inquiry', 'deep_analysis'
  case_status TEXT DEFAULT 'active',
  credits_charged INTEGER DEFAULT 0,
  images_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- Users (updated)
users (
  ...existing columns...
  credits INTEGER DEFAULT 10,
  total_credits_spent INTEGER DEFAULT 0,
  membership_tier TEXT DEFAULT 'free'
)
```

---

## 🎯 Expected Behavior Summary

| Action | Cost | Notes |
|--------|------|-------|
| Signup | +30 xu | Initial bonus |
| Daily Logging | FREE | Unlimited images & chat |
| Inquiry (1-4 images) | FREE | First 4 images free |
| Inquiry (5+ images) | 1 xu/image | Each additional image |
| Deep Analysis | 3 xu | Charged once at start |
| Expert Consultation | 25 xu | (Not yet implemented) |

---

## 🐛 Common Issues

**Issue**: Credits không hiển thị ở header
- **Fix**: Check if `CreditsProvider` is wrapping app in `App.jsx`

**Issue**: Migration failed
- **Fix**: Delete `database/crop_doctor.db` và run `python app/database/init_db.py` rồi chạy migration lại

**Issue**: API returns 500 error
- **Fix**: Check backend logs, ensure all services imported correctly

**Issue**: Credits không update real-time
- **Fix**: Call `refreshCredits()` from CreditsContext sau mỗi transaction

---

## ✅ Checklist

- [ ] Migration chạy thành công
- [ ] Backend server running (port 5050)
- [ ] Frontend running (port 5173)
- [ ] Signup → Nhận 30 xu
- [ ] Daily Logging → FREE (không charge)
- [ ] Inquiry → 4 ảnh free, ảnh 5+ charge 1 xu
- [ ] Deep Analysis → Charge 3 xu ngay
- [ ] Transaction history hiển thị đúng
- [ ] Credits display ở header
- [ ] Insufficient credits → Error 402

---

**Ready to Test!** 🚀

Nếu có lỗi, check logs và refer to IMPLEMENTATION_SUMMARY.md
