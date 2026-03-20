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

    currentRoom = room;
    const htmlMessage = buildRoomInfoMessage(room);
    addMessage(htmlMessage, 'assistant', true);
    conversation.push({ role: 'assistant', content: `Room selected: ${room.name}` });
}

function buildRoomInfoMessage(room) {
    const safeName = escapeHtml(room.name || 'Unknown Room');
    const safeType = escapeHtml(formatType(room.type || 'room'));
    const safeDescription = escapeHtml(room.description || 'No description available');
    const floorLabel = getFloorLabel(room);

    let html = `
        <div style="line-height: 1.42; color: #2c3e50; font-size: 0.85rem;">
            <div style="font-weight: 700; color: #1a2332; font-size: 0.95rem; margin-bottom: 0.25rem;">
                ${safeName}
            </div>
            <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.3rem;">
                <span style="background: rgba(184, 134, 11, 0.12); color: #7a5a05; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600;">${safeType}</span>
                ${floorLabel ? `<span style="background: #eef1f5; color: #46576b; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600;">${escapeHtml(floorLabel)}</span>` : ''}
            </div>
            <div style="margin-bottom: 0.35rem; color: #394b5a; font-size: 0.82rem; line-height: 1.35;">${safeDescription}</div>
    `;

    if (room.highlights && room.highlights.length > 0) {
        html += `
            <div style="margin-bottom: 0.3rem; font-size: 0.82rem;"><strong>Highlights:</strong></div>
            <ul style="margin: 0 0 0.35rem 1rem; padding: 0; color: #394b5a; font-size: 0.81rem;">
                ${room.highlights.map(item => `<li style="margin-bottom: 0.08rem;">${escapeHtml(item)}</li>`).join('')}
            </ul>
        `;
    }

    const infoRows = [];
    if (room.wing) infoRows.push(`<div><strong>Wing:</strong> ${escapeHtml(room.wing)}</div>`);
    if (room.capacity) infoRows.push(`<div><strong>Capacity:</strong> ${escapeHtml(String(room.capacity))} people</div>`);
    if (room.accessibility) infoRows.push(`<div><strong>Accessibility:</strong> ${escapeHtml(room.accessibility.replace(/_/g, ' '))}</div>`);
    if (room.floor_spanning && Array.isArray(room.floor_spanning)) {
        infoRows.push(`<div><strong>Floors:</strong> ${escapeHtml(room.floor_spanning.map(f => getFloorName(f)).join(', '))}</div>`);
    }

    const museumData = getMuseumDataForRoom(room);
    if (museumData) {
        if (museumData.founded) infoRows.push(`<div><strong>Founded:</strong> ${escapeHtml(String(museumData.founded))}</div>`);
        if (museumData.objects) infoRows.push(`<div><strong>Collection Size:</strong> ${escapeHtml(String(museumData.objects))} objects</div>`);
        if (museumData.artworks) infoRows.push(`<div><strong>Collection Size:</strong> ${escapeHtml(String(museumData.artworks))} artworks</div>`);
        if (museumData.location) infoRows.push(`<div><strong>Museum Location:</strong> ${escapeHtml(museumData.location)}</div>`);
    }

    if (infoRows.length > 0) {
        html += `
            <div style="padding-top: 0.3rem; border-top: 1px solid #e3e8ee; color: #394b5a; display: grid; gap: 0.1rem; margin-bottom: 0.3rem; font-size: 0.82rem;">
                ${infoRows.join('')}
            </div>
        `;
    }

    if (museumData && Array.isArray(museumData.sections) && museumData.sections.length > 0) {
        html += `
            <div style="margin-bottom: 0.28rem; font-size: 0.82rem;"><strong>Sections:</strong></div>
            <ul style="margin: 0 0 0.35rem 1rem; padding: 0; color: #394b5a; font-size: 0.81rem;">
                ${museumData.sections.slice(0, 6).map(section => `<li style="margin-bottom: 0.08rem;">${escapeHtml(section)}</li>`).join('')}
            </ul>
        `;
    }

    html += `<div style="margin-top: 0.2rem; color: #5f6f7f; font-size: 0.76rem;">You can ask me detailed questions about this place.</div></div>`;

    return html;
}

function getMuseumDataForRoom(room) {
    if (!palaceData || !palaceData.palace_info || !palaceData.palace_info.museums || !Array.isArray(palaceData.palace_info.museums.list)) {
        return null;
    }

    const museums = palaceData.palace_info.museums.list;
    const roomName = normalizeText(room.name || '');
    const roomId = normalizeText(room.id || '');

    const byIdMap = {
        history_museum: 'Moldavia\'s History Museum',
        stefan_procopiu: 'Ștefan Procopiu Science and Technique Museum',
        art_museum: 'Art Museum',
        ethnographic_museum_1: 'Ethnographic Museum of Moldavia',
        ethnographic_museum_2: 'Ethnographic Museum of Moldavia'
    };

    const mappedName = byIdMap[room.id];
    if (mappedName) {
        const mapped = museums.find(museum => normalizeText(museum.name || '') === normalizeText(mappedName));
        if (mapped) return mapped;
    }

    return museums.find(museum => {
        const museumName = normalizeText(museum.name || '');
        return roomName.includes(museumName) || museumName.includes(roomName) || roomId.includes(museumName);
    }) || null;
}

function normalizeText(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function getFloorName(floorNum) {
    if (floorNum === 0) return 'Ground floor';
    if (floorNum === 1) return 'First floor';
    if (floorNum === 2) return 'Second floor';
    if (floorNum === 3) return 'Third floor';
    return `Floor ${floorNum}`;
}

function getFloorLabel(room) {
    if (room.floor !== undefined) {
        return getFloorName(room.floor);
    }
    if (room.floor_spanning && Array.isArray(room.floor_spanning) && room.floor_spanning.length > 0) {
        return room.floor_spanning.map(f => getFloorName(f)).join(' - ');
    }
    return '';
}

function formatType(type) {
    if (!type) return 'Room';
    return type
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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

function addMessage(text, role, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (isHtml) {
        contentDiv.innerHTML = text;
    } else {
        contentDiv.textContent = text;
    }
    
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
                <p>Welcome. I'm your guide to the Palace of Culture. Click a room in the sidebar or ask me anything.</p>
            </div>
        </div>
    `;
    showToast('Chat reset', 'info');
}

function showPalaceInfo() {
    const htmlMsg = `
        <div style="line-height: 1.5; color: #333; font-size: 0.9rem;">
            <div style="margin-bottom: 0.5rem; font-weight: 600; font-size: 1rem; color: #b8860b;">
                🏛️ Palace of Culture (Palatul Culturii)
            </div>
            <div style="margin-bottom: 0.2rem;"><strong>📍 Location:</strong> Boulevard Ștefan cel Mare și Sfânt 1, Iași</div>
            <div style="margin-bottom: 0.2rem;"><strong>🏗️ Construction:</strong> 1906 - 1925</div>
            <div style="margin-bottom: 0.2rem;"><strong>👨‍🏫 Architects:</strong> Ion D. Berindey, Alexandru D. Xenopol, Grigore Cerchez</div>
            <div style="margin-bottom: 0.2rem;"><strong>📏 Height:</strong> 55 meters</div>
            <div style="margin-bottom: 0.2rem;"><strong>🏛️ Architectural Style:</strong> Neo-Gothic & Neoclassical</div>
            <div style="margin-bottom: 0.2rem;"><strong>⏰ Opening Hours:</strong></div>
            <div style="margin-left: 1.2rem; margin-bottom: 0.2rem; font-size: 0.85rem;">
                📅 Monday & Tuesday: Closed<br>
                📅 Wednesday - Sunday: 10:00 - 17:00
            </div>
            <div style="margin-bottom: 0.2rem;"><strong>📞 Contact:</strong> +40 232 275 979</div>
            <div style="margin-bottom: 0.2rem;"><strong>🌐 Website:</strong> www.palatulculturii.ro</div>
            <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd; font-style: italic; color: #666; font-size: 0.85rem;">
                This iconic Neo-Gothic building houses multiple museums and cultural institutions dedicated to Moldavian heritage and history.
            </div>
        </div>
    `;
    
    addMessage(htmlMsg, 'assistant', true);
    conversation.push({ role: 'assistant', content: 'Palace of Culture Information' });
}

// UTILITIES
function cleanText(text) {
    if (!text) return '';
    
    // Remove markdown bold (**text**)
    text = text.replace(/\*\*/g, '');
    
    // Remove markdown italic (*text*)
    text = text.replace(/\*/g, '');
    
    // Clean up extra whitespace while preserving sentence structure
    text = text.replace(/\n+/g, ' ');
    text = text.replace(/\s+/g, ' ');
    
    // Ensure each sentence ends with a period
    const sentences = text.split(/(?<=[.!?])\s+/);
    const cleanedSentences = sentences.map(sentence => {
        sentence = sentence.trim();
        if (sentence && !sentence.match(/[.!?]$/)) {
            sentence += '.';
        }
        return sentence;
    }).filter(s => s);
    
    let result = cleanedSentences.join(' ');
    
    // Ensure final punctuation
    if (result && !result.match(/[.!?]$/)) {
        result += '.';
    }
    
    return result;
}

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

