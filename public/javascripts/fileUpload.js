document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  // Register FilePond plugins
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
  );

  FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150,
  });

  // Turn all file input elements into ponds
  FilePond.parse(document.body);

  // Debugging: log each FilePond instance
  const ponds = document.querySelectorAll('input[type="file"]');
  ponds.forEach((pond) => {
    console.log("FilePond instance created:", pond);
  });
});
