# How to Customize Email Content

The email template is in: `supabase/functions/send-streak-reminders/index.ts`

---

## Where to Edit

Open: `supabase/functions/send-streak-reminders/index.ts`

Find these sections (around lines 114-145):

### 1. Email Subject Line (Lines 114-116)

```typescript
subject: user.streak_count >= 2 
  ? `🔥 Don't lose your ${user.streak_count}-day streak!` 
  : `⚽ Don't forget to play YunoBall today!`,
```

**Customize:**
- Change the emoji (🔥, ⚽)
- Change the text
- Use `${user.streak_count}` for streak number
- Use `${user.username}` for username

**Example:**
```typescript
subject: user.streak_count >= 2 
  ? `Your ${user.streak_count}-day streak is at risk!` 
  : `Daily YunoBall reminder for ${user.username}`,
```

---

### 2. Email Body - Header (Lines 125-127)

```typescript
<div style="background: linear-gradient(to bottom, #065f46, #047857); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
  <h1 style="color: white; margin: 0; font-size: 28px;">YunoBall</h1>
</div>
```

**Customize:**
- Change "YunoBall" to your app name
- Change colors: `#065f46` (dark green), `#047857` (lighter green)
- Change font size: `28px`

**Example:**
```typescript
<div style="background: linear-gradient(to bottom, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
  <h1 style="color: white; margin: 0; font-size: 32px;">🏈 YunoBall</h1>
</div>
```

---

### 3. Email Body - Greeting (Line 129)

```typescript
<h2 style="color: #065f46; margin-top: 0;">Hey ${user.username}!</h2>
```

**Customize:**
- Change "Hey" to "Hi", "Hello", etc.
- Change color: `#065f46` (green)

**Example:**
```typescript
<h2 style="color: #1e40af; margin-top: 0;">Hi ${user.username}! 👋</h2>
```

---

### 4. Email Body - Message for Users WITH Streak (Lines 130-132)

```typescript
${user.streak_count >= 2 
  ? `<p style="font-size: 18px;">You're on a <strong style="color: #dc2626;">${user.streak_count}-day perfect game streak</strong> 🔥</p>
     <p>Don't let it end! Play today to keep your streak alive.</p>`
```

**Customize:**
- Change the message text
- Change colors: `#dc2626` (red for streak)
- Change emoji: 🔥

**Example:**
```typescript
${user.streak_count >= 2 
  ? `<p style="font-size: 20px;">🔥 Amazing! You've got a <strong style="color: #dc2626;">${user.streak_count}-day streak</strong> going!</p>
     <p>One more perfect game today and you'll extend it to ${user.streak_count + 1} days. Don't miss out!</p>`
```

---

### 5. Email Body - Message for Users WITHOUT Streak (Lines 133-135)

```typescript
: `<p style="font-size: 18px;">Don't forget to play today's NFL trivia!</p>
   <p>Test your knowledge with 3 daily questions and compete on the leaderboard.</p>`
```

**Customize:**
- Change the message text
- Add more details about the game

**Example:**
```typescript
: `<p style="font-size: 18px;">Ready for today's challenge? 🏈</p>
   <p>Answer 3 NFL trivia questions and see how you stack up against other players!</p>
   <p>New questions every day. Can you get a perfect score?</p>`
```

---

### 6. Email Body - Button (Lines 136-138)

```typescript
<div style="text-align: center; margin: 30px 0;">
  <a href="${APP_URL}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Play Now →</a>
</div>
```

**Customize:**
- Change button text: "Play Now →"
- Change button color: `#10b981` (green)
- Change button size: `padding: 14px 28px`
- Change font size: `16px`

**Example:**
```typescript
<div style="text-align: center; margin: 30px 0;">
  <a href="${APP_URL}" style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">Start Playing 🏈</a>
</div>
```

---

### 7. Email Body - Footer (Lines 139-141)

```typescript
<p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
  This is an automated reminder. You can manage your email preferences in your account settings.
</p>
```

**Customize:**
- Change footer text
- Add unsubscribe link
- Change colors

**Example:**
```typescript
<p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
  This is an automated reminder from YunoBall.<br>
  <a href="${APP_URL}/settings" style="color: #3b82f6;">Manage email preferences</a> | 
  <a href="${APP_URL}/unsubscribe" style="color: #3b82f6;">Unsubscribe</a>
</p>
```

---

## After Editing

1. **Save the file** in Cursor
2. **Redeploy the Edge Function:**
   - **Supabase Dashboard:** Edge Functions → `send-streak-reminders` → **Redeploy**
   - **Or CLI:** `supabase functions deploy send-streak-reminders`
3. **Test it:**
   ```sql
   SELECT public.send_streak_reminders();
   ```
4. **Check your email** to see the changes

---

## Quick Tips

**Add images:**
```html
<img src="https://your-domain.com/logo.png" alt="Logo" style="max-width: 200px;">
```

**Add more sections:**
```html
<div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 6px;">
  <h3>Today's Leaderboard</h3>
  <p>See who's on top today!</p>
</div>
```

**Change colors:**
- Green: `#10b981`, `#065f46`
- Blue: `#3b82f6`, `#1e40af`
- Red: `#dc2626`, `#ef4444`
- Gray: `#6b7280`, `#9ca3af`

---

**Edit the file, redeploy, and test!** 🎨
