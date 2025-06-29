import express from "express"
import bodyParser from "body-parser";
import ejs from "ejs"
import fs from "fs";

// const fs = fs();

const app = express();
const port = 3000

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

var index = 1;
function indexhandler(index) {
    while (true) {
        if (fs.existsSync(`blog${index}.txt`)) {
            index++;
        }
        else {
            break
        }
    }
    return index
}
index = indexhandler(index);

// function loadBlogs() {
//     var blogs = []
//     for (let i = 1; i < index; i++) {
//         if (fs.existsSync(`blog${i}.txt`)) {
//             fs.readFile(`blog${i}.txt`, 'utf8', (err, data) => {
//                 if (err) {
//                     console.error(err);
//                 }
//                 blogs.push({
//                     title: data.split("\n").shift(),
//                     content: data,
//                     id: i
//                 })
//                 // console.log(data);
//             });
//         }
//         else {
//             console.log("Does not Exists")
//         }
//     }
//     return blogs
// }

async function loadBlogs() {
    let blogs = [];
    for (let i = 1; i < index; i++) {
        if (fs.existsSync(`blog${i}.txt`)) {
            const data = await fs.promises.readFile(`blog${i}.txt`, 'utf8');
            blogs.push({
                title: data.split("\n").shift(),
                content: data.split("\n").slice(1).join("\n"),
                id: i
            });
        }
    }
    return blogs;
}


// var blogs = loadBlogs();
// (async function (params) {
//     blogs = await loadBlogs();
//     app.get("/", (req, res) => {
//         res.render("index.ejs", { blogs: blogs })
//     })
// })()

app.get("/", async (req, res) => {
    const blogs = await loadBlogs();
    res.render("index.ejs", { blogs });
});


app.get("/create", (req, res) => {
    res.render("create.ejs")
})


let status = 200
// app.post("/create", (req, res) => {
//     let newblog = `${req.body["title"]}\n${req.body["blog"]}`
//     fs.writeFile(`blog${index}.txt`, newblog, (err) => {
//         if (err) {
//             status = 500
//         } else {
//             console.log("File has been saved")
//             index++;
//             index = indexhandler(index)
//             blogs = loadBlogs()
//         }
//     })
//     res.render("create.ejs", { status: status })
// })

app.post("/create", async (req, res) => {
    const newblog = `${req.body["title"]}\n${req.body["blog"]}`;
    try {
        await fs.promises.writeFile(`blog${index}.txt`, newblog);
        console.log("File has been saved");
        index++;
        index = indexhandler(index);
        res.render("create.ejs", { status: 200 });
    } catch (err) {
        console.error(err);
        res.render("create.ejs", { status: 500 });
    }
});


// app.post("/delete", (req, res) => {
//     fs.rmSync(`blog${req.body["blogid"]}.txt`, { recursive: true, force: true }, (err) => {
//         if (err) {
//             console.error('Error deleting directory:', err);
//         } else {
//             console.log('Directory and its contents deleted successfully!');
//         }
//     });
//     blogs = loadBlogs();
//     res.redirect("/");

// })

app.post("/delete", async (req, res) => {
    try {
        fs.rmSync(`blog${req.body["blogid"]}.txt`, { recursive: true, force: true });
        console.log('Blog deleted successfully');
        res.redirect("/");
    } catch (err) {
        console.error('Error deleting blog:', err);
        res.redirect("/");
    }
});



app.post("/edit", async (req, res) => {
    const blogid = parseInt(req.body["blogid"]);
    const allBlogs = await loadBlogs();
    const editableblog = allBlogs.find(blog => blog.id === blogid);
    res.render("create.ejs", { editableblog });
});

app.post("/update", async (req, res) => {
    const newblog = `${req.body["title"]}\n${req.body["blog"]}`;
    try {
        const blogid = req.body["blogid"];
        await fs.promises.writeFile(`blog${blogid}.txt`, newblog);
        console.log("File has been saved");
        res.render("create.ejs", { status: 200 });
    } catch (err) {
        console.error(err);
        res.render("create.ejs", { status: 500 });
    }
})


app.get("/about", (req, res) => {
    res.render("about.ejs")
})

app.get("/contact", (req, res) => {
    res.render("contact.ejs")
})

app.listen(port, () => {
    console.log(`Listning on port ${port}`)
})