/**
 * Palace of Culture - Main Application Logic
 */
//IMPORTAM WEBCOMPONENTSURILE
import {
    loadPalaceData,
    getRoomById,
} from './data.js';
import '/static/js/components/banner/Banner.js';
import '/static/js/components/banner/ReloadButton.js';
import '/static/js/components/banner/InfoButton.js';
import '/static/js/components/banner/ToggleMenuButton.js';
import '/static/js/components/sidebar/Sidebar.js';
import '/static/js/components/chatarea/ChatArea.js';
import '/static/js/components/chatarea/DefaultMessage.js';
import '/static/js/components/chatarea/UserMessage.js';
import '/static/js/components/chatarea/AssistantMessage.js';
import '/static/js/components/chatarea/MessageFactory.js'
import '/static/js/components/chatarea/ChatInput.js';
import '/static/js/components/sidebar/SidebarSearch.js';
import '/static/js/components/sidebar/SidebarFilter.js';
import '/static/js/components/sidebar/RoomItem.js';
import '/static/js/components/sidebar/CloseSidebarButton.js';
import '/static/js/util/open_close_sidebar.js';
let conversation = [];
let isLoading = false;
let currentRoom = null;
console.log("MAIN LOADED")


// INITIALIZATION
let palaceData = null;
let allRooms = [];
// i dont put all the event listeners in a setupeventlisteners() function
// for now. because it is better to have them visible here at the moment
// to get a better idea about application structure
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Palace app...');
    const result = await loadPalaceData();
    if (!result) return;
    palaceData = result.palaceData;
    allRooms = result.allRooms;
    const sidebar = document.querySelector("sidebar-element");
    sidebar.setRooms(allRooms);
    console.log('App ready!');
});

document.addEventListener("room-selected", (e) => {
    const roomId = e.detail;
    const room = getRoomById(roomId);
    if (!room) {
        console.error("Room not found:", roomId);
        return;
    }
    const chat = document.querySelector("chat-area");
    const htmlMessage = buildRoomInfoMessage(room);
    chat.addMessage("assistant", htmlMessage, true);
});

document.addEventListener("reset-clicked", () => {
    const chat = document.querySelector("chat-area");
    chat?.reset();
    conversation = [];
    showToast('Chat reset', 'info');
});

document.addEventListener("chat-submit", async (e) => {
    const message = e.detail;
    const chat = document.querySelector("chat-area");
    conversation.push({ role: "user", content: message });
    chat.addMessage("user", message);
    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        const reply = data.response || "No response";
        conversation.push({ role: "assistant", content: reply });
        chat.addMessage("assistant", data.response || "No response");
    } catch (err) {
        console.error(err);
        chat.addMessage("assistant", "Error");
    }
});

document.addEventListener("info-clicked", () => {
    const chat = document.querySelector("chat-area");
    chat?.showInfo();
});

// ROOM MANAGEMENT / FUNCTII MUSEUM DATA / FUNCTII CARE POT FI UTILE IN VIITOR
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
    if (!palaceData || !palaceData.palace_info || !palaceData.palace_info.museums || !Array.isArray(palaceData.palace_info.museums.roomsSlot)) {
        return null;
    }

    const museums = palaceData.palace_info.museums.roomsSlot;
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

function addMessage(text, role, isHtml = false) {
    const chat = document.querySelector("chat-area");
     if (!chat) {
        console.error("chat-area not found");
        return;
    }
    chat.addMessage(role, text)
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function showToast(message, type = 'info') {
    let toast  = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
const style = document.createElement('style');
style.textContent = `
    @keyframes typing {
        0%, 60%, 100% { opacity: 0.5; }
        30% { opacity: 1; }
    }
`;
document.head.appendChild(style);

