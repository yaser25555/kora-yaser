# 🏆 كأس العالم 2026 - جدول المباريات

موقع ويب تفاعلي يعرض جدول مباريات كأس العالم 2026 مع التوقيت السعودي (UTC+3) وتوضيح (صباحًا/مساءً/فجرًا).

**يشتغل على: Firebase Hosting أو GitHub Pages أو أي سيرفر استاتيك.**

## 🚀 النشر على Firebase Hosting

### 1. أنشئ مشروع Firebase
- اذهب إلى https://console.firebase.google.com
- اضغط **Create a project** (أو **إضافة مشروع**)

### 2. جهّز النشر

```bash
# ثبّت Firebase CLI
npm install -g firebase-tools

# سجل الدخول
firebase login

# في مجلد المشروع
cd "C:\Users\pool\Desktop\جدول  كاس العالم"
firebase init hosting
```

أثناء `firebase init hosting` اختر:
- Use an existing project → اختر مشروعك
- Public directory → `.` (نقطة، تعني المجلد الحالي)
- Single-page app → **No**
- Automatic builds → **No**

### 3. انشر

```bash
firebase deploy --only hosting
```

بعد ثواني راح يظهر رابط الموقع مثل: `https://[project].web.app`

## 🚀 النشر على GitHub Pages

```bash
# أنشئ مستودع على GitHub ثم:
git clone https://github.com/[اسمك]/[المستودع].git
# انسخ الملفات
git add .
git commit -m "رفع جدول كأس العالم 2026"
git push
```

اذهب إلى Settings → Pages → اختر `main` / root → Save

## 🔄 كيف تتحدث النتائج؟

الصفحة تسحب البيانات **مباشرة من المصدر الرسمي** (openfootball على GitHub) كلما فتحتها. لا تحتاج أي إعدادات إضافية. إذا تعذر الوصول للمصدر، تستخدم نسخة احتياطية محلية.

لو تحب تحديث تلقائي كل 30 دقيقة: ارفع على GitHub وفعّل GitHub Actions.

## 📁 هيكل المشروع

```
├── index.html              # الصفحة الرئيسية (تشتغل لحالها)
├── matches.json            # بيانات احتياطية
├── firebase.json           # إعدادات Firebase
├── data/
│   └── arabic-names.json   # أسماء الفرق والملاعب بالعربية
└── scripts/
    └── update-matches.js   # سكريبت التحديث (GitHub Actions)
```

## 🌐 المصادر

- بيانات المباريات: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- التوقيت: UTC+3 (السعودية)
