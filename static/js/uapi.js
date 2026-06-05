let client;
async function UapiPreLoad() {
  try {
    let { UapiClient } = await import('https://cdn.jsdelivr.net/npm/uapi-browser-sdk@latest/dist/index.js')
    client = new UapiClient('https://uapis.cn');
  }
  catch (err) {
    console.error("Something wrong :" + err);
    return 0;
  }
  console.log("UapiPreLoad success")
}
UapiPreLoad()
// Uapi资源预加载