import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

db.connect();


app.get("/", async (req, res) => {

  const result = await db.query(`SELECT * FROM items`);
  const items = result.rows;
  console.log("Printing items from the ROOT endpoint", items);


  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async(req, res) => {

  try {
    const item = req.body.newItem;
    //items.push({ title: item });
    const result = await db.query(`INSERT INTO items (title) VALUES ($1)`,
      [item]
    );
  
    const items = result.rows;
    console.log("Printing items from the ADD endpoint", items);
  
    res.redirect("/");
    
  } catch (error) {
    console.log("Error Inserting item to the database");

    res.status(500).send(error);
    
  }

});

app.post("/edit", async(req, res) => {

  try {
    const updatedItemId = req.body.updatedItemId;
    const updatedItemTitle = req.body.updatedItemTitle;

  //console.log("Updated item ID: " + updatedItemId);
  //console.log("Before Updating the Item: " + updatedItemTitle);

    const result = await db.query(`UPDATE items
                                SET title = $1
                                WHERE items.id = $2
                                RETURNING *
                                `, 
                                [updatedItemTitle, updatedItemId]
                              )

    const updated = result.rows[0];
    console.log("After Updating the item: ",  updated);

    res.redirect('/');
    
  } catch (error) {
    console.log("Error Deleting item to the database");

    res.status(500).send(error);
    
  }
  
});



app.post("/delete", async(req, res) => {
  //const deletedItem = req.body.deleteItemId;
  //console.log("Deleted item: ", deletedItem);

try {
  const deletedItem = req.body.deleteItemId;
  //console.log("Deleted item: ", deletedItem);

  const result = await db.query(`DELETE FROM items WHERE items.id = $1 RETURNING *`, 
    [deletedItem]
    );

    const deletedItems = result.rows[0];
    console.log("Deleted items: ", deletedItems);

    res.redirect('/');
  
} catch (error) {
  console.log("Error Deleting item to the database");

  res.status(500).send(error);
  
}
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
