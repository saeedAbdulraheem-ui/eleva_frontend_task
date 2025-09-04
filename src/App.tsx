import React, { useState, useRef } from "react";

type Values = {
  company: string;
  problem: string;
  solution: string;
  ask: string;
  tone: string;
};

type StreamChunk = {
  section: "headline" | "subhead" | "body";
  token: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* mockAIStream(values: Values, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
  const { company, problem, solution, ask, tone } = values;

  const toneAdj: Record<string, string> = {
    confident: "confident",
    friendly: "friendly",
    casual: "casual",
    technical: "technical",
  };

  const headlineText = `${company}: a ${toneAdj[tone] || "confident"} path to solve ${problem}`;
  const subheadText = `we deal with ${problem} using ${solution}. the ask: ${ask}.`;
  const bodyText = [
    `at ${company}, we are focused on solvign ${problem} with tone: ${toneAdj[tone] || "confident"}.`,
    `using solution: ${solution}.`,
    `today, we are asking for ${ask} to speed up execution.`,
  ].join(" ");

  const streams = [
    { section: "headline" as const, tokens: headlineText.split(" ") },
    { section: "subhead" as const, tokens: subheadText.split(" ") },
    { section: "body" as const, tokens: bodyText.split(" ") },
  ];

  while (streams.some((s) => s.tokens.length > 0)) {
    for (const s of streams) {
      if (signal?.aborted) return;
      if (s.tokens.length > 0) {
        yield { section: s.section, token: s.tokens.shift()! + " " };
        await sleep(s.section === "body" ? 45 : 25);
      }
    }
  }
}

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.company.trim()) errors.company = "company is required.";
  if (!values.problem.trim()) errors.problem = "problem is required.";
  if (!values.solution.trim()) errors.solution = "solution is required.";
  if (!values.ask.trim()) errors.ask = "ask is required.";
  if (!values.tone.trim()) errors.tone = "tone is required.";
  return errors;
}

export default function App() {
  const [values, setValues] = useState<Values>({
    company: "",
    problem: "",
    solution: "",
    ask: "",
    tone: "confident",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [isStreaming, setIsStreaming] = useState(false);

  const [headline, setHeadline] = useState("");
  const [subhead, setSubhead] = useState("");
  const [body, setBody] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const startStream = async () => {
    setHeadline("");
    setSubhead("");
    setBody("");

    const err = validate(values);
    setErrors(err);
    if (Object.keys(err).length) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    try {
      for await (const { section, token } of mockAIStream(values, controller.signal)) {
        if (section === "headline") setHeadline((h) => h + token);
        if (section === "subhead") setSubhead((s) => s + token);
        if (section === "body") setBody((b) => b + token);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="container">
      <h1>AI-Native Pitch Writer</h1>
      <div className="card">
        <h2>Inputs</h2>
        <label>Company</label>
        <input name="company" value={values.company} onChange={handleChange} />
        {errors.company && <p style={{ color: "red" }}>{errors.company}</p>}

        <label>Problem</label>
        <textarea name="problem" value={values.problem} onChange={handleChange} />
        {errors.problem && <p style={{ color: "red" }}>{errors.problem}</p>}

        <label>Solution</label>
        <textarea name="solution" value={values.solution} onChange={handleChange} />
        {errors.solution && <p style={{ color: "red" }}>{errors.solution}</p>}

        <label>Ask</label>
        <textarea name="ask" value={values.ask} onChange={handleChange} />
        {errors.ask && <p style={{ color: "red" }}>{errors.ask}</p>}

        <label>Tone</label>
        <select name="tone" value={values.tone} onChange={handleChange}>
          <option value="confident">Confident</option>
          <option value="friendly">Friendly</option>
          <option value="casual">casual</option>
          <option value="technical">Technical</option>
        </select>

        <button className="primary" onClick={startStream} disabled={isStreaming}>
          {isStreaming ? "Generating…" : "Generate"}
        </button>
      </div>

      <div className="card">
        <h2>Output</h2>
        <h3>Headline</h3>
        <p>{headline}</p>

        <h3>Subhead</h3>
        <p>{subhead}</p>

        <h3>Body</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}
