const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const equipmentController = require('../controllers/equipmentController');

// 1. Operasi Basis (Tanpa ID)
router.post('/', protect, equipmentController.createEquipment);
router.get('/', equipmentController.getAllEquipments);

// 2. Kebijakan jika user lupa ID saat PUT / DELETE
router.all('/', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        return res.status(400).json({
            message: `Gagal ${req.method === 'PUT' ? 'update' : 'hapus'}! Silakan pilih alat dulu (masukkan ID).`
        });
    }
    next();
});

// 3. Operasi dengan Parameter ID
router.get('/:id', equipmentController.getEquipmentById);
router.put('/:id', protect, equipmentController.updateEquipment);
router.delete('/:id', protect, equipmentController.deleteEquipment);

module.exports = router;