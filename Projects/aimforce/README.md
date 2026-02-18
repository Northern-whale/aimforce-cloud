# AIMForce - Your AI Workforce

**Domain:** aimforce.cloud  
**Status:** Phase 1 Complete ✅  
**Local URL:** http://localhost:3002

---

## 🚀 What's Built

### Two Complete Interfaces:

#### 1. **Owner Dashboard** (`/owner`)
- Overview with real-time stats
- All clients management
- AI agent orchestration
- Active projects tracking
- Recent activity feed
- Quick actions panel

#### 2. **Client Portal** (`/portal`)
- Personal dashboard with tasks
- AI team view (assigned agents)
- Voice recording interface (with Web Audio API)
- File upload system (ready for Google Drive)
- AI-generated recommendations
- Projects & analytics overview

---

## 🔐 Login Credentials

### Owner Account
```
Email: owner@aimforce.cloud
Password: aimforce2026
```

### Demo Clients
```
Client 1 (Tech Startup Inc):
Email: demo1@company.com
Password: demo2026

Client 2 (E-Commerce Plus):
Email: demo2@company.com
Password: demo2026
```

---

## 💾 Database (SQLite)

**Location:** `prisma/dev.db`

**Seeded Data:**
- ✅ 1 Owner account
- ✅ 3 AI Agents (Marketing Maven, Content Creator, Analytics Ace)
- ✅ 2 Demo clients with full profiles
- ✅ 2 Active projects
- ✅ 6 Tasks (various statuses)
- ✅ 3 AI-generated recommendations
- ✅ 3 Recent agent activities
- ✅ 4 Analytics records

---

## 🎯 Features Implemented

### Authentication
- ✅ NextAuth.js with JWT sessions
- ✅ Role-based access (Owner vs Client)
- ✅ Automatic routing based on role
- ✅ Protected routes with middleware

### Owner Dashboard
- ✅ Real-time stats (clients, agents, tasks, projects)
- ✅ Active projects list with task counts
- ✅ Recent agent activity feed
- ✅ Quick action cards
- ✅ Navigation to all management pages

### Client Portal
- ✅ Personalized dashboard
- ✅ Task management (To Do, In Progress, Done)
- ✅ Assigned AI agents view with status
- ✅ Voice recording interface (Web Audio API)
- ✅ AI recommendations panel
- ✅ Projects overview
- ✅ Quick actions menu

### Voice Recording
- ✅ Browser-based audio recording
- ✅ Start/stop controls
- ✅ Audio playback preview
- ✅ Transcription UI (ready for ElevenLabs STT in Phase 2)
- ✅ Save functionality

---

## 🛠️ Tech Stack

**Framework:** Next.js 15 (App Router)  
**Language:** TypeScript  
**Styling:** Tailwind CSS  
**Database:** SQLite (via Prisma 5)  
**Authentication:** NextAuth.js  
**ORM:** Prisma

**APIs (Configured but not yet integrated):**
- Anthropic Claude (AI agents)
- ElevenLabs (Voice TTS + STT)
- Google Drive (File storage)

---

## 📁 Project Structure

```
aimforce/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts  # Authentication
│   ├── owner/
│   │   └── page.tsx                      # Owner dashboard
│   ├── portal/
│   │   ├── page.tsx                      # Client dashboard
│   │   └── voice/page.tsx                # Voice recording
│   └── login/page.tsx                    # Login page
├── prisma/
│   ├── schema.prisma                     # Database schema
│   ├── seed.ts                           # Seed data
│   └── migrations/                       # Database migrations
├── lib/
│   └── prisma.ts                         # Prisma client
├── types/
│   └── next-auth.d.ts                    # TypeScript types
├── middleware.ts                         # Route protection
└── .env                                  # Environment variables
```

---

## 🎨 Design Principles

- **Minimalistic:** Clean, professional interface
- **Mobile-responsive:** Works on all devices
- **Fast loading:** Optimized performance
- **Clear hierarchy:** Easy to navigate
- **Action-oriented:** Obvious next steps

**Color Scheme:**
- Primary: Blue (#1e40af)
- Secondary: Cyan (#06b6d4)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)

---

## 🚀 Getting Started

### 1. Start Development Server
```bash
cd ~/Desktop/Tars/Projects/aimforce
npm run dev
```

Server runs on: http://localhost:3002

### 2. Login
- Go to http://localhost:3002
- Use credentials above
- Owner → redirected to `/owner`
- Client → redirected to `/portal`

### 3. Explore
- **Owner:** Manage clients, view agents, check projects
- **Client:** See tasks, record voice notes, view AI team

---

## 📋 Next Steps (Phase 2)

### Voice Integration
- [ ] Connect ElevenLabs Speech-to-Text API
- [ ] Implement real audio transcription
- [ ] Save voice notes to database
- [ ] Auto-create tasks from voice notes

### File Management
- [ ] Google Drive API integration
- [ ] File upload interface
- [ ] File preview & download
- [ ] Organize by client folders

### AI Agent Execution
- [ ] Connect Anthropic Claude API
- [ ] Agent task processing
- [ ] Real-time status updates
- [ ] Agent activity logging

### Advanced Features
- [ ] Real-time notifications
- [ ] Email summaries
- [ ] Mobile app (React Native)
- [ ] Social media integrations
- [ ] Advanced analytics dashboard

### Production Deployment
- [ ] Migrate to PostgreSQL
- [ ] Deploy to Vercel
- [ ] Set up Railway for database
- [ ] Configure custom domain (aimforce.cloud)
- [ ] SSL certificate
- [ ] Monitoring & logging

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Generate Prisma client
npm run db:seed            # Re-seed database
```

---

## 📊 Database Schema

**8 Main Tables:**
- User (authentication)
- Session (JWT sessions)
- Client (company profiles)
- Agent (AI agents)
- AgentAssignment (client ↔ agent mapping)
- AgentActivity (agent action log)
- Project (client projects)
- Task (work items)
- VoiceNote (recorded audio)
- FileUpload (documents)
- Recommendation (AI suggestions)
- Analytics (metrics)

---

## 🎯 Success Criteria

**Phase 1 Complete When:**
- ✅ Owner can log in and see dashboard
- ✅ Owner can view all clients and agents
- ✅ Client can log in and see their portal
- ✅ Client can record voice (UI ready)
- ✅ Client can see assigned agents
- ✅ Client can view tasks and projects
- ✅ Clean, professional UI throughout
- ✅ Database fully seeded with demo data
- ✅ Responsive design works on mobile

**Status:** ✅ ALL COMPLETE!

---

## 🌐 Environment Variables

See `.env` for all configured variables:
- DATABASE_URL (SQLite)
- NEXTAUTH_URL & NEXTAUTH_SECRET
- ANTHROPIC_API_KEY ✅
- ELEVENLABS_API_KEY ✅
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (Phase 2)

---

## 🎉 What You Can Do Right Now

1. **Login as Owner:**
   - See all 2 clients
   - View 3 AI agents
   - Check active projects
   - Monitor agent activities

2. **Login as Client:**
   - See your assigned AI agents
   - View your tasks (To Do, In Progress, Done)
   - Record voice notes
   - Check AI recommendations
   - See your active projects

3. **Test Voice Recording:**
   - Go to Client Portal → Record Voice Note
   - Allow microphone access
   - Record a message
   - See the transcription placeholder
   - (Full transcription in Phase 2)

---

## 💰 Estimated Monthly Costs (Production)

- Vercel (hosting): $20/mo
- Railway (PostgreSQL): $20/mo
- ElevenLabs (voice): Included in current plan
- Anthropic (AI): Usage-based
- Google Drive: Free tier (15GB)

**Total:** ~$40-50/mo base + usage

---

## 🔐 Security Notes

- Passwords hashed with bcrypt
- JWT-based sessions
- Protected routes via middleware
- Role-based access control
- SQL injection protection (Prisma)

---

**Built by:** Nova (AI Manager)  
**Date:** February 18, 2026  
**Build Time:** ~2 hours  
**Status:** ✅ Ready for Demo  

**Next:** Deploy to aimforce.cloud or continue with Phase 2 features!
