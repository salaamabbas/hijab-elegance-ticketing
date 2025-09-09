// Dashboard JavaScript
let currentEditingTicket = null;
let currentEditingExpense = null;
let currentEditingSponsor = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadFinancialSummary();
    loadTickets();
    loadExpenses();
    loadSponsorships();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadFinancialSummary();
        loadTickets();
        loadExpenses();
        loadSponsorships();
    }, 30000);
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Modal triggers
    document.getElementById('addTicketBtn').addEventListener('click', () => openTicketModal());
    document.getElementById('addExpenseBtn').addEventListener('click', () => openExpenseModal());
    document.getElementById('addSponsorshipBtn').addEventListener('click', () => openSponsorshipModal());
    
    // Form submissions
    document.getElementById('ticketForm').addEventListener('submit', saveTicket);
    document.getElementById('expenseForm').addEventListener('submit', saveExpense);
    document.getElementById('sponsorshipForm').addEventListener('submit', saveSponsorship);
    
    
    // Search functionality
    const searchInput = document.getElementById('ticketSearch');
    const searchIcon = document.querySelector('.search-icon');
    
    searchInput.addEventListener('input', function() {
        filterAndDisplayTickets();
        
        // Hide/show search icon based on input
        if (this.value.trim()) {
            searchIcon.classList.add('hidden');
        } else {
            searchIcon.classList.remove('hidden');
        }
    });
    document.getElementById('searchTicket').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTickets();
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Balance calculation and discount functions
    function calculateBalance() {
        // Only auto-calculate if balance field is empty or user hasn't manually entered a value
        const balanceField = document.getElementById('ticketBalance');
        const isManualBalance = balanceField.dataset.manualEntry === 'true';
        
        if (!isManualBalance) {
            const amountPaid = parseFloat(document.getElementById('ticketAmountPaid').value) || 0;
            const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
            const hasDiscount = document.getElementById('hasDiscount').checked;
            
            let finalPrice = 80000;
            if (hasDiscount && discountAmount > 0) {
                finalPrice = Math.max(0, 80000 - discountAmount);
            }
            
            const balance = Math.max(0, finalPrice - amountPaid);
            balanceField.value = balance;
        }
    }

    function toggleDiscountMode() {
        const hasDiscount = document.getElementById('hasDiscount').checked;
        const discountFields = document.getElementById('discountFields');
        
        if (hasDiscount) {
            discountFields.style.display = 'block';
        } else {
            discountFields.style.display = 'none';
            document.getElementById('discountAmount').value = '';
            document.getElementById('discountReason').value = '';
        }
        calculateBalance();
    }

    // Add event listeners when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Tab switching
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                switchTab(tabId);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Add ticket button
        document.getElementById('addTicketBtn').addEventListener('click', () => {
            const ticket = currentEditingTicket ? allTickets.find(t => t.id === currentEditingTicket) : null;
            if (ticket) {
                document.getElementById('ticketName').value = ticket.name;
                document.getElementById('ticketPhone').value = ticket.phone;
                document.getElementById('ticketAmountPaid').value = ticket.amountPaid;
                document.getElementById('ticketBalance').value = ticket.balance;
                document.getElementById('isCheckedIn').checked = ticket.checkedIn || false;
                
                // Handle discount fields
                if (ticket.customPrice) {
                    document.getElementById('hasDiscount').checked = true;
                    document.getElementById('discountFields').style.display = 'block';
                    document.getElementById('discountAmount').value = ticket.discountAmount || 0;
                    document.getElementById('discountReason').value = ticket.discountReason || '';
                } else {
                    document.getElementById('hasDiscount').checked = false;
                    document.getElementById('discountFields').style.display = 'none';
                }
            }
            openModal('ticketModal');
            document.getElementById('ticketModalTitle').textContent = currentEditingTicket ? 'Edit Ticket' : 'Create New Ticket';
            document.getElementById('ticketForm').reset();
            document.getElementById('ticketBalance').value = '80000';
            document.getElementById('ticketBalance').dataset.manualEntry = 'false';
            document.getElementById('hasDiscount').checked = false;
            document.getElementById('discountFields').style.display = 'none';
            document.getElementById('isCheckedIn').checked = false;
        });

        // Balance calculation listeners
        document.getElementById('ticketAmountPaid').addEventListener('input', calculateBalance);
        document.getElementById('discountAmount').addEventListener('input', calculateBalance);
        
        // Manual balance entry listener
        document.getElementById('ticketBalance').addEventListener('input', function() {
            // Mark as manual entry when user types in balance field
            this.dataset.manualEntry = 'true';
        });
        
        // Reset manual entry flag when form is reset or discount mode changes
        document.getElementById('hasDiscount').addEventListener('change', function() {
            document.getElementById('ticketBalance').dataset.manualEntry = 'false';
            calculateBalance();
        });
        document.getElementById('hasDiscount').addEventListener('change', toggleDiscountMode);
        
        // Search functionality
        const searchInput = document.getElementById('ticketSearch');
        const clearSearchBtn = document.getElementById('clearSearch');
        const statusFilter = document.getElementById('statusFilter');
        const sortBy = document.getElementById('sortBy');
        
        // Search input listener with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 0) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
            
            // Clear previous timeout
            clearTimeout(searchTimeout);
            
            // Set new timeout for debounced search
            searchTimeout = setTimeout(() => {
                filterAndDisplayTickets();
            }, 300); // 300ms delay
        });
        
        // Clear search button
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            this.style.display = 'none';
            filterAndDisplayTickets();
        });
        
        // Filter listeners (immediate response for dropdowns)
        statusFilter.addEventListener('change', filterAndDisplayTickets);
        sortBy.addEventListener('change', filterAndDisplayTickets);
    });

    // Ticket form submission
    document.getElementById('ticketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const hasDiscount = document.getElementById('hasDiscount').checked;
        const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
        
        let finalPrice = 80000;
        if (hasDiscount && discountAmount > 0) {
            finalPrice = Math.max(0, 80000 - discountAmount);
        }
        
        const ticketData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            amountPaid: parseFloat(formData.get('amountPaid')) || 0,
            balance: parseFloat(document.getElementById('ticketBalance').value) || 0,
            customPrice: hasDiscount ? finalPrice : null,
            discountAmount: hasDiscount ? discountAmount : 0,
            discountReason: hasDiscount ? formData.get('discountReason') : '',
            checkedIn: document.getElementById('isCheckedIn').checked
        };

        try {
            let response;
            if (currentTicketId) {
                response = await fetch(`/api/tickets/${currentTicketId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ticketData)
                });
            } else {
                response = await fetch('/api/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ticketData)
                });
            }

            if (response.ok) {
                closeModal('ticketModal');
                loadTickets();
                loadSummary();
            } else {
                alert('Error saving ticket');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving ticket');
        }
    });
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all nav buttons and tab contents
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked nav button and corresponding tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for the active tab
    if (tabName === 'summary') {
        loadFinancialSummary();
    } else if (tabName === 'checkin') {
        loadCheckedInGuests();
    }
}

// Authentication
async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Financial Summary
async function loadFinancialSummary() {
    try {
        const response = await fetch('/api/financial-summary');
        const data = await response.json();
        
        document.getElementById('totalRevenue').textContent = `UGX ${data.totalRevenue.toLocaleString()}`;
        document.getElementById('totalExpenses').textContent = `UGX ${data.totalExpenses.toLocaleString()}`;
        document.getElementById('profit').textContent = `UGX ${data.profit.toLocaleString()}`;
        document.getElementById('moneyAvailable').textContent = `UGX ${data.moneyAvailable.toLocaleString()}`;
        document.getElementById('ticketCount').textContent = data.ticketCount;
        document.getElementById('checkedInCount').textContent = data.checkedInCount;
    } catch (error) {
        console.error('Failed to load financial summary:', error);
    }
}

// Global variable to store all tickets
let allTickets = [];

// Load tickets
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        
        allTickets = data.tickets || data || [];
        displayTickets(allTickets);
        updateSearchResultsInfo(allTickets.length, allTickets.length, '');
        loadCheckedInGuests(); // Update checked-in list
    } catch (error) {
        console.error('Failed to load tickets:', error);
        document.getElementById('ticketsList').innerHTML = '<div class="error-message">Failed to load tickets</div>';
    }
}

// Load checked-in guests
function loadCheckedInGuests() {
    const checkedInGuests = allTickets.filter(ticket => ticket.checkedIn);
    const checkedInList = document.getElementById('checkedInList');
    const checkedInCountElement = document.getElementById('checkedInCount');
    
    if (checkedInCountElement) {
        checkedInCountElement.textContent = `${checkedInGuests.length} guests checked in`;
    }
    
    if (!checkedInList) return;
    
    if (checkedInGuests.length === 0) {
        checkedInList.innerHTML = '<div class="no-results">No guests checked in yet</div>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    checkedInGuests.forEach(guest => {
        const guestCard = document.createElement('div');
        guestCard.className = 'checked-in-guest-card';
        guestCard.innerHTML = `
            <div class="guest-info">
                <div class="guest-name">${escapeHtml(guest.name)}</div>
                <div class="guest-phone">${escapeHtml(guest.phone)}</div>
            </div>
            <div class="checkin-time">
                ${guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleTimeString() : 'Just now'}
            </div>
        `;
        fragment.appendChild(guestCard);
    });
    
    checkedInList.innerHTML = '';
    checkedInList.appendChild(fragment);
}

// Optimized filter and display function
function filterAndDisplayTickets() {
    const searchQuery = document.getElementById('ticketSearch').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Use requestAnimationFrame for smooth UI updates
    requestAnimationFrame(() => {
        let filteredTickets = allTickets;
        
        // Apply filters in order of selectivity (most restrictive first)
        
        // Apply status filter first (usually more selective)
        if (statusFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => {
                switch (statusFilter) {
                    case 'paid': return ticket.balance === 0;
                    case 'pending': return ticket.balance > 0;
                    case 'checked-in': return ticket.checkedIn;
                    case 'not-checked-in': return !ticket.checkedIn;
                    default: return true;
                }
            });
        }
        
        // Apply search filter (create new array only if needed)
        if (searchQuery) {
            const searchResults = [];
            for (let i = 0; i < filteredTickets.length; i++) {
                const ticket = filteredTickets[i];
                const name = ticket.name.toLowerCase();
                const phone = ticket.phone.toLowerCase();
                const id = ticket.id.toLowerCase();
                
                if (name.includes(searchQuery) || phone.includes(searchQuery) || id.includes(searchQuery)) {
                    searchResults.push(ticket);
                }
            }
            filteredTickets = searchResults;
        }
        
        // Apply sorting (in-place sort to avoid creating new array)
        if (sortBy !== 'newest') { // Default is already newest first
            filteredTickets.sort((a, b) => {
                switch (sortBy) {
                    case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'name': return a.name.localeCompare(b.name);
                    case 'balance': return b.balance - a.balance;
                    default: return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
        }
        
        displayTickets(filteredTickets);
        updateSearchResultsInfo(filteredTickets.length, allTickets.length, searchQuery);
    });
}

// Optimized display function with virtual scrolling for large datasets
function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        const message = allTickets.length === 0 ? 
            'No tickets found. Create your first ticket!' : 
            'No tickets match your search criteria.';
        ticketsList.innerHTML = `<div class="loading">${message}</div>`;
        return;
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Limit initial render to first 50 tickets for performance
    const ticketsToRender = tickets.slice(0, 50);
    
    ticketsToRender.forEach(ticket => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket-card-compact';
        ticketCard.innerHTML = `
            <div class="ticket-compact-header" onclick="toggleTicketDetails('${ticket.id}')">
                <div class="ticket-name-section">
                    <div class="ticket-name">${escapeHtml(ticket.name)}</div>
                    <div class="ticket-status-compact ${ticket.balance === 0 ? 'status-complete' : 'status-pending'}">
                        ${ticket.balance === 0 ? '✅ Paid' : '⏳ Pending'}
                    </div>
                </div>
                <div class="expand-icon">
                    <i class="fas fa-chevron-down" id="icon-${ticket.id}"></i>
                </div>
            </div>
            <div class="ticket-details-expanded" id="details-${ticket.id}" style="display: none;">
                <div class="ticket-info-grid">
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Phone:</span>
                        <span class="ticket-detail-value">${escapeHtml(ticket.phone)}</span>
                    </div>
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Ticket ID:</span>
                        <span class="ticket-detail-value">${ticket.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Amount Paid:</span>
                        <span class="ticket-detail-value">UGX ${(ticket.amountPaid || 0).toLocaleString()}</span>
                    </div>
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Balance:</span>
                        <span class="ticket-detail-value">UGX ${(ticket.balance || 0).toLocaleString()}</span>
                    </div>
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Check-in Status:</span>
                        <span class="ticket-detail-value ${ticket.checkedIn ? 'checked-in' : 'not-checked-in'}">
                            ${ticket.checkedIn ? '✅ Checked In' : '⏳ Not Checked In'}
                        </span>
                    </div>
                    <div class="ticket-detail">
                        <span class="ticket-detail-label">Created:</span>
                        <span class="ticket-detail-value">${new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn btn-primary btn-small" onclick="editTicket('${ticket.id}')">✏️ Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="generatePDF(${JSON.stringify(ticket).replace(/"/g, '&quot;')})">📄 PDF</button>
                    <button class="btn btn-secondary btn-small" onclick="viewQR('${ticket.id}')">📱 QR</button>
                    ${!ticket.checkedIn ? `<button class="btn btn-success btn-small" onclick="checkInTicket('${ticket.id}')">✅ Check In</button>` : `<span class="ticket-detail-value checked-in">✅ Checked In</span>`}
                    <button class="btn btn-danger btn-small" onclick="deleteTicket('${ticket.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
        fragment.appendChild(ticketCard);
    });
    
    // Clear and append in one operation
    ticketsList.innerHTML = '';
    ticketsList.appendChild(fragment);
    
    // Show "Load More" button if there are more tickets
    if (tickets.length > 50) {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'load-more-container';
        loadMoreBtn.innerHTML = `
            <button class="btn btn-secondary" onclick="loadMoreTickets(${tickets.length})">
                Load More (${tickets.length - 50} remaining)
            </button>
        `;
        ticketsList.appendChild(loadMoreBtn);
    }
}

// Toggle ticket details function
function toggleTicketDetails(ticketId) {
    const detailsDiv = document.getElementById(`details-${ticketId}`);
    const icon = document.getElementById(`icon-${ticketId}`);
    
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        detailsDiv.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Check out ticket function
async function checkOutTicket(ticketId) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}/checkin`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checkedIn: false })
        });
        
        if (response.ok) {
            loadTickets(); // Refresh the ticket list
            loadFinancialSummary(); // Update summary
            showMessage('Guest checked out successfully!', 'success');
        } else {
            throw new Error('Failed to check out guest');
        }
    } catch (error) {
        console.error('Error checking out ticket:', error);
        alert('Error checking out guest. Please try again.');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load more tickets function
function loadMoreTickets(totalCount) {
    // This would implement pagination - for now, show all
    const searchQuery = document.getElementById('ticketSearch').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Re-run filter without limit
    filterAndDisplayTicketsUnlimited();
}

// Unlimited version for "Load More"
function filterAndDisplayTicketsUnlimited() {
    const searchQuery = document.getElementById('ticketSearch').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredTickets = allTickets;
    
    if (statusFilter !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => {
            switch (statusFilter) {
                case 'paid': return ticket.balance === 0;
                case 'pending': return ticket.balance > 0;
                case 'checked-in': return ticket.checkedIn;
                case 'not-checked-in': return !ticket.checkedIn;
                default: return true;
            }
        });
    }
    
    if (searchQuery) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.name.toLowerCase().includes(searchQuery) ||
            ticket.phone.toLowerCase().includes(searchQuery) ||
            ticket.id.toLowerCase().includes(searchQuery)
        );
    }
    
    filteredTickets.sort((a, b) => {
        switch (sortBy) {
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name': return a.name.localeCompare(b.name);
            case 'balance': return b.balance - a.balance;
            default: return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    displayAllTickets(filteredTickets);
    updateSearchResultsInfo(filteredTickets.length, allTickets.length, searchQuery);
}

// Display all tickets without limit
function displayAllTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        const message = allTickets.length === 0 ? 
            'No tickets found. Create your first ticket!' : 
            'No tickets match your search criteria.';
        ticketsList.innerHTML = `<div class="loading">${message}</div>`;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    tickets.forEach(ticket => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket-card';
        ticketCard.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-name">${escapeHtml(ticket.name)}</div>
                <div class="ticket-status ${ticket.balance === 0 ? 'status-complete' : 'status-pending'}">
                    ${ticket.balance === 0 ? 'Paid' : 'Pending'}
                </div>
            </div>
            <div class="ticket-details">
                <div class="ticket-detail">
                    <span class="ticket-detail-label">Phone:</span>
                    <span class="ticket-detail-value">${escapeHtml(ticket.phone)}</span>
                </div>
                <div class="ticket-detail">
                    <span class="ticket-detail-label">Amount Paid:</span>
                    <span class="ticket-detail-value">UGX ${ticket.amountPaid.toLocaleString()}</span>
                </div>
                <div class="ticket-detail">
                    <span class="ticket-detail-label">Balance:</span>
                    <span class="ticket-detail-value">UGX ${ticket.balance.toLocaleString()}</span>
                </div>
                <div class="ticket-detail">
                    <span class="ticket-detail-label">Status:</span>
                    <span class="ticket-detail-value ${ticket.checkedIn ? 'checked-in' : 'not-checked-in'}">
                        ${ticket.checkedIn ? '✅ Checked In' : '⏳ Not Checked In'}
                    </span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn btn-primary btn-small" onclick="editTicket('${ticket.id}')">Edit</button>
                <button class="btn btn-secondary btn-small" onclick="generatePDF(${JSON.stringify(ticket).replace(/"/g, '&quot;')})">📄 PDF</button>
                <button class="btn btn-secondary btn-small" onclick="viewQR('${ticket.id}')">QR Code</button>
                ${!ticket.checkedIn ? `<button class="btn btn-primary btn-small" onclick="checkInTicket('${ticket.id}')">Check In</button>` : ''}
                <button class="btn btn-danger btn-small" onclick="deleteTicket('${ticket.id}')">Delete</button>
            </div>
        `;
        fragment.appendChild(ticketCard);
    });
    
    ticketsList.innerHTML = '';
    ticketsList.appendChild(fragment);
}

// Update search results information
function updateSearchResultsInfo(filteredCount, totalCount, searchQuery) {
    const resultsInfo = document.getElementById('searchResultsCount');
    // ... (rest of the code remains the same)

    if (searchQuery || document.getElementById('statusFilter').value !== 'all') {
        resultsInfo.textContent = `Showing ${filteredCount} of ${totalCount} tickets`;
    } else {
        resultsInfo.textContent = `${totalCount} total tickets`;
    }
}

function openTicketModal(ticketId = null) {
    currentEditingTicket = ticketId;
    const modal = document.getElementById('ticketModal');
    const form = document.getElementById('ticketForm');
    const title = document.getElementById('ticketModalTitle');

    
    if (ticketId) {
        title.textContent = 'Edit Ticket';
        // Load ticket data
        fetch(`/api/tickets`)
            .then(response => response.json())
            .then(tickets => {
                const ticket = tickets.find(t => t.id === ticketId);
                if (ticket) {
                    document.getElementById('ticketName').value = ticket.name;
                    document.getElementById('ticketPhone').value = ticket.phone;
                    document.getElementById('ticketAmountPaid').value = ticket.amountPaid;
                }
            });
    } else {
        title.textContent = 'Add New Ticket';
        form.reset();
    }
    
    modal.style.display = 'block';
}

async function saveTicket(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ticketData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        amountPaid: parseInt(formData.get('amountPaid')) || 0
    };
    
    try {
        const url = currentEditingTicket ? `/api/tickets/${currentEditingTicket}` : '/api/tickets';
        const method = currentEditingTicket ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        
        if (response.ok) {
            closeModal('ticketModal');
            loadTickets();
            loadFinancialSummary();
            showMessage('Ticket saved successfully!', 'success');
        } else {
            showMessage('Failed to save ticket', 'error');
        }
    } catch (error) {
        console.error('Failed to save ticket:', error);
        showMessage('Failed to save ticket', 'error');
    }
}

function editTicket(ticketId) {
    openTicketModal(ticketId);
}

async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
        
        if (response.ok) {
            loadTickets();
            loadFinancialSummary();
            loadCheckedInGuests(); // Update checked-in list
            showMessage('Ticket deleted successfully!', 'success');
        } else {
            showMessage('Failed to delete ticket', 'error');
        }
    } catch (error) {
        console.error('Failed to delete ticket:', error);
        showMessage('Failed to delete ticket', 'error');
    }
}

async function checkInTicket(ticketId) {
    try {
        // First get the current ticket data
        const ticketsResponse = await fetch('/api/tickets');
        if (!ticketsResponse.ok) {
            throw new Error('Failed to fetch tickets');
        }
        
        const data = await ticketsResponse.json();
        const tickets = data.tickets || data;
        const ticket = tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            showMessage('Ticket not found', 'error');
            return;
        }
        
        // Update the ticket with check-in status
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: ticket.name,
                phone: ticket.phone,
                amountPaid: ticket.amountPaid,
                customPrice: ticket.customPrice,
                discountAmount: ticket.discountAmount,
                discountReason: ticket.discountReason,
                checkedIn: true
            })
        });
        
        if (response.ok) {
            loadTickets();
            loadFinancialSummary();
            showMessage('Guest checked in successfully!', 'success');
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to check in guest', 'error');
        }
    } catch (error) {
        console.error('Failed to check in guest:', error);
        showMessage('Failed to check in guest', 'error');
    }
}

// PDF Generation
function generatePDF(ticket) {
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }
        
        // Try different ways to access jsPDF
        const pdfLib = window.jspdf || { jsPDF: window.jsPDF };
        const { jsPDF } = pdfLib;
        const doc = new jsPDF();
        
        // Professional Header Design
        // Header with elegant styling
        doc.setFillColor(25, 135, 84);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Logo/Brand area
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('HIJAB ELEGANCE', 20, 18);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('PICNIC 2025', 20, 30);
        
        // Event details in header
        doc.setFontSize(11);
        doc.text('Presented by Salaam Safaris', 135, 18);
        doc.text('Premium Event Experience', 135, 26);
        doc.text('UGX 80,000 Standard Ticket', 135, 34);
        
        // Ticket Badge
        doc.setFillColor(40, 167, 69);
        doc.roundedRect(150, 60, 45, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DIGITAL TICKET', 172.5, 69, { align: 'center' });
        
        // Guest Information Section
        const startY = 55;
        
        // Elegant info box
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(206, 212, 218);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, startY, 180, 95, 3, 3, 'FD');
        
        doc.setTextColor(44, 62, 80);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('GUEST INFORMATION', 20, startY + 18);
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${ticket.name}`, 20, startY + 32);
        doc.text(`Phone: ${ticket.phone}`, 20, startY + 44);
        doc.text(`Ticket ID: ${ticket.id.slice(0, 8).toUpperCase()}`, 20, startY + 56);
        
        // Payment Information
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT DETAILS', 20, startY + 72);
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'normal');
        doc.text(`Ticket Type: ${ticket.ticketType}`, 20, startY + 86);
        
        if (ticket.balance > 0) {
            doc.text(`Amount Paid: UGX ${ticket.amountPaid.toLocaleString()}`, 20, startY + 98);
            doc.setTextColor(220, 53, 69);
            doc.setFont('helvetica', 'bold');
            doc.text(`Balance Due: UGX ${ticket.balance.toLocaleString()}`, 20, startY + 110);
        } else {
            doc.text(`Amount Paid: UGX ${ticket.amountPaid.toLocaleString()}`, 20, startY + 98);
            doc.setTextColor(40, 167, 69);
            doc.setFont('helvetica', 'bold');
            doc.text('FULLY PAID ✓', 20, startY + 110);
        }
        
        // QR Code Section
        if (ticket.qrCode) {
            const qrY = ticket.discountAmount > 0 ? 175 : 165;
            
            doc.setTextColor(44, 62, 80);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('EVENT ACCESS', 120, qrY);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text('Scan this QR code at the event entrance', 120, qrY + 12);
            
            // QR code with border
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(1);
            doc.rect(119, qrY + 18, 52, 52);
            doc.addImage(ticket.qrCode, 'PNG', 120, qrY + 19, 50, 50);
        }
        
        // Professional Notice Section
        const noticeY = ticket.discountAmount > 0 ? 245 : 235;
        
        // Elegant notice box
        doc.setFillColor(253, 246, 227);
        doc.setDrawColor(252, 211, 77);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, noticeY, 180, 35, 2, 2, 'FD');
        
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('📋 IMPORTANT INFORMATION', 20, noticeY + 12);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('• All payments are non-refundable', 20, noticeY + 20);
        doc.text('• Present this QR code (digital or printed) at event entrance', 20, noticeY + 26);
        doc.text('• Keep this ticket secure until the event date', 20, noticeY + 32);
        
        // Professional Footer
        doc.setFillColor(248, 249, 250);
        doc.rect(0, 275, 210, 22, 'F');
        
        doc.setTextColor(108, 117, 125);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by Hijab Elegance Ticketing System', 20, 283);
        doc.text(`Issue Date: ${new Date(ticket.createdAt).toLocaleDateString()}`, 20, 288);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 293);
        
        doc.text('For inquiries: Contact Salaam Safaris', 105, 283, { align: 'center' });
        doc.text('Thank you for choosing our services!', 105, 288, { align: 'center' });
        
        // Status indicator
        const statusText = ticket.checkedIn ? 'CHECKED IN' : 'VALID';
        const statusColor = ticket.checkedIn ? [40, 167, 69] : [23, 162, 184];
        doc.setTextColor(...statusColor);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, 190, 288, { align: 'right' });
        
        // Save the PDF
        const fileName = `Hijab-Elegance-Ticket-${ticket.name.replace(/\s+/g, '-')}-${ticket.id.slice(0, 8)}.pdf`;
        doc.save(fileName);
        
        // Show success message
        if (typeof showMessage === 'function') {
            showMessage('Professional ticket PDF generated successfully!', 'success');
        } else {
            alert('Professional ticket PDF generated successfully!');
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message + '. Please try again.');
    }
}

async function viewQR(ticketId) {
    try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
            throw new Error('Failed to fetch tickets');
        }
        
        const data = await response.json();
        const tickets = data.tickets || data; // Handle both response formats
        const ticket = tickets.find(t => t.id === ticketId);
        
        if (ticket && ticket.qrCode) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>QR Code - ${ticket.name}</title>
                            <style>
                                body { 
                                    text-align: center; 
                                    font-family: Arial, sans-serif; 
                                    padding: 20px; 
                                    background: #f5f5f5;
                                }
                                .qr-container {
                                    background: white;
                                    padding: 30px;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                                    display: inline-block;
                                    margin: 20px;
                                }
                                img { 
                                    max-width: 300px; 
                                    border: 2px solid #ddd;
                                    border-radius: 8px;
                                }
                                h2 { color: #333; margin-bottom: 20px; }
                                p { color: #666; margin-top: 15px; }
                            </style>
                        </head>
                        <body>
                            <div class="qr-container">
                                <h2>QR Code for ${ticket.name}</h2>
                                <img src="${ticket.qrCode}" alt="QR Code" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIFFSIENvZGU8L3RleHQ+PC9zdmc+';">
                                <p><strong>Ticket ID:</strong> ${ticket.id.slice(0, 8).toUpperCase()}</p>
                                <p>Scan this code to view ticket details</p>
                                <p style="font-size: 12px; color: #999;">Guest URL: ${window.location.origin}/guest/${ticket.id}</p>
                            </div>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            } else {
                showMessage('Popup blocked. Please allow popups and try again.', 'error');
            }
        } else {
            showMessage('QR code not found for this ticket', 'error');
        }
    } catch (error) {
        console.error('Failed to load QR code:', error);
        showMessage('Failed to load QR code', 'error');
    }
}

// Expenses Management
async function loadExpenses() {
    try {
        const response = await fetch('/api/expenses');
        const expenses = await response.json();
        
        const expensesList = document.getElementById('expensesList');
        
        if (expenses.length === 0) {
            expensesList.innerHTML = '<div class="loading">No expenses recorded yet.</div>';
            return;
        }
        
        expensesList.innerHTML = expenses.map(expense => `
            <div class="financial-item">
                <div class="financial-info">
                    <h4>${expense.description}</h4>
                    <p>Category: ${expense.category}</p>
                    <p>Date: ${new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div class="financial-amount">UGX ${expense.amount.toLocaleString()}</div>
                <div class="financial-actions">
                    <button class="btn btn-small btn-secondary" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }
}

function openExpenseModal(expenseId = null) {
    currentEditingExpense = expenseId;
    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    const title = document.getElementById('expenseModalTitle');
    
    if (expenseId) {
        title.textContent = 'Edit Expense';
        fetch('/api/expenses')
            .then(response => response.json())
            .then(expenses => {
                const expense = expenses.find(e => e.id === expenseId);
                if (expense) {
                    document.getElementById('expenseCategory').value = expense.category;
                    document.getElementById('expenseDescription').value = expense.description;
                    document.getElementById('expenseAmount').value = expense.amount;
                    document.getElementById('expenseDate').value = expense.date;
                }
            });
    } else {
        title.textContent = 'Add New Expense';
        form.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'block';
}

async function saveExpense(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expenseData = {
        category: formData.get('category'),
        description: formData.get('description'),
        amount: parseInt(formData.get('amount')),
        date: formData.get('date')
    };
    
    try {
        const url = currentEditingExpense ? `/api/expenses/${currentEditingExpense}` : '/api/expenses';
        const method = currentEditingExpense ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });
        
        if (response.ok) {
            closeModal('expenseModal');
            loadExpenses();
            loadFinancialSummary();
            showMessage('Expense saved successfully!', 'success');
        } else {
            showMessage('Failed to save expense', 'error');
        }
    } catch (error) {
        console.error('Failed to save expense:', error);
        showMessage('Failed to save expense', 'error');
    }
}

function editExpense(expenseId) {
    openExpenseModal(expenseId);
}

async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const response = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
        
        if (response.ok) {
            loadExpenses();
            loadFinancialSummary();
            showMessage('Expense deleted successfully!', 'success');
        } else {
            showMessage('Failed to delete expense', 'error');
        }
    } catch (error) {
        console.error('Failed to delete expense:', error);
        showMessage('Failed to delete expense', 'error');
    }
}

// Sponsorships Management
async function loadSponsorships() {
    try {
        const response = await fetch('/api/sponsorships');
        const sponsorships = await response.json();
        
        const sponsorshipsList = document.getElementById('sponsorshipsList');
        
        if (sponsorships.length === 0) {
            sponsorshipsList.innerHTML = '<div class="loading">No sponsorships recorded yet.</div>';
            return;
        }
        
        sponsorshipsList.innerHTML = sponsorships.map(sponsor => `
            <div class="financial-item">
                <div class="financial-info">
                    <h4>${sponsor.name}</h4>
                    <p>Date: ${new Date(sponsor.date).toLocaleDateString()}</p>
                    ${sponsor.notes ? `<p>Notes: ${sponsor.notes}</p>` : ''}
                </div>
                <div class="financial-amount">UGX ${sponsor.amount.toLocaleString()}</div>
                <div class="financial-actions">
                    <button class="btn btn-small btn-secondary" onclick="editSponsorship('${sponsor.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSponsorship('${sponsor.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load sponsorships:', error);
    }
}

function openSponsorshipModal(sponsorshipId = null) {
    currentEditingSponsor = sponsorshipId;
    const modal = document.getElementById('sponsorshipModal');
    const form = document.getElementById('sponsorshipForm');
    const title = document.getElementById('sponsorshipModalTitle');
    
    if (sponsorshipId) {
        title.textContent = 'Edit Sponsorship';
        fetch('/api/sponsorships')
            .then(response => response.json())
            .then(sponsorships => {
                const sponsor = sponsorships.find(s => s.id === sponsorshipId);
                if (sponsor) {
                    document.getElementById('sponsorName').value = sponsor.name;
                    document.getElementById('sponsorAmount').value = sponsor.amount;
                    document.getElementById('sponsorDate').value = sponsor.date;
                    document.getElementById('sponsorNotes').value = sponsor.notes || '';
                }
            });
    } else {
        title.textContent = 'Add New Sponsorship';
        form.reset();
        document.getElementById('sponsorDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'block';
}

async function saveSponsorship(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const sponsorshipData = {
        name: formData.get('name'),
        amount: parseInt(formData.get('amount')),
        date: formData.get('date'),
        notes: formData.get('notes')
    };
    
    try {
        const url = currentEditingSponsor ? `/api/sponsorships/${currentEditingSponsor}` : '/api/sponsorships';
        const method = currentEditingSponsor ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sponsorshipData)
        });
        
        if (response.ok) {
            closeModal('sponsorshipModal');
            loadSponsorships();
            loadFinancialSummary();
            showMessage('Sponsorship saved successfully!', 'success');
        } else {
            showMessage('Failed to save sponsorship', 'error');
        }
    } catch (error) {
        console.error('Failed to save sponsorship:', error);
        showMessage('Failed to save sponsorship', 'error');
    }
}

function editSponsorship(sponsorshipId) {
    openSponsorshipModal(sponsorshipId);
}

async function deleteSponsorship(sponsorshipId) {
    if (!confirm('Are you sure you want to delete this sponsorship?')) return;
    
    try {
        const response = await fetch(`/api/sponsorships/${sponsorshipId}`, { method: 'DELETE' });
        
        if (response.ok) {
            loadSponsorships();
            loadFinancialSummary();
            showMessage('Sponsorship deleted successfully!', 'success');
        } else {
            showMessage('Failed to delete sponsorship', 'error');
        }
    } catch (error) {
        console.error('Failed to delete sponsorship:', error);
        showMessage('Failed to delete sponsorship', 'error');
    }
}





// Search and Check-in
async function searchTickets() {
    const searchTerm = document.getElementById('searchTicket').value.toLowerCase().trim();
    
    if (!searchTerm) {
        showMessage('Please enter a search term', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        const tickets = data.tickets || data; // Handle both response formats
        
        const filteredTickets = tickets.filter(ticket => 
            ticket.name.toLowerCase().includes(searchTerm) || 
            ticket.phone.includes(searchTerm)
        );
        
        const resultsDiv = document.getElementById('checkinResults');
        
        if (filteredTickets.length === 0) {
            resultsDiv.innerHTML = '<div class="loading">No tickets found matching your search.</div>';
            return;
        }
        
        resultsDiv.innerHTML = filteredTickets.map(ticket => `
            <div class="checkin-card ${ticket.checkedIn ? 'checked-in' : ''}">
                <h4>${ticket.name}</h4>
                <p><strong>Phone:</strong> ${ticket.phone}</p>
                <p><strong>Amount Paid:</strong> UGX ${ticket.amountPaid.toLocaleString()}</p>
                <p><strong>Balance:</strong> UGX ${ticket.balance.toLocaleString()}</p>
                <p><strong>Status:</strong> ${ticket.checkedIn ? '✅ Checked In' : '⏳ Not Checked In'}</p>
                ${!ticket.checkedIn ? `
                    <button class="btn btn-primary" onclick="checkInTicket('${ticket.id}')">Check In</button>
                ` : `
                    <p><strong>Checked in at:</strong> ${new Date(ticket.checkedInAt).toLocaleString()}</p>
                `}
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to search tickets:', error);
        showMessage('Failed to search tickets', 'error');
    }
}

// Export functionality
async function exportData(type) {
    try {
        const response = await fetch(`/api/export/${type}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showMessage(`${type} data exported successfully!`, 'success');
        } else {
            showMessage(`Failed to export ${type} data`, 'error');
        }
    } catch (error) {
        console.error(`Failed to export ${type}:`, error);
        showMessage(`Failed to export ${type} data`, 'error');
    }
}

// Utility functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentEditingTicket = null;
    currentEditingExpense = null;
    currentEditingSponsor = null;
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}
