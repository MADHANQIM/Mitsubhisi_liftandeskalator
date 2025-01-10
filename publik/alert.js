// Fungsi untuk menampilkan alert Check In
function showCheckInAlert(event) {
    event.preventDefault(); // Mencegah redirect
    
    // Mengecek apakah alert sudah ditutup sebelumnya
    if (!localStorage.getItem('checkInClosed')) {
        // Menampilkan div alert kustom
        document.getElementById('APD').style.display = 'block'; // Tampilkan alert box
    } else {
        // Arahkan ke halaman checkin jika alert sudah ditutup sebelumnya
        window.location.href = "/checkin"; 
    }
}

// Fungsi untuk menutup alert dan menyimpan status penutupan di localStorage
function closeAlert() {
    // Menyembunyikan alert box
    document.getElementById('APD').style.display = 'none';
    
    // Menyimpan status bahwa alert telah ditutup
    localStorage.setItem('checkInClosed', 'true');
}

// Menambahkan event listener pada link Check In
document.querySelector('.checkin1').addEventListener('click', showCheckInAlert);

// Menambahkan event listener pada tombol tutup alert
document.querySelector('.alertboxin button').addEventListener('click', closeAlert);
