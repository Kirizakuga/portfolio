const popup = document.getElementById("popup")
const openBtn = document.getElementById("openBtn")
const closeBtn = document.getElementById("clsBtn")

openBtn.onclick = function(){
    popup.style.display = "block";
}

closeBtn.onclick = function(){
    popup.style.display = "none";
}

window.onclick = function(event){
    if (event.target == popup){
        popup.style.display = "none";
    }
}