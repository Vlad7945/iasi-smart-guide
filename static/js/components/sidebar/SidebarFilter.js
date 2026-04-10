export class SidebarFilter extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("sidebar-filter-template");
        const clone = template.content.cloneNode(true);
        this.innerHTML = "";
        this.appendChild(clone);
        const buttons = this.querySelectorAll(".filter-tab");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.dispatchEvent(new CustomEvent("filter-change", {
                    detail: btn.getAttribute("data-filter"),
                    bubbles: true
                }));
            });
        });
    }
}

customElements.define("sidebar-filter", SidebarFilter);