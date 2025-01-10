 // Fungsi untuk menampilkan halaman check-in
function showCheckoutPage() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('checkoutStatus').style.display = 'block';
}


// Fungsi untuk menampilkan alert checkout
function handleCheckOut() {
    // Tampilkan alert konfirmasi
    if (confirm("Apakah Anda yakin ingin melakukan Check Out?")) {
        // Jika dikonfirmasi, redirect ke halaman checkout
        window.location.href = '/checkout';
    }
}

// Tambahkan event listener ke elemen "Check Out" untuk memanggil fungsi handleCheckOut
document.querySelector('.checkout').addEventListener('click', function(event) {
    event.preventDefault(); // Mencegah default link behavior
    handleCheckOut();
});

// Fungsi untuk menampilkan alert khusus
function showAlert() {
    document.getElementById("customAlertcheckout").style.display = "flex";
}


// Fungsi untuk menutup alert khusus
function closeAlert() {
    document.getElementById("customAlertcheckout").style.display = "none";
}

// Cek status check-in di sessionStorage dan tampilkan alert jika diperlukan
window.onload = function() {
    if (sessionStorage.getItem('checkoutStatus') === 'completed') {
        // Tampilkan custom alert
        showAlert();

        // Hapus status check-in agar alert tidak muncul lagi
        sessionStorage.removeItem('checkoutStatus');
    } else {
        // Jika belum check-in, tampilkan halaman utama
        document.getElementById('homePage').style.display = 'block';
    }
};
