Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$siteUrl = "https://constraintsystemsinstitute.org"
$author = "Maley, Amos Jay"
$today = "2026-08-27"
$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"
$fullDataPath = Join-Path $root "data\zenodo-authenticated-full.json"
$registryPath = Join-Path $root "data\zenodo-doi-registry.json"
$arcsPath = Join-Path $root "data\research-arcs.json"
$papersDir = Join-Path $root "papers"

function HtmlDecode([string]$value) {
  Add-Type -AssemblyName System.Web
  return [System.Web.HttpUtility]::HtmlDecode($value)
}

function StripHtml([string]$value) {
  $plain = [regex]::Replace($value, "<[^>]+>", " ")
  $plain = HtmlDecode $plain
  return ([regex]::Replace($plain, "\s+", " ")).Trim()
}

function EscapeHtml([string]$value) {
  return [System.Net.WebUtility]::HtmlEncode($value)
}

function EscapeXml([string]$value) {
  return [System.Security.SecurityElement]::Escape($value)
}

function Slugify([string]$value) {
  $s = $value.ToLowerInvariant()
  $s = [regex]::Replace($s, "[^a-z0-9]+", "-")
  $s = [regex]::Replace($s, "^-+|-+$", "")
  if ($s.Length -gt 86) { $s = $s.Substring(0, 86).TrimEnd("-") }
  return $s
}

function ScholarDate([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { $value = $today }
  try {
    return ([datetime]::Parse($value)).ToString("yyyy'/'MM'/'dd", [System.Globalization.CultureInfo]::InvariantCulture)
  } catch {
    return $today.Replace("-", "/")
  }
}

function ShortDescription([string]$value, [string]$fallback) {
  $plain = StripHtml $value
  if ([string]::IsNullOrWhiteSpace($plain)) { $plain = $fallback }
  if ($plain.Length -gt 520) { $plain = $plain.Substring(0, 517).TrimEnd() + "..." }
  return $plain
}

function ReportNumber([string]$title, [string]$doi) {
  if ($title -match "WDW\s*(\d+)") { return "CSI-WDW-$($Matches[1])" }
  if ($title -match "Standard Model|Carrier Exhaustion|Generation Cardinality|Higgs|Gauge|Charge|fermion|quark|lepton") { return "CSI-SM" }
  if ($title -match "Yang[- ]Mills") { return "CSI-YM" }
  if ($title -match "Wheeler[- ]DeWitt") { return "CSI-WDW" }
  if ($title -match "Einstein") { return "CSI-EINSTEIN" }
  if ($title -match "Schr[oö]dinger") { return "CSI-SCHRODINGER" }
  if ($title -match "Structural Unification|Gravity|Quantum") { return "CSI-GQ" }
  if ($title -match "Riemann") { return "CSI-RH" }
  if ($title -match "Navier") { return "CSI-NS" }
  if ($title -match "Hodge") { return "CSI-HODGE" }
  if ($title -match "Birch|Swinnerton|BSD") { return "CSI-BSD" }
  if ($title -match "Poincare|Poincar") { return "CSI-POINCARE" }
  if ($title -match "P vs NP|SAT|Sunflower") { return "CSI-PVNP" }
  $tail = ($doi -replace "^10\.5281/zenodo\.", "")
  return "CSI-ZENODO-$tail"
}

function KeywordsFor([string]$title, [string]$context, $record) {
  $terms = New-Object System.Collections.Generic.List[string]
  @("AASC", "Constraint Systems Institute", "theoretical physics", "mathematical foundations") | ForEach-Object { $terms.Add($_) }
  if ($context) { $terms.Add($context) }
  if ($title -match "Wheeler[- ]DeWitt|WDW") { @("Wheeler-DeWitt equation", "canonical gravity", "quantum gravity") | ForEach-Object { $terms.Add($_) } }
  if ($title -match "Yang[- ]Mills") { @("Yang-Mills Mass Gap", "Clay Millennium Prize Problems") | ForEach-Object { $terms.Add($_) } }
  if ($title -match "Riemann") { $terms.Add("Riemann Hypothesis") }
  if ($title -match "Navier") { $terms.Add("Navier-Stokes Existence and Smoothness") }
  if ($title -match "Hodge") { $terms.Add("Hodge Conjecture") }
  if ($title -match "Birch|Swinnerton|BSD") { $terms.Add("Birch and Swinnerton-Dyer Conjecture") }
  if ($title -match "Poincare|Poincar") { $terms.Add("Poincare Conjecture") }
  if ($title -match "P vs NP|SAT|Sunflower") { @("P vs NP", "sunflower lemma") | ForEach-Object { $terms.Add($_) } }
  if ($title -match "Einstein|Gravity|Schr[oö]dinger|Quantum|Unification|Entanglement|Measurement") { @("gravity", "quantum theory", "Einstein dynamics", "Schrodinger dynamics") | ForEach-Object { $terms.Add($_) } }
  if ($title -match "Standard Model|charge|mass|field|Higgs") { @("Standard Model", "mass", "charge", "fields") | ForEach-Object { $terms.Add($_) } }
  if ($record -and $record.keywords) { $record.keywords | ForEach-Object { if ($_){ $terms.Add([string]$_) } } }
  return (($terms | Where-Object { $_ } | Select-Object -Unique) -join ", ")
}

$indexHtml = Get-Content -Raw -Path $indexPath
$fullData = if (Test-Path $fullDataPath) { Get-Content -Raw -Path $fullDataPath | ConvertFrom-Json } else { @() }
$registry = if (Test-Path $registryPath) { Get-Content -Raw -Path $registryPath | ConvertFrom-Json } else { @() }
$arcs = if (Test-Path $arcsPath) { Get-Content -Raw -Path $arcsPath | ConvertFrom-Json } else { @() }

$recordsByDoi = @{}
foreach ($record in @($fullData + $registry)) {
  foreach ($key in @("concept_doi", "version_doi")) {
    if ($record.PSObject.Properties.Name -contains $key) {
      $doi = [string]$record.$key
      if (-not [string]::IsNullOrWhiteSpace($doi) -and -not $recordsByDoi.ContainsKey($doi)) {
        $recordsByDoi[$doi] = $record
      }
    }
  }
}

$arcByDoi = @{}
foreach ($arc in $arcs) {
  foreach ($paper in $arc.papers) {
    if ($paper.concept_doi) { $arcByDoi[[string]$paper.concept_doi] = $arc.theme }
  }
}

$matches = [regex]::Matches($indexHtml, "<a\b(?<attrs>[^>]*href=[""'](?<href>https://doi\.org/10\.5281/zenodo\.[^""'#?]+)[^""']*[""'][^>]*)>(?<text>.*?)</a>", "Singleline,IgnoreCase")
$papersByDoi = [ordered]@{}

foreach ($match in $matches) {
  $doi = $match.Groups["href"].Value -replace "^https://doi\.org/", ""
  if ($papersByDoi.Contains($doi)) { continue }

  $before = $indexHtml.Substring(0, $match.Index)
  $lastHeading = [regex]::Matches($before, "<h[2-4][^>]*>(?<text>.*?)</h[2-4]>", "Singleline,IgnoreCase") | Select-Object -Last 1
  $context = if ($lastHeading) { StripHtml $lastHeading.Groups["text"].Value } else { "Constraint Systems Institute archive" }
  $linkTitle = StripHtml $match.Groups["text"].Value
  $record = if ($recordsByDoi.ContainsKey($doi)) { $recordsByDoi[$doi] } else { $null }
  $arcContext = if ($arcByDoi.ContainsKey($doi)) { $arcByDoi[$doi] } else { $context }
  $title = $linkTitle
  if ($record -and $record.title) { $title = [string]$record.title }
  if ($title -match "^10\.5281/zenodo\.") { $title = $context }
  if ([string]::IsNullOrWhiteSpace($title)) { $title = "Constraint Systems Institute paper $doi" }

  $description = if ($record -and ($record.PSObject.Properties.Name -contains "description")) {
    ShortDescription ([string]$record.description) "Part of the Constraint Systems Institute manuscript archive."
  } else {
    ShortDescription "" "Part of the $arcContext research arc in the Constraint Systems Institute archive."
  }
  $date = if ($record -and ($record.PSObject.Properties.Name -contains "publication_date")) { [string]$record.publication_date } elseif ($record -and $record.submitted) { [string]$record.submitted } else { $today }
  $slugBase = "$title-$doi"
  $slug = Slugify $slugBase
  if ([string]::IsNullOrWhiteSpace($slug)) { $slug = Slugify $doi }

  $papersByDoi[$doi] = [pscustomobject]@{
    title = $title
    doi = $doi
    doi_url = "https://doi.org/$doi"
    url = "$siteUrl/papers/$slug/"
    slug = $slug
    date = $date
    scholar_date = ScholarDate $date
    context = $arcContext
    report_number = ReportNumber $title $doi
    description = $description
    keywords = KeywordsFor $title $arcContext $record
    zenodo_record = if ($record -and $record.record_url) { [string]$record.record_url } else { "https://zenodo.org/doi/$doi" }
  }
}

if (Test-Path $papersDir) { Remove-Item -LiteralPath $papersDir -Recurse -Force }
New-Item -ItemType Directory -Path $papersDir | Out-Null

$papers = @($papersByDoi.Values | Sort-Object context, title)

foreach ($paper in $papers) {
  $dir = Join-Path $papersDir $paper.slug
  New-Item -ItemType Directory -Path $dir | Out-Null
  $titleEsc = EscapeHtml $paper.title
  $descEsc = EscapeHtml $paper.description
  $kwEsc = EscapeHtml $paper.keywords
  $contextEsc = EscapeHtml $paper.context
  $doiEsc = EscapeHtml $paper.doi
  $doiUrlEsc = EscapeHtml $paper.doi_url
  $recordEsc = EscapeHtml $paper.zenodo_record
  $urlEsc = EscapeHtml $paper.url
  $reportEsc = EscapeHtml $paper.report_number
  $dateEsc = EscapeHtml $paper.scholar_date
  $page = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>$titleEsc | Constraint Systems Institute</title>
    <meta name="description" content="$descEsc" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="$urlEsc" />
    <meta name="citation_title" content="$titleEsc" />
    <meta name="citation_author" content="$author" />
    <meta name="citation_publication_date" content="$dateEsc" />
    <meta name="citation_online_date" content="$dateEsc" />
    <meta name="citation_technical_report_number" content="$reportEsc" />
    <meta name="citation_doi" content="$doiEsc" />
    <meta name="citation_abstract_html_url" content="$urlEsc" />
    <meta name="citation_keywords" content="$kwEsc" />
    <link rel="alternate" type="application/json" title="Constraint Systems Institute paper metadata" href="$siteUrl/papers.json" />
    <link rel="alternate" type="application/xml" title="Constraint Systems Institute Dublin Core metadata feed" href="$siteUrl/oai.xml" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Constraint Systems Institute" />
    <meta property="og:title" content="$titleEsc" />
    <meta property="og:description" content="$descEsc" />
    <meta property="og:url" content="$urlEsc" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="paper-page">
    <main class="paper-shell">
      <a class="paper-back" href="/">Constraint Systems Institute archive</a>
      <article class="paper-record">
        <p class="repo-type">$contextEsc</p>
        <h1>$titleEsc</h1>
        <p class="paper-author">Amos Jay Maley</p>
        <p>$descEsc</p>
        <dl class="paper-meta-list">
          <div><dt>All-version DOI</dt><dd><a href="$doiUrlEsc">$doiEsc</a></dd></div>
          <div><dt>Archive page</dt><dd><a href="$urlEsc">$urlEsc</a></dd></div>
          <div><dt>Report number</dt><dd>$reportEsc</dd></div>
          <div><dt>Publication date</dt><dd>$dateEsc</dd></div>
          <div><dt>Source record</dt><dd><a href="$recordEsc">$recordEsc</a></dd></div>
        </dl>
      </article>
    </main>
  </body>
</html>
"@
  Set-Content -Path (Join-Path $dir "index.html") -Value $page -Encoding UTF8
}

$paperCards = foreach ($paper in $papers) {
  $titleEsc = EscapeHtml $paper.title
  $contextEsc = EscapeHtml $paper.context
  $doiEsc = EscapeHtml $paper.doi
  "          <a class=`"paper-index-row`" href=`"/papers/$($paper.slug)/`"><span>$contextEsc</span><strong>$titleEsc</strong><em>$doiEsc</em></a>"
}

$indexPage = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Paper Metadata Index | Constraint Systems Institute</title>
    <meta name="description" content="Machine-readable paper landing pages for Constraint Systems Institute manuscripts and DOI records." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="$siteUrl/papers/" />
    <link rel="alternate" type="application/json" title="Constraint Systems Institute paper metadata" href="$siteUrl/papers.json" />
    <link rel="alternate" type="application/xml" title="Constraint Systems Institute Dublin Core metadata feed" href="$siteUrl/oai.xml" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="paper-page">
    <main class="paper-shell">
      <a class="paper-back" href="/">Constraint Systems Institute archive</a>
      <section class="paper-record">
        <p class="repo-type">Machine-readable index</p>
        <h1>Paper metadata index</h1>
        <p>Canonical DOI landing pages with Google Scholar citation metadata for the visible Constraint Systems Institute archive.</p>
        <div class="paper-index-list">
$($paperCards -join "`r`n")
        </div>
      </section>
    </main>
  </body>
</html>
"@
Set-Content -Path (Join-Path $papersDir "index.html") -Value $indexPage -Encoding UTF8

$jsonPath = Join-Path $root "papers.json"
$papers | ConvertTo-Json -Depth 6 | Set-Content -Path $jsonPath -Encoding UTF8

$responseDate = ([datetime]::UtcNow).ToString("yyyy-MM-ddTHH:mm:ssZ")
$recordXml = foreach ($paper in $papers) {
  $title = EscapeXml $paper.title
  $creator = EscapeXml "Amos Jay Maley"
  $subject = EscapeXml $paper.keywords
  $desc = EscapeXml $paper.description
  $date = EscapeXml (([string]$paper.scholar_date).Replace("/", "-"))
  $identifier = EscapeXml $paper.doi_url
  $pageUrl = EscapeXml $paper.url
  @"
      <record>
        <header><identifier>oai:constraintsystemsinstitute.org:$($paper.slug)</identifier><datestamp>$date</datestamp></header>
        <metadata>
          <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
            <dc:title>$title</dc:title>
            <dc:creator>$creator</dc:creator>
            <dc:subject>$subject</dc:subject>
            <dc:description>$desc</dc:description>
            <dc:date>$date</dc:date>
            <dc:type>Text</dc:type>
            <dc:identifier>$identifier</dc:identifier>
            <dc:identifier>$pageUrl</dc:identifier>
            <dc:language>en</dc:language>
          </oai_dc:dc>
        </metadata>
      </record>
"@
}

$oai = @"
<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>$responseDate</responseDate>
  <request verb="ListRecords" metadataPrefix="oai_dc">$siteUrl/oai.xml</request>
  <ListRecords>
$($recordXml -join "`r`n")
  </ListRecords>
</OAI-PMH>
"@
Set-Content -Path (Join-Path $root "oai.xml") -Value $oai -Encoding UTF8

$urlRows = New-Object System.Collections.Generic.List[string]
$urlRows.Add("  <url><loc>$siteUrl/</loc><lastmod>$today</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>")
$urlRows.Add("  <url><loc>$siteUrl/papers/</loc><lastmod>$today</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>")
foreach ($paper in $papers) {
  $loc = EscapeXml $paper.url
  $urlRows.Add("  <url><loc>$loc</loc><lastmod>$today</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>")
}
$urlRows.Add("  <url><loc>$siteUrl/papers.json</loc><lastmod>$today</lastmod><changefreq>weekly</changefreq><priority>0.4</priority></url>")
$urlRows.Add("  <url><loc>$siteUrl/oai.xml</loc><lastmod>$today</lastmod><changefreq>weekly</changefreq><priority>0.4</priority></url>")
$sitemap = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($urlRows -join "`r`n")
</urlset>
"@
Set-Content -Path (Join-Path $root "sitemap.xml") -Value $sitemap -Encoding UTF8

Write-Host "Generated $($papers.Count) paper metadata pages."
