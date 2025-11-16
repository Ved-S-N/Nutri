import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { apiFetch } from "../lib/api";

export default function AIInputBox({
  onNewEntry,
}: {
  onNewEntry: (e: any) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const entry = await apiFetch("/api/ai-food/analyze", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      onNewEntry(entry);
      setText("");
    } catch (err) {
      alert("Error analyzing food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Input
        placeholder="Type what you ate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Add"}
      </Button>
    </div>
  );
}
