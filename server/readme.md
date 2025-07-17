# 🏡 HomeHorizon – Real Estate Platform (Backend)

🔗 **Backend Live URL**: [home-horizon-server.vercel.app](https://home-horizon-server.vercel.app)  
📁 **Server Repo**: [GitHub]()

---

## ⚙️ Features / API Highlights

1. 🔐 JWT-based role verification (admin, agent, fraud)
2. ✅ Property verification & fraud detection system
3. 📢 Admin can **advertise/unadvertise** properties
4. 📊 Real-time stats: earnings, ad counts, user roles
5. 📝 User reviews (latest, by property)
6. 🧾 Stripe payment integration for secure checkout
7. ☁️ Image uploads via **Cloudinary + multer**
8. 🗑️ Delete Cloudinary images before submission
9. 📍 Add property by geolocation and coordinates
10. 🔄 All actions are RESTful and protected by middleware

---

## 🛠 Stack Used

- **Runtime**: Node.js (CommonJS)
- **Server**: Express.js
- **DB**: MongoDB
- **Auth**: Firebase Admin SDK
- **Payments**: Stripe
- **File Upload**: Multer + Cloudinary
- **Environment**: dotenv

---

## 🔐 Environment Variables

Add a `.env` file with:

```env
PORT=5000
MONGODB_URI=your_mongo_uri
FIREBASE_KEY=base64_encoded_firebase_config
STRIPE_SECRET_KEY=your_stripe_key
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
