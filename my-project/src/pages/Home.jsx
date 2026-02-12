import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Main content */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        What can I help with?
      </h1>

      {/* Input box */}
      <div className="w-full max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.query.value;
            navigate(`/ask?q=${encodeURIComponent(query)}`);
          }}
          className="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-gray-300"
        >
          <input
            name="query"
            type="text"
            placeholder="Ask anything"
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <button type="submit" className="text-gray-400 hover:text-indigo-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>

        {/* Action buttons */}
        <div className="flex flex-col items-center mt-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {["Attach", "Search", "Study", "Create image"].map((item) => (
              <button
                key={item}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className="text-xs text-gray-400 mt-10 text-center max-w-md">
        By messaging ChatGPT, you agree to our Terms and have read our Privacy
        Policy.
      </p>
    </div>
  );
};

export default Home;