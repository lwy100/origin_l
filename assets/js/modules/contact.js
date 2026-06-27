import { $ } from "./dom.js";

export function initContact(email) {
  const copyButton = $("#copy-email");
  const copyStatus = $("#copy-status");
  if (!copyButton || !copyStatus) return;

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = "邮箱已复制。";
    } catch (error) {
      copyStatus.textContent = "复制失败，请手动选中邮箱。";
    }
  });
}
