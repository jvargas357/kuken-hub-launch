import { useState, useCallback } from "react";
import { Play, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PythonOutputProps {
  endpoint: string;
  script: string;
}

const PythonOutput = ({ endpoint, script }: PythonOutputProps) => {
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setOutput(typeof data.output === "string" ? data.output : JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setLoading(false);
    }
  }, [endpoint, script]);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            execute();
          }}
          disabled={loading}
          className="h-7 px-2.5 text-xs font-mono border-border"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Play className="h-3 w-3 mr-1" />
          )}
          Run
        </Button>

        {output && !error && (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        )}
        {error && (
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        )}
      </div>

      {(output || error) && (
        <pre
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`text-xs font-mono p-2.5 rounded-md max-h-32 overflow-auto whitespace-pre-wrap ${
            error
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-secondary/80 text-foreground border border-border"
          }`}
        >
          {error || output}
        </pre>
      )}
    </div>
  );
};

export default PythonOutput;
