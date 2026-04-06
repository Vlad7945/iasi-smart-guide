export class ToggleMenuButton extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("toggle-menu-template");
        if (!template) {
            console.error("Toggle menu template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        this.appendChild(clone);
        const btn = this.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-open');
                console.log("menu clicked")
            });
        }
    }
}

customElements.define("toggle-menu-button", ToggleMenuButton);