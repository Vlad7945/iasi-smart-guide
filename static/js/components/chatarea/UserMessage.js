export class UserMessage extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("user-message-template");
        if (!template) {
            console.error("User message template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        const content = this.getAttribute("text") || "";
        clone.querySelector(".message-content").textContent = content;
        this.replaceWith(clone);
    }
}
customElements.define("user-message", UserMessage);