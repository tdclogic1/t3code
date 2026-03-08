import { type ProjectId, ThreadId } from "@t3tools/contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────────────

export interface Folder {
  id: string;
  projectId: ProjectId;
  name: string;
  createdAt: string;
  order: number;
}

// ── State ────────────────────────────────────────────────────────────

interface FolderState {
  folders: Folder[];
  /** Maps each thread ID to the folder it belongs to. */
  threadFolderMap: Record<string, string>;
}

interface FolderActions {
  createFolder: (projectId: ProjectId, name: string) => Folder;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  setThreadFolder: (threadId: ThreadId, folderId: string) => void;
  removeThreadFolder: (threadId: ThreadId) => void;
  getFoldersForProject: (projectId: ProjectId) => Folder[];
}

interface FolderStore extends FolderState, FolderActions {}

const FOLDER_STORE_KEY = "t3code:folders:v1";

// ── Store ────────────────────────────────────────────────────────────

export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      folders: [],
      threadFolderMap: {},

      createFolder: (projectId, name) => {
        const existingFolders = get().folders.filter(
          (f) => f.projectId === projectId,
        );
        const maxOrder = existingFolders.reduce(
          (max, f) => Math.max(max, f.order),
          -1,
        );
        const folder: Folder = {
          id: crypto.randomUUID(),
          projectId,
          name,
          createdAt: new Date().toISOString(),
          order: maxOrder + 1,
        };
        set((state) => ({
          folders: [...state.folders, folder],
        }));
        return folder;
      },

      renameFolder: (folderId, name) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, name } : f,
          ),
        }));
      },

      deleteFolder: (folderId) => {
        set((state) => {
          // Remove folder and unmap all threads that were in it
          const nextThreadFolderMap = { ...state.threadFolderMap };
          for (const [threadId, mappedFolderId] of Object.entries(
            nextThreadFolderMap,
          )) {
            if (mappedFolderId === folderId) {
              delete nextThreadFolderMap[threadId];
            }
          }
          return {
            folders: state.folders.filter((f) => f.id !== folderId),
            threadFolderMap: nextThreadFolderMap,
          };
        });
      },

      setThreadFolder: (threadId, folderId) => {
        set((state) => ({
          threadFolderMap: {
            ...state.threadFolderMap,
            [threadId]: folderId,
          },
        }));
      },

      removeThreadFolder: (threadId) => {
        set((state) => {
          const next = { ...state.threadFolderMap };
          delete next[threadId];
          return { threadFolderMap: next };
        });
      },

      getFoldersForProject: (projectId) => {
        return get()
          .folders.filter((f) => f.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: FOLDER_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        folders: state.folders,
        threadFolderMap: state.threadFolderMap,
      }),
    },
  ),
);
