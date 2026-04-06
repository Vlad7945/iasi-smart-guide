export class SidebarSearch extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("sidebar-search-template");
        const clone = template.content.cloneNode(true);
        this.innerHTML = "";
        this.appendChild(clone);
        const input = this.querySelector("input");
        input.addEventListener("input", (e) => {
            this.dispatchEvent(new CustomEvent("search-change", {
                detail: e.target.value,
                bubbles: true
            }));
        });
    }
}
customElements.define("sidebar-search", SidebarSearch);