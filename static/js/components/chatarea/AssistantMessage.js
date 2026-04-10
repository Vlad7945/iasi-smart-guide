export class AssistantMessage extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("assistant-message-template");
        if (!template) {
            console.error("Assistant message template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        const container = clone.querySelector(".message-content");
        const content = this.getAttribute("text");
        if (content !== null) {
            container.textContent = content;
        }
        else {
            container.innerHTML = this.innerHTML;
        }
        this.replaceWith(clone);
    }
}
customElements.define("assistant-message", AssistantMessage);