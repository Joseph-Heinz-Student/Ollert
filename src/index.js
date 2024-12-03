const express = require('express');
const app = express();
const port = 5050;

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
})