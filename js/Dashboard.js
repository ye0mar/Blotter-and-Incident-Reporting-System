// ===== CUSTOM STATUS DROPDOWN =====
const trigger = document.getElementById('statusTrigger');
const menu = document.getElementById('statusMenu');
const label = document.getElementById('statusLabel');

trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    trigger.classList.toggle('open', !isOpen);
});

menu.querySelectorAll('.dropdown-option').forEach(opt => {
    opt.addEventListener('click', function() {
        menu.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        label.textContent = this.dataset.value;
        menu.classList.remove('open');
        trigger.classList.remove('open');
    });
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('#statusContainer')) {
        menu.classList.remove('open');
        trigger.classList.remove('open');
    }
});

// ===== SIDEBAR NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== HAMBURGER / SIDEBAR DRAWER =====
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
}

hamburgerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay.addEventListener('click', closeSidebar);

// Close drawer when a nav item is clicked on mobile
document.querySelectorAll('.nav-item, .sub-item').forEach(item => {
    item.addEventListener('click', function() {
        if (window.innerWidth <= 768) closeSidebar();
    });
});