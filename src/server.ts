import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // what is the difference between dotenv/config?
import  pg  from "pg";//why not 'import {Client} from "pg"?

import { date } from "faker"; // what is that? 


const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());




const PORT_NUMBER = process.env.PORT ?? 4000;


app.get("/todos", async (req, res) => {
  // I had an error saying Client has already been connected you cannot reuse a client. St Overflow suggested to move new client to the fn
  const client = new pg.Client (process.env.DATABASE_URL) //why pg.Client and not new Client?
  await client.connect();
  const allTodos = await client.query("SELECT * FROM todos;");
  res.status(200).json(allTodos);
  
  await client.end();
});

// should I add catching errors? 
app.post("/todos", async (req,res) => {
  const client = new pg.Client ({connectionString: process.env.DATABASE_URL}) 

  await client.connect();
  const {description, dateAdded, dueDate, status} = req.body;
  await client.query("INSERT INTO todos (description, date_added,due_date, status) VALUES ($1, $2, $3, $4)",[description, dateAdded,dueDate,status]);
  res.status(201).json({status:'success'});
  await client.end();
});

app.put("/todos/:id", async (req, res) => {
  const client = new pg.Client ({connectionString: process.env.DATABASE_URL});
  await client.connect();
  const id = parseInt(req.params.id);
  console.log(id, 'id for put request')
  const {description, dateAdded, dueDate, status} = req.body;
  console.log({description, dateAdded, dueDate, status}, 'logging form put request')
  const result  = await client.query ("UPDATE todos SET description = $2, date_added = $3, due_date = $4, status = $5 WHERE id = $1;",[id, description, dateAdded, dueDate, status]);
  if(result.rowCount === 1) {
    res.status(200).json({
      status: "success"
    })
  }else {
    res.status(404).json({
      status: "fail"
    })
  }
  await client.end();
})

app.delete("/todos/:id", async (req, res) => {
  const client = new pg.Client ({connectionString: process.env.DATABASE_URL});
  await client.connect();
  const id = parseInt(req.params.id);
  console.log(id)
  const queryResult = await client.query ("DELETE FROM todos WHERE id=$1;",[id])
  console.log(queryResult)
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

// POST /items
// app.post<{}, {}, DbItem>("/items", (req, res) => {
//   // to be rigorous, ought to handle non-conforming request bodies
//   // ... but omitting this as a simplification
//   const postData = req.body;
//   const createdSignature = addDbItem(postData);
//   res.status(201).json(createdSignature);
// });

// // GET /items/:id
// app.get<{ id: string }>("/items/:id", (req, res) => {
//   const matchingSignature = getDbItemById(parseInt(req.params.id));
//   if (matchingSignature === "not found") {
//     res.status(404).json(matchingSignature);
//   } else {
//     res.status(200).json(matchingSignature);
//   }
// });

// // DELETE /items/:id
// app.delete<{ id: string }>("/items/:id", (req, res) => {
//   const matchingSignature = deleteDbItemById(parseInt(req.params.id));
//   if (matchingSignature === "not found") {
//     res.status(404).json(matchingSignature);
//   } else {
//     res.status(200).json(matchingSignature);
//   }
// });

// // PATCH /items/:id
// app.patch<{ id: string }, {}, Partial<DbItem>>("/items/:id", (req, res) => {
//   const matchingSignature = updateDbItemById(parseInt(req.params.id), req.body);
//   if (matchingSignature === "not found") {
//     res.status(404).json(matchingSignature);
//   } else {
//     res.status(200).json(matchingSignature);
//   }
// });

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
