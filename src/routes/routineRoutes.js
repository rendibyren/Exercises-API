const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.post('/', routineController.createRoutine);
router.get('/', routineController.getAllRoutines);
router.get('/:id', routineController.getRoutineById);
router.put('/:id', routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);

module.exports = router;