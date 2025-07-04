🚀 Welcome to Your Pipeline Editor (DAG Builder)

🧩 Project Overview
This project is a Pipeline Editor (DAG Builder) built using React + TypeScript + Vite. It allows users to:

✅ Add nodes dynamically

✅ Create directional connections (edges) with validation rules

✅ Delete nodes and edges using keyboard controls

✅ Validate if the structure forms a valid DAG

✅ Automatically arrange nodes using a Dagre-based layout

✅ Preview the graph’s structure as JSON

⚙️ Technologies Used
✅ React

✅ TypeScript

✅ Vite

✅ Tailwind CSS

✅ React Flow

✅ shadcn/ui – for clean UI components

✅ Dagre – for automatic graph layout

🛠️ How I Built It
I created this project using Lovable.dev, which provides a no-hassle environment to develop full-stack apps with clean design and instant deployment.

You can edit this project using:

Directly in Lovable (prompt-based builder)

Any IDE (via Git clone + push)

GitHub web editor

GitHub Codespaces

💻 Local Development Instructions
Make sure you have Node.js and npm installed. Then:

bash
Copy
Edit
# 1. Clone the repo
git clone <your-git-url>

# 2. Go to the project directory
cd <project-name>

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
🧪 DAG Validation Rules
A valid DAG must:

Contain at least 2 nodes

Have no cycles

Disallow self-loops

Only allow edges from outgoing → incoming

Ensure each node is connected to at least one edge

📐 Features
➕ Add Node with button

➖ Delete Node/Edge with keyboard

🔄 Draw directional edges manually

✅ Real-time DAG validation status

📐 Auto Layout with dagre

🧾 JSON preview of the pipeline

🎨 Clean, intuitive UI using Tailwind + shadcn/ui

🌐 Deployment
You can deploy and share your app directly from Lovable:

Click on Share → Publish

Optionally, connect a custom domain via Project → Settings → Domains

📸 Screenshots & Demo
(Include GIFs or screenshots of your app here)

📚 Challenges Faced
Implementing strict DAG validation (no cycles, self-loops, etc.)

Controlling custom edge connections using React Flow’s event system

Integrating auto-layout cleanly using Dagre and fitView()

Maintaining a modular, readable codebase using TypeScript

