let frame = false;

try {
frame = window.self !== window.top;
} catch (e) {
frame = true;
}

if (!frame && !navigator.userAgent.includes("Firefix")) {
console.log("frameo");
const abcloak = open("about:blank", "_blank");

if (!abcloak || abcloak.closed) {
    alert("Allow popups & redirects.");
} else {
    const p = abcloak.document;
    const frameo = p.createElement("iframe");
    const link = p.createElement("link");

    p.title = localStorage.getItem("title") || "Google";
    link.rel = "icon";
    link.href =
    localStorage.getItem("icon") || "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico";

    frameo.src = location.href;
    frameo.style.position = "fixed";
    frameo.style.top = frameo.style.bottom = frameo.style.left = frameo.style.right = 0;
    frameo.style.border = frameo.style.outline = "none";
    frameo.style.width = frameo.style.height = "100%";

    p.head.appendChild(link);
    p.body.appendChild(frameo);

    location.replace("https://google.com");
}
}


const searchField = document.getElementById("searchField");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener('click', function() {
    const url = search(searchField.value, "lmao");
    window.open(window.location + "/pframe.html?frame=" + url, "_blank")
    window.parent.close();
})  

searchField.onkeydown = function(e){
    if(e.keyCode == 13){
        const url = search(searchField.value, "lmao");
        location.href = "/pframe.html?frame=" + url;
    }
};