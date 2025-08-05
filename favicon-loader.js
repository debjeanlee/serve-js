(function () {
  const head = document.head;

  const favicons = [
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicons/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicons/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "48x48",
      href: "/favicons/favicon-48x48.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "64x64",
      href: "/favicons/favicon-64x64.png",
    },
    { rel: "shortcut icon", href: "/favicons/favicon.ico" },
  ];

  favicons.forEach((icon) => {
    const link = document.createElement("link");
    link.rel = icon.rel;
    if (icon.type) link.type = icon.type;
    if (icon.sizes) link.sizes = icon.sizes;
    link.href = icon.href;
    head.appendChild(link);
  });
})();
