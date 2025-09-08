# 🧪 Hijab Elegance Ticketing System - Testing Guide

## 📋 Pre-Testing Setup

### Step 1: Install Node.js
1. **Download Node.js**: Go to [https://nodejs.org](https://nodejs.org)
2. **Download LTS version** (recommended for stability)
3. **Run installer** and follow setup instructions
4. **Verify installation**: Open Command Prompt and run:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies
```bash
cd c:\Users\Hi\Desktop\hijab-elegance-ticketing
npm install
```

### Step 3: Start the Server
```bash
npm start
```
The system should start on: `http://localhost:3000`

## 🔍 Comprehensive Testing Checklist

### ✅ **Test 1: System Startup**
- [ ] Server starts without errors
- [ ] Console shows: "🎟️ Hijab Elegance Ticketing System running on port 3000"
- [ ] Browser can access `http://localhost:3000`
- [ ] Redirects to login page automatically

### ✅ **Test 2: Login Functionality**
**Test Case 2.1: Valid Login**
- [ ] Navigate to `http://localhost:3000`
- [ ] Enter password: `admin123`
- [ ] Click "Access Dashboard"
- [ ] Should redirect to dashboard successfully
- [ ] Professional design loads correctly

**Test Case 2.2: Invalid Login**
- [ ] Enter wrong password
- [ ] Should show error message
- [ ] Should not redirect to dashboard

### ✅ **Test 3: Dashboard Interface**
- [ ] Header shows "Salaam Safaris" branding
- [ ] Navigation tabs are visible and functional
- [ ] Financial summary cards display (all showing 0 initially)
- [ ] Professional styling loads correctly

### ✅ **Test 4: Ticket Management**
**Test Case 4.1: Create New Ticket**
- [ ] Click "Add New Ticket" button
- [ ] Modal opens with form fields
- [ ] Fill in test data:
  - Name: "Fatima Ahmed"
  - Phone: "0756549534"
  - Amount Paid: "20000"
- [ ] Click "Save Ticket"
- [ ] Ticket appears in tickets list
- [ ] QR code is generated automatically
- [ ] Balance shows: UGX 60,000 (80,000 - 20,000)

**Test Case 4.2: Edit Ticket**
- [ ] Click "Edit" on existing ticket
- [ ] Update amount paid to "50000"
- [ ] Save changes
- [ ] Balance updates to UGX 30,000

**Test Case 4.3: Generate PDF**
- [ ] Click "PDF" button on ticket
- [ ] PDF downloads successfully
- [ ] PDF contains all ticket information
- [ ] QR code is visible in PDF

**Test Case 4.4: View QR Code**
- [ ] Click "QR Code" button
- [ ] New window opens with QR code
- [ ] QR code is clear and scannable

### ✅ **Test 5: Guest Page Access**
**Test Case 5.1: QR Code Access**
- [ ] Copy the guest URL from a ticket (format: `/guest/{ticketId}`)
- [ ] Open URL in new browser tab/window
- [ ] Guest page loads with professional design
- [ ] Ticket information displays correctly
- [ ] Balance and payment status show correctly
- [ ] Refund policy is clearly visible

**Test Case 5.2: Real-time Updates**
- [ ] Keep guest page open
- [ ] In admin dashboard, update ticket payment
- [ ] Guest page should update automatically (30-second refresh)

### ✅ **Test 6: Financial Management**
**Test Case 6.1: Add Expense**
- [ ] Go to Financial tab
- [ ] Click "Add Expense"
- [ ] Fill in test data:
  - Category: "Food & Catering"
  - Description: "Lunch catering deposit"
  - Amount: "500000"
  - Date: Today's date
- [ ] Save expense
- [ ] Expense appears in list
- [ ] Financial summary updates

**Test Case 6.2: Add Sponsorship**
- [ ] Click "Add Sponsorship"
- [ ] Fill in test data:
  - Name: "ABC Company"
  - Amount: "1000000"
  - Date: Today's date
  - Notes: "Gold sponsor"
- [ ] Save sponsorship
- [ ] Sponsorship appears in list
- [ ] Financial summary updates

**Test Case 6.3: Financial Calculations**
- [ ] Verify Total Revenue = Ticket Payments + Sponsorships
- [ ] Verify Profit = Total Revenue - Total Expenses
- [ ] Verify Money Available calculation is correct

### ✅ **Test 7: SMS Functionality**
**Test Case 7.1: Custom SMS** (Note: Requires internet connection)
- [ ] Go to SMS tab
- [ ] Click "Send Custom SMS"
- [ ] Enter test phone number (use your own for testing)
- [ ] Enter test message
- [ ] Send SMS
- [ ] Check SMS logs for delivery status

**Test Case 7.2: Balance Reminders**
- [ ] Ensure you have tickets with outstanding balances
- [ ] Click "Send Balance Reminders"
- [ ] Confirm sending
- [ ] Check SMS logs for batch sending results

### ✅ **Test 8: Check-in System**
**Test Case 8.1: Search Functionality**
- [ ] Go to Check-in tab
- [ ] Search by guest name
- [ ] Results should appear
- [ ] Search by phone number
- [ ] Results should appear

**Test Case 8.2: Check-in Process**
- [ ] Find a guest in search results
- [ ] Click "Check In" button
- [ ] Status should update to "Checked In"
- [ ] Timestamp should be recorded

### ✅ **Test 9: Export Functionality**
**Test Case 9.1: Export Tickets**
- [ ] Go to Reports tab
- [ ] Click "Export Tickets"
- [ ] CSV file should download
- [ ] Open CSV and verify data is correct

**Test Case 9.2: Export Financial Summary**
- [ ] Click "Export Financial Summary"
- [ ] CSV file should download
- [ ] Verify financial calculations in export

**Test Case 9.3: Export Attendance**
- [ ] Click "Export Attendance"
- [ ] CSV file should download
- [ ] Only checked-in guests should appear

### ✅ **Test 10: Mobile Responsiveness**
- [ ] Open system on mobile device or use browser dev tools
- [ ] Test login page on mobile
- [ ] Test dashboard navigation on mobile
- [ ] Test guest page on mobile
- [ ] Verify all elements are touch-friendly

## 🎯 **Sample Test Data**

### Sample Tickets
```
1. Name: "Aisha Mohammed", Phone: "0701234567", Amount Paid: 80000 (Full Payment)
2. Name: "Fatima Ahmed", Phone: "0756549534", Amount Paid: 20000 (Partial Payment)
3. Name: "Zainab Hassan", Phone: "0772345678", Amount Paid: 50000 (Partial Payment)
4. Name: "Mariam Ali", Phone: "0783456789", Amount Paid: 0 (No Payment)
```

### Sample Expenses
```
1. Category: "Food & Catering", Description: "Main meal catering", Amount: 2000000
2. Category: "Transportation", Description: "Bus rental", Amount: 500000
3. Category: "Venue", Description: "Venue booking fee", Amount: 1000000
4. Category: "Entertainment", Description: "Sound system rental", Amount: 300000
```

### Sample Sponsorships
```
1. Name: "ABC Bank", Amount: 2000000, Notes: "Platinum sponsor"
2. Name: "XYZ Company", Amount: 1000000, Notes: "Gold sponsor"
3. Name: "Local Business", Amount: 500000, Notes: "Silver sponsor"
```

## 🚨 **Common Issues & Solutions**

### Issue 1: Server Won't Start
**Symptoms**: Error messages when running `npm start`
**Solutions**:
- Ensure Node.js is properly installed
- Run `npm install` to install dependencies
- Check if port 3000 is already in use

### Issue 2: QR Codes Not Generating
**Symptoms**: QR code field shows null or empty
**Solutions**:
- Ensure internet connection for QR code library
- Check browser console for JavaScript errors
- Verify the qrcode library is loaded

### Issue 3: SMS Not Sending
**Symptoms**: SMS status shows "failed"
**Solutions**:
- Check internet connection
- Verify BlueSMS account has sufficient balance
- Ensure phone numbers are in correct format (07xxxxxxxx)

### Issue 4: PDF Generation Fails
**Symptoms**: PDF button doesn't work or shows errors
**Solutions**:
- Ensure jsPDF library is loaded correctly
- Check browser allows pop-ups and downloads
- Try different browser if issues persist

## 📊 **Expected Results After Testing**

After completing all tests with sample data:
- **Total Revenue**: ~UGX 6,650,000 (tickets + sponsorships)
- **Total Expenses**: ~UGX 3,800,000
- **Profit**: ~UGX 2,850,000
- **Tickets**: 4 sample tickets created
- **Check-ins**: At least 2 guests checked in
- **SMS Logs**: Multiple SMS entries with delivery status

## 🎉 **Testing Complete!**

Once all tests pass, your Hijab Elegance Ticketing System is ready for production use. Remember to:
1. Change the default admin password from `admin123`
2. Set up proper backup procedures
3. Monitor SMS usage and costs
4. Train staff on system usage

---

**🌟 Happy Testing! - Salaam Safaris Team**
