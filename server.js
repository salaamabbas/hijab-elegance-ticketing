const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { Parser } = require('json2csv');
const { db, setupSchema } = require('./database');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    store: new pgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET || 'hijab-elegance-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
}));

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
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.post('/login', (req, res) => {
    if (bcrypt.compareSync(req.body.password, ADMIN_PASSWORD_HASH)) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid password' });
    }
});
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});
app.get('/dashboard', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/guest/:ticketId', (req, res) => res.sendFile(path.join(__dirname, 'public', 'guest.html')));

// API Routes
app.get('/api/ticket/:id', async (req, res) => {
    try {
        const ticket = await db('tickets').where({ id: req.params.id }).first();
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ticket' });
    }
});

app.get('/api/tickets', requireAuth, async (req, res) => {
    try {
        const tickets = await db('tickets').select('*').orderBy('created_at', 'desc');
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get tickets' });
    }
});

app.post('/api/tickets', requireAuth, async (req, res) => {
    try {
        const { name, phone, amountPaid, customPrice, discountAmount, discountReason } = req.body;
        const standardPrice = 80000;
        const finalPrice = customPrice != null ? parseFloat(customPrice) : standardPrice;
        const newTicket = {
            id: uuidv4(),
            name,
            phone,
            ticket_type: customPrice != null ? `Discounted UGX ${finalPrice.toLocaleString()}` : 'Standard UGX 80,000',
            standard_price: standardPrice,
            custom_price: customPrice != null ? finalPrice : null,
            discount_amount: discountAmount || 0,
            discount_reason: discountReason || '',
            amount_paid: amountPaid || 0,
            balance: Math.max(0, finalPrice - (amountPaid || 0)),
            checked_in: false,
        };
        newTicket.qr_code = await QRCode.toDataURL(`https://${req.get('host')}/guest/${newTicket.id}`);
        
        const [insertedTicket] = await db('tickets').insert(newTicket).returning('*');
        res.status(201).json(insertedTicket);
    } catch (error) {
        console.error('Failed to create ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

app.put('/api/tickets/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, amountPaid, customPrice, discountAmount, discountReason, checkedIn } = req.body;

        const existingTicket = await db('tickets').where({ id }).first();
        if (!existingTicket) return res.status(404).json({ error: 'Ticket not found' });

        const standardPrice = 80000;
        const finalPrice = customPrice != null ? parseFloat(customPrice) : standardPrice;
        const updatedData = {
            name,
            phone,
            ticket_type: customPrice != null ? `Discounted UGX ${finalPrice.toLocaleString()}` : 'Standard UGX 80,000',
            custom_price: customPrice != null ? finalPrice : null,
            discount_amount: discountAmount || 0,
            discount_reason: discountReason || '',
            amount_paid: amountPaid || 0,
            balance: Math.max(0, finalPrice - (amountPaid || 0)),
            checked_in: checkedIn !== undefined ? checkedIn : existingTicket.checked_in,
        };

        const [updatedTicket] = await db('tickets').where({ id }).update(updatedData).returning('*');
        res.json(updatedTicket);
    } catch (error) {
        console.error('Failed to update ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

app.delete('/api/tickets/:id', requireAuth, async (req, res) => {
    try {
        const count = await db('tickets').where({ id: req.params.id }).del();
        if (count === 0) return res.status(404).json({ error: 'Ticket not found' });
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// Expenses API
app.get('/api/expenses', requireAuth, async (req, res) => res.json(await db('expenses').orderBy('date', 'desc')));
app.post('/api/expenses', requireAuth, async (req, res) => {
    const { category, description, amount, date, notes } = req.body;
    const [newExpense] = await db('expenses').insert({ id: uuidv4(), category, description, amount, date, notes: notes || '' }).returning('*');
    res.status(201).json(newExpense);
});
app.put('/api/expenses/:id', requireAuth, async (req, res) => {
    const { category, description, amount, date, notes } = req.body;
    const [updated] = await db('expenses').where({ id: req.params.id }).update({ category, description, amount, date, notes: notes || '' }).returning('*');
    res.json(updated);
});
app.delete('/api/expenses/:id', requireAuth, async (req, res) => {
    await db('expenses').where({ id: req.params.id }).del();
    res.json({ success: true });
});

// Sponsorships API
app.get('/api/sponsorships', requireAuth, async (req, res) => res.json(await db('sponsorships').orderBy('created_at', 'desc')));
app.post('/api/sponsorships', requireAuth, async (req, res) => {
    const { name, amount, contact, notes } = req.body;
    const [newSponsorship] = await db('sponsorships').insert({ id: uuidv4(), name, amount, contact: contact || '', notes: notes || '' }).returning('*');
    res.status(201).json(newSponsorship);
});
app.put('/api/sponsorships/:id', requireAuth, async (req, res) => {
    const { name, amount, contact, notes } = req.body;
    const [updated] = await db('sponsorships').where({ id: req.params.id }).update({ name, amount, contact: contact || '', notes: notes || '' }).returning('*');
    res.json(updated);
});
app.delete('/api/sponsorships/:id', requireAuth, async (req, res) => {
    await db('sponsorships').where({ id: req.params.id }).del();
    res.json({ success: true });
});

// Financial Summary API
app.get('/api/financial-summary', requireAuth, async (req, res) => {
    try {
        const [revenue] = await db('tickets').sum('amount_paid as total');
        const [sponsorships] = await db('sponsorships').sum('amount as total');
        const [expenses] = await db('expenses').sum('amount as total');
        const [ticketCount] = await db('tickets').count('id as count');
        const [checkedInCount] = await db('tickets').where({ checked_in: true }).count('id as count');

        const totalRevenue = parseFloat(revenue.total) || 0;
        const totalSponsorships = parseFloat(sponsorships.total) || 0;
        const totalExpenses = parseFloat(expenses.total) || 0;

        res.json({
            totalRevenue,
            totalSponsorships,
            totalExpenses,
            profit: (totalRevenue + totalSponsorships) - totalExpenses,
            moneyAvailable: totalRevenue + totalSponsorships,
            ticketCount: parseInt(ticketCount.count, 10),
            checkedInCount: parseInt(checkedInCount.count, 10)
        });
    } catch (error) {
        console.error('Failed to get financial summary:', error);
        res.status(500).json({ error: 'Failed to get financial summary' });
    }
});

// Export data API
app.get('/api/export/:type', requireAuth, async (req, res) => {
    try {
        const { type } = req.params;
        let data, filename;

        if (type === 'tickets') {
            data = await db('tickets').select('name', 'phone', 'ticket_type', 'amount_paid', 'balance', 'checked_in', 'created_at').orderBy('created_at', 'desc');
            filename = 'tickets_export.csv';
        } else {
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

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Start server after ensuring DB schema is ready
async function startServer() {
    await setupSchema();
    app.listen(PORT, () => {
        console.log(`🎟️  Hijab Elegance Ticketing System running on port ${PORT}`);
    });
}

startServer();

module.exports = app;
