/*
  Don't look here
  its bad
  r/programminggore
*/


const { createClient } = supabase;

const docTitle = document.querySelector("#title");
const supabaseANONKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnamZ1am9oY29uYmhuaGZ1dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNDg0MzMsImV4cCI6MjA0ODcyNDQzM30.OPTZLHywuAmnI8iuE61ztZd5HF75li_g54dQYSinpTM";
const supabaseURL = "https://hgjfujohconbhnhfuuyd.supabase.co";
const Supabase = createClient(supabaseURL, supabaseANONKey);

// Extract the UUID from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const uuid = urlParams.get("id"); // Make sure your query parameter is 'id'
let initData = {};
console.log("Variable from server:", uuid);

const drakeCards = dragula([...document.querySelectorAll(".cards")], {
  accepts: function (el, target) {
    return target.classList.contains("cards");
  },
}).on("drop", update);

const drakeSections = dragula([document.getElementById("sections")], {
  moves: function (el, source, handle) {
    return handle.classList.contains("section-header");
  },
  accepts: function (el, target) {
    return target.id === "sections";
  },
}).on("drop", update);

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

function genJSONFromHTML(html, sectionID) {
  const defaultJSON = {
    title: document.getElementById("title").value,
    boards: [],
  };
  [...html.children].forEach((elem) => {
    if (elem.id == sectionID) {
      return;
    }
    const board = {
      name: "",
      contents: [],
    };

    const title = [...elem.children][0].firstElementChild.value;
    board.name = title;

    const cards = [...[...elem.children][1].children];
    cards.forEach((card) => {
      const defaultCard = { name: "", desc: "" };
      const cardChildren = [...card.children];

      // generate card JSON from <h3> and <p>
      defaultCard.name = cardChildren[0].textContent;
      defaultCard.desc = cardChildren[1].textContent;
      board.contents.push(defaultCard);
    });

    defaultJSON.boards.push(board);
  });
  return defaultJSON;
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
    {
      name: "Thghfghfgo-gfdgfgDo",
      // default card
      contents: [{ name: "tg65464654fdgdfext", desc: "Modgg54646546fgdve me" }],
    },
  ],
};

// create a board if there isnt one sent from the uri encoding
async function createBoard() {
  try {
    const response = await fetch(`https://${window.location.host}/api/create_board`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Board created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating board:", error);
  }
}

// Define an async function to fetch data
async function getData() {
  if (!uuid) {
    console.error("No UUID found in the URL");
    const data = await createBoard();
    newUuid = data.data[0].id;
    window.location = `https://${window.location.host}/?id=${encodeURIComponent(
      newUuid
    )}`;
    return;
  }

  try {
    const response = await fetch(`https://${window.location.host}/api/get/${uuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const respData = await response.json();
    console.log("Fetched data:", respData.data);
    initData = respData.data;
    loadJSON(initData);

    // You can now use `data` to update your page
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const channel = Supabase.channel("boards")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "boards" },
    (payload) => {
      const newJSON = payload.new.data;
      loadJSON(newJSON);
    }
  )
  .subscribe();

document.querySelector("#title").addEventListener("change", update);

// Call the function to fetch data
getData();

const modal = document.getElementById("modal");
const input1 = document.querySelector("#modal > div > input:first-child");
const input2 = document.querySelector("#modal > div > input:nth-child(2)");
const button = document.querySelector("#modal button");

function displayModal(input1Data, input2Data, buttonData, callback) {
  input1.value = input1Data[2] ? input1Data[2] : "";
  input1.placeholder = input1Data[0];
  input1.disabled = !input1Data[1];
  input2.value = input2Data[2] ? input2Data[2] : "";
  input2.placeholder = input2Data[0];
  input2.disabled = !input2Data[1];
  button.innerHTML = buttonData;
  modal.style.display = "flex";
  function clickfunc() {
    button.removeEventListener("click", clickfunc);
    if (callback) callback(input1.value, input2.value);
    modal.style.display = "none";
  }
  button.addEventListener("click", clickfunc);
}

document.getElementById("share").onclick = function () {
  displayModal(
    ["First Input", true, `https://${window.location.host}/share/${uuid}`],
    ["", false, "Copy the Link Above"],
    "Close",
    function (x, y) {}
  );
};

let currentid = 1;

document.getElementById("createSection").onclick = function () {
  displayModal(
    ["Section Title", true],
    ["N/A", false],
    "Create Section",
    function (x, y) {
      currentid++;
      const sectionID = currentid;

      const section = document.createElement("li");
      section.className = "section";
      section.id = `selID${sectionID}`;
      section.innerHTML = `
      <div class="section-header">
      <input type="text" value="${x}" />
      <i class="fa-solid fa-trash"></i>
      <i class="fa-solid fa-plus"></i>
      </div>
      <div class="cards"></div>
      `;
      document.getElementById("sections").appendChild(section);
      section.querySelector(`div > input`).addEventListener("change", update);

      const addButton = section.querySelector("div > i:nth-child(3)");
      addButton.onclick = function () {
        displayModal(
          ["Card Title", true],
          ["Card Description", true],
          "Create Card",
          function (x, y) {
            currentid++;
            const cardID = currentid;

            const card = document.createElement("div");
            card.id = `selID${cardID}`;
            card.innerHTML = `
            <h3>${x}</h3>
            <p>${y}</p>
            `;
            section.querySelector(".cards").appendChild(card);

            card.onclick = function () {
              displayModal(
                ["New Title", true],
                ["New Description", true],
                "Edit Card",
                function (x, y) {
                  card.querySelector("h3").innerHTML = x;
                  card.querySelector("p").innerHTML = y;
                  update();
                }
              );
            };

            drakeCards.containers = [...document.querySelectorAll(".cards")];
            update();
          }
        );
      };
      drakeCards.containers = [...document.querySelectorAll(".cards")];
      update();
      const deleteButton = section.querySelector("div > i:nth-child(2)");
      deleteButton.onclick = function () {
        update(section.id);
      };
    }
  );
};

function loadJSON(json) {
  const sections = document.getElementById("sections");
  sections.innerHTML = "";
  document.getElementById("title").value = json.title;

  for (let i = 0; i < json.boards.length; i++) {
    currentid++;
    const sectionID = currentid;
    const section = document.createElement("li");
    section.className = "section";
    section.id = `selID${sectionID}`;
    section.innerHTML = `
    <div class="section-header">
    <input type="text" value="${json.boards[i].name}" />
    <i class="fa-solid fa-trash"></i>
    <i class="fa-solid fa-plus"></i>
    </div>
    <div class="cards"></div>
    `;
    sections.appendChild(section);
    section.querySelector(`div > input`).addEventListener("change", update);

    const addButton = section.querySelector("div > i:nth-child(3)");
    const deleteButton = section.querySelector("div > i:nth-child(2)");

    addButton.onclick = function () {
      displayModal(
        ["Card Title", true],
        ["Card Description", true],
        "Create Card",
        function (x, y) {
          currentid++;
          const cardID = currentid;
          const card = document.createElement("div");
          card.id = `selID${cardID}`;
          card.innerHTML = `<h3>${x}</h3><p>${y}</p>`;
          section.querySelector(".cards").appendChild(card);

          card.addEventListener("click", function () {
            displayModal(
              ["New Title", true],
              ["New Description", true],
              "Edit Card",
              function (x, y) {
                card.querySelector("h3").innerHTML = x;
                card.querySelector("p").innerHTML = y;
                update();
              }
            );
          });
          drakeCards.containers = [...document.querySelectorAll(".cards")];
          update();
        }
      );
    };

    deleteButton.addEventListener("click", function () {
      update(section.id);
    });

    for (let o = 0; o < json.boards[i].contents.length; o++) {
      currentid++;
      const cardID = currentid;
      const card = document.createElement("div");
      card.id = `selID${cardID}`;
      card.innerHTML = `
      <h3>${json.boards[i].contents[o].name}</h3>
      <p>${json.boards[i].contents[o].desc}</p>
      `;
      section.querySelector(".cards").appendChild(card);

      card.addEventListener("click", function () {
        displayModal(
          ["New Title", true],
          ["New Description", true],
          "Edit Card",
          function (x, y) {
            card.querySelector("h3").innerHTML = x;
            card.querySelector("p").innerHTML = y;
          }
        );
      });
    }
  }

  drakeCards.containers = [...document.querySelectorAll(".cards")];
  docTitle.dispatchEvent(new Event("input"));
}

async function update(sectionID = null) {
  let toRemove;
  if (sectionID !== null) {
    console.log(sectionID);
    toRemove = document.getElementById(sectionID);
  }
  let json = genJSONFromHTML(document.getElementById("sections"), sectionID);
  loadJSON(json);
  try {
    const { data, error } = await Supabase.from("boards")
      .update({ data: json })
      .eq("id", uuid);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
  drakeCards.containers = [...document.querySelectorAll(".cards")];
  if(toRemove) toRemove.remove();
}



/*displayModal(
    ["First Input", true],
    ["Second Input", false],
    "Close",
    function (x, y) {
        alert(x,y)
    }
);*/
