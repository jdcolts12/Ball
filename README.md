# Football Trivia

## Run the app

1. **Open a terminal** (Terminal.app, iTerm, or VS Code integrated terminal).

2. **Go to the project folder:**
   ```bash
   cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
   ```
   Or if you're already in `Cursor Project 1`:
   ```bash
   cd football-trivia
   ```

3. **Install dependencies** (only needed once, or after pulling changes):
   ```bash
   npm install
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. **Open the app in your browser:**
   - The terminal will show something like: `Local: http://localhost:5173/`
   - Click that link, or open a browser and go to: **http://localhost:5173**

## If it still doesn’t work

### “npm: command not found”
- Install Node.js from https://nodejs.org (use the LTS version).
- Restart the terminal and run the steps again.

### “Site can’t be reached” or “This site can’t be reached”
- Make sure **Step 4** is running and you see `ready` and a URL in the terminal.
- Use exactly: **http://localhost:5173** (not https, not a different port).
- Try **http://127.0.0.1:5173** if localhost fails.
- Don’t close the terminal while you’re using the app; closing it stops the server.

### Port 5173 already in use
- Stop any other app using 5173, or run:
  ```bash
  npm run dev -- --port 3000
  ```
  Then open **http://localhost:3000**.

### Blank page or errors in the browser
- Open Developer Tools (F12 or right‑click → Inspect → **Console**).
- Note any red errors and share them so we can fix the issue.

### Wrong folder
- You must run `npm install` and `npm run dev` **inside** the `football-trivia` folder (where `package.json` and `vite.config.ts` are). Running them from `Cursor Project 1` or your home folder will not start this app.
