async function postComment(form) {
    const comment = form["comment-content"].value;
    const ob = {
        comment
    }
    const newcomments = await postData('/api/createComment', ob);
    console.log(newcomments)
    showComments(newcomments);
}

function showComments(newcomments) {
    const area = document.getElementById("commarea");
    area.innerHTML = "";
    newcomments.forEach(comm => {
        const template = `
            <div class="comment">
            ${comm.user}: ${comm.text}
            </div>
        `
        console.log(area)
        area.insertAdjacentHTML("beforeend", template)
    })

}

async function postData(url, data) {
    const res = await fetch(url, {
        method : "POST",
        headers : {
            "Accept" : "Application/json",
            "Content-Type" : "Application/json"
        },
        body : JSON.stringify(data)
    })
    return res.json();

}

async function getComments(url){
    const res = await fetch(url)
    return res.json();
}

async function initComments(){
    const commlist = await getComments('/api/getComments')
    showComments(commlist)
}

function trackChanged() {
    var tracks = {
        1: {
            src: "/audio/prisoner.mp3",
            name: "01 - Prisoner",
        },
        2: {
            src: "/audio/lyricslie.mp3",
            name: "02 - Lyrics Lie",
        },
        3: {
            src: "/audio/strawberry.mp3",
            name: "03 - Strawberry's Wake",
        },
    };

    var selector = document.getElementById('trackSelect')
    var trackIndex = selector.options[selector.selectedIndex].value;
    var track = tracks[trackIndex];

    var trackTitle = document.getElementById('trackTitle');
    var trackAudio = document.getElementById('trackAudio');

    trackTitle.innerText = track.name;
    trackAudio.src = track.src;
}

function updateHeart() {
    const isFavourite = (localStorage.getItem('hasFav') == "true");
    const heart = document.getElementById('heart');
    if (isFavourite) {
        heart.src = '/img/fav1.svg';
    } else {
        heart.src = '/img/fav2.svg';
    }
}

function onClick() {
    const isFavourite = !(localStorage.getItem('hasFav') == "true");
    localStorage.setItem('hasFav', isFavourite);
    updateHeart()
}