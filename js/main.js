// js/main.js

const voucherSection = document.getElementById('voucherSection');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const paymentMethodModal = document.getElementById('paymentMethodModal');
const closePaymentMethodModalBtn = document.getElementById('closePaymentMethodModalBtn');
const paymentForm = document.getElementById('paymentForm');

let selectedVoucher = null; // Untuk menyimpan voucher yang dipilih pengguna

// Fungsi untuk merender voucher cards di halaman utama
function renderVoucherCards() {
    voucherSection.innerHTML = '';
    const columns = Object.keys(voucherDurations).sort();

    columns.forEach(colKey => {
        const voucherData = voucherDurations[colKey];
        const availableVouchers = vouchers[colKey] ? vouchers[colKey].length : 0;

        const cardDiv = document.createElement('div');
        cardDiv.className = 'bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 relative border border-gray-200';
        if (availableVouchers === 0) {
            cardDiv.classList.add('opacity-70', 'cursor-not-allowed', 'filter', 'grayscale'); // Tampilan disabled
        } else {
            cardDiv.classList.add('cursor-pointer');
            cardDiv.addEventListener('click', () => handleVoucherClick(colKey, voucherData.price));
        }

        if (document.body.classList.contains('dark-mode')) {
            cardDiv.classList.remove('bg-white', 'border-gray-200');
            cardDiv.classList.add('bg-gray-800', 'border-gray-700', 'text-gray-100');
        }

        cardDiv.innerHTML = `
            <div class="absolute top-3 right-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Kolom ${colKey}</div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">${voucherData.label}</h3>
            <p class="text-gray-700 dark:text-gray-300 text-lg mb-4">Rp ${formatRupiah(voucherData.price)}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Tersedia: <span class="font-semibold">${availableVouchers}</span> Voucher</p>
            ${availableVouchers > 0 ? `
                <button class="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 shadow-md">
                    Beli Sekarang
                </button>
            ` : `
                <button class="mt-5 w-full bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">
                    Stok Habis
                </button>
            `}
        `;
        voucherSection.appendChild(cardDiv);
    });
}

// Fungsi ketika voucher card diklik
function handleVoucherClick(colKey, price) {
    // Hanya izinkan pembelian jika ada voucher yang tersedia
    if (!vouchers[colKey] || vouchers[colKey].length === 0) {
        showAlert('Stok Habis', `Maaf, voucher untuk durasi ${voucherDurations[colKey].label} saat ini sedang kosong.`);
        return;
    }

    // Ambil voucher pertama yang tersedia dari kolom yang dipilih
    const voucherCode = vouchers[colKey][0];
    if (!voucherCode) {
        showAlert('Stok Habis', `Maaf, voucher untuk durasi ${voucherDurations[colKey].label} saat ini sedang kosong.`);
        return;
    }

    selectedVoucher = {
        colKey: colKey,
        price: price,
        code: voucherCode
    };

    document.getElementById('paymentVoucherLabel').textContent = voucherDurations[colKey].label;
    document.getElementById('paymentVoucherPrice').textContent = formatRupiah(price);
    toggleModal('paymentMethodModal', true);
}

// Event listener untuk tombol tutup modal pembayaran
if (closePaymentMethodModalBtn) {
    closePaymentMethodModalBtn.addEventListener('click', () => {
        toggleModal('paymentMethodModal', false);
        selectedVoucher = null; // Reset pilihan
    });
}

// Event listener untuk submit form pembayaran
if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        if (!whatsappNumber || !paymentMethod) {
            showAlert('Input Tidak Lengkap', 'Mohon lengkapi nomor WhatsApp dan pilih metode pembayaran.');
            return;
        }

        if (!selectedVoucher) {
            showAlert('Kesalahan', 'Tidak ada voucher yang dipilih.');
            return;
        }

        const { colKey, price, code } = selectedVoucher;

        // Simulasi proses pembayaran
        showAlert('Pembayaran Sedang Diproses', `Anda akan membeli voucher ${voucherDurations[colKey].label} seharga ${formatRupiah(price)}.`);

        setTimeout(() => {
            // Hapus voucher dari daftar yang tersedia
            vouchers[colKey] = vouchers[colKey].filter(v => v !== code);
            saveData('vouchers', vouchers);

            // Catat penjualan
            recordSale(price, whatsappNumber, code); // recordSale dari sales.js

            // Render ulang kartu voucher untuk menampilkan jumlah yang diperbarui
            renderVoucherCards();
            toggleModal('paymentMethodModal', false);
            paymentForm.reset(); // Reset form pembayaran

        }, 2000); // Simulasi penundaan 2 detik
    });
}


// Theme Toggle Logic
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = 'Mode Terang';
        // Adjust elements that Tailwind doesn't automatically handle for dark mode
        document.querySelectorAll('.bg-white').forEach(el => {
            el.classList.remove('bg-white');
            el.classList.add('bg-gray-800');
        });
        document.querySelectorAll('.text-gray-900').forEach(el => {
            el.classList.remove('text-gray-900');
            el.classList.add('text-gray-100');
        });
        // Add more specific dark mode adjustments if needed for elements outside the general styles
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.textContent = 'Mode Gelap';
        // Reverse adjustments for light mode
        document.querySelectorAll('.bg-gray-800').forEach(el => {
            el.classList.remove('bg-gray-800');
            el.classList.add('bg-white');
        });
        document.querySelectorAll('.text-gray-100').forEach(el => {
            el.classList.remove('text-gray-100');
            el.classList.add('text-gray-900');
        });
    }
}

themeToggleBtn.addEventListener('click', () => {
    let isDarkMode = document.body.classList.contains('dark-mode');
    isDarkMode = !isDarkMode; // Toggle
    localStorage.setItem('darkMode', isDarkMode); // Save preference
    applyTheme(isDarkMode);
    renderVoucherCards(); // Render ulang kartu voucher untuk menyesuaikan warna
});

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        applyTheme(true);
    } else {
        applyTheme(false);
    }

    renderVoucherCards(); // Render kartu voucher saat halaman dimuat

    // Listen for custom event from voucherManagement.js to re-render cards
    document.addEventListener('vouchersUpdated', () => {
        // Muat ulang data voucher dan render ulang kartu
        vouchers = getData('vouchers', {});
        voucherDurations = getData('voucherDurations', { /* default values */ });
        renderVoucherCards();
    });
});