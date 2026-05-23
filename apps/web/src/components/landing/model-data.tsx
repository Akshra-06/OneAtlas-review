const Img = ({ src, size }: { src: string; size: number }) => (
  <img
    src={src}
    alt=""
    width={size}
    height={size}
    style={{ objectFit: "contain", borderRadius: 4 }}
  />
);

export const ModelData = [
  {
    id: "gpt55",
    name: "GPT-5.5",
    vendor: "OpenAI",
    color: "#10A37F",
    soft: "#D9F0E8",
    mark: (s = 18) => <Img src="/models/openai.png" size={s} />,
  },
  {
    id: "gpt54mini",
    name: "GPT-5.4 Mini",
    vendor: "OpenAI",
    color: "#1DB87A",
    soft: "#D5F5E7",
    mark: (s = 18) => <Img src="/models/openai.png" size={s} />,
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    color: "#D97757",
    soft: "#FBE5DA",
    mark: (s = 18) => <Img src="/models/anthropic1.png" size={s} />,
  },
  {
    id: "claude-opus",
    name: "Claude Opus 4.6",
    vendor: "Anthropic",
    color: "#C0622F",
    soft: "#F9D5C0",
    mark: (s = 18) => <Img src="/models/anthropic1.png" size={s} />,
  },
  {
    id: "gemini-pro",
    name: "Gemini 3.1 Pro",
    vendor: "Google",
    color: "#4285F4",
    soft: "#DCE7FB",
    mark: (s = 18) => <Img src="/models/gemini.png" size={s} />,
  },
  {
    id: "gemini-flash",
    name: "Gemini 3 Flash",
    vendor: "Google",
    color: "#34A853",
    soft: "#D5EFE0",
    mark: (s = 18) => <Img src="/models/gemini.png" size={s} />,
  },
  {
    id: "deepseek",
    name: "DeepSeek V4",
    vendor: "DeepSeek",
    color: "#4D6BFE",
    soft: "#DEE4FE",
    mark: (s = 18) => <Img src="/models/deepseek.png" size={s} />,
  },
  {
    id: "llama",
    name: "Llama 4 Scout",
    vendor: "Meta",
    color: "#0866FF",
    soft: "#D9E7FF",
    mark: (s = 18) => <Img src="/models/meta.png" size={s} />,
  },
  {
    id: "mistral",
    name: "Mistral Small",
    vendor: "Mistral AI",
    color: "#FA520F",
    soft: "#FDDCCC",
    mark: (s = 18) => <Img src="/models/mistral.png" size={s} />,
  },
];