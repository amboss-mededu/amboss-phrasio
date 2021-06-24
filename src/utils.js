export const getPhrasio = (id) =>
  window.adaptor({
    subject: "getTooltipContent",
    id,
  });

export const getTerms = () =>
  window.adaptor({ subject: "getTerms" })

export const track = (name, args) =>
  window.adaptor({
    subject: "track",
    trackingProperties: [name, args],
  });

export function loadFonts() {
  const lato700 = new FontFace("Lato", "/fonts/Lato.700.normal.woff2");
  document.fonts.add(lato700);

  const lato400 = new FontFace("Lato", "/fonts/Lato.400.normal.woff2");
  document.fonts.add(lato400);
}
