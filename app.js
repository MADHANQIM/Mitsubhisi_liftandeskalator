import dotenv from "dotenv";
import express, { query } from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import path from "path"; 
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";



dotenv.config();     
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




// MySQL Connection modul 7
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Failed to connect to database", err);
    } else {
        console.log("Database connected successfully");
    }
});

// Middleware modul 9
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("publik"));   
app.use(cookieParser());

// midleware untuk meriksa role user
const authorizeRole  = (role) =>(req, res, next)=>{
    if (!role.includes(req.user.role)){
        return res.status (403).send("Anda Tidak Memiliki Izin Akses ke Halaman ini");
    }
    next();
}


// Middleware autentikasi
const authtoken = (req, res, next) => {
    const token = req.cookies.token; // Ambil token dari cookie
    if (!token) {
        return res.status(401).send("Akses ditolak! Anda harus login.");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Token tidak valid.");
        }
        req.user = user;
        next();
    });
};

// Proteksi endpoint
app.use((req, res, next) => {
    const unprotectedRoutes = ["/", "/login", "/daftar", "/api/daftar","/checkin",]; // Endpoint tanpa proteksi
    if (!unprotectedRoutes.includes(req.path) && !req.cookies.token) {
        return res.redirect("/");
    }
    next();
});

app.get("/index", authtoken, (req, res) => {
    res.render('index', {
        nama: req.user.nama, 
        role: req.user.role, 
        photoprofile: req.user.photoprofile 
    });
});




// endpoint Log in dan daftar modul 8&10
    app.get("/daftar", (req, res) => {
        res.render('daftar')
    }); 
    app.get("/karywan", authtoken, authorizeRole(["HRD", "Manager"]),(req,res)=>{
        let sql = "select * from registrasi";
        db.query(sql,(err, result)=>{
            if (err) {
                console.error("Error mendapatkan data karyawan:", err);
                res.status(500).send("Terjadi kesalahan pada server.");
            } else {
                res.render("daftarAPI", { API: result});
            }
        });
    }); 
    app.get("/Updatekaryawan", (req, res) => {
        res.render("karywan", { API: result});
    });    

    // Set up multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'publik/images')); // Destination folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Rename file
    }
});
const upload = multer({ storage: storage });
 
app.post('/daftar', upload.single('photoprofile'), (req, res) => {
    const { nama, email, role, password } = req.body;
    const photoprofile = req.file ? req.file.filename : null; // Use uploaded file's name

    const query = 'INSERT INTO registrasi (nama, email, role, password, photoprofile) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nama, email, role, password, photoprofile], (err) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.send('Terjadi kesalahan saat registrasi.');
        }
        res.redirect('/');
    });
});


    // API DAFTAR
        app.get("/api/daftar", (req, res)=>{
            let sql = " select * from registrasi";
            db.query(sql,(err, result)=>{
                if(err){
                    res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                }
                
            })
        });
        app.get("/api/daftar/:id_karyawan", (req, res) => {
            const id_karyawan = req.params.id_karyawan;
            let sql = "SELECT * FROM registrasi WHERE id_karyawan =?";
            db.query(sql,[id_karyawan], (err, result) => {
                if (err) {
                    console.error("Error mendapatkan data Karyawan:", err);
                    return res.status(500).send("Terjadi kesalahan pada server.");
                }
                if (result.length === 0) {
                    return res.status(404).send("Data Karyawan tidak ditemukan.");
                }
                // Kirim data trouble dan id_trouble ke template EJS
                console.log(result[0]);
                res.render("karywan", { API: result[0], id_karyawan });
            });
        });
        
        app.delete("/api/daftar/:id_karyawan", (req, res) => {
            const id_karyawan = req.params.id_karyawan; 
            let sql = "DELETE FROM registrasi WHERE id_karyawan = ?";
            
            db.query(sql, [id_karyawan], (err, result) => {
                if (err) {
                    console.error("Error deleting item:", err);
                    return res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                } else {
                    res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                }
            });
        });
        
        app.put("/api/daftar/:id_karyawan", (req, res)=>{
            const {nama, email, role, password} = req.body;
            const id_karyawan = req.params.id_karyawan;
            let sql = "UPDATE registrasi SET nama=?, email=?, role=?, password=? WHERE id_karyawan=?";
            db.query(sql, [nama, email, role, password, id_karyawan],(err, result)=>{
                if(err){
                    console.error("Error updating trouble:", err);
                    return res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response": true}));
                } 
            });
        });
    // 
    // endpoint buat login nya sama kek register 
        app.get("/", (req, res) => { 
            res.render('login')
        });
        app.post("/login", (req, res) => {
            const { nama, password } = req.body;
            const query = "SELECT * FROM registrasi WHERE nama = ? AND password = ?";
            db.query(query, [nama, password], (err, results) => {
                if (err) {
                    console.error("Error saat query", err.message);
                    return res.send("Terjadi kesalahan");
                }
                if (results.length > 0) {
                    const user = results[0];
                    // Buat token JWT
                    const token = jwt.sign(
                        { id_karyawan: user.id_karyawan, nama: user.nama, role: user.role, photoprofile: user.photoprofile },
                        process.env.JWT_SECRET,
                        { expiresIn: "1h" }
                    );
                    // Simpan token di cookie
                    res.cookie("token", token, { httpOnly: true });
                    // Redirect ke halaman index
                    res.redirect('/index');
                } else {
                    res.send(
                        '<script>alert("Nama atau password salah.");window.location="/";</script>'
                    );
                }
            });
        });
        
        // endpoint log out
            app.get("/logout",(req, res)=>{
                res.clearCookie('token',{httpOnly: true});
                res.redirect('/');
            })
        // 
    // 
// 

// endpoint trouble
    app.get("/trouble", (req, res) => {
        let sql = "SELECT * FROM trouble";
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error mendapatkan data jadwal:", err);
                res.status(500).send("Terjadi kesalahan pada server.");
            } else { 
                
                res.render("trouble", { trouble: result});
            }
        });
    });
    app.get("/inputtrouble",  (req, res) => {
        res.render('inputtrouble')
    });
    app.get("/edit", (req, res) => {
        res.render('editdatatrouble',{id_trouble: troubleData.id || null});
    });
    // API buat trouble
            app.post("/inputtrouble",(req,res)=>{
                const { deskripsi, kondisi, jenismasalah, photoUpload} = req.body;
                const query = "insert into trouble (deskripsi, kondisi, jenismasalah, photoUpload) values (?,?,?,?)";
                db.query(query,[deskripsi, kondisi, jenismasalah, photoUpload], (err)=>{
                    if (err) {
                        console.error('Error insertisting', err);
                        return res.send('Terjadi kesalahan saat mengisi data.');
                    }
                    res.redirect("/trouble")
                });
            });
            app.get("/api/trouble", (req, res)=>{
                let sql = " select * from trouble";
                db.query(sql,(err, result)=>{
                    if(err){
                        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                    }
                    else{
                        res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                    }
                })
            });
            app.get("/edit/:id_trouble", (req, res) => {
                const id_trouble = req.params.id_trouble; 
                const sql = "SELECT * FROM trouble WHERE id_trouble = ?";
                db.query(sql, [id_trouble], (err, result) => {
                    if (err) {
                        console.error("Error mendapatkan data trouble:", err);
                        return res.status(500).send("Terjadi kesalahan pada server.");
                    }
                    if (result.length === 0) {
                        return res.status(404).send("Data trouble tidak ditemukan.");
                    }
                    // Kirim data trouble dan id_trouble ke template EJS
                    res.render("editdatatrouble", { trouble: result[0], id_trouble });
                });
            });
            
            app.put("/edit/:id_trouble", (req, res)=>{
                const {deskripsi, kondisi, jenismasalah} = req.body;    
                const id_trouble = req.params.id_trouble;
                let sql = "update trouble set deskripsi = ?, kondisi = ?, jenismasalah = ? where id_trouble ='" +id_trouble+"'";
                db.query(sql, [deskripsi, kondisi, jenismasalah, id_trouble], (err, result) => {
                    if(err){
                        console.error("Error updating trouble:", err);
                        return res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                    }
                    else{
                        res.send(JSON.stringify({"status": 200, "error": null, "response": true}));
                    } 
                });
            });
            app.delete("/edit/:id_trouble", (req, res)=>{
                const id_trouble = req.params.id_trouble;
                let sql = "delete from trouble where id_trouble='"+id_trouble+"'";
                db.query(sql, (err, result)=>{
                if(err){
                    res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response":result}));
                }
            });
        });
    // 
// 


// endpoint untuk jadwal
    app.get("/jadwal", authtoken,authorizeRole(["mandor"]), (req, res) => {
        res.render('jadwal')
    });
    app.get("/jadwals", authtoken,(req, res) => {
        const role = req.user?.role || "guest";
        let sql = "SELECT * FROM jadwal";
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error mendapatkan data jadwal:", err);
                res.status(500).send("Terjadi kesalahan pada server.");
            } else {
                res.render("jadwals", { jadwals: result,  role: role });
            }
        });
    });
    
    app.get("/update" ,(req, res) =>{
        res.render('updatejadwal');
    })
    // API buat jadwal
            app.post("/jadwal", (req, res)=>{
                const {namaproject,	namapekerjaan, lokasipekerjaan,	 namapc, cuaca,	assignmentperson, healthcondition, namaanggota, date, proses} = req.body
                const query = "INSERT INTO jadwal (namaproject, namapekerjaan, lokasipekerjaan,  namapc, cuaca,	assignmentperson, healthcondition, namaanggota, date,proses) values (?,?,?,?,?,?,?,?,?,?)";
                db.query(query,[namaproject, namapekerjaan, lokasipekerjaan, namapc, cuaca,	assignmentperson, healthcondition, namaanggota, date, proses], (err)=>{
                    if (err) {
                        console.error('Error insertisting', err);
                        return res.send('Terjadi kesalahan saat mengisi data.');
                    }
                    res.redirect("/jadwals")
                });
            });
            app.get("/api/jadwal", (req, res)=>{
                let sql = " select * from jadwal";
                db.query(sql,(err, result)=>{
                    if(err){
                        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                    }
                    else{
                        res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                    }
                })
            });
            app.get("/update/:id_jadwal", (req, res) => {
                const id_jadwal = req.params.id_jadwal;
                let sql = "select * from jadwal where id_jadwal =?" ;
                db.query(sql,[id_jadwal],(err, result)=>{
                    if (err) {
                        console.error("Error mendapatkan data trouble:", err);
                        return res.status(500).send("Terjadi kesalahan pada server.");
                    }
                    if (result.length === 0) {
                        return res.status(404).send("Data trouble tidak ditemukan.");
                    }
                    console.log(result[0]);
                    res.render("updatejadwal",{ jadwals: result[0], id_jadwal })
                })
            });
            
            app.put("/update/:id_jadwal", (req, res)=>{
                const {namaanggota, proses} = req.body;
                const id_jadwal = req.params.id_jadwal;
                let sql = "UPDATE jadwal SET namaanggota = ?, proses = ? WHERE id_jadwal = ?";
                db.query(sql, [namaanggota, proses, id_jadwal], (err, result) => {
                    if (err) {
                        console.error("Error updating trouble:", err);
                        res.status(500).json({ status: 500, error: err });
                    } else {
                        res.status(200).json({ status: 200, response: true });
                    }
                });
            });
            app.delete("/api/:id_jadwal", (req, res)=>{
                const id_jadwal = req.params.id_jadwal;
                let sql = "delete from jadwal where id_jadwal='"+id_jadwal+"'";
                db.query(sql, (err, result)=>{
                if(err){  
                    res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                }
            });
        });
    // 
// 

// endpoint absensi masuk
    app.get('/checkin', (req, res)=>{
        res.render('checkin')
    })
    app.get('/dataabsen',(req, res)=>{
        let sql = "SELECT * FROM absen";
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error mendapatkan data jadwal:", err);
                res.status(500).send("Terjadi kesalahan pada server.");
            } else {
                res.render("absen", { ABSEN: result, role: result });
            }
        });
    });
    // API untuk absensi
        app.post("/checkin", authtoken, upload.single("image"),(req, res) => {
            const { tanggal,  submitTIme } = req.body;
            const image = req.file ? req.file.filename: null
            const query = "INSERT INTO absen (tanggal, image, submitTIme) values (?,?, ?)";
            console.log("Waktu Submit:", query);  // Untuk debug, cek submitTime
            db.query(query, [tanggal, image, submitTIme], (err) => {
                if (err) {
                    console.error("error menambahkan data", err);
                    return res.send('Terjadi kesalahan saat menginput data');
                }
                
                res.redirect('/index');
            });
        });
        app.get("/api/absen",(req,res)=>{
            let sql = "select * from absen"
            db.query(sql,(err, result)=>{
                if(err){
                    res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                }
            })
        })
    // 
// 

// endpoint check out
    app.get("/checkout", (req, res) => {
        res.render('checkout')
    });
    app.get('/datapulang',(req, res)=>{
        let sql = "SELECT * FROM absensi";
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error mendapatkan data jadwal:", err);
                res.status(500).send("Terjadi kesalahan pada server.");
            } else {
                res.render("absensi", { ABSENSI: result, role: result });
            }
        });
    }); 
    // API untuk absensi 
        app.post("/checkout", authtoken,upload.single('images'), (req, res) => {
            const { tanggals} = req.body;
            const images = req.file ? req.file.filename: null
            const query = "INSERT INTO absensi (tanggals, images) values (?,?)";
            console.log("Waktu Submit:", query);  // Untuk debug, cek submitTime
            db.query(query, [tanggals, images], (err) => {
                if (err) {
                    return res.send('Terjadi kesalahan saat menginput data');
                }
                
                res.redirect('/index');
            });
        });
        app.get("/api/absensi",(req,res)=>{
            let sql = "select * from absensi"
            db.query(sql,(err, result)=>{
                if(err){
                    res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
                }
                else{
                    res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
                }
            })
        })
    // 
// 



// Export app
export { app };
