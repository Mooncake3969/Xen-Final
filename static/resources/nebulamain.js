

//                      Copyright Nebula Services 2021-2022


window.addEventListener('load', () => {
// register UV sw

navigator.serviceWorker.register('./sw.js', {
scope: '/service/'
});

  function isUrl(val = '') {
    if (/^http(s?):\/\//.test(val) || val.includes('.') && val.substr(0, 1) !== ' ') return true;
    return false;
  };

  const useNoGG = false;
  const proxy = "uv"
  const inpbox = document.querySelector('form');
  inpbox.addEventListener('submit', event => {
    event.preventDefault()
    
    console.log("Connecting to service -> loading");
    const loader = document.getElementById("lpoader");
    const texts = document.getElementById("connecterText");
    const loadConstructer = loader.style;
    const textConstructer = texts.style;
    loadConstructer.display = "flex";
    loadConstructer.justifyContent = "center";

  });
  const form = document.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (proxy === 'uv') {
      navigator.serviceWorker.register('./sw.js', {
        scope: '/service/'
      }).then(() => {
        const value = event.target.firstElementChild.value;
        let url = value.trim();
        if (!isUrl(url)) url = 'https://www.google.com/search?q=' + url;
        if (!(url.startsWith('https://') || url.startsWith('http://'))) url = 'http://' + url;
        let redirectTo = proxy === 'uv' ? __uv$config.prefix + __uv$config.encodeUrl(url) : __osana$config.prefix + __osana$config.codec.encode(url);
        const option = localStorage.getItem('nogg'); 
        setTimeout(() => {
        const _popout = window.open('/blob', '_self');
        const blob = _popout.document;
          blob.write("<h1></h1> ")
        const iframe = blob.createElement("iframe")
        const style = iframe.style
        const img = blob.createElement("link")
        const link = location.href
        const arcSrc = blob.createElement('script');
        blob.head.appendChild(arcSrc);
        img.rel = "icon"
        img.href = ""
        blob.title = "Xen"

        var currentLink = link.slice(0, link.length - 1);

        iframe.src = currentLink + redirectTo

        style.position = "fixed"
        style.top = style.bottom = style.left = style.right = 0
        style.border = style.outline = "none"
        style.width = style.height = "100%"

        blob.body.appendChild(iframe)
             }, 1000);
               
      });
    } 
  });
});
