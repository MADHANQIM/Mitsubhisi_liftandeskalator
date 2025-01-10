function handleCheckout() {
    // Simpan status check-in di sessionStorage
    sessionStorage.setItem('checkoutStatus', 'completed');

    // Redirect ke halaman utama
    window.location.href = '/index';
}