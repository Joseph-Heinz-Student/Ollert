require("dotenv").config();
const path = require("path");
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const app = express();
const port = 5050;

// initialize supabase
const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
    res.render(path.join(__dirname, "/static/index.html"), { json: {} });
});

app.get("/share/:uuid", async (req, res) => {
    const { uuid } = req.params;
    res.redirect(`/?id=${encodeURIComponent(uuid)}`);
});

app.get("/api/get/:uuid", async (req, res) => {
    const { uuid } = req.params;

    try {
        // regex checks for properly formatted UUID
        // example: 1b4e28ba-2fa1-11d2-883f-0016d3cca427
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({ error: "Invalid UUID format" });
        }

        // this gets the data from the table of boards
        // by selecting from the table that has the requested uuid
        // makes sure only to select one
        const { data, error } = await supabase
            .from("boards")
            .select("*")
            .eq("id", uuid)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/create_board", async (req, res) => {
    const defaultJson = {
        title: "Default Project",
        boards: [
            {
                name: "To-Do",
                // default card
                contents: [{ name: "Card", desc: "Move me" }],
            },
        ],
    };

    try {
        // creates a new row in the boards table
        const { data, error } = await supabase
            .from("boards")
            .insert([{ data: defaultJson }])
            .select();
        console.log(data);

        if (error) {
            res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: "Entry created successfully", data });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
