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
    <meta property="og:title" content="Portuguese Election Forecast">
    <meta property="og:description" content="Live Bayesian seat projections & coalition odds.">
    <meta property="og:image" content="https://www.estimador.pt/og.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://www.estimador.pt">
    <meta name="twitter:title" content="Portuguese Election Forecast">
    <meta name="twitter:description" content="Live Bayesian seat projections & coalition odds.">
    <meta name="twitter:image" content="https://www.estimador.pt/og.png">
    <!-- Optional: <meta name="twitter:site" content="@YourTwitterHandle"> -->
  `,

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: "", // Explicitly set footer to empty
  sidebar: false, // Disable the sidebar globally
  toc: false, // Ensure TOC is off to hide /og page
  pager: false, // Disable the previous/next page links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
