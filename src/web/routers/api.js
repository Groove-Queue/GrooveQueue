const { Router } = require("express");

const router = Router();

const limiter = {};

router.post("/song", (req, res) => {
  const { name, streamer, uri } = req.body;
});

module.exports = router;
