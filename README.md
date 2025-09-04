# frontend task for eleva, simple pitch writer

a simple React app to help write startup pitches fast. Just fill in your company details, hit "Generate", and watch your pitch appear in real-time.

## Run hosted link

follow the link: https://eleva-frontend-task.vercel.app/

## How to Run locally

1. Clone this repo.
2. Run `npm install`
3. Run `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- enter company, problem, solution, ask, and tone.
- the pitch will be streamed for you.

## technical features of the app:
- **Form Input:** collects company, problem, solution, ask, and tone from the user.
- **Validation:** checks required fields before generating output.
- **Streaming Output:** simulates AI-generated pitch sections (headline, subhead, body) using an async generator (streamed).
- **Live Rendering:** displays output incrementally as tokens stream in.
- **Abort Support:** cancels ongoing generation if a new request starts.
- **State Management:** uses React hooks for form values, errors, streaming state, and output sections.