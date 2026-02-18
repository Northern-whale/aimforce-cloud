# AIMForce - Quick Start Guide

## 🚀 Start the App (Right Now!)

### 1. Open in Browser
```
http://localhost:3002
```

### 2. Try Owner Dashboard
```
Email: owner@aimforce.cloud
Password: aimforce2026
```

**You'll see:**
- 2 active clients
- 3 AI agents
- Real-time stats
- Active projects
- Recent agent activities

### 3. Try Client Portal
Log out, then login as:
```
Email: demo1@company.com
Password: demo2026
```

**You'll see:**
- Your assigned AI agents
- Your tasks (To Do, In Progress, Done)
- AI recommendations
- Voice recording button
- Projects overview

### 4. Test Voice Recording
1. Click "🎤 Record Voice Note" button
2. Allow microphone access
3. Click "Start Recording"
4. Speak your message
5. Click "Stop Recording"
6. Click "Transcribe"
7. See placeholder (full transcription in Phase 2)

---

## 📱 What Works Right Now

✅ **Authentication** - Login/logout with role-based routing  
✅ **Owner Dashboard** - Full stats and management view  
✅ **Client Portal** - Personalized client experience  
✅ **Voice Recording** - Browser-based audio capture  
✅ **Database** - Seeded with realistic demo data  
✅ **Responsive Design** - Works on mobile/tablet/desktop  

---

## 🎯 Phase 2 Next Steps

When you're ready to add:
1. **ElevenLabs STT** - Real voice transcription
2. **Google Drive** - File upload/storage
3. **Anthropic AI** - Active agent execution
4. **Deployment** - Live on aimforce.cloud

---

## 🆘 Troubleshooting

**Port already in use?**
- Server auto-switches to port 3002
- Check: http://localhost:3002

**Can't login?**
- Use exact credentials above
- Check caps lock
- Database should exist at `prisma/dev.db`

**Want to reset data?**
```bash
cd ~/Desktop/Tars/Projects/aimforce
rm prisma/dev.db
npx prisma migrate dev
npm run db:seed
```

---

**🎉 You're all set! Start exploring the platform.**
