# راهنمای تنظیمات Environment Variables

این فایل راهنمای کامل متغیرهای محیطی مورد نیاز برای پروژه است.

## ساختار فایل .env

فایل `.env` باید در دایرکتوری `backend` قرار گیرد و شامل متغیرهای زیر باشد:

```env
# ============================================
# Application Settings
# ============================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/sepidar_pwa

# ============================================
# Security & Authentication
# ============================================
APP_JWT_SECRET=replace-with-a-32-characters-secret--------------------------------

# ============================================
# Sepidar Service Integration
# ============================================
SEPIDAR_URL=http://localhost:7373/api
DEFAULT_GENERATION_VERSION=110
SEPIDAR_SERVICE_USERNAME=
SEPIDAR_SERVICE_PASSWORD=

# ============================================
# Notifications (Optional)
# ============================================
NOTIFY_WEBHOOK_URL=
```

## توضیحات متغیرها

### متغیرهای اجباری (Required)

#### `NODE_ENV`
- **نوع**: `string`
- **مقدار پیش‌فرض**: `development`
- **مقادیر مجاز**: `development`, `production`, `test`
- **توضیحات**: محیط اجرای برنامه

#### `PORT`
- **نوع**: `string`
- **مقدار پیش‌فرض**: `3000`
- **توضیحات**: پورت سرور API

#### `MONGODB_URI`
- **نوع**: `string`
- **اجباری**: ✅ بله
- **توضیحات**: رشته اتصال به MongoDB
- **مثال‌ها**:
  - محلی: `mongodb://localhost:27017/sepidar_pwa`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### `APP_JWT_SECRET`
- **نوع**: `string`
- **اجباری**: ✅ بله (حداقل 32 کاراکتر)
- **توضیحات**: کلید مخفی برای امضای JWT tokens
- **تولید کلید امن**: 
  ```bash
  openssl rand -base64 32
  ```
  یا
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

#### `SEPIDAR_URL`
- **نوع**: `string` (URL معتبر)
- **اجباری**: ✅ بله
- **توضیحات**: آدرس پایه API سرویس Sepidar
- **مثال**: `http://localhost:7373/api`

### متغیرهای اختیاری (Optional)

#### `LOG_LEVEL`
- **نوع**: `string`
- **مقدار پیش‌فرض**: `info`
- **مقادیر مجاز**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`
- **توضیحات**: سطح لاگ‌گیری برنامه

#### `DEFAULT_GENERATION_VERSION`
- **نوع**: `string`
- **مقدار پیش‌فرض**: `110`
- **توضیحات**: نسخه پیش‌فرض Generation برای API Sepidar

#### `SEPIDAR_SERVICE_USERNAME`
- **نوع**: `string`
- **اجباری**: ❌ اختیاری (اما باید همراه با `SEPIDAR_SERVICE_PASSWORD` باشد)
- **توضیحات**: نام کاربری سرویس Sepidar برای احراز هویت سطح سرویس

#### `SEPIDAR_SERVICE_PASSWORD`
- **نوع**: `string`
- **اجباری**: ❌ اختیاری (اما باید همراه با `SEPIDAR_SERVICE_USERNAME` باشد)
- **توضیحات**: رمز عبور سرویس Sepidar برای احراز هویت سطح سرویس
- **نکته**: اگر یکی از این دو متغیر تنظیم شود، دیگری نیز باید تنظیم شود

#### `NOTIFY_WEBHOOK_URL`
- **نوع**: `string` (URL)
- **اجباری**: ❌ اختیاری
- **توضیحات**: آدرس Webhook برای ارسال اعلان‌ها (مثل ایجاد پیش‌فاکتور یا فاکتور)
- **مثال**: `https://example.com/webhook/notifications`
- **نکته**: اگر تنظیم نشود، اعلان‌ها فقط در console نمایش داده می‌شوند

## مثال فایل .env کامل

```env
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sepidar_pwa?retryWrites=true&w=majority

# Security
APP_JWT_SECRET=your-super-secret-key-at-least-32-characters-long-12345678901234567890

# Sepidar
SEPIDAR_URL=https://api.sepidar.com/api
DEFAULT_GENERATION_VERSION=110
SEPIDAR_SERVICE_USERNAME=service_user
SEPIDAR_SERVICE_PASSWORD=service_pass

# Notifications
NOTIFY_WEBHOOK_URL=https://your-app.com/api/webhooks/notifications
```

## نکات مهم

1. **امنیت**: هرگز فایل `.env` را در Git commit نکنید. این فایل باید در `.gitignore` باشد.

2. **تولید APP_JWT_SECRET**: برای محیط production حتماً یک کلید امن و تصادفی تولید کنید.

3. **SEPIDAR_SERVICE_USERNAME/PASSWORD**: این متغیرها باید با هم تنظیم شوند یا هر دو خالی باشند.

4. **NOTIFY_WEBHOOK_URL**: اگر نیاز به webhook notifications ندارید، می‌توانید این متغیر را خالی بگذارید.

5. **MONGODB_URI**: برای محیط production از connection string امن استفاده کنید و از authentication استفاده نمایید.

## اعتبارسنجی

پروژه از `zod` برای اعتبارسنجی متغیرهای محیطی استفاده می‌کند. در صورت نبودن متغیرهای اجباری یا مقادیر نامعتبر، برنامه در زمان راه‌اندازی خطا می‌دهد.

فایل اعتبارسنجی: `src/config/env.ts`

