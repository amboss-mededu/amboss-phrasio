export function loadFonts() {
  const lato700 = new FontFace("Lato", "/fonts/Lato.700.normal.woff2");
  document.fonts.add(lato700);

  const lato400 = new FontFace("Lato", "/fonts/Lato.400.normal.woff2");
  document.fonts.add(lato400);
}
