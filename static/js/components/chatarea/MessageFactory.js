import './DefaultMessage.js'
import './AssistantMessage.js'
export class MessageFactory{
    static createMessage(type, content, isHtml = false){
        let msg;
        switch (type){
            case "user":
                msg = document.createElement("user-message");
                break;
            case "assistant":
                msg = document.createElement("assistant-message");
                break;
            default:
                console.error("UNKNOWN MESSAGE TYPE");
                return null;

        }
        if (isHtml) {
            msg.innerHTML = content;
        } else {
            msg.setAttribute("text", content);
        }
        return msg;
    }
}