const WorkoutLog = require('../models/WorkoutLog');

// 1. POST (Simpan Log Latihan Baru)
exports.createLog = async (req, res) => {
    try {
        const { workoutName, duration, exercises } = req.body;

        // Validasi input minimal
        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ message: "Log latihan harus berisi minimal satu gerakan/exercise." });
        }

        const newLog = new WorkoutLog({
            user: req.user.id, // Diambil dari middleware 'protect'
            workoutName: workoutName || "Custom Workout",
            duration: duration || 0,
            exercises
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("DEBUG POST LOG ERROR:", error);
        res.status(500).json({ message: "Gagal menyimpan log latihan.", error: error.message });
    }
};

// 2. GET ALL (Ambil Riwayat Khusus milik user yang login + Array Detail Relasi di Paling Bawah)
exports.getAllLogs = async (req, res) => {
    try {
        // Ambil data riwayat dan populate seluruh field dari tabel exercises
        const logs = await WorkoutLog.find({ user: req.user.id })
            .populate('exercises.exerciseId')
            .sort({ createdAt: -1 });

        // Format ulang struktur data agar menyertakan properti 'detail' berbentuk array sesuai arahan dosen
        const formattedLogs = logs.map(log => {
            const detailRelasi = log.exercises.map(item => {
                if (item.exerciseId) {
                    return {
                        _id: item.exerciseId._id,
                        name: item.exerciseId.name,
                        muscle: item.exerciseId.muscle,
                        equipment: item.exerciseId.equipment,
                        instructions: item.exerciseId.instructions,
                        videoUrl: item.exerciseId.videoUrl,
                        image: item.exerciseId.image,
                        sets: item.sets // Menyertakan set (reps & weight) di dalam detail latihan ini
                    };
                }
                return null;
            }).filter(item => item !== null); // Membuang data jika reference exercise tidak ditemukan/null

            return {
                _id: log._id,
                user: log.user,
                workoutName: log.workoutName,
                duration: log.duration,
                createdAt: log.createdAt,
                updatedAt: log.updatedAt,
                detail: detailRelasi // Array data berelasi di paling bawah objek log
            };
        });

        res.status(200).json(formattedLogs);
    } catch (error) {
        console.error("DEBUG GET LOG ERROR:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat latihan.", error: error.message });
    }
};

// 3. PUT (Partial Update Log - Hanya mengupdate field riwayat yang dikirim saja)
exports.updateLog = async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};
        const allowedFields = ['workoutName', 'duration', 'exercises'];

        // Filter data body agar hanya field yang valid yang diproses
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data riwayat yang diubah." });
        }

        // Jalankan update parsial dengan $set dan pastikan riwayat itu memang milik user yang login
        const updated = await WorkoutLog.findOneAndUpdate(
            { _id: id, user: req.user.id }, // Proteksi: Hanya pemilik log yang bisa update
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("DEBUG PUT LOG ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update riwayat.", error: error.message });
    }
};

// 4. DELETE (Menghapus Riwayat Latihan)
exports.deleteLog = async (req, res) => {
    try {
        const id = req.params.id;

        // Proteksi: Hanya pemilik log yang bisa menghapus log miliknya
        const deleted = await WorkoutLog.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deleted) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        res.status(200).json({ message: "Riwayat latihan berhasil dihapus." });
    } catch (error) {
        console.error("DEBUG DELETE LOG ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus riwayat.", error: error.message });
    }
};