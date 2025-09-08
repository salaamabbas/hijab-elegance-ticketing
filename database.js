const knex = require('knex');

// Initialize knex with the PostgreSQL connection string from environment variables.
// Render will provide the DATABASE_URL automatically.
const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render's PostgreSQL connections
});

// This function creates the database tables if they don't already exist.
async function setupSchema() {
    try {
        const ticketsExists = await db.schema.hasTable('tickets');
        if (!ticketsExists) {
            await db.schema.createTable('tickets', (table) => {
                table.uuid('id').primary();
                table.string('name').notNullable();
                table.string('phone');
                table.string('ticket_type');
                table.decimal('standard_price');
                table.decimal('custom_price');
                table.decimal('discount_amount');
                table.string('discount_reason');
                table.decimal('amount_paid');
                table.decimal('balance');
                table.boolean('checked_in').defaultTo(false);
                table.text('qr_code');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
            console.log('Created "tickets" table');
        }

        const expensesExists = await db.schema.hasTable('expenses');
        if (!expensesExists) {
            await db.schema.createTable('expenses', (table) => {
                table.uuid('id').primary();
                table.string('category').notNullable();
                table.string('description').notNullable();
                table.decimal('amount').notNullable();
                table.date('date').notNullable();
                table.text('notes');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
            console.log('Created "expenses" table');
        }

        const sponsorshipsExists = await db.schema.hasTable('sponsorships');
        if (!sponsorshipsExists) {
            await db.schema.createTable('sponsorships', (table) => {
                table.uuid('id').primary();
                table.string('name').notNullable();
                table.decimal('amount').notNullable();
                table.string('contact');
                table.text('notes');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
            console.log('Created "sponsorships" table');
        }

        console.log('✅ Database schema is ready');
    } catch (error) {
        console.error('Error setting up database schema:', error);
        // Exit the process if the database schema setup fails, as the app cannot run without it.
        process.exit(1);
    }
}

module.exports = { db, setupSchema };
