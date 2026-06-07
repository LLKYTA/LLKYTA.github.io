let client;
async function UapiPreLoad() {
  try {
    let { UapiClient } = await import('https://cdn.jsdelivr.net/npm/uapi-browser-sdk@latest/dist/index.js')
    client = new UapiClient('https://uapis.cn');
  }
  catch (err) {
    console.error("Something wrong :" + err);
    return 1;
  }
  console.log("UapiPreLoad success")
}
async function HitokotoService() {
  fetch('https://v1.hitokoto.cn/?c=j&c=i')
    .then(response => response.json())
    .then(data => {
      const hitokoto = document.querySelector('#hitokoto_text')
      const hitokoto_from = document.querySelector('#hitokoto_from')
      // hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`
      hitokoto.innerText = data.hitokoto
      if (data.from_who == "null") {
        hitokoto_from.innerText = data.from
      } else {
        hitokoto_from.innerText = data.from + "-" + data.from_who
      }
      console.log(data)
    })
    .catch(console.error)
  return 0;
}
async function GetRanImg(){
  const payload = {
    city: "",
    extended: false,
    forecast: false,
    hourly: false,
    minutely: false,
    indices: false,
    lang: "zh",
  };
  const data = await client.misc.getMiscWeather(payload);
  console.log(data);
}

window.addEventListener('load', async () => {
 HitokotoService();
  await UapiPreLoad();
  await GetRanImg();
})