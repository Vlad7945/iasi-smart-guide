console.log("Banner.js LOADED");

export class Banner extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("banner-template");
        if (!template) {
            console.error("Banner template not found");
            return;
        }
        const clone = template.content.cloneNode(true);
        const title = this.getAttribute("title");
        const subtitle = this.getAttribute("subtitle");
        if (title) {
            clone.querySelector(".logo-title").textContent = title;
        }
        if (subtitle) {
            clone.querySelector(".logo-subtitle").textContent = subtitle;
        }
        const actionButtonsSlot = clone.querySelector(".action-btns-slot");
        const menuSlot = clone.querySelector(".menu-slot");
        const children = Array.from(this.children); // REAL elements

        children.forEach(child => {
            if (child.tagName === "TOGGLE-MENU-BUTTON") {
                menuSlot.appendChild(child);
            } else {
                actionButtonsSlot.appendChild(child);
            }
        });
        this.innerHTML = "";
        this.appendChild(clone);
    }
}

customElements.define("banner-element", Banner);