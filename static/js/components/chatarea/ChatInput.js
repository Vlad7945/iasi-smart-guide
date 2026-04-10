export class ChatInput extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("chat-input-template");
        if (!template) {
            console.error("ChatInput template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        this.appendChild(clone);
        const form = this.querySelector("form");
        const input = this.querySelector("input");

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const value = input.value.trim();
            if (!value) return;
            this.dispatchEvent(new CustomEvent("chat-submit", {
                detail: value,
                bubbles: true
            }));
            input.value = "";
        });
    }
}
customElements.define("chat-input", ChatInput);