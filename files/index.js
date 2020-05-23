
function getband() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("randband").innerHTML = JSON.parse(this.responseText).trupa;
        }
    };
    xhttp.open("GET", "/api/bandget", true);
    xhttp.send();

}

function changeImg() {
    document.querySelector(".hero .toplayer").classList.toggle("hidden");


}

function onLoad() {
    setInterval(changeImg, 5000);
}