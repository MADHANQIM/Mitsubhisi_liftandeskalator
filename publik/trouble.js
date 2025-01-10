// // Fungsi untuk memuat data riwayat dari localStorage
// function loadTroubleHistory() {
//     const troubleHistory = JSON.parse(localStorage.getItem('troubleHistory')) || [];
//     console.log("Trouble History Data:", troubleHistory); // Debugging: lihat data riwayat di konsol
//     const historyList = document.getElementById('troubleHistory');

//     // Hapus konten lama
//     historyList.innerHTML = '';

//     // Tambahkan data riwayat ke dalam elemen HTML
//     troubleHistory.forEach((item, index) => {
//         const listItem = document.createElement('li');
//         listItem.classList.add('list-group-item');
//         listItem.innerHTML = `
//             <strong>${item.date}</strong><br>
//             <span class="text-muted">Masalah:</span> ${item.trouble}<br>
//             <span class="text-muted">Kondisi:</span> ${item.condition}<br>
//             <span class="text-muted">Jenis Masalah:</span> ${item.problemType}<br>
//             ${item.photo ? `<img src="${item.photo}" alt="Foto Trouble" class="img-thumbnail mt-2" style="max-width: 200px;">` : ''}
//             <button class="btn btn-danger btn-sm mt-2" onclick="deleteHistoryItem(${index})">Hapus</button>
//         `;
//         historyList.appendChild(listItem);
//     });
// }

// // Fungsi untuk menghapus satu item riwayat berdasarkan index
// function deleteHistoryItem(index) {
//     const troubleHistory = JSON.parse(localStorage.getItem('troubleHistory')) || [];
//     troubleHistory.splice(index, 1); // Hapus item berdasarkan index
//     localStorage.setItem('troubleHistory', JSON.stringify(troubleHistory)); // Simpan perubahan ke localStorage
//     loadTroubleHistory(); // Memuat ulang data riwayat setelah dihapus
// }

// // Panggil fungsi untuk memuat riwayat saat halaman dimuat
// window.onload = loadTroubleHistory;
