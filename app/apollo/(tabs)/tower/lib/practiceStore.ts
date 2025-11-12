"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  readJSON,
  writeJSON,
  waitForUserStorage,
  subscribe,
} from "@/lib/user-storage";
import {
  awardXp,
  derivePercentFromXp,
  hasPaneContent,
  isSnippetComplete,
} from "./xp";

const STORAGE_KEY = "practice_snippets";
const EVENT_KEY = "gaia:practice:update";
const VERSION = 1;

export type PracticeLanguage = "html" | "css" | "js";

export type PracticeSnippet = {
  id: string;
  label: string;
  html: string;
  css: string;
  js: string;
  updatedAt: number;
  awards: {
    firstSave?: boolean;
    previewClean?: boolean;
    complete?: boolean;
  };
};

export type PracticeTopicState = {
  id: string;
  xp: number;
  percent: number;
  lastTouched: number | null;
  activeSnippetId: string;
  snippets: Record<string, PracticeSnippet>;
};

type PracticeStoreData = {
  version: number;
  topics: Record<string, PracticeTopicState>;
};

export type SnippetDraft = Partial<Record<PracticeLanguage, string>> & {
  snippetId?: string;
  label?: string;
};

export type LessonSeedPayload = SnippetDraft & {
  mode?: "replace" | "append";
};

type PracticeEventDetail = {
  topicId: string;
};

const defaultSnippet = (
  snippetId = "starter",
  label = "Starter snippet"
): PracticeSnippet => ({
  id: snippetId,
  label,
  html: "<!-- Start coding here -->\n",
  css: "/* Style your markup */\n",
  js: "// Wire up interactions\n",
  updatedAt: 0,
  awards: {},
});

const emptyStore = (): PracticeStoreData => ({
  version: VERSION,
  topics: {},
});

let memoryStore: PracticeStoreData | null = null;

const normalizeTopicId = (topicId: string) =>
  topicId.trim().toLowerCase().replace(/\s+/g, "-");

const sanitizeLabel = (label?: string | null) => {
  const fallback = label?.trim();
  return fallback && fallback.length > 0 ? fallback : "Lesson snippet";
};

function readStore(): PracticeStoreData {
  const parsed = readJSON<PracticeStoreData | null>(STORAGE_KEY, null);
  if (!parsed || typeof parsed !== "object") {
    return emptyStore();
  }
  if (parsed.version !== VERSION) {
    return {
      version: VERSION,
      topics: parsed.topics ?? {},
    };
  }
  return {
    version: VERSION,
    topics: parsed.topics ?? {},
  };
}

function getStore(): PracticeStoreData {
  if (!memoryStore) {
    memoryStore = readStore();
  }
  return memoryStore;
}

function persistStore(store: PracticeStoreData, topicId?: string) {
  if (typeof window === "undefined") return;
  memoryStore = store;
  try {
    writeJSON(STORAGE_KEY, store);
    const detail: PracticeEventDetail | undefined = topicId
      ? { topicId }
      : undefined;
    window.dispatchEvent(
      new CustomEvent<PracticeEventDetail>(EVENT_KEY, { detail })
    );
  } catch {
    // Ignore quota errors silently for now.
  }
}

function ensureTopic(store: PracticeStoreData, rawTopicId: string) {
  const topicId = normalizeTopicId(rawTopicId);
  let topic = store.topics[topicId];
  if (!topic) {
    topic = {
      id: topicId,
      xp: 0,
      percent: 0,
      lastTouched: null,
      activeSnippetId: "starter",
      snippets: { starter: defaultSnippet() },
    };
    store.topics[topicId] = topic;
  } else if (!topic.snippets[topic.activeSnippetId]) {
    if (!topic.snippets.starter) {
      topic.snippets.starter = defaultSnippet();
    }
    topic.activeSnippetId = "starter";
  }
  return topic;
}

function ensureSnippet(
  topic: PracticeTopicState,
  snippetId?: string,
  label?: string
) {
  const targetId = snippetId?.trim().length ? snippetId : topic.activeSnippetId;
  let snippet = topic.snippets[targetId];
  if (!snippet) {
    const safeLabel = sanitizeLabel(label);
    snippet = defaultSnippet(targetId, safeLabel);
    topic.snippets[targetId] = snippet;
  } else if (label && label.trim().length) {
    snippet.label = label.trim();
  }
  return snippet;
}

function cloneTopic(topic: PracticeTopicState): PracticeTopicState {
  return {
    ...topic,
    snippets: Object.fromEntries(
      Object.entries(topic.snippets).map(([id, snippet]) => [
        id,
        {
          ...snippet,
          awards: { ...snippet.awards },
        },
      ])
    ),
  };
}

function mergeValue(
  existing: string,
  incoming: string,
  mode: "replace" | "append"
) {
  if (mode === "append" && hasPaneContent(existing)) {
    return `${existing.trimEnd()}\n${incoming}`;
  }
  return incoming;
}

export function usePracticeTopic(topicId: string) {
  const [snapshot, setSnapshot] = useState<PracticeTopicState>(() => {
    const topic = ensureTopic(getStore(), topicId);
    return cloneTopic(topic);
  });

  const refresh = useCallback(() => {
    (async () => {
      await waitForUserStorage();
      const topic = ensureTopic(getStore(), topicId);
      setSnapshot(cloneTopic(topic));
    })();
  }, [topicId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      memoryStore = null;
      refresh();
    }
    function handleCustom(event: Event) {
      const detail = (event as CustomEvent<PracticeEventDetail>).detail;
      if (!detail || detail.topicId === normalizeTopicId(topicId)) {
        refresh();
      }
    }
    const unsubscribe = subscribe(({ key }) => {
      if (key === STORAGE_KEY) {
        memoryStore = null;
        refresh();
      }
    });
    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_KEY, handleCustom as EventListener);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_KEY, handleCustom as EventListener);
    };
  }, [refresh, topicId]);

  const mutate = useCallback(
    (mutator: (topic: PracticeTopicState) => void) => {
      const store = getStore();
      const topic = ensureTopic(store, topicId);
      mutator(topic);
      topic.percent = derivePercentFromXp(topic.xp);
      persistStore(store, topic.id);
      setSnapshot(cloneTopic(topic));
    },
    [topicId]
  );

  const snippets = useMemo(
    () =>
      Object.values(snapshot.snippets).sort((a, b) => {
        if (a.id === snapshot.activeSnippetId) return -1;
        if (b.id === snapshot.activeSnippetId) return 1;
        return b.updatedAt - a.updatedAt || a.label.localeCompare(b.label);
      }),
    [snapshot.activeSnippetId, snapshot.snippets]
  );

  const activeSnippet =
    snapshot.snippets[snapshot.activeSnippetId] ??
    snapshot.snippets.starter ??
    defaultSnippet();

  const setActiveSnippet = useCallback(
    (id: string) => {
      mutate((topic) => {
        if (topic.snippets[id]) {
          topic.activeSnippetId = id;
        }
      });
    },
    [mutate]
  );

  const saveSnippet = useCallback(
    (draft: SnippetDraft) => {
      mutate((topic) => {
        const snippet = ensureSnippet(topic, draft.snippetId, draft.label);
        let changed = false;
        (["html", "css", "js"] as PracticeLanguage[]).forEach((lang) => {
          const nextValue = draft[lang];
          if (typeof nextValue === "string" && snippet[lang] !== nextValue) {
            snippet[lang] = nextValue;
            changed = true;
          }
        });
        if (!changed) return;
        const now = Date.now();
        snippet.updatedAt = now;
        topic.lastTouched = now;
        topic.activeSnippetId = snippet.id;
        if (!snippet.awards.firstSave) {
          snippet.awards.firstSave = true;
          topic.xp = awardXp(topic.xp, 1);
        }
        if (!snippet.awards.complete && isSnippetComplete(snippet)) {
          snippet.awards.complete = true;
          topic.xp = awardXp(topic.xp, 2);
        }
      });
    },
    [mutate]
  );

  const seedSnippet = useCallback(
    (payload: LessonSeedPayload) => {
      mutate((topic) => {
        const snippet = ensureSnippet(topic, payload.snippetId, payload.label);
        const mode = payload.mode ?? "replace";
        (["html", "css", "js"] as PracticeLanguage[]).forEach((lang) => {
          const incoming = payload[lang];
          if (typeof incoming === "string") {
            snippet[lang] = mergeValue(snippet[lang], incoming, mode);
          }
        });
        snippet.updatedAt = Date.now();
        snippet.awards = {};
        topic.lastTouched = snippet.updatedAt;
        topic.activeSnippetId = snippet.id;
      });
    },
    [mutate]
  );

  const markPreviewSuccess = useCallback(() => {
    mutate((topic) => {
      const snippet = ensureSnippet(topic);
      if (snippet.awards.previewClean) return;
      snippet.awards.previewClean = true;
      topic.xp = awardXp(topic.xp, 1);
    });
  }, [mutate]);

  return {
    topic: snapshot,
    snippets,
    activeSnippet,
    setActiveSnippet,
    saveSnippet,
    seedSnippet,
    markPreviewSuccess,
  };
}
