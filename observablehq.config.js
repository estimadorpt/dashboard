// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "Portugal Election Dashboard",

  // Base path for deployment (e.g., GitHub Pages subdirectory)
  base: "/",

  // The pages and sections in the sidebar. If you don't specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  // Content to add to the head of the page, e.g. for a favicon:
  // Use template literal (backticks) for multi-line HTML string
  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <!-- 100% privacy-first analytics -->
    <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.estimador.pt">
    <meta property="og:title" content="Portuguese Election Forecast Model">
    <meta property="og:description" content="Live forecast model for the upcoming Portuguese elections, showing seat projections, national trends, and district details.">
    <meta property="og:image" content="/og-image.png">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://www.estimador.pt">
    <meta name="twitter:title" content="Portuguese Election Forecast Model">
    <meta name="twitter:description" content="Live forecast model for the upcoming Portuguese elections, showing seat projections, national trends, and district details.">
    <meta name="twitter:image" content="/og-image.png">
    <!-- Optional: <meta name="twitter:site" content="@YourTwitterHandle"> -->
  `,

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
