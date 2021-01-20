window.addEventListener("load", function () {
    var linksMenu = document.querySelectorAll("ul.menu a");
    var location = window.location.pathname;
    location = (location == "/") ? "/index.html" : location;
    var lochash = window.location.hash;

    for (var link of linksMenu) {
        link.style.backgroundColor = "rgb(78, 48, 78)";
        if (link.href.endsWith(location)) {
            link.style.backgroundColor = "rgba(158, 114, 167, 0.7)";
        }

        link.addEventListener("click", function () {
            var chMenu = document.getElementById("ch-menu");
            chMenu.checked = false;
            var chSubmenu = document.getElementsByClassName("ch-submenu");

            for (var chs of chSubmenu) {
                chs.checked = false;
            }
        })
    }

    var buton1 = document.getElementById("sun");

    buton1.onclick = function () {

        document.body.className = "light";
        localStorage.setItem("theme", "light");

    }

    var buton2 = document.getElementById("moon");

    buton2.onclick = function () {

        document.body.className = "dark";
        localStorage.setItem("theme", "dark");

    }

    function checkTheme() {
        const localStorageTheme = localStorage.getItem("theme");

        if (localStorageTheme != null && localStorageTheme == "dark") {
            document.body.className = localStorageTheme;
        }
        if (localStorageTheme != null && localStorageTheme == "light") {
            document.body.className = localStorageTheme;
        }
    }

    checkTheme();

    
    var linkuriInterne = document.querySelectorAll("a[href*='#']");
    console.log(linkuriInterne.length);

    for (var lnk of linkuriInterne) {
        
        var paghref = lnk.href.substring(lnk.href.lastIndexOf("/"), lnk.href.lastIndexOf("#"))
        var locationhref = window.location.href
        var paglocation = locationhref.substring(locationhref.lastIndexOf("/"), locationhref.lastIndexOf("#"))
        
        if (paglocation == paghref)
            lnk.addEventListener("click", clickLink)
    }


var idIntervalPlimbare = -1;

function clickLink(ev) {
    ev.preventDefault() 

    clearInterval(idIntervalPlimbare)
    var ch
    var lnk = ev.target
    if (lnk.parentNode.parentNode.classList.contains("submenu")) {
        var checkboxes = document.getElementsByClassName("ch-submenu")
        for (ch of checkboxes)
            ch.checked = false

        document.getElementById("ch-menu").checked = false
    } else if (lnk.parentNode.parentNode.classList.contains("menu")) {
        document.getElementById("ch-menu").checked = false
    }


    var coordScroll;
    var poz = lnk.href.indexOf("#");
    var idElemScroll = lnk.href.substring(poz + 1);
    if (idElemScroll == "") {
        coordScroll = 0;
    } else {
        coordScroll = getOffsetTop(document.getElementById(idElemScroll)) 
    }
    var distanta = coordScroll - document.documentElement.scrollTop
    console.log(distanta)
    pas = distanta < 0 ? -20 : 20;
    idIntervalPlimbare = setInterval(plimba, 10, pas, coordScroll, lnk.href.substring(lnk.href.lastIndexOf("#") + 1))
}


function getOffsetTop(elem) {
    var rez = elem.offsetTop;
    while (elem.offsetParent && elem.offsetParent != document.body) {
        elem = elem.offsetParent;
        rez += elem.offsetTop;
    }
    return rez;

}


function plimba(pas, coordScroll, href) {
    scrollVechi = document.documentElement.scrollTop;
    document.documentElement.scrollTop += pas
    if (pas > 0 && coordScroll <= document.documentElement.scrollTop || pas < 0 && coordScroll >= document.documentElement.scrollTop || scrollVechi == document.documentElement.scrollTop) {
        
        clearInterval(idIntervalPlimbare)
        window.location.hash = href
    }
}






















})