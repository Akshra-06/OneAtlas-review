const models = [
  { name: "Mistral Large", vendor: "Mistral AI", color: "#FFB17A" },
  { name: "DeepSeek V3", vendor: "DeepSeek", color: "#C7C9FF" },
  { name: "Grok 3", vendor: "xAI", color: "#2A2A2A" },
  { name: "Qwen 2.5", vendor: "Alibaba", color: "#FF9173" },
  { name: "Claude Opus 4.7", vendor: "Anthropic", color: "#FF8B5B" },
  { name: "GPT-5", vendor: "OpenAI", color: "#A8E5CE" },
  { name: "Gemini 2.5", vendor: "Google", color: "#B8C9FF" },
  { name: "Llama 4", vendor: "Meta", color: "#A8C5FF" },
  { name: "Mistral Small", vendor: "Mistral AI", color: "#FFCAA8" },
];

export function ModelsStrip() {
  // Duplicate the list to make the infinite scroll seamless
  const doubled = [...models, ...models];

  return (
    <div className="models-strip">
      <div className="models-label">Build with all the latest AI models</div>
      <div className="models-track-wrap">
        <div className="models-track">
          {doubled.map((m, i) => (
            <div className="model-pill" key={i}>
              <span className="model-dot" style={{ background: m.color }} />
              <span>
                <span className="name">{m.name}</span>
                <br />
                <span className="vendor">{m.vendor}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
