# Test Email Reminders

Run these steps to test your email reminder system.

---

## Step 1: Test the Function

In **Supabase SQL Editor**, run:

```sql
SELECT public.send_streak_reminders();
```

**What to expect:**
- Should return `void` (no error)
- Check the **Messages** tab below the editor - should show: "Reminder email request sent. Request ID: [number]"

---

## Step 2: Check Edge Function Logs

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Click **Logs** tab
3. Look for the most recent execution
4. Should show:
   - Status: Success (200)
   - Response: JSON with `sent`, `failed`, `message` fields
   - Example: `{"message": "Processed 5 users", "sent": 5, "failed": 0}`

**If you see errors:**
- Check the error message
- Common issues:
  - Missing secrets (`RESEND_API_KEY`, etc.)
  - Invalid Resend API key
  - Edge Function code errors

---

## Step 3: Check Resend Dashboard

1. Go to **resend.com** → **Emails** → **Logs**
2. Should see emails that were sent
3. Check status:
   - ✅ **Delivered** = Success!
   - ⏳ **Queued** = Being processed
   - ❌ **Bounced/Failed** = Check email address

---

## Step 4: Check Your Email

If you have a test account that:
- Hasn't played today
- Has an email address

Check that email inbox for the reminder!

---

## Expected Results

**If working correctly:**
- SQL function runs without error
- Edge Function logs show success
- Resend shows emails sent
- Emails arrive in inboxes

**If no users need reminders:**
- Edge Function returns: `{"message": "No users need reminders today"}`
- This is normal if all users have played today

---

## Troubleshooting

**401 Error?**
- Make sure you updated the SQL function with your **service_role** key
- Re-run the updated SQL function

**No emails sent?**
- Check Edge Function logs for errors
- Verify `RESEND_API_KEY` secret is set correctly
- Check Resend API key is valid

**Function not found?**
- Make sure Edge Function `send-streak-reminders` is deployed
- Check it shows "Active" status

---

**Run the test and check the logs!** 🧪
