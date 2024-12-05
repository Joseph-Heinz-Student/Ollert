const { createClient } = supabase;

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
}).on("drop", async function () {
  let json = genJSONFromHTML(document.getElementById("sections"));
  loadJSON(json);
  try {
    console.log(uuid);
    const { data, error } = await Supabase.from("boards")
      .update({ data: json })
      .eq("id", uuid);

    if (error) {
      console.error("Error updating data:", error);
    } else {
      console.log("Updated data:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
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
  drakeCards.containers = [...document.querySelectorAll(".cards")];
  docTitle.dispatchEvent(new Event("input"));
}

function genJSONFromHTML(html) {
  const defaultJSON = {
    title: document.getElementById("title").value,
    boards: [],
  };
  [...html.children].forEach((elem) => {
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
  ],
};

// create a board if there isnt one sent from the uri encoding
async function createBoard() {
  try {
    const response = await fetch("http://localhost:5050/api/create_board", {
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
    window.location = `http://localhost:5050/?id=${encodeURIComponent(newUuid)}`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:5050/api/get/${uuid}`, {
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

// Call the function to fetch data
getData();
