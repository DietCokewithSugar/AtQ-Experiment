/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PresenceProvider,
  usePresenceContext,
} from "@/collab/PresenceProvider";
import {
  DocumentContextConsumer,
  DocumentProvider,
  useDocumentContext,
} from "@/document/DocumentProvider";
import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Text,
  TextArea,
  Tooltip,
} from "@radix-ui/themes";
import { child, onValue, set, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useGeminiApi } from "./ai";
import { PeerCursorsOverlay } from "./collab/PeerCursorsOverlay";
import { Header } from "./components/Header";
import { Loading } from "./components/Loading";
import { Logo } from "./components/Logo";
import { useToast } from "./components/Toast";
import styles from "./Editor.module.scss";
import {
  generateMiniApp,
  updateMiniApp,
} from "./miniapp-generator/miniapp-generator";
import { generateTitle } from "./miniapp-generator/title-generator";
import { MiniAppHost } from "./miniapp/MiniAppHost";
import { EllipsisVerticalIcon, PencilIcon } from "lucide-react";
import { Popover } from "@radix-ui/themes";
import { useAuthContext } from "./auth/AuthProvider";
import { stripUndefined } from "./util/primitives-util";

type Props = { docId: string };

export function Editor(props: Props) {
  let { docId } = props;
  return (
    <DocumentProvider docId={docId}>
      <DocumentContextConsumer>
        {({ docRef }) => (
          <PresenceProvider presenceRef={child(docRef, "presence")}>
            <EditorInner />
          </PresenceProvider>
        )}
      </DocumentContextConsumer>
    </DocumentProvider>
  );
}

type DocContent = {
  generating?: boolean;
  code: string;
};

function EditorInner() {
  let { metadata, docRef, docLoading, updateMetadata } = useDocumentContext();
  let { user } = useAuthContext();
  let { peers, setAppData } = usePresenceContext();
  let [docContent, setDocContent] = useState<DocContent>();
  let [appPrompt, setAppPrompt] = useState("");
  let [editPrompt, setEditPrompt] = useState("");
  let { toast } = useToast();
  const contentRef = useMemo(() => child(docRef, "content"), [String(docRef)]);
  const ai = useGeminiApi();

  function updateDoc(doc: Partial<DocContent>) {
    setDocContent((prev) => ({ code: "", ...prev, ...doc }));
    update(contentRef, stripUndefined(doc));
  }

  useEffect(() => {
    document.title = metadata?.title ? `${metadata.title} – @Q` : "@Q";
  }, [metadata?.title]);

  // Observe doc metadata and content from RTDB
  useEffect(() => {
    let unsub = onValue(contentRef, (ss) => {
      setDocContent((ss.val() || undefined) as DocContent | undefined);
    });
    return () => unsub();
  }, [String(contentRef)]);

  if (docLoading) return <Loading />;

  async function generateApp() {
    updateDoc({ generating: true });
    try {
      generateTitle(ai, appPrompt).then((title) =>
        updateMetadata({
          title,
          creatorUid: user?.uid,
        }),
      );
      let code = await generateMiniApp(ai, appPrompt);
      updateDoc({ code });
    } catch (e) {
      toast(String((e as any)?.message || e), { status: "error" });
    } finally {
      updateDoc({ generating: false });
    }
  }

  async function updateApp() {
    if (!docContent?.code) return;
    updateDoc({ generating: true });
    try {
      let code = await updateMiniApp(ai, docContent.code, editPrompt);
      setEditPrompt("");
      updateDoc({ code });
    } catch (e) {
      toast(String((e as any)?.message || e), { status: "error" });
    } finally {
      updateDoc({ generating: false });
    }
  }

  return (
    <div className={styles.editor}>
      <Header>
        {!!docContent?.code && (
          <>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton variant="ghost" color="gray" radius="full">
                  <EllipsisVerticalIcon size={20} />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => {
                    set(child(docRef, "miniAppState"), null);
                  }}
                >
                  Clear app state
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Popover.Root>
              <Tooltip content="Edit">
                <Popover.Trigger>
                  <IconButton variant="ghost" color="gray" radius="full">
                    <PencilIcon size={20} />
                  </IconButton>
                </Popover.Trigger>
              </Tooltip>
              <Popover.Content width="360px">
                <Flex direction="column" gap="2">
                  <TextArea
                    placeholder="What do you want to change?"
                    value={editPrompt}
                    rows={6}
                    onChange={(e) => setEditPrompt(e.target.value)}
                  />
                  <Flex gap="1" align="center">
                    <div style={{ flex: 1 }} />
                    <Button
                      size="1"
                      onClick={updateApp}
                      disabled={!editPrompt.trim()}
                    >
                      Regenerate app
                    </Button>
                  </Flex>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </>
        )}
      </Header>
      <div
        className={styles.appContainer}
        onMouseLeave={() => setAppData({ canvasCursorPos: null })}
      >
        {!!docContent?.code && !docContent.generating && (
          <>
            <PeerCursorsOverlay
              peers={peers
                .filter((p) => p.appData?.canvasCursorPos)
                .map((p) => ({
                  color: p.color,
                  name: p.displayName,
                  origin: "top-center",
                  x: p.appData?.canvasCursorPos!.x || 0,
                  y: p.appData?.canvasCursorPos!.y || 0,
                }))}
            />
            <MiniAppHost
              className={styles.appViewer}
              appCode={docContent.code}
              onMouseMove={(x, y, { width }) => {
                setAppData({ canvasCursorPos: { x: x - width / 2, y } });
              }}
            />
          </>
        )}
        {(!docContent?.code || docContent.generating) && (
          <>
            <div className={styles.empty}>
              {!!docContent?.generating && (
                <Loading text="Generating tool..." />
              )}
              {!docContent?.generating && (
                <>
                  <Flex
                    direction="column"
                    gap="3"
                    style={{
                      width: "100%",
                      maxWidth: 480,
                    }}
                  >
                    <Flex align="center" gap="3">
                      <Logo className={styles.icon} size={24} />
                      <Text className={styles.title} size="3" weight="medium">
                        What tool do you need?
                      </Text>
                      <div style={{ flex: 1 }} />
                      <Button
                        disabled={!appPrompt.trim()}
                        size="2"
                        radius="full"
                        onClick={() => generateApp()}
                      >
                        Generate
                      </Button>
                    </Flex>
                    <TextArea
                      className={styles.appPrompt}
                      size="3"
                      placeholder="We need a blind vote for lunch: pizza, tacos or sushi"
                      value={appPrompt}
                      autoFocus
                      onChange={(e) => setAppPrompt(e.target.value)}
                      onKeyDown={(ev) => {
                        if (
                          ev.key === "Enter" &&
                          !ev.shiftKey &&
                          !ev.ctrlKey &&
                          !ev.altKey &&
                          !ev.metaKey
                        ) {
                          generateApp();
                        }
                      }}
                    />
                    <Text
                      size="1"
                      mt="5"
                      align="center"
                      style={{
                        color: `var(--gray-10)`,
                      }}
                    >
                      You can also mention{" "}
                      <span style={{ color: `var(--accent-11)` }}>
                        @Q (Quartermaster)
                      </span>{" "}
                      in Google Chat
                    </Text>
                  </Flex>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
