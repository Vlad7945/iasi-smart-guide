import {open_close_sidebar} from "../../util/open_close_sidebar.js"
export class CloseSidebarButton extends HTMLElement{
    connectedCallback(){
        const template = document.getElementById("close-sidebar-button-template");
        if (!template) {
            console.error("Toggle menu template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        this.appendChild(clone);
        const btn = this.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                open_close_sidebar();
            });
        }
    }
}
customElements.define("close-sidebar-button", CloseSidebarButton);