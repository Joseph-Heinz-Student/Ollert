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
