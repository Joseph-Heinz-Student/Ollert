const drakeCards = dragula([...document.querySelectorAll(".cards")], {
    accepts: function (el, target) {
        return target.classList.contains("cards");
    },
});

const drakeSections = dragula([document.getElementById("sections")], {
    moves: function (el, source, handle) {
        return handle.classList.contains("section-header");
    },
    accepts: function (el, target) {
        return target.id === "sections";
    },
});

const docTitle = document.querySelector("#title");
docTitle.addEventListener("input", function () {
    const tempSpan = document.createElement("span");
    tempSpan.style.position = "absolute";
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.font = window.getComputedStyle(docTitle).font;
    tempSpan.textContent = docTitle.value || docTitle.placeholder;
    document.body.appendChild(tempSpan);
    docTitle.style.width = tempSpan.offsetWidth + 32 + "px";
    document.body.removeChild(tempSpan);
});

docTitle.dispatchEvent(new Event("input"));

function loadJSON(json) {
    document.getElementById("title").value = json.title;
    let result = "";
    for (let i = 0; i < json.boards.length; i++) {
        result += `<li class="section">
                    <div class="section-header">
                        <input type="text" value="${json.boards[i].name}" />
                    </div>
                    <div class="cards">`;
        for (let o = 0; o < json.boards[i].contents.length; o++) {
            result += `<div>
                            <h3>${json.boards[i].contents[o].name}</h3>
                            <p>${json.boards[i].contents[o].desc}</p>
                        </div>`;
        }
        result += "</div></li>";
    }
    document.getElementById("sections").innerHTML = result;
    drakeCards.containers = [...document.querySelectorAll(".cards")]
}

const testingJson = {
    title: "Defaulsdsdgsgdsgt Project",
    boards: [
        {
            name: "To-gfdgfgDo",
            // default card
            contents: [{ name: "tgfdgdfext", desc: "Modggfgdve me" }],
        },
        {
            name: "Thghfghfgo-gfdgfgDo",
            // default card
            contents: [{ name: "tg65464654fdgdfext", desc: "Modgg54646546fgdve me" }],
        },
    ],
};

loadJSON(testingJson)