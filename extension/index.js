const urlRegex = new RegExp(
  /https:\/\/open.spotify.com\/track\/[a-zA-Z0-9]{22}/g
);

var username = null;
var streamer = null;
var valid = null;

window.Twitch.ext.onAuthorized(async (auth) => {
  const userData = await getUserData(
    auth.helixToken,
    auth.userId.split("U")[1]
  );
  const streamerData = await getUserData(auth.helixToken, auth.channelId);
  username = userData.data[0].display_name;
  streamer = streamerData.data[0].display_name;

  valid = await hasAccount(username);
  const load = document.getElementsByClassName("load");
  for (let i = 0; i < load.length; i++) {
    console.log(load[i]);
    load[i].classList.toggle("hidden");
  }

  if (valid) {
    document.getElementById("content").classList.toggle("hidden", false);
  } else {
    document.getElementById("create").classList.toggle("hidden", false);
  }
});

async function getUserData(jwt, id) {
  const res = await fetch(`https://api.twitch.tv/helix/users?id=${id}`, {
    method: "GET",
    headers: {
      "client-id": "xwxqcf64tt0vyo8718ccpaclr49tch",
      Authorization: `Extension ${jwt}`,
    },
  });

  if (res.ok) return await res.json();
  else {
    console.log(`Error getting user data ${res.status}: ${await res.text()}`);
    return {};
  }
}

async function hasAccount(name) {
  const res = await fetch(
    `http://localhost:8080/api/user/${name.toLowerCase()}`
  );
  if (res.ok) return Boolean(await res.text());
}

document.getElementById("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const url = await document.getElementById("url");
  var value = url.value;
  url.value = "";

  if (!urlRegex.test(value)) return;

  value = value.split("/")[4];
  if (value.includes("?")) value = value.split("?")[0];

  const req = new XMLHttpRequest();
  req.open("POST", "http://localhost:8080/api/song");
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.send(JSON.stringify({ name: username, streamer, id: value }));
});
