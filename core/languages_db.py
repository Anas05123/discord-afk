from typing import List, Dict, Any

LANGUAGES_DB: List[Dict[str, Any]] = [
    {
        "id": "none",
        "name": "No Badge (Pure)",
        "emoji": "🚫",
        "tooltip": "Clean Visual Studio Code",
        "url": "",
        "default_details": "Editing SyntaFlow",
        "default_state": "Working Editing SyntaFlow Integrations"
    },
    {
        "id": "react",
        "name": "React",
        "emoji": "⚛️",
        "tooltip": "React 19 / JSX",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/react/react.png",
        "default_details": "Building React Components",
        "default_state": "State: Hooks & Context"
    },
    {
        "id": "nextjs",
        "name": "Next.js",
        "emoji": "⚡",
        "tooltip": "Next.js App Router",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/nextjs/nextjs.png",
        "default_details": "Developing Full-Stack App",
        "default_state": "Server Components & API"
    },
    {
        "id": "typescript",
        "name": "TypeScript",
        "emoji": "🟦",
        "tooltip": "TypeScript 5.4",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png",
        "default_details": "Strict Type Safety Mode",
        "default_state": "Refactoring & Types"
    },
    {
        "id": "javascript",
        "name": "JavaScript",
        "emoji": "🟨",
        "tooltip": "JavaScript ES2024",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png",
        "default_details": "Writing Modern JavaScript",
        "default_state": "Frontend / Node.js"
    },
    {
        "id": "python",
        "name": "Python",
        "emoji": "🐍",
        "tooltip": "Python 3.12",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/python/python.png",
        "default_details": "Building AI & Scripts",
        "default_state": "Backend / Automation"
    },
    {
        "id": "nodejs",
        "name": "Node.js",
        "emoji": "💚",
        "tooltip": "Node.js v22",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png",
        "default_details": "High Performance Backend",
        "default_state": "Express / Fastify API"
    },
    {
        "id": "vue",
        "name": "Vue.js",
        "emoji": "🟢",
        "tooltip": "Vue 3 / Vite",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/vue/vue.png",
        "default_details": "Composition API & Pinia",
        "default_state": "Frontend Architecture"
    },
    {
        "id": "rust",
        "name": "Rust",
        "emoji": "🦀",
        "tooltip": "Rust 2024 Edition",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/rust/rust.png",
        "default_details": "Zero-Cost Abstractions",
        "default_state": "Borrow Checker Mastery"
    },
    {
        "id": "cpp",
        "name": "C++",
        "emoji": "🔷",
        "tooltip": "C++20 / STL",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/cpp/cpp.png",
        "default_details": "Systems Programming",
        "default_state": "Memory & Performance"
    },
    {
        "id": "csharp",
        "name": "C# / .NET",
        "emoji": "💠",
        "tooltip": "C# 12 / .NET 8",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/csharp/csharp.png",
        "default_details": "Developing .NET Solution",
        "default_state": "Backend Services"
    },
    {
        "id": "go",
        "name": "Go (Golang)",
        "emoji": "🐹",
        "tooltip": "Go 1.22",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/go/go.png",
        "default_details": "Microservices & Concurrency",
        "default_state": "Goroutines & Channels"
    },
    {
        "id": "java",
        "name": "Java",
        "emoji": "☕",
        "tooltip": "Java 21 LTS",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/java/java.png",
        "default_details": "Spring Boot Enterprise",
        "default_state": "Architecture & JVM"
    },
    {
        "id": "docker",
        "name": "Docker",
        "emoji": "🐳",
        "tooltip": "Docker Containers",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/docker/docker.png",
        "default_details": "Container Orchestration",
        "default_state": "DevOps & Compose"
    },
    {
        "id": "tailwind",
        "name": "Tailwind CSS",
        "emoji": "🎨",
        "tooltip": "Tailwind CSS",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/tailwind/tailwind.png",
        "default_details": "Modern Responsive Design",
        "default_state": "Utility-First CSS"
    },
    {
        "id": "photoshop",
        "name": "Photoshop",
        "emoji": "🎨",
        "tooltip": "Adobe Photoshop CC",
        "url": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png",
        "default_details": "Editing Creative_Artwork.psd",
        "default_state": "Workspace: Retouching & Layer Compositing"
    },
    {
        "id": "illustrator",
        "name": "Illustrator",
        "emoji": "✒️",
        "tooltip": "Adobe Illustrator CC",
        "url": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png",
        "default_details": "Designing Brand_Identity.ai",
        "default_state": "Vector Artboards & Pen Tool"
    },
    {
        "id": "aftereffects",
        "name": "After Effects",
        "emoji": "✨",
        "tooltip": "Adobe After Effects CC",
        "url": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png",
        "default_details": "Compositing Motion_VFX.aep",
        "default_state": "Timeline: 3D Camera & Keyframes"
    },
    {
        "id": "premiere",
        "name": "Premiere Pro",
        "emoji": "🎬",
        "tooltip": "Adobe Premiere Pro CC",
        "url": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png",
        "default_details": "Editing Master_Timeline.prproj",
        "default_state": "Color Grading & Audio Mastering"
    },
    {
        "id": "figma",
        "name": "Figma",
        "emoji": "📐",
        "tooltip": "Figma UI/UX Design",
        "url": "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        "default_details": "Designing UI_Design_System.fig",
        "default_state": "Auto-Layout & Interactive Prototype"
    },
    {
        "id": "html_css",
        "name": "HTML & CSS",
        "emoji": "🌐",
        "tooltip": "HTML5 & CSS3",
        "url": "https://raw.githubusercontent.com/github/explore/main/topics/html/html.png",
        "default_details": "Modern Web UI",
        "default_state": "Semantic & Flexbox"
    }
]

def get_language_by_name_or_id(query: str) -> Dict[str, Any]:
    q = query.strip().lower()
    for item in LANGUAGES_DB:
        if item["id"] == q or item["name"].lower() == q or q in item["name"].lower():
            return item
    return LANGUAGES_DB[0]

