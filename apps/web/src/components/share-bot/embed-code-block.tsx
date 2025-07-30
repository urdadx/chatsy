import type { BundledLanguage } from "@/components/ui/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";
import { toast } from "sonner";

export const EmbedCodeBlock = ({
  embedToken,
  option = "1",
}: {
  embedToken: string;
  option?: string;
}) => {
  const code =
    option === "2"
      ? [
          {
            language: "html",
            filename: "iframe.html",
            code: `<!-- Padyna Embedded Iframe -->
<iframe
  src="${window.location.origin}/embed/${embedToken}"
  width="400"
  height="600"
  style="border:none;"
  title="Chatsy Chatbot"
></iframe>`,
          },
        ]
      : [
          {
            language: "js",
            filename: "embed.js",
            code: `<!-- Padyna Embedded Widget -->
<div id="chatsy-widget"></div>
<script>
  (function() {
    const script = document.createElement('script');
    script.src = '${window.location.origin}/embed.js';
    script.async = true;
    script.onload = function() {
      ChatsyWidget.init({
        embedToken: '${embedToken}',
        containerId: 'chatsy-widget'
      });
    };
    document.head.appendChild(script);
  })();
</script>`,
          },
        ];

  const copyEmbedScriptCode = () => {
    if (!embedToken) return;
    navigator.clipboard.writeText(code[0].code);
    toast.success("Embed code copied to clipboard!");
  };

  return (
    <>
      <CodeBlock data={code} defaultValue={code[0].language} key={option}>
        <CodeBlockHeader>
          <CodeBlockFiles>
            {(item) => (
              <CodeBlockFilename key={item.language} value={item.language}>
                {item.filename}
              </CodeBlockFilename>
            )}
          </CodeBlockFiles>

          <CodeBlockCopyButton
            onCopy={copyEmbedScriptCode}
            onError={() => toast.error("Failed to copy code to clipboard")}
          />
        </CodeBlockHeader>
        <CodeBlockBody className="h-[190px] overflow-y-auto hide-scrollbar">
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent language={item.language as BundledLanguage}>
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    </>
  );
};
