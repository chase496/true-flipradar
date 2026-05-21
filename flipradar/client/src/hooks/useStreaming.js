import { useState, useRef, useCallback } from 'react';
import { getClientId } from '../utils/clientId';

export function useStreaming() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    setText('');
    setError(null);
    setUpgradeRequired(false);
  }, []);

  const stream = useCallback(async (url, body) => {
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    reset();
    setIsStreaming(true);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': getClientId(),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 && data.upgradeRequired) {
          setUpgradeRequired(true);
          setError(data.message || 'Daily limit reached. Upgrade for unlimited scans.');
        } else {
          setError(data.error || `Request failed (${res.status})`);
        }
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setError(parsed.error);
              break;
            }
            if (parsed.text) {
              setText((prev) => prev + parsed.text);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Connection failed. Is the server running?');
      }
    } finally {
      setIsStreaming(false);
    }
  }, [reset]);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return { text, isStreaming, error, upgradeRequired, stream, abort, reset };
}
