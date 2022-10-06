const topbutton = document.querySelector("#To-Top");
const mobilebutton = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");
const mobileMenu = document.querySelector(".worldnav")
const mobilemenubutton = document.querySelector("#arrow")
const leftButtons = document.getElementsByClassName("arrowleft")
const rightButtons = document.getElementsByClassName("arrowright")
const imagecontainers = document.getElementsByClassName("image-container");
var imageSizeinvw = 50
const speed = 500;
var viewwidth
var containersize = []
var dotcontainers = []
var detailarr = []
var dotarrays = []
var containerMovement = []


window.onload = function () {
    if(mobilemenubutton != null) {
        mobilemenubutton.addEventListener("click", unfoldMenu);
    }
    containersize = [imagecontainers.lenth]
    dotcontainers = [containersize]
    for (let i = 0; i < imagecontainers.length; i++) {
        imageContainerSetup(imagecontainers[i], i)
    }

    for (let i = 0; i < leftButtons.length; i++) {
        leftButtons[i].addEventListener("click", function () { imageBack(leftButtons[i], imagecontainers[i], containersize[i], i) }, false);
    };

    for (let i = 0; i < rightButtons.length; i++) {
        rightButtons[i].addEventListener("click", function () { imageForward(rightButtons[i], imagecontainers[i], containersize[i], i) }, false);
    }

    for (let i = 0; i < imagecontainers.length; i++) {
        var cards = imagecontainers[i].querySelectorAll('.card');
        let arrayloc = 0
        var details = []
        for (let i = 0; i < cards.length; i++) {
            details[arrayloc] = cards[i].querySelector(".details");
            arrayloc++
        }
        detailarr[i] = details
        showDetails(detailarr[i][0]);
    }
}
//buttons and link listeners
topbutton.addEventListener("click", ToTop);
mobilebutton.addEventListener("click", ToggleNav);
document.addEventListener("scroll", handleScroll);

// watch for
const Header = document.querySelector("#header");

function body_parallax_element(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
}

window.addEventListener("scroll", function () {
    var scrolledHeight = window.pageYOffset;
    body_parallax_element("body").forEach(function (el, index, array) {
        var limit = el.offsetTop + el.offsetHeight;
        if (scrolledHeight > el.offsetTop && scrolledHeight <= limit) {
            el.style.backgroundPositionY = (scrolledHeight - el.offsetTop) / 2 + "px";
        } else {
            el.style.backgroundPositionY = "0";
        }
    });
});

function ToTop() {
    window.scrollTo(0, 0);
}

function ToggleNav() {
    if (mobilebutton.classList.contains("is-active")) {
        mobilebutton.classList.remove("is-active");
        menu.classList.remove("toggled");
    }
    else {
        mobilebutton.classList.add("is-active");
        menu.classList.add("toggled");
    }
}

function unfoldMenu() {
    if (mobileMenu.classList.contains("show")) {
        mobileMenu.classList.remove("show")
    } else {
        mobileMenu.classList.add("show")
    }
}

function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= window.innerWidth || document.documentElement.clientWidth_
    );
}

function handleScroll() {
    if (!isElementInViewport(Header)) {
        topbutton.classList.add("showBtn");
    }
    else {
        topbutton.classList.remove("showBtn");
    }
}

function imageContainerSetup(el, i) {
    let num = el.children.length-1;
    var parent = el.parentElement;
    containersize[i] = num;

    var dotContainer = null;
    var dots = [];

    parent.innerHTML += "<div class = 'imgdots'></div>";
    dotContainer = parent.querySelector(".imgdots");
    containerMovement[i] = 0;

    for (let j = 0; j < num; j++) {
        dotContainer.innerHTML += "<div class='dot'></div>";
        dots[j] = j;
    };

    for (let j = 0; j < dots.length; j++) {
        for (let h = 0; h < dotContainer.querySelectorAll(".dot").length; h++) {
            if (h == j) {
                dots[j] = dotContainer.querySelectorAll(".dot")[h];
            }
        }
    }
    dotarrays[i] = dots

    dots[0].style = "transform: scale(1)"
    var card = el.querySelectorAll('.card')[0]
    wrapperInfo(card, i);


}

async function imageBack(el, imgContainer, contsize, imgcontarrloc) {
    var viewport = document.querySelector(".viewport")
    var pxwidth = viewport.clientWidth
    console.log(pxwidth)
    console.log(convertPXToVW(pxwidth))
    imageSizeinvw = convertPXToVW(pxwidth)
    
    let trans = containerMovement[imgcontarrloc];
    trans += imageSizeinvw
    lookAtArray = dotarrays[imgcontarrloc]
    var dotLoc
    if (trans <= 0) {

        //resize dots
        dotLoc = (Math.abs(trans / imageSizeinvw))
        lookAtArray[dotLoc].style = 'transform: scale(1)'
        lookAtArray[dotLoc + 1].style = 'transform: scale(.5)'

        //removeDetails
        var nextDetails = Math.abs(trans / imageSizeinvw)
        var currentDetails = Math.abs(nextDetails + 1);
        hideDetails(detailarr[imgcontarrloc][currentDetails]);

        //move
        containerMovement[imgcontarrloc] = trans
        imgContainer.style = 'transform: translateX(' + trans + 'vw)'

        //show Details
        showDetails(detailarr[imgcontarrloc][nextDetails])
    }
    else //if wrapping around
    {
        trans = -(imageSizeinvw* (dotarrays[imgcontarrloc].length-1))

        //resize dots
        dotLoc = lookAtArray.length-1;
        lookAtArray[dotLoc].style = 'transform: scale(1)'
        lookAtArray[0].style = 'transform: scale(0.5)'

        //stop transitions
        imgContainer.classList.add("notransition")
        imgContainer.querySelector(".wrap").querySelector(".details").classList.add("notransition")

        //show details on wrapper
        imgContainer.querySelector(".wrap").querySelector(".details").classList.remove("hide")
        
        //move to wrapper
        imgContainer.style = 'transform: translateX(' + -(imageSizeinvw* (dotarrays[imgcontarrloc].length)) + 'vw)'

        //hide details on first card
        imgContainer.querySelector(".card").querySelector(".details").classList.add("hide")

        //start transitions
        await delay(speed)
        imgContainer.classList.remove("notransition")
        imgContainer.querySelector(".wrap").querySelector(".details").classList.remove("notransition")

        //move to next card
        containerMovement[imgcontarrloc] = trans
        imgContainer.style = 'transform: translateX(' + trans + 'vw)'

        //hide details on old card
        imgContainer.querySelector(".wrap").querySelector(".details").classList.add("hide")

        //show details on new card
        showDetails(detailarr[imgcontarrloc][dotarrays[imgcontarrloc].length-1])
    }

}

async function imageForward(el, imgContainer, contsize, imgcontarrloc) {
    var viewport = document.querySelector(".viewport")
    var pxwidth = viewport.clientWidth
    imageSizeinvw = convertPXToVW(pxwidth)


    let trans = containerMovement[imgcontarrloc];
    trans -= imageSizeinvw
    lookAtArray = dotarrays[imgcontarrloc]
    var dotLoc;
    console.log(trans)
    console.log(-((imageSizeinvw * contsize) - imageSizeinvw -1 ))
    if (trans >= -((imageSizeinvw * contsize) - imageSizeinvw + 1 )) {
        //resize dots
        dotLoc = Math.abs(trans / imageSizeinvw)
        lookAtArray[dotLoc].style = 'transform: scale(1)'
        lookAtArray[dotLoc - 1].style = 'transform: scale(.5)'

        //removeDetails
        var nextDetails = Math.abs(trans / imageSizeinvw)
        var currentDetails = Math.abs(nextDetails - 1);
        hideDetails(detailarr[imgcontarrloc][currentDetails]);

        //move image
        containerMovement[imgcontarrloc] = trans
        imgContainer.style = 'transform: translateX(' + trans + 'vw)'

        //show Details
        showDetails(detailarr[imgcontarrloc][nextDetails])
    }
    else //if wrapping around
    {
        //resize dots
        dotLoc = 0;
        lookAtArray[dotLoc].style = 'transform: scale(1)'
        lookAtArray[lookAtArray.length-1].style = 'transform: scale(0.5)'

        //remove details
        var nextDetails = 0
        var currentDetails = lookAtArray.length-1
        hideDetails(detailarr[imgcontarrloc][currentDetails])

        //move image
        imgContainer.style = 'transform: translateX(' + trans + 'vw)'
        await delay(speed)
        imgContainer.classList.add('notransition');
        imgContainer.style = 'transform: translatex(0vw)'
        await delay(20)
        imgContainer.classList.remove('notransition')
        trans = 0
        containerMovement[imgcontarrloc] = trans

        //show details
        showDetails(detailarr[imgcontarrloc][nextDetails], speed/2)
    }


}

async function showDetails(detailEl) {
    detailEl.classList.remove("hide")
}

async function hideDetails(detailEl) {
    detailEl.classList.add("hide")
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function wrapperInfo (firstcard, i) {
    //image info
    var img = firstcard.querySelector("img");
    var imgsrc = img.src;
    var imgalt = img.alt;
    

    var details = firstcard.querySelector(".details")
    
    //card title
    var title = details.querySelector(".title").querySelector("h1").textContent

    // card description
    var desc = details.querySelector(".desc").querySelector("p").textContent

    // card button link
    var buttonlink = details.querySelector(".button").querySelector("button").getAttribute('onclick')


    //card img
    document.querySelectorAll(".wrap")[i].querySelector("img").src = imgsrc

    //card title
    document.querySelectorAll(".wrap")[i].querySelector(".details").querySelector(".title").querySelector("h1").textContent = title

    //card desc
    document.querySelectorAll(".wrap")[i].querySelector(".details").querySelector(".desc").querySelector("p").textContent = desc

    //card button
    document.querySelectorAll(".wrap")[i].querySelector(".details").querySelector(".button").querySelector("button").setAttribute('onclick', buttonlink)
}

function convertPXToVW(px) {
	return px * ((100 / document.documentElement.clientWidth)-0.00020);
}