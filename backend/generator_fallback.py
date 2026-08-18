from typing import Optional

def get_fallback_markdown(prompt: str) -> str:
    """Generates natural, conversational Markdown responses for common AI assistant queries when offline or without API keys."""
    p = prompt.lower().strip()

    # Conversational Greetings & Identity Questions
    if any(greet in p for greet in ["hi", "hii", "hello", "hey", "who are you", "what is your name", "whats ur name", "what's your name"]):
        if "name" in p or "who" in p or p in ["hi", "hii", "hello", "hey", "hi there"]:
            return "Hello! I'm **PromptToLife**, an intelligent AI assistant. How can I help you today?"

    if "python" in p or "script" in p:
        return """Here is a clean Python script for data processing and automation with type hints and structured error handling:

```python
import sys
import json
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def process_records(dataset: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    results = []
    for record in dataset:
        try:
            results.append({
                "id": record.get("id"),
                "title": str(record.get("title", "")).strip().title(),
                "score": round(float(record.get("score", 0)), 2)
            })
        except Exception as e:
            logging.error(f"Record processing error: {e}")
    return results

if __name__ == "__main__":
    data = [{"id": 1, "title": "analytics report", "score": 94.25}]
    print(json.dumps(process_records(data), indent=2))
```"""

    if "debug" in p or "react" in p or "hook" in p:
        return """When debugging React hooks like `useEffect` or `useCallback`, infinite rerenders or stale closures are usually caused by unstable object reference dependencies.

To fix this, stabilize object references using `useMemo` or move static configurations outside the component render function."""

    if "presentation" in p or "deck" in p or "outline" in p or "slide" in p:
        return """Here is an executive 5-slide presentation deck outline:

1. **Title & Vision**: Product vision and target goals.
2. **Industry Friction**: Key challenges faced by existing workflows.
3. **Product Solution**: Full-width conversational canvas & instant code export.
4. **Traction & Metrics**: User retention and performance latency.
5. **Growth Roadmap**: Future expansion and workspace memory.
"""

    clean_prompt = prompt.strip()
    return f"I would be happy to help with **{clean_prompt}**. Let me know if you need code examples, architecture guidance, or a specific breakdown!"
