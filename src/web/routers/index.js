const { Router } = require("express");

const router = Router();

router.get("/login/:website", (req, res) => {
  if (req.params.website == "twitch") {
    res.redirect(
      `https://id.twitch.tv/oauth2/authorize?client_id=${
        process.env.TWITCH_CLIENT_ID
      }&force_verify=true&redirect_uri=${
        process.env.TWITCH_REDIRECT_URI
      }&response_type=code&scope=${encodeURIComponent("moderation:read")}`
    );
  } else if (req.params.website == "spotify") {
    const params = new URLSearchParams();

    params.set("response_type", "code");
    params.set("client_id", process.env.SPOTIFY_CLIENT_ID);
    params.set("scope", "user-modify-playback-state user-read-private");
    params.set("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
    params.set("show_dialog", "true");
    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  } else {
    res.redirect("/");
  }
});

module.exports = router;
