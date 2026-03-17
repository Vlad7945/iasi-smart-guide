/**
 * Palace Data Loader - Simple & Clean
 */

let palaceData = null;
let allRooms = [];

async function loadPalaceData() {
    try {
        const timestamp = Date.now();
        const response = await fetch(`/api/palace-data?t=${timestamp}`, {
            method: 'GET',
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load palace data');
        }
        
        palaceData = await response.json();
        
        // Extract all rooms from all floors
        allRooms = [];
        if (palaceData.floors && Array.isArray(palaceData.floors)) {
            palaceData.floors.forEach(floor => {
                if (floor.rooms && Array.isArray(floor.rooms)) {
                    allRooms.push(...floor.rooms);
                }
            });
        }
        
        console.log('✓ Palace data loaded successfully');
        console.log('✓ Total rooms:', allRooms.length);
        allRooms.forEach(room => {
            console.log(`  - ${room.name} (Floor: ${room.floor})`);
        });
        
        return true;
    } catch (error) {
        console.error('✗ Error loading palace data:', error);
        return false;
    }
}

function getRoomsByType(type) {
    if (type === 'all') return allRooms;
    return allRooms.filter(room => room.type === type);
}

function searchRooms(query) {
    const lowerQuery = query.toLowerCase();
    return allRooms.filter(room => 
        room.name.toLowerCase().includes(lowerQuery) ||
        (room.description && room.description.toLowerCase().includes(lowerQuery))
    );
}

function getRoomById(id) {
    return allRooms.find(room => room.id === id);
}


function getRoomsByType(type) {
    if (type === 'all') return allRooms;
    return allRooms.filter(room => room.type === type);
}

function searchRooms(query) {
    const lowerQuery = query.toLowerCase();
    return allRooms.filter(room => 
        room.name.toLowerCase().includes(lowerQuery) ||
        room.description.toLowerCase().includes(lowerQuery) ||
        (room.type && room.type.toLowerCase().includes(lowerQuery))
    );
}

function getRoomById(id) {
    return allRooms.find(room => room.id === id);
}
