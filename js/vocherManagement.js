// js/voucherManagement.js

let vouchers = getData('vouchers', {}); // { A: [], B: [], ... }
let voucherDurations = getData('voucherDurations', { // Durasi default
    'A': { label: '3 Jam', price: 5000 },
    'B': { label: '6 Jam', price: 8000 },
    'C': { label: '12 Jam', price: 15000 },
    'D': { label: '24 Jam', price: 25000 },
    'E': { label: '3 Hari', price: 60000 },
    'F': { label: '7 Hari', price: 120000 },
    'G': { label: '14 Hari', price: 200000 },
    'H': { label: '30 Hari', price: 300000 }
});
let currentPage = 1;
const ITEMS_PER_PAGE = 20; // Jumlah item per halaman

const voucherManagementSection = document.getElementById('voucherManagementSection');
const viewVouchersBtn = document.getElementById('viewVouchersBtn');
const backToAdminPanelFromVoucherMgmt = document.getElementById('backToAdminPanelFromVoucherMgmt');

const selectColumn = document.getElementById('selectColumn');
const excelPasteArea = document.getElementById('excelPasteArea');
const loadColumnDataBtn = document.getElementById('loadColumnDataBtn');
const voucherColumnsContainer = document.getElementById('voucherColumnsContainer');
const totalRowContainer = document.getElementById('totalRowContainer');

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');

const refreshVoucherDataBtn = document.getElementById('refreshVoucherDataBtn');
const multiSelectToggleBtn = document.getElementById('multiSelectToggleBtn');
const deleteSelectedVoucherBtn = document.getElementById('deleteSelectedVoucherBtn');

let multiSelectMode = false;
let selectedVouchers = new Set(); // Set untuk menyimpan voucher yang dipilih


// Fungsi untuk merender kolom voucher
function renderVoucherColumns() {
    voucherColumnsContainer.innerHTML = '';
    totalRowContainer.innerHTML = ''; // Bersihkan total row juga

    const columns = Object.keys(voucherDurations).sort(); // Urutkan A, B, C...

    columns.forEach(colKey => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'voucher-column';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'voucher-column-header text-gray-800';
        headerDiv.textContent = `Kolom ${colKey}`;
        columnDiv.appendChild(headerDiv);

        const listDiv = document.createElement('div');
        listDiv.className = 'flex-grow overflow-y-auto max-h-80 border border-gray-200 rounded-md p-1'; // Scrollable area
        
        const columnData = vouchers[colKey] || [];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pagedData = columnData.slice(startIndex, endIndex);

        if (pagedData.length === 0) {
            const noData = document.createElement('div');
            noData.className = 'text-center text-gray-500 text-sm py-2';
            noData.textContent = 'Tidak ada voucher';
            listDiv.appendChild(noData);
        } else {
            pagedData.forEach(voucherCode => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'voucher-column-row truncate';
                rowDiv.textContent = voucherCode;
                rowDiv.dataset.column = colKey;
                rowDiv.dataset.voucher = voucherCode;

                if (multiSelectMode && selectedVouchers.has(voucherCode)) {
                    rowDiv.classList.add('selected-voucher-row');
                }

                rowDiv.addEventListener('click', () => {
                    if (multiSelectMode) {
                        if (selectedVouchers.has(voucherCode)) {
                            selectedVouchers.delete(voucherCode);
                            rowDiv.classList.remove('selected-voucher-row');
                        } else {
                            selectedVouchers.add(voucherCode);
                            rowDiv.classList.add('selected-voucher-row');
                        }
                        updateDeleteButtonState();
                    } else {
                        // Logika untuk memilih single voucher jika tidak dalam mode multi-select
                        // Atau bisa juga memunculkan modal detail voucher, dll.
                        console.log(`Voucher ${voucherCode} dari kolom ${colKey} dipilih.`);
                    }
                });
                listDiv.appendChild(rowDiv);
            });
        }
        columnDiv.appendChild(listDiv);
        voucherColumnsContainer.appendChild(columnDiv);

        // Render total box
        const totalBox = document.createElement('div');
        totalBox.className = 'total-box';
        totalBox.innerHTML = `Kolom ${colKey}<br>${columnData.length}`;
        totalRowContainer.appendChild(totalBox);
    });

    updatePaginationButtons();
    updatePageInfo();
}

// Fungsi untuk mengisi opsi selectColumn
function populateSelectColumn() {
    selectColumn.innerHTML = '';
    const columns = Object.keys(voucherDurations).sort();
    columns.forEach(colKey => {
        const option = document.createElement('option');
        option.value = colKey;
        option.textContent = `Kolom ${colKey}`;
        selectColumn.appendChild(option);
    });
}

// Event listener untuk tombol "Kelola Voucher"
viewVouchersBtn.addEventListener('click', () => {
    if (getData('adminLoggedIn', false)) {
        adminPanel.classList.add('hidden');
        voucherManagementSection.classList.remove('hidden');
        populateSelectColumn();
        renderVoucherColumns();
    } else {
        showAlert('Akses Ditolak', 'Anda harus login sebagai admin untuk mengakses fitur ini.');
    }
});

// Event listener untuk tombol "Kembali ke Halaman Admin"
backToAdminPanelFromVoucherMgmt.addEventListener('click', () => {
    voucherManagementSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    multiSelectMode = false; // Reset mode multi-select
    selectedVouchers.clear();
    updateDeleteButtonState();
    renderVoucherColumns(); // Render ulang untuk membersihkan highlight
});

// Event listener untuk memuat data ke kolom
loadColumnDataBtn.addEventListener('click', () => {
    const selectedCol = selectColumn.value;
    const pastedData = excelPasteArea.value.trim();

    if (!selectedCol) {
        showAlert('Pilih Kolom', 'Mohon pilih kolom terlebih dahulu.');
        return;
    }
    if (!pastedData) {
        showAlert('Data Kosong', 'Mohon tempel data voucher di area teks.');
        return;
    }

    const newVouchers = pastedData.split('\n').map(line => line.trim()).filter(line => line !== '');

    if (!vouchers[selectedCol]) {
        vouchers[selectedCol] = [];
    }

    // Gabungkan data baru, filter duplikat, dan urutkan
    const combinedVouchers = [...new Set([...vouchers[selectedCol], ...newVouchers])].sort();
    vouchers[selectedCol] = combinedVouchers;

    saveData('vouchers', vouchers);
    showAlert('Berhasil', `Data voucher berhasil dimuat ke Kolom ${selectedCol}.`);
    excelPasteArea.value = ''; // Kosongkan area teks
    renderVoucherColumns();
});

// Event listener untuk tombol Refresh Voucher
refreshVoucherDataBtn.addEventListener('click', () => {
    vouchers = getData('vouchers', {}); // Muat ulang dari local storage
    selectedVouchers.clear(); // Hapus pilihan jika ada
    multiSelectMode = false; // Nonaktifkan mode multi-select
    showAlert('Refresh Data', 'Data voucher telah dimuat ulang.');
    renderVoucherColumns();
    updateDeleteButtonState();
});

// Event listener untuk tombol Multi Select Toggle
multiSelectToggleBtn.addEventListener('click', () => {
    multiSelectMode = !multiSelectMode;
    multiSelectToggleBtn.textContent = multiSelectMode ? 'Nonaktifkan Mode Hapus' : 'Mode Hapus Voucher';
    if (!multiSelectMode) {
        selectedVouchers.clear(); // Bersihkan pilihan saat keluar mode
    }
    renderVoucherColumns(); // Render ulang untuk menerapkan atau menghapus highlight
    updateDeleteButtonState();
});

// Fungsi untuk memperbarui status tombol hapus
function updateDeleteButtonState() {
    deleteSelectedVoucherBtn.disabled = selectedVouchers.size === 0 || !multiSelectMode;
    if (deleteSelectedVoucherBtn.disabled) {
        deleteSelectedVoucherBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        deleteSelectedVoucherBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Event listener untuk tombol Hapus Voucher Terpilih
deleteSelectedVoucherBtn.addEventListener('click', () => {
    if (!multiSelectMode) {
        showAlert('Mode Tidak Aktif', 'Aktifkan "Mode Hapus Voucher" terlebih dahulu.');
        return;
    }
    if (selectedVouchers.size === 0) {
        showAlert('Tidak Ada Voucher', 'Tidak ada voucher yang dipilih untuk dihapus.');
        return;
    }

    if (confirm(`Anda yakin ingin menghapus ${selectedVouchers.size} voucher terpilih?`)) {
        for (const colKey in vouchers) {
            vouchers[colKey] = vouchers[colKey].filter(voucher => !selectedVouchers.has(voucher));
        }
        saveData('vouchers', vouchers);
        showAlert('Berhasil', `${selectedVouchers.size} voucher berhasil dihapus.`);
        selectedVouchers.clear(); // Bersihkan pilihan setelah dihapus
        renderVoucherColumns();
        updateDeleteButtonState();
    }
});

// Pagination Logic
function updatePaginationButtons() {
    const maxPages = Math.ceil(Object.values(vouchers).flat().length / ITEMS_PER_PAGE); // Hitung total voucher
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= maxPages;

    if (prevPageBtn.disabled) {
        prevPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        prevPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (nextPageBtn.disabled) {
        nextPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        nextPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function updatePageInfo() {
    const totalVouchersCount = Object.values(vouchers).flat().length;
    const maxPages = Math.max(1, Math.ceil(totalVouchersCount / ITEMS_PER_PAGE)); // Pastikan minimal 1 halaman
    pageInfo.textContent = `Page ${currentPage} of ${maxPages}`;
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderVoucherColumns();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalVouchersCount = Object.values(vouchers).flat().length;
    const maxPages = Math.ceil(totalVouchersCount / ITEMS_PER_PAGE);
    if (currentPage < maxPages) {
        currentPage++;
        renderVoucherColumns();
    }
});


// Edit Voucher Durasi dan Tarif Modal
const editVoucherBtn = document.getElementById('editVoucherBtn');
const editVoucherModal = document.getElementById('editVoucherModal');
const closeEditVoucherModalBtn = document.getElementById('closeEditVoucherModalBtn');
const editVoucherForm = document.getElementById('editVoucherForm');
const saveVoucherChangesBtn = document.getElementById('saveVoucherChangesBtn');
const cancelEditVoucherBtn = document.getElementById('cancelEditVoucherBtn');

function renderEditVoucherForm() {
    editVoucherForm.innerHTML = '';
    const columns = Object.keys(voucherDurations).sort();

    columns.forEach(colKey => {
        const voucherData = voucherDurations[colKey];
        const cardDiv = document.createElement('div');
        cardDiv.className = 'bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200';
        if (document.body.classList.contains('dark-mode')) { // Adjust for dark mode if necessary
            cardDiv.classList.add('bg-gray-700', 'border-gray-600');
        }

        cardDiv.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-3 text-center">Voucher Kolom ${colKey}</h3>
            <div class="space-y-3">
                <div>
                    <label for="duration-${colKey}" class="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                    <input type="text" id="duration-${colKey}" value="${voucherData.label}" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900">
                </div>
                <div>
                    <label for="price-${colKey}" class="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                    <input type="number" id="price-${colKey}" value="${voucherData.price}" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900">
                </div>
            </div>
        `;
        editVoucherForm.appendChild(cardDiv);
    });
}

editVoucherBtn.addEventListener('click', () => {
    if (getData('adminLoggedIn', false)) {
        renderEditVoucherForm();
        toggleModal('editVoucherModal', true);
    } else {
        showAlert('Akses Ditolak', 'Anda harus login sebagai admin untuk mengakses fitur ini.');
    }
});

closeEditVoucherModalBtn.addEventListener('click', () => {
    toggleModal('editVoucherModal', false);
});

cancelEditVoucherBtn.addEventListener('click', () => {
    toggleModal('editVoucherModal', false);
});

saveVoucherChangesBtn.addEventListener('click', () => {
    const newVoucherDurations = {};
    let hasError = false;

    Object.keys(voucherDurations).sort().forEach(colKey => {
        const durationInput = document.getElementById(`duration-${colKey}`);
        const priceInput = document.getElementById(`price-${colKey}`);

        if (durationInput && priceInput) {
            const duration = durationInput.value.trim();
            const price = parseInt(priceInput.value);

            if (!duration || isNaN(price) || price < 0) {
                showAlert('Input Tidak Valid', `Mohon isi Durasi dan Harga untuk Kolom ${colKey} dengan benar.`);
                hasError = true;
                return;
            }
            newVoucherDurations[colKey] = { label: duration, price: price };
        }
    });

    if (hasError) return;

    voucherDurations = newVoucherDurations;
    saveData('voucherDurations', voucherDurations);
    showAlert('Berhasil', 'Durasi dan harga voucher berhasil diperbarui.');
    toggleModal('editVoucherModal', false);
    // Render ulang tampilan utama voucher cards agar perubahan terlihat
    // Anda mungkin perlu memanggil fungsi renderVoucherCards() dari main.js di sini
    // atau memiliki event custom yang dipicu
    document.dispatchEvent(new CustomEvent('vouchersUpdated')); // Trigger event untuk main.js
});