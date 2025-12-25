# Real-Time Update Diagnostic

## ✅ Backend Status
- Backend: http://127.0.0.1:8000 (OK)
- Python Face Service: http://127.0.0.1:7000 (OK - 5 faces loaded)
- WebSocket: ws://127.0.0.1:8000/ws/events (accepts connections)

## ✅ Database Status
- Students: 105 total
- Sample student: `anjaneyulu` (class B)
- Latest attendance event written successfully

## ✅ API Test
Tested `/api/simulate-checkin` with student `anjaneyulu`:
- Response: `{"success": true, "status": "present"}`
- DB write confirmed
- Broadcast presence called

## 🔍 What to Check in Browser

### 1. Open DevTools Console (F12)
Visit: http://localhost:5173

You should see:
```
[INFO] WebSocket client connected
```

### 2. Check WebSocket Connection
In DevTools → Network → WS tab:
- Should show connection to: `ws://localhost:8000/ws/events`
- Status: `101 Switching Protocols`

### 3. Trigger a Test Event
Open another terminal and run:
```powershell
Invoke-RestMethod "http://127.0.0.1:8000/api/simulate-checkin" -Method POST -Body '{"student_id":"anjaneyulu","status":"present"}' -ContentType 'application/json'
```

In the browser console, you should see:
- A `presence_event` fired
- Store updated
- UI refreshed

### 4. Check Portal Page
- Navigate to: http://localhost:5173/attendance
- Select branch → section (class B)
- You should see `anjaneyulu` with status "PRESENT"

## 🐛 If Portal Still Shows "Absent"

The issue is likely one of these:

1. **Wrong class/date filter**: Portal might be viewing a different class or date
2. **Hard refresh needed**: Press Ctrl+Shift+R to clear cache
3. **WS not connecting**: Check browser console for WebSocket errors
4. **Store not hydrating**: The Zustand store might not be calling the API

## 🔧 Quick Fix Command

Run this in PowerShell to trigger an event and verify WS:
```powershell
# Trigger 3 events in a row
1..3 | ForEach-Object { 
  Invoke-RestMethod "http://127.0.0.1:8000/api/simulate-checkin" -Method POST -Body '{"student_id":"anjaneyulu","status":"present"}' -ContentType 'application/json' | Out-Null
  Start-Sleep -Milliseconds 500
}
```

You should see the portal update 3 times (instant optimistic updates + debounced refetch).
