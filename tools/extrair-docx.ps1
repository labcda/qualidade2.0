# Converte os .docx da biblioteca da qualidade (pasta do Drive) em texto estruturado para o Qualidade 2.0.
# Uso: powershell -File tools\extrair-docx.ps1 -Pasta "H:\Meu Drive\POPs 2027-CDA-IA\2026\10 - Outubro" -Saida data\biblioteca.js [-Teste "PQ 015"]
param([string]$Pasta = "H:\Meu Drive\POPs 2027-CDA-IA\2026\10 - Outubro", [string]$Saida = "data\biblioteca.js", [string]$Teste = "")
Add-Type -AssemblyName System.IO.Compression.FileSystem
$ns = New-Object System.Xml.XmlNamespaceManager((New-Object System.Xml.NameTable)); $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

function TextoPar($p) {
  $sb = New-Object System.Text.StringBuilder
  foreach ($n in $p.SelectNodes('.//w:t | .//w:tab | .//w:br', $ns)) {
    if ($n.LocalName -eq 't') { [void]$sb.Append($n.InnerText) } elseif ($n.LocalName -eq 'tab') { [void]$sb.Append(' ') } else { [void]$sb.Append(' ') }
  }
  return ($sb.ToString() -replace '\s+', ' ').Trim()
}
function Negrito($p) { $r = $p.SelectNodes('.//w:r', $ns); if ($r.Count -eq 0) { return $false }; foreach ($x in $r) { if (-not $x.SelectSingleNode('./w:rPr/w:b', $ns) -and $x.InnerText.Trim()) { return $false } }; return $true }
function Converte($docx) {
  $zip = [System.IO.Compression.ZipFile]::OpenRead($docx)
  try {
    $e = $zip.GetEntry('word/document.xml'); $sr = New-Object System.IO.StreamReader($e.Open()); $xml = New-Object System.Xml.XmlDocument; $xml.LoadXml($sr.ReadToEnd()); $sr.Close()
  } finally { $zip.Dispose() }
  $corpo = $xml.SelectSingleNode('//w:body', $ns); $out = New-Object System.Collections.Generic.List[string]
  foreach ($n in $corpo.ChildNodes) {
    if ($n.LocalName -eq 'p') {
      $t = TextoPar $n; if (-not $t) { $out.Add(''); continue }
      $est = $n.SelectSingleNode('./w:pPr/w:pStyle/@w:val', $ns); $est = if ($est) { $est.Value } else { '' }
      if ($est -match '(?i)heading1|t[ií]tulo1$') { $out.Add("## $t") }
      elseif ($est -match '(?i)heading2|t[ií]tulo2$') { $out.Add("### $t") }
      elseif ($est -match '(?i)heading3|t[ií]tulo3$') { $out.Add("#### $t") }
      elseif ($n.SelectSingleNode('./w:pPr/w:numPr', $ns)) { $out.Add("- $t") }
      elseif ($t -match '^\d+(\.\d+)*[\.\)]?\s+\S' -and (Negrito $n) -and $t.Length -lt 90) { if ($t -match '^\d+\.\d+') { $out.Add("### $t") } else { $out.Add("## $t") } }
      else { $out.Add($t) }
    }
    elseif ($n.LocalName -eq 'tbl') {
      $rows = @(); foreach ($tr in $n.SelectNodes('./w:tr', $ns)) { $cel = @(); foreach ($tc in $tr.SelectNodes('./w:tc', $ns)) { $cel += ((@($tc.SelectNodes('.//w:p', $ns) | ForEach-Object { TextoPar $_ }) | Where-Object { $_ }) -join ' / ') -replace '\|', '/' }; if ($cel.Count) { $rows += , $cel } }
      if ($rows.Count) {
        $nc = ($rows | ForEach-Object { $_.Count } | Measure-Object -Maximum).Maximum
        $out.Add('')
        for ($i = 0; $i -lt $rows.Count; $i++) { $r = $rows[$i]; while ($r.Count -lt $nc) { $r += '' }; $out.Add('| ' + ($r -join ' | ') + ' |'); if ($i -eq 0) { $out.Add('|' + (('---|') * $nc)) } }
        $out.Add('')
      }
    }
  }
  # compacta linhas vazias repetidas
  $res = New-Object System.Collections.Generic.List[string]; $vazia = $false
  foreach ($l in $out) { if ($l -eq '') { if (-not $vazia) { $res.Add('') }; $vazia = $true } else { $res.Add($l); $vazia = $false } }
  return ($res -join "`n").Trim()
}

$lista = @()
foreach ($d in Get-ChildItem -LiteralPath $Pasta -Directory) {
  foreach ($f in Get-ChildItem -LiteralPath $d.FullName -Filter *.docx | Where-Object { $_.Name -notlike '~$*' }) {
    $base = $f.BaseName -replace '\s*\(RASCUNHO.*\)\s*$', ''
    if ($base -notmatch '^(?<cod>[A-Za-z]{1,4})\s*0*(?<num>\d{1,3})\s*-\s*(?<tit>.+)$') { continue }
    $pref = $Matches['cod'].ToUpper(); $cod = '{0} {1:000}' -f $pref, [int]$Matches['num']; $tit = $Matches['tit'].Trim()
    if ($Teste -and $cod -ne $Teste) { continue }
    $tipo = switch ($pref) { 'PQ' { 'PQ' } 'ITA' { 'ITA' } 'FR' { 'FR' } 'MQ' { 'MQ' } 'DC' { 'DC' } 'L' { 'L' } default { $pref } }
    $unid = 'Matriz'; if ($tit -match 'Coleta 0?(\d)') { $unid = 'Matriz' }
    $txt = Converte $f.FullName
    $ver = '1'; if ($txt -match '\|\s*(\d+(?:\.\d+)?)\s*\(rascunho\)') { $ver = $Matches[1] }
    $ix = $txt.IndexOf('## '); if ($ix -gt 0) { $txt = $txt.Substring($ix) }
    $txt = ($txt -replace '(?m)^[●•]\s*', '- ')
    $lista += [pscustomobject]@{ codigo = $cod; titulo = $tit; tipo = $tipo; unidade = $unid; versao = $ver; status = 'rascunho'; elaborador = ('Di' + [char]0xEA + 'go Padua Silva'); data_elaboracao = '2026-10-13'; origem = 'Biblioteca CDA 10/2026'; texto = $txt }
  }
}
if ($Teste) { $lista | ForEach-Object { "### $($_.codigo) - $($_.titulo)"; $_.texto }; return }
# códigos repetidos (ex.: DC 004 - Coletor 01/02/03): mantém todos, diferenciados pelo título
$json = $lista | ConvertTo-Json -Depth 4 -Compress
$js = "/* Biblioteca CDA (gerada por tools/extrair-docx.ps1 em $(Get-Date -Format 'dd/MM/yyyy')) */`nwindow.Q2_DOCS = (window.Q2_DOCS || []).concat($json);`n"
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $Saida), $js, (New-Object System.Text.UTF8Encoding($false)))
"Documentos extraídos: $($lista.Count)"
