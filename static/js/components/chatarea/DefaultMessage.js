export class DefaultMessage extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("default-message-template");
        if (!template) {
            console.error("Welcome template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        this.appendChild(clone);
    }
}
customElements.define("default-message", DefaultMessage);