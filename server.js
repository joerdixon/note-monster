// Required Packages
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
// Non Package Requirements
const database = require("./db/db.json")
// Initialize Server
const app = express();
// Server port
const PORT = process.env.PORT || 3000;

// Static middleware telling all file paths to start from this directory
app.use(express.static("public"));
// Middleware allowing the express server to parse incoming data.
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ROUTES ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Serves the landing page
app.get("/", (req, res) => {
    // Gets a true path by joining the directory and a relative file path.
    res.sendFile(path.join(__dirname, "./public/index.html"))
})

// Serves the notes HTML file when requested.
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
})

// Serves all notes in json format.
app.get("/api/notes", (req, res) => {
    // Read in current state of the db
    fs.readFile("./db/db.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err)
        } else {
            // Respond with json containing all notes.
            res.json(JSON.parse(data))
        }
    })
})

// When a post request is made to api/notes
app.post("/api/notes", (req, res) => {
    // Grab the incoming note
    const newNote = req.body;
    // Assign it a random id.
    newNote.id = crypto.randomUUID();
    // Read in the current state of the database, with utf-8 encoding, catching any errors that might arise.
    fs.readFile("./db/db.json", "utf-8", (err, data) => {
        if (err) {
            // If there is an error, we will attach an error status to the response and send back an object with information about the error.
            console.log(err);
            res.status(500).json({
                msg: "Something went wrong!?",
                err: err
            })
        } else {
            // Parse our json db into a array of objects.
            let currentDB = JSON.parse(data);
            // Push the body of the incoming request onto the db array.
            currentDB.push(newNote);
            // Rewrite the file with the new data added, replacing nothing and including 4 spaces of whitespace.
            fs.writeFile("./db/db.json", JSON.stringify(currentDB, null, 4), (err, data) => {
                if (err) {
                    // Catch any errors, send back error data or confirm success.
                    console.log(err);
                    res.status(500).json({
                        msg: "Something went wrong!?",
                        err: err
                    })
                } else {
                    res.json({
                        msg: "Successfully Added!"
                    })
                }
            })
        }
    })
})

// Delete Path
app.delete("/api/notes/:id", (req, res) => {
    // Read in the current state of the file as json.
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        if (err) {
            // Error Catch
            res.status(400).json({
                msg: "something went wrong",
                err: err
            })
        } else {
            // Parse json into object array and store in notes variable.
            const notes = JSON.parse(data);
            notes.forEach(note => {
                // Set noteLoc to the index of the current object.
                let noteLoc = notes.indexOf(note);
                // If the object id matches the request param
                if (req.params.id === note.id) {
                    // Remove that object from the array
                    notes.splice(noteLoc, 1);
                }
            })
            // Rewrite the file sans deleted object.
            fs.writeFile("./db/db.json", JSON.stringify(notes), (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    res.send("Success!!!")
                }
            })
        }
    })
})

// Turns on the port.
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})