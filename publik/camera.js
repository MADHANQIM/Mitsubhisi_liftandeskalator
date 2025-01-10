let video = document.getElementById("vidioselfie");
let userLocation = { latitude: null, longitude: null };
let userAddress = "";
let snapshotData = [];

// Meminta akses ke kamera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(error) {
        alert("Kamera tidak dapat diakses. Izinkan akses kamera di pengaturan browser.");
        console.error("Error accessing camera:", error);
    });
} else {
    alert("Browser tidak mendukung akses kamera.");
}

// Meminta akses lokasi dan mendapatkan alamat
function getLocationAndAddress() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.latitude = position.coords.latitude;
                userLocation.longitude = position.coords.longitude;
                
                // Menggunakan API OSM Nominatim untuk mendapatkan alamat berdasarkan koordinat
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        const { road, suburb, city, village } = data.address;
                        userAddress = `${road || ""}, ${suburb || city || village || ""}`;
                    })
                    .catch(error => console.error("Gagal mengambil alamat:", error));
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Izinkan akses lokasi di pengaturan browser.");
            }
        );
    } else {
        alert("Browser tidak mendukung akses lokasi.");
    }
}

// Panggil fungsi getLocationAndAddress untuk memperbarui alamat saat ini
getLocationAndAddress();

// Fungsi untuk mengambil gambar dari video dan menambahkan timestamp, lokasi, dan alamat
function takeSnapshot() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) { // Pastikan video sudah siap
        let canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        let context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Dapatkan timestamp dan formatnya
        const timestamp = new Date().toLocaleString();

        // Tambahkan timestamp ke canvas
        context.font = "16px Arial";
        context.fillStyle = "white";
        context.fillText(`Waktu: ${timestamp}`, 10, 20);

        // Tambahkan lokasi ke canvas jika tersedia
        if (userLocation.latitude && userLocation.longitude) {
            context.fillText(`Koordinat: ${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`, 10, 40);
        }

        // Tambahkan alamat jika tersedia
        if (userAddress) {
            context.fillText(`Alamat: ${userAddress}`, 10, 60);
        } else {
            context.fillText("Alamat tidak tersedia", 10, 60);
        }

        // Mengonversi canvas menjadi data URL
        let imageData = canvas.toDataURL("image/png");

        // Menyimpan data snapshot dalam objek JSON
        snapshotData.push({
            timestamp: timestamp,
            location: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                address: userAddress || "Alamat tidak tersedia"
            },
            image: imageData
        });

        // Menampilkan hasil snapshot di sebelah video
        let img = document.createElement("img");
        img.src = imageData;

        let snapshotContainer = document.getElementById("snapshot-container");
        snapshotContainer.innerHTML = ""; // Kosongkan hasil foto sebelumnya
        snapshotContainer.appendChild(img); // Tambahkan foto baru

        // Menampilkan snapshot data dalam bentuk JSON di console
        console.log(JSON.stringify(snapshotData, null, 2)); // Atau simpan ke file sesuai kebutuhan
    } else {
        console.error("Video belum siap untuk diambil gambarnya.");
    }
}
