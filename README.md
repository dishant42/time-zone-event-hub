The only requirement is having Node.js & npm installed 

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <GIT_URL>

# Step 2: Navigate to the project directory.
cd <PROJ_PATH>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```


dst transitions are the adjusting of clocks twice in year if not accounted for they can mess the timings of things scheduled during that period


🌍 TIMEZONE HANDLING STRATEGY
⏰ Timezone Flow
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  USER INPUT     │    │    STORAGE      │    │   DISPLAY       │
│ (Local Time)    │───►│   (UTC Time)    │───►│ (User's Local)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                       │                       │
        │                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Browser detects │    │ Convert to UTC  │    │ Convert from    │
│ user timezone   │    │ before saving   │    │ UTC to local    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
🔧 Implementation :
- All times stored in UTC (ISO 8601)
- Browser auto-detects user timezone
- Display times in user's local timezone
- Show timezone abbreviation (EST, PST, etc.)
- Handle DST transitions gracefully
