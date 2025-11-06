## راه‌اندازی سریع

1) پیش‌نیازها: Node 18+، MongoDB محلی

2) تنظیم محیط:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sepidar_pwa
APP_JWT_SECRET=replace-with-a-32-characters-secret--------------------------------
SEPIDAR_URL=http://localhost:7373/api
LOG_LEVEL=info
```

3) اجرا:

- نصب: `npm install`
- توسعه: `npm run dev`
- بیلد/استارت: `npm run build && npm start`

## نقاط کلیدی

- احراز هویت: `/api/auth/login` (loginWithSepidar)
- آیتم‌ها: `/api/items`، همگام‌سازی: `/api/items/sync`
- مشتری‌ها: `/api/customers`، همگام‌سازی: `/api/customers/sync`
- پیش‌فاکتور: `POST /api/quotations`
- فاکتور: `/api/invoices` و `POST /api/invoices/based-on-quotation/:quotationId`
- مدیریت: ثبت دستگاه `POST /api/admin/devices/register`، همگام‌سازی کامل `POST /api/admin/sync/full`

توکن اپ در هدر Authorization و `x-device-id` برای محدودیت دستگاه ارسال شود.
