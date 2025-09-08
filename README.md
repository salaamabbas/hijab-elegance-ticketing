# 🌟 Hijab Elegance Picnic - Ticketing System

A comprehensive private ticketing and event management system for **Salaam Safaris — Hijab Elegance Picnic 2025**. This system provides secure ticket management, QR code generation, financial tracking, SMS notifications, and guest check-in functionality.

## ✨ Features

### 🎟️ **Ticket Management**
- Generate unique QR codes for each ticket
- Track payments and balances in real-time
- PDF ticket generation with professional layout
- Guest information management
- Check-in system for event day

### 💰 **Financial Management**
- Revenue tracking (ticket sales + sponsorships)
- Expense management with categories
- Sponsorship tracking
- Profit calculation
- Money available reporting

### 📱 **SMS Notifications**
- Automated balance reminders
- Custom SMS messaging
- Event updates and announcements
- SMS delivery logs and tracking
- Integration with BlueSMS Uganda API

### 📊 **Reporting & Analytics**
- Financial summary dashboard
- Ticket sales reports
- Attendance tracking
- Export to CSV/Excel format
- Real-time statistics

### 🔐 **Security Features**
- Password-protected admin dashboard
- Guest pages accessible only via QR codes
- Secure session management
- Read-only guest access

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd hijab-elegance-ticketing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the system**
   - Open your browser and go to: `http://localhost:3000`
   - Default admin password: `admin123` (change this immediately!)

## 📱 System Usage

### Admin Dashboard Access
1. Navigate to `http://localhost:3000`
2. Enter the admin password
3. Access the full dashboard with all management features

### Guest Access
- Guests can only access their ticket information by scanning the QR code
- Each QR code links to a unique, secure guest page
- Guest pages are mobile-optimized and update in real-time

## 🎟️ Ticket Workflow

1. **Create Ticket**: Add guest information and initial payment
2. **Generate QR & PDF**: System automatically creates QR code and PDF ticket
3. **Track Payments**: Update payment amounts and balances
4. **Send Reminders**: Automated SMS reminders for outstanding balances
5. **Event Day Check-in**: Scan QR codes or search guests for check-in
6. **Generate Reports**: Export attendance and financial reports

## 💳 Financial Management

### Revenue Sources
- **Ticket Sales**: UGX 80,000 per standard ticket
- **Sponsorships**: Track sponsor contributions separately

### Expense Categories
- Food & Catering
- Transportation
- Venue
- Entertainment
- Decorations
- Marketing
- Equipment
- Other

### Financial Calculations
- **Total Revenue** = Ticket Payments + Sponsorships
- **Profit** = Total Revenue - Total Expenses
- **Money Available** = Collected Payments + Sponsorships - Expenses Paid

## 📱 SMS Integration

The system integrates with **BlueSMS Uganda** for automated notifications:

### SMS Features
- **Balance Reminders**: Automated messages to guests with outstanding balances
- **Custom Messages**: Send personalized messages to individual guests
- **Event Updates**: Broadcast important announcements
- **Delivery Tracking**: Monitor SMS delivery status and logs

### SMS Configuration
The system is pre-configured with BlueSMS Uganda API:
- **API Endpoint**: `http://bluesmsuganda.com/api-sub.php`
- **Sender ID**: `SalaamSafaris`
- **Username**: `abdulsalaamabbas`
- **Password**: `SSSBNTSaba7`

## 🎨 PDF Ticket Layout

Each generated PDF ticket includes:
- Event branding and organizer information
- Guest name and contact details
- Ticket type and pricing information
- Payment status and balance
- QR code for easy scanning
- Refund policy notice
- Professional formatting

## 📊 Reporting Features

### Available Reports
1. **Ticket Sales Report**: Complete list of all tickets with payment status
2. **Financial Summary**: Revenue, expenses, profit, and money available
3. **Attendance Report**: List of checked-in guests with timestamps

### Export Formats
- CSV files for Excel compatibility
- Automatic filename generation with dates
- One-click download functionality

## 🔧 System Configuration

### Default Settings
- **Ticket Price**: UGX 80,000 (Standard)
- **Admin Password**: `admin123` (⚠️ Change immediately!)
- **Session Timeout**: 24 hours
- **Auto-refresh**: Every 30 seconds
- **SMS Character Limit**: 160 characters

### Security Settings
- Password-protected admin access
- Session-based authentication
- QR code-only guest access
- No guest editing capabilities

## 📱 Mobile Responsiveness

The system is fully mobile-responsive:
- **Admin Dashboard**: Optimized for tablets and mobile devices
- **Guest Pages**: Mobile-first design for easy QR code access
- **Touch-friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized for mobile networks

## 🛠️ Technical Details

### Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **QR Codes**: qrcode library
- **PDF Generation**: jsPDF
- **SMS API**: BlueSMS Uganda
- **Data Storage**: In-memory (JSON) - easily upgradeable to database
- **Session Management**: express-session
- **Security**: bcryptjs for password hashing

### File Structure
```
hijab-elegance-ticketing/
├── server.js              # Main server application
├── package.json           # Dependencies and scripts
├── README.md             # This documentation
└── public/               # Frontend files
    ├── login.html        # Admin login page
    ├── dashboard.html    # Admin dashboard
    ├── guest.html        # Guest ticket page
    ├── styles.css        # All styling
    └── dashboard.js      # Dashboard functionality
```

## 🔄 Data Management

### Current Storage
- **In-Memory Storage**: All data stored in server memory
- **Session Persistence**: Data persists during server runtime
- **Export Capability**: Data can be exported to CSV files

### Production Recommendations
For production deployment, consider upgrading to:
- **Database**: MongoDB, PostgreSQL, or MySQL
- **File Storage**: Cloud storage for PDF tickets
- **Backup System**: Regular data backups
- **SSL Certificate**: HTTPS encryption

## 🚨 Important Policies

### Refund Policy
- **No Refunds**: Money is not refunded under any circumstances
- **Clear Communication**: Policy displayed on all tickets and guest pages
- **Legal Protection**: Policy protects organizer from refund requests

### Data Privacy
- **Minimal Data**: Only essential information collected
- **Secure Storage**: Data protected with proper authentication
- **Guest Privacy**: Guests can only access their own information

## 🎯 Event Day Operations

### Check-in Process
1. **QR Code Scanning**: Fastest method for guest verification
2. **Manual Search**: Search by name or phone number
3. **Real-time Updates**: Instant check-in status updates
4. **Attendance Tracking**: Automatic attendance logging

### Staff Training
- **Admin Access**: Train staff on dashboard navigation
- **Check-in Process**: Practice QR scanning and manual search
- **Issue Resolution**: Handle payment discrepancies and guest questions
- **Report Generation**: End-of-event reporting procedures

## 🔧 Troubleshooting

### Common Issues

**Login Problems**
- Verify admin password (default: `admin123`)
- Clear browser cache and cookies
- Check server is running on correct port

**QR Code Issues**
- Ensure guests have internet connection
- Verify QR code is not damaged or blurred
- Use manual search as backup method

**SMS Delivery Problems**
- Check BlueSMS account balance
- Verify phone numbers are in correct format
- Monitor SMS logs for delivery status

**PDF Generation Issues**
- Ensure modern browser with JavaScript enabled
- Check popup blockers are disabled
- Try different browser if issues persist

### Support Contacts
- **Technical Issues**: Contact system administrator
- **SMS Problems**: Contact BlueSMS Uganda support
- **Event Questions**: Contact Salaam Safaris team

## 📈 Future Enhancements

### Potential Upgrades
- **Database Integration**: PostgreSQL or MongoDB
- **Mobile App**: Native iOS/Android applications
- **Payment Gateway**: Online payment processing
- **Advanced Analytics**: Detailed reporting and insights
- **Multi-Event Support**: Handle multiple events simultaneously
- **Email Notifications**: Complement SMS with email alerts

## 📄 License & Credits

**Developed for**: Salaam Safaris - Hijab Elegance Picnic 2025  
**Tagline**: "Travel with Peace" ✨  
**System Version**: 1.0.0  
**Last Updated**: January 2025  

---

## 🆘 Quick Reference

### Default Credentials
- **Admin Password**: `admin123`
- **Server Port**: `3000`
- **Access URL**: `http://localhost:3000`

### Key Commands
```bash
npm install          # Install dependencies
npm start           # Start production server
npm run dev         # Start development server (with nodemon)
```

### Important URLs
- **Admin Login**: `/login`
- **Dashboard**: `/dashboard`
- **Guest Page**: `/guest/{ticketId}`
- **API Base**: `/api/`

---

**🌟 Welcome to Hijab Elegance Picnic 2025 - Travel with Peace! ✨**
