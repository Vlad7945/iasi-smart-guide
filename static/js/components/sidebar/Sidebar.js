export class Sidebar extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("sidebar-template");
        const clone = template.content.cloneNode(true);
        const originalChildren = Array.from(this.children);
        this.innerHTML = "";
        this.appendChild(clone);
        const section = this.querySelector(".sidebar-section");
        originalChildren.forEach(child => {
            section.appendChild(child);
        });
        // state
        this.rooms = [];
        this.filter = "all";
        this.search = "";
        this.list = this.querySelector(".rooms-list");
        this.addEventListener("search-change", (e) => {
            this.search = e.detail;
            this.update();
        });

        this.addEventListener("filter-change", (e) => {
            this.filter = e.detail;
            this.update();
        });
    }
    //
    setRooms(rooms) {
        this.rooms = rooms;
        this.update();
    }
    getFilteredRooms() {
        return this.rooms.filter(room => {
            return this.matchesFilter(room) && this.matchesSearch(room);
        });
    }
    matchesFilter(room) {
        return this.filter === "all" || room.type === this.filter;
    }
    matchesSearch(room) {
        if (!this.search) return true;
        return room.name
            .toLowerCase()
            .includes(this.search.toLowerCase());
    }
    renderRooms(rooms) {
        this.list.innerHTML = "";
        rooms.forEach(room => {
            const item = document.createElement("room-item");
            item.setAttribute("id", room.id);
            item.setAttribute("name", room.name);
            item.setAttribute("type", room.type);
            item.setAttribute("floor", room.floor);
            this.list.appendChild(item);
        });
    }
    update() {
        const rooms = this.getFilteredRooms();
        this.renderRooms(rooms);
    }
}
customElements.define("sidebar-element", Sidebar);