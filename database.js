const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dbDir, 'hijab-elegance.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
    // Tickets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            ticket_type TEXT DEFAULT 'Standard UGX 80,000',
            ticket_price INTEGER DEFAULT 80000,
            custom_price INTEGER,
            discount_amount INTEGER DEFAULT 0,
            discount_reason TEXT,
            amount_paid INTEGER DEFAULT 0,
            balance INTEGER DEFAULT 0,
            checked_in BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            qr_code TEXT
        )
    `);

    // Expenses table
    db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount INTEGER NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sponsorships table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sponsorships (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            contact TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database tables created successfully');
};

// Initialize database
createTables();

// Ticket operations
const ticketOperations = {
    // Get all tickets
    getAll: db.prepare('SELECT * FROM tickets ORDER BY created_at DESC'),
    
    // Get ticket by ID
    getById: db.prepare('SELECT * FROM tickets WHERE id = ?'),
    
    // Create new ticket
    create: db.prepare(`
        INSERT INTO tickets (
            id, name, phone, ticket_type, ticket_price, custom_price, 
            discount_amount, discount_reason, amount_paid, balance, 
            checked_in, qr_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    
    // Update ticket
    update: db.prepare(`
        UPDATE tickets SET 
            name = ?, phone = ?, ticket_type = ?, custom_price = ?,
            discount_amount = ?, discount_reason = ?, amount_paid = ?, 
            balance = ?, checked_in = ?
        WHERE id = ?
    `),
    
    // Check in ticket
    checkIn: db.prepare('UPDATE tickets SET checked_in = TRUE WHERE id = ?'),
    
    // Delete ticket
    delete: db.prepare('DELETE FROM tickets WHERE id = ?'),
    
    // Get tickets with balance
    getWithBalance: db.prepare('SELECT * FROM tickets WHERE balance > 0'),
    
    // Get checked in count
    getCheckedInCount: db.prepare('SELECT COUNT(*) as count FROM tickets WHERE checked_in = TRUE'),
    
    // Get total count
    getTotalCount: db.prepare('SELECT COUNT(*) as count FROM tickets')
};

// Expense operations
const expenseOperations = {
    // Get all expenses
    getAll: db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC'),
    
    // Get expense by ID
    getById: db.prepare('SELECT * FROM expenses WHERE id = ?'),
    
    // Create new expense
    create: db.prepare(`
        INSERT INTO expenses (id, category, description, amount, date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `),
    
    // Update expense
    update: db.prepare(`
        UPDATE expenses SET 
            category = ?, description = ?, amount = ?, date = ?, notes = ?
        WHERE id = ?
    `),
    
    // Delete expense
    delete: db.prepare('DELETE FROM expenses WHERE id = ?'),
    
    // Get total expenses
    getTotalAmount: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses')
};

// Sponsorship operations
const sponsorshipOperations = {
    // Get all sponsorships
    getAll: db.prepare('SELECT * FROM sponsorships ORDER BY created_at DESC'),
    
    // Get sponsorship by ID
    getById: db.prepare('SELECT * FROM sponsorships WHERE id = ?'),
    
    // Create new sponsorship
    create: db.prepare(`
        INSERT INTO sponsorships (id, name, amount, contact, notes)
        VALUES (?, ?, ?, ?, ?)
    `),
    
    // Update sponsorship
    update: db.prepare(`
        UPDATE sponsorships SET 
            name = ?, amount = ?, contact = ?, notes = ?
        WHERE id = ?
    `),
    
    // Delete sponsorship
    delete: db.prepare('DELETE FROM sponsorships WHERE id = ?'),
    
    // Get total sponsorships
    getTotalAmount: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM sponsorships')
};

// Financial summary operations
const financialOperations = {
    getSummary: () => {
        const totalRevenue = db.prepare('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tickets').get().total;
        const totalExpenses = expenseOperations.getTotalAmount.get().total;
        const totalSponsorships = sponsorshipOperations.getTotalAmount.get().total;
        const ticketCount = ticketOperations.getTotalCount.get().count;
        const checkedInCount = ticketOperations.getCheckedInCount.get().count;
        
        const profit = totalRevenue - totalExpenses;
        const moneyAvailable = totalRevenue + totalSponsorships - totalExpenses;
        
        return {
            totalRevenue,
            totalExpenses,
            totalSponsorships,
            profit,
            moneyAvailable,
            ticketCount,
            checkedInCount
        };
    }
};

// Backup operations
const backupOperations = {
    // Create backup
    createBackup: () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(dbDir, `backup-${timestamp}.db`);
        
        try {
            fs.copyFileSync(dbPath, backupPath);
            console.log(`✅ Backup created: ${backupPath}`);
            return backupPath;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            throw error;
        }
    },
    
    // List backups
    listBackups: () => {
        try {
            const files = fs.readdirSync(dbDir);
            return files
                .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
                .map(file => ({
                    filename: file,
                    path: path.join(dbDir, file),
                    created: fs.statSync(path.join(dbDir, file)).birthtime
                }))
                .sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('❌ Failed to list backups:', error);
            return [];
        }
    }
};

// Migration from in-memory data
const migrationOperations = {
    // Import data from arrays (for migration)
    importFromMemory: (tickets, expenses, sponsorships) => {
        const transaction = db.transaction(() => {
            // Import tickets
            for (const ticket of tickets) {
                ticketOperations.create.run(
                    ticket.id,
                    ticket.name,
                    ticket.phone,
                    ticket.ticketType || 'Standard UGX 80,000',
                    ticket.ticketPrice || 80000,
                    ticket.customPrice || null,
                    ticket.discountAmount || 0,
                    ticket.discountReason || '',
                    ticket.amountPaid || 0,
                    ticket.balance || 0,
                    ticket.checkedIn || false,
                    ticket.qrCode || null
                );
            }
            
            // Import expenses
            for (const expense of expenses) {
                expenseOperations.create.run(
                    expense.id,
                    expense.category,
                    expense.description,
                    expense.amount,
                    expense.date,
                    expense.notes || ''
                );
            }
            
            // Import sponsorships
            for (const sponsorship of sponsorships) {
                sponsorshipOperations.create.run(
                    sponsorship.id,
                    sponsorship.name,
                    sponsorship.amount,
                    sponsorship.contact || '',
                    sponsorship.notes || ''
                );
            }
        });
        
        transaction();
        console.log('✅ Data migration completed successfully');
    }
};

// Export database operations
module.exports = {
    db,
    tickets: ticketOperations,
    expenses: expenseOperations,
    sponsorships: sponsorshipOperations,
    financial: financialOperations,
    backup: backupOperations,
    migration: migrationOperations,
    
    // Close database connection
    close: () => {
        db.close();
        console.log('📦 Database connection closed');
    }
};
