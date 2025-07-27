// js/admin.js

// Default admin credentials (HARUS DIUBAH PADA PRODUKSI SEBENARNYA!)
let adminCredentials = getData('adminCredentials', { username: 'admin', password: 'password123' });

const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const loginForm = document.getElementById('loginForm');
const closeLoginModalBtn = document.getElementById('closeModalBtn');
const adminPanel = document.getElementById('adminPanel');
const voucherSection = document.getElementById('voucherSection');
const voucherManagementSection = document.getElementById('voucherManagementSection');

const changeAdminCredsBtn = document.getElementById('changeAdminCredsBtn');
const changeAdminCredsModal = document.getElementById('changeAdminCredsModal'); // Anda perlu menambahkan ID ini di HTML
const closeChangeCredsModalBtn = document.getElementById('closeChangeCredsModalBtn'); // Anda perlu menambahkan ID ini di HTML
const changeCredsForm = document.getElementById('changeCredsForm'); // Anda perlu menambahkan ID ini di HTML

const editHeaderBtn = document.getElementById('editHeaderBtn');
const editHeaderModal = document.getElementById('editHeaderModal');
const closeEditHeaderModalBtn = document.getElementById('closeEditHeaderModalBtn');
const editHeaderForm = document.getElementById('editHeaderForm');
const headerTitleInput = document.getElementById('headerTitleInput');
const headerSubtitleInput = document.getElementById('headerSubtitleInput');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');


// Fungsi untuk memeriksa status login admin
function checkAdminLoginStatus() {
    const isLoggedIn = getData('adminLoggedIn', false);
    if (isLoggedIn) {
        adminLoginBtn.classList.add('hidden');
        adminLogoutBtn.classList.remove('hidden');
        adminPanel.classList.remove('hidden');
        voucherSection.classList.add('hidden'); // Sembunyikan voucher saat admin login
    } else {
        adminLoginBtn.classList.remove('hidden');
        adminLogoutBtn.classList.add('hidden');
        adminPanel.classList.add('hidden');
        voucherSection.classList.remove('hidden'); // Tampilkan voucher saat admin logout
        voucherManagementSection.classList.add('hidden'); // Pastikan management section tersembunyi
    }
}

// Event listener untuk tombol Login Admin
adminLoginBtn.addEventListener('click', () => {
    toggleModal('adminLoginModal', true);
});

// Event listener untuk tombol Logout Admin
adminLogoutBtn.addEventListener('click', () => {
    saveData('adminLoggedIn', false);
    showAlert('Logout Berhasil', 'Anda telah berhasil logout dari panel admin.');
    checkAdminLoginStatus();
    // Kembali ke tampilan utama
    voucherSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    voucherManagementSection.classList.add('hidden'); // Pastikan ini juga disembunyikan
});

// Event listener untuk submit form login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    if (usernameInput === adminCredentials.username && passwordInput === adminCredentials.password) {
        saveData('adminLoggedIn', true);
        toggleModal('adminLoginModal', false);
        showAlert('Login Berhasil', 'Selamat datang di halaman admin!');
        checkAdminLoginStatus();
    } else {
        showAlert('Login Gagal', 'Username atau password salah.');
    }
    loginForm.reset();
});

// Event listener untuk tombol tutup modal login
closeLoginModalBtn.addEventListener('click', () => {
    toggleModal('adminLoginModal', false);
});

// Event listener untuk tombol "Ubah User dan Password"
if (changeAdminCredsBtn) {
    changeAdminCredsBtn.addEventListener('click', () => {
        // Ambil nilai saat ini dan masukkan ke form
        document.getElementById('newUsernameInput').value = adminCredentials.username; // Anda perlu membuat input ini
        toggleModal('changeAdminCredsModal', true);
    });
}

if (closeChangeCredsModalBtn) {
    closeChangeCredsModalBtn.addEventListener('click', () => {
        toggleModal('changeAdminCredsModal', false);
    });
}

if (changeCredsForm) {
    changeCredsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPasswordInput').value; // Buat input ini
        const newUsername = document.getElementById('newUsernameInput').value;
        const newPassword = document.getElementById('newPasswordInput').value;
        const confirmNewPassword = document.getElementById('confirmNewPasswordInput').value;

        if (currentPassword !== adminCredentials.password) {
            showAlert('Gagal', 'Password lama salah.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showAlert('Gagal', 'Konfirmasi password baru tidak cocok.');
            return;
        }
        if (newPassword.length < 6) { // Contoh validasi
            showAlert('Gagal', 'Password baru minimal 6 karakter.');
            return;
        }

        adminCredentials = { username: newUsername, password: newPassword };
        saveData('adminCredentials', adminCredentials);
        showAlert('Berhasil', 'Username dan password admin berhasil diubah.');
        toggleModal('changeAdminCredsModal', false);
    });
}

// Event listener untuk tombol "Edit Header"
if (editHeaderBtn) {
    editHeaderBtn.addEventListener('click', () => {
        headerTitleInput.value = mainTitle.textContent;
        headerSubtitleInput.value = mainSubtitle.textContent;
        toggleModal('editHeaderModal', true);
    });
}

if (closeEditHeaderModalBtn) {
    closeEditHeaderModalBtn.addEventListener('click', () => {
        toggleModal('editHeaderModal', false);
    });
}

if (editHeaderForm) {
    editHeaderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        mainTitle.textContent = headerTitleInput.value;
        mainSubtitle.textContent = headerSubtitleInput.value;
        saveData('mainTitle', headerTitleInput.value);
        saveData('mainSubtitle', headerSubtitleInput.value);
        showAlert('Berhasil', 'Header berhasil diubah.');
        toggleModal('editHeaderModal', false);
    });
}

// Inisialisasi status login saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    checkAdminLoginStatus();
    // Muat teks header yang tersimpan (jika ada)
    const savedTitle = getData('mainTitle', 'EZvoucher - Voucher WiFi Unlimited');
    const savedSubtitle = getData('mainSubtitle', 'Dapatkan akses internet tanpa batas. Pilih paket yang sesuai dengan kebutuhan Anda!');
    mainTitle.textContent = savedTitle;
    mainSubtitle.textContent = savedSubtitle;
});