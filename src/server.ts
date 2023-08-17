import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";


const app = express();

dotenv.config();
const client = new Client (process.env.DATABASE_URL)
app.use(express.json());
app.use(cors());




const PORT_NUMBER = process.env.PORT ?? 4000;



app.get("/todos", async (req, res) => {
  await client.connect();
  const allTodos = await client.query("SELECT * FROM todos;");
  res.status(200).json(allTodos);
  console.log(res.status,allTodos)
  await client.end()
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
