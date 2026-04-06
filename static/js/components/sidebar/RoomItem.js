export class RoomItem extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("room-item-template");
        const clone = template.content.cloneNode(true);
        const id = this.getAttribute("id");
        const name = this.getAttribute("name");
        const type = this.getAttribute("type");
        const floor = this.getAttribute("floor");
        clone.querySelector(".room-name").textContent = name || "";
        clone.querySelector(".room-type").textContent = type || "";
        clone.querySelector(".room-floor-info").textContent = floor ? `Floor ${floor}` : "";
        this.innerHTML = "";
        this.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("room-selected", {
                detail: this.getAttribute("id"),
                bubbles: true
            }));
        });
        this.appendChild(clone);
    }
}
customElements.define("room-item", RoomItem);