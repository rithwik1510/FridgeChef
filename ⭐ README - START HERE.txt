╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🥘 FridgeChef - Quick Start Guide                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📌 SUPER SIMPLE - Just 2 Steps!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌─────────────────────────────────────────────────────────────┐
│  STEP 1: First Time Only (Do This Once)                     │
└─────────────────────────────────────────────────────────────┘

   📁 Double-click: FIRST_TIME_SETUP.bat

   ✏️  Enter your Groq API Key when asked

   ⏳ Wait for installation to complete (~5 minutes)

   ✅ Done! Your API key is now saved forever!


┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Every Time You Want to Use FridgeChef             │
└─────────────────────────────────────────────────────────────┘

   📁 Double-click: START_APP.bat

   ⏳ Wait 10-15 seconds for servers to start

   🌐 Open browser: http://localhost:3000

   🎉 Start using FridgeChef!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ❌ Common Mistakes (Don't Do This!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ❌ Don't run FIRST_TIME_SETUP.bat every time
     → Only run it ONCE when you first install!

  ❌ Don't delete backend/.env file
     → This is where your API key is stored!

  ❌ Don't paste API key multiple times
     → It's already saved after first setup!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📂 File Guide (What Does Each File Do?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✨ START_APP.bat
     → Use this EVERY TIME to start the app
     → Opens both backend and frontend automatically

  🔧 FIRST_TIME_SETUP.bat
     → Use ONLY ONCE for initial setup
     → Saves your API key permanently

  📖 HOW_TO_START.txt
     → Detailed instructions (if you need help)

  ⚙️  start_backend.bat / start_frontend.bat
     → Advanced: Start services individually
     → Normal users don't need these!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 TL;DR - The Simple Truth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📝 Your API key is saved in: backend/.env

  🔒 It never disappears or expires

  ✅ You only enter it ONCE during setup

  🚀 After that, just use START_APP.bat every time!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🆘 Need Help?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Problem: "Backend not configured" error
  → Run FIRST_TIME_SETUP.bat once

  Problem: API key not working
  → Check backend/.env file exists
  → Make sure it has both SECRET_KEY and GROQ_API_KEY

  Problem: Port already in use
  → Close other FridgeChef windows
  → Kill processes on port 8000 or 3000


╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎉 That's it! Enjoy using FridgeChef!                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
