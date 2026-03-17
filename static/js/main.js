/**
 * Palace of Culture - Main Application Logic
 */

// STATE
let conversation = [];
let isLoading = false;
let currentFilter = 'all';
let currentSearchQuery = '';
let currentRoom = null;

// DOM ELEMENTS
const elements = {
    roomsList: document.getElementById('roomsList'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    chatForm: document.getElementById('chatForm'),
    sendButton: document.getElementById('sendButton'),
    toast: document.getElementById('toast'),
    roomSearch: document.getElementById('roomSearch'),
    filterBtns: document.querySelectorAll('.filter-tab'),
    chatContainer: document.getElementById('chatContainer'),
    resetBtn: document.getElementById('resetBtn'),
    infoBtn: document.getElementById('infoBtn'),
    // Detail view elements
    roomDetailView: document.getElementById('roomDetailView'),
    backFromDetailBtn: document.getElementById('backFromDetailBtn'),
    detailRoomTitle: document.getElementById('detailRoomTitle'),
    detailType: document.getElementById('detailType'),
    detailFloor: document.getElementById('detailFloor'),
    detailDescription: document.getElementById('detailDescription'),
    detailHighlights: document.getElementById('detailHighlights'),
    detailExtras: document.getElementById('detailExtras'),
    detailChatForm: document.getElementById('detailChatForm'),
    detailMessageInput: document.getElementById('detailMessageInput'),
    detailSendButton: document.getElementById('detailSendButton')
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Palace app...');
    
    const loaded = await loadPalaceData();
    if (!loaded) {
        showToast('Failed to load palace data', 'error');
        return;
    }

    console.log('Data loaded, rendering rooms...');
    renderRoomsList(allRooms);
    setupEventListeners();
    
    // Initialize chat messages with welcome
    elements.chatMessages.innerHTML = `
        <div class="message assistant-message">
            <div class="message-content">
                <p><strong>Welcome to the Palace of Culture Tour! 👋</strong></p>
                <p>I'm your personal guide. Click any room in the sidebar to explore, or ask me anything about the palace, Moldavian culture, traditions, food, and accessibility.</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">💡 Tip: Click on a room to see detailed information</p>
            </div>
        </div>
    `;
    
    console.log('App ready!');
});

// EVENT LISTENERS
function setupEventListeners() {
    elements.chatForm.addEventListener('submit', sendMessage);
    
    elements.roomSearch.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        filterAndRenderRooms();
    });

    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterAndRenderRooms();
        });
    });

    elements.backFromDetailBtn.addEventListener('click', closeRoomDetail);
    elements.detailChatForm.addEventListener('submit', sendDetailMessage);
    elements.resetBtn.addEventListener('click', resetChat);
    elements.infoBtn.addEventListener('click', showPalaceInfo);
}

// ROOM MANAGEMENT
function filterAndRenderRooms() {
    let filtered = allRooms.filter(room => {
        const typeMatch = currentFilter === 'all' || room.type === currentFilter;
        const searchMatch = !currentSearchQuery || 
            room.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            (room.description && room.description.toLowerCase().includes(currentSearchQuery.toLowerCase()));
        return typeMatch && searchMatch;
    });

    renderRoomsList(filtered);
}

function renderRoomsList(rooms) {
    if (!rooms || rooms.length === 0) {
        elements.roomsList.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">No rooms found</div>';
        return;
    }

    const getFloorName = (floorNum) => {
        if (floorNum === 0) return 'Ground floor';
        if (floorNum === 1) return 'First floor';
        if (floorNum === 2) return 'Second floor';
        if (floorNum === 3) return 'Third floor';
        return '';
    };

    const html = rooms.map(room => `
        <div class="room-item" data-room-id="${room.id}">
            <div class="room-name">${escapeHtml(room.name)}</div>
            <div class="room-type">${escapeHtml(room.type)}</div>
            ${room.floor !== undefined ? `<div class="room-floor-info">${getFloorName(room.floor)}</div>` : ''}
        </div>
    `).join('');

    elements.roomsList.innerHTML = html;
    
    // Add click listeners
    elements.roomsList.querySelectorAll('.room-item').forEach(item => {
        item.addEventListener('click', () => {
            const roomId = item.getAttribute('data-room-id');
            selectRoom(roomId);
        });
    });
}

function selectRoom(roomId) {
    const room = getRoomById(roomId);
    if (!room) {
        console.error('Room not found:', roomId);
        return;
    }

    // Just add room info as a message in chat
    currentRoom = room;
    const floorInfo = room.floor !== undefined ? `Located on ${room.floor === 0 ? 'ground floor' : `floor ${room.floor}`}` : '';
    const highlightsText = room.highlights ? `\n\nHighlights: ${room.highlights.join(', ')}` : '';
    
    const message = `You've selected: **${room.name}** (${room.type})\n\n${room.description}${highlightsText}${floorInfo ? '\n\n' + floorInfo : ''}\n\nAsk me anything about this room!`;
    addMessage(message, 'assistant');
}

function showRoomDetail(room) {
    if (!room) return;

    const getFloorName = (floorNum) => {
        if (floorNum === 0) return 'Ground floor';
        if (floorNum === 1) return 'First floor';
        if (floorNum === 2) return 'Second floor';
        if (floorNum === 3) return 'Third floor';
        return '';
    };

    // Set title
    elements.detailRoomTitle.textContent = room.name;
    
    // Set metadata
    elements.detailType.textContent = room.type.charAt(0).toUpperCase() + room.type.slice(1);
    elements.detailFloor.textContent = room.floor !== undefined ? getFloorName(room.floor) : '';
    elements.detailFloor.style.display = room.floor !== undefined ? 'inline-block' : 'none';
    
    // Set description
    elements.detailDescription.textContent = room.description || 'No description available';
    
    // Set highlights
    if (room.highlights && room.highlights.length > 0) {
        elements.detailHighlights.innerHTML = `
            <h3>Highlights</h3>
            <ul>
                ${room.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
        `;
    } else {
        elements.detailHighlights.innerHTML = '';
    }
    
    // Set extras (capacity, accessibility)
    let extrasHTML = '';
    if (room.capacity) {
        extrasHTML += `<div class="detail-extra-item"><strong>Capacity</strong><p>${room.capacity} people</p></div>`;
    }
    if (room.accessibility) {
        extrasHTML += `<div class="detail-extra-item"><strong>Accessibility</strong><p>${escapeHtml(room.accessibility)}</p></div>`;
    }
    elements.detailExtras.innerHTML = extrasHTML;
    
    // Show detail view, hide chat
    elements.roomDetailView.style.display = 'flex';
    elements.chatContainer.style.display = 'none';
    
    // Clear detail message input
    elements.detailMessageInput.value = '';
    elements.detailMessageInput.focus();
}

function closeRoomDetail() {
    // Functionality disabled - rooms now show info in chat
    elements.roomsList.querySelectorAll('.room-item').forEach(item => item.classList.remove('active'));
    currentRoom = null;
}

// CHAT FUNCTIONS
async function sendMessage(event) {
    event.preventDefault();

    const message = elements.messageInput.value.trim();
    if (!message) return;

    if (message.length > 500) {
        showToast('Message too long (max 500 characters)', 'error');
        return;
    }

    addMessage(message, 'user');
    conversation.push({ role: 'user', content: message });
    elements.messageInput.value = '';
    elements.messageInput.focus();

    setLoading(true);
    showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        removeTypingIndicator();

        if (data.response) {
            addMessage(data.response, 'assistant');
            conversation.push({ role: 'assistant', content: data.response });
        } else {
            addMessage('Sorry, I didn\'t get a response. Try again.', 'assistant');
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('Chat error:', error);
        addMessage('Connection error. Please try again.', 'assistant');
    } finally {
        setLoading(false);
    }
}

async function sendDetailMessage(event) {
    // Detail message functionality disabled
    event.preventDefault();
}

function addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<div style="display: flex; gap: 4px;"><span style="opacity: 0.6;">●</span><span style="opacity: 0.6;">●</span><span style="opacity: 0.6;">●</span></div>';
    
    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 0);
}

function setLoading(loading) {
    isLoading = loading;
    elements.messageInput.disabled = loading;
    elements.sendButton.disabled = loading;
}

function resetChat() {
    conversation = [];
    closeRoomDetail();
    elements.chatMessages.innerHTML = `
        <div class="message assistant-message">
            <div class="message-content">
                <p><strong>Welcome! 👋</strong></p>
                <p>I'm your guide to the Palace of Culture. Click a room in the sidebar or ask me anything!</p>
            </div>
        </div>
    `;
    showToast('Chat reset', 'info');
}

function showPalaceInfo() {
    const msg = `**Palace of Culture (Palatul Culturii)**

Location: Boulevard Ștefan cel Mare și Sfânt 1, Iași
Built: 1906-1925
Architects: Ion D. Berindey, Alexandru D. Xenopol, Grigore Cerchez
Height: 55 meters

Hours:
- Monday-Tuesday: Closed
- Wednesday-Sunday: 10:00 - 17:00

Phone: +40 232 275 979
Website: www.palatulculturii.ro

This iconic Neo-Gothic building houses multiple museums and cultural institutions dedicated to Moldavian heritage and history.`;
    
    addMessage(msg, 'assistant');
    conversation.push({ role: 'assistant', content: msg });
}

// UTILITIES
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}


// Add typing animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes typing {
        0%, 60%, 100% { opacity: 0.5; }
        30% { opacity: 1; }
    }
`;
document.head.appendChild(style);

