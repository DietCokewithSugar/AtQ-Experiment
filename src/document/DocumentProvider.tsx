/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuthContext } from "@/auth/AuthProvider";
import { db } from "@/firebase";
import { stripUndefined } from "@/util/primitives-util";
import {
  child,
  DatabaseReference,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DOC_ROOT_PATH, DocMetadata, USERINFO_ROOT_PATH } from "./model-and-db";

type DocumentContext = {
  docLoading: boolean;
  docId: string;
  docRef: DatabaseReference;
  metadata: DocMetadata | undefined;
  updateMetadata: (updates: Partial<DocMetadata>) => void;
  deleteDocument: () => void;
};

const DocumentContext = createContext<DocumentContext>({} as DocumentContext);

export const DocumentContextConsumer = DocumentContext.Consumer;

export function useDocumentContext() {
  return useContext(DocumentContext);
}

type Props = {
  docId: string;
};

export function DocumentProvider({
  docId,
  children,
}: React.PropsWithChildren<Props>) {
  const { user } = useAuthContext();
  const docRef = useMemo(() => ref(db, `${DOC_ROOT_PATH}/${docId}`), [docId]);
  const metadataRef = child(docRef, "metadata");
  const [metadata, setMetadata] = useState<DocMetadata>();

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const updateMetadata = useCallback((updates: Partial<DocMetadata>) => {
    setMetadata((metadata) => {
      let merged = {
        ...metadata,
        ...updates,
      };
      update(child(docRef, "metadata"), stripUndefined(updates));
      if (userRef.current?.uid && merged.creatorUid === userRef.current.uid) {
        update(
          ref(db, `${USERINFO_ROOT_PATH}/${userRef.current.uid}/docs/${docId}`),
          stripUndefined(updates),
        );
      }
      return merged;
    });
  }, []);

  useEffect(() => {
    if (
      metadata &&
      Object.keys(metadata).length &&
      !metadata?.creatorUid &&
      user
    ) {
      updateMetadata({ creatorUid: user.uid });
    }
  }, [metadata, user]);

  const deleteDocument = useCallback(() => {
    set(docRef, { deleted: true, metadata: { creatorUid: "deleted" } });
    userRef.current &&
      remove(
        ref(db, `${USERINFO_ROOT_PATH}/${userRef.current.uid}/docs/${docId}`),
      );
    window.location.pathname = "/";
  }, [docId]);

  // Observe doc metadata and content from RTDB
  useEffect(() => {
    let unsub = onValue(metadataRef, (ss) => {
      setMetadata(ss.val() || {});
    });
    return () => unsub();
  }, [docId]);

  return (
    <DocumentContext.Provider
      value={{
        docLoading: !metadata,
        docId,
        docRef,
        metadata,
        updateMetadata,
        deleteDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
