export class ReloadButton extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("reload-button-template");
        if (!template) {
            console.error("Reload button template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        this.appendChild(clone);
        this.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("reset-clicked", {
        bubbles: true
    }));
});
    }
    reset() {
        if (!this.messagesSlot)
            this.messagesSlot = this.querySelector(".messages-slot");
        if (!this.messagesSlot) return;
        this.messagesSlot.innerHTML = "";
        let defaultmsg = document.createElement("default-message")
            this.addMessage("assistant", defaultmsg);
    }
}

customElements.define("reload-button", ReloadButton);