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
        console.log("const p = abcloak.document\n" + JSON.stringify(p))
        const frameo = p.createElement("iframe");
        const link = p.createElement("link");

        p.title = localStorage.getItem("title") || "Google";
        link.rel = "icon";
        link.href =
            localStorage.getItem("icon") || "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico";

        console.log("link.href: " + link.href)

        frameo.src = location.href;
        frameo.style.position = "fixed";
        frameo.style.top = frameo.style.bottom = frameo.style.left = frameo.style.right = 0;
        frameo.style.border = frameo.style.outline = "none";
        frameo.style.width = frameo.style.height = "100%";

        console.log("frameo.style: \n" + JSON.stringify(frameo.style))

        p.head.appendChild(link);
        console.log("p.head: " + JSON.stringify(p.head))

        p.body.appendChild(frameo);
        console.log("p.body: " + JSON.stringify(p.body))

        location.replace("https://google.com");
    }
}

