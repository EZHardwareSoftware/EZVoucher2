// js/sales.js

let salesData = getData('salesData', []); // Array of { price, whatsapp, code, date }

const salesReportBtn = document.getElementById('salesReportBtn');
const salesReportModal = document.getElementById('salesReportModal');
const closeSalesReportModalBtn = document.getElementById('closeSalesReportModalBtn');
const salesReportContent = document.getElementById('salesReportContent');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const generateCustomReportBtn = document.getElementById('generateCustomReportBtn');

const salesDataBtn = document.getElementById('salesDataBtn');
const salesDataModal = document.getElementById('salesDataModal');
const closeSalesDataModalBtn = document.getElementById('closeSalesDataModalBtn');
const salesList = document.getElementById('salesList');

// Fungsi untuk mencatat penjualan baru
function recordSale(price, whatsapp, code) {
    const sale = {
        price: price,
        whatsapp: whatsapp,
        code: code,
        date: new Date().toISOString() // Simpan tanggal dalam format ISO
    };
    salesData.push(sale);
    saveData('salesData', salesData);
    console.log("Penjualan dicatat:", sale);
    showAlert('Penjualan Berhasil!', `Voucher ${code} seharga ${formatRupiah(price)} telah dijual.`);
}

// Fungsi untuk menampilkan data penjualan
function renderSalesData() {
    salesList.innerHTML = '';
    if (salesData.length === 0) {
        salesList.innerHTML = '<li class="no-sales-message">Belum ada data penjualan.</li>';
        return;
    }

    // Header tabel
    const headerRow = document.createElement('li');
    headerRow.className = 'sales-header';
    headerRow.innerHTML = `
        <div>Harga</div>
        <div>WhatsApp</div>
        <div>Kode Voucher</div>
        <div>Tanggal</div>
    `;
    salesList.appendChild(headerRow);

    // Urutkan data penjualan dari yang terbaru
    const sortedSales = [...salesData].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedSales.forEach(sale => {
        const saleItem = document.createElement('li');
        saleItem.className = 'sales-item';

        const saleDate = new Date(sale.date);
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = saleDate.toLocaleDateString('id-ID', dateOptions);

        saleItem.innerHTML = `
            <div class="sales-price">${formatRupiah(sale.price)}</div>
            <div>${sale.whatsapp || '-'}</div>
            <div>${sale.code}</div>
            <div class="sales-date">${formattedDate}</div>
        `;
        salesList.appendChild(saleItem);
    });
}

// Event listener untuk tombol "Data Penjualan"
salesDataBtn.addEventListener('click', () => {
    if (getData('adminLoggedIn', false)) {
        renderSalesData();
        toggleModal('salesDataModal', true);
    } else {
        showAlert('Akses Ditolak', 'Anda harus login sebagai admin untuk mengakses fitur ini.');
    }
});

// Event listener untuk tombol tutup modal data penjualan
if (closeSalesDataModalBtn) {
    closeSalesDataModalBtn.addEventListener('click', () => {
        toggleModal('salesDataModal', false);
    });
}

// Fungsi untuk membuat laporan penjualan berdasarkan rentang tanggal
function generateSalesReport(startDate, endDate) {
    salesReportContent.innerHTML = ''; // Bersihkan konten sebelumnya

    let filteredSales = salesData;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Akhir hari

        filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });
    }

    if (filteredSales.length === 0) {
        salesReportContent.innerHTML = '<p class="text-center text-gray-600 mt-4">Tidak ada penjualan dalam periode ini.</p>';
        return;
    }

    // Hitung total pendapatan per jenis voucher
    const revenueByVoucher = {};
    let totalOverallRevenue = 0;
    let totalVouchersSold = 0;

    filteredSales.forEach(sale => {
        const label = Object.values(voucherDurations).find(v => v.price === sale.price)?.label || 'Tidak Diketahui';
        if (!revenueByVoucher[label]) {
            revenueByVoucher[label] = { count: 0, totalRevenue: 0 };
        }
        revenueByVoucher[label].count++;
        revenueByVoucher[label].totalRevenue += sale.price;
        totalOverallRevenue += sale.price;
        totalVouchersSold++;
    });

    salesReportContent.innerHTML += `<h3 class="font-semibold text-gray-800 mb-3">Rincian Penjualan per Jenis Voucher:</h3>`;
    for (const label in revenueByVoucher) {
        const item = revenueByVoucher[label];
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `
            <span>Voucher ${label}: ${item.count} unit</span>
            <strong>${formatRupiah(item.totalRevenue)}</strong>
        `;
        salesReportContent.appendChild(div);
    }

    salesReportContent.innerHTML += `
        <hr class="my-4 border-gray-300">
        <div class="report-item font-bold text-lg">
            <span>Total Voucher Terjual:</span>
            <span>${totalVouchersSold} unit</span>
        </div>
        <div class="report-item font-bold text-lg">
            <span>Total Pendapatan:</span>
            <strong class="text-green-600">${formatRupiah(totalOverallRevenue)}</strong>
        </div>
    `;
}

// Event listener untuk tombol "Laporan Penjualan"
salesReportBtn.addEventListener('click', () => {
    if (getData('adminLoggedIn', false)) {
        // Set tanggal default untuk laporan (misal: bulan ini)
        const today = getCurrentDate();
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
        startDateInput.value = firstDayOfMonth;
        endDateInput.value = today;

        generateSalesReport(startDateInput.value, endDateInput.value);
        toggleModal('salesReportModal', true);
    } else {
        showAlert('Akses Ditolak', 'Anda harus login sebagai admin untuk mengakses fitur ini.');
    }
});

// Event listener untuk tombol tutup modal laporan penjualan
if (closeSalesReportModalBtn) {
    closeSalesReportModalBtn.addEventListener('click', () => {
        toggleModal('salesReportModal', false);
    });
}

// Event listener untuk tombol "Buat Laporan Kustom"
if (generateCustomReportBtn) {
    generateCustomReportBtn.addEventListener('click', () => {
        const start = startDateInput.value;
        const end = endDateInput.value;

        if (!start || !end) {
            showAlert('Input Tanggal', 'Mohon pilih rentang tanggal untuk laporan.');
            return;
        }
        if (new Date(start) > new Date(end)) {
            showAlert('Input Tanggal Tidak Valid', 'Tanggal mulai tidak boleh lebih dari tanggal akhir.');
            return;
        }

        generateSalesReport(start, end);
    });
}

// Anda juga perlu fungsi `recordSale` yang dipanggil ketika voucher benar-benar "terjual".
// Ini kemungkinan akan ada di `main.js` atau `voucherManagement.js` tergantung alur pembelian.
// Contoh pemanggilan: recordSale(price, whatsapp, voucherCode);