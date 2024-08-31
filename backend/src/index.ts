// import express, { Request, Response } from "express";

// // Create an instance of Express
// const app = express();

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Define a route
// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello, TypeScript!");
// });

// // Start the server
// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

import express, { Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  "mongodb+srv://prashantbokade08:prashantbokade0808@cluster0.zpjer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
  })
);
app.use(bodyParser.json()); // for parsing application/json

// MongoDB Model
interface ITodo extends Document {
  title: string;
  description: string;
  completed: boolean;
}

const todoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Todo = mongoose.model<ITodo>("Todo", todoSchema);

// Routes
app.get("/api/todos", async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
});

// app.post("/api/todos", async (req: Request, res: Response) => {
//   const todo = new Todo({
//     title: req.body.title,
//     description: req.body.description,
//   });

//   try {
//     const newTodo = await todo.save();
//     res.status(201).json(newTodo);
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : "Unknown error";
//     res.status(400).json({ message: errorMessage });
//   }
// });

// Backend: src/index.ts or your backend file
app.post("/api/todos", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Invalid data" });
    }

    const newTodo = new Todo({
      text,
      completed: false,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: "Error adding todo" });
  }
});

app.get("/api/todos/:id", async (req: Request, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
});

app.patch("/api/todos/:id", async (req: Request, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (req.body.title !== undefined) {
      todo.title = req.body.title;
    }
    if (req.body.description !== undefined) {
      todo.description = req.body.description;
    }
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ message: errorMessage });
  }
});

app.delete("/api/todos/:id", async (req: Request, res: Response) => {
  try {
    const result = await Todo.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ message: "Todo deleted" });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error connecting to MongoDB:", errorMessage);
  }
};

startServer();
