const drakeCards = dragula([...document.querySelectorAll('.cards')], {
    accepts: function (el, target) {
        return target.classList.contains('cards');
    }
});

const drakeSections = dragula([document.getElementById('sections')], {
    moves: function (el, source, handle) {
        return handle.classList.contains('section-header');
    },
    accepts: function (el, target) {
        return target.id === 'sections';
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
