const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log("NEWS GET ROOT");
    res.send("NEWS");
});

module.exports = router;