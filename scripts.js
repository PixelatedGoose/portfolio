function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hide');
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.classList.add('hide');
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            closeModal(modals[i].id);
        }
    }
}