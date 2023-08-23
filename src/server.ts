import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // what is the difference between dotenv/config?
import pg from "pg"; //why not 'import {Client} from "pg"?

// import { date } from "faker"; // what is that?

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

const PORT_NUMBER = process.env.PORT ?? 4000;

app.get("/todos", async (req, res) => {
  const client = new pg.Client(process.env.DATABASE_URL);
  await client.connect();
  const allTodos = await client.query("SELECT * FROM todos;");
  res.status(200).json(allTodos.rows);

  await client.end();
});

// should I add catching errors?
app.post("/todos", async (req, res) => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();
  const { description, date_added, due_date, status } = req.body;
  await client.query(
    "INSERT INTO todos (description, date_added,due_date, status) VALUES ($1, $2, $3, $4)",
    [description, date_added, due_date, status]
  );
  res.status(201).json({ status: "success" });
  await client.end();
});

app.put("/todos/:id", async (req, res) => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const id = parseInt(req.params.id);
  console.log(id, "id for put request");
  const { description, date_added, due_date, status } = req.body;

  const result = await client.query(
    "UPDATE todos SET description = $2, date_added = $3, due_date = $4, status = $5 WHERE id = $1;",
    [id, description, date_added, due_date, status]
  );
  if (result.rowCount === 1) {
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(404).json({
      status: "fail",
    });
  }
  await client.end();
});

app.delete("/todos/:id", async (req, res) => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const id = parseInt(req.params.id);
  console.log(id);
  const queryResult = await client.query("DELETE FROM todos WHERE id=$1;", [
    id,
  ]);
  console.log(queryResult);
  const didRemove = queryResult.rowCount === 1;

  if (didRemove) {
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        id: "Could not find a signature with that id identifier",
      },
    });
  }
  await client.end();
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
