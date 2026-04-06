export class InfoButton extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("info-button-template");
        if (!template) {
            console.error("Info button template missing");
            return;
        }
        const clone = template.content.cloneNode(true);

        this.appendChild(clone);
        this.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("info-clicked", {
        bubbles: true
    }));
});
    }
}

customElements.define("info-button", InfoButton);