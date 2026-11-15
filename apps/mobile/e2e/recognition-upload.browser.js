// Run in the browser console on /ai-detection (or via a browser automation evaluator).
// Uses the real picker, manipulator and preview; never sends an image to the AI API.
(async () => {
  const waitFor = async (read, description) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const value = read();
      if (value) return value;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out: ${description}`);
  };
  const results = [];
  for (const [width, height, expectedWidth, expectedHeight] of [
    [2400, 1200, 1600, 800],
    [1200, 2400, 800, 1600],
    [2000, 2000, 1600, 1600],
    [1600, 800, 1600, 800],
    [640, 480, 640, 480],
  ]) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#2563eb";
    context.fillRect(0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
    const file = new File([blob], `upload-${width}x${height}.jpg`, { type: "image/jpeg" });
    const button = Array.from(document.querySelectorAll("button")).find((node) =>
      node.textContent.includes("Chọn ảnh từ thiết bị"),
    );
    if (!button || button.disabled) throw new Error("Image picker is unavailable");
    const previousPreview = Array.from(document.querySelectorAll('img[alt="Ảnh đã chọn để nhận diện"]')).at(-1);
    const previousSource = previousPreview?.getAttribute("src");
    button.click();
    const input = await waitFor(() => document.querySelector('input[type="file"]'), "file input");
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await waitFor(() => !button.disabled, "image preparation");
    const error = document.querySelector('[role="alert"]')?.textContent;
    if (error) throw new Error(`${width}x${height}: ${error}`);
    const preview = await waitFor(() => {
      // Expo may retain the previous image while the replacement loads.
      const image = Array.from(document.querySelectorAll('img[alt="Ảnh đã chọn để nhận diện"]')).at(-1);
      return image && image.getAttribute("src") !== previousSource ? image : null;
    }, "new image preview");
    // Decode the actual output bytes: lazy img loading may pause in background tabs.
    const output = await (await fetch(preview.src)).blob();
    if (output.type !== "image/jpeg") throw new Error(`Wrong output type: ${output.type}`);
    const decoded = await createImageBitmap(output);
    if (decoded.width !== expectedWidth || decoded.height !== expectedHeight) {
      throw new Error(`Wrong preview size: ${decoded.width}x${decoded.height}`);
    }
    const analyze = Array.from(document.querySelectorAll("button")).find((node) =>
      node.textContent.includes("Phân tích hình ảnh"),
    );
    if (!analyze?.disabled) throw new Error("Upload must still require explicit consent");
    results.push({ input: [width, height], output: [decoded.width, decoded.height], consentRequired: true });
    decoded.close();
  }
  return results;
})();
