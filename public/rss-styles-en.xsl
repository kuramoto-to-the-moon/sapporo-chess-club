<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            margin: 0;
            color: #171717;
            background: #fff;
            line-height: 1.6;
          }
          .topbar {
            position: sticky;
            top: 0;
            z-index: 10;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid #f5f5f5;
          }
          .topbar-inner {
            max-width: 42rem;
            margin: 0 auto;
            padding: 0.75rem 1.25rem 0.5rem;
          }
          .brand {
            font-size: 11px;
            letter-spacing: 3px;
            color: #737373;
            text-decoration: none;
            transition: color 0.15s;
          }
          .brand:hover { color: #2563eb; }
          main {
            max-width: 42rem;
            margin: 0 auto;
            padding: 2.5rem 1.25rem 4rem;
          }
          .tag {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #737373;
            margin-bottom: 8px;
          }
          .tag::before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 12px;
            background: #2563eb;
            vertical-align: middle;
            margin-right: 8px;
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0 0 0.5rem;
          }
          .description {
            color: #737373;
            margin: 0 0 1.5rem;
            font-size: 0.95rem;
          }
          .explain {
            background: #f0f7ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 1rem 1.25rem;
            margin: 0 0 2rem;
            font-size: 0.9rem;
            color: #1e40af;
          }
          .explain strong { color: #0f172a; }
          .explain code {
            display: block;
            background: #fff;
            border: 1px solid #e5e5e5;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.85rem;
            color: #171717;
            margin-top: 0.5rem;
            word-break: break-all;
            user-select: all;
          }
          .items-heading {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #737373;
            margin: 2rem 0 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e5e5;
          }
          .item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f5f5f5;
          }
          .item:last-child { border-bottom: none; }
          .item h2 {
            font-size: 0.95rem;
            font-weight: 600;
            margin: 0 0 4px;
            line-height: 1.45;
          }
          .item h2 a {
            color: #171717;
            text-decoration: none;
          }
          .item h2 a:hover { color: #2563eb; }
          .item .date {
            font-size: 0.75rem;
            color: #737373;
            font-variant-numeric: tabular-nums;
          }
          .item .desc {
            font-size: 0.85rem;
            color: #525252;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <header class="topbar">
          <div class="topbar-inner">
            <a href="/sapporo-chess-club/en/announcements/" class="brand">← Back to News</a>
          </div>
        </header>
        <main>
        <div class="tag">RSS FEED</div>
        <h1><xsl:value-of select="/rss/channel/title"/></h1>
        <p class="description"><xsl:value-of select="/rss/channel/description"/></p>

        <div class="explain">
          <strong>This is an RSS feed.</strong><br/>
          Subscribe in an RSS reader like Feedly, Inoreader, or NetNewsWire.<br/>
          Paste the URL below into your RSS reader:
          <code id="feed-url"></code>
        </div>

        <div class="items-heading">Latest News</div>
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h2>
              <a>
                <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <div class="date"><xsl:value-of select="pubDate"/></div>
            <div class="desc"><xsl:value-of select="description"/></div>
          </div>
        </xsl:for-each>

        </main>
        <script>
          // XSLT では現在の URL を取れないので JS で挿入
          document.getElementById('feed-url').textContent = window.location.href;
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
