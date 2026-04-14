export function open_close_sidebar(){
    console.log("open_close_sidebar() called");
    const app_container = document.querySelector(".app-container");
    app_container.setAttribute('data-sidebar-state',
        app_container.getAttribute('data-sidebar-state') === 'open' ? 'closed' : 'open');
}
