const drake = dragula([...document.querySelectorAll(".cards"),document.querySelector("#sections")]);
drake.on("drop", (el, source, target) => {
    console.log(el, source, target)
    if(el instanceof HTMLDivElement && source.id === "sections"){
        drake.cancel();
    }

});

const docTitle = document.querySelector("#title");
docTitle.addEventListener("input", function () {
    const tempSpan = document.createElement("span");
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.font = window.getComputedStyle(docTitle).font;
    tempSpan.textContent = docTitle.value || docTitle.placeholder;
    document.body.appendChild(tempSpan);
    docTitle.style.width = tempSpan.offsetWidth + 32 + "px";
    document.body.removeChild(tempSpan);
});

docTitle.dispatchEvent(new Event("input"));
