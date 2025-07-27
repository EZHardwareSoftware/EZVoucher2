// js/utils.js

// Fungsi untuk menampilkan custom alert
function showAlert(title, message) {
    const alertOverlay = document.getElementById('customAlert');
    const alertTitle = alertOverlay.querySelector('h3');
    const alertMessage = alertOverlay.querySelector('p');
    const alertButton = alertOverlay.querySelector('button');

    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertOverlay.classList.add('show');

    alertButton.onclick = () => {
        alertOverlay.classList.remove('show');
    };
}

// Fungsi untuk memformat angka menjadi mata uang Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Fungsi untuk menyimpan data ke Local Storage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving to localStorage", e);
        showAlert("Error", "Gagal menyimpan data ke penyimpanan lokal.");
    }
}

// Fungsi untuk mengambil data dari Local Storage
function getData(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error("Error reading from localStorage", e);
        showAlert("Error", "Gagal membaca data dari penyimpanan lokal.");
        return defaultValue;
    }
}

// Fungsi untuk mengatur tampilan modal (show/hide)
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (show) {
            modal.classList.add('show');
        } else {
            modal.classList.remove('show');
        }
    }
}

// Fungsi untuk mendapatkan tanggal saat ini dalam format YYYY-MM-DD
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fungsi untuk mendapatkan tanggal dan waktu saat ini
function updateDateTimeDisplay() {
    const dateTimeDisplay = document.getElementById('dateTimeDisplay');
    if (dateTimeDisplay) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        dateTimeDisplay.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// Panggil updateDateTimeDisplay setiap detik
setInterval(updateDateTimeDisplay, 1000);
updateDateTimeDisplay(); // Panggil sekali saat dimuat