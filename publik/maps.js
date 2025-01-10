// Ganti dengan API Key Geoapify Anda
const geoapifyApiKey = '20b34cc79dca4e37b9c7a412d6a00547';

// memperkenalkan peta dengan kordinat kita
const map = L.map('map').setView([3.5952, 98.6722], 13);

L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyApiKey}`, {
    attribution: '&copy; OpenStreetMap contributors, &copy; Geoapify',
    maxZoom: 20
}).addTo(map);

// Inisialisasi marker untuk menunjukkan lokasi pengguna (awal di Medan)
let userMarker = L.marker([3.5952, 98.6722]).addTo(map)
    .openPopup();

// Fungsi untuk memperbarui posisi marker berdasarkan lokasi pengguna
function updateUserLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Perbarui posisi marker dan pusat peta ke lokasi pengguna
    userMarker.setLatLng([lat, lon]);
    map.setView([lat, lon], 13);
}

// Mulai memantau posisi dengan Geolocation API
if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(updateUserLocation, 
        (error) => {
            console.error("Gagal mendapatkan lokasi:", error);
            alert("Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.");
        },
        { enableHighAccuracy: true }
    );
} else {
    alert("Geolocation tidak didukung oleh browser Anda.");
}
