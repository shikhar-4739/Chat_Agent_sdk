export default function Home() {
  const apiRoutes = [
    {
      path: "/api/health",
      desc: "Health check endpoint – confirms the server is running.",
    },
    {
      path: "/api/chat",
      desc: "Main chat endpoint – interacts with the LLM provider.",
    },
    {
      path: "/api/config",
      desc: "Configuration endpoint – fetches provider & model settings.",
    },
    {
      path: "/api/content",
      desc: "Contentstack integration – fetches and manages CMS entries.",
    },
    // ➕ Add more here as your backend grows
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-12 text-center">
      {/* Project Header */}
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
        🚀 My-App Backend
      </h1>
      <p className="text-gray-700 max-w-2xl mb-8">
        This backend powers the Chatbot SDK with <b>LLM providers</b> and{" "}
        <b>Contentstack integration</b>.  
        Use the endpoints below to interact with the service.
      </p>

      {/* API Routes */}
      <section className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl text-left">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📡 Available API Routes
        </h2>
        <ul className="space-y-4">
          {apiRoutes.map((route) => (
            <li key={route.path} className="border-b pb-3 last:border-none">
              <a
                href={route.path}
                className="text-blue-600 font-medium hover:underline"
              >
                {route.path}
              </a>
              <p className="text-gray-600 text-sm mt-1">{route.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer / Project Info */}
      <footer className="mt-10 text-gray-500 text-sm">
        <p>
          Built with ❤️ using Next.js, Node, and Contentstack. <br />
          Source:{" "}
          <a
            href="https://github.com/shikhar-4739/Chat_Agent_sdk/tree/main/mcp-server"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            GitHub Repository
          </a>
        </p>
      </footer>
    </main>
  );
}
