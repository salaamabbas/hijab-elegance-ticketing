const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-writer');
const { Parser } = require('json2csv');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'hijab-elegance-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Simple file-based storage
console.log('🗃️  Using SQLite database for storage');

// Default admin password (hashed)
// Use environment variable for password, with a default for local development
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login authentication
app.post('/login', async (req, res) => {
    const { password } = req.body;
    
    if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid password' });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Guest page (accessible via QR code)
app.get('/guest/:ticketId', (req, res) => {
    try {
        const ticket = database.tickets.getById.get(req.params.ticketId);
        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }
        res.set({ 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
        res.sendFile(path.join(__dirname, 'public', 'guest.html'));
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API Routes

// Get single ticket (for guest page)
app.get('/api/ticket/:id', (req, res) => {
    try {
        const ticket = database.tickets.getById.get(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ticket' });
    }
});

// Get all tickets (admin only)
app.get('/api/tickets', requireAuth, (req, res) => {
    try {
        const tickets = database.tickets.getAll.all();
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get tickets' });
    }
});

// Create new ticket
app.post('/api/tickets', requireAuth, async (req, res) => {
    try {
        const { name, phone, amountPaid, customPrice, discountAmount, discountReason } = req.body;
        const standardPrice = 80000;
        const finalPrice = customPrice || standardPrice;
        const balance = Math.max(0, finalPrice - (amountPaid || 0));
        const id = uuidv4();

        const qrData = `https://${req.get('host')}/guest/${id}`;
        const qrCode = await QRCode.toDataURL(qrData);

        database.tickets.create.run(
            id, name, phone, 
            customPrice ? `Discounted UGX ${finalPrice.toLocaleString()}` : 'Standard UGX 80,000',
            standardPrice,
            customPrice || null,
            discountAmount || 0,
            discountReason || '',
            amountPaid || 0,
            balance,
            false, // checked_in
            qrCode
        );

        const newTicket = database.tickets.getById.get(id);
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Failed to create ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Update ticket
app.put('/api/tickets/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, amountPaid, customPrice, discountAmount, discountReason, checkedIn } = req.body;

        const existingTicket = database.tickets.getById.get(id);
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const standardPrice = 80000;
        const finalPrice = customPrice || standardPrice;
        const balance = Math.max(0, finalPrice - (amountPaid || 0));

        database.tickets.update.run(
            name, phone,
            customPrice ? `Discounted UGX ${finalPrice.toLocaleString()}` : 'Standard UGX 80,000',
            customPrice || null,
            discountAmount || 0,
            discountReason || '',
            amountPaid || 0,
            balance,
            checkedIn !== undefined ? checkedIn : existingTicket.checked_in,
            id
        );

        const updatedTicket = database.tickets.getById.get(id);
        res.json(updatedTicket);
    } catch (error) {
        console.error('Failed to update ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// Check-in ticket
app.put('/api/tickets/:id/checkin', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { checkedIn } = req.body;
        
        const ticket = database.tickets.getById.get(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        database.tickets.checkIn.run(id);
        const updatedTicket = database.tickets.getById.get(id);
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check in ticket' });
    }
});

// Delete ticket
app.delete('/api/tickets/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const result = database.tickets.delete.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// Expenses API
app.get('/api/expenses', requireAuth, (req, res) => {
    try {
        const expenses = database.expenses.getAll.all();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get expenses' });
    }
});

app.post('/api/expenses', requireAuth, (req, res) => {
    try {
        const { category, description, amount, date, notes } = req.body;
        const id = uuidv4();
        database.expenses.create.run(id, category, description, amount, date, notes || '');
        const newExpense = database.expenses.getById.get(id);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

app.put('/api/expenses/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { category, description, amount, date, notes } = req.body;
        const result = database.expenses.update.run(category, description, amount, date, notes || '', id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        const updatedExpense = database.expenses.getById.get(id);
        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

app.delete('/api/expenses/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const result = database.expenses.delete.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Sponsorships API
app.get('/api/sponsorships', requireAuth, (req, res) => {
    try {
        const sponsorships = database.sponsorships.getAll.all();
        res.json(sponsorships);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sponsorships' });
    }
});

app.post('/api/sponsorships', requireAuth, (req, res) => {
    try {
        const { name, amount, contact, notes } = req.body;
        const id = uuidv4();
        database.sponsorships.create.run(id, name, amount, contact || '', notes || '');
        const newSponsorship = database.sponsorships.getById.get(id);
        res.status(201).json(newSponsorship);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create sponsorship' });
    }
});

app.put('/api/sponsorships/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount, contact, notes } = req.body;
        const result = database.sponsorships.update.run(name, amount, contact || '', notes || '', id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Sponsorship not found' });
        }
        const updatedSponsorship = database.sponsorships.getById.get(id);
        res.json(updatedSponsorship);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update sponsorship' });
    }
});

app.delete('/api/sponsorships/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const result = database.sponsorships.delete.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Sponsorship not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete sponsorship' });
    }
});

// Financial summary
app.get('/api/financial-summary', requireAuth, (req, res) => {
    try {
        const summary = database.financial.getSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get financial summary' });
    }
});

// Export data
app.get('/api/export/:type', requireAuth, (req, res) => {
    const type = req.params.type;
    
    try {
        let data, filename;
        const tickets = database.tickets.getAll.all();
        const expenses = database.expenses.getAll.all();
        const sponsorships = database.sponsorships.getAll.all();

        switch (type) {
            case 'tickets':
                data = tickets.map(ticket => ({
                    Name: ticket.name,
                    Phone: ticket.phone,
                    'Ticket Type': ticket.ticket_type,
                    'Amount Paid': ticket.amount_paid,
                    Balance: ticket.balance,
                    'Checked In': ticket.checked_in ? 'Yes' : 'No',
                    'Created At': ticket.created_at
                }));
                filename = 'tickets_export.csv';
                break;
                
            case 'financial':
                 const summary = database.financial.getSummary();
                data = [{
                    'Total Ticket Revenue': summary.totalRevenue,
                    'Total Sponsorships': summary.totalSponsorships,
                    'Total Expenses': summary.totalExpenses,
                    'Profit': summary.profit
                }];
                filename = 'financial_summary.csv';
                break;
                
            case 'attendance':
                data = tickets.filter(t => t.checked_in).map(ticket => ({
                    Name: ticket.name,
                    Phone: ticket.phone,
                    'Checked In At': ticket.checkedInAt // This field doesn't exist in the DB schema
                }));
                filename = 'attendance_report.csv';
                break;
                
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }
        
        const parser = new Parser();
        const csv = parser.parse(data);
        
        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        res.send(csv);
    } catch (error) {
        console.error('Failed to export data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Root redirect
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎟️ Hijab Elegance Ticketing System running on port ${PORT}`);
    console.log(`📱 Access at: http://localhost:${PORT}`);
    console.log(`🔐 Default admin password: admin123 (change this in production!)`);
});

module.exports = app;
