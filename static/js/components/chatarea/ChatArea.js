import {MessageFactory} from './MessageFactory.js'
export class ChatArea extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById("chat-template");
        if (!template) {
            console.error("Chat template missing");
            return;
        }
        const clone = template.content.cloneNode(true);
        const originalChildren = Array.from(this.children);
        this.innerHTML = "";
        this.appendChild(clone);
        this.messagesSlot = this.querySelector(".messages-slot");
        this.inputArea = this.querySelector(".input-area");
        originalChildren.forEach(child => {
            if (child.tagName === "CHAT-INPUT"){
                this.appendChild(child);
            } else {
                this.messagesSlot.appendChild(child);
            }
        });


    }
    scrollToBottom() {
        this.messagesSlot.scrollTop = this.messagesSlot.scrollHeight;
    }
    addMessage(type,content, isHtml = false){
        const msg = MessageFactory.createMessage(type, content, isHtml);
        if (!msg) return null;
        else {
            if (!this.messagesSlot) {
                this.messagesSlot = this.querySelector(".messages-slot");
            }
            if (!this.messagesSlot) {
                console.error("messagesSlot not found");
                return;
            }
            this.messagesSlot.appendChild(msg);
            this.scrollToBottom();
        }
    }
    reset() {
        if (!this.messagesSlot) {
            this.messagesSlot = this.querySelector(".messages-slot");
        }
        if (!this.messagesSlot) return;
        this.messagesSlot.innerHTML = "";
        const msg = document.createElement("default-message");
        this.messagesSlot.appendChild(msg);
        this.scrollToBottom();
    }
    // ugly HTML in JS TODO fix
    showInfo() {
        this.addMessage("assistant", `
            <div style="line-height: 1.5; color: #333; font-size: 0.9rem;">
                <div style="margin-bottom: 0.5rem; font-weight: 600; font-size: 1rem; color: #b8860b;">
                    🏛️ Palace of Culture (Palatul Culturii)
                </div>
                <div style="margin-bottom: 0.2rem;"><strong>📍 Location:</strong> Boulevard Ștefan cel Mare și Sfânt 1, Iași</div>
                <div style="margin-bottom: 0.2rem;"><strong>🏗️ Construction:</strong> 1906 - 1925</div>
                <div style="margin-bottom: 0.2rem;"><strong>👨‍🏫 Architects:</strong> Ion D. Berindey, Alexandru D. Xenopol, Grigore Cerchez</div>
                <div style="margin-bottom: 0.2rem;"><strong>📏 Height:</strong> 55 meters</div>
                <div style="margin-bottom: 0.2rem;"><strong>🏛️ Architectural Style:</strong> Neo-Gothic & Neoclassical</div>
                <div style="margin-bottom: 0.2rem;"><strong>⏰ Opening Hours:</strong></div>
                <div style="margin-left: 1.2rem; margin-bottom: 0.2rem; font-size: 0.85rem;">
                    📅 Monday & Tuesday: Closed<br>
                    📅 Wednesday - Sunday: 10:00 - 17:00
                </div>
                <div style="margin-bottom: 0.2rem;"><strong>📞 Contact:</strong> +40 232 275 979</div>
                <div style="margin-bottom: 0.2rem;"><strong>🌐 Website:</strong> www.palatulculturii.ro</div>
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd; font-style: italic; color: #666; font-size: 0.85rem;">
                    This iconic Neo-Gothic building houses multiple museums and cultural institutions dedicated to Moldavian heritage and history.
                </div>
            </div>
        `, true);
    }

}
customElements.define("chat-area", ChatArea);