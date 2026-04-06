/**
 * Palace Data Loader - Simple & Clean
 */

let palaceData = null;
let allRooms = [];

export async function loadPalaceData() {
    try {
        const timestamp = Date.now();
        let response = await fetch(`/api/palace-data?t=${timestamp}`, {
            method: 'GET',
            cache: 'no-store'
        });
        if (!response.ok) {
            response = await fetch(`/palace_data.json?t=${timestamp}`, {
                method: 'GET',
                cache: 'no-store'
            });
        }
        if (!response.ok) {
            throw new Error(`Failed to load palace data`);
        }
        palaceData = await response.json();
        allRooms = [];

        const floors = palaceData.floors || palaceData.palace_info?.floors;

        if (floors && Array.isArray(floors)) {
            allRooms = [];
            floors.forEach(floor => {
                if (floor.rooms && Array.isArray(floor.rooms)) {
                    allRooms.push(...floor.rooms);
                }
            });
        }
        console.log("✓ rooms loaded:", allRooms.length);
        return { palaceData, allRooms };
    } catch (error) {
        console.error(error);
        return null;
    }
}
export function getRoomsByType(type) {
    if (type === 'all') return allRooms;
    return allRooms.filter(room => room.type === type);
}

export function searchRooms(query) {
    const lowerQuery = query.toLowerCase();
    return allRooms.filter(room => 
        room.name.toLowerCase().includes(lowerQuery) ||
        (room.description && room.description.toLowerCase().includes(lowerQuery))
    );
}

export function getRoomById(id) {
    return allRooms.find(room => room.id === id);
}
